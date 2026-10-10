const { test, expect, parseMoney } = require('../fixtures');

const URL = '/fractional-vs-full-time/';

// Hand-computed defaults (see the brief): NI 15% x (95,000 - 5,000), pension 5%, benefits 6,000.
const D = {
  ni: 13500, pension: 4750, annual: 119250, recruiter: 19000, first: 138250,
  perDay: 530, fractional: 40800, breakEven: 11.7, ftWeeks: 25, frWeeks: 10, gap: 15,
  // first 12 months from today: 119,250 x 40/52 + 19,000 and 40,800 x 48/52
  ftFirst: 110731, frFirst: 37662, firstBreakEven: 11.8,
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
    await expect(page.locator('#res-ft-first')).toHaveText('£110,731');
    await expect(page.locator('#res-fr-first')).toHaveText('£37,662');
    await expect(page.locator('#res-first-diff')).toHaveText('£73,069');
    await expect(page.locator('#res-first-diff-label')).toHaveText('Fractional saves, first 12 months');
    await expect(page.locator('#res-fr-annual')).toHaveText('£40,800');
    await expect(page.locator('#res-diff')).toHaveText('£78,450');
    await expect(page.locator('#res-diff-label')).toHaveText('Fractional saves, a year');
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
    await expect(page.locator('#fvf-breakeven')).toHaveText('Over a full year, the hire is cheaper above 11.7 days a month.');
    expect(119250 / (850 * 12)).toBeCloseTo(D.breakEven, 1);
    await expect(page.locator('#fvf-breakeven-first')).toHaveText('Over the first 12 months from today, the hire is cheaper above 11.8 days a month.');
    expect(D.ftFirst / (850 * 12 * 48 / 52)).toBeCloseTo(D.firstBreakEven, 1);
    await expect(page.locator('#res-ft-weeks')).toHaveText('25 weeks');
    await expect(page.locator('#res-fr-weeks')).toHaveText('10 weeks');
    await expect(page.locator('#res-gap')).toHaveText('15 weeks');
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
    await expect(page.locator('#fvf-breakeven')).toHaveText('Over a full year, the hire is cheaper above 8.3 days a month.');
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
    await expect(page.locator('#fvf-breakeven')).toContainText('even if you bought every working day (about 18.8 days a month).');
    await typeInto(page, '#p-dpm', '0');
    await expect(page.locator('#fvf-verdict')).toContainText('No fractional days entered');
    await expect(page.locator('#res-fr-annual')).toHaveText('-');
    await expect(page.locator('#res-diff')).toHaveText('-');
    await expect(page.locator('#res-first-diff')).toHaveText('-');
    await expect(page.locator('#res-diff-label')).toHaveText('Difference, a year');
    await expect(page.locator('#res-first-diff-label')).toHaveText('Difference, first 12 months');
    await expect(page.locator('#fvf-live')).not.toContainText('£0');
    const all = await body.innerText();
    expect(all).not.toMatch(/NaN|Infinity|undefined|N\/A/);
  });

  test('money has sign before the symbol and never wraps', async ({ page }) => {
    await load(page, '?sal=95000&dr=10000&dpm=22');
    // 10,000 x 22 x 12 = 2,640,000 against 119,250 -> full-time saves 2,520,750, shown positive
    await expect(page.locator('#res-fr-annual')).toHaveText('£2,640,000');
    await expect(page.locator('#res-diff')).toHaveText('£2,520,750');
    await expect(page.locator('#res-diff-label')).toHaveText('Full-time saves, a year');
    for (const id of ['res-ft-annual', 'res-ft-first', 'res-fr-first', 'res-first-diff', 'res-fr-annual', 'res-diff', 'res-ft-day', 'res-fr-day']) {
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

  test('toolEvent: calculated once after the first input, shared on copy', async ({ browser }) => {
    const context = await browser.newContext();
    await context.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: 'http://127.0.0.1:4173' });
    const page = await context.newPage();
    await page.route(/googletagmanager\.com/, (r) => r.abort());
    const events = () => page.evaluate(() => (window.dataLayer || []).filter((e) => e && /^tool_/.test(e.event)).map((e) => e.event));
    await page.goto(URL);
    await expect(page.locator('#res-ft-annual')).not.toHaveText('--');
    await page.waitForTimeout(1200);
    expect(await events()).toEqual([]);
    await typeInto(page, '#p-dpm', '6');
    await typeInto(page, '#p-dpm', '7');
    await expect.poll(events).toEqual(['tool_calculated']);
    await page.waitForTimeout(1200);
    expect(await events()).toEqual(['tool_calculated']);
    await page.locator('#fvf-copy').click();
    await expect.poll(events).toEqual(['tool_calculated', 'tool_shared']);
    await context.close();
  });

  test('works without window.toolEvent', async ({ page, pageErrors }) => {
    await page.route(/tool-events\.js/, (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: '' }));
    await load(page);
    expect(await page.evaluate(() => typeof window.toolEvent)).toBe('undefined');
    await typeInto(page, '#p-dpm', '6');
    await page.locator('#fvf-copy').click();
    await page.waitForTimeout(1000);
    expect(pageErrors).toEqual([]);
  });

  test('live region announces a short summary, not every keystroke', async ({ page }) => {
    await load(page);
    const live = page.locator('#fvf-live');
    await expect(live).toHaveAttribute('aria-live', 'polite');
    // nothing is announced on page load
    await page.waitForTimeout(1000);
    await expect(live).toHaveText('');
    await page.evaluate(() => {
      window.__mut = 0;
      new MutationObserver(() => window.__mut++).observe(document.getElementById('fvf-live'), { childList: true, characterData: true, subtree: true });
    });
    await typeInto(page, '#p-dpm', '12');
    await expect(live).toContainText('Full-time £119,250 a year, fractional £122,400 a year. Full-time looks like the better buy');
    expect(await page.evaluate(() => window.__mut)).toBeLessThanOrEqual(2);
  });

  test('every control is at least 44px tall and has a visible label', async ({ page }) => {
    await load(page);
    const controls = await page.locator('#fvf-inputs input, #fvf-inputs select, .fvf-top-row select, .fvf-top-row button').evaluateAll((nodes) =>
      nodes.map((n) => ({ id: n.id, type: n.type, labelH: (n.closest('label') || n).getBoundingClientRect().height, h: n.getBoundingClientRect().height, label: n.id ? !!document.querySelector('label[for="' + n.id + '"]') : false, text: n.textContent.trim() })));
    expect(controls.length).toBeGreaterThanOrEqual(16);
    expect(controls.some((c) => c.id === 'p-ir35')).toBe(true);
    for (const c of controls) {
      if (c.type === 'checkbox') {
        // the checkbox sits inside a 44px-tall label that is the real tap target
        expect(c.labelH, c.id).toBeGreaterThanOrEqual(44);
        continue;
      }
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
    expect(widths[2] / widths[0]).toBeCloseTo(110731 / 119250, 2);
    expect(widths[1] / widths[0]).toBeCloseTo(40800 / 119250, 2);
    expect(widths[3] / widths[0]).toBeCloseTo(37662 / 119250, 2);
  });

  test('page source includes the tool CTA below the results and links to more tools', async ({ request }) => {
    const html = await (await request.get(URL)).text();
    const src = require('fs').readFileSync(require('path').join(__dirname, '../../fractional-vs-full-time.html'), 'utf8');
    const results = html.indexOf('id="fvf-results"');
    const cta = html.indexOf('class="tool-cta');
    const how = html.indexOf('How this works');
    expect(results).toBeGreaterThan(-1);
    expect(cta).toBeGreaterThan(results);
    expect(cta).toBeLessThan(how);
    expect(html).toContain('that is what I do.');
    expect(src).toMatch(/\n\{% include tool-cta\.html text="[^"]+" %\}\n/);
    expect(src).not.toMatch(/<!-- tool-cta -->/);
    expect(html).toContain('href="/tools/">More tools');
    expect(html).toContain('/js/tool-events.js');
    expect(html).toContain('2026/27');
  });

  test('the savings card flips direction and stays positive', async ({ page }) => {
    await load(page, '?sal=60000&dpm=8');
    // 60,000 + 15% x 55,000 + 3,000 + 6,000 = 77,250; fractional 850 x 8 x 12 = 81,600
    await expect(page.locator('#res-diff-label')).toHaveText('Full-time saves, a year');
    await expect(page.locator('#res-diff')).toHaveText('£4,350');
    await typeInto(page, '#p-dpm', '4');
    await expect(page.locator('#res-diff-label')).toHaveText('Fractional saves, a year');
    await expect(page.locator('#res-diff')).toHaveText('£36,450');
  });

  test('first 12 months counts only the weeks after each option starts', async ({ page }) => {
    await load(page);
    await typeInto(page, '#f-tth', '26');
    // 119,250 x 26/52 + 19,000
    await expect(page.locator('#res-ft-first')).toHaveText('£78,625');
    await typeInto(page, '#p-st', '26');
    // 40,800 x 26/52
    await expect(page.locator('#res-fr-first')).toHaveText('£20,400');
    await typeInto(page, '#f-tth', '60');
    await expect(page.locator('#res-ft-first')).toHaveText('-');
    // nothing to compare against: no "saves" claim, and a neutral label
    await expect(page.locator('#res-first-diff')).toHaveText('-');
    await expect(page.locator('#res-first-diff-label')).toHaveText('Difference, first 12 months');
    await expect(page.locator('#fvf-breakeven-first')).toContainText('would not start inside the first 12 months');
  });

  test('gap card and verdict agree on the number of weeks', async ({ page }) => {
    await load(page, '?rup=0.5&frup=2.5&tth=0&fst=0');
    // hire 0 + 0.5 x 52/12 = 2.17 -> 2 weeks; fractional 2.5 -> 3 weeks (rounds half up)
    const gap = parseInt((await text(page, 'res-gap')).split(' ')[0], 10);
    const ft = parseInt((await text(page, 'res-ft-weeks')).split(' ')[0], 10);
    const fr = parseInt((await text(page, 'res-fr-weeks')).split(' ')[0], 10);
    expect(gap).toBe(Math.abs(ft - fr));
    await load(page, '?rup=2.5&frup=0.5&tth=0&fst=0');
    const g2 = parseInt((await text(page, 'res-gap')).split(' ')[0], 10);
    const v = await text(page, 'fvf-verdict');
    expect(v).toContain(g2 + (g2 === 1 ? ' week' : ' weeks') + ' sooner');
  });

  test('weeks cards stay on one line and inside the card at 360px', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await load(page, '?tth=104&rup=24&fst=52&frup=52');
    await expect(page.locator('#res-ft-weeks')).toHaveText('208 weeks');
    for (const id of ['res-ft-weeks', 'res-fr-weeks', 'res-gap']) {
      const m = await page.locator('#' + id).evaluate((n) => {
        const r = document.createRange(); r.selectNodeContents(n);
        return { text: r.getBoundingClientRect().width, box: n.getBoundingClientRect().width, h: n.getBoundingClientRect().height, lh: parseFloat(getComputedStyle(n).lineHeight) };
      });
      expect(m.text, id).toBeLessThanOrEqual(m.box);
      expect(Math.round(m.h / m.lh), id).toBe(1);
    }
  });

  test('copy glitches are gone', async ({ page }) => {
    await load(page);
    await typeInto(page, '#f-wd', '1');
    await page.locator('#f-wd').blur();
    const be = await text(page, 'fvf-breakeven');
    expect(be).not.toMatch(/0\.1 days/);
    expect(be).toContain('even if you bought every working day.');
    await load(page, '?dr=400');
    const note = await page.locator('#fvf-perday-note').evaluate((n) => n.textContent);
    expect(note).toBe(note.trim());
    expect(note).toContain('so less per day.');
    await load(page);
    expect(await text(page, 'fvf-perday-note')).toContain('48 days a year against 225.');
  });

  test('result labels are at least 12px and hints are tied to inputs', async ({ page }) => {
    await load(page);
    const sizes = await page.locator('.result-label').evaluateAll((ns) => ns.map((n) => parseFloat(getComputedStyle(n).fontSize)));
    expect(sizes.length).toBeGreaterThan(8);
    for (const sz of sizes) expect(sz).toBeGreaterThanOrEqual(12);
    await expect(page.locator('#f-pen')).toHaveAttribute('aria-describedby', 'f-pen-hint');
    await typeInto(page, '#f-pen', '500');
    await expect(page.locator('#f-pen')).toHaveAttribute('aria-describedby', 'f-pen-hint f-pen-note');
    await expect(page.locator('#f-pen-hint')).toContainText('legal minimum is 3%');
  });

  test('every verdict uses the same neutral style', async ({ page }) => {
    await load(page);
    const styles = [];
    for (const d of ['4', '9', '15']) {
      await typeInto(page, '#p-dpm', d);
      styles.push(await page.locator('#fvf-verdict').evaluate((n) => n.className + '|' + getComputedStyle(n).backgroundColor));
    }
    expect(new Set(styles).size).toBe(1);
  });

  test('methodology covers IR35, notice period and the break-even definition', async ({ page }) => {
    await load(page);
    const how = await page.locator('.methodology').innerText();
    expect(how).toContain('IR35');
    expect(how).toContain('short notice period');
    expect(how).toContain('Class 1A');
    expect(how).toContain('annual cost of the hire divided by (12 x day rate)');
  });

  test('start time defaults to 4 weeks and says it includes finding someone', async ({ page }) => {
    await load(page);
    await expect(page.locator('#p-st')).toHaveValue('4');
    await expect(page.locator('#p-st-hint')).toContainText('including finding and choosing someone');
    await expect(page.locator('#res-fr-weeks')).toHaveText('10 weeks');
  });

  test('the saving sentence only appears when fractional costs less in total', async ({ page }) => {
    await load(page);
    await expect(page.locator('#fvf-perday-note')).toContainText('The saving comes from buying fewer days');
    // 10,000 x 22 x 12 is far more than the hire: still dearer per day, but no saving
    await load(page, '?dr=10000&dpm=22');
    const note = await text(page, 'fvf-perday-note');
    expect(note).toContain('so more per day.');
    expect(note).not.toContain('saving');
  });

  test('verdict wording: time is secondary when full-time wins, and "far less" needs half', async ({ page }) => {
    await load(page, '?dpm=15');
    const v = await text(page, 'fvf-verdict');
    expect(v).toContain('Full-time looks like the better buy');
    expect(v).toMatch(/Separately, a fractional leader would be in post and up to speed 15 weeks sooner/);
    // time is a side point in the middle, and the verdict ends on a neutral line
    expect(v.indexOf('Separately')).toBeLessThan(v.indexOf('daily line management'));
    expect(v.trim().endsWith('change them to see how the answer moves.')).toBe(true);
    await load(page);
    expect((await text(page, 'fvf-verdict')).trim().endsWith('change them to see how the answer moves.')).toBe(true);
    await load(page, '?dpm=15');
    await load(page);
    expect(await text(page, 'fvf-verdict')).toContain('costs more per day but far less in total.');
    // 850 x 7 x 12 = 71,400; saving 47,850 is under half of 119,250
    await load(page, '?dpm=7');
    const mid = await text(page, 'fvf-verdict');
    expect(mid).toContain('costs more per day but less in total.');
    expect(mid).not.toContain('far less');
  });

  test('IR35 box adds employer NI to the fees and moves the break-even', async ({ page }) => {
    await load(page);
    const box = page.locator('#p-ir35');
    await expect(box).not.toBeChecked();
    await expect(page.locator('#res-fr-annual')).toHaveText('£40,800');
    await box.check();
    // 850 x 1.15 = 977.50 a day; x 4 x 12 = 46,920
    await expect(page.locator('#res-fr-annual')).toHaveText('£46,920');
    await expect(page.locator('#res-fr-day')).toHaveText('£978');
    // 119,250 / (977.5 x 12) = 10.17
    await expect(page.locator('#fvf-breakeven')).toHaveText('Over a full year, the hire is cheaper above 10.2 days a month.');
    await expect(page).toHaveURL(/ir35=1/);
    await page.goto(page.url());
    await expect(page.locator('#p-ir35')).toBeChecked();
    await expect(page.locator('#res-fr-annual')).toHaveText('£46,920');
    await typeInto(page, '#f-ni', '0');
    await expect(page.locator('#res-fr-annual')).toHaveText('£40,800');
    await expect(page.locator('.methodology')).toContainText('no threshold');
  });

  for (const weeks of ['52', '60']) {
    test(`a hire that starts at ${weeks} weeks does not look free in the first 12 months`, async ({ page }) => {
      await load(page, '?tth=' + weeks);
      await expect(page.locator('#res-ft-first')).toHaveText('-');
      await expect(page.locator('#res-ft-first-label')).toHaveText('Full-time, starts after 12 months');
      await expect(page.locator('#bu-first')).toHaveText('-');
      await expect(page.locator('#res-first-diff')).toHaveText('-');
      // the chart leaves the bar out and says why, instead of drawing a zero-cost bar
      const label = await page.locator('#fvf-chart').getAttribute('aria-label');
      expect(label).toContain('First 12 months: full-time starts after 12 months');
      expect(label).not.toContain('First 12 months: full-time £0');
      const widths = await page.locator('#fvf-chart rect').evaluateAll((rs) => rs.map((r) => parseFloat(r.getAttribute('width'))));
      expect(widths[2]).toBe(0);
      const texts = await page.locator('#fvf-chart text').evaluateAll((ns) => ns.map((n) => n.textContent));
      expect(texts).toContain('starts after 12 months');
      expect(texts).not.toContain('£0');
      // the verdict says the hire falls outside the window
      await expect(page.locator('#fvf-verdict')).toContainText('The full-time hire would not start until after the first 12 months.');
    });
  }

  test('a hire inside the window keeps its normal first-12-month label and bar', async ({ page }) => {
    await load(page, '?tth=51');
    await expect(page.locator('#res-ft-first-label')).toHaveText('Full-time, first 12 months');
    await expect(page.locator('#res-ft-first')).not.toHaveText('-');
    await expect(page.locator('#fvf-verdict')).not.toContainText('would not start until after');
  });
});
