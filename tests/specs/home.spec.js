// Home page client logo strip: visible, no overlap, size-capped, no horizontal overflow.
const { test, expect } = require('../fixtures');

const WIDTHS = [360, 390, 1280];

for (const width of WIDTHS) {
  test(`client logos are laid out cleanly at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');

    const imgs = page.locator('.hp-logo-cell img');
    await expect(imgs).toHaveCount(9);

    // Lazy or async images may not have decoded yet; wait so boxes are final.
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
      expect(box.width, `logo ${i} width`).toBeLessThanOrEqual(150.5);
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

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow, 'no horizontal overflow').toBeLessThanOrEqual(0);
  });
}
