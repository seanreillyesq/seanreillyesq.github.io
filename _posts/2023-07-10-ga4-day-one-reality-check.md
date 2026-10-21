---
author: Sean
comments: true
date: 2023-07-10 09:00:00+00:00
layout: post
slug: ga4-day-one-reality-check
hidden: true
robots: noindex
title: "GA4 Is All We've Got Now. A Reality Check"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Universal Analytics stopped processing on 1 July. The GA4 differences that are causing the most confusion, and what to tell people who read the reports.
categories:
- Digital Marketing
tags:
- Analytics
- GA4
---

Universal Analytics stopped processing data on 1 July, at least officially. There are reports of some properties still recording hits a week later, which I wouldn't read anything into or build anything on. For practical purposes, GA4 is now the only Google Analytics most of us have.

I've been [writing about this switch](/universal-analytics-sunset-announced-20220321/) since Google announced the date in March last year, so this is less a how-to and more a list of the things that seem to be confusing people now that GA4 numbers are the only numbers. If you're the person who has to explain the reports to someone else, these are the conversations I'd get ahead of.

## "Our sessions have dropped"

GA4 counts sessions differently. It doesn't start a new session at midnight or when a campaign parameter changes the way UA did, so session counts often come out lower. Users are counted differently too. If someone puts a GA4 July next to a UA July from last year, the gap is partly real and partly definition, and you can't separate the two cleanly. My advice is to stop comparing session counts across the two tools at all, and to rely on orders and revenue from your own platform for year-on-year trading comparisons.

## "Where's bounce rate?"

It's back, after a fashion, but defined as the inverse of engagement rate, which means a visit lasting more than ten seconds, or with a conversion, or with two or more page views, counts as engaged. A GA4 bounce rate isn't the same number as a UA one, and it's usually a lot lower. I'd stop reporting it altogether and use engagement rate, so nobody tries to compare it with the old figure.

## "Why don't these numbers match?"

A few reasons this keeps coming up:

- **Thresholding.** With Google signals switched on, GA4 withholds some data in reports where small numbers might identify people. You'll see a warning icon. Switching the reporting identity to device-based usually helps.
- **Processing lag.** GA4 can take 24 to 48 hours to settle. Yesterday's numbers in the morning meeting may change by the afternoon.
- **The (other) row.** In reports with lots of unique values, like pages or search terms, GA4 lumps the long tail into "(other)". Annoying, and worse on big catalogue sites.
- **Explorations retention.** If nobody raised data retention from the two-month default, Explorations can't look back further than that.

## "Which channel gets the credit?"

GA4 uses data-driven attribution by default, not last click. Google announced in April that it's removing first click, linear, time decay and position-based models from GA4 and Google Ads later this year. For anyone used to last-click reporting from UA, channel totals will shift, often away from direct and towards paid. That isn't wrong as such, but it should be explained to whoever reads the channel report before they start moving budget about.

## The things I'm actually missing

Views, mainly. Having a filtered view for one region or one part of the site was simple in UA. In GA4 it means comparisons, segments in Explorations, or more data streams. Also the speed of the old standard reports. For anything slightly specific I now find myself building an Exploration, which is slower and more fiddly.

## The things that are better

Event tracking is more flexible once it clicks. Not having to choose between category, action and label for every interaction is a relief. The free BigQuery export is a big deal, and I'd turn it on for any site that hasn't. And cross-device measurement makes more sense than UA's patchwork ever did.

## What I'd tell people this month

Send a short note to everyone who reads analytics reports. Something like: the tool behind our web numbers has changed; some figures will look different because they're counted differently; use the ecommerce platform for sales; give us until the autumn before drawing conclusions from GA4 trends.
