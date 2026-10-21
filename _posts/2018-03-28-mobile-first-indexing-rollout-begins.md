---
author: Sean
comments: true
date: 2018-03-28 09:00:00+00:00
layout: post
slug: mobile-first-indexing-rollout-begins
hidden: true
robots: noindex
title: "Mobile-First Indexing Is Rolling Out: A Last-Minute Checklist"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Google has started moving sites to mobile-first indexing. A short checklist of what to check now, and the problems I keep finding on mobile versions.
categories:
- Digital Marketing
tags:
- SEO
- Mobile
- Technical SEO
---

On Monday Google <a href="https://webmasters.googleblog.com/2018/03/rolling-out-mobile-first-indexing.html" target="_blank" rel="noopener">confirmed</a> that mobile-first indexing has started rolling out properly. We've been hearing about this since late 2016, with tests running quietly in the background, so it's hardly a surprise. But it's now real for a growing number of sites, and Google says it will notify site owners in Search Console when theirs has been moved across.

In plain terms: Google will increasingly use the mobile version of your page to decide what it says and how it ranks, rather than the desktop version. For most responsive sites this changes very little. For sites with cut-down mobile versions it could hurt quite a bit.

## Who doesn't need to worry

If your site is responsive, serving the same HTML to every device and just rearranging it with CSS, you're in a good position. The content Google sees on mobile is the same content it sees on desktop. Google has said as much, and it's also why it's moving sites over in batches, starting with the ones it judges to be ready.

If you only have a desktop site with no mobile version at all, Google will carry on indexing what you have. That's not a reason to relax, as your mobile visitors are still getting a poor experience, but the indexing change itself won't break anything.

## Who does

The sites at risk are the ones running a separate mobile site (the m-dot setup) or using dynamic serving, where the mobile version has been trimmed down. I've seen this pattern on a lot of sites over the years. Someone decides mobile users want less, so the mobile version loses half its copy, its internal links and its structured data. That was always a questionable call for users, and now the trimmed version is the one Google reads, so it affects rankings as well.

## The checklist

If you run a separate mobile site or dynamic serving, these are the things I'd check this week:

1. **Content parity.** Compare the main text on key pages, desktop against mobile. Product descriptions, category copy, anything that was cut "to save space" on mobile.
2. **Structured data.** Make sure the same markup is on both versions. It's common to find product or review schema only on desktop templates.
3. **Titles and meta descriptions.** Should match. Mobile templates often have shortened or generic versions.
4. **Internal links.** Mobile navigation tends to be stripped back. If whole sections are only linked from the desktop mega menu, they may lose internal link signals.
5. **Images and alt text.** Check images are crawlable on mobile and carry the same alt attributes.
6. **hreflang.** For m-dot sites, mobile URLs should point to other mobile URLs. Mixing the two is an easy mistake.
7. **Search Console.** Verify the mobile version as its own property if it lives on a separate host, so you actually see the notification and any errors.
8. **Server capacity.** If the m-dot site sits on separate infrastructure, it's about to be crawled much harder by the smartphone Googlebot. Make sure it can take it.

## Hidden content

One bit of better news. Content hidden behind tabs or accordions on mobile was historically treated as less important. Gary Illyes at Google said in late 2016 that in the mobile-first world, content hidden for UX reasons should carry full weight. That was a one-line reply on Twitter rather than formal documentation, so I wouldn't bet a whole category page on it. If it holds, you can keep the mobile page tidy without the collapsed sections being discounted.

I'd still put the most important information where people can see it without tapping, mostly because that's better for the people using the page.

## No need to panic

Google is rolling this out gradually and says it isn't a ranking factor in itself. A site moved to mobile-first indexing doesn't get a boost or a penalty for being moved. What changes is which version of your content is being judged. If the two versions are the same, you'll likely never notice. If they're not, I'd fix it now rather than wait for the notification.

There's also a speed update coming in July, announced back in January, which will make page speed a ranking factor for mobile searches. Between the two, mobile is very clearly where Google's attention is this year.
