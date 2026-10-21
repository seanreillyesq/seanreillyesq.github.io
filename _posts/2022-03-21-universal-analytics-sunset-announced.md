---
author: Sean
comments: true
date: 2022-03-21 08:30:00+00:00
layout: post
slug: universal-analytics-sunset-announced
hidden: true
robots: noindex
title: "Universal Analytics Has an End Date: 1 July 2023"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Google will stop processing Universal Analytics data on 1 July 2023. Why the real deadline for GA4 is much sooner, and what I'm doing about history.
categories:
- Digital Marketing
tags:
- Analytics
- GA4
- Universal Analytics
---

Last Wednesday Google announced that standard Universal Analytics properties will stop processing new data on 1 July 2023. Analytics 360 customers get until 1 October 2023. After that, Google says you'll be able to get at previously processed data for at least six months, and then it goes.

I knew this was coming at some point. GA4 has been the default for new properties since late 2020 and Google hasn't hidden which product it cares about. What surprised me was the length of the runway. Sixteen months sounds generous, but for anyone who wants year-on-year figures it's a lot shorter than that.

## The deadline that matters is this summer

Here's the bit that took me a minute to work through. If you want a year-on-year comparison in GA4 on the day UA switches off, GA4 needs to have been collecting decent data by July of this year, with ecommerce events firing correctly, which in practice means starting around now.

Anyone who leaves the switch until 2023 will spend their first year in GA4 with nothing to compare against. For an ecommerce business that plans around seasonal peaks, losing last year's Black Friday or last year's January sale as a benchmark is a real problem. Trading meetings run on "how are we doing versus last year?", and the honest answer for those teams will be "we don't know".

## History doesn't come with you

There's no migration of old data from UA into GA4. They're different data models: UA is built around sessions and pageviews, GA4 around events. So the years of history sitting in your UA property stay there, and once the access window closes they're gone.

What I'd export before then, at minimum:

- Monthly sessions, revenue, transactions and conversion rate, split by channel, going back as far as you have them
- The same by device, because the mobile shift is a story you'll want to tell later
- Top landing pages and top products by revenue for each year
- Anything your board pack or monthly reporting depends on

A spreadsheet is fine for most of this. If you have the budget and the skills, getting it into BigQuery or another warehouse gives you more room.

## Learning GA4 takes time

I've been poking around GA4 on and off for a while and I'll be honest, I find it frustrating in places. Reports I could build in seconds in UA take real work in Explorations. Views are gone. Some numbers look different simply because they're counted differently, and you'll spend time explaining that a drop in "sessions" is a definition change and not a disaster.

There are good bits too. Cross-device and app-plus-web measurement make a lot more sense, the event model is more flexible once you get used to it, and the free BigQuery export is a big deal for anyone who wants raw data without paying for 360.

But it's a different tool, and teams need time to learn it before they're depending on it. That's another reason to start now rather than next year.

## Who needs to hear about this

Analytics migrations get treated as a technical job, and the setup is. But the people most affected are the ones who read the reports: finance, the board, buyers, whoever runs paid media. They'll be the ones asking why a familiar number has changed. I'd tell them now, in plain terms, that the tool behind the monthly figures is being replaced, that some numbers will shift for definitional reasons, and that there will be a period where both are running side by side. I'd rather have that conversation now than next June.

## What I'm doing this month

Getting GA4 running alongside UA on everything, checking ecommerce events against actual orders, and starting the export list above. I'll write up how the setup goes once there's some data to look at.
