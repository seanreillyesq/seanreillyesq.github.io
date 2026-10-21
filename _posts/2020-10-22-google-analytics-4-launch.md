---
author: Sean
comments: true
date: 2020-10-22 09:00:00+00:00
layout: post
slug: google-analytics-4-launch
hidden: true
robots: noindex
title: "Google Analytics 4 Is Here. What Ecommerce Teams Should Do Now"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Google has renamed App + Web as Google Analytics 4 and made it the default. What has changed, what is missing, and a sensible migration plan.
categories:
- Digital Marketing
tags:
- Analytics
- Google Analytics
- Measurement
---

On 14 October Google announced Google Analytics 4. If you set up an App + Web property after my [post in July](/google-analytics-app-web-properties-20200721/), congratulations, you already have one: GA4 is App + Web out of beta, renamed, and now the default when you create a new property.

I've had a week to look at it properly. My view hasn't changed much since the summer. Set it up now, collect data, learn it, and don't switch off Universal Analytics yet.

## What Google has said

The announcement leaned heavily on a few themes:

- **Machine learning.** GA4 will surface insights automatically, such as unusual changes in your data, and includes predictive metrics like purchase probability and churn probability for audiences, provided you have enough data to qualify.
- **Privacy.** It's designed for a world with fewer cookies and less identifiable data, and Google talks about filling gaps with modelling. There are also more granular controls over data deletion and how data is used for ads.
- **Customer-centric measurement.** Users across app and web in one property, with the reporting organised around a customer lifecycle: acquisition, engagement, monetisation, retention.
- **Google Ads integration.** Deeper links, including the ability to measure conversions from YouTube engaged views, which matters to anyone running video.

## What's actually different day to day

The changes that'll affect most ecommerce teams are less about the headlines and more about the plumbing.

**Everything is an event.** No more category, action and label. Events have names and parameters, and the setup decisions you make now will shape your reporting for years. Google has published a list of recommended event names for ecommerce, and I'd stick to them rather than inventing your own.

**Goals are now conversions.** You mark an event as a conversion. It's simpler in some ways, but there's no direct equivalent of destination goals, so some old goals will need rebuilding as events.

**Views are gone.** There are no reporting views, so the filtered views most of us used for internal traffic or test data don't exist. Some of that can be done with data filters, but it's not the same.

**Reports are thinner.** The standard reports are a lot less detailed than Universal Analytics. The Analysis section is powerful, but it assumes people are willing to build their own explorations. Many teams aren't, at least not yet.

**Ecommerce is still catching up.** Ecommerce tracking works, but the reporting doesn't match what Enhanced Ecommerce gives you in Universal Analytics. Product performance, checkout funnels and promotion reporting all take more work.

## What I'd do now

1. **Create a GA4 property if you haven't.** The setup assistant can link it to your existing Universal Analytics property and reuse your site tag in some setups. For most ecommerce sites, Google Tag Manager will be cleaner.
2. **Track purchases properly from day one.** Use the recommended ecommerce events and parameters. If transaction data is wrong in the first year, you can't fix it later.
3. **Plan the event model.** Write down which events you'll collect, what you'll call them and which parameters they'll carry. A short document now will save a lot of tidying up later.
4. **Keep Universal Analytics as your main source of truth.** There's no announced end date for it. Your reporting, dashboards and targets should stay where they are for now.
5. **Compare the two regularly.** The numbers won't match exactly, since the models count things differently. But you should understand why they differ.

## The question everyone is asking

The question I've been asked most is whether Google will turn off Universal Analytics. Google hasn't said so, and I'd expect plenty of notice when it does. But I can't see Google running two versions this different side by side for long. My guess is that new features will go to GA4, Universal Analytics will slowly stop improving, and eventually there'll be a deadline.

That's the strongest reason to start now. If a deadline does come, having a year or two of GA4 data to compare against will make it a lot less painful.

## For smaller teams

If you're a small brand with one person looking after the website, all of this can feel like a lot. The minimum I'd suggest is fairly modest: add GA4 alongside your current tracking, make sure purchases are recorded, and look at it once a month so it doesn't feel foreign. You don't need to understand predictive audiences this year.
