---
author: Sean
comments: true
date: 2012-11-15 09:00:00+00:00
layout: post
slug: responsive-ecommerce-performance
hidden: true
robots: noindex
title: "Responsive Design for Ecommerce: The Performance Trap"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Responsive has won the design argument, but a responsive shop still ships desktop-weight pages to phones. Making it reflow is not the same as making it fast.
categories:
- Digital Marketing
tags:
- Responsive Design
- Ecommerce
- Mobile
---

I wrote back in the spring about mobile traffic creeping up on people, and the choice between a separate mobile site and a responsive one. Six months on, the responsive camp has clearly won the argument in principle; nearly every new build I see proposed is responsive. What I want to talk about is the bit that gets waved away in that argument, which is performance.

Responsive design does something elegant. One set of HTML, styled to reflow for whatever screen it lands on, from a wide monitor down to a phone. One URL per page, no redirects, no second site to maintain. As a way to build I'm sold on it. The problem is what actually travels down the wire to the phone.

When most teams build responsive, the phone still downloads more or less everything the desktop does; the full-size images, the whole stylesheet, all the scripts, and then the browser hides or shrinks the parts it doesn't need. The desktop hero image that looks glorious on a 27-inch monitor is a several-hundred-kilobyte download the phone never needed, and is now paying for on a 3G connection in a train tunnel. The layout adapts beautifully; the bytes sailing down the wire to the phone barely change at all.

For a content site you can get away with that. For an ecommerce site it costs you orders. Every extra second a product page takes to load on a phone shaves your conversion rate, and mobile connections are slow and patchy in a way we conveniently forget when we're testing on office wifi.

It's solvable, but it takes deliberate work rather than trusting the framework to sort it out:

- Serve appropriately sized images. Don't push a 1200px hero to a 320px screen. The techniques for doing this cleanly are still immature and fiddly in 2012, but even a crude swap beats shipping the lot.
- Watch your total page weight like a hawk, and set a budget for it. If the phone version of a page is over a few hundred kilobytes, something has gone wrong somewhere.
- Test on a real phone on a real mobile connection, not the emulator on your desk. The emulator lies to you about speed, every time.

I still think responsive is the right direction for most retailers, and I'd choose it over a separate m.dot site for nearly everyone. The gap I keep seeing is between a build that reflows correctly and one that's actually quick on a phone; teams tick the first and assume the second came free with it, when it didn't, and a slow product page shows up in the analytics soon enough if you go and look.
