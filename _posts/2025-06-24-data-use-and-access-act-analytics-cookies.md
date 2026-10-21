---
author: Sean
comments: true
date: 2025-06-24 09:00:00+01:00
layout: post
slug: data-use-and-access-act-analytics-cookies
hidden: true
robots: noindex
title: "The Data (Use and Access) Act and Analytics Cookies: Don't Switch Your Banner Off Yet"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: The Data (Use and Access) Act 2025 adds a consent exemption for some analytics cookies. What it covers, what it probably doesn't, and why to wait.
categories:
- Digital Marketing
tags:
- Privacy
- Analytics
- Cookies
---

The <a href="https://www.legislation.gov.uk/ukpga/2025/18/contents" target="_blank" rel="noopener">Data (Use and Access) Act 2025</a> received Royal Assent last Thursday, 19 June. Most of it has nothing to do with marketing. One part does, and I've already seen it summarised as "you don't need consent for analytics cookies any more".

That's not quite what it says, and nothing changes today anyway. So here's my read of it, as a marketer and not a lawyer.

## What the Act changes

The Act amends PECR, the regulations that sit behind every cookie banner in the UK. At the moment, apart from a narrow exemption for transmitting communications, the only cookies you can set without consent are those that are strictly necessary for a service the user has asked for. Analytics has never counted as strictly necessary, which is why your analytics only runs after someone clicks accept.

The new exceptions widen that. The one marketers care about covers storage or access used solely to collect statistical information about how your site or service is used, with a view to improving it. There are similar exceptions for things like remembering a user's preferences or how the site displays for them.

The conditions matter more than the headline. As I read it:

- The purpose has to be statistics for improving the service. Not advertising, not building profiles, not sharing data for someone else's purposes.
- Users have to get clear information about it.
- Users have to be given a simple, free way to object.

So it's an opt-out regime for a narrow kind of analytics, not a blanket exemption.

## The question everyone is asking

Does GA4 qualify?

I don't know, and I'd be wary of anyone who says they do with certainty this week. GA4 out of the box is a third-party service from a company that also runs the world's biggest ad business. If you've linked it to Google Ads, turned on Google Signals or used it to build remarketing audiences, it's very hard to argue the purpose is solely statistics for improving your site. A stripped-down setup with advertising features switched off is a more arguable case. The ICO will have to say where the line is.

A simple first-party or privacy-focused analytics tool, used only to understand how the site performs, looks much closer to what the exception was written for.

## Why I'd wait

Three reasons.

**It isn't in force yet.** Royal Assent isn't the same as commencement. Much of the Act switches on in stages through regulations over the coming months, and the cookie changes will need ICO guidance before anyone can apply them with confidence.

**Your audience isn't only in the UK.** EU visitors are still under the EU rules, which haven't changed. A banner that behaves differently by country is possible, but it's more work than flipping a setting.

**The penalties go up.** The Act also brings PECR fines into line with UK GDPR, so the ceiling is far higher than the old £500,000. Getting this wrong becomes more expensive just as the rules get looser.

## What I'd do in the meantime

- **Audit what your "analytics" category actually contains.** On most sites I've looked at over the years, it's a mix of genuine measurement and things that are really advertising wearing analytics clothing. Separate them now, whatever happens with the law.
- **Check which advertising features are switched on in GA4.** If you don't use Signals or remarketing audiences, turning them off costs you nothing and puts you in a better position.
- **Think about a first-party analytics layer** for basic site performance, kept separate from your advertising stack.
- **Watch for the ICO guidance** and the commencement regulations. That's the point to change your banner, not now.

Done well, this could mean better data for a lot of UK sites, because analytics consent rates have made a lot of reporting less reliable than people admit. That depends on separating analytics from advertising first, which is the audit above.
