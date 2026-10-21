---
author: Sean
comments: true
date: 2021-01-28 08:30:00+00:00
layout: post
slug: core-web-vitals-page-experience-update-explained
hidden: true
robots: noindex
title: "Google's Page Experience Update Is Coming: Core Web Vitals Explained"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Google's Page Experience update lands in May 2021. What LCP, FID and CLS measure, where to find your scores, and what an ecommerce site should fix first.
categories:
- Digital Marketing
tags:
- SEO
- Core Web Vitals
- Ecommerce
---

Google has given us a date, which it rarely does. In November it confirmed that the Page Experience update will start to affect rankings in May this year, and that Core Web Vitals will sit at the centre of it. That's four months away, and on Tuesday evening I sat in on Search London's online session on core updates and ecommerce SEO, which got me writing down where my own thinking has got to.

I'll be upfront: I don't expect this to be a ranking earthquake. Google has been fairly clear that relevance still wins, and that a page with a great answer and a slow load will usually beat a fast page with a poor one. But speed and stability have been quietly ignored on a lot of ecommerce sites for years because nobody could put a commercial number on them. Now there is a ranking reason, and in my experience a ranking reason gets budget signed off far quicker than "the site feels a bit sluggish" ever did.

## The three metrics

Core Web Vitals are three measurements, each meant to capture something a real person notices.

- **Largest Contentful Paint (LCP)** - how long it takes for the biggest visible thing on the page to appear. On a product page that is usually the hero image. Google's "good" threshold is 2.5 seconds or less.
- **First Input Delay (FID)** - how long the browser takes to respond when someone first taps or clicks. Heavy JavaScript is normally the culprit. Good is under 100 milliseconds.
- **Cumulative Layout Shift (CLS)** - how much the page jumps about while it loads. The classic example is going to tap "Add to bag" and hitting a banner that has just shoved everything down. Good is 0.1 or less.

The bit that confused me at first is how they're scored. Google uses field data from the Chrome User Experience Report, meaning real visits from real Chrome users, and it looks at the 75th percentile. So it isn't enough for your page to be quick on your office broadband. Three quarters of actual visits need to hit the threshold, including the ones on a mid-range Android phone on a train.

The other page experience signals aren't new: mobile-friendly, HTTPS, safe browsing, and no intrusive interstitials. If you were around for the Mobilegeddon and HTTPS changes, you'll recognise the pattern. Google has also said that AMP will no longer be a requirement for Top Stories once this lands, which is a bigger deal for publishers than for retailers.

## Where to find your scores

You don't need to buy anything to start.

1. **Search Console's Core Web Vitals report.** This groups your URLs into good, needs improvement and poor, by mobile and desktop. It's field data, so it's the closest thing to what Google will actually use.
2. **<a href="https://developers.google.com/speed/pagespeed/insights/" target="_blank" rel="noopener">PageSpeed Insights</a>.** Shows field data at the top when there's enough of it, and lab data from Lighthouse underneath. The lab numbers are for diagnosing, not for reporting upwards.
3. **Lighthouse in Chrome DevTools.** Handy for testing a fix on a staging page before it goes live.

One thing that catches people out: a low-traffic page may not have enough Chrome data to have its own score, so Google groups it with similar pages. On an ecommerce site that often means your templates matter more than individual URLs, so a fix to the product template can move thousands of pages at once.

## What I'd look at first on an ecommerce site

This is roughly the order I'm working through.

- **Hero images on product and category pages.** Oversized, uncompressed photography is the most common LCP problem I see, and luxury sites are the worst offenders because everyone wants the leather grain to look perfect. Serve properly sized images, use modern formats where the platform allows, and don't lazy-load the main image above the fold.
- **Third-party scripts.** Reviews widgets, chat, personalisation tools, three different analytics tags and a heatmap someone installed two years ago and forgot about. Every one of them competes for the main thread, and FID suffers. Audit them and be ruthless.
- **Banners and pop-ups that push content down.** Cookie notices, free-delivery bars and email sign-up prompts are CLS machines. Reserve the space for them in the layout, or overlay them instead of inserting them.
- **Web fonts.** A font swap that reflows a whole product description counts as layout shift. Preload the fonts you actually use.

## The honest downside

Some of this sits on your platform, not your site. If you're on a hosted platform with a theme you didn't build, there will be limits to what you can change without a developer, and some fixes, like removing a script the marketing team relies on, need a conversation with whoever owns it before anyone touches the code. I'd rather have those conversations now than in June when someone notices a dip and starts looking for a cause.

I'd also be wary of anyone selling Core Web Vitals as a guaranteed ranking win. Faster pages convert better whether Google is watching or not, and that's the argument I'd lead with internally, with May as the deadline that gets it scheduled.
