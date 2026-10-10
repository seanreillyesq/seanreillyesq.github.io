const { test, expect, parseMoney } = require('../fixtures');

const URL = '/fractional-vs-full-time/';

// Hand-computed defaults (see the brief): NI 15% x (95,000 - 5,000), pension 5%, benefits 6,000.
const D = {
  ni: 13500, pension: 4750, annual: 119250, recruiter: 19000, first: 138250,
  perDay: 530, fractional: 40800, breakEven: 11.7, ftWeeks: 25, frWeeks: 4, gap: 21,
};

const text = (page, id) => page.locator('#' + id).innerText();
const money = async (page, id) => parseMoney(await text(page, id));

// Clear a field and type key by key, as a person would.
async function typeInto(page, selector, value) {
  const input = page.locator(selector);
  await input.click();
  await input.press('Control+a');
  await input.press('Delete');
  await input.pressSequentially(value);
}

async function load(page, query = '') {
  await page.goto(URL + query);
  await expect(page.locator('#res-ft-annual')).not.toHaveText('--');
}

test.describe('Fractional vs full-time', () => {
  test('default inputs give the hand-computed costs', async ({ page, pageErrors }) => {
    await load(page);
    await expect(page.locator('#res-ft-annual')).toHaveText('£119,250');
    await expect(page.locator('#res-ft-first')).toHaveText('£138,250');
    await expect(page.locator('#res-fr-annual')).toHaveText('£40,800');
    await expect(page.locator('#res-diff')).toHaveText('£78,450');
    await expect(page.locator('#res-ft-day')).toHaveText('£530');
    await expect(page.locator('#res-fr-day')).toHaveText('£850');
    await expect(page.locator('#bu-ni')).toHaveText('£13,500');
    await expect(page.locator('#bu-pen')).toHaveText('£4,750');
    await expect(page.locator('#bu-rec')).toHaveText('£19,000');
    expect(await money(page, 'bu-annual')).toBe(D.ni + D.pension + 95000 + 6000);
    await expect(page.locator('#fvf-perday-note')).toContainText('£850 against £530');
    expect(pageErrors).toEqual([]);
  });

  test('break-even sentence and time to productive match the maths', async ({ page }) => {
    await load(page);
    await expect(page.locator('#fvf-breakeven')).toHaveText('Above 11.7 days a month, a full-time hire is cheaper.');
    expect(119250 / (850 * 12)).toBeCloseTo(D.breakEven, 1);
    await expect(page.locator('#res-ft-weeks')).toHaveText('25 weeks');
    await expect(page.locator('#res-fr-weeks')).toHaveText('4 weeks');
    await expect(page.locator('#res-gap')).toHaveText('21 weeks');
    await expect(page.locator('#res-gap-sub')).toHaveText('fractional is sooner');
  });

  test('typing decimals key by key keeps exactly what was typed and the same element', async ({ page }) => {
    await load(page);
    const input = page.locator('#p-dpm');
    await input.evaluate((n) => { n.dataset.keep = 'same'; });
    await typeInto(page, '#p-dpm', '2.5');
    await expect(input).toHaveValue('2.5');
    await expect(input).toHaveAttribute('data-keep', 'same');
    await expect(page.locator('#res-fr-annual')).toHaveText('£25,500');
    // a half-typed number must survive each keystroke
    await typeInto(page, '#f-ni', '12.');
    await expect(page.locator('#f-ni')).toHaveValue('12.');
    await page.locator('#f-ni').pressSequentially('5');
    await expect(page.locator('#f-ni')).toHaveValue('12.5');
    // 12.5% x 90,000 = 11,250 -> 95,000 + 11,250 + 4,750 + 6,000
    await expect(page.locator('#res-ft-annual')).toHaveText('£117,000');
  });

  test('out-of-range values are clamped with an inline note, and only tidied on blur', async ({ page }) => {
    await load(page);
    await typeInto(page, '#f-rec', '150');
    await expect(page.locator('#f-rec')).toHaveValue('150');
    await expect(page.locator('#f-rec-note')).toHaveText('Maximum is 100 - using 100.');
    // 100% x 95,000 recruiter fee
    await expect(page.locator('#bu-rec')).toHaveText('£95,000');
    await page.locator('#f-rec').blur();
    await expect(page.locator('#f-rec')).toHaveValue('100');
    await expect(page.locator('#f-rec-note')).toHaveText('Maximum is 100 - using 100.');

    await typeInto(page, '#p-dpm', '40');
    await expect(page.locator('#p-dpm-note')).toHaveText('Maximum is 22 - using 22.');
    await expect(page.locator('#res-fr-annual')).toHaveText('£224,400');

    await typeInto(page, '#f-sal', '-5');
    await expect(page.locator('#f-sal')).toHaveValue('-5');
    await expect(page.locator('#f-sal-note')).toContainText('Negative values are not allowed');
    await typeInto(page, '#f-sal', '95000');
    await expect(page.locator('#f-sal-note')).toBeHidden();
  });

  test('pasted "£1,200" is understood and tidied on change', async ({ page }) => {
    await load(page);
    const input = page.locator('#p-dr');
    await input.fill('£1,200');
    await expect(page.locator('#res-fr-annual')).toHaveText('£57,600');
    await input.blur();
    await expect(input).toHaveValue('1200');
    await expect(page.locator('#fvf-breakeven')).toHaveText('Above 8.3 days a month, a full-time hire is cheaper.');
  });

  test('verdict changes with the numbers and says when full-time is better', async ({ page }) => {
    await load(page);
    await expect(page.locator('#fvf-verdict')).toContainText('Fractional is cheaper for this amount of time');
    await typeInto(page, '#p-dpm', '9');
    await expect(page.locator('#fvf-verdict')).toContainText('A close call');
    await typeInto(page, '#p-dpm', '15');
    await expect(page.locator('#fvf-verdict')).toContainText('Full-time looks like the better buy');
    await expect(page.locator('#fvf-verdict')).toContainText('daily line management');
  });

  test('edge cases give sensible copy, never NaN or Infinity', async ({ page }) => {
    await load(page);
    const body = page.locator('#fvf-results');
    await typeInto(page, '#p-dr', '0');
    await expect(page.locator('#fvf-breakeven')).toHaveText('Enter a day rate to see the break-even.');
    await typeInto(page, '#p-dr', '');
    await expect(page.locator('#fvf-breakeven')).toHaveText('Enter a day rate to see the break-even.');
    await typeInto(page, '#p-dr', '850');
    await typeInto(page, '#f-wd', '0');
    await page.locator('#f-wd').blur();
    await expect(page.locator('#f-wd-note')).toHaveText('Minimum is 1 - using 1.');
    await typeInto(page, '#f-sal', '0');
    await typeInto(page, '#f-ben', '0');
    await expect(page.locator('#fvf-breakeven')).toHaveText('Enter a salary to see the break-even.');
    await typeInto(page, '#f-wd', '225');
    await typeInto(page, '#f-sal', '1000000');
    await typeInto(page, '#p-dr', '1');
    await expect(page.locator('#fvf-breakeven')).toContainText('even at 18.8 days a month');
    await typeInto(page, '#p-dpm', '0');
    await expect(page.locator('#fvf-verdict')).toContainText('No fractional days entered');
    const all = await body.innerText();
    expect(all).not.toMatch(/NaN|Infinity|undefined|N\/A/);
  });

  test('money has sign before the symbol and never wraps', async ({ page }) => {
    await load(page, '?sal=95000&dr=10000&dpm=22');
    // 10,000 x 22 x 12 = 2,640,000 against 119,250 -> fractional dearer by 2,520,750
    await expect(page.locator('#res-fr-annual')).toHaveText('£2,640,000');
    await expect(page.locator('#res-diff')).toHaveText('-£2,520,750');
    for (const id of ['res-ft-annual', 'res-ft-first', 'res-fr-annual', 'res-diff', 'res-ft-day', 'res-fr-day']) {
      const lines = await page.locator('#' + id).evaluate((n) => {
        const lh = parseFloat(getComputedStyle(n).lineHeight);
        return Math.round(n.getBoundingClientRect().height / lh);
      });
      expect(lines).toBe(1);
      expect(await page.locator('#' + id).evaluate((n) => getComputedStyle(n).whiteSpace)).toBe('nowrap');
    }
  });

  test('URL reproduces the result and currency changes the symbol', async ({ page }) => {
    await load(page);
    await page.locator('#fvf-currency').selectOption('USD');
    await typeInto(page, '#f-sal', '120000');
    await expect(page).toHaveURL(/sal=120000/);
    await expect(page).toHaveURL(/cur=USD/);
    const annual = await text(page, 'res-ft-annual');
    expect(annual.startsWith('$')).toBe(true);
    // 120,000 + 15% x 115,000 + 6,000 + 6,000
    expect(parseMoney(annual)).toBe(120000 + 17250 + 6000 + 6000);
    const url = page.url();
    await page.goto(url);
    await expect(page.locator('#res-ft-annual')).toHaveText(annual);
    await expect(page.locator('#f-sal')).toHaveValue('120000');
    await expect(page.locator('#fvf-currency')).toHaveValue('USD');
  });

  test('a shared URL with out-of-range values shows the note', async ({ page }) => {
    await load(page, '?rec=500');
    await expect(page.locator('#f-rec-note')).toHaveText('Maximum is 100 - using 100.');
  });

  test('nothing is stored in the browser', async ({ page }) => {
    await load(page);
    await typeInto(page, '#f-sal', '101000');
    await expect(page.locator('#res-ft-annual')).not.toHaveText('£119,250');
    const stored = await page.evaluate(() => ({ ls: localStorage.length, ss: sessionStorage.length, c: document.cookie }));
    expect(stored.ls).toBe(0);
    expect(stored.ss).toBe(0);
    expect(stored.c).not.toMatch(/fvf|fractional|sal=/);
  });

  test('toolEvent: calculated once after the first input, shared on copy', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
    await page.addInitScript(() => {
      window.__events = [];
      window.toolEvent = (n) => window.__events.push(n);
    });
    await load(page);
    expect(await page.evaluate(() => window.__events)).toEqual([]);
    await typeInto(page, '#p-dpm', '6');
    await typeInto(page, '#p-dpm', '7');
    await expect.poll(() => page.evaluate(() => window.__events.slice())).toEqual(['calculated']);
    await page.waitForTimeout(1200);
    expect(await page.evaluate(() => window.__events.slice())).toEqual(['calculated']);
    await page.locator('#fvf-copy').click();
    expect(await page.evaluate(() => window.__events.slice())).toEqual(['calculated', 'shared']);
  });

  test('works without window.toolEvent', async ({ page, pageErrors }) => {
    await load(page);
    await typeInto(page, '#p-dpm', '6');
    await page.locator('#fvf-copy').click();
    await page.waitForTimeout(1000);
    expect(pageErrors).toEqual([]);
  });

  test('live region announces a short summary, not every keystroke', async ({ page }) => {
    await load(page);
    const live = page.locator('#fvf-live');
    await expect(live).toHaveAttribute('aria-live', 'polite');
    await expect(live).toContainText('Full-time £119,250 a year, fractional £40,800 a year.');
    await page.evaluate(() => {
      window.__mut = 0;
      new MutationObserver(() => window.__mut++).observe(document.getElementById('fvf-live'), { childList: true, characterData: true, subtree: true });
    });
    await typeInto(page, '#p-dpm', '12');
    await expect(live).toContainText('Full-time looks like the better buy');
    expect(await page.evaluate(() => window.__mut)).toBeLessThanOrEqual(2);
  });

  test('every control is at least 44px tall and has a visible label', async ({ page }) => {
    await load(page);
    const controls = await page.locator('#fvf-inputs input, #fvf-inputs select, .fvf-top-row select, .fvf-top-row button').evaluateAll((nodes) =>
      nodes.map((n) => ({ id: n.id, h: n.getBoundingClientRect().height, label: n.id ? !!document.querySelector('label[for="' + n.id + '"]') : false, text: n.textContent.trim() })));
    expect(controls.length).toBeGreaterThanOrEqual(15);
    for (const c of controls) {
      expect(c.h, c.id).toBeGreaterThanOrEqual(44);
      if (c.id !== 'fvf-copy') expect(c.label, c.id).toBe(true);
    }
    // labels are visible, except the currency one which is announced
    const hidden = await page.locator('#fvf-inputs label.form-label').evaluateAll((ls) => ls.filter((l) => l.getBoundingClientRect().height === 0).length);
    expect(hidden).toBe(0);
  });

  test('inputs in a row share a top even when a label wraps', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await load(page);
    const tops = await page.locator('#f-sal, #f-ni').evaluateAll((n) => n.map((i) => Math.round(i.closest('.input-group').getBoundingClientRect().top)));
    expect(tops[0]).toBe(tops[1]);
    const tops2 = await page.locator('#f-ben, #f-rec').evaluateAll((n) => n.map((i) => Math.round(i.closest('.input-group').getBoundingClientRect().top)));
    expect(tops2[0]).toBe(tops2[1]);
  });

  for (const width of [360, 390, 1280]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await load(page, '?sal=1000000&dr=10000&dpm=22');
      const o = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
      expect(o.sw).toBeLessThanOrEqual(o.cw);
    });
  }

  test('chart is drawn at its rendered width with readable text at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await load(page);
    const svg = page.locator('#fvf-chart');
    await expect(svg).toHaveAttribute('role', 'img');
    await expect(svg).toHaveAttribute('aria-label', /Annual: full-time £119,250/);
    const m = await svg.evaluate((n) => {
      const vb = n.viewBox.baseVal;
      const r = n.getBoundingClientRect();
      const scale = r.width / vb.width;
      const sizes = Array.from(n.querySelectorAll('text')).map((t) => parseFloat(t.getAttribute('font-size')) * scale);
      const over = Array.from(n.querySelectorAll('text')).filter((t) => t.getBoundingClientRect().right > r.right + 1).length;
      return { vbw: vb.width, w: r.width, cw: n.parentElement.clientWidth, min: Math.min(...sizes), over };
    });
    expect(Math.abs(m.vbw - m.cw)).toBeLessThanOrEqual(1);
    expect(m.min).toBeGreaterThanOrEqual(11);
    expect(m.over).toBe(0);
    // redraws when the viewport changes
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect.poll(() => svg.evaluate((n) => Math.abs(n.viewBox.baseVal.width - n.parentElement.clientWidth))).toBeLessThanOrEqual(1);
  });

  test('chart bars follow the numbers', async ({ page }) => {
    await load(page);
    const widths = await page.locator('#fvf-chart rect').evaluateAll((rs) => rs.map((r) => parseFloat(r.getAttribute('width'))));
    expect(widths).toHaveLength(4);
    expect(widths[2] / widths[0]).toBeCloseTo(138250 / 119250, 2);
    expect(widths[1] / widths[0]).toBeCloseTo(40800 / 119250, 2);
  });

  test('page source carries the tool-cta marker below the results', async ({ request }) => {
    const html = await (await request.get(URL)).text();
    const results = html.indexOf('id="fvf-results"');
    const marker = html.indexOf('<!-- tool-cta -->');
    const how = html.indexOf('How this works');
    expect(results).toBeGreaterThan(-1);
    expect(marker).toBeGreaterThan(results);
    expect(marker).toBeLessThan(how);
    expect(html).toContain('2026/27');
  });
});
