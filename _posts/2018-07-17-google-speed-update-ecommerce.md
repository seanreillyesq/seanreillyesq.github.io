---
author: Sean
comments: true
date: 2018-07-17 09:00:00+00:00
layout: post
slug: google-speed-update-ecommerce
hidden: true
robots: noindex
title: "The Speed Update Is Live: Where Ecommerce Sites Should Start"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Google's Speed Update now uses page speed in mobile rankings. It only hits the slowest pages, but here is where I'd start on an ecommerce site anyway.
categories:
- Digital Marketing
tags:
- SEO
- Site Speed
- Ecommerce
---

Google confirmed last week that the Speed Update is now rolling out for all users. It was <a href="https://webmasters.googleblog.com/2018/01/using-page-speed-in-mobile-search.html" target="_blank" rel="noopener">announced back in January</a>, so there's been six months' notice, and it does what it says: page speed is now a ranking factor for mobile searches, not only desktop ones.

Before anyone rebuilds their site in a panic, Google has been clear that this only affects pages delivering the slowest experience to users, and only a small percentage of queries. A page that's a bit sluggish but has the most relevant content will still rank.

So for most sites this isn't a ranking emergency. I'd still treat it as a good excuse to do the work, because the commercial case for speed was already strong before Google added its weight to it.

## Why ecommerce should care anyway

Mobile is now where most browsing happens for most of the retailers I've seen, even if a lot of the buying still happens on desktop. Mobile conversion rates are lower almost everywhere, and slow pages are a big part of the reason. People on a phone, on a train, on patchy 4G, don't wait. In my experience, shaving a second or two off a product page shows up in revenue well before it shows up in rankings.

## Where I'd start

This is roughly the order I work in on an ecommerce site. It front-loads the cheap fixes.

**1. Images.** Nearly always the biggest win. Product photography is often uploaded straight from the studio at several megabytes and resized in the browser. Serve properly sized images, compress them, and lazy-load anything below the fold. On a site built around product photography this matters more, not less.

On Shopify specifically, the `img_url` filter will serve a resized copy from Shopify's CDN if the theme asks for one, `'800x'` for example. A surprising number of themes ask for `'master'`, which is the original upload. I'd search the theme files for `master` and check what each one is actually used for. Adding `srcset` so a phone isn't downloading the same file as a large desktop monitor is the next step after that, and most older themes don't do it.

**2. Third-party scripts.** Count the tags. Reviews widgets, live chat, retargeting pixels, two analytics tools, a heatmap someone installed for a test two years ago. Each one adds requests and blocks rendering. Remove what nobody uses and move the rest into a tag manager where you can at least see them. (This overlaps nicely with the tag audit a lot of us did for GDPR.)

**3. Hosting and caching.** Check server response time on product and category pages, not only the homepage. A CDN for static assets is cheap and often makes a noticeable difference for international visitors.

**4. Fonts.** Web fonts are easy to overdo. Three weights of two typefaces is a lot of downloading before any text shows up.

**5. Theme bloat.** On platforms like Shopify, themes and apps often load scripts on every page whether they're needed or not. Uninstalled apps can leave code behind in the theme. Worth a look.

## Measuring it

The tools I use most:

- **<a href="https://developers.google.com/speed/pagespeed/insights/" target="_blank" rel="noopener">PageSpeed Insights</a>.** It now includes real-user data from the Chrome User Experience Report where Google has enough of it, which is more useful than the old score on its own. If your pages have field data, look at that first.
- **Lighthouse,** in the Audits panel of Chrome's developer tools. Good for a detailed list of what to fix, run with mobile emulation. It throttles the connection and CPU by default, so the numbers will look worse than the page feels on office wifi. That's rather the point, as that's closer to what a customer on a train gets.
- **<a href="https://www.webpagetest.org/" target="_blank" rel="noopener">WebPageTest</a>.** For waterfalls, so you can see exactly which request is holding everything up, and for testing from different locations and connection speeds.
- **Google Analytics site speed reports,** which are sampled but give you a real-world view by device and page.

Test product pages and category pages, not just the homepage. The homepage is usually the most optimised page on the site and the least representative.

## Don't chase the score

The thing I'd caution against is chasing a perfect PageSpeed score. I treat it as a diagnostic. I've seen sites strip out useful features to get a green number, and lose more in conversion than they'd ever gain in rankings. The question to ask is whether real visitors on real phones are getting a page they can use quickly.

This follows the [mobile-first indexing rollout](/mobile-first-indexing-rollout-begins-20180328/) in March. Google has been signalling all year that the mobile experience is what it cares about, and the two changes together make that fairly hard to ignore.
