---
author: Sean
comments: true
date: 2020-07-21 09:00:00+00:00
layout: post
slug: google-analytics-app-web-properties
hidden: true
robots: noindex
title: "Google Analytics App + Web: Should You Set One Up Yet?"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: App + Web properties have been in beta for a year. Why Google is building an event-based analytics model, and why I would run one now.
categories:
- Digital Marketing
tags:
- Analytics
- Google Analytics
- Measurement
---

It's nearly a year since Google launched App + Web properties in beta, and I suspect most ecommerce teams still haven't touched one. I hadn't paid them much attention myself until recently. Having spent some time with one now, I think it's worth setting one up alongside your existing Google Analytics property, even if you don't plan to use it seriously for a while.

## What App + Web actually is

On the surface it's a new type of Google Analytics property that can collect data from a website and a mobile app in one place. Underneath, it's a different way of measuring things.

Universal Analytics, the version most of us have used for years, is built around sessions and pageviews. Everything else, events, goals, ecommerce transactions, hangs off that structure. App + Web is built on the Firebase model that app developers have been using: everything is an event. A page view is an event, a scroll is an event, a purchase is an event, each with parameters attached.

That sounds like a technical detail, but it changes a lot about how reports work and how you set up tracking. Some practical differences I've noticed:

- **Enhanced measurement.** You can switch on automatic tracking of scrolls, outbound clicks, site search, video engagement and file downloads without touching your tag setup. In Universal Analytics, each of those needed its own tag or a developer.
- **Fewer ready-made reports.** The reporting interface is thinner and quite different. A lot of what you'd expect to find is either missing or lives in the Analysis section, where you build your own.
- **BigQuery export.** Raw event data can go to BigQuery without paying for Analytics 360, which has always been the main reason to pay for the premium product.
- **No history.** It starts collecting from the day you set it up. Nothing comes across from your existing property.

## Why I think Google is doing this

I can see a few reasons, none of which Google has spelled out.

Apps are the obvious one. Measuring a user who moves between an app and a website has always been clumsy in Universal Analytics. The event model fixes that.

Privacy is the one I think matters more. The session and pageview model leans heavily on cookies and on tracking an individual browser through a visit. Browsers are blocking more and more of that. Safari now blocks third-party cookies completely, Firefox does a lot of the same by default, and Chrome has said it will follow within two years. An event-based model that can fill gaps with modelled data is better suited to a world where you can't follow every user. Google hasn't said that in so many words.

Then there's machine learning. Google clearly wants Analytics to tell you things rather than show you tables, and that works better with clean event data.

## Why set one up now

The main reason is the history problem. If App + Web does become the main version of Google Analytics, you'll want as much data in it as possible when that happens. Every month you wait is a month you won't be able to compare against later.

It's also a low-risk change. You add a new configuration tag, usually through Google Tag Manager, and it runs alongside your existing tracking without changing anything you rely on. For an ecommerce site I'd add the purchase event early, even if the rest of the tracking is fairly basic, because that's the data you'll miss most.

And it gives you time to learn the thing before you need it. The interface is different enough that I'd rather get used to it while nothing depends on it.

## Why not to rely on it

It's still a beta. Ecommerce reporting is limited compared with Enhanced Ecommerce in Universal Analytics, some features are missing, and Google keeps changing things. I wouldn't move any reporting or decision-making over yet. Google also hasn't said anything about retiring Universal Analytics, so there's no rush beyond collecting the data.

For now my plan is to run both, check the App + Web numbers against the ones we trust every few weeks, and see how the product develops between now and Christmas.
