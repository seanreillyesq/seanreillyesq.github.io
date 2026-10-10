const fs = require('fs');
const path = require('path');
const { test, expect } = require('../fixtures');

const URL = '/promotion-break-even/';
const PAGE_FILE = path.resolve(__dirname, '..', '..', 'promotion-break-even.html');

const txt = async (page, sel) => (await page.locator(sel).innerText()).trim();

// Type like a person: clear the field, then one key at a time.
async function typeInto(page, sel, text) {
  const f = page.locator(sel);
  await f.fill('');
  await f.pressSequentially(text, { delay: 15 });
}

async function setField(page, sel, text) {
  await page.locator(sel).fill(text);
}

test.describe('Promotion break-even calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('#res-cb')).not.toHaveText('-');
  });

  test.describe('maths (hand-computed)', () => {
    test('defaults: 100 incl VAT, cost 40, fees 2%, shipping 5, 20% off', async ({ page }) => {
      // ex VAT 83.3333; before 83.3333 - 40 - 2 - 5 = 36.3333
      // after: 66.6667 - 40 - 1.6 - 5 = 20.0667; multiplier 1.81066
      await expect(page.locator('#res-cb')).toHaveText('£36.33');
      await expect(page.locator('#res-ca')).toHaveText('£20.07');
      await expect(page.locator('#res-uplift')).toHaveText('+81.1%');
      await expect(page.locator('#sub-uplift')).toHaveText('1.81x the units');
      await expect(page.locator('#res-extra')).toHaveText('+81');
      // 1000 x 1.81066 = 1810.66, rounded up to whole units
      await expect(page.locator('#res-units')).toHaveText('1,811');
      // 1000 x 36.3333
      await expect(page.locator('#res-target')).toHaveText('£36,333');
    });

    test('VAT off: 100 ex VAT, fees on 100', async ({ page }) => {
      await page.locator('label[for="vat-incl"]').click();
      // before 100 - 40 - 2 - 5 = 53; after 80 - 40 - 1.6 - 5 = 33.4; 53/33.4 = 1.58683
      await expect(page.locator('#res-cb')).toHaveText('£53.00');
      await expect(page.locator('#res-ca')).toHaveText('£33.40');
      await expect(page.locator('#res-uplift')).toHaveText('+58.7%');
      await expect(page.locator('#vat-rate')).toBeDisabled();
    });

    test('a different VAT rate changes the ex-VAT price', async ({ page }) => {
      await setField(page, '#vat-rate', '5');
      // ex 95.2381; before 95.2381 - 47 = 48.2381; after 76.1905 - 46.6 = 29.5905; ratio 1.63019
      await expect(page.locator('#res-cb')).toHaveText('£48.24');
      await expect(page.locator('#res-ca')).toHaveText('£29.59');
      await expect(page.locator('#res-uplift')).toHaveText('+63.0%');
    });

    test('gross margin mode is the source of truth and keeps the same cost on switching', async ({ page }) => {
      await page.locator('label[for="mode-margin"]').click();
      await expect(page.locator('#margin')).toBeVisible();
      await expect(page.locator('#cost')).toBeHidden();
      await expect(page.locator('#margin')).toHaveValue('52');
      await expect(page.locator('#res-cb')).toHaveText('£36.33');
      await setField(page, '#margin', '40');
      // cost = 83.3333 x 0.6 = 50; before 83.3333 - 57 = 26.3333; after 66.6667 - 56.6 = 10.0667
      await expect(page.locator('#res-cb')).toHaveText('£26.33');
      await expect(page.locator('#res-ca')).toHaveText('£10.07');
      await expect(page.locator('#res-uplift')).toHaveText('+161.6%');
      await page.locator('label[for="mode-cost"]').click();
      await expect(page.locator('#cost')).toHaveValue('50');
      await expect(page.locator('#res-cb')).toHaveText('£26.33');
    });

    test('marketing spend raises the bar using normal units', async ({ page }) => {
      await setField(page, '#mkt', '5000');
      // (1000 x 36.3333 + 5000) / 20.0667 = 2059.80 units -> +106.0%
      await expect(page.locator('#res-uplift')).toHaveText('+106.0%');
      await expect(page.locator('#sub-uplift')).toHaveText('before marketing: +81.1%');
      await expect(page.locator('#res-units')).toHaveText('2,060');
      await expect(page.locator('#res-target')).toHaveText('£41,333');
      await expect(page.locator('#th-uplift')).toContainText('with marketing');
    });

    test('expected uplift: profit change versus no promotion', async ({ page }) => {
      await expect(page.locator('#expected-panel')).toBeHidden();
      await setField(page, '#uplift', '100');
      // 2000 x 20.0667 = 40133.33 vs 36333.33
      await expect(page.locator('#res-change')).toHaveText('+£3,800');
      await expect(page.locator('#verdict-expected')).toContainText('Worth doing');
      await setField(page, '#uplift', '50');
      // 1500 x 20.0667 = 30100 vs 36333.33
      await expect(page.locator('#res-change')).toHaveText('-£6,233');
      await expect(page.locator('#verdict-expected')).toContainText('Not worth it');
      await setField(page, '#mkt', '5000');
      await setField(page, '#uplift', '100');
      // 40133.33 - 5000 - 36333.33
      await expect(page.locator('#res-change')).toHaveText('-£1,200');
    });
  });

  test.describe('discount table', () => {
    test('shows 5 to 50 percent and highlights the chosen discount', async ({ page }) => {
      const rows = page.locator('#discount-tbody tr');
      await expect(rows).toHaveCount(10);
      await expect(rows.first().locator('th')).toHaveText('5%');
      await expect(rows.last().locator('th')).toContainText('50%');
      await expect(page.locator('#discount-tbody tr[aria-current="true"]')).toHaveCount(1);
      await expect(page.locator('tr.pbe-chosen th')).toContainText('20%');
      await expect(page.locator('tr.pbe-chosen td').nth(1)).toHaveText('+81.1%');
      // 5%: 95 -> 79.1667 - 48.9 = 30.2667? (95/1.2 = 79.1667; fees 1.9; 79.1667-40-1.9-5 = 32.2667) 36.3333/32.2667 = 1.12603
      await expect(rows.nth(0).locator('td').nth(1)).toHaveText('+12.6%');
      // 10%: 75 - 46.8 = 28.2 -> 1.28841
      await expect(rows.nth(1).locator('td').nth(1)).toHaveText('+28.8%');
      // 40%: 50 - 46.2 = 3.8 -> 9.5614
      await expect(rows.nth(7).locator('td').nth(1)).toHaveText('+856.1%');
    });

    test('deep discounts that cannot be recovered are marked as such', async ({ page }) => {
      const rows = page.locator('#discount-tbody tr');
      // 45%: 45.8333 - 46.1 < 0; 50%: 41.6667 - 46 < 0
      await expect(rows.nth(8)).toContainText('Not possible');
      await expect(rows.nth(9)).toContainText('Not possible');
      await expect(rows.nth(7)).not.toContainText('Not possible');
    });

    test('a discount between the steps gets its own highlighted row in order', async ({ page }) => {
      await setField(page, '#disc', '17.5');
      const rows = page.locator('#discount-tbody tr');
      await expect(rows).toHaveCount(11);
      // 82.5 -> 68.75 - 46.65 = 22.1 -> 1.64405
      await expect(page.locator('tr.pbe-chosen th')).toContainText('17.5%');
      await expect(page.locator('tr.pbe-chosen td').nth(1)).toHaveText('+64.4%');
      await expect(rows.nth(3).locator('th')).toContainText('17.5%');
      await expect(page.locator('#discount-tbody tr[aria-current="true"]')).toHaveCount(1);
    });
  });

  test.describe('typing and validation', () => {
    test('typing decimals key by key leaves exactly what was typed', async ({ page }) => {
      await typeInto(page, '#price', '125.5');
      await expect(page.locator('#price')).toHaveValue('125.5');
      // 125.5 / 1.2 = 104.5833; - 40 - 2.51 - 5 = 57.0733
      await expect(page.locator('#res-cb')).toHaveText('£57.07');
      await typeInto(page, '#fee', '1.75');
      await expect(page.locator('#fee')).toHaveValue('1.75');
      await typeInto(page, '#uplift', '2.5');
      await expect(page.locator('#uplift')).toHaveValue('2.5');
      await page.locator('#price').focus();
      await page.keyboard.type('0');
      await expect(page.locator('#price')).toHaveValue('125.50');
    });

    test('half-typed values do not blank or break the results', async ({ page }) => {
      const f = page.locator('#disc');
      await f.fill('');
      await f.pressSequentially('-', { delay: 15 });
      await expect(f).toHaveValue('-');
      await expect(page.locator('#disc-note')).toHaveText('');
      await f.pressSequentially('5', { delay: 15 });
      await expect(page.locator('#disc-note')).toHaveText('Negative values are not allowed - using 0.');
      await expect(f).toHaveValue('-5');
    });

    test('out-of-range values say so inline and are tidied on blur only', async ({ page }) => {
      await typeInto(page, '#disc', '150');
      await expect(page.locator('#disc')).toHaveValue('150');
      await expect(page.locator('#disc-note')).toHaveText('Maximum is 100 - using 100.');
      await expect(page.locator('#verdict')).toContainText('No volume can pay');
      await page.locator('#disc').blur();
      await expect(page.locator('#disc')).toHaveValue('100');
      await expect(page.locator('#disc-note')).toHaveText('Maximum is 100 - using 100.');
      await typeInto(page, '#disc', '30');
      await expect(page.locator('#disc-note')).toHaveText('');
    });

    test('pasted currency text such as "£1,200" is understood', async ({ page }) => {
      await setField(page, '#price', '£1,200');
      // 1000 - 40 - 24 - 5 = 931
      await expect(page.locator('#res-cb')).toHaveText('£931.00');
      await expect(page.locator('#price-note')).toHaveText('');
      await page.locator('#price').blur();
      await expect(page.locator('#price')).toHaveValue('1200');
    });

    test('text that is not a number is called out, not silently dropped', async ({ page }) => {
      await setField(page, '#fee', 'abc');
      await expect(page.locator('#fee-note')).toHaveText('That is not a number - using 0.');
      await setField(page, '#uplift', 'abc');
      await expect(page.locator('#uplift-note')).toHaveText('That is not a number - ignoring it.');
      await expect(page.locator('#expected-panel')).toBeHidden();
    });
  });

  test.describe('edge cases', () => {
    test('discount that wipes out the contribution says no volume can pay for it', async ({ page }) => {
      await setField(page, '#disc', '60');
      await expect(page.locator('#verdict')).toContainText('No volume can pay for this discount');
      await expect(page.locator('#verdict')).toContainText('No amount of extra volume can pay for it');
      // deepest discount with any contribution: 36.3333 / (83.3333 - 2) = 44.67%
      await expect(page.locator('#verdict')).toContainText('about 44.67%');
      await expect(page.locator('#res-uplift')).toHaveText('Not possible');
      await expect(page.locator('#res-ca')).toHaveText('-£12.47');
    });

    test('a product with no margin at full price is called out', async ({ page }) => {
      await setField(page, '#cost', '90');
      await expect(page.locator('#verdict')).toContainText('no margin to discount');
      await expect(page.locator('#res-uplift')).toHaveText('Not possible');
      await expect(page.locator('#res-cb')).toHaveText('-£13.67');
    });

    test('no discount asks for one; blank price asks for a price', async ({ page }) => {
      await setField(page, '#disc', '0');
      await expect(page.locator('#verdict')).toContainText('No discount entered');
      await expect(page.locator('#res-uplift')).toHaveText('+0.0%');
      await expect(page.locator('#discount-tbody tr[aria-current="true"]')).toHaveCount(0);
      await setField(page, '#price', '');
      await expect(page.locator('#verdict')).toContainText('Enter a selling price');
      await expect(page.locator('#res-cb')).toHaveText('-');
    });

    test('no units: money figures ask for units, percentages still work', async ({ page }) => {
      await setField(page, '#units', '0');
      await expect(page.locator('#res-uplift')).toHaveText('+81.1%');
      await expect(page.locator('#res-units')).toHaveText('Add units');
      await expect(page.locator('#res-target')).toHaveText('Add units');
      await setField(page, '#uplift', '100');
      await expect(page.locator('#res-change')).toHaveText('Add units');
    });

    test('hostile and odd input never shows NaN, Infinity or placeholder junk', async ({ page, pageErrors }) => {
      const fields = ['#price', '#vat-rate', '#cost', '#fee', '#ship', '#disc', '#units', '#uplift', '#mkt'];
      const samples = ['', '0', '-5', 'abc', '1e5', '999999999999999999999999', '£1,200', '0.0', '.', '-', '100', '1000000'];
      for (const sample of samples) {
        for (const sel of fields) {
          await setField(page, sel, sample);
          const body = await txt(page, '#pbe-results');
          expect(body, `${sel}=${sample}`).not.toMatch(/NaN|Infinity|undefined|N\/A|null|£0 per/);
        }
        // reset so combinations stay varied but bounded
        await page.goto(URL);
      }
      expect(pageErrors).toEqual([]);
    });

    test('costs equal to 100 percent discount and zero costs behave', async ({ page }) => {
      await setField(page, '#disc', '100');
      await expect(page.locator('#verdict')).toContainText('No volume can pay');
      await setField(page, '#cost', '0');
      await setField(page, '#ship', '0');
      await setField(page, '#fee', '0');
      // price 0 after a 100% discount: contribution exactly 0, still impossible
      await expect(page.locator('#res-ca')).toHaveText('£0.00');
      await expect(page.locator('#res-uplift')).toHaveText('Not possible');
    });
  });

  test.describe('money formatting', () => {
    test('sign before the symbol with thousands separators; compact only when huge', async ({ page }) => {
      await setField(page, '#cost', '1000000');
      // 83.3333 - 1,000,000 - 2 - 5 = -999,923.67
      await expect(page.locator('#res-cb')).toHaveText('-£999,923.67');
      await setField(page, '#cost', '40');
      await setField(page, '#price', '1000000');
      await setField(page, '#units', '100000000');
      const target = await txt(page, '#res-target');
      expect(target).toMatch(/^£[\d,]+\.\d[BM]$/);
      expect(await txt(page, '#res-cb')).toMatch(/^£[\d,]+\.\d\d$|^£[\d,]+\.\d[BM]$/);
      await setField(page, '#cost', '1000000');
      await setField(page, '#units', '1000');
      expect(await txt(page, '#res-cb')).toMatch(/^-£/);
    });

    for (const width of [360, 390]) {
      test(`large money values do not wrap or overflow their cards at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await setField(page, '#price', '1000000');
        await setField(page, '#units', '100000000');
        await setField(page, '#mkt', '1000000000');
        await setField(page, '#uplift', '100000');
        const res = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('.pbe-card-value')).filter((e) => e.offsetParent).map((e) => {
            const cs = getComputedStyle(e);
            const lh = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
            return { id: e.id, ws: cs.whiteSpace, lines: Math.round(e.getBoundingClientRect().height / lh), over: e.scrollWidth - e.clientWidth, text: e.textContent };
          });
        });
        expect(res.length).toBeGreaterThanOrEqual(8);
        for (const r of res) {
          expect(r.ws, r.id).toBe('nowrap');
          expect(r.lines, r.id + ' ' + r.text).toBe(1);
          expect(r.over, r.id + ' ' + r.text).toBeLessThanOrEqual(1);
        }
      });
    }
  });

  test.describe('layout and accessibility', () => {
    for (const width of [360, 390, 1280]) {
      test(`no horizontal overflow at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        const over = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(await over()).toBeLessThanOrEqual(0);
        await setField(page, '#price', '1000000');
        await setField(page, '#units', '100000000');
        await setField(page, '#mkt', '1000000000');
        await setField(page, '#uplift', '100000');
        await setField(page, '#disc', '17.5');
        expect(await over()).toBeLessThanOrEqual(0);
        await page.locator('label[for="mode-margin"]').click();
        await page.locator('label[for="vat-incl"]').click();
        expect(await over()).toBeLessThanOrEqual(0);
      });
    }

    for (const width of [360, 1280]) {
      test(`the discount table fits and stays readable at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await setField(page, '#disc', '17.5');
        await setField(page, '#mkt', '5000');
        const t = await page.evaluate(() => {
          const table = document.getElementById('discount-table');
          const wrap = table.parentElement;
          const cells = Array.from(table.querySelectorAll('th, td'));
          return {
            tableW: table.getBoundingClientRect().width,
            wrapW: wrap.clientWidth,
            scrollW: wrap.scrollWidth,
            minFont: Math.min(...cells.map((c) => parseFloat(getComputedStyle(c).fontSize))),
            clipped: cells.filter((c) => c.scrollWidth > c.clientWidth + 1).length,
            rowsWrapped: Array.from(table.querySelectorAll('tbody tr')).filter((r) => r.getBoundingClientRect().height > 48).length,
          };
        });
        expect(t.scrollW).toBeLessThanOrEqual(t.wrapW);
        expect(t.tableW).toBeLessThanOrEqual(t.wrapW + 1);
        expect(t.minFont).toBeGreaterThanOrEqual(11);
        expect(t.clipped).toBe(0);
        expect(t.rowsWrapped).toBe(0);
      });
    }

    for (const width of [360, 390, 1280]) {
      test(`inputs in a row share a top at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        const rows = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('.pbe-field-row')).map((row) => {
            const cols = Array.from(row.children).filter((c) => c.offsetParent);
            return cols.map((c) => {
              const label = c.querySelector('label').getBoundingClientRect();
              const field = c.querySelector('input').closest('.input-group, input').getBoundingClientRect();
              return { id: c.querySelector('input').id, rowTop: Math.round(c.getBoundingClientRect().top), field: Math.round(field.top * 10) / 10, labelH: label.height };
            });
          });
        });
        let compared = 0;
        for (const cols of rows) {
          const groups = {};
          cols.forEach((c) => { (groups[c.rowTop] = groups[c.rowTop] || []).push(c); });
          for (const g of Object.values(groups)) {
            for (const c of g) {
              expect(Math.abs(c.field - g[0].field), `${c.id} vs ${g[0].id}`).toBeLessThanOrEqual(1);
              if (g.length > 1) compared++;
            }
          }
        }
        expect(compared).toBeGreaterThanOrEqual(4);
      });
    }

    test('every control is at least 44px tall and has a visible label', async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 800 });
      const res = await page.evaluate(() => {
        const out = [];
        const controls = Array.from(document.querySelectorAll('#pbe-inputs input, #pbe-inputs select, .pbe-top-row select, .pbe-top-row button'));
        controls.forEach((c) => {
          if (c.type === 'hidden') return;
          const isBtn = c.classList.contains('btn-check');
          const hidden = c.closest('[hidden]');
          if (hidden) return;
          const box = (isBtn ? document.querySelector(`label[for="${c.id}"]`) : c).getBoundingClientRect();
          const label = c.id ? document.querySelector(`label[for="${c.id}"]`) : null;
          const lb = label ? label.getBoundingClientRect() : null;
          out.push({ id: c.id || c.tagName, h: box.height, label: !!label && lb.width > 0 && lb.height > 0 && getComputedStyle(label).visibility !== 'hidden' && !label.classList.contains('visually-hidden') });
        });
        return out;
      });
      expect(res.length).toBeGreaterThanOrEqual(13);
      for (const r of res) {
        expect(r.h, r.id).toBeGreaterThanOrEqual(43.5);
        if (r.id !== 'share-btn') expect(r.label, r.id + ' label').toBe(true);
      }
    });

    test('tab order follows the page and focus is visible', async ({ page }) => {
      const order = ['currency-select', 'share-btn', 'vat-incl', 'price', 'vat-rate', 'mode-cost', 'cost', 'fee', 'ship', 'disc', 'units', 'uplift', 'mkt'];
      await page.locator('#currency-select').focus();
      const seen = ['currency-select'];
      for (let i = 1; i < order.length; i++) {
        await page.keyboard.press('Tab');
        seen.push(await page.evaluate(() => document.activeElement.id));
      }
      expect(seen).toEqual(order);
      await page.locator('#price').focus();
      const outline = await page.locator('#price').evaluate((e) => { const s = getComputedStyle(e); return s.boxShadow + '|' + s.outlineStyle + '|' + s.borderColor; });
      expect(outline).not.toMatch(/^none\|none\|rgb\(222, 226, 230\)$/);
    });

    test('charts are not required: the page has no chart and the table has a caption', async ({ page }) => {
      await expect(page.locator('#discount-table caption')).not.toBeEmpty();
      await expect(page.locator('#discount-table th[scope="row"]').first()).toBeVisible();
    });

    test('results are announced in one polite live region, not on every keystroke', async ({ page }) => {
      const live = page.locator('#live-summary');
      await expect(live).toHaveAttribute('aria-live', 'polite');
      await expect(live).toHaveText(/81\.1% more units/);
      await page.evaluate(() => {
        window.__mut = 0;
        new MutationObserver((l) => { window.__mut += l.length; }).observe(document.getElementById('live-summary'), { childList: true, characterData: true, subtree: true });
      });
      await typeInto(page, '#disc', '22.5');
      expect(await page.evaluate(() => window.__mut)).toBe(0);
      await expect(live).toHaveText(/22\.5% off/);
      expect(await page.evaluate(() => window.__mut)).toBe(1);
      // the visible verdict updates at once and is not itself a live region
      await expect(page.locator('#verdict')).not.toHaveAttribute('aria-live', /.*/);
    });
  });

  test.describe('URL state, currency and privacy', () => {
    test('the URL holds the state and a link reproduces the result', async ({ page }) => {
      await setField(page, '#disc', '30');
      await setField(page, '#mkt', '2500');
      await setField(page, '#uplift', '150');
      await page.locator('label[for="vat-incl"]').click();
      await expect.poll(() => page.url()).toMatch(/vatincl=0/);
      const url = page.url();
      expect(url).toContain('mkt=2500');
      expect(url).toContain('uplift=150');
      expect(url).toContain('vatincl=0');
      const expected = { cb: await txt(page, '#res-cb'), up: await txt(page, '#res-uplift'), change: await txt(page, '#res-change') };
      await page.goto(url);
      await expect(page.locator('#disc')).toHaveValue('30');
      await expect(page.locator('#vat-incl')).not.toBeChecked();
      await expect(page.locator('#res-cb')).toHaveText(expected.cb);
      await expect(page.locator('#res-uplift')).toHaveText(expected.up);
      await expect(page.locator('#res-change')).toHaveText(expected.change);
    });

    test('margin mode survives in the URL', async ({ page }) => {
      await page.locator('label[for="mode-margin"]').click();
      await setField(page, '#margin', '40');
      await expect.poll(() => page.url()).toMatch(/margin=40/);
      await page.goto(page.url());
      await expect(page.locator('#mode-margin')).toBeChecked();
      await expect(page.locator('#res-cb')).toHaveText('£26.33');
    });

    test('currency select changes symbols and results', async ({ page }) => {
      await page.locator('#currency-select').selectOption('USD');
      await expect(page.locator('#res-cb')).toHaveText('$36.33');
      await expect(page.locator('.pbe-cur').first()).toHaveText('$');
      await page.locator('#currency-select').selectOption('EUR');
      await expect(page.locator('#res-cb')).toHaveText('€36.33');
      await expect.poll(() => page.url()).toMatch(/cur=EUR/);
      await expect(page.locator('#price')).toHaveValue('100');
      await page.goto('/promotion-break-even/?cur=USD&disc=10');
      await expect(page.locator('#currency-select')).toHaveValue('USD');
      await expect(page.locator('#res-ca')).toHaveText('$28.20');
    });

    test('out-of-range values in a shared link are flagged, not silently clamped', async ({ page }) => {
      await page.goto('/promotion-break-even/?disc=500&price=-3');
      await expect(page.locator('#disc-note')).toHaveText('Maximum is 100 - using 100.');
      await expect(page.locator('#price-note')).toHaveText('Negative values are not allowed - using 0.');
      await expect(page.locator('#verdict')).toContainText('Enter a selling price');
    });

    test('nothing is stored in cookies or local storage', async ({ page }) => {
      await setField(page, '#price', '250');
      await setField(page, '#uplift', '40');
      await page.locator('#share-btn').click();
      const stored = await page.evaluate(() => ({ cookie: document.cookie, ls: localStorage.length, ss: sessionStorage.length }));
      expect(stored).toEqual({ cookie: '', ls: 0, ss: 0 });
    });
  });

  test.describe('analytics hooks and page markers', () => {
    test('toolEvent: calculated once after the first real change, shared on copy link', async ({ browser }) => {
      const context = await browser.newContext();
      await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://127.0.0.1:4173' });
      const page = await context.newPage();
      await page.addInitScript(() => {
        window.__events = [];
        window.toolEvent = (n) => window.__events.push(n);
      });
      await page.goto(URL);
      await expect(page.locator('#res-cb')).toHaveText('£36.33');
      await page.waitForTimeout(1200);
      expect(await page.evaluate(() => window.__events)).toEqual([]);
      await typeInto(page, '#disc', '25');
      await expect.poll(() => page.evaluate(() => window.__events.slice())).toEqual(['calculated']);
      await typeInto(page, '#disc', '30');
      await page.waitForTimeout(1200);
      expect(await page.evaluate(() => window.__events.slice())).toEqual(['calculated']);
      await page.locator('#share-btn').click();
      await expect.poll(() => page.evaluate(() => window.__events.slice())).toEqual(['calculated', 'shared']);
      await expect(page.locator('#share-status')).toHaveText('Link copied');
      expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('disc=30');
      await context.close();
    });

    test('the page works when window.toolEvent does not exist', async ({ page, pageErrors }) => {
      await typeInto(page, '#disc', '25');
      await page.locator('#share-btn').click();
      await page.waitForTimeout(1000);
      expect(pageErrors).toEqual([]);
    });

    test('the tool-cta marker sits directly below the results section', async () => {
      const src = fs.readFileSync(PAGE_FILE, 'utf8');
      expect(src).toMatch(/<\/section>\n<!-- tool-cta -->\n/);
      expect(src.indexOf('id="pbe-results"')).toBeLessThan(src.indexOf('<!-- tool-cta -->'));
      expect(src).not.toMatch(/include tool-cta/);
    });

    test('front matter carries the tool fields', async () => {
      const src = fs.readFileSync(PAGE_FILE, 'utf8');
      const fm = src.split('---')[1];
      for (const key of ['layout: page', 'permalink: /promotion-break-even/', 'hidden: true', 'sitemap: true', 'tool: true', 'tool_group: business', 'tool_order: 5', 'header-img: "img/home-bg.jpg"']) {
        expect(fm).toContain(key);
      }
      expect(fm).toMatch(/tool_summary: ".+"/);
      const meta = fm.match(/meta-description: "(.+)"/)[1];
      expect(meta.length).toBeLessThan(155);
    });

    test('the explainer names the caveats and the VAT tax year', async ({ page }) => {
      const how = await txt(page, '#how-this-works');
      for (const phrase of ['Pull-forward', 'Brand and reference price', 'Returns', 'Halo', '2026/27', 'contribution before / contribution after']) {
        expect(how).toContain(phrase);
      }
    });
  });
});
