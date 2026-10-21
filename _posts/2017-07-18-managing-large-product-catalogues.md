---
author: Sean
comments: true
date: 2017-07-18 09:00:00+00:00
layout: post
slug: managing-large-product-catalogues
hidden: true
robots: noindex
title: "Living With a Big Catalogue: Notes on Thousands of SKUs"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: What changes when a shop has thousands of products in hundreds of variants. Attributes, navigation, search, duplicate pages and stock churn.
categories:
- Digital Marketing
tags:
- Ecommerce
- SEO
- Merchandising
---

Going from selling watches to selling bikes and cycling kit has been a bigger change than I expected, and most of it comes down to one thing: the size of the catalogue. A pre-owned watch is close to a one-off. A cycle retailer carries thousands of products, many of them in a dozen sizes and colours, from hundreds of brands, with stock that changes every day and a new model year arriving every autumn.

Almost every problem on a site like that is a catalogue problem underneath. These are the ones I've spent the last couple of months thinking about.

## Attributes come first

On a small site you can get away with good product descriptions and a sensible category tree. On a big one, everything useful depends on structured attributes: frame size, wheel size, material, gearing, brake type, colour, gender, intended use. Filters, search, Google Shopping, comparison tables and internal linking all feed off them.

The trouble is that attributes decay. Different people add products in different ways over years. One supplier says "Carbon", another says "Carbon Fibre", a third says "CF", and now your filter has three options that mean the same thing. Frame sizes come as S/M/L from one brand, in centimetres from another and in inches from a third.

There's no clever fix for this. Someone has to own the attribute set, agree the allowed values and clean up the data, and keep doing it as new stock arrives. It's dull work. It also fixes problems in the filters, the search and the Shopping feed at the same time.

## Navigation

The temptation is to organise categories the way the business buys: by supplier, by product type, by whatever the stock system calls things. Customers don't think that way. Someone shopping for a commuter bike doesn't care which buying department it sits in; they care about price, whether it takes mudguards and a rack, and whether it's going to cope with their route.

So I've been looking hard at which filters people actually use, and which category pages they land on from search, and trying to build the navigation around that rather than around the internal structure. Your site search logs are one of the best free sources of this. If lots of people search for something you don't have a category for, that's a gap.

## Filters and crawling

Faceted navigation is great for people and can be terrible for search engines. Every combination of filters can produce a new URL: road bikes, under £1,000, size 54, in red, sorted by price. Multiply that across a big catalogue and you've got hundreds of thousands of near-identical pages for Google to crawl, most of them worthless.

My rough approach:

- Decide which filtered pages are worth ranking in their own right. "Women's road bikes" probably is. "Road bikes in blue sorted by newest" probably isn't.
- Let the worthwhile ones have clean URLs, proper titles and their own content.
- Keep the rest out of the index with canonical tags, and stop crawlers wasting time on the endless combinations with sensible parameter handling.

None of this is new. The difference at this size is the sheer number of URLs involved.

## Variants and duplicate content

The same bike in five sizes and three colours shouldn't be fifteen separate pages competing with each other. Configurable products with one page and selectable options are usually right. Where variants really are different enough to be searched for separately, give them genuinely different content, not the same description with one word changed.

Manufacturer descriptions are the other duplicate content trap. Every retailer selling a given model gets the same copy from the brand. Rewriting thousands of descriptions isn't realistic, so I'd rather prioritise: write proper copy for the products and categories that matter most, and add value elsewhere through specs, sizing help and reviews.

## Stock churn

Products sell out, get discontinued, come back in a new model year with a slightly different name. Each of those is a decision about a URL. Leave dead pages live with an "out of stock" message forever and the site fills with clutter. Delete them all and you throw away links and rankings. I wrote a [sitemap specification for a site with heavy inventory churn]({% post_url 2017-05-28-large-ecommerce-sitemap-specification %}) a couple of months ago, which covers part of this.

What I'd do with discontinued products: if there's a direct replacement, redirect to it. If there isn't, redirect to the closest category. If the page still gets search traffic because people are researching the old model, consider keeping it live with clear links to what's available now.

## Where this leaves me

Most of this is less about marketing than about data quality and process, which is not the most exciting part of the job. But on a catalogue this size, I'm increasingly convinced it decides more about how well the site performs than anything we do on the marketing side. I'll write more as it goes.
