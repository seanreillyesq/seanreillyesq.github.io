---
author: Sean
comments: true
date: 2025-10-23 09:00:00+01:00
layout: post
slug: privacy-sandbox-retired
hidden: true
robots: noindex
title: "Google Retires Most of Privacy Sandbox"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Google is retiring most Privacy Sandbox technologies, including Topics and Protected Audience. What is left, and what marketers should take from it.
categories:
- Digital Marketing
tags:
- Privacy
- Advertising
- Chrome
---

Last Friday Google published an <a href="https://privacysandbox.google.com/blog/update-on-plans-for-privacy-sandbox-technologies" target="_blank" rel="noopener">update on Privacy Sandbox</a> that most people in ad tech had been expecting since April. Most of the technologies are being retired.

The list is long. Topics, Protected Audience, Attribution Reporting, Private Aggregation, Related Website Sets, IP Protection and several Android equivalents. The reason given is low adoption, after feedback on the value the industry expected from them.

A few pieces survive. CHIPS, which partitions cookies by site, stays. So does FedCM, for federated sign-in, and Private State Tokens. And Google says it will put its measurement effort into an interoperable attribution standard through the usual web standards process, rather than a Chrome-only API.

## How we got here

The original promise is worth remembering, because a lot of marketing budget went on preparing for it. In 2020 Chrome announced it would remove third-party cookies and replace them with a set of privacy-preserving APIs. Topics would handle interest-based advertising. Protected Audience (which started life as FLEDGE) would handle remarketing. Attribution Reporting would handle conversion measurement.

Then the cookie deadline slipped, repeatedly. Last year Google stopped planning to remove cookies at all. In April it dropped the user prompt too, which I [wrote about at the time](/chrome-third-party-cookies-staying-20250428/). Once third-party cookies were clearly here to stay in Chrome, there was very little reason for anyone to do the hard engineering work of adopting the replacements. So they didn't. Low adoption was close to inevitable from that point.

## What it means in practice

For most advertisers, honestly, not much changes this week. If you never touched Topics or Protected Audience directly, and most brands didn't, your campaigns will carry on as before. Your ad platforms and DSPs will deal with any deprecation work.

The more interesting consequences are indirect.

**Third-party cookies in Chrome now look permanent.** Google hasn't promised that, but with no replacement waiting to take over, removing cookies would be very hard to justify to regulators and publishers.

**Safari and Firefox users still aren't tracked that way.** That was true before and remains true. On many sites, particularly those with a lot of iPhone traffic, a meaningful share of the audience was never reachable through third-party cookies anyway.

**Consent hasn't gone anywhere.** In the UK and EU, the legal requirements for advertising cookies are the same as they were last week.

**First-party data still matters most.** The case for server-side tagging, enhanced conversions, logged-in customers and email lists rests on having measurement that doesn't depend on decisions made by a browser vendor. This week is another example of why that matters.

If you do have anything built directly on these APIs, it's worth asking your developers or vendors this week. Retirement won't be instant, but anything relying on Topics or Attribution Reporting needs a plan to come off them, and it's better to find that out now than when a Chrome release quietly removes something.

## The bit that annoys me

I'll admit to some frustration. A lot of teams, agencies and vendors spent five years on this; testing APIs, attending working groups, rebuilding measurement plans, writing briefing papers for nervous senior people. Plenty of that work was useful anyway. Some of it was simply wasted, because the destination kept moving and then disappeared.

The lesson I'd take from it is a fairly modest one. When a platform announces a big change to how tracking works, plan for the direction rather than the specific mechanism. Privacy regulation and browser restrictions outside Chrome kept moving in the same direction throughout, and that's what I'd keep planning around.
