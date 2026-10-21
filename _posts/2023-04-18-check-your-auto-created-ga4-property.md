---
author: Sean
comments: true
date: 2023-04-18 09:00:00+00:00
layout: post
slug: check-your-auto-created-ga4-property
hidden: true
robots: noindex
title: "Google Built You a GA4 Property. Check It Before July"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Google has started creating GA4 properties for sites that never migrated. Why an automatic setup isn't a finished one, and what to check before 1 July.
categories:
- Digital Marketing
tags:
- Analytics
- GA4
- Universal Analytics
---

Ten weeks from now, standard Universal Analytics properties stop processing data. If you've been putting GA4 off, Google has started making the decision for you. From March, any UA property that hadn't been connected to a GA4 property, and whose owners hadn't opted out, could get a GA4 property created automatically, reusing the existing site tag where possible.

On paper that solves the problem for the people who ignored all the warnings. In practice I think it creates a new one: a GA4 property that exists, collects something, and looks fine at a glance, but that nobody has actually checked.

I've written before about [why the real deadline was last summer](/universal-analytics-sunset-announced-20220321/) and gave a [setup checklist](/ga4-one-year-to-ua-switch-off-20220705/) for ecommerce sites. This is narrower. If you have one of these automatic properties, or you aren't sure whether you do, here's what I'd look at.

## First, find out what you've got

Go into the Admin screen of your UA property and open the GA4 Setup Assistant. It will tell you whether a GA4 property is connected and whether it was created for you. If it was, the property name and creation date are the first clue. A property created in March has a few weeks of data at most, which matters for every comparison you try to make this year.

## Things an automatic setup won't get right

**Ecommerce events.** This is the big one. If your UA ecommerce tracking runs through Google Tag Manager, or a platform plugin, or a developer's custom code, reusing the site tag will give you page views and the automatic events. It won't give you properly formed `purchase`, `add_to_cart` and `begin_checkout` events with items and values. Check the monetisation reports. If they're empty, or the revenue looks nothing like your order system, the property is collecting traffic but not sales.

**Data retention.** New GA4 properties keep event-level data for two months by default, which limits how far back Explorations can go. Change it to 14 months under Data Settings. Nobody will have done this for you.

**Conversions.** Google says it will try to recreate UA goals as GA4 conversions. Look at what it made. Destination goals based on URL patterns don't always translate neatly into events, and you may find duplicates, or conversions counting things you stopped caring about years ago.

**Internal traffic and referrals.** Filters don't come across from UA views, because views don't exist in GA4. Define internal traffic again. Add payment providers as unwanted referrals, or the visit that comes back from a payment page will look like a new session and take credit for the sale.

**Google Ads.** If your UA property was linked to Ads, read what the automatic process has done there. Conversion actions and audiences built on UA will stop updating when UA stops, so you'll want GA4 equivalents in place and properly checked before you let any bidding strategy rely on them.

**Consent.** If your cookie banner was set up to control the UA tag specifically, check it also controls the GA4 tag. A mismatch here causes either a compliance headache or a hole in your data.

## Should you keep it or start again?

If the automatic property is collecting page views correctly and you can fix ecommerce and conversions on top of it, keep it. A few extra weeks of history is worth having.

If it's a mess, with duplicate tags firing, the wrong data stream or events you don't recognise, I'd set up a new property properly and live with the shorter history.

## Ten weeks is enough, just

The work above is a few days for most sites, not months. The risk is leaving it until the last fortnight of June, finding the ecommerce events never fired, and having no clean sales data in GA4 when UA stops. There's no fixing that afterwards.

If you only do one thing this week, open the monetisation reports in GA4 and compare yesterday's revenue with your platform's.
