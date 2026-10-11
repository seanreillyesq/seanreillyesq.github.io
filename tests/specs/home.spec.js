// Home page: client logo strip (visible, no overlap, size-capped, evenly weighted, no horizontal
// overflow), the hero's two buttons, and content that stays visible when the reveal script cannot run.
const { test, expect } = require('../fixtures');

const WIDTHS = [360, 390, 1280];

for (const width of WIDTHS) {
  test(`client logos are laid out cleanly at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    const imgs = page.locator('.hp-logo-cell img');
    await expect(imgs).toHaveCount(9);

    // The strip is below the fold and lazy-loaded: scroll each logo into view, then wait for decode.
    for (let i = 0; i < 9; i++) await imgs.nth(i).scrollIntoViewIfNeeded();
    await page.evaluate(() => Promise.all(
      [...document.querySelectorAll('.hp-logo-cell img')].map((i) => i.decode().catch(() => {}))
    ));

    const boxes = [];
    for (let i = 0; i < 9; i++) {
      const img = imgs.nth(i);
      await img.scrollIntoViewIfNeeded();
      await expect(img).toBeVisible();
      const box = await img.boundingBox();
      expect(box.width, `logo ${i} has width`).toBeGreaterThan(0);
      expect(box.height, `logo ${i} has height`).toBeGreaterThan(0);
      expect(box.height, `logo ${i} height`).toBeLessThanOrEqual(56.5);
      expect(box.width, `logo ${i} width`).toBeLessThanOrEqual(200.5);
      boxes.push({ i, ...(await img.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
      })) });
    }

    for (let a = 0; a < boxes.length; a++) {
      for (let b = a + 1; b < boxes.length; b++) {
        const p = boxes[a], q = boxes[b];
        const overlap = p.x < q.x + q.w && q.x < p.x + p.w && p.y < q.y + q.h && q.y < p.y + p.h;
        expect(overlap, `logos ${a} and ${b} must not intersect`).toBe(false);
      }
    }

    // Each logo should cover a similar area, so none dominates and none is unreadably small.
    const areas = boxes.map((b) => b.w * b.h);
    expect(Math.max(...areas) / Math.min(...areas), 'largest logo area over smallest').toBeLessThanOrEqual(1.6);

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, 'no horizontal overflow').toBeLessThanOrEqual(0);
  });
}

test('the hero leads with Work with me and has one secondary button', async ({ page }) => {
  await page.goto('/');
  const buttons = page.locator('.hp-hero a.btn');
  await expect(buttons).toHaveCount(2);
  await expect(buttons.nth(0)).toHaveText(/work with me/i);
  await expect(buttons.nth(0)).toHaveAttribute('href', '/work-with-me/');
  await expect(buttons.nth(0)).toHaveClass(/btn-accent/);
  await expect(buttons.nth(1)).toHaveAttribute('href', '/blog/');
  await expect(buttons.nth(1)).toHaveClass(/btn-outline-accent/);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('reveal sections are visible rather than waiting on a script', async ({ page }) => {
    await page.goto('/');
    const reveals = page.locator('.reveal');
    const count = await reveals.count();
    expect(count).toBeGreaterThan(5);
    for (let i = 0; i < count; i++) {
      await expect(reveals.nth(i), `reveal ${i}`).toHaveCSS('opacity', '1');
    }
  });
});

test.describe('hero background preview', () => {
  const hero = (page) => page.locator('.hp-hero').evaluate((el) => getComputedStyle(el).backgroundImage);
  const navColour = (page) => page.locator('#mainNav .nav-link').first().evaluate((el) => getComputedStyle(el).color);

  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
  });

  test('the plain address keeps the sky photo and white menu text', async ({ page }) => {
    await page.goto('/');
    expect(await hero(page)).toContain('digital-marketing-consultant.jpg');
    expect(await navColour(page)).toBe('rgb(255, 255, 255)');
  });

  for (const query of ['?=a', '?bg=a']) {
    test(`${query} shows plain white with dark menu text`, async ({ page }) => {
      await page.goto('/' + query);
      expect(await hero(page)).toBe('none');
      expect(await navColour(page)).toBe('rgb(45, 45, 45)');
    });
  }

  for (const query of ['?=b', '?bg=B']) {
    test(`${query} shows the tint with dark menu text`, async ({ page }) => {
      await page.goto('/' + query);
      expect(await hero(page)).toContain('linear-gradient');
      expect(await navColour(page)).toBe('rgb(45, 45, 45)');
    });
  }
});
