---
author: Sean
comments: true
date: 2022-07-05 08:45:00+00:00
layout: post
slug: ga4-one-year-to-ua-switch-off
hidden: true
robots: noindex
title: "GA4: Twelve Months Until Universal Analytics Stops. A Setup Checklist"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: A year from now Universal Analytics stops processing data. A practical GA4 checklist for ecommerce sites, including the settings that catch people out.
categories:
- Digital Marketing
tags:
- Analytics
- GA4
- Ecommerce
---

As of last Friday there is exactly a year left before standard Universal Analytics properties stop collecting data. Back in March I wrote about [why the real GA4 deadline is this summer](/universal-analytics-sunset-announced-20220321/): if GA4 isn't recording properly by now, you won't have a clean year-on-year comparison when UA goes.

This is the follow-up: a checklist for ecommerce sites, in the order I'd go through it.

## 1. Change data retention on day one

By default GA4 keeps event-level data for two months. That limit applies to Explorations, the custom reports where you do most of the real analysis. You can raise it to 14 months under Admin, Data Settings, Data Retention. It doesn't apply retrospectively, so every week you leave it at two months is data you can't get back in Explorations.

Standard reports aren't affected in the same way, but you'll want Explorations, trust me.

## 2. Turn on the BigQuery export

GA4 includes a free BigQuery export, which used to be a 360-only feature. Even if nobody on your team writes SQL yet, switch it on. Storage costs are tiny for most sites, and it's your raw event data sitting somewhere you control. When retention runs out or a report doesn't do what you need, you'll be glad it's there.

## 3. Get the ecommerce events right

GA4 has a recommended set of ecommerce events: `view_item_list`, `view_item`, `add_to_cart`, `begin_checkout`, `add_shipping_info`, `add_payment_info` and `purchase`, among others. Use Google's names and parameters exactly. If you invent your own, the monetisation reports won't populate. If you handle refunds online, send the `refund` event as well, otherwise GA4 revenue only ever goes up.

Then check them against reality:

- Pull a day's orders from your ecommerce platform and compare the count and revenue with GA4's `purchase` events
- Check the transaction ID is coming through, so you can spot duplicates from people refreshing the confirmation page
- Make sure currency is being sent, especially if you sell in more than one

Some gap between platform and analytics is normal, with ad blockers and consent refusals. A big or unexplained gap means something's broken.

## 4. Mark your conversions

GA4 doesn't carry over goals. Decide which events count as conversions (`purchase` obviously, possibly newsletter sign-up or account creation) and mark them. Do it now so the history starts building.

## 5. Sort out internal and unwanted traffic

Define internal traffic by IP and activate the filter. Add your payment providers to the list of unwanted referrals, otherwise people returning from a payment page show up as a new referral session and steal the credit from whatever actually brought them to the site.

## 6. Write down what's different

This is the dull one. GA4 counts sessions differently, has engagement rate instead of bounce rate, and has no views. Someone in the business will compare a GA4 number with a UA number and decide sales have fallen off a cliff. A one-page note explaining what's changed, shared before the first report goes out, saves a lot of awkward meetings.

## The bit I'm still unsure about

Consent. With the cookie banner set up properly, a share of visitors won't be measured at all, and that share varies by country and device. GA4 has some modelling to fill the gap, but I haven't seen enough of it yet to trust it. For now I'm treating GA4 numbers as a trend line, with the ecommerce platform as the source of truth for revenue.

If you've only got an afternoon this week, do steps one and two, since neither works retrospectively. Linking Google Ads and Search Console can wait a week.
