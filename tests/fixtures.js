// Shared fixtures for the tool specs.
//
// - `pageErrors` collects uncaught exceptions and console errors raised by the site itself.
//   Failed loads of third-party resources (fonts, CDN, tag manager) are ignored: they depend
//   on the network, not on the tool code under test.
// - If TEST_OFFLINE_ASSETS is set (a directory holding bootstrap@5.3.3 as unpacked from npm,
//   i.e. <dir>/package/dist/...), third-party requests are answered locally so the suite can
//   run without internet access. CI does not set it and uses the real CDN.
const base = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const LOCAL_HOSTS = new Set(['127.0.0.1', 'localhost']);

function isLocal(url) {
  try { return LOCAL_HOSTS.has(new URL(url).hostname); } catch (e) { return false; }
}

// Tag-manager and analytics hosts. Tests must not depend on them: when they load (as on CI) GTM
// adds keys such as gtm.uniqueEventId to every dataLayer push and its container can inject overlays.
const TAG_HOSTS = /(^|\.)(googletagmanager\.com|google-analytics\.com|analytics\.google\.com|doubleclick\.net|googleadservices\.com|googlesyndication\.com|facebook\.net|facebook\.com|clarity\.ms|hotjar\.com)$/;

const test = base.test.extend({
  page: async ({ page }, use) => {
    const offline = process.env.TEST_OFFLINE_ASSETS;
    if (offline) {
      await page.route((url) => !isLocal(url.toString()), async (route) => {
        const url = route.request().url();
        const m = url.match(/bootstrap@5\.3\.3\/dist\/(.+)$/);
        if (m) {
          const file = path.join(offline, 'package', 'dist', m[1]);
          if (fs.existsSync(file)) {
            return route.fulfill({
              status: 200,
              contentType: m[1].endsWith('.css') ? 'text/css' : 'application/javascript',
              body: fs.readFileSync(file),
            });
          }
        }
        const type = /\.css|fonts\.googleapis/.test(url) ? 'text/css' : 'application/javascript';
        return route.fulfill({ status: 200, contentType: type, body: '' });
      });
    }
    // Registered after the offline handler so it takes precedence for these hosts.
    await page.route((url) => TAG_HOSTS.test(url.hostname), (route) => route.abort());
    await use(page);
  },

  pageErrors: async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push('pageerror: ' + err.message));
    page.on('console', (msg) => {
      if (msg.type() !== 'error') return;
      const loc = msg.location();
      if (loc && loc.url && !isLocal(loc.url)) return;
      errors.push('console.error: ' + msg.text() + (loc && loc.url ? ' (' + loc.url + ')' : ''));
    });
    await use(errors);
  },

  // Dialogs (alert/confirm/prompt) opened by the page. A tool should never open one.
  dialogs: async ({ page }, use) => {
    const seen = [];
    page.on('dialog', async (d) => { seen.push(d.type() + ': ' + d.message()); await d.dismiss(); });
    await use(seen);
  },
});

// Parse the page's currency formatting: "+£300,000", "£-300", "-£1.2M", "£6.7M", "£2,000.0B" -> number.
function parseMoney(text) {
  const t = text.replace(/[£€$A,+\s]/g, '');
  const mult = /B$/.test(t) ? 1e9 : /M$/.test(t) ? 1e6 : /k$/.test(t) ? 1e3 : 1;
  const n = parseFloat(t.replace(/[BMk]$/, ''));
  return n * mult;
}

// Fill a numeric/text input and fire the page's own input handler.
async function setValue(page, selector, value) {
  await page.locator(selector).fill(String(value));
}

module.exports = { test, expect: base.expect, parseMoney, setValue };
