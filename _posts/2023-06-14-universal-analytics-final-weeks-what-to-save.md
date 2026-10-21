---
author: Sean
comments: true
date: 2023-06-14 08:30:00+00:00
layout: post
slug: universal-analytics-final-weeks-what-to-save
hidden: true
robots: noindex
title: "Universal Analytics Has a Fortnight Left. What I'd Save"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Universal Analytics stops processing data on 1 July. What to export from it, how to do it without sampling, and why the archive deserves an afternoon.
categories:
- Digital Marketing
tags:
- Analytics
- Universal Analytics
- GA4
---

In just over two weeks, standard Universal Analytics properties stop processing new data. Google has said you'll be able to get into the old data for at least six months after that, and that it will give a final date later. That sounds like plenty of time. I'd still do the export this month, while the property is live and the people who set it up are still around.

I've used UA, and its predecessor before it, for most of my working life, and I'll admit to a bit of sentiment about it. It was clunky in places and sampled at the worst possible moments, but it's the tool a lot of us learnt digital marketing on. Anyway, the practical bit.

## Decide what you'll actually use

The temptation is to try to export everything. Don't. Nobody is going to rebuild session-level analysis from 2017. What you want is the history that answers the questions people will keep asking over the next few years:

- **Monthly totals:** sessions, users, transactions, revenue and conversion rate, as far back as the property goes
- **By channel:** the same monthly figures split by default channel grouping
- **By device:** desktop, mobile and tablet, because the long-term mobile story is the one board packs tend to want
- **Landing pages:** top pages by sessions and revenue for each year
- **Products:** top products by revenue and units for each year, if ecommerce tracking was in place
- **Goals:** completions by goal by month, with a note of what each goal actually measured

Write down your channel grouping definitions and any filters on the view you're exporting from. In two years someone will compare these numbers with GA4 and ask why they don't match. The honest answer will usually be in those notes.

## How to get it out

There are a few routes, depending on how much data and how much patience you have.

**The report interface.** For small exports, set the date range, choose your dimensions and export to Google Sheets or CSV. Fine for annual summaries.

**The Google Analytics Sheets add-on.** Lets you set up report queries in a spreadsheet and pull them in bulk. Good for the monthly-by-channel kind of table, and easy to rerun.

**The API.** If you have a developer or are comfortable with a bit of Python, the reporting API gives you the most control and lets you split long date ranges into smaller chunks.

Whichever route you use, watch for sampling. If the green shield in the interface turns yellow, the numbers are estimated from a subset of sessions. Splitting the date range into months, or weeks for busy sites, usually brings it back to unsampled. Monthly exports stitched together are better than one big sampled one.

## Where to keep it

Somewhere the business owns and will still be able to find. A shared drive folder with a clear name and a short README is enough for most. If you already use BigQuery for GA4, loading the UA exports there means you can query old and new together, which is handy as long as you remember they measure different things.

## The other job

Check that nothing important still depends on UA. Dashboards in Looker Studio pointing at UA properties will start showing flat lines in July. Google Ads conversions imported from UA goals will stop. Audiences built in UA will stop updating. Any automated report, spreadsheet or tool pulling from the UA API will go quiet without necessarily throwing an error.

That last one is what catches people out. A report showing zero gets noticed quickly; a weekly email that just stops arriving might not be missed for weeks.

## If you only have an afternoon

Export monthly sessions, transactions and revenue by channel for every year you have, unsampled. Put it somewhere safe. That's the table people will ask for most, and it shouldn't take more than a couple of hours.
