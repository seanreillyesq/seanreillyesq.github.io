// Parsing tests for functions/api/fetch-meta.js. No network: extractMeta() takes HTML as a string.
// Run with: node --test tests/unit/
import test from 'node:test';
import assert from 'node:assert/strict';
import { extractMeta, decodeEntities } from '../../functions/api/fetch-meta.js';

const page = new URL('https://example.com/post/');
const extract = (html) => extractMeta(html, page);

test('double-quoted content keeps an apostrophe', () => {
  const m = extract(`<meta name="description" content="It's the best guide">`);
  assert.equal(m.description, "It's the best guide");
});

test('single-quoted content keeps a double quote', () => {
  const m = extract(`<meta name='description' content='Say "hello" to the guide'>`);
  assert.equal(m.description, 'Say "hello" to the guide');
});

test('og tags keep quotes of the other kind', () => {
  const m = extract(`<meta property="og:title" content="Tom's list"><meta property='og:description' content='A "quoted" it&#39;s'>`);
  assert.equal(m.ogTitle, "Tom's list");
  assert.equal(m.ogDescription, 'A "quoted" it\'s');
});

test('content before name or property still matches', () => {
  const m = extract(`<meta content="It's reversed" name="description"><meta content='Reversed "og"' property='og:title'>`);
  assert.equal(m.description, "It's reversed");
  assert.equal(m.ogTitle, 'Reversed "og"');
});

test('a > inside a quoted value does not end the tag', () => {
  const m = extract(`<meta name="description" content="a > b and c"><meta property="og:title" content="After">`);
  assert.equal(m.description, 'a > b and c');
  assert.equal(m.ogTitle, 'After');
});

test('entities are decoded once', () => {
  const m = extract(`<title>Fish &amp; Chips &#39;n&#x27; more</title><meta name="description" content="Q&amp;A &amp;lt; &#8230; &hellip;">`);
  assert.equal(m.title, "Fish & Chips 'n' more");
  assert.equal(m.description, 'Q&A &lt; \u2026 \u2026');
});

test('invalid numeric entities are left alone rather than throwing', () => {
  assert.equal(decodeEntities('a &#1114112; b &#xD800; c'), 'a &#1114112; b &#xD800; c');
});

test('og image and favicon URLs are decoded and quote-safe', () => {
  const m = extract(`<meta property="og:image" content="https://cdn.example.com/a.jpg?x=1&amp;y=2"><link rel="apple-touch-icon" href="/it's.png">`);
  assert.equal(m.ogImage, 'https://cdn.example.com/a.jpg?x=1&y=2');
  assert.equal(m.favicon, "https://example.com/it's.png");
});

test('favicon preference and fallback', () => {
  assert.equal(extract(`<link rel="icon" href="/a.ico"><link href="/b.png" type="image/png" rel="icon">`).favicon, 'https://example.com/b.png');
  assert.equal(extract(`<link rel="shortcut icon" href="/a.ico">`).favicon, 'https://example.com/a.ico');
  assert.equal(extract(`<p>nothing</p>`).favicon, 'https://example.com/favicon.ico');
});
