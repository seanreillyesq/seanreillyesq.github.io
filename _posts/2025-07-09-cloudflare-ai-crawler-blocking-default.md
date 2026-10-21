---
author: Sean
comments: true
date: 2025-07-09 09:00:00+01:00
layout: post
slug: cloudflare-ai-crawler-blocking-default
hidden: true
robots: noindex
title: "Cloudflare Blocks AI Crawlers by Default. Should You Let Them Back In?"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Cloudflare now blocks AI crawlers by default and is testing pay per crawl. Publishers and brands should answer that question in very different ways.
categories:
- Digital Marketing
tags:
- SEO
- AI
- Technical SEO
---

On 1 July Cloudflare changed its default stance on AI crawlers. New domains signing up to Cloudflare now block known AI crawlers by default unless the owner chooses to allow them, and existing customers can turn on the same blocking in a couple of clicks. Alongside it, Cloudflare announced a private beta called pay per crawl, which lets a site charge AI companies for access instead of a flat yes or no. <a href="https://www.technologyreview.com/2025/07/01/1119498/cloudflare-will-now-by-default-block-ai-bots-from-crawling-its-clients-websites/" target="_blank" rel="noopener">MIT Technology Review's write-up</a> is a decent summary.

Given how much of the web sits behind Cloudflare, this is a big shift in who decides what AI models get to read. A lot of major publishers backed it publicly.

My view: for publishers it's a long-overdue bit of bargaining power. For most brands and retailers, I'd think carefully before blocking anything.

## The publisher case

If your business model is people reading your content, the AI deal has been fairly lopsided. Crawlers take the content, models answer questions with it, and the referral traffic coming back is a fraction of what search used to send. Cloudflare's own figures on crawl-to-referral ratios for the big AI companies are striking, even allowing for the fact that Cloudflare has an interest in making them look bad.

For a publisher, blocking by default and negotiating access (or charging per crawl, if that model takes off) is completely rational. I'd be doing the same.

## The brand case

If you sell things, the calculation flips. You generally want AI systems to know who you are, what you sell, what it costs and why someone might choose it. When someone asks an assistant to compare products in your category, you want to be in the answer.

Blocking the crawlers that feed those answers is a bit like blocking Googlebot in 2005 because you didn't like Google making money from your listings. Product and category pages exist to be found.

I wrote recently about [how to handle the "why aren't we in ChatGPT?" question](/ai-search-seo-what-marketers-should-ask-20250630/). If you've switched on Cloudflare's blocking without thinking about it, that question may now have a very simple answer.

## Not all AI bots do the same job

This is where it gets fiddly. The crawlers are not one thing:

- **Training crawlers** collect content to train future models. Blocking them affects what a model "knows" in a year's time.
- **Search and retrieval crawlers** fetch pages live to answer a question now, often with a link back. Blocking these is more likely to remove you from answers today.
- **User-initiated fetches** happen when someone pastes your URL or asks an assistant to look at your page.

The big AI companies mostly publish separate user agents for these jobs. A blunt "block all AI" setting may catch the ones you'd rather keep. Go through what's actually being blocked rather than trusting a single toggle.

## What I'd check this week

1. **Log in to Cloudflare** if your site uses it, and look at the bot settings. Know whether AI crawlers are blocked, and whether that was a decision anyone made.
2. **Check robots.txt as well.** Some sites block GPTBot and friends there, often added a couple of years ago in a moment of panic and never revisited.
3. **Decide by content type.** It's reasonable to allow product and category pages and protect paid or proprietary content. The rules can be that granular.
4. **Write the decision down**, with a date to review it. This area moves quickly and I'd look at it again within six months.

I'll be keeping an eye on pay per crawl. It's in private beta, nobody outside it knows what the prices look like, and it only works if the AI companies agree to pay. Worth checking back on in a few months.
