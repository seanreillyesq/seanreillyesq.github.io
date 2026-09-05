---
author: Sean
comments: true
date: 2013-01-14 09:00:00+00:00
layout: post
slug: seo-2013-technical-fundamentals
hidden: true
robots: noindex
title: "SEO in 2013: Why Technical Fundamentals Matter More Than Ever"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: After Panda and Penguin, everyone talks content and links. The technical plumbing underneath your site is what I think will matter most in 2013.
categories:
- Digital Marketing
tags:
- SEO
- Technical SEO
---

The last two years have made a lot of people nervous. Panda went after thin content, Penguin went after paid and manipulative links, and every few months there is a fresh scare about what Google will punish next. Almost all the conversation I hear now is about content quality and link profiles. What gets far less attention, and what I think will decide a lot of rankings this year, is whether the site is actually built properly underneath all of that.

Technical SEO is the plumbing. You only think about it when something backs up.

Here is the uncomfortable bit. You can commission the best content in your sector and earn genuinely good links to it, and still lose ground because Googlebot cannot crawl half your pages, or because you have three URLs serving the same product with no canonical telling Google which one counts. I have seen sites where the marketing spend was pouring into content while the CMS was generating thousands of duplicate parameter URLs in the background. All that effort, diluted before it started.

The good news is that most of this is fixable, and a lot of it is free to check.

Start with Google Webmaster Tools. The crawl errors report will tell you what Googlebot is choking on, and the "Fetch as Google" feature shows you roughly what the crawler sees rather than what your browser renders. If those two things are wildly different, you have a problem worth an afternoon.

A few things I would look at before touching anything else:

- **Crawl budget waste.** Faceted navigation, session IDs and print versions can generate endless near-duplicate URLs. Sort out your parameter handling and your robots.txt.
- **Canonical tags.** If the same content is reachable at more than one address, tell Google which one is the real one. Getting this wrong silently splits your ranking signals.
- **Site speed.** Google has been treating speed as a ranking input for a while now, and page weight keeps creeping up. Slow pages also lose you conversions regardless of rankings, so there is no downside to fixing them.
- **XML sitemaps that match reality.** A sitemap full of redirects and 404s tells Google you do not know your own site.

None of this is glamorous work and none of it makes a good case study. It is the sort of thing that gets skipped because a blog post about content strategy is more fun to write and easier to sell up the chain.

If you only do one thing this month, open Webmaster Tools and read your crawl errors report. Whatever is at the top of that list is probably costing you more than your next piece of content will earn.
