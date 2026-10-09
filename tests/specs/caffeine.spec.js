const { test, expect } = require('../fixtures');

const URL = '/caffeine/';
const COFFEE_MG = 95, TEA_MG = 47, THRESHOLD = 25;

const hhmm = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };

// Read the schedule the page rendered: minutes since wake plus mg for each drink.
async function readState(page) {
  return page.evaluate(() => {
    const wake = document.getElementById('wake-time').value;
    const sleep = document.getElementById('sleep-time').value;
    const drinks = Array.from(document.querySelectorAll('.schedule-item')).map((li) => ({
      clock: li.querySelector('.schedule-time-input').value,
      label: li.querySelector('.schedule-type').textContent,
    }));
    return {
      wake, sleep, drinks,
      lastCoffee: document.getElementById('last-coffee').textContent.trim(),
      lastTea: document.getElementById('last-tea').textContent.trim(),
      bedtimeText: document.getElementById('bedtime-mg').textContent.trim(),
      bedtimeColour: getComputedStyle(document.getElementById('bedtime-mg')).color,
      bedtimeTitle: document.getElementById('bedtime-mg').title,
    };
  });
}

// Normalise to minutes since wake (handles days that cross midnight).
function derive(st, halfLife) {
  const wake = hhmm(st.wake);
  let sleepAbs = hhmm(st.sleep);
  if (sleepAbs <= wake) sleepAbs += 1440;
  const waking = sleepAbs - wake;
  const sinceWake = (clock) => (hhmm(clock) - wake + 1440) % 1440;
  const k = Math.LN2 / (halfLife * 60);
  const drinks = st.drinks.map((d) => ({
    rel: sinceWake(d.clock),
    mg: /^Coffee/.test(d.label) ? COFFEE_MG : TEA_MG,
  }));
  const at = (t, extra) => drinks
    .concat(extra || [])
    .reduce((sum, d) => sum + (d.rel <= t ? d.mg * Math.exp(-k * (t - d.rel)) : 0), 0);
  return { wake, waking, drinks, k, sinceWake, bedtime: at(waking), at };
}

const configs = [
  { name: 'defaults', q: '' },
  { name: 'one coffee', q: 'coffee=1&tea=0' },
  { name: 'one tea', q: 'coffee=0&tea=1' },
  { name: 'one of each', q: 'coffee=1&tea=1' },
  { name: 'two teas, slow metaboliser', q: 'coffee=0&tea=2&metabolism=7' },
  { name: 'one tea, fast metaboliser', q: 'coffee=0&tea=1&metabolism=3' },
  { name: 'three and three', q: 'coffee=3&tea=3' },
  { name: 'four coffees, slow metaboliser', q: 'coffee=4&tea=1&metabolism=7' },
  { name: 'fast metaboliser, tea first', q: 'coffee=2&tea=3&metabolism=3&order=tea-first' },
  { name: 'interleave', q: 'coffee=3&tea=3&order=interleave' },
  { name: 'early sleeper', q: 'wake=0600&sleep=2030&coffee=3&tea=2' },
  { name: 'night owl crossing midnight', q: 'wake=1000&sleep=0200&coffee=3&tea=2&metabolism=7' },
  { name: 'heavy preset', q: 'coffee=8&tea=8' },
  { name: 'heavy, slow, interleave', q: 'coffee=6&tea=6&metabolism=7&order=interleave' },
];

test.describe('Caffeine calculator', () => {
  test.describe('last safe drink accounts for caffeine already consumed', () => {
    for (const c of configs) {
      test(c.name, async ({ page }) => {
        await page.goto(URL + (c.q ? '?' + c.q : ''));
        await expect(page.locator('#bedtime-mg')).not.toHaveText('-- mg');
        const st = await readState(page);
        const halfLife = Number(await page.locator('#metabolism').inputValue());
        const m = derive(st, halfLife);

        for (const [label, text, mg, count] of [
          ['coffee', st.lastCoffee, COFFEE_MG, Number(await page.locator('#coffee-count').inputValue())],
          ['tea', st.lastTea, TEA_MG, Number(await page.locator('#tea-count').inputValue())],
        ]) {
          if (count === 0) { expect(text).toBe('--:--'); continue; }

          if (m.bedtime >= THRESHOLD) {
            // The day is already at or over the threshold: no time may be claimed as safe.
            expect(text, `last ${label} when ${m.bedtime.toFixed(1)} mg remain at bedtime`).toBe('None left today');
            continue;
          }
          if (text === 'None left today') continue;

          expect(text).toMatch(/^\d\d:\d\d$/);
          // Adding one more drink at the stated time must keep bedtime caffeine within the threshold.
          const t = m.sinceWake(text);
          const total = m.at(m.waking, [{ rel: t, mg }]);
          expect(total, `bedtime mg if one more ${label} is drunk at ${text}`).toBeLessThanOrEqual(THRESHOLD + 0.5);
        }
      });
    }
  });

  test('the residual-aware time is earlier than the single-drink time', async ({ page }) => {
    // One tea is already scheduled, so a second drink has to fit in what is left of the 25 mg
    // allowance. The stated time must therefore be earlier than the naive "47 mg decays to 25 mg
    // by bedtime" time, which ignores the tea already drunk.
    await page.goto(URL + '?coffee=0&tea=1');
    const st = await readState(page);
    const m = derive(st, 5);
    expect(st.lastTea).toMatch(/^\d\d:\d\d$/);
    const naive = hhmm(st.sleep) - Math.log(TEA_MG / THRESHOLD) / m.k;
    expect(hhmm(st.lastTea)).toBeLessThan(naive - 30);
  });

  test('heavy preset flags bedtime caffeine instead of claiming a safe time', async ({ page }) => {
    await page.goto(URL);
    for (let i = 0; i < 6; i++) await page.locator('[data-stepper="coffee"][data-dir="1"]').click();
    for (let i = 0; i < 6; i++) await page.locator('[data-stepper="tea"][data-dir="1"]').click();
    await expect(page.locator('#coffee-count')).toHaveValue('8');
    await expect(page.locator('#tea-count')).toHaveValue('8');

    const st = await readState(page);
    const mg = parseInt(st.bedtimeText, 10);
    expect(mg).toBeGreaterThan(THRESHOLD);
    expect(st.bedtimeColour).toBe('rgb(220, 38, 38)');
    expect(st.bedtimeTitle).toMatch(/25 mg threshold/);
    expect(st.lastCoffee).toBe('None left today');
    expect(st.lastTea).toBe('None left today');
  });

  test('a light day is not flagged', async ({ page }) => {
    await page.goto(URL + '?coffee=0&tea=1');
    const st = await readState(page);
    expect(parseInt(st.bedtimeText, 10)).toBeLessThanOrEqual(THRESHOLD);
    expect(st.bedtimeTitle).toBe('');
    expect(st.lastTea).toMatch(/^\d\d:\d\d$/);
  });

  test.describe('no scheduled drink is placed before wake time', () => {
    const days = [
      'wake=0700&sleep=2230&coffee=2&tea=2',
      'wake=0500&sleep=2100&coffee=4&tea=4&order=interleave',
      'wake=0900&sleep=2300&coffee=3&tea=3&order=tea-first',
      'wake=1000&sleep=1800&coffee=3&tea=3',                        // short day: cutoffs close to wake
      'wake=1000&sleep=1800&coffee=3&tea=3&order=interleave',
      'wake=1000&sleep=1800&coffee=3&tea=3&order=tea-first',
      'wake=1200&sleep=1500&coffee=2&tea=2&order=interleave',       // very short day
      'wake=1000&sleep=0200&coffee=4&tea=4&metabolism=7',            // crosses midnight
      'wake=0000&sleep=2359&coffee=8&tea=8',
      'wake=0700&sleep=2230&coffee=8&tea=8&metabolism=7&order=interleave',
    ];
    for (const q of days) {
      test(q, async ({ page }) => {
        await page.goto(URL + '?' + q);
        await expect(page.locator('#bedtime-mg')).not.toHaveText('-- mg');
        const st = await readState(page);
        const m = derive(st, Number(await page.locator('#metabolism').inputValue()));
        for (const d of st.drinks) {
          const rel = m.sinceWake(d.clock);
          // A drink placed before wake shows up as a clock time late in the "day" (rel wraps round to
          // near 24h), which is outside the waking window.
          expect(rel, `${d.label} at ${d.clock} (wake ${st.wake}, sleep ${st.sleep})`).toBeGreaterThanOrEqual(0);
          expect(rel, `${d.label} at ${d.clock} (wake ${st.wake}, sleep ${st.sleep})`).toBeLessThanOrEqual(m.waking);
        }
      });
    }
  });

  test('stepper updates the schedule and totals', async ({ page }) => {
    await page.goto(URL + '?coffee=1&tea=0');
    await expect(page.locator('.schedule-item')).toHaveCount(1);
    await page.locator('[data-stepper="tea"][data-dir="1"]').click();
    await expect(page.locator('.schedule-item')).toHaveCount(2);
    await page.locator('[data-stepper="coffee"][data-dir="-1"]').click();
    await expect(page.locator('.schedule-item')).toHaveCount(1);
    await expect(page.locator('#last-coffee')).toHaveText('--:--');
  });
});
