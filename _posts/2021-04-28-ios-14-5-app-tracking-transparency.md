---
author: Sean
comments: true
date: 2021-04-28 21:10:00+00:00
layout: post
slug: ios-14-5-app-tracking-transparency
hidden: true
robots: noindex
title: "iOS 14.5 Is Here: App Tracking Transparency and Facebook Ads"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Apple released iOS 14.5 this week with App Tracking Transparency. What it means for Facebook ads, attribution, and what ecommerce marketers should do now.
categories:
- Digital Marketing
tags:
- Privacy
- Facebook Ads
- Attribution
- Ecommerce
---

Apple released iOS 14.5 on Monday. The headline feature for anyone who buys social advertising is App Tracking Transparency, the prompt that asks iPhone users whether an app can track them across other companies' apps and websites. We've known it was coming since last June, and Facebook has spent months warning about it, including full-page newspaper ads in December. Now it's actually on phones.

I've read a lot of hot takes this week. Here's what I think is actually going on, and what I'm doing about it.

## What changes

Apps now have to ask permission before using the IDFA, the device identifier that ad platforms use to connect someone's activity in one app with what they do elsewhere. Most people, faced with a plain prompt asking whether they'd like to be tracked, will say no. Nobody knows the opt-in rate yet, but I'd be surprised if it's high.

For an ecommerce brand advertising on Facebook and Instagram, the practical effect is that a growing share of iPhone users will become harder to follow from ad to purchase. People will still see the ads and still buy, but the platform loses sight of the connection between the two.

Facebook's response is Aggregated Event Measurement, and it comes with some housekeeping:

- **Verify your domain** in Business Manager if you haven't already.
- **You're limited to eight conversion events per domain**, ranked in priority order. If someone does several of them, only the highest-priority one is reported for opted-out iOS users. For most shops, Purchase goes at the top and you work down from there.
- **Attribution windows have shrunk.** The 28-day click window has gone for new reporting; 7-day click is the default. If you were used to looking at 28-day numbers, expect reported conversions to fall even if nothing about real performance changed.
- **Reporting will be delayed** for some events and partly modelled rather than observed.

## The uncomfortable bit

The reported numbers in Ads Manager are going to look worse, and in some cases they'll look worse than reality. That's a problem inside a business, because the person signing off the budget sees a lower return on ad spend and asks reasonable questions.

The danger runs both ways. Cut spend because the dashboard says it stopped working and you might be cutting something that was doing its job. Keep spending because "it's just a measurement issue" and you might be funding something that really has got worse, because targeting and optimisation also lose signal when the data thins out.

I don't think anyone can tell the difference with confidence from inside the Facebook dashboard alone, which is rather the point.

## What I'm doing

- **Setting up the Conversions API alongside the pixel.** Sending events server-side doesn't magically restore tracking for opted-out users, and nobody should claim it does, but it makes the data you're entitled to more reliable and less vulnerable to browser blocking.
- **Looking at the whole picture, not the platform.** Total revenue against total marketing spend, week on week, alongside what each channel claims. When Facebook's reported numbers drop and overall sales don't, that tells you something.
- **Asking customers.** A simple "where did you first hear about us?" question at checkout or after purchase. It's imperfect and self-reported, and it's also not affected by anyone's operating system.
- **Planning a holdout test.** Turning spend off in a way you can measure is the most honest way to find out what it's worth. It's also the hardest thing to get agreed, because it means deliberately leaving money on the table for a few weeks.
- **Taking email and owned channels more seriously.** Customers who've given you their email address are customers you can reach without asking Apple's or Facebook's permission.

## Where I land

I'm broadly on Apple's side on the principle. People should be asked, and most of them didn't know how much of this was going on. That doesn't make it any less painful for small brands who built their growth on cheap, precisely targeted Facebook ads, and I don't think Apple's motives are entirely pure either, given its own advertising business.

Chrome's plans for third-party cookies are next on the list, and most of what I've listed above applies there too.
