const { test, expect } = require('../fixtures');

const URL = '/caffeine/';
const COFFEE_MG = 95, TEA_MG = 47;
const MIN_GAP = 30;
const DOI = 'https://doi.org/10.1016/j.smrv.2023.101764';

const hhmm = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };

// Gardiner et al. 2023: 107 mg needs 8.8 h and 217.5 mg needs 13.2 h before bed, as a straight line,
// scaled by half-life / 5. Written out again here so the page is checked against the paper, not itself.
const gapHours = (mg, halfLife) => (8.8 + (mg - 107) * 4.4 / 110.5) * (halfLife / 5);

// Read what the page rendered.
async function readState(page) {
  return page.evaluate(() => {
    const drinks = Array.from(document.querySelectorAll('.schedule-item')).map((li) => ({
      clock: li.querySelector('.schedule-time-input').value,
      label: li.querySelector('.schedule-type').textContent,
      pinned: li.querySelector('.schedule-time-input').classList.contains('pinned'),
    }));
    return {
      wake: document.getElementById('wake-time').value,
      sleep: document.getElementById('sleep-time').value,
      drinks,
      lastCoffee: document.getElementById('last-coffee').textContent.trim(),
      lastTea: document.getElementById('last-tea').textContent.trim(),
      bedtimeText: document.getElementById('bedtime-mg').textContent.trim(),
      warning: document.getElementById('caffeine-warning').textContent.trim(),
    };
  });
}

// Minutes since wake for a clock time, and the length of the waking day.
function geometry(st) {
  const wake = hhmm(st.wake);
  let sleepAbs = hhmm(st.sleep);
  if (sleepAbs <= wake) sleepAbs += 1440;
  return {
    wake, sleepAbs, waking: sleepAbs - wake,
    sinceWake: (clock) => (hhmm(clock) - wake + 1440) % 1440,
  };
}

const typeOf = (d) => (/^Coffee/.test(d.label) ? 'coffee' : 'tea');

async function halfLifeOf(page) { return Number(await page.locator('#metabolism').inputValue()); }

// The consent library skips itself for automated browsers (hideFromBots checks navigator.webdriver),
// so it would never read its own cookie back after a reload. Hide that flag so reloads behave as
// they do for a person, then accept the functionality category.
async function openWithConsent(page, query) {
  await page.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); });
  await page.goto(URL + (query ? '?' + query : ''));
  await page.evaluate(() => { CookieConsent.acceptCategory(['functionality']); CookieConsent.hide(); });
}

const scheduleInput = (page, i) => page.locator('.schedule-time-input').nth(i);
const times = (page) => page.locator('.schedule-time-input').evaluateAll((els) => els.map((e) => e.value));

const configs = [
  { name: 'defaults', q: '' },
  { name: 'one coffee', q: 'coffee=1&tea=0' },
  { name: 'one tea', q: 'coffee=0&tea=1' },
  { name: 'one of each', q: 'coffee=1&tea=1' },
  { name: 'two teas, slow metaboliser', q: 'coffee=0&tea=2&metabolism=8' },
  { name: 'one tea, fast metaboliser', q: 'coffee=0&tea=1&metabolism=3' },
  { name: 'three and three', q: 'coffee=3&tea=3' },
  { name: 'four coffees, slow metaboliser', q: 'coffee=4&tea=1&metabolism=8' },
  { name: 'fast metaboliser, tea first', q: 'coffee=2&tea=3&metabolism=3&order=tea-first' },
  { name: 'interleave', q: 'coffee=3&tea=3&order=interleave' },
  { name: 'early sleeper', q: 'wake=0600&sleep=2030&coffee=3&tea=2' },
  { name: 'night owl crossing midnight', q: 'wake=1000&sleep=0200&coffee=3&tea=2&metabolism=8' },
  { name: 'heavy preset', q: 'coffee=8&tea=8' },
  { name: 'heavy, slow, interleave', q: 'coffee=6&tea=6&metabolism=8&order=interleave' },
  { name: 'short day, cut-offs near wake', q: 'wake=1000&sleep=1800&coffee=3&tea=3' },
  { name: 'short day, interleave', q: 'wake=1000&sleep=1800&coffee=3&tea=3&order=interleave' },
  { name: 'very short day', q: 'wake=1200&sleep=1500&coffee=2&tea=2&order=interleave' },
  { name: 'whole day', q: 'wake=0000&sleep=2359&coffee=8&tea=8' },
  { name: 'old metabolism=7 link', q: 'coffee=3&tea=3&metabolism=7' },
];

test.describe('Caffeine calculator', () => {
  test.describe('cut-off cards follow the Gardiner et al. gap', () => {
    for (const hl of [3, 5, 8]) {
      test(`metabolism ${hl} h`, async ({ page }) => {
        await page.goto(URL + `?wake=0700&sleep=2230&coffee=2&tea=2&metabolism=${hl}`);
        await expect(page.locator('#metabolism')).toHaveValue(String(hl));
        const st = await readState(page);
        const g = geometry(st);
        for (const [text, mg] of [[st.lastCoffee, COFFEE_MG], [st.lastTea, TEA_MG]]) {
          const exact = g.sleepAbs - gapHours(mg, hl) * 60;
          expect(text).toMatch(/^\d\d:\d\d$/);
          // The page rounds down to a whole minute.
          const shown = g.wake + g.sinceWake(text);
          expect(exact - shown, `${mg} mg cut-off ${text}`).toBeGreaterThanOrEqual(-0.001);
          expect(exact - shown).toBeLessThan(1);
        }
      });
    }

    test('the model gives the published figures', async () => {
      expect(gapHours(107, 5)).toBeCloseTo(8.8, 6);
      expect(gapHours(217.5, 5)).toBeCloseTo(13.2, 6);
      expect(gapHours(COFFEE_MG, 5)).toBeCloseTo(8.3, 1);
      expect(gapHours(TEA_MG, 5)).toBeCloseTo(6.4, 1);
    });

    test('default day: coffee 14:10, tea 16:05, no warning', async ({ page }) => {
      await page.goto(URL);
      await expect(page.locator('#last-coffee')).toHaveText('14:10');
      await expect(page.locator('#last-tea')).toHaveText('16:05');
      await expect(page.locator('#caffeine-warning')).toBeHidden();
      await expect(page.locator('#caffeine-warning')).toHaveText('');
    });

    test('cards are labelled for the new model', async ({ page }) => {
      await page.goto(URL);
      const labels = await page.locator('.result-label').allTextContents();
      expect(labels.map((s) => s.trim())).toEqual(['Last coffee by', 'Last tea by', 'Left at bedtime']);
    });
  });

  test.describe('every layout respects the cut-offs and the 30 minute spacing', () => {
    for (const c of configs) {
      test(c.name, async ({ page }) => {
        await page.goto(URL + (c.q ? '?' + c.q : ''));
        await expect(page.locator('#bedtime-mg')).not.toHaveText('-- mg');
        const st = await readState(page);
        const g = geometry(st);
        const hl = await halfLifeOf(page);
        const asked = {
          coffee: Number(await page.locator('#coffee-count').inputValue()),
          tea: Number(await page.locator('#tea-count').inputValue()),
        };

        const cut = {};
        for (const [type, text, mg] of [['coffee', st.lastCoffee, COFFEE_MG], ['tea', st.lastTea, TEA_MG]]) {
          if (asked[type] === 0) { expect(text).toBe('--:--'); continue; }
          if (text === 'Skip today') {
            // Cut-off before wake: the model says it is before wake, and nothing of this type is scheduled.
            expect(g.sleepAbs - gapHours(mg, hl) * 60, `${type} cut-off`).toBeLessThan(g.wake);
            cut[type] = -1;
          } else {
            cut[type] = g.sinceWake(text);
          }
        }

        const rel = [];
        for (const d of st.drinks) {
          const t = g.sinceWake(d.clock);
          const type = typeOf(d);
          expect(t, `${d.label} at ${d.clock} is before wake`).toBeGreaterThanOrEqual(0);
          expect(t, `${d.label} at ${d.clock} is after sleep`).toBeLessThanOrEqual(g.waking);
          expect(cut[type], `${type} scheduled although skipped`).toBeGreaterThanOrEqual(0);
          expect(t, `${d.label} at ${d.clock} is after the ${type} cut-off`).toBeLessThanOrEqual(cut[type]);
          rel.push(t);
        }
        rel.sort((a, b) => a - b);
        for (let i = 1; i < rel.length; i++) {
          expect(rel[i] - rel[i - 1], `drinks ${i - 1} and ${i} are too close`).toBeGreaterThanOrEqual(MIN_GAP);
        }

        // Warning 2 counts exactly the drinks that were asked for but are not in the list.
        const left = asked.coffee + asked.tea - st.drinks.length;
        if (left > 0) {
          expect(st.warning).toContain(left === 1
            ? "1 drink doesn't fit before your cut-offs today and has been left off."
            : `${left} drinks don't fit before your cut-offs today and have been left off.`);
        } else {
          expect(st.warning).not.toMatch(/fit before your cut-offs/);
        }
        expect(st.warning).not.toMatch(/later than/);
      });
    }
  });

  test.describe('warnings', () => {
    test('warning 1: a pinned drink after its cut-off', async ({ page }) => {
      await page.goto(URL);
      await scheduleInput(page, 0).fill('18:00');
      await page.keyboard.press('Enter');
      await expect(page.locator('#caffeine-warning')).toHaveText(
        'Your coffee at 18:00 is later than the 14:10 cut-off and is likely to cost you sleep.');
    });

    test('warning 1 names a tea against the tea cut-off', async ({ page }) => {
      await page.goto(URL + '?coffee=0&tea=1');
      await scheduleInput(page, 0).fill('20:00');
      await page.keyboard.press('Enter');
      await expect(page.locator('#caffeine-warning')).toHaveText(
        'Your tea at 20:00 is later than the 16:05 cut-off and is likely to cost you sleep.');
    });

    test('warning 2: drinks that do not fit are left off', async ({ page }) => {
      // Coffee cut-off is 11 minutes after wake, so only one coffee fits.
      await page.goto(URL + '?wake=0700&sleep=1530&coffee=3&tea=0');
      await expect(page.locator('.schedule-item')).toHaveCount(1);
      await expect(page.locator('#caffeine-warning')).toHaveText(
        "2 drinks don't fit before your cut-offs today and have been left off.");
    });

    test('warning 3: more than 400 mg', async ({ page }) => {
      await page.goto(URL + '?coffee=5&tea=0');
      await expect(page.locator('.schedule-item')).toHaveCount(5);
      await expect(page.locator('#caffeine-warning')).toHaveText(
        "That's 475 mg today. The NHS and EFSA suggest no more than 400 mg a day for most adults, and 200 mg in pregnancy.");
    });

    test('exactly 400 mg or less shows no warning', async ({ page }) => {
      await page.goto(URL + '?coffee=4&tea=0');
      await expect(page.locator('#caffeine-warning')).toBeHidden();
    });

    test('warning 1 wins over warning 3', async ({ page }) => {
      await page.goto(URL + '?coffee=5&tea=0');
      await scheduleInput(page, 4).fill('21:00');
      await page.keyboard.press('Enter');
      await expect(page.locator('#caffeine-warning')).toContainText('is later than the 14:10 cut-off');
      // the late drink comes first, then the daily total
      const lines = await page.locator('#caffeine-warning p').allTextContents();
      expect(lines[0]).toMatch(/^Your coffee at 21:00 is later than the 14:10 cut-off/);
      expect(lines[1]).toMatch(/^That's 475 mg today/);
    });

    test('the daily total is shown ahead of dropped drinks, and both can show', async ({ page }) => {
      await page.goto(URL + '?coffee=8&tea=8&order=tea-first');
      const lines = await page.locator('#caffeine-warning p').allTextContents();
      expect(lines).toHaveLength(2);
      expect(lines[0]).toMatch(/^That's \d+ mg today\. The NHS and EFSA/);
      expect(lines[1]).toBe("1 drink doesn't fit before your cut-offs today and has been left off.");
    });

    test('at most two lines show, in the order late, total, dropped', async ({ page }) => {
      await page.goto(URL + '?coffee=8&tea=8&order=tea-first');
      await scheduleInput(page, 0).fill('23:00');
      await page.keyboard.press('Enter');
      const lines = await page.locator('#caffeine-warning p').allTextContents();
      expect(lines).toHaveLength(2);
      expect(lines[0]).toMatch(/^Your (coffee|tea) at 22:30 is later than/);
      expect(lines[1]).toMatch(/^That's \d+ mg today/);
    });

    test('a single warning is a single line', async ({ page }) => {
      await page.goto(URL + '?coffee=5&tea=0');
      await expect(page.locator('#caffeine-warning p')).toHaveCount(1);
    });

    test('the warning is text with an icon, in the live region', async ({ page }) => {
      await page.goto(URL + '?coffee=5&tea=0');
      const w = page.locator('#caffeine-warning');
      await expect(w).toBeVisible();
      await expect(w.locator('svg')).toHaveCount(1);
      expect(await w.evaluate((e) => !!e.closest('[aria-live="polite"]'))).toBe(true);
      expect(await w.getAttribute('title')).toBeNull();
    });

    test('left at bedtime is information only', async ({ page }) => {
      await page.goto(URL + '?coffee=8&tea=8');
      const bed = page.locator('#bedtime-mg');
      await expect(bed).toHaveText(/^\d+ mg$/);
      const info = await bed.evaluate((e) => ({
        title: e.title,
        colour: getComputedStyle(e).color,
        reference: getComputedStyle(document.getElementById('last-coffee')).color,
      }));
      expect(info.title).toBe('');
      expect(info.colour).toBe(info.reference);
    });

    test('bedtime figure counts carry-over', async ({ page }) => {
      await page.goto(URL + '?coffee=2&tea=2');
      const without = parseInt(await page.locator('#bedtime-mg').textContent(), 10);
      await page.locator('label[for="carry-over"]').click();
      await expect(page.locator('#carry-over')).toBeChecked();
      const withCarry = parseInt(await page.locator('#bedtime-mg').textContent(), 10);
      expect(withCarry).toBeGreaterThan(without);
    });
  });

  test.describe('drink order is kept', () => {
    // Clock times of the scheduled coffees and teas
    async function byType(page) {
      return page.evaluate(() => {
        const out = { coffee: [], tea: [] };
        document.querySelectorAll('.schedule-item').forEach((li) => {
          const mins = li.querySelector('.schedule-time-input').value.split(':').map(Number);
          out[/^Coffee/.test(li.querySelector('.schedule-type').textContent) ? 'coffee' : 'tea'].push(mins[0] * 60 + mins[1]);
        });
        return out;
      });
    }
    const max = (a) => Math.max.apply(null, a);
    const min = (a) => Math.min.apply(null, a);

    test('coffee first: every tea comes after every coffee at 8 and 8', async ({ page }) => {
      await page.goto(URL + '?coffee=8&tea=8');
      const d = await byType(page);
      // All sixteen fit: coffees from 07:00 every 30 minutes, then the teas, inside both cut-offs
      expect(d.coffee).toHaveLength(8);
      expect(d.tea).toHaveLength(8);
      expect(min(d.coffee)).toBeGreaterThanOrEqual(hhmm('07:00'));
      expect(max(d.coffee)).toBeLessThanOrEqual(hhmm('14:10'));
      expect(min(d.tea) - max(d.coffee)).toBeGreaterThanOrEqual(MIN_GAP);
      expect(max(d.tea)).toBeLessThanOrEqual(hhmm('16:05'));
      await expect(page.locator('#caffeine-warning')).not.toContainText("don't fit");
    });

    test('tea first at 8 and 8: 15 fit, one coffee is left off and the warning says so', async ({ page }) => {
      await page.goto(URL + '?coffee=8&tea=8&order=tea-first');
      const d = await byType(page);
      expect(d.tea).toHaveLength(8);
      expect(d.coffee).toHaveLength(7);
      expect(min(d.coffee) - max(d.tea)).toBeGreaterThanOrEqual(MIN_GAP);
      expect(max(d.coffee)).toBeLessThanOrEqual(hhmm('14:10'));
      await expect(page.locator('#caffeine-warning')).toContainText("1 drink doesn't fit before your cut-offs today and has been left off.");
    });

    test('a drop is only reported when the drinks cannot fit at all', async ({ page }) => {
      // Brute force: the most that can fit in each order is the first type packed from wake, then the second
      const cases = [
        ['coffee=8&tea=8', 16], ['coffee=8&tea=8&order=tea-first', 15],
        ['coffee=6&tea=6', 12], ['coffee=7&tea=8', 15], ['coffee=8&tea=6&order=tea-first', 14],
      ];
      for (const [q, expected] of cases) {
        await page.goto(URL + '?' + q);
        await expect(page.locator('#bedtime-mg')).not.toHaveText('-- mg');
        expect(await page.locator('.schedule-item').count(), q).toBe(expected);
      }
    });

    test('coffee first: teas follow a coffee pinned late', async ({ page }) => {
      await page.goto(URL);
      await page.getByLabel('Coffee 2 time').fill('14:00');
      await page.keyboard.press('Enter');
      await expect(page.locator('.schedule-time-input.pinned')).toHaveValue('14:00');
      const d = await byType(page);
      expect(d.coffee).toContain(hhmm('14:00'));
      expect(d.tea).toHaveLength(2);
      expect(min(d.tea) - max(d.coffee)).toBeGreaterThanOrEqual(MIN_GAP);
      expect(max(d.tea)).toBeLessThanOrEqual(hhmm('16:05'));
    });

    test('coffee first: teas that cannot follow a late coffee are dropped with the warning', async ({ page }) => {
      await page.goto(URL + '?coffee=1&tea=8');
      await scheduleInput(page, 0).fill('14:00');
      await page.keyboard.press('Enter');
      await expect(page.locator('.schedule-time-input.pinned')).toHaveValue('14:00');
      const d = await byType(page);
      // 14:00 + 30 min to the 16:05 tea cut-off leaves room for 14:30, 15:00, 15:30 and 16:00 only
      expect(d.tea).toHaveLength(4);
      expect(min(d.tea)).toBeGreaterThanOrEqual(hhmm('14:30'));
      expect(max(d.tea)).toBeLessThanOrEqual(hhmm('16:05'));
      await expect(page.locator('#caffeine-warning')).toHaveText(
        "4 drinks don't fit before your cut-offs today and have been left off.");
    });

    test('tea first: every coffee comes after every tea', async ({ page }) => {
      for (const q of ['coffee=2&tea=2&order=tea-first', 'coffee=4&tea=4&order=tea-first']) {
        await page.goto(URL + '?' + q);
        const d = await byType(page);
        expect(d.tea.length, q).toBeGreaterThan(0);
        expect(d.coffee.length, q).toBeGreaterThan(0);
        expect(min(d.coffee) - max(d.tea), q).toBeGreaterThanOrEqual(MIN_GAP);
        expect(max(d.coffee), q).toBeLessThanOrEqual(hhmm('14:10'));
      }
    });

    test('tea first: the default 2 and 2 loses nothing', async ({ page }) => {
      await page.goto(URL + '?coffee=2&tea=2&order=tea-first');
      await expect(page.locator('.schedule-item')).toHaveCount(4);
      await expect(page.locator('#caffeine-warning')).toBeHidden();
    });

    test('tea first: coffees follow a tea pinned late', async ({ page }) => {
      await page.goto(URL + '?coffee=2&tea=2&order=tea-first');
      await page.getByLabel('Tea 2 time').fill('12:00');
      await page.keyboard.press('Enter');
      const d = await byType(page);
      expect(d.tea).toContain(hhmm('12:00'));
      for (const c of d.coffee) expect(c).toBeGreaterThanOrEqual(max(d.tea) + MIN_GAP);
    });

    test('interleave may mix the types', async ({ page }) => {
      await page.goto(URL + '?coffee=3&tea=3&order=interleave');
      const d = await byType(page);
      expect(min(d.tea)).toBeLessThan(max(d.coffee));
    });
  });

  test.describe('locks survive a change of count', () => {
    const pinnedTimes = (page) => page.locator('.schedule-time-input.pinned').evaluateAll((e) => e.map((x) => x.value));

    test('adding a drink keeps the lock and adds the new one unlocked', async ({ page }) => {
      await page.goto(URL);
      await page.getByLabel('Coffee 1 time').fill('11:11');
      await page.keyboard.press('Enter');
      await expect(page.locator('.schedule-time-input.pinned')).toHaveCount(1);
      await page.getByLabel('More teas').click();
      await expect(page.locator('.schedule-item')).toHaveCount(5);
      expect(await pinnedTimes(page)).toEqual(['11:11']);
      await page.getByLabel('More coffees').click();
      await expect(page.locator('.schedule-item')).toHaveCount(6);
      expect(await pinnedTimes(page)).toEqual(['11:11']);
    });

    test('removing a drink takes an unlocked one first', async ({ page }) => {
      await page.goto(URL);
      await page.getByLabel('Coffee 1 time').fill('11:11');
      await page.keyboard.press('Enter');
      await page.getByLabel('Fewer coffees').click();
      await expect(page.locator('.schedule-item')).toHaveCount(3);
      expect(await pinnedTimes(page)).toEqual(['11:11']);
      await expect(page.locator('.schedule-type', { hasText: 'Coffee' })).toHaveCount(1);
    });

    test('with every drink of the type locked, the latest locked one goes', async ({ page }) => {
      await page.goto(URL);
      await page.getByLabel('Coffee 1 time').fill('10:00');
      await page.keyboard.press('Enter');
      await page.getByLabel('Coffee 2 time').fill('12:00');
      await page.keyboard.press('Enter');
      await expect(page.locator('.schedule-time-input.pinned')).toHaveCount(2);
      await page.getByLabel('Fewer coffees').click();
      await expect(page.locator('.schedule-type', { hasText: 'Coffee' })).toHaveCount(1);
      expect(await pinnedTimes(page)).toEqual(['10:00']);
      await page.getByLabel('Fewer coffees').click();
      await expect(page.locator('.schedule-type', { hasText: 'Coffee' })).toHaveCount(0);
      expect(await pinnedTimes(page)).toEqual([]);
    });

    test('locks of the other type are untouched when one type changes', async ({ page }) => {
      await page.goto(URL);
      await page.getByLabel('Tea 1 time').fill('13:00');
      await page.keyboard.press('Enter');
      await page.getByLabel('More coffees').click();
      await page.getByLabel('Fewer coffees').click();
      expect(await pinnedTimes(page)).toEqual(['13:00']);
    });

    test('changing another setting still clears locks', async ({ page }) => {
      await page.goto(URL);
      await page.getByLabel('Coffee 1 time').fill('11:11');
      await page.keyboard.press('Enter');
      await page.locator('#drink-order').selectOption('tea-first');
      await expect(page.locator('.schedule-time-input.pinned')).toHaveCount(0);
    });
  });

  test.describe('metabolism options', () => {
    test('Fast 3, Normal 5, Slow 8', async ({ page }) => {
      await page.goto(URL);
      const opts = await page.locator('#metabolism option').evaluateAll((os) => os.map((o) => [o.textContent.trim(), o.value]));
      expect(opts).toEqual([['Fast', '3'], ['Normal', '5'], ['Slow', '8']]);
    });

    test('old metabolism=7 links map to 8', async ({ page }) => {
      await page.goto(URL + '?metabolism=7');
      await expect(page.locator('#metabolism')).toHaveValue('8');
      await expect(page).toHaveURL(/metabolism=8/);
    });

    test('an old cookie with half-life 7 maps to 8', async ({ page }) => {
      await page.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); });
      await page.goto(URL + '?coffee=2&tea=2');
      await page.evaluate(() => {
        CookieConsent.acceptCategory(['functionality']);
        const old = { wake: 420, sleep: 1350, coffees: 2, teas: 2, halfLife: 7, drinkOrder: 'coffee-first', carryOver: false };
        document.cookie = 'caffeine_prefs=' + encodeURIComponent(JSON.stringify(old)) + ';path=/caffeine/';
      });
      await page.goto(URL);
      await expect(page.locator('#metabolism')).toHaveValue('8');
    });
  });

  test.describe('regressions', () => {
    test('1: Enter in a schedule field applies the edit once, with no errors', async ({ page, pageErrors }) => {
      await page.goto(URL);
      const before = await page.locator('.schedule-item').count();
      await scheduleInput(page, 0).fill('11:00');
      await page.keyboard.press('Enter');
      await expect(page.locator('.schedule-time-input.pinned')).toHaveCount(1);
      await page.waitForTimeout(150);
      expect(await page.locator('.schedule-item').count()).toBe(before);
      expect(await page.locator('.schedule-time-input.pinned').count()).toBe(1);
      expect(await times(page)).toContain('11:00');
      expect(pageErrors).toEqual([]);
    });

    test('2: a time before wake goes to wake, not to bedtime', async ({ page }) => {
      await page.goto(URL);
      await scheduleInput(page, 0).fill('06:00');
      await page.keyboard.press('Enter');
      await expect(scheduleInput(page, 0)).toHaveValue('07:00');
      await expect(scheduleInput(page, 0)).toHaveClass(/pinned/);
      await expect(page.locator('#caffeine-warning')).toBeHidden();
    });

    test('2: a time after sleep goes to sleep and warns', async ({ page }) => {
      await page.goto(URL);
      await scheduleInput(page, 0).fill('23:45');
      await page.keyboard.press('Enter');
      await expect(page.locator('.schedule-time-input').last()).toHaveValue('22:30');
      await expect(page.locator('#caffeine-warning')).toContainText('Your coffee at 22:30 is later than the 14:10 cut-off');
    });

    test('2: before wake on a day that crosses midnight', async ({ page }) => {
      await page.goto(URL + '?wake=1000&sleep=0200&coffee=1&tea=0');
      await scheduleInput(page, 0).fill('09:00');
      await page.keyboard.press('Enter');
      await expect(scheduleInput(page, 0)).toHaveValue('10:00');
    });

    test('3: tabbing through untouched fields changes nothing and never drops focus', async ({ page, pageErrors }) => {
      await page.goto(URL);
      const before = await times(page);
      await scheduleInput(page, 0).focus();
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press('Tab');
        // Time inputs hold several segments, so keep tabbing and only check the end state.
      }
      await page.waitForTimeout(200);
      expect(await page.locator('.schedule-time-input.pinned').count()).toBe(0);
      expect(await times(page)).toEqual(before);
      expect(await page.evaluate(() => document.activeElement === document.body)).toBe(false);
      expect(pageErrors).toEqual([]);
    });

    test('3: tabbing out of an edited field keeps focus in the same row', async ({ page }) => {
      await page.goto(URL);
      await scheduleInput(page, 0).fill('11:00');
      // A time field has several segments: Tab until focus leaves the field.
      for (let i = 0; i < 6; i++) {
        await page.keyboard.press('Tab');
        if (await page.evaluate(() => !document.activeElement.classList.contains('schedule-time-input'))) break;
      }
      await expect(page.locator('.schedule-time-input.pinned')).toHaveCount(1);
      const active = await page.evaluate(() => {
        const a = document.activeElement;
        return { isBody: a === document.body, cls: a.className, label: a.getAttribute('aria-label') };
      });
      expect(active.isBody).toBe(false);
      expect(active.cls).toContain('schedule-pin');
      expect(active.label).toMatch(/^Unlock coffee \d, let it be rescheduled$/);
    });

    test('3: a re-render keeps focus on the same field', async ({ page }) => {
      await page.goto(URL);
      await scheduleInput(page, 1).fill('12:00');
      await page.keyboard.press('Enter');
      const active = await page.evaluate(() => {
        const a = document.activeElement;
        return { cls: a.className, value: a.value, label: a.getAttribute('aria-label') };
      });
      expect(active.cls).toContain('schedule-time-input');
      expect(active.value).toBe('12:00');
    });

    test('4: pinned times survive a reload when cookies are accepted', async ({ page }) => {
      await openWithConsent(page, 'coffee=2&tea=2');
      await scheduleInput(page, 0).fill('11:11');
      await page.keyboard.press('Enter');
      await expect(page.locator('.schedule-time-input.pinned')).toHaveCount(1);
      const pinnedBefore = await times(page);
      await page.reload();
      await expect(page.locator('.schedule-time-input.pinned')).toHaveCount(1);
      expect(await times(page)).toEqual(pinnedBefore);
      await expect(page.locator('.schedule-time-input.pinned')).toHaveValue('11:11');
    });

    test('4: pins are not applied when the settings differ', async ({ page }) => {
      await openWithConsent(page, 'coffee=2&tea=2');
      await scheduleInput(page, 0).fill('11:11');
      await page.keyboard.press('Enter');
      await expect(page.locator('.schedule-time-input.pinned')).toHaveCount(1);
      await page.goto(URL + '?coffee=3&tea=2');
      await expect(page.locator('.schedule-item')).toHaveCount(5);
      await expect(page.locator('.schedule-time-input.pinned')).toHaveCount(0);
    });

    test('4: without consent nothing is stored and pins are lost on reload', async ({ page }) => {
      await page.goto(URL + '?coffee=2&tea=2');
      await scheduleInput(page, 0).fill('11:11');
      await page.keyboard.press('Enter');
      await expect(page.locator('.schedule-time-input.pinned')).toHaveCount(1);
      expect(await page.evaluate(() => document.cookie)).not.toMatch(/caffeine_prefs/);
      await page.reload();
      await expect(page.locator('.schedule-time-input.pinned')).toHaveCount(0);
    });

    test('5: a short day warns instead of asking for drinks', async ({ page }) => {
      await page.goto(URL + '?wake=0700&sleep=0900&coffee=2&tea=2');
      await expect(page.locator('#coffee-count')).toHaveValue('2');
      await expect(page.locator('#tea-count')).toHaveValue('2');
      await expect(page.locator('#caffeine-warning')).toHaveText(
        "4 drinks don't fit before your cut-offs today and have been left off.");
      await expect(page.locator('#schedule')).not.toContainText('Add some drinks');
      await expect(page.locator('#last-coffee')).toHaveText('Skip today');
      await expect(page.locator('#last-tea')).toHaveText('Skip today');
    });

    test('5: "Add some drinks" only shows when both counts are zero', async ({ page }) => {
      await page.goto(URL + '?coffee=0&tea=0');
      await expect(page.locator('#schedule')).toContainText('Add some drinks to see your optimal schedule');
      await expect(page.locator('#caffeine-warning')).toBeHidden();
      await page.goto(URL + '?coffee=1&tea=0');
      await expect(page.locator('#schedule')).not.toContainText('Add some drinks');
    });

    for (const id of ['wake-time', 'sleep-time']) {
      test(`6: clearing ${id} puts the last valid time back`, async ({ page }) => {
        await page.goto(URL);
        const before = await readState(page);
        await page.locator('#' + id).fill('');
        await expect(page.locator('#' + id)).toHaveValue(id === 'wake-time' ? '07:00' : '22:30');
        const after = await readState(page);
        expect(after).toEqual(before);
        await expect(page).toHaveURL(/wake=0700&sleep=2230/);
      });
    }

    test('6: a real change to the wake time still recalculates', async ({ page }) => {
      await page.goto(URL);
      await page.locator('#wake-time').fill('08:00');
      await expect(page.locator('#wake-time')).toHaveValue('08:00');
      await expect(page).toHaveURL(/wake=0800/);
    });

    test('7: clearing a schedule field puts the drink time back', async ({ page }) => {
      await page.goto(URL);
      const before = await times(page);
      await scheduleInput(page, 1).fill('');
      await page.keyboard.press('Enter');
      expect(await times(page)).toEqual(before);
      await expect(scheduleInput(page, 1)).not.toHaveValue('');
      await expect(page.locator('.schedule-time-input.pinned')).toHaveCount(0);

      // And by leaving the field
      await scheduleInput(page, 2).fill('');
      await page.locator('#coffee-count').focus();
      await page.waitForTimeout(100);
      expect(await times(page)).toEqual(before);
      await expect(page.locator('.schedule-time-input.pinned')).toHaveCount(0);
    });

    test('pinned drinks stay put when another is edited', async ({ page }) => {
      await page.goto(URL);
      await scheduleInput(page, 0).fill('12:00');
      await page.keyboard.press('Enter');
      const pinnedValue = '12:00';
      await expect(page.locator('.schedule-time-input.pinned')).toHaveValue(pinnedValue);
      const idx = (await times(page)).indexOf('12:00');
      // Lock a second drink and check the first is untouched
      await page.locator('.schedule-pin').nth(idx === 0 ? 1 : 0).click();
      await expect(page.locator('.schedule-time-input.pinned')).toHaveCount(2);
      expect(await times(page)).toContain(pinnedValue);
    });

    test('unlocking reschedules the drink and keeps focus on the button', async ({ page }) => {
      await page.goto(URL);
      const original = await times(page);
      await scheduleInput(page, 0).fill('12:00');
      await page.keyboard.press('Enter');
      const pin = page.locator('.schedule-pin.pinned');
      await pin.click();
      await expect(page.locator('.schedule-time-input.pinned')).toHaveCount(0);
      expect(await times(page)).toEqual(original);
      expect(await page.evaluate(() => document.activeElement.classList.contains('schedule-pin'))).toBe(true);
    });
  });

  test.describe('accessibility', () => {
    test('names for steppers, counts, time fields and pin buttons', async ({ page }) => {
      await page.goto(URL + '?coffee=2&tea=2');
      const labels = await page.locator('[data-stepper]').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
      expect(labels).toEqual(['Fewer coffees', 'More coffees', 'Fewer teas', 'More teas']);
      for (const id of ['coffee-count', 'tea-count']) {
        expect(await page.locator('#' + id).getAttribute('aria-label')).toBeTruthy();
      }
      // The visible labels are tied to the boxes.
      expect(await page.locator('label[for="coffee-count"]').textContent()).toBe('Coffees');
      expect(await page.locator('label[for="tea-count"]').textContent()).toBe('Teas');

      const st = await readState(page);
      const names = await page.locator('.schedule-time-input').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
      expect(names.sort()).toEqual(['Coffee 1 time', 'Coffee 2 time', 'Tea 1 time', 'Tea 2 time']);
      expect(st.drinks).toHaveLength(4);
      const pins = await page.locator('.schedule-pin').evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
      expect(pins.sort()).toEqual([
        'Lock coffee 1 at this time', 'Lock coffee 2 at this time', 'Lock tea 1 at this time', 'Lock tea 2 at this time']);

      await scheduleInput(page, 0).fill('12:00');
      await page.keyboard.press('Enter');
      const locked = await page.locator('.schedule-pin.pinned').getAttribute('aria-label');
      expect(locked).toMatch(/^Unlock (coffee|tea) \d, let it be rescheduled$/);
    });

    test('helper text under the schedule', async ({ page }) => {
      await page.goto(URL);
      await expect(page.locator('#schedule-help')).toBeVisible();
      await expect(page.locator('#schedule-help')).toHaveText(
        'Change a time to lock it. Locked drinks stay put and the rest are rearranged around them.');
    });

    test('pin buttons are 44 px square and readable', async ({ page }) => {
      await page.goto(URL);
      await scheduleInput(page, 0).fill('12:00');
      await page.keyboard.press('Enter');
      const pins = await page.locator('.schedule-pin').evaluateAll((els) => els.map((e) => {
        const r = e.getBoundingClientRect();
        return { w: r.width, h: r.height, colour: getComputedStyle(e).color, pinned: e.classList.contains('pinned') };
      }));
      expect(pins.length).toBe(4);
      expect(pins.some((p) => p.pinned)).toBe(true);
      expect(pins.some((p) => !p.pinned)).toBe(true);
      for (const p of pins) {
        expect(p.w).toBeGreaterThanOrEqual(44);
        expect(p.h).toBeGreaterThanOrEqual(44);
        expect(contrast(p.colour, 'rgb(255, 255, 255)')).toBeGreaterThanOrEqual(4.5);
      }
    });

    test('tap targets are at least 44 px high', async ({ page }) => {
      await page.goto(URL);
      const heights = await page.evaluate(() => {
        const out = {};
        const h = (name, sel) => {
          document.querySelectorAll(sel).forEach((e, i) => { out[name + i] = e.getBoundingClientRect().height; });
        };
        h('stepper', '[data-stepper]');
        h('select', '#metabolism, #drink-order');
        h('time', '#wake-time, #sleep-time');
        h('switch', 'label[for="carry-over"]');
        h('schedule', '.schedule-time-input');
        return out;
      });
      for (const [name, height] of Object.entries(heights)) {
        expect(height, name).toBeGreaterThanOrEqual(43.99);
      }
      expect(Object.keys(heights).length).toBeGreaterThanOrEqual(13);
    });

    test('the carry-over label does not break at the apostrophe', async ({ page }) => {
      await page.goto(URL);
      const label = page.locator('label[for="carry-over"]');
      await expect(label).toHaveText('Include yesterday');
      const lines = await label.evaluate((e) => {
        const r = document.createRange();
        r.selectNodeContents(e);
        return new Set(Array.from(r.getClientRects()).map((x) => Math.round(x.top))).size;
      });
      expect(lines).toBe(1);
      // The switch itself is a click target
      await label.click();
      await expect(page.locator('#carry-over')).toBeChecked();
    });

    test('cards and warning sit in one polite live region', async ({ page }) => {
      await page.goto(URL);
      const live = page.locator('[aria-live="polite"]').filter({ has: page.locator('#results-summary') });
      await expect(live).toHaveCount(1);
      await expect(live.locator('#caffeine-warning')).toHaveCount(1);
      await expect(live.locator('#last-coffee')).toHaveCount(1);
    });

    test('card and form labels are 12 px or more with 4.5:1 contrast', async ({ page }) => {
      await page.goto(URL);
      const rows = await page.evaluate(() => {
        const bgOf = (e) => {
          for (let n = e; n; n = n.parentElement) {
            const c = getComputedStyle(n).backgroundColor;
            if (c && c !== 'rgba(0, 0, 0, 0)' && c !== 'transparent') return c;
          }
          return 'rgb(255, 255, 255)';
        };
        return Array.from(document.querySelectorAll('.result-label, .caffeine-inputs .form-label')).map((e) => ({
          text: e.textContent.trim(), size: parseFloat(getComputedStyle(e).fontSize),
          fg: getComputedStyle(e).color, bg: bgOf(e),
        }));
      });
      expect(rows.length).toBe(9);
      for (const r of rows) {
        expect(r.size, r.text).toBeGreaterThanOrEqual(12);
        expect(contrast(r.fg, r.bg), r.text).toBeGreaterThanOrEqual(4.5);
      }
    });

    test('every graph text colour reaches 4.5:1', async ({ page }) => {
      await page.goto(URL);
      const fills = await page.locator('#caffeine-graph text').evaluateAll((els) => Array.from(new Set(els.map((e) => e.getAttribute('fill')))));
      expect(fills.length).toBeGreaterThan(2);
      for (const f of fills) {
        expect(contrast(f, 'rgb(250, 250, 249)'), f).toBeGreaterThanOrEqual(4.5);
      }
      expect(fills).not.toContain('#C4A265');
    });
  });

  test.describe('graph', () => {
    test('has an image role and a summary of the schedule', async ({ page }) => {
      await page.goto(URL + '?coffee=2&tea=2');
      const svg = page.locator('#caffeine-graph');
      await expect(svg).toHaveAttribute('role', 'img');
      const st = await readState(page);
      const byType = (t) => st.drinks.filter((d) => typeOf(d) === t).map((d) => d.clock);
      const list = (a) => (a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]);
      const bed = parseInt(st.bedtimeText, 10);
      expect(await svg.getAttribute('aria-label')).toBe(
        `Caffeine through the day: coffee at ${list(byType('coffee'))}, tea at ${list(byType('tea'))}, about ${bed} mg left at bedtime`);
    });

    test('the summary follows the schedule', async ({ page }) => {
      await page.goto(URL + '?coffee=1&tea=0');
      const svg = page.locator('#caffeine-graph');
      await expect(svg).toHaveAttribute('aria-label', /^Caffeine through the day: coffee at \d\d:\d\d, about \d+ mg left at bedtime$/);
      await page.locator('[data-stepper="coffee"][data-dir="-1"]').click();
      await expect(svg).toHaveAttribute('aria-label', 'Caffeine through the day: no drinks scheduled');
    });

    test('graph cut-off lines match the cards', async ({ page }) => {
      await page.goto(URL);
      const geo = await page.evaluate(() => {
        const svg = document.getElementById('caffeine-graph');
        const vb = svg.viewBox.baseVal;
        const lines = Array.from(svg.querySelectorAll('line[stroke-dasharray="6,4"]'));
        return { width: vb.width, xs: lines.map((l) => parseFloat(l.getAttribute('x1'))) };
      });
      expect(geo.xs).toHaveLength(2);
      // plot runs from x = 40 to width - 58 over the waking day (07:00 to 22:30 = 930 minutes)
      const plotW = geo.width - 40 - 58;
      const at = (mins) => 40 + (mins / 930) * plotW;
      expect(geo.xs[0]).toBeCloseTo(at(hhmm('14:10') - 420), 0);
      expect(geo.xs[1]).toBeCloseTo(at(hhmm('16:05') - 420), 0);
    });

    for (const width of [360, 390, 1280]) {
      test(`labels are readable and do not collide at ${width} px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        for (const q of ['', 'coffee=4&tea=4', 'coffee=3&tea=3&order=interleave']) {
          await page.goto(URL + (q ? '?' + q : ''));
          await expect(page.locator('#bedtime-mg')).not.toHaveText('-- mg');
          const info = await page.evaluate(() => {
            const svg = document.getElementById('caffeine-graph');
            const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
            const rect = (e) => { const r = e.getBoundingClientRect(); return { l: r.left, r: r.right, t: r.top, b: r.bottom }; };
            const sizes = Array.from(svg.querySelectorAll('text')).map((t) => parseFloat(t.getAttribute('font-size')) * scale);
            return {
              minSize: Math.min.apply(null, sizes),
              drink: Array.from(svg.querySelectorAll('.drink-label')).map(rect),
              cutoff: Array.from(svg.querySelectorAll('.cutoff-label')).map(rect),
              svgBox: rect(svg),
            };
          });
          expect(info.minSize, `${q} at ${width}`).toBeGreaterThanOrEqual(10);
          const hit = (a, b) => a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b;
          for (const d of info.drink) for (const c of info.cutoff) expect(hit(d, c), `${q} drink/cut-off at ${width}`).toBe(false);
          for (let i = 0; i < info.drink.length; i++) for (let j = i + 1; j < info.drink.length; j++) {
            expect(hit(info.drink[i], info.drink[j]), `${q} drink labels at ${width}`).toBe(false);
          }
          for (let i = 0; i < info.cutoff.length; i++) for (let j = i + 1; j < info.cutoff.length; j++) {
            expect(hit(info.cutoff[i], info.cutoff[j]), `${q} cut-off labels at ${width}`).toBe(false);
          }
        }
      });
    }

    test('text scales when the window is resized to phone width', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(URL);
      await page.setViewportSize({ width: 360, height: 800 });
      await expect.poll(async () => page.evaluate(() => {
        const svg = document.getElementById('caffeine-graph');
        const scale = svg.getBoundingClientRect().width / svg.viewBox.baseVal.width;
        return Math.min.apply(null, Array.from(svg.querySelectorAll('text')).map((t) => parseFloat(t.getAttribute('font-size')) * scale));
      })).toBeGreaterThanOrEqual(10);
    });

    // x position of a clock time on the graph, from the page's own viewBox
    async function plotMapper(page, wake, sleep) {
      const width = await page.evaluate(() => document.getElementById('caffeine-graph').viewBox.baseVal.width);
      let sleepAbs = hhmm(sleep);
      if (sleepAbs <= hhmm(wake)) sleepAbs += 1440;
      const waking = sleepAbs - hhmm(wake);
      return (clock) => 40 + ((hhmm(clock) - hhmm(wake)) / waking) * (width - 40 - 58);
    }
    const zones = (page) => page.evaluate(() => {
      const box = (e) => ({ x: parseFloat(e.getAttribute('x')), w: parseFloat(e.getAttribute('width')) });
      const svg = document.getElementById('caffeine-graph');
      return {
        good: Array.from(svg.querySelectorAll('.zone-good')).map(box),
        bad: Array.from(svg.querySelectorAll('.zone-bad')).map(box),
      };
    });

    test('no green window is drawn inside the red zone', async ({ page }) => {
      for (const q of ['', 'wake=0700&sleep=1400&coffee=2&tea=2', 'coffee=3&tea=0', 'coffee=0&tea=0', 'wake=0600&sleep=2000&coffee=1&tea=1&metabolism=8']) {
        await page.goto(URL + (q ? '?' + q : ''));
        await expect(page.locator('#bedtime-mg')).not.toHaveText('-- mg');
        const z = await zones(page);
        expect(z.bad.length, q).toBeLessThanOrEqual(1);
        if (z.bad.length === 1) {
          for (const g of z.good) expect(g.x + g.w, `green ends inside red for "${q}"`).toBeLessThanOrEqual(z.bad[0].x + 0.5);
        } else {
          expect(z.good.length).toBeGreaterThan(0);
        }
      }
    });

    test('green is trimmed at the cut-off on the default day', async ({ page }) => {
      await page.goto(URL);
      const at = await plotMapper(page, '07:00', '22:30');
      const z = await zones(page);
      expect(z.bad).toHaveLength(1);
      expect(z.bad[0].x).toBeCloseTo(at('16:05'), 0);
      expect(z.good.length).toBeGreaterThan(0);
      // the 14:30 end of the afternoon window is already before the cut-off, so it is untouched;
      // the evening window (after 16:05) is not drawn at all
      const last = z.good[z.good.length - 1];
      expect(last.x + last.w).toBeCloseTo(at('14:30'), 0);
      expect(last.x + last.w).toBeLessThanOrEqual(z.bad[0].x);
    });

    test('a short day has no green inside red', async ({ page }) => {
      await page.goto(URL + '?wake=0700&sleep=1400&coffee=2&tea=2');
      const z = await zones(page);
      expect(z.bad).toHaveLength(1);
      for (const g of z.good) expect(g.x + g.w).toBeLessThanOrEqual(z.bad[0].x + 0.5);
    });

    test('the red zone starts at the latest cut-off of the types in use', async ({ page }) => {
      const cases = [
        ['coffee=3&tea=0', '14:10'],   // coffee only: coffee cut-off, not tea's
        ['coffee=0&tea=3', '16:05'],
        ['coffee=2&tea=2', '16:05'],
        ['coffee=0&tea=0', '16:05'],   // nothing in use: tea cut-off as before
      ];
      for (const [q, expected] of cases) {
        await page.goto(URL + '?' + q);
        await expect(page.locator('#bedtime-mg')).not.toHaveText('-- mg');
        const at = await plotMapper(page, '07:00', '22:30');
        const z = await zones(page);
        expect(z.bad, q).toHaveLength(1);
        expect(z.bad[0].x, q).toBeCloseTo(at(expected), 0);
      }
    });

    test('every graph label has a halo in the plot colour', async ({ page }) => {
      await page.goto(URL);
      const halos = await page.locator('#caffeine-graph text').evaluateAll((els) => els.map((e) => {
        const cs = getComputedStyle(e);
        return { paint: cs.paintOrder, stroke: cs.stroke, width: parseFloat(cs.strokeWidth), join: cs.strokeLinejoin };
      }));
      expect(halos.length).toBeGreaterThan(5);
      for (const h of halos) {
        expect(h.paint).toMatch(/^stroke/);
        expect(h.stroke).toBe('rgb(250, 250, 249)');
        expect(h.width).toBeGreaterThanOrEqual(3);
        expect(h.join).toBe('round');
      }
    });

    test('the right-hand mg labels fit inside the graph and carry a space', async ({ page }) => {
      for (const q of ['', 'coffee=8&tea=8']) {
        await page.goto(URL + (q ? '?' + q : ''));
        const labels = await page.evaluate(() => {
          const svg = document.getElementById('caffeine-graph');
          const right = svg.getBoundingClientRect().right;
          return Array.from(svg.querySelectorAll('text')).filter((t) => /mg$/.test(t.textContent))
            .map((t) => ({ text: t.textContent, over: t.getBoundingClientRect().right - right }));
        });
        expect(labels.length).toBeGreaterThan(2);
        for (const l of labels) {
          expect(l.text).toMatch(/^\d+ mg$/);
          expect(l.over, l.text).toBeLessThanOrEqual(0);
        }
      }
    });

    test('the cortisol curve peaks at about 90% of the plot, not flat at the top', async ({ page }) => {
      await page.goto(URL);
      const info = await page.evaluate(() => {
        const paths = Array.from(document.querySelectorAll('#caffeine-graph path[stroke="#C4A265"]'));
        const ys = paths[0].getAttribute('d').match(/,([\d.]+)/g).map((v) => parseFloat(v.slice(1)));
        const top = Math.min.apply(null, ys);
        return { top, atTop: ys.filter((y) => y === top).length };
      });
      // plot spans y = 15..(300 - 34) = 251 high: 90% height is y = 266 - 0.9 * 251 = about 40
      expect(info.top).toBeGreaterThan(36);
      expect(info.top).toBeLessThan(46);
      expect(info.atTop).toBeLessThanOrEqual(2);
    });

    test('at 8 coffees and 8 teas the per-drink labels are dropped', async ({ page }) => {
      await page.goto(URL + '?coffee=8&tea=8');
      await expect(page.locator('.schedule-item')).not.toHaveCount(0);
      await expect(page.locator('#caffeine-graph .drink-label')).toHaveCount(0);
      // The schedule list still has the times
      expect(await page.locator('.schedule-time-input').first().inputValue()).toMatch(/^\d\d:\d\d$/);
    });

    test('a light day keeps its per-drink labels', async ({ page }) => {
      await page.goto(URL + '?coffee=1&tea=1');
      await expect(page.locator('#caffeine-graph .drink-label')).toHaveCount(2);
    });
  });

  test.describe('copy', () => {
    test('page description and removed claims', async ({ page }) => {
      await page.goto(URL);
      const text = await page.locator('main, body').first().innerText();
      const html = await page.content();
      expect(html).toContain('When to stop drinking coffee and tea, based on sleep research');
      expect(html).not.toContain('Science-based timing');
      expect(text).not.toMatch(/25\s?mg threshold/i);
      expect(text).not.toMatch(/Below 25/i);
      expect(text).not.toMatch(/most effective between these peaks/i);
      expect(text).not.toMatch(/Last Safe|None left today/i);
      expect(text).not.toMatch(/\b2pm\b|\b7am\b|10-15mg/);
      // The page's own text: no em or en dashes
      expect(await page.locator('.methodology').innerText()).not.toMatch(/[\u2013\u2014]/);
    });

    test('new methodology copy', async ({ page }) => {
      await page.goto(URL);
      const m = await page.locator('.methodology').innerText();
      expect(m).toContain('Some people prefer to wait until after the cortisol awakening response before their first coffee. The evidence for this is thin, so treat the green windows as a preference, not a rule.');
      expect(m).toContain('Gardiner et al.');
      expect(m).toContain('107 mg coffee at least 8.8 hours before bed');
      expect(m).toContain('217.5 mg at least 13.2 hours before bed');
      expect(m).toContain('Slow metabolisers take around 8 hours (oral contraceptives raise it from roughly 5 to 8 hours)');
      expect(m).toContain('pregnancy slows it much further');
      expect(m).toContain('Smokers clear it faster');
      expect(m).toContain('a drink at 14:00');
      expect(m).toContain('at 07:00');
      expect(m).toContain('often 15-25 mg');
      expect((await page.locator('.methodology').textContent())).toContain('Read the paper (opens in a new tab)');
      expect(m).toContain('The tool assumes 95 mg per coffee (a mug of filter coffee) and 47 mg per tea. A UK instant coffee is often nearer 60-80 mg, and a high-street flat white can be 130 mg or more.');
    });

    test('legend and schedule use the page wording', async ({ page }) => {
      await page.goto(URL);
      const legend = (await page.locator('.graph-legend').innerText()).replace(/\s+/g, ' ');
      expect(legend).toContain('Coffee cut-off');
      expect(legend).toContain('Tea cut-off');
      expect(legend).toContain('Preferred window');
      expect(legend).not.toMatch(/cutoff|Optimal window/);
      const types = await page.locator('.schedule-type').allTextContents();
      expect(types.sort()).toEqual(['Coffee (95 mg)', 'Coffee (95 mg)', 'Tea (47 mg)', 'Tea (47 mg)']);
    });

    test('meta description and intro lead with the cut-offs', async ({ page }) => {
      await page.goto(URL);
      const meta = await page.locator('meta[name="description"]').getAttribute('content');
      expect(meta).toBe('When to stop drinking coffee and tea before bed, using cut-offs from a 2023 sleep research review. Set your wake and sleep times and get a schedule.');
      expect(meta.length).toBeLessThan(155);
      const intro = await page.locator('.caffeine-intro').first().innerText();
      expect(intro).toMatch(/^Work out the latest time to have your coffee and tea before bed/);
      expect(intro).not.toMatch(/based on your cortisol rhythm/);
      expect(intro).toMatch(/optional/);
    });

    test('the new-tab link says so to screen readers', async ({ page }) => {
      await page.goto(URL);
      const link = page.locator(`.methodology a[href="${DOI}"]`);
      await expect(link.locator('.visually-hidden')).toHaveText(' (opens in a new tab)');
    });

    test('the paper is linked in a new tab', async ({ page }) => {
      await page.goto(URL);
      const link = page.locator(`.methodology a[href="${DOI}"]`);
      await expect(link).toHaveCount(1);
      await expect(link).toHaveAttribute('target', '_blank');
      expect(await link.getAttribute('rel')).toContain('noopener');
    });
  });

  test('focus stays visible on every internal stop of a time field', async ({ page }) => {
    await page.goto(URL);
    await scheduleInput(page, 0).focus();
    let seen = 0;
    for (let i = 0; i < 6; i++) {
      const info = await page.evaluate(() => {
        const a = document.activeElement;
        if (!a || !a.classList.contains('schedule-time-input')) return null;
        const cs = getComputedStyle(a);
        return { outline: cs.outlineStyle, width: parseFloat(cs.outlineWidth), shadow: cs.boxShadow };
      });
      if (!info) break;
      seen++;
      expect(info.outline !== 'none' && info.width > 0, JSON.stringify(info)).toBe(true);
      await page.keyboard.press('Tab');
    }
    expect(seen).toBeGreaterThanOrEqual(3);
  });

  test('the count boxes show the whole digit at 360 px and are not tab stops', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 780 });
    await page.goto(URL + '?coffee=8&tea=2');
    const boxes = await page.evaluate(() => ['coffee-count', 'tea-count'].map((id) => {
      const e = document.getElementById(id);
      const col = e.closest('[class*="col-"]').getBoundingClientRect();
      const group = e.closest('.input-group').getBoundingClientRect();
      return {
        id, scroll: e.scrollWidth, client: e.clientWidth, tabindex: e.getAttribute('tabindex'),
        groupInside: group.left >= col.left - 0.5 && group.right <= col.right + 0.5,
        width: e.getBoundingClientRect().width,
      };
    }));
    for (const b of boxes) {
      expect(b.scroll, b.id).toBeLessThanOrEqual(b.client);
      expect(b.width, b.id).toBeGreaterThanOrEqual(24);
      expect(b.groupInside, `${b.id} stepper group inside its column`).toBe(true);
      expect(b.tabindex).toBe('-1');
    }
  });

  test('the second intro line gives the personal reason, keeping the disclaimer', async ({ page }) => {
    await page.goto(URL);
    const text = await page.locator('.caffeine-intro').nth(1).innerText();
    expect(text).toContain('I built this to stop my afternoon coffee costing me sleep.');
    expect(text).toContain('Tim Ferriss');
    expect(text).toContain('This is not medical advice.');
    expect(text).not.toContain('cortisol peaks');
  });

  test('stepper updates the schedule and totals', async ({ page }) => {
    await page.goto(URL + '?coffee=1&tea=0');
    await expect(page.locator('.schedule-item')).toHaveCount(1);
    await page.locator('[data-stepper="tea"][data-dir="1"]').click();
    await expect(page.locator('.schedule-item')).toHaveCount(2);
    await page.locator('[data-stepper="coffee"][data-dir="-1"]').click();
    await expect(page.locator('.schedule-item')).toHaveCount(1);
    await expect(page.locator('#last-coffee')).toHaveText('--:--');
    await expect(page.locator('#last-tea')).toHaveText('16:05');
  });
});

// WCAG contrast ratio between two CSS rgb()/rgba() or hex colours.
function contrast(fg, bg) {
  const lum = (c) => {
    let r, g, b;
    const hex = /^#([0-9a-f]{6})$/i.exec(c.trim());
    if (hex) {
      r = parseInt(hex[1].slice(0, 2), 16); g = parseInt(hex[1].slice(2, 4), 16); b = parseInt(hex[1].slice(4, 6), 16);
    } else {
      [r, g, b] = c.match(/[\d.]+/g).slice(0, 3).map(Number);
    }
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  const a = lum(fg), b = lum(bg);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}
