---
author: Sean
comments: true
date: 2016-06-28 09:00:00+00:00
layout: post
slug: mobile-tracking-gaps
hidden: true
robots: noindex
title: "The Mobile Tracking Gaps You Don't Know You Have"
header-img: "img/mobile-tracking-gaps.jpg"
header_overlay: true
meta-description: Broken tracking doesn't announce itself. A look through Google Tag Manager found a chunk of our mobile activity was never being recorded at all.
categories:
- Digital Marketing
tags:
- Analytics
- Mobile
---

We went looking into our mobile tracking a few weeks ago, more out of a nagging feeling than any specific complaint, and came back with an uncomfortable answer: a decent chunk of what happens on mobile wasn't being recorded at all. Nothing had looked wrong, which was the unsettling part; broken tracking doesn't wave a flag. The numbers keep arriving and you keep trusting them, and go on making confident decisions on top of numbers that are less true than you think.

The investigation ran through Google Tag Manager, checking what actually fired against what was supposed to. A few of the things we found, roughly in order of how much they bothered me:

1. Tags not firing before people left. On a slow mobile connection a visitor can arrive, do something, and leave before a tag has loaded and reported it. On desktop this is rare. On mobile it isn't.
2. Events that worked on desktop and silently failed on mobile. A button that fired a tracking event perfectly well on the desktop template did nothing on the mobile one, because the two were built differently and nobody had checked the mobile path.
3. Cross-device journeys landing in the wrong bucket. Someone researches on their phone and buys later on a laptop, and the sale gets credited to the desktop session as though the phone never happened. The mobile effort looks weaker than it actually is.
4. Ad-blocking and privacy settings, more common on mobile than we'd assumed, removing a slice of visitors from the data entirely.

None of these are exotic, and that's rather the point. They're ordinary, they'd been sitting there a while, and we only found them because someone went and looked.

There's no clever fix, because there isn't one clean fault to fix; what changed was my posture. I treat our analytics as approximate now rather than exact, especially anything on mobile, and I'm warier of any decision hung on a single number. And we're putting a proper tracking audit in the calendar every quarter from now on, which is dull, and worth it.
