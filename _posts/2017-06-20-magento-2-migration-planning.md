---
author: Sean
comments: true
date: 2017-06-20 09:00:00+00:00
layout: post
slug: magento-2-migration-planning
hidden: true
robots: noindex
title: "Magento 2: Should You Move Yet, and What to Work Out First"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Magento 1 support has been extended, so there's no deadline forcing the move. What a retailer should work out before committing to Magento 2.
categories:
- Digital Marketing
tags:
- Ecommerce
- Magento
- Replatforming
---

If you run a shop on Magento 1, you've probably had at least one agency tell you that you need to be on Magento 2, ideally starting next month. I've had this conversation a lot over the last few weeks, since starting at a cycle retailer, and I've come to the view that the honest answer for most retailers is "yes, eventually, but not in a panic".

## There isn't a cliff edge right now

For a while the received wisdom was that Magento 1 support would end in November 2018, three years after Magento 2 went generally available. At the end of May, Magento said it will continue to support Magento 1 for the foreseeable future, and that it will give at least 18 months' notice before changing that. So the deadline a lot of migration pitches were built on has gone, at least for now.

That doesn't mean Magento 1 has a long future. All the new development, the new extensions and most of the agency talent are heading to Magento 2. A platform the vendor maintains but doesn't really invest in gets slowly more expensive to live on. But it does mean you can plan this properly instead of rushing it.

## Why it isn't an upgrade

The word "upgrade" causes a lot of the damage here. Magento 2 is closer to a new platform that happens to share a name and some concepts with the old one. The architecture is different, the theme system is different, and extensions written for Magento 1 don't work on it. Your data comes across with the official <a href="https://github.com/magento/data-migration-tool" target="_blank" rel="noopener">Data Migration Tool</a>, which handles products, customers, orders and configuration reasonably well. Almost everything else gets rebuilt.

Because the effort is in the same ballpark as any replatform, I think the useful comparison is Magento 2 against every other platform you could move to. For some retailers that comparison will land on Magento 2. For smaller shops it might well land on Shopify Plus or something else entirely.

## What to work out before you commit

**An honest extension audit.** List every extension on the current site. For each one: is it still used, does a Magento 2 version exist, and is the core platform now doing the job itself? Most mature Magento 1 sites have a long tail of modules that were installed for a campaign three years ago and never removed. This list alone will tell you a lot about the size of the job.

**Customisations and integrations.** The ERP or stock system, the warehouse, the feed to Google Shopping and the marketplaces, the payment provider, the email platform. Every one of these joins has to be rebuilt and tested. In my experience it's usually the integrations that make these projects overrun.

**Technical debt you don't want to carry over.** Treat the migration as a chance to drop things. Attributes nobody uses, product types that only exist because of an old workaround, category trees that grew without a plan. If you move all of that across faithfully, you pay to rebuild it.

**SEO and tracking.** A new platform means a new URL structure unless you work hard to keep the old one, a new set of templates, and new tracking. I wrote about [protecting your organic traffic through a relaunch]({% post_url 2017-03-14-launching-new-ecommerce-platform %}) earlier this year, and all of it applies here: map every URL, crawl before and after, rebuild the tracking and then check it again.

**Hosting.** Magento 2 is heavier than Magento 1 and wants proper hosting with full-page caching and Varnish set up properly. If your current hosting only just copes with Magento 1, budget for that change too.

**Timing.** Don't launch anything in the run-up to your peak season. For a lot of retailers that's Black Friday and Christmas. For a cycle retailer, it's spring and early summer, which shifts the safe window to the autumn and winter. Work backwards from that.

## The questions I'd ask an agency

- How many Magento 2 builds have you actually launched, and can I talk to one of those clients?
- Which of our extensions are you planning to replace, and with what?
- Who is doing the data migration, and how many test runs are in the plan?
- What happens to our URLs?

If an agency is vague on any of those, I'd keep looking.

## Where I've got to

I don't think waiting forever is wise. The longer a business stays on a platform that everyone is moving away from, the harder it gets to find people to work on it and the more each small change costs. But I'd rather spend a few months understanding exactly what we have, what we'd throw away and what the move should achieve, than start a rebuild because the clock appeared to be ticking. That's the bit I'm working through now.
