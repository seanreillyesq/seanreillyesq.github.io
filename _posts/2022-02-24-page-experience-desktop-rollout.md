---
author: Sean
comments: true
date: 2022-02-24 09:00:00+00:00
layout: post
slug: page-experience-desktop-rollout
hidden: true
robots: noindex
title: "Page Experience Comes to Desktop: A Short Note for Ecommerce Teams"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Google's page experience update is rolling out to desktop, with Core Web Vitals and HTTPS but not mobile-friendliness. What ecommerce teams should check.
categories:
- Digital Marketing
tags:
- SEO
- Core Web Vitals
- Technical SEO
---

Google confirmed on Tuesday that the page experience update has started rolling out to desktop results. It's going slowly and should be finished by the end of March. This was announced back in November, so nobody should be surprised, but I've already had the "do we need to do anything?" question, so here's my short answer.

## What's actually changing

The desktop version uses the same ingredients as the mobile one that landed last summer:

- **Core Web Vitals**: Largest Contentful Paint, First Input Delay and Cumulative Layout Shift, with the same thresholds
- **HTTPS**
- **No intrusive interstitials**

The one thing missing is mobile-friendliness, which makes sense because it's a desktop signal. If you run separate mobile and desktop URLs, the desktop signal is based on the desktop pages.

Google has been clear, as it was with mobile, that this is not a dramatic change and that relevance still comes first. I think of page experience as a tie-breaker between pages that are otherwise close.

## Why I'm not ignoring it anyway

The ranking effect is small, but I have a different worry for ecommerce sites. A lot of teams fixed their mobile templates last year, saw the green in Search Console, and stopped looking. Desktop pages often carry heavier stuff: wider hero carousels, bigger product images, more third-party scripts because "there's room". On a lot of shops, desktop is where the basket is actually completed, so slow and jumpy desktop pages cost money before Google gets anywhere near them.

Cumulative Layout Shift is the one I'd look at first. On product pages it tends to come from:

1. Images without width and height set, so the page reflows as they load
2. Review widgets and "buy now, pay later" messages that inject themselves late
3. Cookie banners that push content down rather than sitting over it
4. Late-loading font files swapping in and nudging everything along

Anyone who has clicked "add to basket" and hit a size guide link instead because the page moved knows exactly why this metric exists.

## Lab data versus field data

One thing that trips people up: the score you get from running Lighthouse on your own laptop is lab data, a single simulated visit. The ranking signal uses field data from the Chrome User Experience Report, which is what real Chrome users actually experienced over the previous 28 days. The two often disagree. A page can score badly in Lighthouse and pass in the field because most visitors are on fast connections, or the other way round.

That 28-day window also means fixes take a while to show. Ship an improvement today and the field data won't fully reflect it for about a month, so don't judge a fix by next week's report.

## What I'd do this month

- Open the page experience report in Search Console. Google added a desktop section last month, sitting under the mobile one, and it's the easiest place to see whether you have a problem at all.
- Check field data in PageSpeed Insights for your top category and product templates, not just the homepage. The homepage is rarely where the money is.
- Audit third-party scripts on desktop specifically. Chat widgets, heatmaps, A/B testing tools, the old affiliate pixel nobody remembers adding. Each one has a cost.
- Agree a budget with whoever owns the site so that new scripts need a reason to go on.

If the report comes back mostly green, good. Leave it and get on with something more useful. If it doesn't, the fixes are usually dull and well understood, and the customers benefit whether or not Google moves you a place or two.

I'll check the report again once the rollout finishes at the end of March and see whether anything moved.
