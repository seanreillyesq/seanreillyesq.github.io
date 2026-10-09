# Interactive tool tests

Playwright regression tests for `roas-calculator`, `caffeine`, `serp-preview` and
`customer-economics`. They run against the built site, in Chromium, at 390 px (mobile) and
1280 px (desktop).

```
bundle exec jekyll build            # writes _site/
npm ci
npx playwright install chromium
npm test                            # same as: npx playwright test -c tests/playwright.config.js
```

The config starts `python3 -m http.server 4173 --directory _site` itself. The config lives in
`tests/`, so plain `npx playwright test` from the repo root needs `-c tests/playwright.config.js`.

Each spec re-implements the page's own formula from the page's own inputs rather than
hard-coding outputs, so the tests follow the tool if a constant changes but fail if the page
stops agreeing with its formula.

Offline runs: set `TEST_OFFLINE_ASSETS` to a directory holding `bootstrap@5.3.3` unpacked from
npm (`<dir>/package/dist/css/bootstrap.min.css`). Third-party requests are then answered
locally. CI does not set it.

Tests marked `test.fixme` document real defects found while writing the suite; each carries its
reason in a comment above it.
