---
author: Sean
comments: true
date: 2025-04-28 09:00:00+01:00
layout: post
slug: chrome-third-party-cookies-staying
hidden: true
robots: noindex
title: "Chrome Drops the Cookie Prompt: Why I'm Not Changing the Plan"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Google has dropped the planned Chrome cookie choice prompt, so third-party cookies stay. Why I would still not build a marketing plan that depends on them.
categories:
- Digital Marketing
tags:
- Privacy
- Analytics
- Advertising
---

Last Tuesday Google put out what is probably the final chapter of a story that started in January 2020. Anthony Chavez, who runs Privacy Sandbox, <a href="https://privacysandbox.google.com/blog/privacy-sandbox-next-steps" target="_blank" rel="noopener">announced</a> that Chrome "will not be rolling out a new standalone prompt for third-party cookies". People will carry on managing cookies through Chrome's existing privacy settings, as they do today.

Quick recap for anyone who has understandably stopped following. In 2020 Google said Chrome would phase out third-party cookies within two years. The deadline moved to 2023, then 2024, then 2025. Last July Google dropped the deprecation altogether and said it would instead introduce a prompt letting users make an informed choice. Now the prompt is gone as well. Third-party cookies stay, on by default, in the browser most people use.

## How the industry reacted

Relief from a lot of ad tech, mostly. Annoyance from anyone who spent real money preparing for a cookieless Chrome. And a certain weariness from everyone else, which is roughly where I am.

What happens to the Privacy Sandbox APIs isn't clear. Google says they "may have a different role to play" and that it will publish an updated roadmap. That reads to me like an initiative being wound down politely, but I'd wait for the roadmap before writing it off.

There's also a cost to all the switching. Plenty of teams tested Topics or Protected Audience, wrote briefing papers on cookieless measurement, or paid for identity solutions sold on the promise that cookies were going. Some of that will have been useful. Some of it will now sit on a shelf. I don't blame anyone for preparing; the deadline was announced by the company that makes the browser.

## Why I wouldn't change course

It's tempting to read this as permission to stop worrying. I don't think it is, for a few reasons.

**Chrome isn't the whole web.** Safari has blocked third-party cookies by default for years and Firefox does the same. On a lot of consumer sites, particularly anywhere with a heavy iPhone audience, a large share of visitors were already outside the reach of third-party cookies, and this announcement changes nothing for them.

**Consent still applies.** In the UK and EU, a third-party advertising cookie needs consent regardless of what the browser allows. The share of people who reject on a properly built banner is not small. Chrome keeping cookies doesn't bring those people back.

**Incognito is getting stricter.** Google says it will add IP Protection to Incognito mode later this year, on top of the third-party cookie blocking it already does there.

**Google has changed its mind several times.** I wouldn't bet a measurement setup on any of these decisions being permanent.

## What I'd keep doing

The work everyone started in 2020 was the right work anyway. Most of it is just good measurement:

- **Server-side tagging and first-party collection.** More reliable data, fewer things breaking every time a browser changes a rule.
- **Consent Mode, set up properly.** If you use Google Ads and GA4 in the UK, this is how you keep modelled conversions working when people decline. It's fiddly and easy to get subtly wrong, so it's worth an audit if you haven't checked it since it went in.
- **Enhanced conversions and offline imports.** Feeding hashed first-party data back to the ad platforms makes attribution far less dependent on cookies.
- **Owned audiences.** Email, accounts, loyalty. People who have chosen to give you their details.
- **Some measurement that doesn't need user-level tracking at all.** Even a basic geo holdout test or a simple marketing mix model will tell you things that click-path attribution can't.

Very little changes this week. If any part of your measurement depends on third-party cookies, I'd still be working to remove that dependency, for the Safari and consent reasons above.
