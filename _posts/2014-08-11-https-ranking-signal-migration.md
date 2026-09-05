---
author: Sean
comments: true
date: 2014-08-11 09:00:00+00:00
layout: post
slug: https-ranking-signal-migration
hidden: true
robots: noindex
title: "HTTPS Is Now a Ranking Signal. Don't Panic Yet"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Google has made HTTPS a lightweight ranking signal. What that means, how big it is right now, and how to migrate without breaking things.
categories:
- Digital Marketing
tags:
- SEO
- HTTPS
- Technical SEO
---

Last week Google announced that it is starting to use HTTPS as a ranking signal. Secure your site with proper encryption and you get a small boost. The announcement made the rounds fast, and predictably some of the coverage jumped straight to "move everything to HTTPS this weekend or lose your rankings".

Read what they actually said. Google described it as a lightweight signal affecting a small fraction of queries, weaker for now than things like good content. They were also open that they might strengthen it over time to encourage more sites to switch. So the sensible read is that today the direct ranking effect is tiny, and the real message is about direction of travel.

That does not make it noise. A signal that is small now and openly flagged as something they want to grow is worth getting ahead of, especially for anyone handling logins, forms or payments where encryption is the right thing to do regardless of Google.

The part I would flag hard is that a migration to HTTPS is a proper technical job, not a switch you flip. Done carelessly it can cost you more traffic than the ranking boost was ever going to give you. Things that bite people:

- **Every URL changes** from http to https, so you need permanent 301 redirects from the old versions to the new ones, site wide, with no gaps.
- **Mixed content.** If a secure page still pulls an image, script or stylesheet over plain http, browsers throw warnings and the padlock breaks. Every asset reference has to move across too.
- **Canonical tags, internal links and sitemaps** all need to point at the https versions rather than still referencing the old ones.
- **Webmaster Tools treats https as a separate site.** Add and verify the new version, and resubmit the sitemap, or you go blind on your own data at the worst moment.
- **Get the certificate right.** Match the domain, cover www and non-www as you serve them, and keep an eye on the expiry so it does not lapse and scare everyone off.

My advice for right now is measured. If you handle sensitive data, this is another good reason to move, and you should plan it as a careful migration with the redirects mapped and tested first. If you run a straightforward brochure site, there is no need to drop everything this month over a signal Google itself calls lightweight. Put it on the roadmap, watch whether they turn up the weight as they hinted, and do the move properly when you do it rather than in a rush because of a headline.
