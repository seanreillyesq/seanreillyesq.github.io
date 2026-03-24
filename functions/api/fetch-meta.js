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

    // Fetch the page
    const res = await fetch(url, {
      headers: { 'User-Agent': 'SERPPreview/1.0 (+https://www.seanreilly.net/serp-preview/)' },
      redirect: 'follow',
      cf: { cacheTtl: 300 },
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

    const html = await res.text();

    // Extract meta tags with regex (no DOM parser needed)
    var meta = {};

    // <title>
    var m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    if (m) meta.title = m[1].trim();

    // meta name="description"
    m = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i);
    if (m) meta.description = m[1].trim();

    // og:title
    m = html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']*)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:title["']/i);
    if (m) meta.ogTitle = m[1].trim();

    // og:description
    m = html.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']*)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:description["']/i);
    if (m) meta.ogDescription = m[1].trim();

    // og:image
    m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']*)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:image["']/i);
    if (m) meta.ogImage = m[1].trim();

    // og:site_name
    m = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']*)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']og:site_name["']/i);
    if (m) meta.siteName = m[1].trim();

    // article:published_time
    m = html.match(/<meta[^>]+property=["']article:published_time["'][^>]+content=["']([^"']*)["']/i)
      || html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+property=["']article:published_time["']/i);
    if (m) meta.publishedDate = m[1].trim();

    // Favicon: prefer apple-touch-icon (high-res PNG), then PNG icons, then any icon, then /favicon.ico
    function resolveHref(href) {
      href = href.trim();
      if (href.startsWith('//')) return parsed.protocol + href;
      if (href.startsWith('/')) return parsed.origin + href;
      if (!href.startsWith('http')) return parsed.origin + '/' + href;
      return href;
    }

    // apple-touch-icon (almost always a 180x180 PNG)
    m = html.match(/<link[^>]+rel=["']apple-touch-icon[^"']*["'][^>]+href=["']([^"']*)["']/i)
      || html.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["']apple-touch-icon[^"']*["']/i);
    if (m) {
      meta.favicon = resolveHref(m[1]);
    } else {
      // PNG icon (better than ICO at small sizes)
      m = html.match(/<link[^>]+rel=["']icon["'][^>]+type=["']image\/png["'][^>]+href=["']([^"']*)["']/i)
        || html.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["']icon["'][^>]+type=["']image\/png["']/i)
        || html.match(/<link[^>]+type=["']image\/png["'][^>]+rel=["']icon["'][^>]+href=["']([^"']*)["']/i);
      if (m) {
        meta.favicon = resolveHref(m[1] || m[2]);
      } else {
        // Any icon
        m = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']*)["']/i)
          || html.match(/<link[^>]+href=["']([^"']*)["'][^>]+rel=["'](?:shortcut )?icon["']/i);
        if (m) {
          meta.favicon = resolveHref(m[1]);
        } else {
          meta.favicon = parsed.origin + '/favicon.ico';
        }
      }
    }

    meta.fetchedUrl = parsed.href;

    // Store unique fetches in D1 (fire-and-forget, don't block response)
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

        await env.DB.prepare(`
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
        `).bind(
          parsed.href,
          meta.title || null,
          meta.description || null,
          meta.ogImage || null,
          meta.siteName || null,
          meta.favicon || null
        ).run();
      } catch (e) {
        // Don't fail the response if logging fails
      }
    }

    // Notify Slack
    if (env.SLACK_WEBHOOK_URL) {
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

export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
