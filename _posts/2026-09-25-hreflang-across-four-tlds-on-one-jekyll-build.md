---
author: Sean
comments: true
date: 2026-09-25 09:00:00+00:00
layout: post
title: "hreflang across four TLDs on one Jekyll build"
header-img: "img/post-bg-03.jpg"
meta-description: "How this blog serves one Jekyll build on four domains with hreflang in the head and the sitemap, and why a small Worker rewrites the canonical tag."
categories:
- Blog
tags:
- SEO
- Jekyll
hidden: true
robots: noindex
---

This site answers on four domains: www.seanreilly.net, .uk, .ie and .eu. They all serve the same build, byte for byte, apart from three tags that a Worker rewrites on the way out. There was a fifth, powergenitalia.it (it-IT), bought as a joke and given its own hreflang entry in the original setup. It redirected to the .eu site from July 2026 and I let it expire in September.

Four domains for a personal blog is daft. I own them anyway, so I test on them. The notes below are what the repo does.

## The setup in the repo

The domain list lives in `_config.yml`:

```yaml
hreflang_domains:
  default: "https://www.seanreilly.net"
  en-GB: "https://www.seanreilly.uk"
  en-IE: "https://www.seanreilly.ie"
  en-EU: "https://www.seanreilly.eu"
```

The `default` key isn't a language code, so the templates treat it specially. It becomes both `x-default` and plain `en`. The other three keys are used as the hreflang value as they stand.

`_includes/head.html` loops over the list and writes the tags into every page:

{% raw %}
```liquid
<link rel="alternate" hreflang="x-default" href="{{ site.hreflang_domains.default }}{{ defined_url }}" />
<link rel="alternate" hreflang="en" href="{{ site.hreflang_domains.default }}{{ defined_url }}" />
{%- for domain in site.hreflang_domains -%}
{%- if domain[0] != 'default' %}
<link rel="alternate" hreflang="{{ domain[0] }}" href="{{ domain[1] }}{{ defined_url }}" />
{%- endif -%}
{%- endfor %}
```
{% endraw %}

Google ignores hreflang that isn't reciprocal, so every page lists all four, itself included.

Adding a region is a one-line change to the config. The head and the sitemap both read from it.

## The same list, twice

I put hreflang in the sitemap as well as the head. Google accepts either and doesn't need both, but I wanted the two to be generated from one source so they couldn't drift. `sitemap-content.xml` uses the same loop with the `xhtml:link` element:

{% raw %}
```liquid
<url>
  <loc>{{ site.hreflang_domains.default }}{{ post.url }}</loc>
  <xhtml:link rel="alternate" hreflang="x-default" href="{{ site.hreflang_domains.default }}{{ post.url }}" />
  <xhtml:link rel="alternate" hreflang="en" href="{{ site.hreflang_domains.default }}{{ post.url }}" />
  {%- for domain in site.hreflang_domains -%}
  ...
```
{% endraw %}

Only the `.net` URL is listed as a `<loc>`, with the alternates hanging off it. The same file is served on every hostname, so the `.uk` copy of the sitemap still lists `.net` URLs. Whether that's the tidiest arrangement, I'm not sure. I wouldn't copy it for a client without testing it first.

Posts and pages marked `hidden: true` or `robots: noindex` are left out of the content sitemap. This post is one of them, which is why you're unlikely to find it through search.

## The canonical problem

The canonical tag is the awkward part. If four hostnames serve identical HTML, then every one of them says `<link rel="canonical" href="https://www.seanreilly.net/...">`, because that's what `site.url` is. The `.uk` page canonicalises to the `.net` page. Google then has two signals that disagree: hreflang says the `.uk` URL is the en-GB version, and the canonical says it's a duplicate of something else. The canonical tends to win, and the regional URL drops out of the index.

Jekyll builds one site. It doesn't know which hostname it will be served from, so it can't put the right canonical in at build time. I could have built four copies of the site with different `url` values. That seemed a lot of pipeline for three tags.

What I did instead was put a small Cloudflare Worker in front of the three regional hostnames. It rewrites `rel="canonical"`, `og:url` and `og:image` so that each hostname is canonical to itself. The `.net` hostname doesn't run the Worker, since the build is already correct for it. A simplified version of the idea looks like this:

```js
// Simplified for illustration - not the production Worker.
export default {
  async fetch(request) {
    const url = new URL(request.url);
    const response = await fetch(request);
    const swap = (value) => value.replace("https://www.seanreilly.net", url.origin);

    return new HTMLRewriter()
      .on('link[rel="canonical"]', {
        element(el) { el.setAttribute("href", swap(el.getAttribute("href"))); },
      })
      .on('meta[property="og:url"], meta[property="og:image"]', {
        element(el) { el.setAttribute("content", swap(el.getAttribute("content"))); },
      })
      .transform(response);
  },
};
```

The hreflang tags are left alone, because they should be identical on every hostname. Only the self-referencing tags change.

## What I didn't do

I didn't use a geo-redirect. The usual advice for regional sites is to send people to the right version by IP, and for a retail client that can be reasonable. Here it would have been a mistake. Googlebot crawls mostly from the US, so it would be bounced to the default version every time and would never see the `.uk`, `.ie` or `.eu` pages at all.

I also didn't give the old domains hreflang. The bare domains, plus seanreilly.org, seanreilly.info and sreilly.net, simply redirect to the `.net` site. They aren't alternates of anything, and redirecting them means whatever links they have collected end up on one hostname.

## The caveat

The text is identical on all four. The labels say where I'd like each one shown. A client with genuinely different pricing or delivery terms per region would have a stronger case for the setup, and a harder job, because the pages would no longer map one to one.

The Worker is also the part I trust least. It lives outside this repo, so a change to the head markup could quietly stop its selectors matching, and nothing in the Jekyll build would tell me.
