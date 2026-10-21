---
author: Sean
comments: true
date: 2022-10-18 09:00:00+00:00
layout: post
slug: documenting-your-ecommerce-stack
hidden: true
robots: noindex
title: "The Ecommerce Stack Nobody Wrote Down"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Most ecommerce businesses run on systems only one or two people understand. What to document, where to keep it, and why it pays off day to day.
categories:
- Ecommerce
tags:
- Ecommerce
- Documentation
- Operations
---

Every online shop I've looked at has the same weakness, regardless of size. The platform, apps, tags, feeds and integrations that keep it trading are understood properly by one or two people, and most of what they know lives in their heads.

It mostly works, as long as those people are around. Someone goes on holiday the week a payment provider changes its API. An agency relationship ends and nobody knows which account the Merchant Center feed sits under. Orders over a certain value start skipping a fraud check on a Saturday night, and the one person who knows why is on a flight.

Documentation is about the least exciting job in ecommerce, and I'd put it near the top of the list for any head of ecommerce this winter.

## What to write down

I'd split it into five areas.

### 1. Accounts and access

A single list of every system the business depends on, who owns the login, which email address it's registered to, and who pays the bill. Platform, domain registrar, DNS, CDN, payment gateways, email platform, ad accounts, analytics, Search Console, Merchant Center, review platforms, every app and plugin.

The registered email address is the thing that bites. Accounts set up on someone's personal address, or on an agency's, are surprisingly common and painful to recover.

### 2. A map of how data moves

A simple diagram of what talks to what. Where do orders go after checkout? How does stock reach the website? Which system is the source of truth for product data, prices and customer records? Where does the product feed come from, and what transforms it on the way to Google and Meta?

It doesn't need to be pretty. A rough box-and-arrow drawing is fine as long as it's correct.

### 3. Tracking and tags

What's in the tag manager, why it's there, and who asked for it. Every pixel, every conversion tag, every consent setting. With GA4 replacing Universal Analytics next July, this is a good moment anyway; nobody wants to migrate tags they don't understand.

### 4. The odd rules

Every shop has business logic that looks strange from the outside. Free delivery thresholds that differ by country. Products hidden from certain markets. A discount code that must never stack with another. Shipping rules for oversized items. These are the things that break quietly when someone "tidies up" the settings, so write down the reason as well as the rule.

### 5. Regular tasks

What needs doing weekly, monthly and annually to keep the lights on. Certificate renewals, domain renewals, feed checks, price list updates, VAT changes, the seasonal banner swap. The annual ones are the most dangerous because nobody remembers them from one year to the next.

## Where to keep it

Somewhere boring and shared. A wiki, a shared drive folder, Notion, Confluence; it doesn't matter much as long as it's not in one person's email and the right people can edit it. Passwords themselves belong in a password manager, with the documentation pointing to the entry, not containing it.

## The bit people get wrong

They try to write it all in one go, produce a 60-page document, and never update it. I'd rather start with the access list and the data map, which together cover most emergencies, and then add a page whenever someone solves a problem that took more than an hour to figure out.

It's also worth having someone other than the author try to use it. Hand a section to a colleague and ask them to find a particular setting using only the notes. The gaps show up quickly.

## Why do it now

The obvious answer is resilience: holidays, illness, the Saturday night problem. But I think the bigger payoff is day to day. A business that can see its own stack makes better decisions about it. You spot the app you're paying for twice, the tag nobody uses, the integration held together by a spreadsheet someone updates by hand every Monday.
