---
author: Sean
comments: true
date: 2025-05-27 09:00:00+01:00
layout: post
slug: ai-overviews-clicks-search-console
hidden: true
robots: noindex
title: "Measuring AI Overview Click Loss in Search Console"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Ahrefs puts the click loss from AI Overviews at 34.5% and AI Mode is now live across the US. How to measure what is happening to your own search traffic.
categories:
- Digital Marketing
tags:
- SEO
- AI
- Analytics
---

Two things landed in the last few weeks that, put together, make it hard to keep treating AI in search as a future problem.

In April, <a href="https://ahrefs.com/blog/ai-overviews-reduce-clicks/" target="_blank" rel="noopener">Ahrefs published a study</a> of 300,000 keywords. Where an AI Overview appeared, the click-through rate for the top-ranking page was 34.5% lower than for comparable informational keywords without one. Then last week at Google I/O, Google announced that AI Mode, which was a Labs experiment for paying subscribers back in March, is rolling out to everyone in the US.

Google's position is that AI features send "higher quality" clicks and that overall clicks from Search are healthy. I can't check Google's numbers. I can check my own, and you can check yours, which is the more useful exercise.

## The pattern to look for

The signature of AI Overviews in Search Console is fairly distinctive once you know it. Impressions hold steady or go up. Average position holds steady or improves. Clicks fall. CTR falls with them.

That combination is easy to misread. A lot of people see falling clicks and assume a ranking problem, then go hunting for a penalty or a technical fault that isn't there. If your position for a query hasn't moved and you're getting fewer clicks for it, the most likely explanation is that something on the results page is answering the question before anyone reaches you.

## How I'd measure it

Search Console doesn't tell you which queries triggered an AI Overview. So you have to infer it. This is the rough method I'd use:

1. **Export query-level data** for two comparable periods, ideally year on year to strip out seasonality. Use the API or Looker Studio if you have more than the 1,000-row export limit.
2. **Split queries by intent.** Informational queries (how, what, why, best way to, difference between) in one bucket; branded and transactional in another. Regex on the query text gets you most of the way.
3. **Compare CTR at a fixed position.** For queries where your average position is roughly unchanged, look at the change in CTR. If informational queries have dropped sharply and transactional ones haven't, that's the AI Overview pattern.
4. **Spot-check by hand.** Pick twenty of the worst-hit informational queries and search them yourself. Note whether an AI Overview shows, and whether you're cited in it. It's tedious and it's the only way to be sure.
5. **Follow it to revenue.** Map the affected pages to conversions in your analytics. A big drop in traffic to a glossary page might not matter at all. A drop to a buying guide that feeds product pages does.

That last step is the one that decides how worried to be. In my experience a lot of informational traffic was never doing much commercially; it inflated the sessions graph and made reports look healthy. Losing some of it hurts the vanity metrics more than the business. Not always, though, and the mapping is the only way to find out.

## Things that probably help

I'd be careful with anyone who says they have this solved. Nobody has much data yet. A few things seem sensible:

- **Answer clearly and early on the page**, so that if you are pulled into an overview, it's your wording and your link.
- **Put more effort into content that can't be summarised in three lines.** Original data, tools, comparisons based on actual testing, opinions people want to read in full.
- **Build demand that doesn't start with a generic query.** Brand searches, email, direct. Overviews rarely sit on top of someone searching for you by name.
- **Don't strip out the informational content in a panic.** It still supports the commercial pages and still gets cited. It just might not deliver the clicks it used to.

## The reporting conversation

The hardest part of this may be internal. If organic sessions are down 15% year on year and rankings are flat, someone is going to ask what went wrong. It's worth getting ahead of that with the analysis above, so you can show the split between traffic that has moved onto Google's page and traffic that's actually at risk.

If I were changing one thing this quarter, it would be the headline metric. Move reports towards clicks and revenue from the queries that matter, and keep total sessions as a secondary line, before the year-on-year comparisons get any worse.
