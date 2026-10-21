---
author: Sean
comments: true
date: 2025-09-23 09:00:00+01:00
layout: post
slug: google-num-100-search-console-impressions
hidden: true
robots: noindex
title: "Why Search Console Impressions Dropped in September (the num=100 Change)"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Google quietly stopped supporting the num=100 parameter. Search Console impressions dropped and average position jumped. What it means for reporting.
categories:
- Digital Marketing
tags:
- SEO
- Search Console
- Reporting
---

If you've opened Search Console in the last week or so and felt a bit sick, you're in large company.

Around 10-12 September, impressions fell sharply for a huge number of sites. Desktop especially. At the same time, average position improved, sometimes by several places, with no change to anything on the site. Clicks barely moved.

The cause, as far as anyone can tell, is that Google stopped honouring `&num=100`. That's the URL parameter that let you load 100 results on a single page instead of ten. Hardly any normal searcher used it. Rank trackers and SEO tools used it constantly, because it let them check a hundred positions with one request.

Google hasn't announced anything. The only comment so far is a spokesperson telling Search Engine Land that the parameter is "not something that we formally support".

## Why your impressions dropped

Search Console counts an impression when your result appears on a results page that gets loaded, whether or not anyone scrolls to it. When a rank tracker loaded a 100-result page, every site from position 1 to 100 got an impression. Your page at position 64 for some obscure query was racking up impressions from bots that were never going to click on anything.

Remove the parameter and those bot-driven impressions largely vanish. What's left is much closer to impressions from real people, who almost never go past page one or two.

Average position improves for the same reason. All those deep, low-ranked impressions were dragging the average down. Take them out and the average is calculated mostly on the queries where you actually appear near the top.

## What it means for the last year or so of data

This is the uncomfortable bit. For the past year or more, plenty of people in SEO have pointed at a widening gap in Search Console: impressions rising steadily, clicks flat or falling. The usual explanation was AI Overviews, people seeing your result in the answer but not clicking.

Some of that was probably real. But at least part of the impression growth now looks like it was tool traffic, and a chunk of it has just disappeared overnight. The gap has narrowed, and nobody can say precisely how much of the old story was AI and how much was scrapers.

I'm not saying AI Overviews aren't taking clicks. There's decent independent evidence they are. I'd just be more careful about using impressions as part of that argument from here on.

## What I'd do

1. **Annotate the date** in every report and dashboard that uses Search Console. Mid-September 2025, num=100 removal. You will need that note in a year when someone runs a year-on-year comparison.
2. **Stop using impressions as a headline KPI** for a while. Year-on-year impression comparisons are broken until September 2026. Clicks are unaffected, so lean on those.
3. **Don't celebrate the average position improvement.** It's an artefact. If someone sends round a chart showing average position jumping from 18 to 11, gently explain why before it ends up in a board pack.
4. **Ask your rank tracking vendor what's changed.** Checking the top 100 now takes ten requests rather than one. Expect some tools to track fewer positions, update less often, or raise prices. Some have already said they're reducing depth.
5. **Rethink how deep you need to track.** Positions 50 to 100 rarely matter commercially. If your tracker now only reliably covers the top 20 or 30, that's probably fine for most decisions.

## The bigger pattern

This is the second time this year a quiet change on Google's side has knocked out SEO tooling. In January it was requiring JavaScript to load search results, which [broke a lot of rank trackers for a few days](/google-search-javascript-rank-tracking-20250122/). Now this. Neither came with an announcement.

I don't think that's a coincidence. Scraping Google has always been against its terms, and the AI companies scraping results at scale have probably given Google a much stronger reason to clamp down than SEO tools ever did. SEO tools are caught up in it.

Search Console is still the closest thing to a record of how you perform in Google, but this month showed that even its numbers can change meaning without warning. I'd keep an annotations log alongside it from now on, and check it before reading anything into a sudden change.
