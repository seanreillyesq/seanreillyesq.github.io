---
author: Sean
comments: true
date: 2017-02-09 09:00:00+00:00
layout: post
slug: google-intrusive-interstitial-penalty
hidden: true
robots: noindex
title: "Google's Interstitial Penalty: A Month In"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Google's intrusive interstitial penalty went live on 10 January. What it covers, what it doesn't, and what ecommerce sites should check on mobile.
categories:
- Digital Marketing
tags:
- SEO
- Mobile
- UX
---

On 10 January Google started demoting mobile pages that cover their content with pop-ups as soon as someone arrives from search. They'd announced it back in August, so nobody can claim it came out of nowhere, but plenty of sites left it until the week before. A month on, I thought it was worth writing down what the change actually covers, because a lot of the advice I've seen is either too relaxed or wildly overcautious.

## What Google said

The original <a href="https://developers.google.com/search/blog/2016/08/helping-users-easily-access-content-on" target="_blank" rel="noopener">announcement on the Webmaster Central blog</a> is short and worth reading in full. The pages that are at risk are ones where, on mobile, the content isn't easily accessible on the click through from search results. Their examples:

- a pop-up covering the main content, immediately or while the user is reading
- a standalone interstitial the user has to dismiss before they get to the content
- a layout where the top of the page looks like an interstitial and the actual content has been pushed down below it

And the things they explicitly said are fine, if used responsibly:

- notices required by law, such as cookie consent or age verification
- login boxes on content that isn't publicly indexable anyway
- banners that take up a reasonable amount of screen space, like the app install banners Safari and Chrome provide

Two details get missed. It's about mobile. And it's about the click through from search: the wording is "on the transition from the mobile search results", so what matters is what someone sees when they land, though a pop-up that appears while they're reading counts too.

## Why ecommerce sites got caught

Newsletter sign-up pop-ups are everywhere in retail. "Get 10% off your first order" covering the whole screen two seconds after you land on a product page is close to the default for a lot of Shopify and Magento themes and email plugins. On a desktop it's annoying. On a phone it's often the whole screen, with a close button the size of a full stop.

So the sites most exposed are exactly the ones that rely on organic product and category traffic from phones. That's a lot of retailers.

## What I'd check

Here's roughly the list I went through when I wrote guidance on this at Watchfinder, adapted to be general:

1. **Load your top landing pages on an actual phone, from a Google result.** Not on the desktop with the window shrunk. What appears in the first few seconds?
2. **List every pop-up and overlay the site can show.** Email capture, live chat, surveys, cookie notices, country selectors, app banners. Marketing tools add these quietly and nobody keeps a list.
3. **Move email capture off first landing on mobile.** Trigger it on the second page view, or on exit intent on desktop only, or replace it with an inline block or a slim banner.
4. **Leave the legal ones alone, but keep them small.** A cookie bar along the bottom is fine. A full-screen consent wall is asking for trouble.
5. **Watch for fake interstitials.** A huge hero banner that pushes the product below the fold on mobile can be read the same way, even if it isn't technically a pop-up.

## How big the effect is

Honestly, I don't know yet, and I'm not sure anyone does. Google described it as one of hundreds of signals and said a page with great relevant content could still rank well. I haven't seen clear evidence of sites falling off a cliff in January, and most of the before-and-after charts doing the rounds have other things going on in them.

That doesn't make it a non-event. It fits a pattern that has been building since the mobile-friendly update in 2015, and more so since Google said in November that it's experimenting with a mobile-first index. Google is telling us, repeatedly, that the mobile version of a page is the version that counts. If the first thing a phone visitor sees is a full-screen ad for your newsletter, I'd expect that to cost you at some point, through this signal or a later one.

The bit that will annoy the email team is that the sign-up rate will probably fall when you tone the pop-up down. That's a real cost and I wouldn't pretend otherwise. My view is that a few fewer sign-ups is a better trade than losing ground on the pages that bring people to the site in the first place, but have that conversation with the sign-up numbers in front of you.
