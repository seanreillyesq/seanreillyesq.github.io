const { test, expect, parseMoney, setValue } = require('../fixtures');


const URL = '/customer-economics/';

// Defaults on the page.
const BASE = { active: 10000, loyalty: 60, newCust: 5000, spend: 500 };

// The page's own growth model (calcCurrentState + calcGrowthScenario). The levers are applied to
// next year's starting base (this year's total), the same baseline as "If nothing changes".
function model({ loyaltyDelta = 0, newDelta = 0, spendDelta = 0 }) {
  const returning = Math.round(BASE.active * BASE.loyalty / 100);
  const total = returning + BASE.newCust;
  const revenue = total * BASE.spend;
  const nextReturning = Math.round(total * BASE.loyalty / 100);
  const nextRevenue = (nextReturning + BASE.newCust) * BASE.spend;
  const newLoyalty = Math.min(100, Math.max(0, BASE.loyalty + loyaltyDelta));
  const newNew = Math.max(0, BASE.newCust + newDelta);
  const newSpend = BASE.spend * (1 + spendDelta / 100);
  const projReturning = Math.round(total * newLoyalty / 100);
  const projected = (projReturning + newNew) * newSpend;
  return {
    revenue,
    baseRevenue: nextRevenue,
    projected,
    delta: projected - nextRevenue,
    growthPct: (projected - nextRevenue) / nextRevenue * 100,
    leverLoyalty: (projReturning + BASE.newCust) * BASE.spend - nextRevenue,
    leverNew: (nextReturning + newNew) * BASE.spend - nextRevenue,
    leverSpend: (nextReturning + BASE.newCust) * newSpend - nextRevenue,
  };
}

const money = async (page, id) => parseMoney(await page.locator('#' + id).innerText());
// Currency text is rounded to the pound (or to 0.1M above a million).
const tol = (v) => (Math.abs(v) >= 1e6 ? 0.06e6 : 1);

async function setLevers(page, { loyaltyDelta = 0, newDelta = 0, spendDelta = 0 }) {
  await setValue(page, '#loyalty-delta-val', loyaltyDelta);
  await setValue(page, '#new-delta-val', newDelta);
  await setValue(page, '#spend-delta-val', spendDelta);
}

test.describe('Customer economics', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('#res-projected')).not.toHaveText('--');
  });

  test('"if nothing changes" equals projected revenue with zero change', async ({ page }) => {
    const m = model({});
    expect(m.projected).toBe(m.baseRevenue);
    const headline = (await page.locator('#proj-revenue').innerText()).split(' (')[0];
    await expect(page.locator('#res-projected')).toHaveText(headline);
    await expect(page.locator('#res-projected')).toHaveText('£5.8M');
    expect(await money(page, 'res-projected')).toBe(m.baseRevenue);
    await expect(page.locator('#res-delta')).toHaveText('+£0');
    await expect(page.locator('#res-growth-pct')).toHaveText('+0.0%');
    for (const id of ['lever-loyalty', 'lever-new', 'lever-spend']) {
      await expect(page.locator('#' + id)).toHaveText('+£0');
    }
  });

  test('returning to zero change restores the baseline after moving the levers', async ({ page }) => {
    await setLevers(page, { loyaltyDelta: 12, newDelta: 1000, spendDelta: 20 });
    await expect(page.locator('#res-delta')).not.toHaveText('+£0');
    await setLevers(page, {});
    await expect(page.locator('#res-projected')).toHaveText('£5.8M');
    await expect(page.locator('#res-delta')).toHaveText('+£0');
    await expect(page.locator('#res-growth-pct')).toHaveText('+0.0%');
  });

  test('baseline matches the inputs', async ({ page }) => {
    await expect(page.locator('#res-returning')).toHaveText('6,000');
    await expect(page.locator('#res-total')).toHaveText('11,000');
    await expect(page.locator('#res-revenue')).toHaveText('£5.5M');
  });

  test.describe('the same percentage change on each lever', () => {
    // pct is applied to the lever's own base: loyalty 60 -> pp, new 5000 -> customers, spend 500 -> %.
    for (const pct of [10, -10, 20, -20]) {
      const lev = {
        loyaltyDelta: BASE.loyalty * pct / 100,
        newDelta: BASE.newCust * pct / 100,
        spendDelta: pct,
      };
      const direction = pct > 0 ? 'up' : 'down';

      for (const [name, key, field, out] of [
        ['loyalty', 'loyaltyDelta', 'leverLoyalty', 'lever-loyalty'],
        ['new customers', 'newDelta', 'leverNew', 'lever-new'],
        ['spend per customer', 'spendDelta', 'leverSpend', 'lever-spend'],
      ]) {
        test(`${pct > 0 ? '+' : ''}${pct}% on ${name} moves its effect ${direction}`, async ({ page }) => {
          await setLevers(page, { [key]: lev[key] });
          const expected = model({ [key]: lev[key] });
          const shown = await money(page, out);
          expect(Math.sign(shown)).toBe(Math.sign(pct));
          expect(Math.abs(shown - expected[field])).toBeLessThanOrEqual(tol(expected[field]));
          // Projected revenue with a single lever moved equals the lever effect added to the baseline.
          expect(Math.abs(await money(page, 'res-delta') - expected.delta)).toBeLessThanOrEqual(tol(expected.delta));
        });
      }

      test(`${pct > 0 ? '+' : ''}${pct}% on all three levers: projected revenue, delta and growth follow the formula`, async ({ page }) => {
        await setLevers(page, lev);
        const e = model(lev);
        expect(Math.abs(await money(page, 'res-projected') - e.projected)).toBeLessThanOrEqual(tol(e.projected));
        expect(Math.abs(await money(page, 'res-delta') - e.delta)).toBeLessThanOrEqual(tol(e.delta));
        const growth = parseFloat((await page.locator('#res-growth-pct').innerText()).replace('%', ''));
        expect(growth).toBeCloseTo(e.growthPct, 1);
        expect(Math.sign(growth)).toBe(Math.sign(pct));
        // Each lever card shows that lever's effect on its own.
        for (const [field, out] of [['leverLoyalty', 'lever-loyalty'], ['leverNew', 'lever-new'], ['leverSpend', 'lever-spend']]) {
          expect(Math.abs(await money(page, out) - e[field])).toBeLessThanOrEqual(tol(e[field]));
        }
        // The levers interact multiplicatively, so the single-lever effects do not add up to the delta.
        expect(Math.abs(e.delta - (e.leverLoyalty + e.leverNew + e.leverSpend))).toBeGreaterThan(1000);
      });
    }

    test('the sliders and the number boxes stay in step', async ({ page }) => {
      await page.locator('#spend-delta').fill('30');
      await expect(page.locator('#spend-delta-val')).toHaveValue('30');
      await setValue(page, '#spend-delta-val', 10);
      await expect(page.locator('#spend-delta')).toHaveValue('10');
      const e = model({ spendDelta: 10 });
      expect(Math.abs(await money(page, 'res-projected') - e.projected)).toBeLessThanOrEqual(tol(e.projected));
    });
  });

  test('at loyalty 100% the growth scenario still starts from the next-year baseline', async ({ page }) => {
    await page.goto(URL + '?loyalty=100');
    // 10,000 returning + 5,000 new = 15,000 this year; next year 15,000 returning + 5,000 new = 20,000
    const headline = (await page.locator('#proj-revenue').innerText()).split(' (')[0];
    await expect(page.locator('#res-projected')).toHaveText(headline);
    await expect(page.locator('#res-projected')).toHaveText('£10.0M');
    await expect(page.locator('#res-delta')).toHaveText('+£0');
    await expect(page.locator('#res-growth-pct')).toHaveText('+0.0%');
  });
});

// ---------------------------------------------------------------------------------------------
// Section 2 (allowable acquisition cost), formatting, inputs and layout
// ---------------------------------------------------------------------------------------------

// Any money text the page can show: "£5.5M", "-£2.8M", "+£300,000", "£2,000.0B".
function parseAmount(text) {
  const t = text.replace(/[£€$A,+\s]/g, '');
  const mult = /B$/.test(t) ? 1e9 : /M$/.test(t) ? 1e6 : 1;
  return parseFloat(t.replace(/[BM]$/, '')) * mult;
}

const text = async (page, id) => (await page.locator('#' + id).innerText()).trim();

// The page's own formulas for section 2 with the default inputs.
function unit({ bv = 500, cancel = 5, cogs = 30, fulfil = 15, margin = 20, repeat = 40, months = 24 } = {}) {
  const net = bv * (1 - cancel / 100);
  const allowable = net - net * cogs / 100 - net * fulfil / 100 - net * margin / 100;
  let repeatRevenue = 0;
  let cum = repeat / 100;
  const cycles = months / 12;
  for (let i = 1; i <= Math.floor(cycles); i++) { repeatRevenue += bv * cum; cum *= repeat / 100; }
  const frac = cycles - Math.floor(cycles);
  if (frac > 0) repeatRevenue += bv * cum * frac;
  const rNet = repeatRevenue * (1 - cancel / 100) * (1 - cogs / 100 - fulfil / 100 - margin / 100);
  const extAllowable = allowable + Math.max(0, rNet);
  return { allowable, extAllowable, implied: bv / allowable, extRoas: bv / extAllowable };
}

const WIDTHS = [360, 390, 1280];

async function open(page, query = '', width) {
  if (width) await page.setViewportSize({ width, height: 900 });
  await page.goto(URL + query);
  await expect(page.locator('#res-projected')).not.toHaveText('--');
}

test.describe('Customer economics: repeat purchases panel', () => {
  for (const [name, query] of [['a clean URL', ''], ['?ep=1', '?ep=1']]) {
    test(`the panel follows the checkbox from ${name}`, async ({ page }) => {
      await open(page, query);
      const panel = page.locator('#extended-inputs');
      const box = page.locator('#extended-payback');
      const startsOn = query !== '';
      await expect(box).toBeChecked({ checked: startsOn });
      await expect(panel).toBeVisible({ visible: startsOn });
      await box.click();
      await expect(box).toBeChecked({ checked: !startsOn });
      await expect(panel).toBeVisible({ visible: !startsOn });
      await box.click();
      await expect(box).toBeChecked({ checked: startsOn });
      await expect(panel).toBeVisible({ visible: startsOn });
      // Clicking the label text toggles it too
      await page.locator('.ce-check span').click();
      await expect(panel).toBeVisible({ visible: !startsOn });
    });
  }

  test('min first-order ROAS is the order value over the extended allowable cost', async ({ page }) => {
    await open(page, '?ep=1');
    const e = unit();
    await expect(page.locator('#res-extended-roas')).toHaveText(e.extRoas.toFixed(1) + 'x');
    await expect(page.locator('#res-extended-roas')).toHaveText('1.9x');
    await expect(page.locator('#res-roas')).toHaveText('3.0x');
    // The card says what the figure is
    await expect(page.locator('#extended-results')).toContainText(/first-order ROAS/i);
    await expect(page.locator('#ext-roas-note')).toContainText(/repeat purchases/i);
  });

  test('min first-order ROAS moves with the repeat rate and the horizon', async ({ page }) => {
    await open(page, '?ep=1');
    const seen = new Set();
    for (const [repeat, months] of [[40, 24], [60, 24], [20, 24], [40, 12], [40, 36], [80, 36]]) {
      await setValue(page, '#repeat-rate', repeat);
      await page.locator('#payback-months').selectOption(String(months));
      const e = unit({ repeat, months });
      await expect(page.locator('#res-extended-roas')).toHaveText(e.extRoas.toFixed(1) + 'x');
      await expect(page.locator('#res-extended-allowable')).toHaveText('£' + Math.round(e.extAllowable));
      seen.add(e.extRoas.toFixed(1));
    }
    expect(seen.size).toBeGreaterThanOrEqual(5);
  });
});

test.describe('Customer economics: inputs are not clamped silently', () => {
  const cases = [
    ['#loyalty-rate', '150', '100'],
    ['#loyalty-rate', '-20', '0'],
    ['#loyalty-rate', '', '0'],
    ['#cancel-rate', '250', '100'],
    ['#new-customers', '-5', '0'],
  ];
  for (const [sel, typed, shown] of cases) {
    test(`${sel} "${typed}" is written back as ${shown} when editing finishes`, async ({ page }) => {
      await open(page);
      const input = page.locator(sel);
      await input.fill(typed);
      // Not rewritten while the user is still typing
      await expect(input).toHaveValue(typed);
      await input.blur();
      await expect(input).toHaveValue(shown);
    });
  }

  test('loyalty typed as 150 computes the same as 100', async ({ page }) => {
    await open(page);
    await page.locator('#loyalty-rate').fill('150');
    await page.locator('#loyalty-rate').blur();
    await expect(page.locator('#res-returning')).toHaveText('10,000');
  });

  for (const typed of ['0', '', '-50']) {
    test(`an average order value of "${typed}" shows an enter-an-order-value state`, async ({ page }) => {
      await open(page);
      await page.locator('#avg-booking').fill(typed);
      await expect(page.locator('#cost-warning')).toBeVisible();
      await expect(page.locator('#cost-warning')).toContainText(/enter an order value/i);
      for (const id of ['res-allowable', 'res-roas', 'res-cost-pct']) {
        await expect(page.locator('#' + id)).toHaveText('--');
      }
      await page.locator('#avg-booking').blur();
      await expect(page.locator('#avg-booking')).toHaveValue('0');
      await expect(page.locator('#cost-waterfall svg')).toHaveCount(0);
      // And it recovers
      await page.locator('#avg-booking').fill('500');
      await expect(page.locator('#res-allowable')).toHaveText('£166');
      await expect(page.locator('#cost-warning')).toBeHidden();
    });
  }
});

test.describe('Customer economics: money formatting', () => {
  test('negative amounts put the sign before the currency symbol', async ({ page }) => {
    await open(page);
    // New customers -30% of 5,000 = -1,500 customers x GBP 500
    await setValue(page, '#new-delta-val', -1500);
    await expect(page.locator('#lever-new')).toHaveText('-£750,000');
    await expect(page.locator('#res-delta')).toHaveText('-£750,000');
    await setValue(page, '#new-delta-val', 0);
    await setValue(page, '#spend-delta-val', -50);
    await expect(page.locator('#res-delta')).toHaveText('-£2.9M');
    await expect(page.locator('#lever-spend')).toHaveText('-£2.9M');
    for (const id of ['res-delta', 'lever-spend', 'lever-new', 'lever-loyalty', 'res-projected']) {
      expect(await text(page, id)).not.toMatch(/£-|-\s*£\s*-/);
    }
  });

  test('a shrinking base shows the next-year change as (-£800,000)', async ({ page }) => {
    await open(page, '?loyalty=20&new=0');
    // 10,000 x 20% = 2,000 customers now, 400 next year, at GBP 500
    await expect(page.locator('#proj-revenue')).toHaveText('£200,000 (-£800,000)');
  });

  test('large values use B for billions and thousands separators', async ({ page }) => {
    await open(page, '?cust=999999&loyalty=100&new=999999&spend=999999');
    const rev = await text(page, 'res-revenue');
    expect(rev).toMatch(/^£[\d,]+\.\dB$/);
    expect(rev).not.toMatch(/\d{4,}/);
    expect(parseAmount(rev)).toBeCloseTo(1999998 * 999999, -9);
    expect(await text(page, 'res-projected')).toMatch(/^£[\d,]+\.\dB$/);
    // Millions still read as before
    await open(page);
    await expect(page.locator('#res-revenue')).toHaveText('£5.5M');
  });

  test('waterfall labels carry thousands separators', async ({ page }) => {
    await open(page, '?bv=50000', 1280);
    const labels = await page.locator('#cost-waterfall svg text').evaluateAll((els) => els.map((e) => e.textContent));
    expect(labels.length).toBeGreaterThan(0);
    for (const l of labels) expect(l).not.toMatch(/\d{4,}/);
    expect(labels).toContain('£14,250');
    await expect(page.locator('.waterfall-legend')).toContainText('£14,250');
  });
});

test.describe('Customer economics: no budget left', () => {
  for (const [name, query] of [
    ['a 100% cancel rate', '?cancel=100'],
    ['costs that add up to exactly 100%', '?cancel=0&cogs=50&fulfil=30&margin=20'],
    ['costs above 100%', '?cancel=0&cogs=60&fulfil=30&margin=20'],
  ]) {
    test(`${name} warns and says there is no budget`, async ({ page }) => {
      await open(page, query);
      await expect(page.locator('#cost-warning')).toBeVisible();
      await expect(page.locator('#cost-warning')).toContainText(/nothing left for marketing/i);
      await expect(page.locator('#res-allowable')).toHaveText('£0');
      await expect(page.locator('#res-roas')).toHaveText(/no budget/i);
      expect(await text(page, 'res-roas')).not.toMatch(/N\/A/);
    });
  }

  test('the warning clears once there is budget again', async ({ page }) => {
    await open(page, '?cancel=100');
    await setValue(page, '#cancel-rate', 5);
    await expect(page.locator('#cost-warning')).toBeHidden();
    await expect(page.locator('#res-roas')).toHaveText('3.0x');
  });
});

test.describe('Customer economics: new customer slider scale', () => {
  for (const nc of [50, 5000, 200000]) {
    test(`${nc} new customers: range is +/-100% of the input with a usable step`, async ({ page }) => {
      await open(page, `?new=${nc}`);
      const range = page.locator('#new-delta');
      const max = +(await range.getAttribute('max'));
      const min = +(await range.getAttribute('min'));
      const step = +(await range.getAttribute('step'));
      expect(max).toBeGreaterThanOrEqual(nc);
      expect(max).toBeLessThanOrEqual(nc * 1.25);
      expect(min).toBe(-max);
      expect(step).toBeGreaterThanOrEqual(1);
      expect(max / step).toBeGreaterThanOrEqual(50);
      expect(max / step).toBeLessThanOrEqual(200);
      expect(+(await page.locator('#new-delta-val').getAttribute('max'))).toBe(max);
      // The top of the range doubles the new customers: the effect is nc x spend
      await setValue(page, '#new-delta-val', max);
      const effect = await money(page, 'lever-new');
      expect(Math.abs(effect - max * 500)).toBeLessThanOrEqual(tol(effect));
    });
  }

  test('the scale follows the new-customers input', async ({ page }) => {
    await open(page);
    expect(await page.locator('#new-delta').getAttribute('max')).toBe('5000');
    await setValue(page, '#new-customers', 200000);
    expect(await page.locator('#new-delta').getAttribute('max')).toBe('200000');
    await setValue(page, '#new-customers', 50);
    expect(+(await page.locator('#new-delta').getAttribute('max'))).toBeLessThanOrEqual(100);
  });

  test('a small input still gets a minimum range', async ({ page }) => {
    await open(page, '?new=3');
    expect(+(await page.locator('#new-delta').getAttribute('max'))).toBeGreaterThanOrEqual(20);
  });
});

test.describe('Customer economics: chart and waterfall', () => {
  for (const width of WIDTHS) {
    test(`the chart legend sits inside the SVG at ${width}px`, async ({ page }) => {
      await open(page, '', width);
      const result = await page.evaluate(() => {
        const svg = document.getElementById('revenue-chart');
        const vb = svg.viewBox.baseVal;
        const texts = [...svg.querySelectorAll('text')].map((t) => {
          const b = t.getBBox();
          return { s: t.textContent, top: b.y, bottom: b.y + b.height, left: b.x, right: b.x + b.width };
        });
        return { w: vb.width, h: vb.height, texts };
      });
      const legend = result.texts.filter((t) => ['Returning', 'New / Reactivated'].includes(t.s));
      expect(legend).toHaveLength(2);
      for (const t of result.texts) {
        expect(t.top).toBeGreaterThanOrEqual(0);
        expect(t.bottom).toBeLessThanOrEqual(result.h);
        expect(t.left).toBeGreaterThanOrEqual(0);
        expect(t.right).toBeLessThanOrEqual(result.w);
      }
    });
  }

  for (const width of [360, 390]) {
    test(`chart and waterfall text renders at 11px or more at ${width}px`, async ({ page }) => {
      await open(page, '', width);
      const sizes = await page.evaluate(() => {
        const out = [];
        for (const svg of document.querySelectorAll('#revenue-chart, #cost-waterfall svg')) {
          const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
          for (const t of svg.querySelectorAll('text')) {
            out.push({ s: t.textContent, px: parseFloat(t.getAttribute('font-size')) * scale });
          }
        }
        return out;
      });
      expect(sizes.length).toBeGreaterThan(8);
      for (const t of sizes) expect(t.px, t.s).toBeGreaterThanOrEqual(10.95);
    });
  }

  test('the chart redraws at the new width after a resize', async ({ page }) => {
    await open(page, '', 1280);
    await page.setViewportSize({ width: 360, height: 900 });
    await expect.poll(async () => page.evaluate(() => {
      const svg = document.getElementById('revenue-chart');
      return (svg.getBoundingClientRect().width / svg.viewBox.baseVal.width) * 11;
    })).toBeGreaterThanOrEqual(10.95);
  });

  test('every waterfall segment, including cancels, is labelled with its value', async ({ page }) => {
    await open(page, '', 360);
    const legend = page.locator('.waterfall-legend');
    await expect(legend).toContainText('Cancels / Returns £25');
    await expect(legend).toContainText('COGS £143');
    await expect(legend).toContainText('Fulfilment £71');
    await expect(legend).toContainText('Margin £95');
    await expect(legend).toContainText('Allowable £166');
  });
});

test.describe('Customer economics: borders, layout and tap targets', () => {
  test('prefix-only groups keep their right border, suffix groups drop only the joined edge', async ({ page }) => {
    await open(page);
    const border = (sel) => page.locator(sel).evaluate((e) => {
      const c = getComputedStyle(e);
      return { l: c.borderLeftWidth, r: c.borderRightWidth };
    });
    expect((await border('#avg-spend')).r).toBe('1px');
    expect((await border('#avg-booking')).r).toBe('1px');
    expect((await border('#avg-spend')).l).toBe('0px');
    expect((await border('#loyalty-rate')).r).toBe('0px');
    expect((await border('#loyalty-rate')).l).toBe('1px');
  });

  for (const width of WIDTHS) {
    test(`number box and unit pill share a top in each growth row at ${width}px`, async ({ page }) => {
      await open(page, '', width);
      for (const id of ['loyalty-delta-val', 'new-delta-val', 'spend-delta-val']) {
        const box = await page.locator('#' + id).boundingBox();
        const pill = await page.locator('#' + id + ' ~ .input-group-text').boundingBox();
        expect(Math.abs(box.y - pill.y), id).toBeLessThanOrEqual(1);
        expect(Math.abs(box.height - pill.height), id).toBeLessThanOrEqual(1);
        // Side by side, touching
        expect(pill.x - (box.x + box.width), id).toBeLessThanOrEqual(1);
      }
    });

    test(`every control is at least 44px tall at ${width}px`, async ({ page }) => {
      await open(page, '?ep=1', width);
      const small = await page.evaluate(() => {
        const out = [];
        const scope = document.querySelectorAll('.ce-currency-row, #section-current, #section-unit-economics, #section-growth');
        for (const root of scope) {
          for (const c of root.querySelectorAll('input:not([type=checkbox]), select')) {
            const r = c.getBoundingClientRect();
            if (r.height < 43.5) out.push(c.id + ' ' + r.height);
          }
        }
        const label = document.querySelector('label.ce-check').getBoundingClientRect();
        if (label.height < 43.5) out.push('checkbox label ' + label.height);
        return out;
      });
      expect(small).toEqual([]);
      // The checkbox sits inside the label, so the label is the hit area
      await expect(page.locator('label.ce-check #extended-payback')).toHaveCount(1);
    });

    test(`inputs in a row line up even when their labels wrap at ${width}px`, async ({ page }) => {
      await open(page, '?ep=1', width);
      const top = async (sel) => (await page.locator(sel).boundingBox()).y;
      const wide = width >= 768;
      const rows = [
        wide ? ['#active-customers', '#loyalty-rate', '#new-customers', '#avg-spend'] : ['#active-customers', '#loyalty-rate'],
        ['#new-customers', '#avg-spend'],
        wide ? ['#avg-booking', '#cancel-rate', '#cogs-rate'] : ['#avg-booking', '#cancel-rate'],
        wide ? ['#fulfil-rate', '#margin-rate'] : ['#cogs-rate', '#fulfil-rate'],
        ['#payback-months', '#repeat-rate'],
      ];
      for (const row of rows) {
        const tops = [];
        for (const sel of row) tops.push(await top(sel));
        expect(Math.max(...tops) - Math.min(...tops), row.join(' ')).toBeLessThanOrEqual(1);
      }
      // Result values line up across a row of cards whatever their labels do
      for (const ids of [['res-allowable', 'res-roas', 'res-cost-pct'], ['res-extended-allowable', 'res-extended-roas'],
        ['res-projected', 'res-delta', 'res-growth-pct'], ['lever-loyalty', 'lever-new', 'lever-spend']]) {
        const tops = [];
        for (const id of ids) tops.push(await top('#' + id));
        expect(Math.max(...tops) - Math.min(...tops), ids.join(' ')).toBeLessThanOrEqual(1);
      }
    });
  }

  test('result labels are at least 12px', async ({ page }) => {
    for (const width of WIDTHS) {
      await open(page, '', width);
      const sizes = await page.evaluate(() => [...document.querySelectorAll('.result-label, .ce-projection-label')]
        .map((e) => parseFloat(getComputedStyle(e).fontSize)));
      expect(sizes.length).toBeGreaterThan(10);
      for (const px of sizes) expect(px).toBeGreaterThanOrEqual(12);
    }
  });

  test('labels in the repeat purchases panel match the other input labels', async ({ page }) => {
    await open(page, '?ep=1');
    const style = (sel) => page.locator(sel).evaluate((e) => {
      const c = getComputedStyle(e);
      return [c.fontSize, c.fontFamily, c.textTransform, c.letterSpacing].join('|');
    });
    const reference = await style('label[for=avg-booking]');
    expect(await style('label[for=repeat-rate]')).toBe(reference);
    expect(await style('label[for=payback-months]')).toBe(reference);
  });
});

test.describe('Customer economics: accessible names', () => {
  test('every control has a name', async ({ page }) => {
    await open(page, '?ep=1');
    const names = {
      '#currency-select': /currency/i,
      '#loyalty-delta': /loyalty/i,
      '#loyalty-delta-val': /loyalty/i,
      '#new-delta': /new customer/i,
      '#new-delta-val': /new customer/i,
      '#spend-delta': /spend/i,
      '#spend-delta-val': /spend/i,
      '#payback-months': /payback/i,
      '#repeat-rate': /repeat/i,
      '#extended-payback': /repeat purchases/i,
    };
    for (const [sel, name] of Object.entries(names)) {
      await expect(page.locator(sel), sel).toHaveAccessibleName(name);
    }
  });

  test('the charts are images with a description', async ({ page }) => {
    await open(page);
    for (const sel of ['#revenue-chart', '#cost-waterfall svg']) {
      await expect(page.locator(sel)).toHaveAttribute('role', 'img');
      expect((await page.locator(sel).getAttribute('aria-label')).length).toBeGreaterThan(20);
    }
    await expect(page.locator('#revenue-chart')).toHaveAttribute('aria-label', /£5\.8M/);
  });

  test('a polite live region reports the key results', async ({ page }) => {
    await open(page);
    const live = page.locator('[aria-live=polite]');
    await expect(live).toHaveCount(1);
    await expect(live).toContainText('Allowable cost £166');
    await expect(live).toContainText('Projected revenue £5.8M');
    await setValue(page, '#avg-booking', 1000);
    await expect(live).toContainText('Allowable cost £333');
  });
});

test.describe('Customer economics: review fixes', () => {
  for (const width of [360, 390]) {
    for (const [name, query, setup] of [
      ['-1,500 new customers', '', async (page) => { await setValue(page, '#new-delta-val', -1500); }],
      ['the billions case', '?cust=999999&loyalty=100&new=999999&spend=999999', async () => {}],
    ]) {
      test(`result values stay on one line with ${name} at ${width}px`, async ({ page }) => {
        await open(page, query, width);
        await setup(page);
        const bad = await page.evaluate(() => [...document.querySelectorAll('.result-value')].map((e) => {
          const cs = getComputedStyle(e);
          const line = parseFloat(cs.lineHeight) || parseFloat(cs.fontSize) * 1.2;
          const r = e.getBoundingClientRect();
          return { id: e.id, text: e.textContent, h: r.height, line, over: e.scrollWidth - e.clientWidth };
        }).filter((v) => v.h > v.line + 1 || v.over > 1));
        expect(bad).toEqual([]);
      });
    }
  }

  test('"No budget" stays on one line at 390px', async ({ page }) => {
    await open(page, '?cancel=100&ep=1', 390);
    for (const id of ['res-roas', 'res-extended-roas']) {
      await expect(page.locator('#' + id)).toHaveText('No budget');
      const h = await page.locator('#' + id).evaluate((e) => [e.getBoundingClientRect().height, parseFloat(getComputedStyle(e).lineHeight)]);
      expect(h[0]).toBeLessThanOrEqual(h[1] + 1);
    }
  });

  // Typed key by key, so the handler sees every partial value ("2.", "-", "-0.")
  for (const [typed, pct] of [['2.5', 2.5], ['-0.5', -0.5], ['-25', -25]]) {
    test(`typing ${typed} in the spend change box keeps what was typed and computes ${pct}%`, async ({ page }) => {
      await open(page);
      const box = page.locator('#spend-delta-val');
      await box.click();
      await box.fill('');
      await page.keyboard.type(typed);
      await expect(box).toHaveValue(typed);
      const expected = 5800000 * pct / 100;
      expect(Math.abs((await money(page, 'res-delta')) - expected)).toBeLessThanOrEqual(tol(expected) + 1);
      await box.blur();
      await expect(box).toHaveValue(typed);
    });
  }

  for (const [box, typed] of [['#loyalty-delta-val', '2.5'], ['#new-delta-val', '-0.5']]) {
    test(`typing ${typed} in ${box} is not rewritten mid-entry`, async ({ page }) => {
      await open(page);
      await page.locator(box).click();
      await page.locator(box).fill('');
      await page.keyboard.type(typed);
      await expect(page.locator(box)).toHaveValue(typed);
    });
  }

  test('the projected bar label is neutral at a zero delta, green up and red down', async ({ page }) => {
    await open(page);
    const fill = () => page.locator('#revenue-chart text', { hasText: /^£5\.\dM$|^£\d/ }).last().getAttribute('fill');
    expect(await fill()).toBe('#6B7280');
    await setValue(page, '#spend-delta-val', 10);
    await expect.poll(fill).toBe('#16a34a');
    await setValue(page, '#spend-delta-val', -10);
    await expect.poll(fill).toBe('#dc2626');
  });

  test('the explainer says the figure still hits your margin', async ({ page }) => {
    await open(page, '?ep=1');
    await expect(page.locator('#ext-roas-note')).toContainText('still hits your margin');
    await expect(page.locator('#ext-roas-note')).not.toContainText('pays back');
  });
});
