// Site chrome: page headers, current-page marker, keyboard focus and long-word wrapping.
const { test, expect } = require('../fixtures');

test.describe('page headers', () => {
  for (const url of ['/about/', '/work-with-me/', '/contact/', '/blog/']) {
    test(`header has the overlay on ${url}`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator('header.intro-header')).toHaveClass(/has-overlay/);
    });
  }

  const headings = { '/about/': 'About', '/work-with-me/': 'Work With Me', '/contact/': 'Contact', '/blog/': 'Blog' };
  for (const [url, h1] of Object.entries(headings)) {
    test(`h1 is "${h1}" on ${url}`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator('h1').first()).toHaveText(h1);
    });
  }

  test('404 h1 is not the site title', async ({ page }) => {
    await page.goto('/404.html');
    await expect(page.locator('h1').first()).not.toHaveText('Sean Reilly');
  });

  test('home and tool h1 are unchanged', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toHaveText('Sean Reilly');
    await page.goto('/roas-calculator/');
    await expect(page.locator('h1').first()).toHaveText('ROAS Calculator');
  });
});

test.describe('current page marker', () => {
  for (const [url, label] of [['/about/', 'About'], ['/blog/', 'Blog'], ['/contact/', 'Contact']]) {
    test(`${url} marks ${label}`, async ({ page }) => {
      await page.goto(url);
      const current = page.locator('#mainNav a[aria-current="page"]');
      await expect(current).toHaveCount(1);
      await expect(current).toHaveText(label);
      await expect(current).toHaveClass(/active/);
    });
  }

  test('home marks Home', async ({ page }) => {
    await page.goto('/');
    const current = page.locator('#mainNav a[aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveText('Home');
    await expect(current).toHaveClass(/active/);
  });

  test('no page marks more than one link', async ({ page }) => {
    for (const url of ['/', '/about/', '/blog/', '/contact/', '/work-with-me/', '/tools/', '/roas-calculator/', '/large-ecommerce-sitemap-specification-20170528/']) {
      await page.goto(url);
      expect(await page.locator('#mainNav a[aria-current="page"]').count(), url).toBeLessThanOrEqual(1);
    }
  });

  test('a post marks Blog', async ({ page }) => {
    await page.goto('/large-ecommerce-sitemap-specification-20170528/');
    const current = page.locator('#mainNav a[aria-current="page"]');
    await expect(current).toHaveCount(1);
    await expect(current).toHaveText('Blog');
  });
});

test.describe('keyboard focus', () => {
  async function tabTo(page, selector) {
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab');
      if (await page.evaluate((s) => document.activeElement && document.activeElement.matches(s), selector)) return;
    }
    throw new Error('never focused ' + selector);
  }
  async function outline(page) {
    return page.evaluate(() => {
      const cs = getComputedStyle(document.activeElement);
      return { style: cs.outlineStyle, width: parseFloat(cs.outlineWidth) };
    });
  }

  test('first .btn-accent on home shows an outline', async ({ page }, info) => {
    test.skip(info.project.name !== 'desktop-1280', 'nav links are collapsed at 390');
    await page.goto('/');
    await tabTo(page, '.btn-accent');
    const o = await outline(page);
    expect(o.style).not.toBe('none');
    expect(o.width).toBeGreaterThanOrEqual(2);
  });

  test('a .nav-link shows an outline at 1280', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/about/');
    await tabTo(page, '.nav-link');
    const o = await outline(page);
    expect(o.style).not.toBe('none');
    expect(o.width).toBeGreaterThanOrEqual(2);
  });
});

test.describe('long words', () => {
  for (const width of [390, 360]) {
    test(`sitemap post does not overflow at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto('/large-ecommerce-sitemap-specification-20170528/');
      const [sw, iw] = await page.evaluate(() => [document.documentElement.scrollWidth, window.innerWidth]);
      expect(sw).toBeLessThanOrEqual(iw);
    });
  }

  for (const width of [360, 390, 1280]) {
    for (const url of ['/customer-economics/', '/roas-calculator/']) {
      test(`result values stay on one line at ${width} on ${url}`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(url);
        const bad = await page.evaluate(() => [...document.querySelectorAll('.result-value')]
          .filter((el) => el.offsetParent !== null)
          .filter((el) => {
            // Measure the leading text only: some values carry a deliberate <small> second line.
            const range = document.createRange();
            range.selectNodeContents(el.firstChild);
            const rects = [...range.getClientRects()];
            return rects.length > 0 && Math.max(...rects.map((r) => r.bottom)) - Math.min(...rects.map((r) => r.top)) > rects[0].height * 1.5;
          })
          .map((el) => el.id + ':' + el.textContent));
        expect(bad).toEqual([]);
      });
    }
  }
});
