---
author: Sean
comments: true
date: 2025-01-22 09:00:00+00:00
layout: post
slug: google-search-javascript-rank-tracking
hidden: true
robots: noindex
title: "Google Search Now Requires JavaScript: What It Did to Rank Tracking"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Google now requires JavaScript to show search results. Why that broke some rank trackers last week, and what to check before reading into the data.
categories:
- Digital Marketing
tags:
- SEO
- Rank Tracking
- Technical SEO
---

If your rank tracking looked odd last week, there is a fair chance nothing happened to your rankings at all.

Google has started requiring JavaScript to load search results. Turn it off in your browser and you now get a page asking you to enable it rather than a list of results. A Google spokesperson told <a href="https://techcrunch.com/2025/01/17/google-begins-requiring-javascript-for-google-search/" target="_blank" rel="noopener">TechCrunch</a> it's about protecting the service from bots and spam, and that fewer than 0.1% of searches come from people with JavaScript disabled.

That 0.1% is not who this is aimed at. It's aimed at scrapers, and a lot of the SEO tool industry runs on scraping Google.

## Why the tools wobbled

Rank trackers have mostly worked by firing a query at Google and parsing the HTML that comes back. Cheap, fast, and it worked for years. Once the results only appear after JavaScript runs, a plain HTTP request gets you nothing useful. The tool has to spin up a headless browser, render the page, wait, then parse it. That's slower and a lot more expensive per keyword.

Several well-known tools had delays or gaps in their data around the 15th-16th. Some recovered within a day or two; others were more cagey about what had happened. <a href="https://serpapi.com/blog/google-now-requires-javascript/" target="_blank" rel="noopener">SerpApi wrote up</a> their side of it, which is a useful read if you want to understand the mechanics, bearing in mind they sell exactly this kind of data.

The knock-on effect is the bit I'd worry about. A gap in collection can look like a ranking drop. A partial re-crawl can look like volatility. If your weekly report pulls from a tracker that had a bad few days, you might be about to explain a fall that never happened.

## What I'd check this week

Before anyone writes a "we've lost rankings" email:

1. **Cross-check against Search Console.** Average position and clicks for your main queries over the same days. Search Console comes from Google's own logs, so the JavaScript change doesn't touch it. If GSC is flat and the tracker isn't, it's the tracker.
2. **Look for missing days.** Gaps or flat lines in the tracker's history around mid-January are a collection problem, not a ranking one.
3. **Ask your vendor directly.** A decent provider will tell you whether they were affected and when it was fixed. If they won't, I'd make a note of that.
4. **Annotate it.** Put a note in your reporting for the week so that in six months nobody digs up a dip and starts a post-mortem.

## The longer-term question

What I don't know yet is whether this pushes tool prices up. Rendering every query in a browser costs real money at scale, and estimates I've seen suggest it could be several times the old cost. Somebody pays for that. Either subscriptions go up, or tracking gets less frequent, or vendors track fewer positions deep.

Honestly, I'm not sure that last option is a disaster. Most businesses I've seen track far too many keywords at far too high a frequency and then look at maybe twenty of them. Daily tracking of 5,000 terms is a habit more than a need. If the cost goes up, it might force a more sensible list.

The other thing worth keeping in mind is that Google has never liked being scraped. Their terms have said so for as long as I've been doing this. The tools have operated in a grey area that Google tolerated, and that tolerance can change without notice. I'd treat any third-party ranking data as a useful estimate and Search Console as the record, and I'd be wary of building client or board reporting on numbers that depend on Google continuing to look the other way.

For now I'd check the data and annotate the gap before anyone starts drawing conclusions from it.
