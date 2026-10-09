const { test, expect, parseMoney, setValue } = require('../fixtures');

const URL = '/customer-economics/';

// Defaults on the page.
const BASE = { active: 10000, loyalty: 60, newCust: 5000, spend: 500 };

// The page's own growth model (calcGrowthScenario).
function model({ loyaltyDelta = 0, newDelta = 0, spendDelta = 0 }) {
  const returning = Math.round(BASE.active * BASE.loyalty / 100);
  const baseRevenue = (returning + BASE.newCust) * BASE.spend;
  const newLoyalty = Math.min(100, Math.max(0, BASE.loyalty + loyaltyDelta));
  const newNew = Math.max(0, BASE.newCust + newDelta);
  const newSpend = BASE.spend * (1 + spendDelta / 100);
  const projReturning = Math.round(BASE.active * newLoyalty / 100);
  const projected = (projReturning + newNew) * newSpend;
  return {
    baseRevenue,
    projected,
    delta: projected - baseRevenue,
    growthPct: (projected - baseRevenue) / baseRevenue * 100,
    leverLoyalty: (projReturning + BASE.newCust) * BASE.spend - baseRevenue,
    leverNew: (returning + newNew) * BASE.spend - baseRevenue,
    leverSpend: (returning + BASE.newCust) * newSpend - baseRevenue,
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

  test('"if nothing changes" equals the inputs with zero change', async ({ page }) => {
    const m = model({});
    expect(m.projected).toBe(m.baseRevenue);
    await expect(page.locator('#res-revenue')).toHaveText(await page.locator('#res-projected').innerText());
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
    await expect(page.locator('#res-projected')).toHaveText(await page.locator('#res-revenue').innerText());
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
});
