---
author: Sean
comments: true
date: 2024-07-25 08:30:00+01:00
layout: post
slug: chrome-keeps-third-party-cookies
hidden: true
robots: noindex
title: "Chrome Isn't Killing Third-Party Cookies After All. Now What?"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Google has dropped its plan to remove third-party cookies from Chrome in favour of a user choice prompt. Why the first-party data work still matters.
categories:
- Digital Marketing
tags:
- Privacy
- Cookies
- First-Party Data
---

On Monday Google announced that it no longer plans to remove third-party cookies from Chrome. Instead, Chrome will introduce what Google describes as a new experience that lets people make an informed choice about tracking across their web browsing, and change it whenever they like. The details aren't out yet. Google says it's discussing the approach with regulators.

After four and a half years of deadlines, delays and more delays, the deadline has gone. I'll admit my first reaction was a laugh.

## How we got here

The original announcement was in January 2020, with a two-year timeline. That became 2023, then 2024. In January this year Chrome [switched cookies off for 1% of users](/chrome-cookie-one-percent-test-20240116/), with the rest due in the second half of the year. Then in April, Google pushed it into 2025, citing the need to work through feedback from the Competition and Markets Authority and the ICO. The industry testing of the Privacy Sandbox replacements had been underwhelming, and the CMA's quarterly reports kept listing concerns.

So this isn't a total surprise. It was clear the deadline was going to slip again. What I didn't expect was for Google to stop calling it a deadline at all.

## What a "choice" probably means in practice

Nobody knows the design yet, and most of the impact depends on it. If it ends up as a prompt with two equally weighted buttons, I'd expect a large share of people to switch tracking off, much as they did with Apple's App Tracking Transparency prompt on iPhones. If it's buried in settings with tracking on by default, very little changes for most users.

Google also said it will keep offering the Privacy Sandbox APIs, and is adding IP Protection to Chrome's Incognito mode. So the replacement technology stays, but the main reason anyone had to adopt it in a hurry has gone.

## Why I wouldn't stop the work

I've seen the reaction on LinkedIn this week. A fair amount of "told you so", and quite a lot of relief from people who'd been putting off the work. I understand the relief. I don't think it's justified, and the reasons haven't changed since I [wrote about the 2021 delay](/third-party-cookie-delay-extra-time-20210706/).

**Third-party cookies were already failing.** Safari and Firefox block them by default and have done for years. On a lot of UK ecommerce sites, Safari accounts for a big share of mobile traffic. That signal loss is real and permanent whatever Chrome does.

**Consent is a bigger factor than Chrome.** In the UK and Europe, a proper consent banner means a slice of visitors is never tracked by third parties in the first place. Google's own Consent Mode v2 requirement earlier this year made that more visible to advertisers, not less.

**A user choice prompt could be worse than a phase-out.** A clean phase-out would have hit everyone equally and the ad platforms would have adjusted their modelling once. A choice prompt creates a moving, partial gap that changes as people change their minds, which is harder to plan around.

**First-party data is better data anyway.** Server-side conversion tracking, enhanced conversions, email lists, logged-in customers, purchase history. I'd want all of that even if cookies were going to last forever, because it's more accurate and it doesn't depend on anyone else's browser policy.

## What I'd actually do this month

Not much differently from last month, honestly. If you've already got enhanced conversions, the Meta Conversions API and a working consent setup, keep going. If you'd paused that work waiting to see what Chrome did, restart it. Safari and consent banners are still costing you the same signal they were last week.

The one thing I'd stop is spending time on Privacy Sandbox testing unless you're in ad tech. For an advertiser or a retailer, it was never clear what those APIs would give you, and now there's no deadline forcing the question.

I'll write again once Google shows what the choice prompt looks like. That's the detail that decides how much this matters.
