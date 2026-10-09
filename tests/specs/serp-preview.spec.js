const { test, expect } = require('../fixtures');

const URL = '/serp-preview/';

const PAYLOAD = `He said "hi" & it's <script>window.__pwned = 1</script> <img src=x onerror="window.__pwned = 1">`;
const PREVIEWS = ['#preview-desktop', '#preview-mobile', '#preview-ai', '#preview-social', '#validation'];

test.describe('SERP preview', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(URL);
    await expect(page.locator('#serp-title')).toBeVisible();
  });

  test.describe('user text is escaped, never live markup', () => {
    test('title, description and site name with quotes and script tags', async ({ page, dialogs }) => {
      await page.locator('#serp-title').fill(PAYLOAD);
      await page.locator('#serp-desc').fill(PAYLOAD);
      await page.locator('#serp-sitename').fill(PAYLOAD);
      await page.locator('#serp-keyphrase').fill('script window hi');

      for (const sel of PREVIEWS) {
        const box = page.locator(sel);
        await expect(box.locator('script'), `${sel} script elements`).toHaveCount(0);
        await expect(box.locator('img[onerror], [onerror], [onclick], [onload]'), `${sel} event handlers`).toHaveCount(0);
        // The injected <img> must not exist as an element anywhere inside the previews.
        await expect(box.locator('img[src="x"]'), `${sel} injected img`).toHaveCount(0);
      }

      // The text is shown literally.
      const desktopTitle = page.locator('#preview-desktop .google-title');
      await expect(desktopTitle).toContainText('<script>');
      await expect(desktopTitle).toContainText('"hi"');
      await expect(desktopTitle).toContainText("it's");
      await expect(page.locator('#preview-ai .ai-source-title').first()).toContainText('<script>window.__pwned = 1</script>');
      await expect(page.locator('#preview-social .social-card-title')).toHaveText(PAYLOAD);
      await expect(page.locator('#preview-social .social-card-desc')).toHaveText(PAYLOAD);

      // Nothing executed.
      expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
      expect(dialogs).toEqual([]);
    });

    test('URL, image and keyphrase fields cannot inject markup or attributes', async ({ page, dialogs }) => {
      await page.locator('#serp-title').fill('A normal title');
      await page.locator('#serp-url').fill(`https://example.com/"><script>window.__pwned=1</script>/a'b`);
      await page.locator('#serp-image').fill(`https://example.com/a.jpg');background:red;x:('" onerror="window.__pwned=1`);
      await page.locator('#serp-keyphrase').fill('<script> "quot" lt gt amp');

      for (const sel of PREVIEWS) {
        const box = page.locator(sel);
        await expect(box.locator('script'), `${sel} script elements`).toHaveCount(0);
        await expect(box.locator('[onerror], [onclick], [onload]'), `${sel} event handlers`).toHaveCount(0);
      }
      expect(await page.evaluate(() => window.__pwned)).toBeUndefined();
      expect(dialogs).toEqual([]);
    });

    // escapeHtml() turns ' into &#39;, which the browser decodes back to ' inside the style
    // attribute, so the .replace(/'/g, '%27') that follows it in renderSocialCard() never fires.
    // A quote in the image URL therefore closes url('...') and lets the user add CSS declarations.
    // No script runs (the attribute itself cannot be escaped) and the text is the user's own input,
    // but it is not the "stays inside url()" behaviour the code intends.
    test.fixme('image URL containing a quote stays inside url() and cannot add CSS declarations', async ({ page }) => {
      await page.locator('#serp-image').fill(`https://example.com/a.jpg');background:red;x:('`);
      const bg = await page.locator('#preview-social .social-card-image').evaluate((e) => ({
        style: e.getAttribute('style'), colour: getComputedStyle(e).backgroundColor,
      }));
      expect(bg.colour).toBe('rgba(0, 0, 0, 0)');
      expect(bg.style).not.toMatch(/;\s*background:\s*red/);
    });

    test('keyphrase bolding keeps entities intact', async ({ page }) => {
      await page.locator('#serp-title').fill(`Tom & Jerry's "best" <b>bold</b> guide`);
      await page.locator('#serp-keyphrase').fill('amp quot lt best guide');
      const html = await page.locator('#preview-desktop .google-title').innerHTML();
      expect(html).not.toMatch(/&<b>/);
      expect(html).not.toMatch(/<b>bold<\/b>[^<]*<\/b>/);
      await expect(page.locator('#preview-desktop .google-title')).toHaveText(`Tom & Jerry's "best" <b>bold</b> guide`);
      // Only the page's own bold tags (around keyphrase words) exist.
      const bolds = await page.locator('#preview-desktop .google-title b').allInnerTexts();
      expect(bolds.sort()).toEqual(['best', 'guide']);
    });
  });

  test.describe('storage and consent', () => {
    test('nothing is written to localStorage before consent', async ({ page }) => {
      await page.locator('#serp-title').fill('Typed before consent');
      await page.locator('#serp-desc').fill('A description typed before consent is given.');
      await page.locator('#serp-url').fill('https://www.example.com/page/');
      await page.locator('#serp-sitename').fill('Example');
      await page.locator('#serp-image').fill('https://www.example.com/i.jpg');
      await page.locator('#serp-keyphrase').fill('typed');
      await page.locator('#serp-date').fill('2026-01-02');

      const state = await page.evaluate(() => ({
        consent: CookieConsent.acceptedCategory('functionality'),
        length: localStorage.length,
        keys: Object.keys(localStorage),
        cookie: document.cookie,
      }));
      expect(state.consent).toBe(false);
      expect(state.keys).toEqual([]);
      expect(state.length).toBe(0);
      expect(state.cookie).not.toMatch(/serp/i);

      // Reload: nothing may be restored either.
      await page.reload();
      await expect(page.locator('#serp-title')).toHaveValue('');
    });

    test('control: the same typing is stored once consent is granted (so the check above can fail)', async ({ page }) => {
      await page.evaluate(() => CookieConsent.acceptCategory(['functionality']));
      await page.locator('#serp-title').fill('Typed after consent');
      const stored = await page.evaluate(() => localStorage.getItem('serp-preview-v1'));
      expect(stored).toContain('Typed after consent');
    });

    // load() runs from an inline script during parsing, before the deferred cc.js and
    // cookieconsent-config.js have executed, so typeof CookieConsent is still 'undefined' and
    // canUseStorage() is false. Saved fields are written but never restored on the next visit.
    test.fixme('fields saved after consent are restored on the next visit', async ({ page }) => {
      await page.evaluate(() => CookieConsent.acceptCategory(['functionality']));
      await page.locator('#serp-title').fill('Typed after consent');
      await page.reload();
      await expect(page.locator('#serp-title')).toHaveValue('Typed after consent');
    });
  });

  test.describe('pixel-width truncation', () => {
    const LONG = 'An extremely long page title that keeps going and going well past any sensible search result width limit '.repeat(3).trim();

    test('a very long title is cut with an ellipsis on desktop and mobile previews', async ({ page }) => {
      await page.locator('#serp-title').fill(LONG);
      const desktop = (await page.locator('#preview-desktop .google-title').textContent()) || '';
      const mobile = (await page.locator('#preview-mobile .google-title').textContent()) || '';
      expect(desktop).toMatch(/\.\.\.$/);
      expect(mobile).toMatch(/\.\.\.$/);
      expect(desktop.length).toBeLessThan(LONG.length);
      expect(mobile.length).toBeLessThanOrEqual(desktop.length);
      expect(LONG.startsWith(desktop.slice(0, -3))).toBe(true);

      // The counter and validation say so too.
      await expect(page.locator('#title-pixels')).toHaveClass(/over/);
      await expect(page.locator('#validation')).toContainText('Title will truncate on desktop');
      await expect(page.locator('#validation')).toContainText('Title will truncate on mobile');
    });

    test('a short title is not truncated', async ({ page }) => {
      await page.locator('#serp-title').fill('Short title');
      await expect(page.locator('#preview-desktop .google-title')).toHaveText('Short title');
      await expect(page.locator('#preview-mobile .google-title')).toHaveText('Short title');
      await expect(page.locator('#title-pixels')).toHaveClass(/ok/);
    });

    test('a very long description is cut with an ellipsis', async ({ page }) => {
      const desc = 'This meta description is far too long for any search result and should be truncated. '.repeat(8).trim();
      await page.locator('#serp-desc').fill(desc);
      const shown = (await page.locator('#preview-desktop .google-description').textContent()) || '';
      expect(shown).toMatch(/\.\.\.$/);
      expect(shown.length).toBeLessThan(desc.length);
      await expect(page.locator('#desc-pixels')).toHaveClass(/over/);
    });
  });
});
