// The Tools hub, the route to /work-with-me/, cross-links between tools, usage events and JSON-LD.
const { test, expect } = require('../fixtures');

const TOOLS = [
  { slug: 'roas-calculator', group: 'business' },
  { slug: 'customer-economics', group: 'business' },
  { slug: 'serp-preview', group: 'business' },
  { slug: 'caffeine', group: 'personal' },
];

const toolEvents = (page) => page.evaluate(() => window.dataLayer.filter((e) => e && /^tool_/.test(e.event)));

test.describe('hub page', () => {
  test('lists all four tools with working links, business before personal', async ({ page, request }) => {
    await page.goto('/tools/');
    const cards = page.locator('.card.card-body');
    await expect(cards).toHaveCount(4);
    const hrefs = await cards.evaluateAll((els) => els.map((c) => c.querySelector('a.btn').getAttribute('href')));
    expect(hrefs).toEqual(TOOLS.map((t) => '/' + t.slug + '/'));
    await expect(page.locator('#tools-business .card')).toHaveCount(3);
    await expect(page.locator('#tools-personal .card')).toHaveCount(1);
    const order = await page.evaluate(() => {
      const b = document.getElementById('tools-business'), p = document.getElementById('tools-personal');
      return !!(b.compareDocumentPosition(p) & Node.DOCUMENT_POSITION_FOLLOWING);
    });
    expect(order).toBe(true);
    for (const h of hrefs) {
      const res = await request.get(h);
      expect(res.status(), h).toBe(200);
    }
    for (const c of await cards.all()) await expect(c.locator('p').first()).not.toBeEmpty();
  });

  test('footer lists the tools and links to all tools', async ({ page }) => {
    await page.goto('/tools/');
    const links = await page.locator('footer a[href="/roas-calculator/"], footer a[href="/customer-economics/"], footer a[href="/serp-preview/"], footer a[href="/caffeine/"]').count();
    expect(links).toBe(4);
    await expect(page.locator('footer a[href="/tools/"]')).toHaveText('All tools');
  });

  test('"Tools" is in the nav between Work With Me and Ventures', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');
    const labels = (await page.locator('#navbarNav .nav-link').allTextContents()).map((l) => l.trim());
    expect(labels).toContain('Tools');
    expect(labels.indexOf('Tools')).toBe(labels.indexOf('Work With Me') + 1);
    expect(labels.indexOf('Ventures')).toBe(labels.indexOf('Tools') + 1);
  });

  for (const w of [992, 1280]) {
    test(`nav does not wrap at ${w}px`, async ({ page }) => {
      await page.setViewportSize({ width: w, height: 800 });
      await page.goto('/tools/');
      const tops = await page.locator('#navbarNav .nav-item').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top)));
      expect(new Set(tops).size).toBe(1);
      const nav = await page.locator('#mainNav').boundingBox();
      expect(nav.height).toBeLessThan(90);
    });
  }

  for (const w of [360, 390, 1280]) {
    for (const url of ['/tools/', ...TOOLS.map((t) => '/' + t.slug + '/')]) {
      test(`no horizontal overflow at ${w}px on ${url}`, async ({ page }) => {
        await page.setViewportSize({ width: w, height: 800 });
        await page.goto(url);
        const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
        expect(over).toBeLessThanOrEqual(0);
      });
    }
  }
});

test.describe('route to Sean', () => {
  for (const t of TOOLS) {
    test(`CTA ${t.group === 'business' ? 'visible' : 'absent'} on ${t.slug}`, async ({ page }) => {
      await page.goto('/' + t.slug + '/');
      const cta = page.locator('.tool-cta');
      if (t.group === 'business') {
        await expect(cta).toHaveCount(1);
        await expect(cta).toBeVisible();
        await expect(cta.locator('a')).toHaveAttribute('href', '/work-with-me/');
      } else {
        await expect(cta).toHaveCount(0);
      }
    });
  }
});

test.describe('cross-links', () => {
  test('ROAS to customer economics carries the shared inputs', async ({ page }) => {
    await page.goto('/roas-calculator/');
    await page.locator('#cancel-rate').fill('8');
    await page.locator('#cogs-rate').fill('35');
    await page.locator('#fulfil-rate').fill('12');
    await page.locator('#margin-rate').fill('25');
    await page.locator('#currency-select').selectOption('EUR');
    await page.locator('#tool-crosslink').click();
    await expect(page).toHaveURL(/\/customer-economics\//);
    await expect(page.locator('#cancel-rate')).toHaveValue('8');
    await expect(page.locator('#cogs-rate')).toHaveValue('35');
    await expect(page.locator('#fulfil-rate')).toHaveValue('12');
    await expect(page.locator('#margin-rate')).toHaveValue('25');
    await expect(page.locator('#currency-select')).toHaveValue('EUR');
  });

  test('customer economics to ROAS carries the shared inputs', async ({ page }) => {
    await page.goto('/customer-economics/');
    await page.locator('#cancel-rate').fill('3');
    await page.locator('#cogs-rate').fill('40');
    await page.locator('#fulfil-rate').fill('10');
    await page.locator('#margin-rate').fill('15');
    await page.locator('#currency-select').selectOption('USD');
    await page.locator('#tool-crosslink').click();
    await expect(page).toHaveURL(/\/roas-calculator\//);
    await expect(page.locator('#cancel-rate')).toHaveValue('3');
    await expect(page.locator('#cogs-rate')).toHaveValue('40');
    await expect(page.locator('#fulfil-rate')).toHaveValue('10');
    await expect(page.locator('#margin-rate')).toHaveValue('15');
    await expect(page.locator('#currency-select')).toHaveValue('USD');
  });

  for (const t of TOOLS) {
    test(`${t.slug} has a More tools link`, async ({ page }) => {
      await page.goto('/' + t.slug + '/');
      await expect(page.locator('.tool-more a')).toHaveAttribute('href', '/tools/');
    });
  }
});

test.describe('usage events', () => {
  test('toolEvent pushes the expected object', async ({ page }) => {
    await page.goto('/roas-calculator/');
    await page.evaluate(() => { window.toolEvent('shared', { method: 'copy_link' }); window.toolEvent('x', { event: 'evil', tool: 'evil' }); });
    const ev = await toolEvents(page);
    expect(ev).toContainEqual(expect.objectContaining({ event: 'tool_shared', tool: 'roas-calculator', method: 'copy_link' }));
    expect(ev).toContainEqual(expect.objectContaining({ event: 'tool_x', tool: 'roas-calculator' }));
    expect(ev.some((e) => e.event === 'tool_x' && (e.tool !== 'roas-calculator'))).toBe(false);
  });

  test('tool_calculated fires once after several keystrokes, with no typed values', async ({ page }) => {
    await page.goto('/roas-calculator/');
    await page.locator('#ad-spend').click();
    await page.keyboard.press('Control+A');
    await page.keyboard.type('7654321', { delay: 40 });
    await page.locator('#ad-revenue').fill('1234567');
    await page.locator('#cogs-rate').fill('44');
    await expect.poll(async () => (await toolEvents(page)).length).toBe(1);
    await page.waitForTimeout(1500);
    const ev = await toolEvents(page);
    expect(ev).toHaveLength(1);
    expect(ev[0]).toEqual(expect.objectContaining({ event: 'tool_calculated', tool: 'roas-calculator' }));
    const text = JSON.stringify(ev);
    // Only our own keys are compared, so any extra key a tag manager adds cannot break this.
    for (const v of ['7654321', '1234567', '44']) expect(text).not.toContain(v);
  });

  test('CTA click and cross-link click push their events', async ({ page }) => {
    await page.goto('/roas-calculator/');
    await page.evaluate(() => document.addEventListener('click', (e) => { if (e.target.closest('a')) e.preventDefault(); }));
    await page.locator('.tool-cta a').click();
    await page.locator('#tool-crosslink').click();
    const ev = await toolEvents(page);
    expect(ev).toContainEqual(expect.objectContaining({ event: 'tool_cta_click', tool: 'roas-calculator' }));
    expect(ev).toContainEqual(expect.objectContaining({ event: 'tool_crosslink', tool: 'roas-calculator', to: 'customer-economics' }));
  });

  test('CTA is clickable for a first-time visitor once the consent banner is dealt with', async ({ page }) => {
    // The consent library hides itself from automated browsers; hide that flag so the banner shows as it does for a person.
    await page.addInitScript(() => { Object.defineProperty(navigator, 'webdriver', { get: () => false }); });
    await page.goto('/roas-calculator/');
    await expect(page.locator('#cc-main .cm')).toBeVisible();
    await page.evaluate(() => { CookieConsent.acceptCategory([]); CookieConsent.hide(); });
    await page.evaluate(() => document.addEventListener('click', (e) => { if (e.target.closest('a')) e.preventDefault(); }));
    await page.locator('.tool-cta a').click();
    expect(await toolEvents(page)).toContainEqual(expect.objectContaining({ event: 'tool_cta_click' }));
  });

  test('the script is not loaded on the hub', async ({ page }) => {
    await page.goto('/tools/');
    expect(await page.evaluate(() => typeof window.toolEvent)).toBe('undefined');
  });
});

test.describe('structured data', () => {
  for (const t of TOOLS) {
    test(`WebApplication JSON-LD parses on ${t.slug}`, async ({ page }) => {
      await page.goto('/' + t.slug + '/');
      const raw = await page.locator('#tool-schema').textContent();
      const j = JSON.parse(raw);
      expect(j['@type']).toBe('WebApplication');
      expect(j.name).toBeTruthy();
      expect(j.description.length).toBeGreaterThan(20);
      expect(j.url).toContain('/' + t.slug + '/');
      expect(j.applicationCategory).toBe(t.group === 'business' ? 'BusinessApplication' : 'HealthApplication');
      expect(j.operatingSystem).toBe('Any');
      expect(j.offers).toMatchObject({ price: '0', priceCurrency: 'GBP' });
      expect(j.author).toMatchObject({ '@type': 'Person', name: 'Sean Reilly' });
    });
  }
});
