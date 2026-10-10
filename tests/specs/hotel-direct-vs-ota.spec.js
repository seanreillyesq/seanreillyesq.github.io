const fs = require('fs');
const path = require('path');
const { test, expect, setValue } = require('../fixtures');

const URL = '/hotel-direct-vs-ota/';

const DEFAULTS = { rooms: 50, occ: 75, adr: 180, los: 2, share: 40, comm: 18, mkt: 8, fee: 3, disc: 5, shift: 5 };

// The page's own definitions, worked out by hand from the brief.
function model(o) {
  const v = { ...DEFAULTS, ...o };
  const otaNet = v.adr * (1 - v.comm / 100);
  const directNet = v.adr * (1 - v.disc / 100) * (1 - v.mkt / 100 - v.fee / 100);
  const gap = directNet - otaNet;
  const nights = v.rooms * 365 * (v.occ / 100);
  const otaNights = nights * v.share / 100;
  const dirNights = nights - otaNights;
  const moved = nights * v.shift / 100;
  return {
    otaNet, directNet, gap, perStay: gap * v.los, nights, otaNights, dirNights, moved,
    otaRev: otaNights * otaNet, dirRev: dirNights * directNet,
    totalNow: otaNights * otaNet + dirNights * directNet,
    gain: moved * gap, point: nights * 0.01 * gap,
  };
}

const gbp = (n, dp = 0) => {
  const r = Math.round(Math.abs(n) * 10 ** dp) / 10 ** dp;
  return '£' + r.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp });
};
// Parse "+£4.59", "-£11.43", "£3,141" back to a number.
const parse = (t) => {
  const neg = t.trim().startsWith('-');
  return (neg ? -1 : 1) * parseFloat(t.replace(/[^0-9.]/g, ''));
};

const txt = async (page, id) => (await page.locator('#' + id).innerText()).trim();

async function setAll(page, o) {
  for (const [k, v] of Object.entries(o)) await setValue(page, '#' + k, v);
}

test.describe('Hotel direct vs OTA calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('#res-ota-net')).not.toHaveText('--');
  });

  test.describe('default maths', () => {
    test('net per night, gap and gap per stay match the brief', async ({ page }) => {
      await expect(page.locator('#res-ota-net')).toHaveText('£147.60');
      await expect(page.locator('#res-direct-net')).toHaveText('£152.19');
      await expect(page.locator('#res-gap-night')).toHaveText('+£4.59');
      await expect(page.locator('#res-gap-stay')).toHaveText('+£9.18');
    });

    test('annual room nights, gain and value of one point', async ({ page }) => {
      const m = model({});
      expect(m.nights).toBeCloseTo(13687.5, 6);
      await expect(page.locator('#res-nights')).toHaveText('13,688');
      // 684.375 nights x 4.59 = 3,141 a year, worked from unrounded values
      expect(Math.abs(parse(await txt(page, 'res-gain')) - 3141)).toBeLessThan(2);
      await expect(page.locator('#res-gain')).toHaveText('+' + gbp(m.gain));
      expect(Math.abs(parse(await txt(page, 'res-point')) - 628)).toBeLessThan(2);
      await expect(page.locator('#res-point')).toHaveText('+' + gbp(m.point));
    });

    test('before and after table splits nights and revenue by channel', async ({ page }) => {
      const m = model({});
      await expect(page.locator('#tb-ota-nights-now')).toHaveText('5,475');
      await expect(page.locator('#tb-dir-nights-now')).toHaveText('8,213');
      await expect(page.locator('#tb-ota-nights-after')).toHaveText('4,791');
      await expect(page.locator('#tb-dir-nights-after')).toHaveText('8,897');
      await expect(page.locator('#tb-ota-net-now')).toHaveText(gbp(m.otaRev));
      await expect(page.locator('#tb-dir-net-now')).toHaveText(gbp(m.dirRev));
      await expect(page.locator('#tb-total-now')).toHaveText(gbp(m.totalNow));
      const after = model({}).totalNow + m.gain;
      await expect(page.locator('#tb-total-after')).toHaveText(gbp(after));
    });

    test('a different set of inputs follows the formulas', async ({ page }) => {
      const o = { rooms: 120, occ: 82, adr: 245, los: 3, share: 55, comm: 20, mkt: 11, fee: 2.5, disc: 10, shift: 8 };
      await setAll(page, o);
      const m = model(o);
      await expect(page.locator('#res-ota-net')).toHaveText(gbp(m.otaNet, 2));
      await expect(page.locator('#res-direct-net')).toHaveText(gbp(m.directNet, 2));
      await expect(page.locator('#res-gain')).toHaveText((m.gain >= 0 ? '+' : '-') + gbp(m.gain));
      await expect(page.locator('#res-nights')).toHaveText(Math.round(m.nights).toLocaleString('en-GB'));
    });

    test('verdict states the break-even marketing cost', async ({ page }) => {
      // 1 - 0.03 - 0.82/0.95 = 10.7%
      await expect(page.locator('#verdict')).toContainText('Direct nets more than OTA');
      await expect(page.locator('#verdict')).toContainText('10.7%');
    });
  });

  test.describe('typing', () => {
    test('decimals typed key by key are kept exactly and the field is not rebuilt', async ({ page }) => {
      const los = page.locator('#los');
      await los.click();
      await los.fill('');
      await page.evaluate(() => { document.getElementById('los').__marker = 'same-node'; });
      await los.pressSequentially('2.5');
      await expect(los).toHaveValue('2.5');
      await expect(los).toBeFocused();
      expect(await page.evaluate(() => document.getElementById('los').__marker)).toBe('same-node');
      expect(Math.abs(parse(await txt(page, 'res-gap-stay')) - 4.59 * 2.5)).toBeLessThan(0.02);
    });

    test('typing a decimal percentage digit by digit passes through partial values', async ({ page }) => {
      const mkt = page.locator('#mkt');
      await mkt.click();
      await mkt.fill('');
      for (const [ch, expectedValue] of [['1', '1'], ['2', '12'], ['.', '12.'], ['5', '12.5']]) {
        await page.keyboard.type(ch);
        await expect(mkt).toHaveValue(expectedValue);
        await expect(mkt).toBeFocused();
      }
      const m = model({ mkt: 12.5 });
      await expect(page.locator('#res-direct-net')).toHaveText(gbp(m.directNet, 2));
    });

    test('a value over the maximum is kept while typing, noted inline, and tidied on blur', async ({ page }) => {
      const comm = page.locator('#comm');
      await comm.click();
      await comm.fill('');
      await comm.pressSequentially('150');
      await expect(comm).toHaveValue('150');
      await expect(page.locator('#comm-note')).toHaveText('Maximum is 100 - using 100.');
      await expect(page.locator('#res-ota-net')).toHaveText('£0.00');
      await page.locator('#occ').click();
      await expect(comm).toHaveValue('100');
      await expect(page.locator('#comm-note')).toHaveText('Maximum is 100 - using 100.');
    });

    test('a negative value is noted and treated as zero', async ({ page }) => {
      const mkt = page.locator('#mkt');
      await mkt.click();
      await mkt.fill('');
      await mkt.pressSequentially('-5');
      await expect(mkt).toHaveValue('-5');
      await expect(page.locator('#mkt-note')).toContainText('Negative values are not allowed - using 0.');
      await expect(page.locator('#res-direct-net')).toHaveText(gbp(model({ mkt: 0 }).directNet, 2));
    });

    test('a pasted "£1,200" is understood and tidied to 1200', async ({ page }) => {
      await page.locator('#adr').fill('£1,200');
      await expect(page.locator('#res-ota-net')).toHaveText('£984.00');
      await page.locator('#occ').click();
      await expect(page.locator('#adr')).toHaveValue('1200');
    });

    test('shift larger than the OTA share is capped and says so', async ({ page }) => {
      await page.locator('#shift').fill('60');
      await expect(page.locator('#shift-note')).toContainText('Maximum is 40');
      await expect(page.locator('#shift-note')).toContainText('using 40');
      const m = model({ shift: 40 });
      await expect(page.locator('#res-gain')).toHaveText('+' + gbp(m.gain));
      await expect(page.locator('#tb-ota-nights-after')).toHaveText('0');
    });

    test('money is formatted with the sign before the symbol and separators', async ({ page }) => {
      await page.locator('#disc').fill('20');
      // direct = 180 x 0.8 x 0.89 = 128.16 vs 147.60: gap -19.44, a year -13687.5 x 0.05 x 19.44
      await expect(page.locator('#res-gap-night')).toHaveText('-£19.44');
      const gain = await txt(page, 'res-gain');
      expect(gain).toMatch(/^-£\d{1,3}(,\d{3})*$/);
    });
  });

  test.describe('direct nets less than OTA', () => {
    test('says so plainly and names the input doing it', async ({ page }) => {
      await page.locator('#disc').fill('15');
      const verdict = page.locator('#verdict');
      await expect(verdict).toContainText('Direct nets less than OTA');
      await expect(verdict).toContainText('less per room night');
      await expect(verdict).toContainText('member or direct-booking discount');
      await expect(page.locator('#res-gap-night')).toHaveText(/^-£11\.43$/);
      await expect(page.locator('#res-gain')).toHaveText(/^-£/);
      await expect(verdict).toContainText('would cost');
    });

    test('names marketing when marketing is the largest cost', async ({ page }) => {
      await setAll(page, { disc: 2, mkt: 25, fee: 3 });
      await expect(page.locator('#verdict')).toContainText('direct marketing cost');
      await expect(page.locator('#verdict')).toContainText('fell to');
    });

    test('when discount and fees alone beat the commission, no marketing target is offered', async ({ page }) => {
      await setAll(page, { comm: 5, disc: 10, mkt: 0, fee: 3 });
      await expect(page.locator('#verdict')).toContainText('Even with no marketing spend');
    });

    test('equal nets read as level, not as a gain', async ({ page }) => {
      await setAll(page, { comm: 10, disc: 0, mkt: 7, fee: 3 });
      await expect(page.locator('#verdict')).toContainText('Level with the OTAs');
      await expect(page.locator('#res-gap-night')).toHaveText('£0.00');
    });
  });

  test.describe('edge cases', () => {
    const bad = /NaN|Infinity|undefined|N\/A|£0 per|--(?!\w)/;
    const cases = {
      'zero rooms': { rooms: 0 },
      'zero occupancy': { occ: 0 },
      'zero rate': { adr: 0 },
      'zero stay': { los: 0 },
      'no OTA share': { share: 0 },
      'all OTA': { share: 100, shift: 100 },
      '100% commission': { comm: 100 },
      '100% discount': { disc: 100 },
      '100% marketing': { mkt: 100 },
      'marketing and fees over 100%': { mkt: 70, fee: 60 },
      'huge numbers': { rooms: 99999999, adr: 99999999, occ: 100 },
    };
    for (const [name, o] of Object.entries(cases)) {
      test(name + ' gives sensible copy', async ({ page }) => {
        await setAll(page, o);
        await page.locator('#occ').focus();
        const main = await page.locator('#section-results').innerText();
        expect(main).not.toMatch(bad);
        expect(await txt(page, 'verdict')).not.toBe('');
      });
    }

    test('blank fields are treated as zero and noted once left', async ({ page }) => {
      await page.locator('#rooms').fill('');
      await page.locator('#occ').click();
      await expect(page.locator('#rooms-note')).toHaveText('Blank - using 0.');
      await expect(page.locator('#verdict')).toContainText('Nothing to compare yet');
    });

    test('text that is not a number is noted', async ({ page }) => {
      await page.locator('#rooms').fill('abc');
      await page.locator('#occ').click();
      await expect(page.locator('#rooms-note')).toContainText('not a number');
    });

    test('zero stay length asks for one instead of showing a zero', async ({ page }) => {
      await page.locator('#los').fill('0');
      await expect(page.locator('#res-gap-stay')).toHaveText('Set a stay length');
    });

    test('marketing plus fees at 100% says direct nets nothing', async ({ page }) => {
      await setAll(page, { mkt: 70, fee: 30 });
      await expect(page.locator('#verdict')).toContainText('Direct costs take everything');
      await expect(page.locator('#res-direct-net')).toHaveText('£0.00');
    });

    test('very large annual figures go compact and never wrap or overflow at 360', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      await setAll(page, { rooms: 10000, occ: 100, adr: 100000, shift: 40 });
      await page.locator('#occ').focus();
      expect(await txt(page, 'res-total-now')).toMatch(/^£\d+\.\dB$/);
      const checks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.result-value')).map((e) => ({
          id: e.id,
          ws: getComputedStyle(e).whiteSpace,
          over: e.scrollWidth > e.parentElement.clientWidth + 1,
          lines: Math.round(e.getBoundingClientRect().height / parseFloat(getComputedStyle(e).lineHeight)),
        }));
      });
      for (const c of checks) {
        expect(c.over, c.id + ' overflows its card').toBe(false);
        if (c.id !== 'res-gap-stay') expect(c.ws, c.id).toBe('nowrap');
        expect(c.lines, c.id + ' wraps').toBeLessThanOrEqual(1);
      }
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    });

    test('mid-size annual figures are written in full', async ({ page }) => {
      await setAll(page, { rooms: 200 });
      const m = model({ rooms: 200 });
      await expect(page.locator('#res-total-now')).toHaveText(gbp(m.totalNow));
    });
  });

  test.describe('currency', () => {
    test('USD and EUR change every symbol', async ({ page }) => {
      await page.locator('#currency-select').selectOption('USD');
      await expect(page.locator('#res-ota-net')).toHaveText('$147.60');
      await expect(page.locator('#adr-pre, .hv-sym').first()).toHaveText('$');
      await expect(page.locator('#tb-total-now')).toHaveText(/^\$/);
      await page.locator('#currency-select').selectOption('EUR');
      await expect(page.locator('#res-direct-net')).toHaveText('€152.19');
      await expect(page.locator('#hv-chart svg')).toHaveAttribute('aria-label', /€147\.60/);
    });
  });

  test.describe('URL state', () => {
    test('inputs are written to the URL and a link reproduces the result', async ({ page }) => {
      await setAll(page, { rooms: 80, adr: 210, comm: 17.5, shift: 7 });
      await page.locator('#currency-select').selectOption('EUR');
      await expect.poll(() => page.url()).toContain('rooms=80');
      const url = new globalThis.URL(page.url());
      expect(url.searchParams.get('adr')).toBe('210');
      expect(url.searchParams.get('comm')).toBe('17.5');
      expect(url.searchParams.get('cur')).toBe('EUR');
      const gain = await txt(page, 'res-gain');
      await page.goto(url.pathname + url.search);
      await expect(page.locator('#rooms')).toHaveValue('80');
      await expect(page.locator('#comm')).toHaveValue('17.5');
      await expect(page.locator('#currency-select')).toHaveValue('EUR');
      await expect(page.locator('#res-gain')).toHaveText(gain);
    });

    test('an out-of-range value in the URL is capped with a note', async ({ page }) => {
      await page.goto(URL + '?comm=150&adr=abc');
      await expect(page.locator('#comm-note')).toContainText('Maximum is 100');
      await expect(page.locator('#adr')).toHaveValue('180');
    });

    test('no cookies or local storage are written', async ({ page }) => {
      await setAll(page, { rooms: 77, adr: 199 });
      await page.locator('#currency-select').selectOption('USD');
      const stored = await page.evaluate(() => ({
        cookie: document.cookie, local: localStorage.length, session: sessionStorage.length,
      }));
      expect(stored).toEqual({ cookie: '', local: 0, session: 0 });
    });
  });

  test.describe('tool events', () => {
    test.beforeEach(async ({ page }) => {
      await page.addInitScript(() => {
        window.__events = [];
        window.toolEvent = (name) => window.__events.push(name);
      });
      await page.goto(URL);
      await expect(page.locator('#res-ota-net')).not.toHaveText('--');
    });

    test('calculated fires once, after the first real change, and not on load', async ({ page }) => {
      expect(await page.evaluate(() => window.__events)).toEqual([]);
      await page.locator('#rooms').click();
      await page.locator('#rooms').pressSequentially('120');
      await page.locator('#adr').fill('199');
      await page.waitForTimeout(1200);
      await page.locator('#occ').fill('70');
      await page.waitForTimeout(1200);
      expect(await page.evaluate(() => window.__events)).toEqual(['calculated']);
    });

    test('shared fires on copy link and the status confirms', async ({ page, context }) => {
      await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
      await page.locator('#copy-link').click();
      expect(await page.evaluate(() => window.__events)).toContain('shared');
      await expect(page.locator('#copy-status')).toHaveText(/Link copied|Could not copy/);
    });
  });

  test.describe('structure and accessibility', () => {
    const ids = ['rooms', 'occ', 'adr', 'los', 'share', 'comm', 'mkt', 'fee', 'disc', 'shift'];

    test('every input has a visible label tied by for, and is at least 44px tall', async ({ page }) => {
      for (const id of [...ids, 'currency-select']) {
        const info = await page.evaluate((i) => {
          const input = document.getElementById(i);
          const label = document.querySelector('label[for="' + i + '"]');
          const lr = label && label.getBoundingClientRect();
          return {
            hasLabel: !!label,
            labelVisible: !!label && lr.width > 0 && lr.height > 0 && !label.classList.contains('visually-hidden'),
            height: input.getBoundingClientRect().height,
          };
        }, id);
        expect(info.hasLabel, id + ' label').toBe(true);
        if (id !== 'currency-select') expect(info.labelVisible, id + ' label visible').toBe(true);
        expect(info.height, id + ' height').toBeGreaterThanOrEqual(44);
      }
      const btn = await page.locator('#copy-link').boundingBox();
      expect(btn.height).toBeGreaterThanOrEqual(44);
    });

    test('inputs describe themselves with a hint and a note', async ({ page }) => {
      for (const id of ids) {
        await expect(page.locator('#' + id)).toHaveAttribute('aria-describedby', id + '-hint ' + id + '-note');
      }
    });

    test('tab order follows the page: currency, then inputs in order, then copy link', async ({ page }) => {
      await page.locator('#currency-select').focus();
      const seen = [];
      for (let i = 0; i < ids.length + 2; i++) {
        await page.keyboard.press('Tab');
        seen.push(await page.evaluate(() => document.activeElement.id));
      }
      expect(seen).toEqual([...ids, 'copy-link', seen[ids.length + 1]]);
    });

    test('inputs get a visible focus outline', async ({ page }) => {
      await page.locator('#rooms').focus();
      const outline = await page.evaluate(() => {
        const s = getComputedStyle(document.getElementById('rooms'));
        return s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0 || s.boxShadow !== 'none';
      });
      expect(outline).toBe(true);
    });

    test('the live region is polite and only changes once typing pauses', async ({ page }) => {
      const live = page.locator('#hv-live');
      await expect(live).toHaveAttribute('role', 'status');
      await expect(live).toHaveAttribute('aria-live', 'polite');
      await expect(live).toContainText('Direct nets more than OTA');
      const before = await live.innerText();
      await page.locator('#disc').fill('15');
      // Immediately after the change the visible verdict has moved on but the announcement has not.
      await expect(page.locator('#verdict')).toContainText('Direct nets less than OTA');
      expect(await live.innerText()).toBe(before);
      await expect(live).toContainText('Direct nets less than OTA', { timeout: 3000 });
    });

    test('the results cards are not themselves live regions', async ({ page }) => {
      expect(await page.locator('#section-results [aria-live]').count()).toBe(2); // announcement + copy status only
    });

    test('the tool-cta marker sits on its own line directly below the results section', () => {
      const src = fs.readFileSync(path.join(__dirname, '..', '..', 'hotel-direct-vs-ota.html'), 'utf8').split('\n');
      const i = src.findIndex((l) => l.trim() === '<!-- tool-cta -->');
      expect(i).toBeGreaterThan(0);
      expect(src[i]).toBe('<!-- tool-cta -->');
      expect(src[i - 1]).toBe('</div>');
    });

    test('how this works lists the formulas and the caveats', async ({ page }) => {
      const t = await page.locator('.hv-method').innerText();
      for (const s of ['ADR x (1 - commission)', 'ADR x (1 - discount) x (1 - marketing - fees)', 'rooms x 365 x occupancy',
        'billboard effect', 'Parity clauses', 'Cancellations and no-shows', 'lifetime value', 'Occupancy is fixed']) {
        expect(t).toContain(s);
      }
    });

    test('no uncaught errors and no dialogs', async ({ page, pageErrors, dialogs }) => {
      await setAll(page, { rooms: 0, adr: 'x', comm: 999 });
      await page.locator('#occ').click();
      expect(pageErrors).toEqual([]);
      expect(dialogs).toEqual([]);
    });
  });

  test.describe('layout', () => {
    for (const width of [360, 390, 1280]) {
      test(`no horizontal overflow at ${width}px, defaults and a long-number case`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        for (const o of [{}, { rooms: 10000, occ: 100, adr: 100000, shift: 40 }, { rooms: 0 }]) {
          await setAll(page, { ...DEFAULTS, ...o });
          await page.locator('#occ').focus();
          const wide = await page.evaluate(() => {
            const w = window.innerWidth;
            const bad = Array.from(document.querySelectorAll('#section-inputs *, #section-results *')).filter((e) => {
              const r = e.getBoundingClientRect();
              return r.width > 0 && (r.right > w + 1 || r.left < -1);
            }).map((e) => (e.id || (typeof e.className === 'string' && e.className) || e.tagName) + ':' + Math.round(e.getBoundingClientRect().left) + '-' + Math.round(e.getBoundingClientRect().right) + '@' + w);
            return { doc: document.documentElement.scrollWidth - w, bad };
          });
          expect(wide.doc).toBeLessThanOrEqual(0);
          expect(wide.bad).toEqual([]);
        }
      });
    }

    for (const width of [360, 1280]) {
      test(`inputs in a row share a top at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        const tops = await page.evaluate(() => {
          const t = (id) => Math.round(document.getElementById(id).closest('.input-group, .col-6, .col-md-3, .col-md-4')
            .querySelector('input').getBoundingClientRect().top);
          return { rooms: t('rooms'), occ: t('occ'), adr: t('adr'), los: t('los'), mkt: t('mkt'), fee: t('fee'), disc: t('disc'), share: t('share'), comm: t('comm') };
        });
        expect(tops.rooms).toBe(tops.occ);
        expect(tops.adr).toBe(tops.los);
        expect(tops.share).toBe(tops.comm);
        expect(tops.mkt).toBe(tops.fee);
        if (width === 1280) { expect(tops.rooms).toBe(tops.adr); expect(tops.mkt).toBe(tops.disc); }
      });
    }

    test('result cards in a row share a top', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 900 });
      const tops = await page.evaluate(() => ['res-ota-net', 'res-direct-net'].map((i) => Math.round(document.getElementById(i).closest('.result-card').getBoundingClientRect().top)));
      expect(tops[0]).toBe(tops[1]);
    });
  });

  test.describe('chart', () => {
    for (const width of [360, 1280]) {
      test(`is drawn at its rendered width with readable text at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.locator('#rooms').fill('51'); // forces a redraw at this width
        const info = await page.evaluate(() => {
          const box = document.getElementById('hv-chart');
          const svg = box.querySelector('svg');
          const vb = svg.viewBox.baseVal;
          const sizes = Array.from(svg.querySelectorAll('text')).map((t) => parseFloat(t.getAttribute('font-size')));
          const scale = svg.getBoundingClientRect().width / vb.width;
          return { vbW: vb.width, boxW: box.getBoundingClientRect().width, svgW: svg.getBoundingClientRect().width, min: Math.min(...sizes) * scale, role: svg.getAttribute('role'), label: svg.getAttribute('aria-label') };
        });
        expect(Math.abs(info.vbW - info.boxW)).toBeLessThanOrEqual(1);
        expect(Math.abs(info.svgW - info.boxW)).toBeLessThanOrEqual(1);
        expect(info.min).toBeGreaterThanOrEqual(11);
        expect(info.role).toBe('img');
        expect(info.label).toContain('£147.60');
        expect(info.label).toContain('£152.19');
      });
    }

    test('is redrawn when the window is resized', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      const w1 = await page.evaluate(() => document.querySelector('#hv-chart svg').viewBox.baseVal.width);
      await page.setViewportSize({ width: 360, height: 900 });
      await expect.poll(() => page.evaluate(() => document.querySelector('#hv-chart svg').viewBox.baseVal.width)).toBeLessThan(w1 - 100);
      const [vbW, boxW] = await page.evaluate(() => [document.querySelector('#hv-chart svg').viewBox.baseVal.width, document.getElementById('hv-chart').getBoundingClientRect().width]);
      expect(Math.abs(vbW - boxW)).toBeLessThanOrEqual(1);
    });

    test('bar lengths follow the net per night', async ({ page }) => {
      const widths = await page.evaluate(() => Array.from(document.querySelectorAll('#hv-chart svg rect')).map((r) => parseFloat(r.getAttribute('width'))));
      // [track, ota bar, track, direct bar]
      expect(widths[1] / widths[0]).toBeCloseTo(147.6 / 180, 2);
      expect(widths[3] / widths[2]).toBeCloseTo(152.19 / 180, 2);
    });

    test('is left out when there is nothing to draw', async ({ page }) => {
      await page.locator('#adr').fill('0');
      await expect(page.locator('#hv-chart svg')).toHaveCount(0);
      await expect(page.locator('#res-ota-net')).toHaveText('£0.00');
    });
  });
});
