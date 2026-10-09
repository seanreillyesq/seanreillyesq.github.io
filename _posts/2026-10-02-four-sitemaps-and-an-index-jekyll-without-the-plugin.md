---
author: Sean
comments: true
date: 2026-10-02 09:00:00+00:00
layout: post
title: "Four sitemaps and an index, Jekyll without the plugin"
header-img: "img/post-bg-03.jpg"
meta-description: "Why I dropped jekyll-sitemap for hand-written Liquid sitemaps, what the four child files contain, and how the deploy submits them to Search Console."
categories:
- Blog
tags:
- SEO
- Jekyll
hidden: true
robots: noindex
---

For years this blog used `jekyll-sitemap`, because GitHub Pages let me and it took no effort. When I moved the build to GitHub Actions and Cloudflare Pages in late January 2026, the reason for that choice went away, so I dropped the plugin.

The plugin writes one flat `sitemap.xml`. It can't produce an index, an image sitemap, a news sitemap or hreflang entries, and I wanted all four of those. Rather than bolt on a second plugin, I wrote the files by hand as Liquid templates. The Gemfile and `_config.yml` both carry a comment saying the plugin is left out on purpose, mostly so that future me doesn't helpfully add it back.

## The index and the four children

`robots.txt` is three lines:

```text
User-agent: *
Allow: /

Sitemap: https://www.seanreilly.net/sitemap_index.xml
```

The index it points at lists four child sitemaps:

{% raw %}
```xml
<sitemap>
  <loc>{{ site.url }}/sitemap-content.xml</loc>
  <lastmod>{{ site.time | date_to_xmlschema }}</lastmod>
</sitemap>
```
{% endraw %}

The same block repeats for `sitemap-images.xml`, `sitemap-archives.xml` and `sitemap-news.xml`. Each file is a normal Jekyll page with `layout: null` front matter, so Jekyll renders it and writes it to the root of `_site`. The `lastmod` on the index entries is the build time. That's lazy, and it means the index claims everything changed on every deploy. It doesn't, but I haven't yet found it worth the effort of working out a real value per child.

**Content.** Pages and posts, with the hreflang alternates described in the [previous post](/hreflang-across-four-tlds-on-one-jekyll-build-20260925/). Anything with `hidden: true`, `sitemap: false` or a noindex robots value is skipped. Posts use `last_modified_at` where it exists and fall back to the post date. That field comes from `jekyll-last-modified-at`, which is why the workflow checks out with `fetch-depth: 0`. A shallow clone has no history for the plugin to read, and every page would come out with the same date.

**Images.** Each visible post gets a `<url>` entry with its header image attached, plus any `.jpg`, `.png` or `.webp` files found under `/assets/<post-slug>/`. The slug is derived from the URL:

{% raw %}
```liquid
{%- assign post_slug = post.url | split: '/' | last | split: '-20' | first -%}
```
{% endraw %}

It splits on `-20` to strip the date suffix, which works until a post title contains `-20` itself. One for the list of things I'd fix if anyone paid me to.

**Archives.** Category and tag pages, at priority 0.3 and 0.2. Some SEOs leave these out. I kept them in at low priority so the tag pages are at least discoverable.

**News.** Posts from the last 48 hours only, capped at ten, because that's what Google News asks for:

{% raw %}
```liquid
{%- assign two_days_ago = 'now' | date: '%s' | minus: 172800 -%}
{%- for post in site.posts limit: 10 -%}
```
{% endraw %}

This blog isn't in Google News and isn't going to be. I built the file because I wanted to see what it takes, and it's empty most days, which is correct. It's also computed at build time, so a post only drops out of the file when the site is next built.

## Submitting after deploy

The old route for telling Google about a changed sitemap was a ping to a URL on google.com. That endpoint was retired in 2023, and plenty of deploy scripts still call it and get nothing useful back. I replaced it with a step in `.github/workflows/deploy.yml` that uses the Search Console API, after the Cloudflare deploy has finished.

The step runs only on a push to `master`, so pull request builds don't submit anything. A service account authenticates it, with the key in a repository secret, and it skips quietly if the secret is missing. That account has Search Console access only. The repo is public, so I didn't want a broader key anywhere near it.

The loop is a PUT per property:

```python
props = {
    'sc-domain:seanreilly.net': 'https://www.seanreilly.net/sitemap_index.xml',
    'sc-domain:seanreilly.uk': 'https://www.seanreilly.uk/sitemap_index.xml',
    'sc-domain:seanreilly.ie': 'https://www.seanreilly.ie/sitemap_index.xml',
    'sc-domain:seanreilly.eu': 'https://www.seanreilly.eu/sitemap_index.xml',
}
```

Each one is a `PUT` to `webmasters/v3/sites/{site}/sitemaps/{feed}` and the step prints OK or ERR with the status code, then exits non-zero if any property failed. I set the properties up as domain properties, which cover every subdomain and protocol in one go.

## What's untidy

The comment above that step in the workflow still says "all 5 regional TLDs". There are four in the list, because the fifth domain has gone. I'll fix the comment next time I'm in the file.

There's a bigger gap in the news sitemap. The content and image templates both skip hidden posts. The news template doesn't check `hidden` at all. A hidden draft dated within the last 48 hours would be listed there for as long as the build stays fresh. The drafts on this site are all dated more than 48 hours back, so none has ever qualified. I'll add the `hidden` check next time I'm in there.

And the archives sitemap builds its tag and category list from every post, hidden ones included. A tag used only on a hidden draft would still get a URL.
