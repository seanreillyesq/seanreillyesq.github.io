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

// ---------------------------------------------------------------------------------------
// Regression tests for the bug, layout and accessibility fixes.
// ---------------------------------------------------------------------------------------

async function load(page, params, width) {
  if (width) await page.setViewportSize({ width, height: 900 });
  const q = params ? '?' + new URLSearchParams({ cur: 'GBP', ...params }).toString() : '';
  await page.goto(URL + q);
  await expect(page.locator('#res-breakeven')).not.toHaveText('--');
}

// Select the current contents of a field and type over them one key at a time.
async function typeOver(locator, text) {
  await locator.click();
  await locator.press('Control+A');
  await locator.pressSequentially(text);
}

const verdictText = async (page) => (await page.locator('#verdict').innerText()).replace(/\s+/g, ' ').trim();

test.describe('ROAS calculator: bugs', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('channel inputs keep typed digits in order', async ({ page }) => {
    const spend = page.locator('.ch-spend').first();
    const revenue = page.locator('.ch-revenue').first();

    await typeOver(revenue, '123');
    await expect(revenue).toHaveValue('123');
    await typeOver(spend, '4500');
    await expect(spend).toHaveValue('4500');

    await revenue.fill('2000');
    await revenue.press('End');
    await revenue.pressSequentially('55');
    await expect(revenue).toHaveValue('200055');
    await expect(revenue).toBeFocused();
  });

  test('typing in the channel and cost inputs does not rebuild the channel cards', async ({ page }) => {
    await page.locator('.ch-spend').first().evaluate((e) => { e.dataset.marker = 'same-node'; });
    await typeOver(page.locator('.ch-spend').first(), '777');
    await typeOver(page.locator('#vat-rate'), '15');
    await expect(page.locator('.ch-spend').first()).toHaveAttribute('data-marker', 'same-node');
    // ...while the figures still follow the typing.
    await expect(page.locator('.roas-channel-results .ch-res-roas').first()).toHaveText(/x$/);
  });

  test('removing a channel rebuilds the cards and the remove button names the channel', async ({ page }) => {
    await expect(page.locator('.roas-channel')).toHaveCount(2);
    await page.getByRole('button', { name: 'Remove Meta Ads' }).click();
    await expect(page.locator('.roas-channel')).toHaveCount(1);
    await expect(page.getByRole('button', { name: /^Remove/ })).toHaveCount(0);
  });

  test('scale ad spend number box accepts typing key by key', async ({ page }) => {
    const box = page.locator('#spend-scale-val');
    await box.click();
    await box.press('Control+A');
    await box.press('Backspace');
    await expect(box).toHaveValue('');
    await box.pressSequentially('2.5');
    await expect(box).toHaveValue('2.5');
    await expect(page.locator('#spend-scale')).toHaveValue('2.5');
    await expect(page.locator('#res-scaled-roas')).toHaveText((5 * Math.pow(1 / 2.5, 0.4)).toFixed(1) + 'x');

    await typeOver(box, '4');
    await expect(box).toHaveValue('4');
    await expect(page.locator('#res-scaled-roas')).toHaveText((5 * Math.pow(1 / 4, 0.4)).toFixed(1) + 'x');
  });

  test('scale ad spend box is clamped and tidied only on change', async ({ page }) => {
    const box = page.locator('#spend-scale-val');
    await box.fill('');
    await box.blur();
    await expect(box).toHaveValue('1.0');
    await box.fill('99');
    await expect(box).toHaveValue('99');   // not rewritten while typing
    await box.blur();
    const max = await page.locator('#spend-scale').getAttribute('max');
    await expect(box).toHaveValue(Number(max).toFixed(1));
  });

  test('a profitable spend is not told it loses money', async ({ page }) => {
    // Revenue 12,500 with default costs: ROAS 2.5x, total profit +443, optimum below 0.5x.
    await setValue(page, '#ad-revenue', 12500);
    await expect(page.locator('#res-roas')).toHaveText('2.5x');
    expect(await txt(page, 'res-total-profit')).toBe('£443');
    const optimal = await txt(page, 'res-optimal-spend');
    expect(optimal).toMatch(/^Cut back/);
    expect(optimal).toMatch(/last part of this spend is unprofitable/);
    expect(optimal).not.toMatch(/loses money/);
  });

  test('an unprofitable spend is told it loses money', async ({ page }) => {
    await setValue(page, '#ad-revenue', 6000);
    expect(await txt(page, 'res-total-profit')).toMatch(/^-/);
    const optimal = await txt(page, 'res-optimal-spend');
    expect(optimal).toMatch(/^Cut hard/);
    expect(optimal).toMatch(/this spend loses money/);
  });

  test('trap chart stays inside its plot area when the optimum is under 0.5x', async ({ page }) => {
    await setValue(page, '#ad-revenue', 12500);
    await expect(page.locator('#res-optimal-spend')).toContainText('Cut');
    const geometry = await page.evaluate(() => {
      const svg = document.getElementById('trap-chart');
      const grid = [...svg.querySelectorAll('line')].filter((l) => l.getAttribute('y1') === l.getAttribute('y2'));
      const left = Math.min(...grid.map((l) => +l.getAttribute('x1')));
      const right = Math.max(...grid.map((l) => +l.getAttribute('x2')));
      const xs = [];
      svg.querySelectorAll('path').forEach((p) => {
        (p.getAttribute('d').match(/[ML]\s*(-?[\d.]+)/g) || []).forEach((m) => xs.push(+m.replace(/[ML]\s*/, '')));
      });
      svg.querySelectorAll('line').forEach((l) => { xs.push(+l.getAttribute('x1')); xs.push(+l.getAttribute('x2')); });
      svg.querySelectorAll('circle').forEach((c) => xs.push(+c.getAttribute('cx')));
      const ticks = [...svg.querySelectorAll('text')]
        .filter((t) => t.getAttribute('text-anchor') === 'middle' && /^[\d.]+x$/.test(t.textContent))
        .map((t) => +t.getAttribute('x'));
      return { left, right, xs, ticks };
    });
    expect(geometry.xs.length).toBeGreaterThan(100);
    for (const x of geometry.xs) {
      expect(x).toBeGreaterThanOrEqual(geometry.left - 0.01);
      expect(x).toBeLessThanOrEqual(geometry.right + 0.01);
    }
    for (const x of geometry.ticks) expect(x).toBeGreaterThanOrEqual(geometry.left);
  });

  test('trap chart is cleared when costs reach 100 percent', async ({ page }) => {
    await expect(page.locator('#trap-chart > *')).not.toHaveCount(0);
    await setCosts(page, { vat: 0, cancel: 0, cogs: 60, fulfil: 40 });
    await expect(page.locator('#res-scaled-roas')).toHaveText('--');
    await expect(page.locator('#trap-chart > *')).toHaveCount(0);
    await expect(page.locator('#trap-chart')).toBeHidden();
  });

  test('COGS and ad spend have different colours', async ({ page }) => {
    const swatch = (name) => page.locator('.waterfall-legend-item', { hasText: name }).locator('.waterfall-legend-swatch');
    const colour = (loc) => loc.evaluate((e) => getComputedStyle(e).backgroundColor);
    const cogs = await colour(swatch('COGS'));
    const ads = await colour(swatch('Ad Spend'));
    expect(cogs).not.toBe(ads);
    const fills = await page.locator('#cost-waterfall svg rect').evaluateAll((r) => r.map((x) => x.getAttribute('fill')));
    expect(new Set(fills).size).toBe(fills.length);
  });

  test.describe('verdict copy at the edges', () => {
    test('revenue 0 reports the real loss and no per-order figure', async ({ page }) => {
      await setValue(page, '#ad-revenue', 0);
      const v = await verdictText(page);
      expect(v).toMatch(/Unprofitable/);
      expect(v).toMatch(/£5,000 in total/);
      expect(v).not.toMatch(/per order/);
      expect(v).not.toMatch(/£0/);
    });

    test('AOV 0 omits the per-order clause', async ({ page }) => {
      await setValue(page, '#aov', 0);
      const v = await verdictText(page);
      expect(v).toMatch(/Profitable/);
      expect(v).not.toMatch(/per order/);
      expect(v).toMatch(/in total/);
    });

    test('costs of 100 percent or more say no ROAS can break even', async ({ page }) => {
      await setCosts(page, { vat: 0, cancel: 0, cogs: 60, fulfil: 40 });
      const v = await verdictText(page);
      expect(v).toMatch(/no ROAS can break even/);
      expect(v).not.toMatch(/N\/A/);
    });

    test('a 100 percent margin target says it cannot be met', async ({ page }) => {
      await setValue(page, '#margin-rate', 100);
      const v = await verdictText(page);
      expect(v).toMatch(/cannot be met at any ROAS/);
      expect(v).not.toMatch(/N\/A/);
    });
  });

  test('cost warning appears at exactly 100 percent', async ({ page }) => {
    await setCosts(page, { vat: 0, cancel: 0, cogs: 60, fulfil: 40 });
    await expect(page.locator('#cost-warning')).toBeVisible();
    await expect(page.locator('#res-breakeven')).toHaveText('N/A');
    await setCosts(page, { vat: 0, cancel: 0, cogs: 60, fulfil: 39 });
    await expect(page.locator('#cost-warning')).toBeHidden();
  });

  test.describe('out-of-range input is explained', () => {
    const noteFor = (page, id) => page.locator('#' + id).locator('xpath=ancestor::div[contains(@class,"col-")][1]').locator('.roas-field-note');

    test('negative ad spend', async ({ page }) => {
      await setValue(page, '#ad-spend', -500);
      await expect(noteFor(page, 'ad-spend')).toBeVisible();
      await expect(noteFor(page, 'ad-spend')).toContainText(/Negative values are not allowed - using 0/);
      await setValue(page, '#ad-spend', 5000);
      await expect(noteFor(page, 'ad-spend')).toBeHidden();
    });

    test('over-large ad spend', async ({ page }) => {
      await setValue(page, '#ad-spend', 1000000000);
      await expect(noteFor(page, 'ad-spend')).toContainText(/Maximum is 9,999,999 - using 9,999,999/);
    });

    test('percentage fields and channel fields behave the same way', async ({ page }) => {
      await setValue(page, '#vat-rate', 150);
      await expect(noteFor(page, 'vat-rate')).toContainText(/Maximum is 100 - using 100/);
      await page.locator('.ch-spend').first().fill('-5');
      await expect(noteFor(page, 'ch-spend-0')).toContainText(/Negative values are not allowed/);
    });
  });

  test('optimal spend says when the 50x cap binds', async ({ page }) => {
    await setValue(page, '#ad-revenue', 100000);   // 20x ROAS
    const optimal = await txt(page, 'res-optimal-spend');
    expect(optimal).toMatch(/£250,000/);
    expect(optimal).toMatch(/\(50\.0x current\)/);
    expect(optimal).toMatch(/capped at 50x/);
    expect(optimal).toMatch(/optimum is 62\.\dx/);
    await expect(page.locator('#trap-chart')).toContainText('(cap)');
  });

  test('optimal spend is not labelled capped when the cap does not bind', async ({ page }) => {
    expect(await txt(page, 'res-optimal-spend')).not.toMatch(/capped/);
  });

  test('waterfall shows the loss when costs exceed revenue', async ({ page }) => {
    await setValue(page, '#ad-spend', 20000);
    await setValue(page, '#ad-revenue', 10000);
    const wf = page.locator('#cost-waterfall');
    await expect(wf).toContainText('Loss £15,646');
    await expect(wf).toContainText('Revenue £10,000');
    await expect(wf.locator('.waterfall-legend')).toContainText('Loss beyond revenue');
    // and no loss label when profitable
    await setValue(page, '#ad-spend', 5000);
    await setValue(page, '#ad-revenue', 25000);
    await expect(wf).not.toContainText('Loss');
  });

  test('the AOV label is plain words and its hint follows the input mode', async ({ page }) => {
    const group = page.locator('#aov-input-group');
    await expect(group.locator('label')).toHaveText('Average order value');
    await expect(group.locator('.roas-field-hint')).toHaveText('Used for per-order figures');
    await page.locator('label[for="mode-orders"]').click();
    await expect(group.locator('label')).toHaveText('Average order value');
    await expect(group.locator('.roas-field-hint')).toContainText('revenue');
    await expect(group.locator('.roas-field-hint')).not.toContainText('per-order figures');
    await page.locator('label[for="mode-revenue"]').click();
    await expect(group.locator('.roas-field-hint')).toHaveText('Used for per-order figures');
  });

  test('per-order figures show N/A, like CPA, when there are no orders', async ({ page }) => {
    await setValue(page, '#ad-revenue', 0);
    await expect(page.locator('#res-cpa')).toHaveText('N/A');
    await expect(page.locator('#res-profit-order')).toHaveText('N/A');
    await setValue(page, '#ad-revenue', 25000);
    await expect(page.locator('#res-profit-order')).not.toHaveText('N/A');

    await setValue(page, '#aov', 0);
    await expect(page.locator('#res-cpa')).toHaveText('N/A');
    await expect(page.locator('#res-profit-order')).toHaveText('N/A');
    await expect(page.locator('.ch-res-cpa')).toHaveText(['N/A', 'N/A']);
    await expect(page.locator('.ch-res-ppo')).toHaveText(['N/A', 'N/A']);
    await setValue(page, '#aov', 500);
    await expect(page.locator('.ch-res-ppo').first()).not.toHaveText('N/A');

    // a channel with no revenue has no orders either
    await page.locator('.ch-revenue').first().fill('0');
    await expect(page.locator('.ch-res-ppo').first()).toHaveText('N/A');
    await expect(page.locator('.ch-res-ppo').nth(1)).not.toHaveText('N/A');
  });

  test('waterfall bar labels use the same money format as the legend', async ({ page }) => {
    await setValue(page, '#ad-spend', 9999999);
    await setValue(page, '#ad-revenue', 9999999);
    const legend = await page.locator('.waterfall-legend').innerText();
    const labels = (await page.locator('#cost-waterfall svg text').evaluateAll((ts) => ts.map((x) => x.textContent))).filter((x) => /^£/.test(x));
    expect(labels.length).toBeGreaterThan(0);
    for (const l of labels) expect(legend, l).toContain(l);
    expect(labels).toContain('£10.0M');
    expect(labels).not.toContain('£9,999,999');
  });
});

for (const width of [360, 390, 1280]) {
  test.describe(`ROAS calculator: layout at ${width}px`, () => {
    test('chart text is at least 11px tall where it matters on phones', async ({ page }) => {
      test.skip(width === 1280, 'phone-width check');
      await load(page, { spend: 20000, rev: 10000 }, width);   // loss: waterfall has all its labels
      for (const sel of ['#cost-waterfall svg', '#channel-chart', '#trap-chart']) {
        const heights = await page.locator(sel + ' text').evaluateAll((ts) => ts.map((t) => t.getBoundingClientRect().height));
        expect(heights.length, sel).toBeGreaterThan(1);
        for (const h of heights) expect(h, sel).toBeGreaterThanOrEqual(11);
      }
    });

    test('channel and result values are not clipped', async ({ page }) => {
      await load(page, { spend: 86952, rev: 0 }, width);
      const rev = page.locator('.ch-revenue').first();
      await rev.fill('143109');
      await page.locator('.ch-spend').first().fill('0');
      await page.locator('.ch-spend').nth(1).fill('86952');
      await page.locator('.ch-revenue').nth(1).fill('0');
      await expect(page.locator('.ch-res-profit').first()).toHaveText('£62,312');
      await expect(page.locator('.ch-res-profit').nth(1)).toHaveText('-£86,952');
      const clipped = await page.evaluate(() =>
        [...document.querySelectorAll('.result-value')]
          .filter((e) => e.offsetParent !== null)
          .filter((e) => e.scrollWidth > e.clientWidth)
          .map((e) => e.className + ': ' + e.textContent));
      expect(clipped).toEqual([]);
    });

    test('every control is at least 44px tall', async ({ page }) => {
      await load(page, null, width);
      const small = await page.evaluate(() => {
        const scope = document.querySelectorAll('.roas-currency-row, #section-profitability, #section-channels, #section-trap');
        const found = [];
        scope.forEach((s) => s.querySelectorAll('input:not(.btn-check), select, button, label.btn').forEach((e) => {
          if (e.offsetParent === null) return;
          const r = e.getBoundingClientRect();
          const minW = e.classList.contains('roas-remove-channel') ? 44 : 0;
          if (r.height < 43.5 || r.width < minW - 0.5) found.push((e.id || e.className || e.tagName) + ' ' + Math.round(r.width) + 'x' + Math.round(r.height));
        }));
        return found;
      });
      expect(small).toEqual([]);
    });

    test('inputs in a row share a top, and result cards in a row share a height', async ({ page }) => {
      await load(page, null, width);
      const result = await page.evaluate(() => {
        const uneven = [];
        document.querySelectorAll('.roas-field-row').forEach((row) => {
          const lines = {};
          [...row.children].filter((c) => c.offsetParent !== null).forEach((col) => {
            const input = col.querySelector('input');
            const top = Math.round(col.getBoundingClientRect().top);
            (lines[top] = lines[top] || []).push(Math.round(input.getBoundingClientRect().top));
          });
          Object.values(lines).forEach((tops) => { if (new Set(tops).size > 1) uneven.push(tops.join(',')); });
        });
        const heights = {};
        document.querySelectorAll('#section-profitability .result-card, #section-trap .result-card').forEach((c) => {
          const top = Math.round(c.getBoundingClientRect().top);
          (heights[top] = heights[top] || []).push(Math.round(c.getBoundingClientRect().height));
        });
        const unevenCards = Object.values(heights).filter((hs) => new Set(hs).size > 1).map((hs) => hs.join(','));
        return { uneven, unevenCards };
      });
      expect(result.uneven).toEqual([]);
      expect(result.unevenCards).toEqual([]);
    });
  });
}

for (const width of [360, 1280]) {
  test(`trap chart marker labels do not touch the axis labels at ${width}px`, async ({ page }) => {
    await load(page, { spend: 5000, rev: 100000 }, width);   // 20x ROAS
    await expect(page.locator('#trap-chart')).toContainText('You: 1.0x');
    const clashes = await page.evaluate(() => {
      const texts = [...document.querySelectorAll('#trap-chart text')].map((t) => ({ t: t.textContent, r: t.getBoundingClientRect() }));
      const markers = texts.filter((x) => /^(You|Optimal):/.test(x.t));
      const others = texts.filter((x) => !/^(You|Optimal):/.test(x.t));
      const hit = (a, b) => a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
      const out = [];
      markers.forEach((m, i) => {
        others.forEach((o) => { if (hit(m.r, o.r)) out.push(m.t + ' x ' + o.t); });
        markers.slice(i + 1).forEach((o) => { if (hit(m.r, o.r)) out.push(m.t + ' x ' + o.t); });
      });
      return { out, markers: markers.length };
    });
    expect(clashes.markers).toBe(2);
    expect(clashes.out).toEqual([]);
  });
}

test.describe('ROAS calculator: accessibility', () => {
  test.beforeEach(async ({ page }) => { await load(page); });

  test('controls have accessible names', async ({ page }) => {
    await expect(page.getByRole('combobox', { name: 'Currency' })).toBeVisible();
    await expect(page.getByRole('slider', { name: 'Scale ad spend' })).toBeVisible();
    await expect(page.getByRole('spinbutton', { name: 'Spend multiplier value' })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Channel 1 name' })).toHaveValue('Google Ads');
    await expect(page.getByRole('spinbutton', { name: 'Ad spend - Google Ads' })).toHaveValue('3000');
    await expect(page.getByRole('spinbutton', { name: 'Revenue - Meta Ads' })).toHaveValue('7000');
    await expect(page.getByRole('button', { name: 'Remove Google Ads' })).toBeVisible();
    await expect(page.getByLabel('Ad spend', { exact: true })).toHaveValue('5000');
  });

  test('accessible names follow a renamed channel', async ({ page }) => {
    await page.getByRole('textbox', { name: 'Channel 1 name' }).fill('Search');
    await expect(page.getByRole('button', { name: 'Remove Search' })).toBeVisible();
    await expect(page.getByRole('spinbutton', { name: 'Ad spend - Search' })).toBeVisible();
  });

  test('the verdict is a polite live region and charts are labelled images', async ({ page }) => {
    await expect(page.locator('#verdict')).toHaveAttribute('aria-live', 'polite');
    for (const sel of ['#cost-waterfall svg', '#channel-chart', '#trap-chart']) {
      await expect(page.locator(sel)).toHaveAttribute('role', 'img');
      expect((await page.locator(sel).getAttribute('aria-label')).length).toBeGreaterThan(10);
    }
  });
});
