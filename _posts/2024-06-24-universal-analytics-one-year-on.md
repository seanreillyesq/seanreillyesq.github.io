---
author: Sean
comments: true
date: 2024-06-24 09:20:00+01:00
layout: post
slug: universal-analytics-one-year-on
hidden: true
robots: noindex
title: "Universal Analytics, One Year On. Export Your Data This Week"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: A year after Universal Analytics stopped collecting data, Google removes access to it from 1 July 2024. What to export, and how GA4 has settled.
categories:
- Digital Marketing
tags:
- Analytics
- GA4
- Google
---

Next Monday is 1 July. A year ago that date meant standard Universal Analytics properties stopped processing new data. This year it means the interface and the API go away for every Universal Analytics property, including the paid 360 ones that were given an extra year. Google has said access will start disappearing that week, and anything you haven't exported goes with it.

If you've got years of data in an old UA property and you haven't exported anything, this is the week to do it.

## What's worth keeping

You don't need everything. Nobody is going to rebuild a 2017 landing page report in a spreadsheet. What I'd keep is the stuff that gives you a long baseline that GA4 can't:

- **Monthly sessions, users and revenue by channel**, going back as far as the property goes. This is the one that answers "is this year actually bad, or is it just bad compared with last year?"
- **Monthly ecommerce totals**: transactions, revenue, average order value, conversion rate.
- **Top landing pages by year**, so you can see which content has carried the site over time.
- **Device split by year**, mainly for the long view of how mobile took over.
- **Anything a board pack or annual report has quoted.** If someone has ever put a UA number in front of investors, keep the source.

Exports are slow but simple. The reports themselves download to CSV, Google Sheets or PDF. For anything bigger, the Google Analytics Sheets add-on can still pull data through the reporting API until it switches off, and that lets you do monthly breakdowns over several years in one go. Watch out for sampling on large date ranges; break the queries into single years if the numbers look suspiciously round.

360 customers have the BigQuery export, which is the proper way to do it, but most businesses I know never had 360.

## How the move to GA4 has actually gone

Two years ago I wrote that UA had been [given an end date](/universal-analytics-sunset-announced-20220321/), and then a [twelve-month checklist](/ga4-one-year-to-ua-switch-off-20220705/) for getting GA4 ready. Looking back at that checklist now, most of it held up. The parts people skipped are the parts that still cause trouble.

**Data retention.** GA4's default retention for event-level data in explorations is two months. You can raise it to fourteen months on a standard property, and that's the maximum. Lots of properties are still on two months because nobody changed it. Standard reports aren't affected, but any exploration or funnel that needs more than eight weeks of history is.

**Thresholding.** Reports that hide rows when user numbers are small, mostly to protect identities when Google signals are involved. It catches people out constantly, because the numbers simply don't add up and the interface barely explains why.

**Reporting differences.** Sessions in GA4 aren't counted the same way as in UA, and GA4's bounce rate, which is just the inverse of engagement rate, isn't measuring the same thing UA's bounce rate did. Year-on-year comparisons across the switch need a footnote.

**Ecommerce tracking.** A surprising number of GA4 setups still have broken or half-implemented purchase events, often because a plugin or theme changed and nobody noticed. If your GA4 revenue doesn't roughly match your shop's own revenue figure, that's the first thing to fix, before anyone writes another report.

GA4 has improved over the year. The interface is less frustrating than it was at launch, the integration with Google Ads works better, and the BigQuery export being free on standard properties is a big deal for anyone who wants to own their raw data. I still find it slower to answer simple questions in than UA was, and I don't think that's only habit.

## The thing I'd do after exporting

Put the exported history somewhere people will actually use it. A Looker Studio report reading from a Google Sheet, a tab in whatever dashboard the business already looks at, even a single PDF of monthly totals. The value of eight years of history is the comparison, and the comparison only happens if it's sitting next to this year's GA4 numbers.

Then, once it's done, delete the UA tag from your site if it's somehow still there. Plenty of sites still have one firing.
