const fs = require('fs');
const path = require('path');
const { test, expect, setValue } = require('../fixtures');

const URL = '/hotel-direct-vs-ota/';

const DEFAULTS = {
  rooms: 50, occ: 75, adr: 180, los: 2, vat: 20, share: 40, comm: 18, ofee: 0, mkt: 8, fee: 3, disc: 5, shift: 5,
  vatinc: true, cbase: 'inc',
};

// The page's own definitions, worked out by hand from the brief.
function model(o) {
  const v = { ...DEFAULTS, ...o };
  const adrEx = v.vatinc ? v.adr / (1 + v.vat / 100) : v.adr;
  const base = v.cbase === 'ex' ? adrEx : v.adr;
  const otaNet = (adrEx - (v.comm / 100) * base) * (1 - v.ofee / 100);
  const directNet = adrEx * (1 - v.disc / 100) * (1 - v.mkt / 100 - v.fee / 100);
  const gap = directNet - otaNet;
  const nights = v.rooms * 365 * (v.occ / 100);
  const otaNights = nights * v.share / 100;
  const dirNights = nights - otaNights;
  const moved = nights * v.shift / 100;
  return {
    adrEx, otaNet, directNet, gap, perStay: gap * v.los, nights, otaNights, dirNights, moved,
    otaRev: otaNights * otaNet, dirRev: dirNights * directNet,
    totalNow: otaNights * otaNet + dirNights * directNet,
    gain: moved * gap, point: nights * 0.01 * gap,
    beMkt: (1 - v.fee / 100 - otaNet / (adrEx * (1 - v.disc / 100))) * 100,
    beComm: ((adrEx - directNet / (1 - v.ofee / 100)) / base) * 100,
  };
}

const gbp = (n, dp = 0) => {
  const r = Math.round((Math.abs(n) + 1e-9) * 10 ** dp) / 10 ** dp;
  return '£' + r.toLocaleString('en-GB', { minimumFractionDigits: dp, maximumFractionDigits: dp });
};
// Parse "+£4.59", "-£11.43", "£3,141" back to a number.
const parse = (t) => {
  const neg = t.trim().startsWith('-');
  return (neg ? -1 : 1) * parseFloat(t.replace(/[^0-9.]/g, ''));
};

const txt = async (page, id) => (await page.locator('#' + id).innerText()).trim();

async function setAll(page, o) {
  for (const [k, v] of Object.entries(o)) {
    if (k === 'vatinc') await page.locator('#vatinc').setChecked(!!v);
    else if (k === 'cbase') await page.locator('#cbase').selectOption(v);
    else await setValue(page, '#' + k, v);
  }
}

const TAB_ORDER = ['rooms', 'occ', 'adr', 'los', 'vatinc', 'vat', 'cbase', 'share', 'comm', 'ofee', 'mkt', 'fee', 'disc', 'shift'];
const TEXT_IDS = ['rooms', 'occ', 'adr', 'los', 'vat', 'share', 'comm', 'ofee', 'mkt', 'fee', 'disc', 'shift'];

test.describe('Hotel direct vs OTA calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('#res-ota-net')).not.toHaveText('--');
  });

  test.describe('default maths (ex VAT, commission on the VAT-inclusive price)', () => {
    test('net per night, gap and gap per stay match the hand calculation', async ({ page }) => {
      // ADR ex VAT 180 / 1.2 = 150. OTA = 150 - 0.18 x 180 = 117.60. Direct = 150 x 0.95 x 0.89 = 126.825.
      await expect(page.locator('#res-ota-net')).toHaveText('£117.60');
      await expect(page.locator('#res-direct-net')).toHaveText('£126.83');
      await expect(page.locator('#res-gap-night')).toHaveText('+£9.23');
      await expect(page.locator('#res-gap-stay')).toHaveText('+£18.45');
    });

    test('annual room nights, gain and value of one point', async ({ page }) => {
      const m = model({});
      expect(m.nights).toBeCloseTo(13687.5, 6);
      await expect(page.locator('#res-nights')).toHaveText('13,688');
      // 684.375 nights x 9.225 = 6,313 a year; one point = 136.875 x 9.225 = 1,263
      expect(Math.abs(parse(await txt(page, 'res-gain')) - 6313)).toBeLessThan(2);
      await expect(page.locator('#res-gain')).toHaveText('+' + gbp(m.gain));
      expect(Math.abs(parse(await txt(page, 'res-point')) - 1263)).toBeLessThan(2);
      await expect(page.locator('#res-point')).toHaveText('+' + gbp(m.point));
    });

    test('before and after table splits nights and revenue by channel', async ({ page }) => {
      const m = model({});
      await expect(page.locator('#tb-ota-nights-now')).toHaveText('5,475');
      await expect(page.locator('#tb-dir-nights-now')).toHaveText('8,213');
      await expect(page.locator('#tb-ota-nights-after')).toHaveText('4,791');
      await expect(page.locator('#tb-dir-nights-after')).toHaveText('8,897');
      await expect(page.locator('#tb-ota-net-now')).toHaveText('£643,860');
      await expect(page.locator('#tb-dir-net-now')).toHaveText('£1,041,550');
      await expect(page.locator('#tb-total-now')).toHaveText('£1,685,410');
      await expect(page.locator('#tb-total-after')).toHaveText(gbp(m.totalNow + m.gain));
      await expect(page.locator('#hv-table caption')).toContainText('ex VAT');
    });

    test('a different set of inputs follows the formulas', async ({ page }) => {
      const o = { rooms: 120, occ: 82, adr: 245, los: 3, share: 55, comm: 20, mkt: 11, fee: 2.5, disc: 10, shift: 8, ofee: 1.5, vat: 15 };
      await setAll(page, o);
      const m = model(o);
      await expect(page.locator('#res-ota-net')).toHaveText(gbp(m.otaNet, 2));
      await expect(page.locator('#res-direct-net')).toHaveText(gbp(m.directNet, 2));
      await expect(page.locator('#res-gain')).toHaveText((m.gain >= 0 ? '+' : '-') + gbp(m.gain));
      await expect(page.locator('#res-nights')).toHaveText(Math.round(m.nights).toLocaleString('en-GB'));
    });

    test('result labels say ex VAT', async ({ page }) => {
      await expect(page.locator('#res-ota-net').locator('xpath=preceding-sibling::div')).toContainText('ex VAT');
      await expect(page.locator('#res-direct-net').locator('xpath=preceding-sibling::div')).toContainText('ex VAT');
    });
  });

  test.describe('VAT, commission base and OTA-side fees', () => {
    test('VAT switched off reproduces the figures without any VAT adjustment', async ({ page }) => {
      await page.locator('#vatinc').uncheck();
      await expect(page.locator('#res-ota-net')).toHaveText('£147.60');
      await expect(page.locator('#res-direct-net')).toHaveText('£152.19');
      await expect(page.locator('#res-gap-night')).toHaveText('+£4.59');
      await expect(page.locator('#res-gap-stay')).toHaveText('+£9.18');
      expect(Math.abs(parse(await txt(page, 'res-gain')) - 3141)).toBeLessThan(2);
      expect(Math.abs(parse(await txt(page, 'res-point')) - 628)).toBeLessThan(2);
      await expect(page.locator('#vat')).toBeDisabled();
      await expect(page.locator('#cbase')).toBeDisabled();
    });

    test('a VAT rate of zero also reproduces the no-VAT figures', async ({ page }) => {
      await page.locator('#vat').fill('0');
      await expect(page.locator('#res-ota-net')).toHaveText('£147.60');
      await expect(page.locator('#res-direct-net')).toHaveText('£152.19');
    });

    test('commission on the price excluding VAT: 150 x 0.82 = 123.00', async ({ page }) => {
      await page.locator('#cbase').selectOption('ex');
      await expect(page.locator('#res-ota-net')).toHaveText('£123.00');
      await expect(page.locator('#res-direct-net')).toHaveText('£126.83');
      await expect(page.locator('#res-gap-night')).toHaveText('+£3.83');
      await expect(page.locator('#res-gap-stay')).toHaveText('+£7.65');
    });

    test('a different VAT rate changes the ex-VAT rate', async ({ page }) => {
      await page.locator('#vat').fill('5');
      const m = model({ vat: 5 });
      await expect(page.locator('#res-ota-net')).toHaveText(gbp(m.otaNet, 2));
      await expect(page.locator('#res-direct-net')).toHaveText(gbp(m.directNet, 2));
    });

    test('OTA-side fees reduce OTA net: (150 - 32.40) x 0.95 = 111.72', async ({ page }) => {
      await page.locator('#ofee').fill('5');
      await expect(page.locator('#res-ota-net')).toHaveText('£111.72');
      await expect(page.locator('#res-direct-net')).toHaveText('£126.83');
      await expect(page.locator('#res-gap-night')).toHaveText(gbp(model({ ofee: 5 }).gap, 2).replace('£', '+£'));
    });

    test('OTA-side fees default to zero and carry a hint', async ({ page }) => {
      await expect(page.locator('#ofee')).toHaveValue('0');
      await expect(page.locator('#ofee-hint')).toContainText('channel manager');
    });

    test('the commission-base hint does not state what any OTA does', async ({ page }) => {
      const hint = await txt(page, 'cbase-hint');
      expect(hint).toMatch(/varies/i);
      expect(hint).toMatch(/contract/i);
      expect(hint).not.toMatch(/Booking\.com|Expedia/);
    });

    test('the VAT rate hint names the UK standard rate and carries no tax year', async ({ page }) => {
      await expect(page.locator('#vat')).toHaveValue('20');
      await expect(page.locator('#vat-hint')).toContainText('UK standard rate on hotel rooms is 20%');
      const all = (await page.locator('#section-inputs').innerText()) + (await page.locator('.hv-method').innerText());
      expect(all).not.toMatch(/20\d\d-\d\d/);
      expect(all).not.toMatch(/tax year/i);
    });

    test('with VAT off the results drop the ex VAT wording and it returns when VAT is on', async ({ page }) => {
      const section = page.locator('#section-results');
      await expect(section).toContainText('ex VAT');
      await page.locator('#vatinc').uncheck();
      await expect(page.locator('#res-ota-net')).toHaveText('£147.60');
      const text = await section.innerText();
      expect(text).not.toMatch(/ex VAT/i);
      expect(text).not.toMatch(/after VAT/);
      expect(text).toContain('OTA net per night');
      expect(text).toContain('Direct nets more than OTA');
      await expect(page.locator('#hv-chart svg')).not.toHaveAttribute('aria-label', /VAT/);
      expect(await page.locator('#hv-chart svg text').allInnerTexts().then((t) => t.join(' '))).not.toMatch(/VAT/);
      // and in the less-than and level verdicts
      await page.locator('#disc').fill('30');
      await expect(page.locator('#verdict')).toContainText('Direct nets less than OTA');
      expect(await txt(page, 'verdict')).not.toMatch(/VAT/);
      await page.locator('#vatinc').check();
      await expect(section).toContainText('ex VAT');
      await expect(page.locator('#verdict')).toContainText('ex VAT');
    });

    test('with VAT off the level verdict has no ex VAT wording either', async ({ page }) => {
      await page.locator('#vatinc').uncheck();
      await setAll(page, { comm: 10, disc: 0, mkt: 7, fee: 3 });
      await expect(page.locator('#verdict')).toContainText('Level with the OTAs');
      expect(await txt(page, 'verdict')).not.toMatch(/VAT/);
    });

    test('the VAT switch is a labelled switch, on by default, at least 44px to tap', async ({ page }) => {
      await expect(page.locator('#vatinc')).toBeChecked();
      const h = await page.evaluate(() => document.querySelector('label[for="vatinc"]').getBoundingClientRect().height);
      expect(h).toBeGreaterThanOrEqual(44);
      await expect(page.locator('label[for="vatinc"]')).toHaveText('ADR includes VAT');
    });
  });

  test.describe('break-even', () => {
    test('defaults: marketing 14.5% and commission 12.9% are shown as cards and in the verdict', async ({ page }) => {
      // 1 - 0.03 - 117.6 / (150 x 0.95) = 14.47%; (150 - 126.825) / 180 = 12.875%
      await expect(page.locator('#res-be-mkt')).toHaveText('14.5%');
      await expect(page.locator('#res-be-comm')).toHaveText('12.9%');
      await expect(page.locator('#verdict')).toContainText('Direct nets more than OTA');
      await expect(page.locator('#verdict')).toContainText('marketing stays below 14.5%');
      await expect(page.locator('#verdict')).toContainText('commission stays above 12.9%');
    });

    test('at the break-even marketing cost the channels net the same', async ({ page }) => {
      const be = model({}).beMkt;
      await page.locator('#mkt').fill(String(be));
      expect(Math.abs(parse(await txt(page, 'res-gap-night')))).toBeLessThan(0.02);
    });

    test('at the break-even commission the channels net the same', async ({ page }) => {
      const be = model({}).beComm;
      await page.locator('#comm').fill(String(be));
      expect(Math.abs(parse(await txt(page, 'res-gap-night')))).toBeLessThan(0.02);
    });

    test('break-even follows the VAT and fee inputs', async ({ page }) => {
      const o = { ofee: 4, cbase: 'ex', disc: 8 };
      await setAll(page, o);
      const m = model(o);
      await expect(page.locator('#res-be-mkt')).toHaveText((Math.round(m.beMkt * 10) / 10) + '%');
      await expect(page.locator('#res-be-comm')).toHaveText((Math.round(m.beComm * 10) / 10) + '%');
    });

    test('when marketing alone cannot fix it, the card says so', async ({ page }) => {
      await setAll(page, { comm: 5, disc: 10, mkt: 0, fee: 3 });
      await expect(page.locator('#res-be-mkt')).toHaveText('Not reachable');
      await expect(page.locator('#res-be-comm')).toHaveText(/%$/);
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
      expect(Math.abs(parse(await txt(page, 'res-gap-stay')) - 9.225 * 2.5)).toBeLessThan(0.02);
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
      // 100% commission on the VAT-inclusive 180 is 180, more than the 150 ex VAT the hotel receives
      await expect(page.locator('#res-ota-net')).toHaveText('-£30.00');
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
      // 1200 / 1.2 = 1000; 1000 - 0.18 x 1200 = 784
      await expect(page.locator('#res-ota-net')).toHaveText('£784.00');
      await page.locator('#occ').click();
      await expect(page.locator('#adr')).toHaveValue('1200');
    });

    test('shift larger than the OTA share is capped in the maths and says so', async ({ page }) => {
      await page.locator('#shift').fill('60');
      await expect(page.locator('#shift-note')).toContainText('Maximum is 40');
      await expect(page.locator('#shift-note')).toContainText('using 40');
      const m = model({ shift: 40 });
      await expect(page.locator('#res-gain')).toHaveText('+' + gbp(m.gain));
      await expect(page.locator('#tb-ota-nights-after')).toHaveText('0');
    });

    test('money is formatted with the sign before the symbol and separators', async ({ page }) => {
      await page.locator('#disc').fill('20');
      // direct = 150 x 0.8 x 0.89 = 106.80 vs 117.60: gap -10.80
      await expect(page.locator('#res-gap-night')).toHaveText('-£10.80');
      const gain = await txt(page, 'res-gain');
      expect(gain).toMatch(/^-£\d{1,3}(,\d{3})*$/);
    });
  });

  test.describe('direct nets less than OTA', () => {
    test('says so plainly, names the input doing it and both break-even points', async ({ page }) => {
      await page.locator('#disc').fill('15');
      const verdict = page.locator('#verdict');
      const m = model({ disc: 15 });
      await expect(verdict).toContainText('Direct nets less than OTA');
      await expect(verdict).toContainText('less per room night');
      await expect(verdict).toContainText('direct booking discount');
      await expect(verdict).toContainText('OTA commission rose to ' + (Math.round(m.beComm * 10) / 10) + '%');
      await expect(verdict).toContainText('marketing cost fell to ' + (Math.round(m.beMkt * 10) / 10) + '%');
      await expect(page.locator('#res-gap-night')).toHaveText('-' + gbp(m.gap, 2));
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
      await setAll(page, { cbase: 'ex', comm: 10, disc: 0, mkt: 7, fee: 3 });
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
      '100% commission on ex VAT price': { comm: 100, cbase: 'ex' },
      '100% discount': { disc: 100 },
      '100% marketing': { mkt: 100 },
      '100% OTA-side fees': { ofee: 100 },
      '100% VAT': { vat: 100 },
      'VAT off with 100% fees': { vatinc: false, ofee: 100 },
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

    test('zero rooms keeps the per-night comparison and says only the annual figures need rooms', async ({ page }) => {
      await page.locator('#rooms').fill('0');
      await expect(page.locator('#res-ota-net')).toHaveText('£117.60');
      await expect(page.locator('#res-gap-night')).toHaveText('+£9.23');
      await expect(page.locator('#verdict')).toContainText('Direct nets more than OTA');
      await expect(page.locator('#verdict')).toContainText('Enter rooms and occupancy');
      await expect(page.locator('#verdict')).toContainText('does not need them');
      await expect(page.locator('#verdict')).not.toContainText('Nothing to compare yet');
      await expect(page.locator('#res-gain')).toHaveText('Needs rooms and occupancy');
      await expect(page.locator('#res-be-mkt')).toHaveText('14.5%');
      await expect(page.locator('#hv-chart svg')).toHaveCount(1);
    });

    test('with no OTA nights the verdict says there is nothing to move and the per-point card shows a dash', async ({ page }) => {
      await page.locator('#share').fill('0');
      await expect(page.locator('#verdict')).toContainText('There are no OTA room nights to move');
      await expect(page.locator('#verdict')).not.toContainText('Set a shift above zero');
      await expect(page.locator('#verdict')).not.toContainText('One point of room nights is worth');
      await expect(page.locator('#res-point')).toHaveText('-');
      await expect(page.locator('#res-gain')).toHaveText('£0');
      // the per-night comparison is unaffected
      await expect(page.locator('#res-gap-night')).toHaveText('+£9.23');
    });

    test('a zero shift with OTA nights still shows what one point is worth', async ({ page }) => {
      await page.locator('#shift').fill('0');
      await expect(page.locator('#verdict')).toContainText('Set a shift above zero');
      await expect(page.locator('#res-point')).toHaveText('+' + gbp(model({}).point));
      await page.locator('#share').fill('0');
      await expect(page.locator('#res-point')).toHaveText('-');
      await page.locator('#share').fill('40');
      await expect(page.locator('#res-point')).toHaveText('+' + gbp(model({}).point));
    });

    test('zero occupancy behaves the same way', async ({ page }) => {
      await page.locator('#occ').fill('0');
      await expect(page.locator('#res-direct-net')).toHaveText('£126.83');
      await expect(page.locator('#verdict')).toContainText('does not need them');
      await expect(page.locator('#res-point')).toHaveText('Needs rooms and occupancy');
    });

    test('a zero rate is the only case that says there is nothing to compare', async ({ page }) => {
      await page.locator('#adr').fill('0');
      await expect(page.locator('#verdict')).toContainText('Nothing to compare yet');
      await expect(page.locator('#verdict')).toContainText('average daily rate');
    });

    test('blank fields are treated as zero and noted once left', async ({ page }) => {
      await page.locator('#rooms').fill('');
      await page.locator('#occ').click();
      await expect(page.locator('#rooms-note')).toHaveText('Blank - using 0.');
      await expect(page.locator('#verdict')).toContainText('Enter rooms and occupancy');
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
          small: e.classList.contains('hv-small'),
        }));
      });
      for (const c of checks) {
        expect(c.over, c.id + ' overflows its card').toBe(false);
        if (!c.small) {
          expect(c.ws, c.id).toBe('nowrap');
          expect(c.lines, c.id + ' wraps').toBeLessThanOrEqual(1);
        }
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
      await expect(page.locator('#res-ota-net')).toHaveText('$117.60');
      await expect(page.locator('.hv-sym').first()).toHaveText('$');
      await expect(page.locator('#tb-total-now')).toHaveText(/^\$/);
      await page.locator('#currency-select').selectOption('EUR');
      await expect(page.locator('#res-direct-net')).toHaveText('€126.83');
      await expect(page.locator('#hv-chart svg')).toHaveAttribute('aria-label', /€117\.60/);
    });
  });

  test.describe('URL state', () => {
    test('inputs are written to the URL and a link reproduces the result', async ({ page }) => {
      await setAll(page, { rooms: 80, adr: 210, comm: 17.5, shift: 7, ofee: 2, vat: 12.5 });
      await page.locator('#cbase').selectOption('ex');
      await page.locator('#currency-select').selectOption('EUR');
      await expect.poll(() => page.url()).toContain('rooms=80');
      const url = new globalThis.URL(page.url());
      expect(url.searchParams.get('adr')).toBe('210');
      expect(url.searchParams.get('comm')).toBe('17.5');
      expect(url.searchParams.get('ofee')).toBe('2');
      expect(url.searchParams.get('vat')).toBe('12.5');
      expect(url.searchParams.get('cbase')).toBe('ex');
      expect(url.searchParams.get('vatinc')).toBe('1');
      expect(url.searchParams.get('cur')).toBe('EUR');
      const gain = await txt(page, 'res-gain');
      await page.goto(url.pathname + url.search);
      await expect(page.locator('#rooms')).toHaveValue('80');
      await expect(page.locator('#comm')).toHaveValue('17.5');
      await expect(page.locator('#ofee')).toHaveValue('2');
      await expect(page.locator('#cbase')).toHaveValue('ex');
      await expect(page.locator('#currency-select')).toHaveValue('EUR');
      await expect(page.locator('#res-gain')).toHaveText(gain);
    });

    test('the VAT switch is kept in the URL', async ({ page }) => {
      await page.locator('#vatinc').uncheck();
      await expect.poll(() => page.url()).toContain('vatinc=0');
      await page.reload();
      await expect(page.locator('#vatinc')).not.toBeChecked();
      await expect(page.locator('#res-ota-net')).toHaveText('£147.60');
    });

    test('the typed shift stays in the URL even when a 0% OTA share caps it to zero', async ({ page }) => {
      await page.locator('#share').fill('0');
      await expect.poll(() => new globalThis.URL(page.url()).searchParams.get('share')).toBe('0');
      const p = new globalThis.URL(page.url()).searchParams;
      expect(p.get('shift')).toBe('5');
      // The maths still uses the cap
      await expect(page.locator('#res-gain')).toHaveText('£0');
      await expect(page.locator('#shift-note')).toContainText('Maximum is 0');
      // And the box keeps what was typed after the user leaves it
      await page.locator('#shift').fill('7');
      await page.locator('#occ').click();
      await expect(page.locator('#shift')).toHaveValue('7');
      expect(new globalThis.URL(page.url()).searchParams.get('shift')).toBe('7');
      // Raising the OTA share again lets the typed shift through
      await page.locator('#share').fill('40');
      await expect(page.locator('#shift-note')).toBeHidden();
      await expect(page.locator('#res-gain')).toHaveText('+' + gbp(model({ shift: 7 }).gain));
    });

    test('an over-range typed value stays as typed in the URL and is clamped only in the maths', async ({ page }) => {
      await page.locator('#comm').fill('150');
      await expect.poll(() => new globalThis.URL(page.url()).searchParams.get('comm')).toBe('150');
      await page.goto('/hotel-direct-vs-ota/' + new globalThis.URL(page.url()).search);
      await expect(page.locator('#comm-note')).toContainText('Maximum is 100');
      await expect(page.locator('#res-ota-net')).toHaveText('-£30.00');
    });

    test('an out-of-range value in the URL is capped with a note', async ({ page }) => {
      await page.goto(URL + '?comm=150&adr=abc');
      await expect(page.locator('#comm-note')).toContainText('Maximum is 100');
      await expect(page.locator('#adr')).toHaveValue('180');
    });

    test('no cookies or local storage are written', async ({ page }) => {
      await setAll(page, { rooms: 77, adr: 199 });
      await page.locator('#currency-select').selectOption('USD');
      await page.locator('#vatinc').uncheck();
      const stored = await page.evaluate(() => ({
        cookie: document.cookie, local: localStorage.length, session: sessionStorage.length,
      }));
      expect(stored).toEqual({ cookie: '', local: 0, session: 0 });
    });
  });

  test.describe('tool events (real helper, via window.dataLayer)', () => {
    test('tool_calculated fires once after the first real change and not on load; tool_shared on copy link', async ({ browser }) => {
      const context = await browser.newContext();
      await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://127.0.0.1:4173' });
      const page = await context.newPage();
      await page.route(/googletagmanager\.com/, (r) => r.abort());
      const events = () => page.evaluate(() => (window.dataLayer || []).filter((e) => e && /^tool_/.test(e.event)).map((e) => e.event));
      await page.goto(URL);
      await expect(page.locator('#res-ota-net')).not.toHaveText('--');
      await page.waitForTimeout(1200);
      expect(await events()).toEqual([]);
      await page.locator('#rooms').click();
      await page.locator('#rooms').pressSequentially('120');
      await page.locator('#adr').fill('199');
      await expect.poll(events).toEqual(['tool_calculated']);
      await page.locator('#occ').fill('70');
      await page.waitForTimeout(1200);
      expect(await events()).toEqual(['tool_calculated']);
      await page.locator('#copy-link').click();
      await expect.poll(events).toEqual(['tool_calculated', 'tool_shared']);
      const shared = await page.evaluate(() => window.dataLayer.find((e) => e.event === 'tool_shared'));
      expect(shared.tool).toBe('hotel-direct-vs-ota');
      expect(shared.method).toBe('copy_link');
      await context.close();
    });

    test('toggling the VAT switch counts as a real change', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.route(/googletagmanager\.com/, (r) => r.abort());
      await page.goto(URL);
      await expect(page.locator('#res-ota-net')).not.toHaveText('--');
      await page.locator('#vatinc').uncheck();
      await expect.poll(() => page.evaluate(() => (window.dataLayer || []).filter((e) => /^tool_/.test(e.event || '')).map((e) => e.event))).toEqual(['tool_calculated']);
      await context.close();
    });

    test('the Work with me link sends tool_cta_click', async ({ browser }) => {
      const context = await browser.newContext();
      const page = await context.newPage();
      await page.route(/googletagmanager\.com/, (r) => r.abort());
      await page.goto(URL);
      await page.evaluate(() => document.querySelector('a[data-tool-cta]').addEventListener('click', (e) => e.preventDefault()));
      await page.locator('a[data-tool-cta]').click();
      expect(await page.evaluate(() => window.dataLayer.map((e) => e.event))).toContain('tool_cta_click');
      await context.close();
    });

    test('the page works when window.toolEvent does not exist', async ({ page, pageErrors }) => {
      await page.route(/tool-events\.js/, (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
      await page.goto(URL);
      expect(await page.evaluate(() => typeof window.toolEvent)).toBe('undefined');
      await page.locator('#adr').fill('199');
      await page.locator('#copy-link').click();
      await page.waitForTimeout(1000);
      await expect(page.locator('#res-ota-net')).toHaveText(gbp(model({ adr: 199 }).otaNet, 2));
      expect(pageErrors).toEqual([]);
    });
  });

  test.describe('structure and accessibility', () => {
    test('every input has a visible label tied by for, and is at least 44px tall', async ({ page }) => {
      for (const id of [...TEXT_IDS, 'cbase', 'currency-select']) {
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
      for (const id of [...TEXT_IDS, 'cbase']) {
        await expect(page.locator('#' + id)).toHaveAttribute('aria-describedby', id + '-hint ' + id + '-note');
      }
    });

    test('tab order follows the page: currency, then the controls in order, then copy link', async ({ page }) => {
      await page.locator('#currency-select').focus();
      const seen = [];
      for (let i = 0; i < TAB_ORDER.length + 1; i++) {
        await page.keyboard.press('Tab');
        seen.push(await page.evaluate(() => document.activeElement.id));
      }
      expect(seen).toEqual([...TAB_ORDER, 'copy-link']);
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

    test('the Work with me line sits directly below the results section, and the hub links are wired', () => {
      const src = fs.readFileSync(path.join(__dirname, '..', '..', 'hotel-direct-vs-ota.html'), 'utf8');
      expect(src).toMatch(/<\/div>\n\{% include tool-cta\.html text="[^"]+that is what I do\." %\}\n/);
      expect(src.indexOf('id="section-results"')).toBeLessThan(src.indexOf('include tool-cta'));
      expect(src).not.toMatch(/<!-- tool-cta -->/);
      expect(src).toMatch(/---\n\n<script src="\/js\/tool-events\.js" defer><\/script>\n/);
      expect(src).toMatch(/<p class="text-muted small mb-4 tool-more"><a href="\/tools\/">More tools<\/a><\/p>\n\n<!-- Latest Writing -->/);
    });

    test('the built page shows the Work with me line and the More tools link', async ({ page }) => {
      await expect(page.locator('aside.tool-cta a[href="/work-with-me/"]')).toBeVisible();
      await expect(page.locator('aside.tool-cta')).toContainText('that is what I do.');
      await expect(page.locator('.tool-more a[href="/tools/"]')).toBeVisible();
    });

    test('front matter carries the tool fields', () => {
      const src = fs.readFileSync(path.join(__dirname, '..', '..', 'hotel-direct-vs-ota.html'), 'utf8');
      const fm = src.split('---')[1];
      for (const key of ['layout: page', 'permalink: /hotel-direct-vs-ota/', 'hidden: true', 'sitemap: true', 'tool: true', 'tool_group: business', 'tool_order: 6', 'header-img: "img/home-bg.jpg"']) {
        expect(fm).toContain(key);
      }
      expect(fm).toMatch(/tool_summary: ".+"/);
      expect(fm.match(/meta-description: "(.+)"/)[1].length).toBeLessThan(155);
    });

    test('how this works lists the formulas and the caveats', async ({ page }) => {
      const t = await page.locator('.hv-method').innerText();
      for (const s of ['ADR / (1 + VAT rate)', '(ADR ex VAT - commission) x (1 - OTA-side fees)',
        'ADR ex VAT x (1 - discount) x (1 - marketing - fees)', 'rooms x 365 x occupancy', 'Break-even commission',
        'varies by OTA, by contract and by country',
        'billboard effect', 'Parity clauses', 'Cancellations and no-shows', 'lifetime value', 'Occupancy is fixed',
        'Extras and the blended marketing cost']) {
        expect(t).toContain(s);
      }
      expect(t).not.toContain('Other commissioned business');
      expect(t).not.toMatch(/if anything the model understates direct/i);
      expect(t).toContain('I would not assume the omissions cancel out');
    });

    test('the marketing hint says it is a blended cost and the next booking costs more', async ({ page }) => {
      const hint = await txt(page, 'mkt-hint');
      expect(hint).toMatch(/blended/i);
      expect(hint).toMatch(/next booking usually costs more/i);
    });

    test('the channel model is stated as two channels', async ({ page }) => {
      await expect(page.locator('#section-inputs')).toContainText('two channels only');
    });

    test('no uncaught errors and no dialogs', async ({ page, pageErrors, dialogs }) => {
      await setAll(page, { rooms: 0, adr: 'x', comm: 999 });
      await page.locator('#vatinc').uncheck();
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
          const t = (id) => Math.round(document.getElementById(id).getBoundingClientRect().top);
          const out = {};
          ['rooms', 'occ', 'adr', 'los', 'vat', 'cbase', 'share', 'comm', 'ofee', 'mkt', 'fee', 'disc'].forEach((id) => { out[id] = t(id); });
          return out;
        });
        expect(tops.rooms).toBe(tops.occ);
        expect(tops.adr).toBe(tops.los);
        expect(tops.share).toBe(tops.comm);
        expect(tops.mkt).toBe(tops.fee);
        if (width === 1280) {
          expect(tops.rooms).toBe(tops.adr);
          expect(tops.vat).toBe(tops.cbase);
          expect(tops.share).toBe(tops.ofee);
          expect(tops.mkt).toBe(tops.disc);
        }
      });
    }

    test('at 1280 the short-label rows reserve one line, not three: no empty gap above the fields', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 900 });
      const gaps = await page.evaluate(() => ['vat', 'cbase', 'share', 'comm', 'ofee', 'mkt', 'fee', 'disc', 'shift'].map((id) => {
        const label = document.querySelector('label[for="' + id + '"]').getBoundingClientRect();
        const field = document.getElementById(id).getBoundingClientRect();
        const input = (document.getElementById(id).closest('.input-group') || document.getElementById(id)).getBoundingClientRect();
        return { id, labelH: label.height, between: input.top - label.bottom, fieldH: field.height };
      }));
      for (const g of gaps) {
        expect(g.labelH, g.id + ' label should be a single line').toBeLessThan(20);
        expect(g.between, g.id).toBeLessThan(8);
      }
    });

    test('result and form labels are at least 12px', async ({ page }) => {
      for (const width of [360, 1280]) {
        await page.setViewportSize({ width, height: 900 });
        const sizes = await page.evaluate(() => Array.from(document.querySelectorAll('.result-label, .hv-inputs .form-label, .result-sub, .hv-table thead th, .hv-hint, .hv-note'))
          .map((e) => ({ cls: e.className + ':' + e.textContent.trim().slice(0, 20), px: parseFloat(getComputedStyle(e).fontSize) })));
        for (const s of sizes) expect(s.px, s.cls + ' @' + width).toBeGreaterThanOrEqual(12);
      }
    });

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
        expect(info.label).toContain('£117.60');
        expect(info.label).toContain('£126.83');
        expect(info.label).toContain('ex VAT');
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

    test('bar lengths follow the net per night as a share of ADR ex VAT', async ({ page }) => {
      const widths = await page.evaluate(() => Array.from(document.querySelectorAll('#hv-chart svg rect')).map((r) => parseFloat(r.getAttribute('width'))));
      // [track, ota bar, track, direct bar]
      expect(widths[1] / widths[0]).toBeCloseTo(117.6 / 150, 2);
      expect(widths[3] / widths[2]).toBeCloseTo(126.825 / 150, 2);
    });

    test('is left out when there is nothing to draw', async ({ page }) => {
      await page.locator('#adr').fill('0');
      await expect(page.locator('#hv-chart svg')).toHaveCount(0);
      await expect(page.locator('#res-ota-net')).toHaveText('£0.00');
    });
  });
});
