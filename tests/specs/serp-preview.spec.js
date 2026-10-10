const { test, expect } = require('../fixtures');

const URL = '/serp-preview/';

const PAYLOAD = `He said "hi" & it's <script>window.__pwned = 1</script> <img src=x onerror="window.__pwned = 1">`;
const accept = (page) => page.evaluate(() => CookieConsent.acceptCategory(['functionality']));
// The consent library skips itself for automated browsers (hideFromBots checks navigator.webdriver),
// so it would never read its own cookie back after a reload. Hide that flag, as the caffeine spec
// does, so reloads behave as they do for a person.
async function acceptAcrossReloads(page) {
  await page.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); });
  await page.reload();
  await expect(page.locator('#serp-title')).toBeVisible();
  await accept(page);
}
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

    // The image URL is quoted for CSS and set through the DOM, so a quote in it can neither
    // break the image nor add declarations.
    test('image URL containing a quote stays inside url() and cannot add CSS declarations', async ({ page }) => {
      const image = page.locator('#preview-social .social-card-image');
      const baseline = await image.evaluate((e) => getComputedStyle(e).backgroundColor);

      await page.locator('#serp-image').fill(`https://example.com/a.jpg');background:red;x:('`);
      const bg = await image.evaluate((e) => ({
        declarations: e.style.length, colour: getComputedStyle(e).backgroundColor, image: getComputedStyle(e).backgroundImage,
      }));
      expect(bg.colour).toBe(baseline);
      expect(bg.declarations).toBe(1); // background-image only
      expect(bg.image).toContain(`a.jpg');background:red;x:('`);
    });

    test('image URL with an apostrophe still loads as the card image', async ({ page }) => {
      await page.locator('#serp-image').fill(`https://example.com/it's.jpg`);
      const image = await page.locator('#preview-social .social-card-image').evaluate((e) => getComputedStyle(e).backgroundImage);
      expect(image).toBe(`url("https://example.com/it's.jpg")`);
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
      await accept(page);
      await page.locator('#serp-title').fill('Typed after consent');
      const stored = await page.evaluate(() => localStorage.getItem('serp-preview-v1'));
      expect(stored).toContain('Typed after consent');
    });

    const FIELDS = {
      '#serp-title': 'Typed after consent',
      '#serp-desc': 'A saved description that is long enough to count as a real snippet.',
      '#serp-url': 'https://www.example.com/saved/',
      '#serp-date': '2026-01-02',
      '#serp-sitename': 'Saved Site',
      '#serp-image': 'https://www.example.com/saved.jpg',
      '#serp-keyphrase': 'saved',
    };

    test('fields saved after consent are restored on the next visit', async ({ page }) => {
      await acceptAcrossReloads(page);
      for (const [sel, value] of Object.entries(FIELDS)) await page.locator(sel).fill(value);
      await page.reload();
      for (const [sel, value] of Object.entries(FIELDS)) await expect(page.locator(sel), sel).toHaveValue(value);
      await expect(page.locator('#preview-desktop .google-title')).toContainText('Typed after consent');
    });

    test('the first keystroke after a reload does not wipe the saved fields', async ({ page }) => {
      await acceptAcrossReloads(page);
      for (const [sel, value] of Object.entries(FIELDS)) await page.locator(sel).fill(value);
      await page.reload();
      await page.locator('#serp-keyphrase').focus();
      await page.keyboard.press('End');
      await page.keyboard.press('x');
      const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('serp-preview-v1')));
      expect(stored.title).toBe(FIELDS['#serp-title']);
      expect(stored.desc).toBe(FIELDS['#serp-desc']);
      expect(stored.url).toBe(FIELDS['#serp-url']);
      expect(stored.sitename).toBe(FIELDS['#serp-sitename']);
      expect(stored.keyphrase).toBe('savedx');
    });

    test('a deliberately cleared Site Name stays cleared after a reload', async ({ page }) => {
      await acceptAcrossReloads(page);
      await page.locator('#serp-title').fill('Has a title');
      await page.locator('#serp-sitename').fill('');
      await page.reload();
      await expect(page.locator('#serp-title')).toHaveValue('Has a title');
      await expect(page.locator('#serp-sitename')).toHaveValue('');
    });
  });

  test.describe('pixel-width truncation', () => {
    const LONG = 'An extremely long page title that keeps going and going well past any sensible search result width limit '.repeat(3).trim();

    test('a very long title is cut with an ellipsis on desktop and mobile previews', async ({ page }) => {
      await page.locator('#serp-title').fill(LONG);
      const desktop = (await page.locator('#preview-desktop .google-title').textContent()) || '';
      const mobile = (await page.locator('#preview-mobile .google-title').textContent()) || '';
      expect(desktop).toMatch(/\u2026$/);
      expect(mobile).toMatch(/\u2026$/);
      expect(desktop.length).toBeLessThan(LONG.length);
      expect(mobile.length).toBeLessThanOrEqual(desktop.length);
      expect(LONG.startsWith(desktop.slice(0, -1))).toBe(true);

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
      expect(shown).toMatch(/\u2026$/);
      expect(shown.length).toBeLessThan(desc.length);
      await expect(page.locator('#desc-pixels')).toHaveClass(/over/);
    });
  });

  test.describe('desktop title width', () => {
    test('a title just under the truncation limit sits on one line at 1280px', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      // Build a title that measures between the old text-area width (558px) and the limit (580px).
      const built = await page.evaluate(() => {
        const c = document.createElement('canvas').getContext('2d');
        c.font = '20px Arial';
        let t = 'Pixel width guide for search titles';
        while (c.measureText(t + 'i').width <= 580) t += t.length % 7 === 0 ? ' i' : 'i';
        return { t, w: Math.ceil(c.measureText(t).width) };
      });
      expect(built.w).toBeGreaterThan(570);
      expect(built.w).toBeLessThanOrEqual(580);

      const title = page.locator('#preview-desktop .google-title');
      await page.locator('#serp-title').fill('One line');
      const oneLine = await title.evaluate((e) => e.getBoundingClientRect().height);

      await page.locator('#serp-title').fill(built.t);
      await expect(page.locator('#title-pixels')).not.toHaveClass(/over/);
      await expect(title).toHaveText(built.t);
      expect(await title.evaluate((e) => e.getBoundingClientRect().height)).toBe(oneLine);
    });
  });

  test.describe('fetch from URL', () => {
    const stub = (page, body) => page.route('**/api/fetch-meta*', (route) => route.fulfill({
      status: 200, contentType: 'application/json', body: JSON.stringify(body),
    }));
    async function fetchUrl(page) {
      await accept(page);
      await page.locator('#serp-fetch-toggle').check();
      await page.locator('#serp-fetch-url').fill('https://www.example.com/post/');
      await page.locator('#serp-fetch-btn').click();
      await expect(page.locator('#serp-fetch-status')).toContainText('Loaded');
    }

    test('the social card uses fetched og:title and og:description', async ({ page }) => {
      await stub(page, {
        title: 'Page title', description: 'Meta description text.',
        ogTitle: 'Open Graph title', ogDescription: 'Open Graph description.',
        fetchedUrl: 'https://www.example.com/post/',
      });
      await fetchUrl(page);
      await expect(page.locator('#preview-social .social-card-title')).toHaveText('Open Graph title');
      await expect(page.locator('#preview-social .social-card-desc')).toHaveText('Open Graph description.');
      await expect(page.locator('#preview-desktop .google-title')).toHaveText('Page title');
      await expect(page.locator('#preview-desktop .google-description')).toContainText('Meta description text.');
    });

    test('the social card falls back to the title and description without og values', async ({ page }) => {
      await stub(page, { title: 'Page title', description: 'Meta description text.', fetchedUrl: 'https://www.example.com/post/' });
      await fetchUrl(page);
      await expect(page.locator('#preview-social .social-card-title')).toHaveText('Page title');
      await expect(page.locator('#preview-social .social-card-desc')).toHaveText('Meta description text.');
    });

    test('fetched og values are dropped once the URL field is edited', async ({ page }) => {
      await stub(page, { title: 'Page title', ogTitle: 'Open Graph title', fetchedUrl: 'https://www.example.com/post/' });
      await fetchUrl(page);
      await page.locator('#serp-url').fill('https://www.example.com/other/');
      await expect(page.locator('#preview-social .social-card-title')).toHaveText('Page title');
    });
  });

  test.describe('counters and validation agree', () => {
    test('the description counter includes the date prefix, as validation does', async ({ page }) => {
      const desc = 'Coffee and sleep, explained with a calculator that shows how long caffeine stays in your system after each cup. '.repeat(2).trim();
      await page.locator('#serp-desc').fill(desc);
      const withoutDate = Number((await page.locator('#desc-pixels').textContent()).match(/^(\d+)px/)[1]);

      await page.locator('#serp-date').fill('2026-01-02');
      const counter = Number((await page.locator('#desc-pixels').textContent()).match(/^(\d+)px/)[1]);
      const validation = Number((await page.locator('#validation').textContent()).match(/Description[^(]*\((\d+)px/)[1]);
      expect(counter).toBeGreaterThan(withoutDate);
      expect(counter).toBe(validation);
    });

    test('character count uses characters, not UTF-16 units', async ({ page }) => {
      await page.locator('#serp-title').fill('Best tips \u{1F600}\u{1F600}');
      await expect(page.locator('#title-chars')).toHaveText('12 chars');
      await page.locator('#serp-desc').fill('\u{1F468}\u{200D}\u{1F469}\u{200D}\u{1F467} family');
      await expect(page.locator('#desc-chars')).toHaveText('8 chars');
    });

    test('runs of whitespace are collapsed before measuring', async ({ page }) => {
      await page.locator('#serp-title').fill('Best tips');
      const single = await page.locator('#title-pixels').textContent();
      await page.locator('#serp-title').fill('  Best      tips   ');
      await expect(page.locator('#title-pixels')).toHaveText(single);
      await page.locator('#serp-desc').fill('Some description text here');
      const descSingle = await page.locator('#desc-pixels').textContent();
      await page.locator('#serp-desc').fill('Some   description \n\n text    here  ');
      await expect(page.locator('#desc-pixels')).toHaveText(descSingle);
    });
  });

  test.describe('ellipsis', () => {
    test('title is cut at a word boundary with one ellipsis character and no trailing punctuation', async ({ page }) => {
      const full = 'Coffee, tea, water, juice, '.repeat(8).trim();
      await page.locator('#serp-title').fill(full);
      const shown = (await page.locator('#preview-desktop .google-title').textContent()) || '';
      expect(shown.endsWith('\u2026')).toBe(true);
      expect(shown).not.toContain('...');
      const cut = shown.slice(0, -1);
      expect(cut).toMatch(/[\p{L}\p{N}]$/u);
      expect(full.startsWith(cut)).toBe(true);
      expect(full.charAt(cut.length)).toMatch(/[\s,]/);
    });

    test('description is cut at a word boundary', async ({ page }) => {
      const full = 'Brewing a better cup takes patience and a little practice every morning. '.repeat(8).trim();
      await page.locator('#serp-desc').fill(full);
      const shown = (await page.locator('#preview-desktop .google-description').textContent()) || '';
      const cut = shown.slice(0, -1);
      expect(shown.endsWith('\u2026')).toBe(true);
      expect(cut).not.toMatch(/\s$/);
      expect(full.startsWith(cut)).toBe(true);
      expect(full.charAt(cut.length)).toMatch(/[\s.]/);
    });
  });

  test.describe('AI Overview summary', () => {
    const body = (page) => page.locator('#preview-ai .ai-overview-body');

    test('decimals and abbreviations do not split a sentence and punctuation is kept', async ({ page }) => {
      await page.locator('#serp-desc').fill('Caffeine has a 5.5 hour half-life, e.g. for most adults!');
      await expect(body(page)).toHaveText('Caffeine has a 5.5 hour half-life, e.g. for most adults!');
    });

    test('takes the first two sentences and skips honorifics', async ({ page }) => {
      await page.locator('#serp-desc').fill('Dr. Smith drinks 3.5 cups, i.e. a lot. He sleeps badly! Nobody is surprised? Third.');
      await expect(body(page)).toHaveText('Dr. Smith drinks 3.5 cups, i.e. a lot. He sleeps badly!');
    });

    test('adds a full stop when the description has none', async ({ page }) => {
      await page.locator('#serp-desc').fill('No punctuation here');
      await expect(body(page)).toHaveText('No punctuation here.');
    });
  });

  test.describe('URL validation and display', () => {
    for (const junk of ['javascript:alert(1)', 'foo:bar', 'ftp://example.com/file']) {
      test(`"${junk}" is not a valid URL`, async ({ page }) => {
        await page.locator('#serp-url').fill(junk);
        await expect(page.locator('#validation')).not.toContainText('URL format is valid');
        await expect(page.locator('#validation')).toContainText('URL does not appear to be valid');
        const crumb = (await page.locator('#preview-desktop .google-breadcrumb').textContent()) || '';
        expect(crumb).not.toMatch(/javascript|foo|ftp/);
      });
    }

    test('an https URL with a host is valid', async ({ page }) => {
      await page.locator('#serp-url').fill('https://www.example.com/a-page/');
      await expect(page.locator('#validation')).toContainText('URL format is valid');
    });

    test('internationalised domains show in Unicode in the breadcrumb and social card', async ({ page }) => {
      for (const typed of ['https://xn--caf-dma.com/the-menu/', 'https://caf\u00e9.com/the-menu/']) {
        await page.locator('#serp-url').fill(typed);
        await expect(page.locator('#preview-desktop .google-breadcrumb')).toHaveText('caf\u00e9.com \u203a The Menu');
        await expect(page.locator('#preview-social .social-card-domain')).toHaveText('caf\u00e9.com');
      }
    });
  });

  test.describe('breadcrumb capitalisation', () => {
    const cases = [
      ['/%C3%BCber-uns/', '\u00dcber Uns'],
      ['/na%C3%AFve-guide/', 'Na\u00efve Guide'],
      ['/it%27s-here/', "It's Here"],
      ['/the-2026-guide/', 'The 2026 Guide'],
    ];
    for (const [path, expected] of cases) {
      test(`${path} is capitalised word by word`, async ({ page }) => {
        await page.locator('#serp-url').fill('https://example.com' + path);
        await expect(page.locator('#preview-desktop .google-breadcrumb')).toHaveText('example.com \u203A ' + expected);
      });
    }
    test('accented letters typed directly are capitalised', async ({ page }) => {
      await page.locator('#serp-url').fill('https://example.com/\u00fcber-uns/');
      await expect(page.locator('#preview-desktop .google-breadcrumb')).toHaveText('example.com \u203A \u00dcber Uns');
    });
  });

  test.describe('keyphrase bolding', () => {
    test('bolds words with accents, symbols and non-ASCII letters', async ({ page }) => {
      await page.locator('#serp-title').fill('Caf\u00e9 and C++ and \u00fcber things');
      await page.locator('#serp-keyphrase').fill('Caf\u00e9 C++ \u00fcber');
      const bolds = await page.locator('#preview-desktop .google-title b').allInnerTexts();
      expect(bolds).toEqual(['Caf\u00e9', 'C++', '\u00fcber']);
    });

    test('does not bold inside a longer word', async ({ page }) => {
      await page.locator('#serp-title').fill('Caf\u00e9s and \u00fcberall');
      await page.locator('#serp-keyphrase').fill('Caf\u00e9 \u00fcber');
      await expect(page.locator('#preview-desktop .google-title b')).toHaveCount(0);
    });
  });

  for (const width of [360, 390, 1280]) {
    test.describe(`layout and accessibility at ${width}px`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width, height: 800 });
        await accept(page);
      });

      test('every tab is fully inside the viewport', async ({ page }) => {
        const tabs = page.locator('.serp-tab');
        await expect(tabs).toHaveCount(4);
        for (let i = 0; i < 4; i++) {
          const box = await tabs.nth(i).boundingBox();
          expect(box.x, `tab ${i} left`).toBeGreaterThanOrEqual(0);
          expect(box.x + box.width, `tab ${i} right`).toBeLessThanOrEqual(width);
        }
        const strip = await page.locator('.serp-tabs').evaluate((e) => [e.scrollWidth, e.clientWidth]);
        expect(strip[0]).toBeLessThanOrEqual(strip[1]);
      });

      test('a long unbroken word does not widen the page on any tab', async ({ page }) => {
        const word = 'W'.repeat(120);
        await page.locator('#serp-title').fill(word);
        await page.locator('#serp-desc').fill(word);
        await page.locator('#serp-sitename').fill(word);
        for (const name of ['Desktop', 'Mobile', 'AI Overview', 'Social Card']) {
          await page.getByRole('tab', { name }).click();
          const w = await page.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.clientWidth]);
          expect(w[0], `${name} scrollWidth`).toBe(w[1]);
        }
      });

      test('every interactive control is at least 44px tall', async ({ page }) => {
        await page.locator('#serp-fetch-toggle').check();
        const selectors = [
          '.serp-tab', '#serp-keyphrase', '#serp-title', '#serp-url', '#serp-date', '#serp-desc',
          '#serp-sitename', '#serp-image', '#serp-fetch-url', '#serp-fetch-btn', 'label[for="serp-fetch-toggle"]',
        ];
        for (const sel of selectors) {
          const boxes = await page.locator(sel).evaluateAll((els) => els.map((e) => e.getBoundingClientRect().height));
          expect(boxes.length, sel).toBeGreaterThan(0);
          for (const h of boxes) expect(h, sel).toBeGreaterThanOrEqual(44);
        }
        // The checkbox itself sits inside that 44px label, so a tap on the label toggles it.
        await page.locator('label[for="serp-fetch-toggle"]').click({ position: { x: 100, y: 40 } });
        await expect(page.locator('#serp-fetch-toggle')).not.toBeChecked();
      });
    });
  }

  test.describe('accessibility', () => {
    test('the fetch URL input has an accessible name', async ({ page }) => {
      await accept(page);
      await page.locator('#serp-fetch-toggle').check();
      await expect(page.getByRole('textbox', { name: /URL of the page to load metadata from/ })).toBeVisible();
    });

    test('tabs expose the WAI-ARIA tabs pattern', async ({ page }) => {
      await accept(page);
      const names = ['desktop', 'mobile', 'ai-overview', 'social'];
      for (const name of names) {
        const tab = page.locator(`#tab-${name}`);
        await expect(tab).toHaveAttribute('role', 'tab');
        await expect(tab).toHaveAttribute('aria-controls', `panel-${name}`);
        const panel = page.locator(`#panel-${name}`);
        await expect(panel).toHaveAttribute('role', 'tabpanel');
        await expect(panel).toHaveAttribute('aria-labelledby', `tab-${name}`);
      }
      const state = async () => page.locator('.serp-tab').evaluateAll((els) => els.map((e) => `${e.getAttribute('aria-selected')}/${e.tabIndex}`));
      expect(await state()).toEqual(['true/0', 'false/-1', 'false/-1', 'false/-1']);

      await page.locator('#tab-desktop').focus();
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('#tab-mobile')).toBeFocused();
      await expect(page.locator('#panel-mobile')).toBeVisible();
      await expect(page.locator('#panel-desktop')).toBeHidden();
      expect(await state()).toEqual(['false/-1', 'true/0', 'false/-1', 'false/-1']);

      await page.keyboard.press('End');
      await expect(page.locator('#tab-social')).toBeFocused();
      await expect(page.locator('#panel-social')).toBeVisible();
      await page.keyboard.press('ArrowRight');
      await expect(page.locator('#tab-desktop')).toBeFocused();
      await page.keyboard.press('ArrowLeft');
      await expect(page.locator('#tab-social')).toBeFocused();
      await page.keyboard.press('Home');
      await expect(page.locator('#tab-desktop')).toBeFocused();
      expect(await state()).toEqual(['true/0', 'false/-1', 'false/-1', 'false/-1']);
    });

    test('the fetch status is a polite live region and the validation list is not', async ({ page }) => {
      await expect(page.locator('#serp-fetch-status')).toHaveAttribute('aria-live', 'polite');
      await expect(page.locator('#validation')).not.toHaveAttribute('aria-live', /.*/);
      await expect(page.locator('#validation [aria-live], #validation[role="status"], #validation[role="alert"]')).toHaveCount(0);
      const status = page.locator('#validation-status');
      await expect(status).toHaveAttribute('aria-live', 'polite');
      const box = await status.evaluate((e) => { const r = e.getBoundingClientRect(); return [r.width, r.height]; });
      expect(Math.max(...box)).toBeLessThanOrEqual(1);
    });

    test('the validation status announces a short summary only when the set of messages changes', async ({ page }) => {
      const status = page.locator('#validation-status');
      await expect(status).toHaveText('2 problems, 1 warning');
      await page.locator('#serp-title').fill('Short title');
      await expect(status).toHaveText('1 problem, 1 warning');

      // Typing more keeps every check in the same state, so only the pixel figures change.
      await page.evaluate(() => {
        window.__announced = 0;
        new MutationObserver((list) => { window.__announced += list.length; })
          .observe(document.getElementById('validation-status'), { childList: true, characterData: true, subtree: true });
      });
      await page.locator('#serp-title').pressSequentially(' with a few more words');
      await expect(page.locator('#validation')).toContainText('Title length is good');
      expect(await page.evaluate(() => window.__announced)).toBe(0);

      // A change in which messages apply is announced.
      await page.locator('#serp-title').fill('An extremely long page title that keeps going and going well past any sensible search result width limit');
      await expect(status).toHaveText('2 problems, 2 warnings');
      expect(await page.evaluate(() => window.__announced)).toBeGreaterThan(0);

      await page.locator('#serp-title').fill('Short title');
      await page.locator('#serp-desc').fill('Coffee and sleep, explained with a calculator that shows how long caffeine stays in your system.');
      await page.locator('#serp-url').fill('https://www.example.com/page/');
      await page.locator('#serp-image').fill('https://www.example.com/i.jpg');
      await expect(status).toHaveText('All checks pass');
    });

    test('there is space between the validation list and the "How this works" heading', async ({ page }) => {
      const gap = await page.evaluate(() => {
        const v = document.querySelector('#validation').getBoundingClientRect();
        const h = document.querySelector('.serp-methodology h3').getBoundingClientRect();
        return h.top - v.bottom;
      });
      expect(gap).toBeGreaterThanOrEqual(24);
    });
  });
});
