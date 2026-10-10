export async function onRequestGet(context) {
  const { request, env } = context;

  const corsHeaders = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
  };

  try {
    const url = new URL(request.url).searchParams.get('url');

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'Missing url parameter.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate URL format
    let parsed;
    try {
      parsed = new URL(url);
    } catch (e) {
      return new Response(
        JSON.stringify({ error: 'Invalid URL.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Only allow http/https
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return new Response(
        JSON.stringify({ error: 'Only HTTP/HTTPS URLs are supported.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Block private / internal targets (best-effort SSRF guard on the hostname).
    if (isPrivateHost(parsed.hostname)) {
      return new Response(
        JSON.stringify({ error: 'That host is not allowed.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    // Fetch the page (8s timeout so a slow/hanging origin cannot tie up the Worker)
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SERPPreview/1.0 (+https://www.seanreilly.net/serp-preview/)' },
      redirect: 'follow',
      cf: { cacheTtl: 300 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      return new Response(
        JSON.stringify({ error: 'Failed to fetch page (' + res.status + ').' }),
        { status: 502, headers: corsHeaders }
      );
    }

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return new Response(
        JSON.stringify({ error: 'URL does not return HTML.' }),
        { status: 400, headers: corsHeaders }
      );
    }

    const html = await readCapped(res, 1000000);

    const meta = extractMeta(html, parsed);

    meta.fetchedUrl = parsed.href;

    // Store unique fetches in D1
    let fetchCount = null;
    if (env.DB) {
      try {
        await env.DB.prepare(`
          CREATE TABLE IF NOT EXISTS serp_fetches (
            url TEXT PRIMARY KEY,
            title TEXT,
            description TEXT,
            og_image TEXT,
            site_name TEXT,
            favicon TEXT,
            first_fetched TEXT NOT NULL DEFAULT (datetime('now')),
            last_fetched TEXT NOT NULL DEFAULT (datetime('now')),
            fetch_count INTEGER NOT NULL DEFAULT 1
          )
        `).run();

        const row = await env.DB.prepare(`
          INSERT INTO serp_fetches (url, title, description, og_image, site_name, favicon)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(url) DO UPDATE SET
            title = excluded.title,
            description = excluded.description,
            og_image = excluded.og_image,
            site_name = excluded.site_name,
            favicon = excluded.favicon,
            last_fetched = datetime('now'),
            fetch_count = fetch_count + 1
          RETURNING fetch_count
        `).bind(
          parsed.href,
          meta.title || null,
          meta.description || null,
          meta.ogImage || null,
          meta.siteName || null,
          meta.favicon || null
        ).first();
        fetchCount = row ? row.fetch_count : null;
      } catch (e) {
        // Don't fail the response if logging fails
      }
    }

    // Notify Slack, but only the first time a URL is fetched (prevents DM flooding by looping)
    if (env.SLACK_WEBHOOK_URL && fetchCount === 1) {
      try {
        await fetch(env.SLACK_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: `SERP Preview: someone fetched ${parsed.href}`,
            blocks: [
              {
                type: 'header',
                text: { type: 'plain_text', text: 'SERP Preview Fetch' },
              },
              {
                type: 'section',
                fields: [
                  { type: 'mrkdwn', text: `*URL:*\n${parsed.href}` },
                  { type: 'mrkdwn', text: `*Title:*\n${meta.title || '(none)'}` },
                ],
              },
              {
                type: 'section',
                fields: [
                  { type: 'mrkdwn', text: `*Site:*\n${meta.siteName || '(none)'}` },
                  { type: 'mrkdwn', text: `*Description:*\n${(meta.description || '(none)').slice(0, 150)}` },
                ],
              },
            ],
          }),
        });
      } catch (e) {
        // Don't fail the response if Slack fails
      }
    }

    return new Response(
      JSON.stringify(meta),
      { status: 200, headers: corsHeaders }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Failed to fetch page.' }),
      { status: 500, headers: corsHeaders }
    );
  }
}


function isPrivateHost(host) {
  if (!host) return true;
  host = host.toLowerCase().replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.local') || host.endsWith('.internal')) return true;
  // IPv6 loopback / link-local / unique-local
  if (host === '::1' || host === '::' || host.startsWith('fe80:') || host.startsWith('fc') || host.startsWith('fd')) return true;
  // IPv4
  const m = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (m) {
    const [a, b] = [parseInt(m[1], 10), parseInt(m[2], 10)];
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 169 && b === 254) return true;               // link-local / cloud metadata
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 100 && b >= 64 && b <= 127) return true;      // CGNAT
  }
  return false;
}

async function readCapped(res, maxBytes) {
  const reader = res.body && res.body.getReader ? res.body.getReader() : null;
  if (!reader) return (await res.text()).slice(0, maxBytes);
  const chunks = [];
  let received = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    received += value.length;
    chunks.push(value);
    if (received >= maxBytes) { await reader.cancel(); break; }
  }
  const buf = new Uint8Array(received);
  let offset = 0;
  for (const c of chunks) { buf.set(c.subarray(0, Math.max(0, Math.min(c.length, maxBytes - offset))), offset); offset += c.length; if (offset >= maxBytes) break; }
  return new TextDecoder('utf-8').decode(buf.subarray(0, Math.min(received, maxBytes)));
}

// Attribute-aware tag parsing. A quoted value ends at the quote that opened it, so an
// apostrophe inside content="..." (or a double quote inside content='...') no longer
// truncates it, and attribute order does not matter.
const TAG_RE = /<(meta|link)\b((?:"[^"]*"|'[^']*'|[^'">])*)>/gi;
const ATTR_RE = /([^\s=\/>"']+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;

function parseAttrs(src) {
  const attrs = {};
  let m;
  ATTR_RE.lastIndex = 0;
  while ((m = ATTR_RE.exec(src)) !== null) {
    const name = m[1].toLowerCase();
    if (name in attrs) continue; // first occurrence wins, as in browsers
    attrs[name] = m[2] !== undefined ? m[2] : m[3] !== undefined ? m[3] : m[4] !== undefined ? m[4] : '';
  }
  return attrs;
}

function clean(value) {
  return decodeEntities(value).replace(/\s+/g, ' ').trim();
}

export function extractMeta(html, parsed) {
  const meta = {};

  const t = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  if (t) meta.title = clean(t[1]);

  const metas = {};
  const links = [];
  let m;
  TAG_RE.lastIndex = 0;
  while ((m = TAG_RE.exec(html)) !== null) {
    const attrs = parseAttrs(m[2]);
    if (m[1].toLowerCase() === 'meta') {
      if (attrs.content === undefined) continue;
      const key = (attrs.property || attrs.name || '').toLowerCase();
      if (key && !(key in metas)) metas[key] = attrs.content;
    } else {
      links.push(attrs);
    }
  }

  const fields = {
    description: 'description',
    ogTitle: 'og:title',
    ogDescription: 'og:description',
    ogImage: 'og:image',
    siteName: 'og:site_name',
    publishedDate: 'article:published_time',
  };
  for (const [field, key] of Object.entries(fields)) {
    if (key in metas) {
      const v = clean(metas[key]);
      if (v) meta[field] = v;
    }
  }

  // Favicon: prefer apple-touch-icon (high-res PNG), then PNG icons, then any icon, then /favicon.ico
  const relOf = (l) => (l.rel || '').toLowerCase().split(/\s+/);
  const withHref = links.filter((l) => l.href && l.href.trim());
  const apple = withHref.find((l) => relOf(l).some((r) => r.startsWith('apple-touch-icon')));
  const png = withHref.find((l) => relOf(l).includes('icon') && (l.type || '').toLowerCase() === 'image/png');
  const any = withHref.find((l) => relOf(l).includes('icon'));
  const chosen = apple || png || any;
  meta.favicon = chosen ? resolveHref(decodeEntities(chosen.href), parsed) : parsed.origin + '/favicon.ico';

  return meta;
}

function resolveHref(href, parsed) {
  href = href.trim();
  if (href.startsWith('//')) return parsed.protocol + href;
  if (href.startsWith('/')) return parsed.origin + href;
  if (!href.startsWith('http')) return parsed.origin + '/' + href;
  return href;
}

const NAMED_ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0',
  hellip: '\u2026', mdash: '\u2014', ndash: '\u2013', lsquo: '\u2018', rsquo: '\u2019',
  ldquo: '\u201c', rdquo: '\u201d', copy: '\u00a9', reg: '\u00ae', trade: '\u2122',
  pound: '\u00a3', euro: '\u20ac', middot: '\u00b7', bull: '\u2022', laquo: '\u00ab', raquo: '\u00bb',
};
// One pass, so "&amp;lt;" becomes "&lt;" and is not decoded a second time.
export function decodeEntities(str) {
  return str.replace(/&(#x[0-9a-f]+|#\d+|[a-z][a-z0-9]*);/gi, (match, body) => {
    if (body[0] === '#') {
      const code = body[1].toLowerCase() === 'x' ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : match;
    }
    const named = NAMED_ENTITIES[body.toLowerCase()];
    return named !== undefined ? named : match;
  });
}

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
