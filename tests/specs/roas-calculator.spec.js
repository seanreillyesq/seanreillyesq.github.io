const { test, expect, setValue } = require('../fixtures');

const URL = '/roas-calculator/';

// The page's own definition of the share of a gross (VAT-inclusive) order that is left
// after VAT, cancellations/returns, COGS and fulfilment. Break-even ROAS is 1 / this.
function grossMargin({ vat, cancel, cogs, fulfil }) {
  const vatFactor = vat > 0 ? 1 / (1 + vat / 100) : 1;
  const costRate = cancel / 100 + (1 - cancel / 100) * (cogs / 100 + fulfil / 100);
  return vatFactor * (1 - costRate);
}

const txt = async (page, id) => (await page.locator('#' + id).innerText()).trim();

async function setCosts(page, c) {
  await setValue(page, '#vat-rate', c.vat);
  await setValue(page, '#cancel-rate', c.cancel);
  await setValue(page, '#cogs-rate', c.cogs);
  await setValue(page, '#fulfil-rate', c.fulfil);
}

test.describe('ROAS calculator', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('#res-breakeven')).not.toHaveText('--');
  });

  test.describe('break-even ROAS is 1 / gross margin', () => {
    const cases = [
      { vat: 0, cancel: 0, cogs: 30, fulfil: 15 },   // margin 0.55
      { vat: 0, cancel: 0, cogs: 50, fulfil: 10 },   // 0.40 -> 2.5x
      { vat: 0, cancel: 0, cogs: 20, fulfil: 5 },    // 0.75
      { vat: 0, cancel: 0, cogs: 60, fulfil: 20 },   // 0.20 -> 5.0x
      { vat: 20, cancel: 5, cogs: 30, fulfil: 15 },  // page defaults
      { vat: 20, cancel: 10, cogs: 40, fulfil: 10 },
      { vat: 10, cancel: 0, cogs: 25, fulfil: 25 },
    ];
    for (const c of cases) {
      test(`vat ${c.vat} cancel ${c.cancel} cogs ${c.cogs} fulfil ${c.fulfil}`, async ({ page }) => {
        await setCosts(page, c);
        const expected = (1 / grossMargin(c)).toFixed(1) + 'x';
        await expect(page.locator('#res-breakeven')).toHaveText(expected);
      });
    }

    test('spending exactly revenue x margin gives zero profit', async ({ page }) => {
      // margin 0.55: revenue 10,000 supports exactly 5,500 of spend.
      await setCosts(page, { vat: 0, cancel: 0, cogs: 30, fulfil: 15 });
      await setValue(page, '#ad-revenue', 10000);
      await setValue(page, '#ad-spend', 5500);
      await expect(page.locator('#res-total-profit')).toHaveText('£0');
      expect(await txt(page, 'res-roas')).toBe(await txt(page, 'res-breakeven'));
    });

    test('costs of 100 percent or more show a warning and no break-even', async ({ page }) => {
      await setCosts(page, { vat: 0, cancel: 0, cogs: 70, fulfil: 40 });
      await expect(page.locator('#cost-warning')).toBeVisible();
      await expect(page.locator('#res-breakeven')).toHaveText('N/A');
    });
  });

  test.describe('recommended spend never loses money', () => {
    const grid = [];
    for (const [spend, rev] of [[5000, 25000], [1000, 30000], [20000, 25000], [5000, 9000], [100, 100000], [8000, 8000]]) {
      for (const costs of [
        { vat: 20, cancel: 5, cogs: 30, fulfil: 15 },
        { vat: 0, cancel: 0, cogs: 20, fulfil: 5 },
        { vat: 20, cancel: 10, cogs: 55, fulfil: 20 },
        { vat: 0, cancel: 0, cogs: 80, fulfil: 15 },
      ]) grid.push({ spend, rev, ...costs });
    }

    for (const g of grid) {
      const name = `spend ${g.spend} rev ${g.rev} vat ${g.vat} cancel ${g.cancel} cogs ${g.cogs} fulfil ${g.fulfil}`;
      test(name, async ({ page }) => {
        const q = new URLSearchParams({
          cur: 'GBP', spend: g.spend, rev: g.rev, vat: g.vat, cancel: g.cancel,
          cogs: g.cogs, fulfil: g.fulfil, margin: 20,
        });
        await page.goto(URL + '?' + q);
        const optimal = await txt(page, 'res-optimal-spend');

        if (!/\(\d+(\.\d)?x current\)/.test(optimal)) {
          // No spend figure recommended: must be one of the page's explicit "no recommendation" states.
          expect(optimal).toMatch(/^(--|Cut hard)/);
          return;
        }

        const mult = parseFloat(optimal.match(/\((\d+(\.\d)?)x current\)/)[1]);
        const revenue = g.rev;
        const c = grossMargin(g);
        const baseRoas = revenue / g.spend;
        // Page's response curve: ROAS falls as spend^-0.4, so revenue grows as spend^0.6.
        const profit = g.spend * mult * baseRoas * Math.pow(1 / mult, 0.4) * c - g.spend * mult;
        expect(profit, `profit at recommended ${mult}x`).toBeGreaterThanOrEqual(0);

        // And the page's own scaled-profit card, set to the recommended multiplier, agrees.
        await setValue(page, '#spend-scale-val', mult);
        const scaledProfit = await page.locator('#res-scaled-profit');
        await expect(scaledProfit).not.toHaveClass(/delta-negative/);
        expect(await scaledProfit.innerText()).not.toMatch(/-/);
      });
    }
  });

  test('per-order figures update when average order value changes', async ({ page }) => {
    const spend = 5000, rev = 25000;
    const c = { vat: 20, cancel: 5, cogs: 30, fulfil: 15 };
    const netProfit = rev / 1.2 * (1 - 0.05) * (1 - 0.30 - 0.15) - spend;
    const seen = [];
    for (const aov of [500, 250, 1000, 100]) {
      await setValue(page, '#aov', aov);
      const orders = rev / aov;
      await expect(page.locator('#res-cpa')).toHaveText('£' + Math.round(spend / orders));
      await expect(page.locator('#res-profit-order')).toHaveText('£' + Math.round(netProfit / orders));
      seen.push(await txt(page, 'res-cpa'));
    }
    expect(new Set(seen).size).toBe(4);
    // Total profit does not depend on order value.
    await expect(page.locator('#res-total-profit')).toHaveText('£' + Math.round(netProfit).toLocaleString('en-GB'));
  });

  test('orders mode derives revenue from orders x AOV', async ({ page }) => {
    await page.locator('label[for="mode-orders"]').click();
    await expect(page.locator('#orders-input-group')).toBeVisible();
    await setValue(page, '#order-count', 40);
    await setValue(page, '#aov', 300);
    await setValue(page, '#ad-spend', 4000);
    await expect(page.locator('#res-roas')).toHaveText('3.0x');
    await expect(page.locator('#res-cpa')).toHaveText('£100');
    await setValue(page, '#aov', 600);
    await expect(page.locator('#res-roas')).toHaveText('6.0x');
    await expect(page.locator('#res-cpa')).toHaveText('£100');
  });
});
