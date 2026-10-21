---
author: Sean
comments: true
date: 2024-06-11 09:00:00+00:00
layout: post
title: "The free backlink hiding in a disavow guide"
header-img: "img/free-backlink-hiding-in-a-disavow-guide.jpg"
meta-description: "An SEO guide about removing toxic backlinks is quietly handing out live followed links to its own example domains. Two were going spare, so I took them."
categories:
- SEO
tags:
- Backlinks
- Domains
hidden: true
robots: noindex
---

There's a UK agency guide to Google's disavow tool that I came across a couple of months ago. It's clear, it's sensible, and it's quietly handing out free backlinks to anyone who reads it closely enough. In April I took two of them.

## The worked example

Like most good how-tos, the guide includes a worked example. To show the format of a disavow file, it walks through disavowing three made-up "bad" domains:

> If, for example, you wanted to disavow three backlinks from: www.badlinks.com, www.disavowthislink.com and www.theworstbacklinkever.com

...and then shows the text file you'd upload to Google:

```text
domain:badlinks.com
domain:disavowthislink.com
domain:theworstbacklinkever.com
```

Perfectly reasonable. Here's the problem: in the published article, all three example domains are live links. Not plain text, not `example.com`, but real `<a href>` anchors. And there's no `rel="nofollow"` on any of them. A page about removing toxic links is itself emitting three followed links to three invented domains.

## Two of the three were going spare

Naturally I checked. `badlinks.com` was already registered to someone else. The other two - `disavowthislink.com` and `theworstbacklinkever.com` - belonged to nobody.

So for the price of two domain registrations I now hold a followed link from an established, well-regarded SEO domain. From its own guide about backlinks. I'd like to say there was a grand plan. There wasn't. The idea of harvesting a free backlink out of an article on killing bad backlinks was simply too good to leave sitting there.

## Is it worth anything?

Honestly, probably not much. It's one link, from one deep blog post, with the bare domain as the anchor text. Google has had the best part of two decades to learn that example domains in tutorials aren't editorial endorsements, and a single followed link has never moved a ranking on its own. I didn't do it for the authority. I did it for the joke, and I'll happily report back if Google ever decides a link from a disavow guide counts for something.

## The actual lesson, if you write tutorials

This is the bit worth keeping.

<div class="alert alert-warning">
<strong>Never use live links for example domains.</strong> Every hyperlinked made-up domain in a tutorial is a lapsed-registration lottery ticket for a stranger.
</div>

If you need placeholder domains, the IANA reserves `example.com`, `example.net` and `example.org` for exactly this - they can never be registered by anyone, so you can link them all day (<a href="https://www.rfc-editor.org/rfc/rfc2606" target="_blank" rel="noopener">RFC 2606</a>). If you want something that sounds more realistic, write it as plain text, or at the very least add `rel="nofollow"`.

Otherwise you're one expired-domain alert away from pointing a followed link at whatever a stranger decides to put there - which, depending on who gets there first, might be a competitor, a casino, or a marketing consultant in Kent with a sense of humour.
