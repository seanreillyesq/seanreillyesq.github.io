---
author: Sean
comments: true
date: 2021-07-06 18:20:00+00:00
layout: post
slug: third-party-cookie-delay-extra-time
hidden: true
robots: noindex
title: "Chrome's Cookie Deadline Slips to 2023. Don't Waste the Extra Time"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Google has pushed back the end of third-party cookies in Chrome to late 2023. Why the delay happened and what I'd do with the extra eighteen months.
categories:
- Digital Marketing
tags:
- Privacy
- Cookies
- First-Party Data
- Analytics
---

Google announced on 24 June that Chrome won't phase out third-party cookies next year after all. The new plan is a gradual phase-out over three months, starting in mid-2023 and finishing in late 2023. I've watched a fair amount of relief on LinkedIn since, some of it from people who hadn't started preparing and now feel they don't need to for a while.

I'd treat it as more time to do the homework properly.

## Why it slipped

The official line is that the industry needs more time to test and adopt the replacements Google has been building under the Privacy Sandbox banner. FLoC, the interest-cohort idea that went into trial this spring, had a rough reception. Other browsers said they wouldn't support it, and privacy groups argued it created new ways to fingerprint people.

The other part of the story is the regulator. The Competition and Markets Authority opened an investigation into the Privacy Sandbox in January, and in June it consulted on commitments from Google about how the changes would be made. It's not hard to see why removing cookies from the world's most-used browser, while Google's own ad business carries on using its logged-in data, attracts scrutiny. A slower, more supervised timeline is partly a consequence of that.

## What the delay doesn't change

Safari and Firefox already block third-party cookies by default. Apple's App Tracking Transparency, which I [wrote about in April](/ios-14-5-app-tracking-transparency-20210428/), arrived regardless of anything Chrome does. Cookie consent banners mean a portion of visitors in the UK and EU are never tracked in the first place. So a lot of the signal loss is already here, and Chrome is just the biggest remaining piece.

## What I'd do with eighteen months

Here's my list, roughly in priority order for a mid-sized ecommerce business.

1. **Get consent right.** If your banner is designed to trick people into accepting, it's a regulatory risk and it trains your customers to distrust you. A clean, honest consent setup also gives you a clearer picture of who you can and can't measure.
2. **Run GA4 alongside Universal Analytics.** GA4 is built around events and designed with gaps in data in mind. It's not finished and the interface frustrates me, but it needs history to be useful. Every month you delay is a month of comparison data you won't have.
3. **Look at server-side tagging.** Google Tag Manager's server-side option moves some tracking off the browser onto a server you control. It's not a way around consent and shouldn't be used as one. It does give you more control over what's sent to whom, and it makes first-party data collection more dependable.
4. **Build the first-party data you're entitled to.** Accounts, email sign-ups, preferences, purchase history. Give people a real reason to share it: early access, a useful guide, a better service. For luxury brands this is natural ground, because customers already expect a relationship.
5. **Change how you measure.** Lean less on user-level attribution reports and more on things that survive signal loss: total revenue against total spend, geographic or time-based tests, holdouts, and plain asking customers how they found you.
6. **Keep the email list healthy.** Clean it, segment it properly and stop sending to people who haven't opened in two years. It's the channel you own outright.

## The risk

My worry is that teams treat the date as the plan. Teams that started in 2020 because "cookies are going in 2022" will now be tempted to pause until 2023, and in late 2022 they'll be scrambling again.

There's also no guarantee 2023 sticks. Google has moved the date once, and with a regulator involved it could move again. I don't think that changes what to do. The work on consent, first-party data and better measurement pays off whatever Chrome decides, so I'd get on with it now.
