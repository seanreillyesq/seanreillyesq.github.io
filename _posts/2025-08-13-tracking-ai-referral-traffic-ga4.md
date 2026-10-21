---
author: Sean
comments: true
date: 2025-08-13 09:00:00+01:00
layout: post
slug: tracking-ai-referral-traffic-ga4
hidden: true
robots: noindex
title: "Tracking AI Referral Traffic in GA4: A Custom Channel Group and Some Honesty"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: How to separate ChatGPT, Perplexity, Gemini and Copilot visits in GA4 with a custom channel group, and why the number it gives you is a floor.
categories:
- Digital Marketing
tags:
- Analytics
- GA4
- AI
---

Sooner or later someone asks how much traffic you get from AI. It's a fair question, and GA4's default reports are surprisingly bad at answering it.

Visits from ChatGPT, Perplexity, Gemini, Copilot and Claude end up scattered across Referral, Unassigned and Direct, depending on how the link was opened and what was attached to it. ChatGPT has been adding `utm_source=chatgpt.com` to more of its links this summer, which helps, but with no `utm_medium` alongside it, those sessions can drop into Unassigned rather than Referral. So the traffic is there; you just can't see it in one place.

Here's the setup I'd use. It takes about fifteen minutes.

## Build a custom channel group

In GA4, go to Admin, then Data display, then Channel groups, and create a new group. Start from a copy of the default so everything else keeps working.

Add a new channel called something like "AI assistants" with one condition: **Session source matches regex** with a pattern along these lines:

```
.*(chatgpt\.com|chat\.openai\.com|openai\.com|perplexity\.ai|gemini\.google\.com|copilot\.microsoft\.com|claude\.ai|you\.com).*
```

Then the important bit: **drag the new channel above Referral** in the list. GA4 evaluates channels in order and stops at the first match. If Referral sits above it, your AI traffic gets classified as referral before your rule ever sees it.

Custom channel groups also apply retroactively, which is one of the few genuinely nice things about them. You'll see historical data in the new grouping straight away.

Add the new group to your Traffic acquisition report as a comparison, and you've got AI assistants as a line of their own.

A couple of notes on the regex. Keep it maintained; new assistants appear and domains change. And don't include `google.com` in any form beyond the specific Gemini subdomain, or you'll sweep up organic search.

## What this number doesn't tell you

I want to be straight about the limits, because this is where a reported number turns into a misleading one.

**It's a floor.** Anyone who opens a link from a mobile app, copies a URL out of a chat into a new tab, or uses an assistant that strips the referrer, turns up as Direct. There's no way to recover those visits as AI traffic. On some sites, unexplained growth in Direct is probably partly this.

**It doesn't count influence.** Most AI answers never produce a click at all. Pew Research <a href="https://www.pewresearch.org/short-reads/2025/07/22/google-users-are-less-likely-to-click-on-links-when-an-ai-summary-appears-in-the-results/" target="_blank" rel="noopener">published a study last month</a> showing that when a Google AI summary appeared, people clicked on a traditional result in 8% of visits against 15% without one, and clicked a link inside the summary itself in just 1%. That's Google's AI summaries rather than ChatGPT, but I'd expect similar behaviour: people read the answer and often don't click. Someone can read about your brand in a chat, decide to buy, and search for you by name a week later. That shows up as branded organic or direct, not as AI.

**It's small, for now.** On most sites I'd expect this channel to be well under a few percent of sessions. That's useful to know, mostly so nobody overreacts.

## What I'd use it for

Trend, mainly. Whatever the absolute number, you want to know whether it's doubling every quarter or flat.

Landing pages are the next thing I'd look at. Which pages do AI assistants send people to? That's a rough signal of what the models think you're an authority on, and it's often not what you'd expect.

And quality. Compare engagement and conversion rate for AI visitors against organic search. Early reports from various sites suggest these visitors arrive further along in their thinking, though I'd want to see it in your own data before believing it.

If you're also getting the "why aren't we in ChatGPT?" question from senior people, I put together [a checklist for that conversation](/ai-search-seo-what-marketers-should-ask-20250630/) a few weeks ago. The channel group gives you something concrete to bring along with it.
