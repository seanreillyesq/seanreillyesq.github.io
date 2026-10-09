---
author: Sean
comments: true
date: 2026-02-12 09:00:00+00:00
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

For years this blog used `jekyll-sitemap`, because GitHub Pages let me and it took no effort. When I moved the build to GitHub Actions and Cloudflare Pages in late January 2026, the reason for that choice went away. Plugins were allowed, and so was anything else.

I dropped the plugin anyway. It writes one flat `sitemap.xml`. It cannot produce an index, an image sitemap, a news sitemap or hreflang entries, and I wanted all four of those. Rather than bolt on a second plugin, I wrote the files by hand as Liquid templates. The Gemfile and `_config.yml` both carry a comment saying the plugin is left out on purpose, mostly so that future me does not helpfully add it back.

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

The same block repeats for `sitemap-images.xml`, `sitemap-archives.xml` and `sitemap-news.xml`. Each file is a normal Jekyll page with `layout: null` front matter, so Jekyll renders it and writes it to the root of `_site`. The `lastmod` on the index entries is the build time. That is lazy, and it means the index claims everything changed on every deploy. It does not, but I have not yet found it worth the effort of working out a real value per child.

**Content.** Pages and posts, with the hreflang alternates described in the [previous post](/hreflang-across-four-tlds-on-one-jekyll-build-20260205/). Anything with `hidden: true`, `sitemap: false` or a noindex robots value is skipped. Posts use `last_modified_at` where it exists and fall back to the post date. That field comes from `jekyll-last-modified-at`, which is why the workflow checks out with `fetch-depth: 0`. A shallow clone has no history for the plugin to read, and every page would come out with the same date.

**Images.** Each visible post gets a `<url>` entry with its header image attached, plus any `.jpg`, `.png` or `.webp` files found under `/assets/<post-slug>/`. The slug is derived from the URL:

{% raw %}
```liquid
{%- assign post_slug = post.url | split: '/' | last | split: '-20' | first -%}
```
{% endraw %}

It splits on `-20` to strip the date suffix, which works until a post title contains `-20` itself. One for the list of things I would fix if anyone paid me to.

**Archives.** Category and tag pages, at priority 0.3 and 0.2. The comment in the file admits that some SEOs leave these out. I included them, but at the bottom of the pile.

**News.** Posts from the last 48 hours only, capped at ten, because that is what Google News asks for:

{% raw %}
```liquid
{%- assign two_days_ago = 'now' | date: '%s' | minus: 172800 -%}
{%- for post in site.posts limit: 10 -%}
```
{% endraw %}

This blog is not in Google News and is not going to be. I built the file because I wanted to see what it takes, and because a news sitemap that is empty most of the time is correct behaviour rather than a fault. It is also computed at build time, so a post only drops out of the file when the site is next built.

## Submitting after deploy

The old route for telling Google about a changed sitemap was a ping to a URL on google.com. That endpoint was retired in 2023, and plenty of deploy scripts still call it and get nothing useful back. I replaced it with a step in `.github/workflows/deploy.yml` that uses the Search Console API, after the Cloudflare deploy has finished.

It runs only on a push to `master`, so pull request builds do not submit anything. It authenticates with a service account whose key sits in a repository secret, and it skips quietly if the secret is missing. The service account has Search Console access only. The repo is public, so I did not want a broader key anywhere near it.

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

## What is untidy

The comment above that step in the workflow still says "all 5 regional TLDs". There are four in the list, because the fifth domain has gone. The comment is wrong and the code is right, which is the better way round.

There is a bigger gap in the news sitemap. The content and image templates both skip hidden posts. The news template does not check `hidden` at all. A hidden draft dated within the last 48 hours would be listed there for as long as the build stays fresh. The drafts on this site are dated in the past or are noindexed, so it has not mattered yet, but it is a hole and I know where it is.

And the archives sitemap builds its tag and category list from every post, hidden ones included. A tag used only on a hidden draft would still get a URL.
