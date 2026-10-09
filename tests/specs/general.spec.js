// Checks that apply to every tool page at both widths: no console errors, and core controls
// are visible and inside the viewport horizontally.
const { test, expect } = require('../fixtures');

const pages = [
  {
    name: 'ROAS calculator',
    url: '/roas-calculator/',
    controls: [
      '#ad-spend', '#ad-revenue', '#aov', '#vat-rate', '#cancel-rate', '#cogs-rate', '#fulfil-rate',
      '#margin-rate', '#currency-select', '#res-roas', '#res-breakeven', '#res-profit-order',
      '#res-total-profit', '#res-cpa', '#res-target-roas', '#spend-scale', '#spend-scale-val',
      '#res-scaled-roas', '#res-scaled-revenue', '#res-scaled-profit', '#res-optimal-spend',
    ],
    async interact(page) {
      await page.locator('#ad-spend').fill('6000');
      await page.locator('#ad-revenue').fill('30000');
      await page.locator('#vat-rate').fill('10');
      await page.locator('#currency-select').selectOption('USD');
      await page.locator('label[for="mode-orders"]').click();
      await page.locator('#order-count').fill('80');
      await page.locator('#add-channel').click();
      await page.locator('#spend-scale-val').fill('2');
      await page.locator('#spend-scale').fill('3');
    },
  },
  {
    name: 'Caffeine calculator',
    url: '/caffeine/',
    controls: [
      '#wake-time', '#sleep-time', '#coffee-count', '#tea-count', '#metabolism', '#drink-order',
      '#carry-over', '#last-coffee', '#last-tea', '#bedtime-mg', '#caffeine-graph', '.schedule-item >> nth=0',
    ],
    async interact(page) {
      await page.locator('#wake-time').fill('06:30');
      await page.locator('#sleep-time').fill('23:00');
      await page.locator('[data-stepper="coffee"][data-dir="1"]').click();
      await page.locator('[data-stepper="tea"][data-dir="-1"]').click();
      await page.locator('#metabolism').selectOption('8');
      await page.locator('#drink-order').selectOption('interleave');
      await page.locator('#carry-over').check();
    },
  },
  {
    name: 'SERP preview',
    url: '/serp-preview/',
    controls: [
      '#serp-keyphrase', '#serp-title', '#serp-url', '#serp-date', '#serp-desc', '#serp-sitename',
      '#serp-image', '#title-pixels', '#desc-pixels', '#preview-desktop', '#validation', '.serp-tab >> nth=0',
    ],
    async interact(page) {
      await page.locator('#serp-title').fill('A title for the preview - Example Site');
      await page.locator('#serp-desc').fill('A description for the preview that is long enough to look like a real snippet.');
      await page.locator('#serp-url').fill('https://www.example.com/some/page/');
      await page.locator('#serp-keyphrase').fill('preview');
      for (const tab of await page.locator('.serp-tab').all()) await tab.click();
    },
  },
  {
    name: 'Customer economics',
    url: '/customer-economics/',
    controls: [
      '#currency-select', '#active-customers', '#loyalty-rate', '#new-customers', '#avg-spend',
      '#res-returning', '#res-total', '#res-revenue', '#proj-revenue', '#avg-booking', '#cancel-rate',
      '#cogs-rate', '#fulfil-rate', '#margin-rate', '#res-allowable', '#res-roas', '#res-cost-pct',
      '#loyalty-delta', '#loyalty-delta-val', '#new-delta', '#new-delta-val', '#spend-delta',
      '#spend-delta-val', '#res-projected', '#res-delta', '#res-growth-pct', '#revenue-chart',
      '#lever-loyalty', '#lever-new', '#lever-spend',
    ],
    async interact(page) {
      await page.locator('#active-customers').fill('12000');
      await page.locator('#loyalty-rate').fill('55');
      await page.locator('#currency-select').selectOption('EUR');
      await page.locator('#extended-payback').check();
      await page.locator('#loyalty-delta-val').fill('5');
      await page.locator('#new-delta-val').fill('-500');
      await page.locator('#spend-delta').fill('10');
    },
  },
];

for (const p of pages) {
  test.describe(p.name, () => {
    test('no console errors on load or after a round of input', async ({ page, pageErrors }) => {
      await page.goto(p.url);
      await page.waitForLoadState('load');
      expect(pageErrors, 'errors on load').toEqual([]);
      await p.interact(page);
      // Give any deferred handlers a moment to throw.
      await page.waitForTimeout(250);
      expect(pageErrors, 'errors after input').toEqual([]);
    });

    test('core controls are visible and not clipped horizontally', async ({ page }) => {
      await page.goto(p.url);
      await page.waitForLoadState('load');
      const vw = page.viewportSize().width;
      const problems = [];
      for (const sel of p.controls) {
        const loc = page.locator(sel).first();
        if (!(await loc.isVisible())) { problems.push(`${sel}: not visible`); continue; }
        const box = await loc.boundingBox();
        if (!box || box.width === 0 || box.height === 0) { problems.push(`${sel}: empty box`); continue; }
        if (box.x < -0.5 || box.x + box.width > vw + 0.5) {
          problems.push(`${sel}: x ${box.x.toFixed(1)}..${(box.x + box.width).toFixed(1)} outside 0..${vw}`);
        }
      }
      expect(problems).toEqual([]);
    });

    test('page does not scroll sideways', async ({ page }) => {
      await page.goto(p.url);
      await page.waitForLoadState('load');
      await p.interact(page);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(overflow).toBeLessThanOrEqual(1);
    });
  });
}
