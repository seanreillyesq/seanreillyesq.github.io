---
author: Sean
comments: true
date: 2017-08-22 09:00:00+00:00
layout: post
slug: ecommerce-site-speed
hidden: true
robots: noindex
title: "Site Speed Belongs on the Commercial Agenda"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Slow ecommerce sites lose sales, especially on mobile. Where the weight usually comes from, how to measure it, and why marketing tags are often to blame.
categories:
- Digital Marketing
tags:
- Ecommerce
- Site Speed
- Mobile
---

Site speed tends to get filed under "technical" and handed to the developers, who are then asked to make the site faster while marketing keeps adding things that make it slower. I've been on the marketing side of that conversation for years, and I've added my share of what slows sites down.

## Why it matters more on mobile

Google published some research last autumn from its DoubleClick team which found that <a href="https://web.archive.org/web/20160908152245/https://www.doubleclickbygoogle.com/articles/mobile-speed-matters/" target="_blank" rel="noopener">53% of mobile site visits are abandoned if pages take longer than three seconds to load</a>. You can argue about the methodology, and they were selling something too, but anyone who has tried to buy something on a train with one bar of 3G knows the general point is true.

Speed has been part of Google's ranking for desktop searches since 2010, and with the mobile-first index on its way I'd be surprised if mobile speed doesn't end up counting for more. Ranking isn't the main reason I care, though. A slow site loses people who already found you, and on mobile that's most of your traffic.

## Where the weight comes from

When I look at a slow ecommerce site, it's usually some combination of these:

- **Images.** Product photography uploaded at full resolution and scaled down in the browser. A category page showing forty products at 500KB each is 20MB. This is usually the biggest and easiest win.
- **Third-party tags.** Analytics, remarketing pixels, affiliate tracking, review widgets, live chat, A/B testing, heatmaps. Each one is small and justified on its own. Together they can add seconds, and some of them block the page from rendering until they've loaded.
- **The theme and platform.** Heavy themes loading every script on every page, uncached database calls, and hosting that copes on a quiet Tuesday and falls over during a promotion.
- **Fonts and sliders.** Four weights of a web font and a homepage carousel nobody clicks past the first slide of.

The tag point is the one I'd push hardest with other marketers, because it's ours. Every time we add a new tool for a trial, it tends to stay. Go through your tag manager and ask of each tag: who owns it, what decision has it informed in the last three months, and is the contract still live? You'll probably find a few you can switch off this week.

## Measuring it properly

A few tools I use regularly:

- <a href="https://developers.google.com/speed/pagespeed/insights/" target="_blank" rel="noopener">PageSpeed Insights</a> for a quick read and a list of obvious fixes, though I wouldn't obsess over the score itself.
- <a href="https://www.webpagetest.org/" target="_blank" rel="noopener">WebPageTest</a> for the detail. The waterfall view shows you exactly what loads when, and the filmstrip shows what a customer actually sees second by second. Test from a UK location on a throttled mobile connection, not your office broadband.
- Google Analytics' site speed reports, which are sampled and a bit rough, but show you real users' load times by page and device.

Test the pages that matter commercially: the homepage, top category pages, product pages and the checkout. Plenty of sites have a quick homepage and a slow checkout.

## Making the case

The hardest part is usually internal. Speed work rarely has the glamour of a new feature, and it's easy to keep pushing it back. What has worked for me is putting it in commercial terms: compare conversion rate for visitors who had fast page loads with those who had slow ones, from your own analytics. It won't be a clean experiment, and there are a lot of other differences between those groups, but it usually shows a big enough gap to get the conversation started. From there it's easier to argue for a performance budget, so that new features and new tags have to fit within an agreed page weight rather than just piling on.

I'm about halfway through doing this myself at the moment, so I'll report back on what actually moves the numbers.
