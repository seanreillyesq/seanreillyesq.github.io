---
author: Sean
comments: true
date: 2023-10-09 09:00:00+00:00
layout: post
title: "DMARC by February: Google and Yahoo's new email rules"
header-img: "img/post-bg-06.jpg"
meta-description: "Google and Yahoo will require bulk senders to pass DMARC from February 2024. Here is what the rules say, who they hit, and what to do before the deadline."
categories:
- Blog
tags:
- Email
- Deliverability
hidden: true
robots: noindex
---

For years, advising someone to sort out their email authentication has meant arguing from best practice. "You should, because it helps deliverability, because it's the right thing." Reasonable, and easy to put off. As of last week there is a date on it instead.

On 3 October, Google and Yahoo <a href="https://blog.google/products/gmail/gmail-security-authentication-spam-protection/" target="_blank">jointly announced</a> a set of requirements for anyone sending email to Gmail and Yahoo inboxes, with enforcement starting in February 2024. This is the deadline version of a thing I've written about twice already: [SPF](/why-your-email-needs-an-spf-record-20140428/) back in 2014, and [DKIM](/why-you-need-dkim-as-well-as-spf-20160215/) in 2016. DMARC is the layer that ties those two together, and it has just grown teeth.

## What they actually announced

The headline requirements for bulk senders:

- **SPF and DKIM**, both, on your sending domain. Not one or the other.
- **A DMARC record**, at a minimum of `p=none`.
- **Alignment**: the domain your readers see in the From line has to match the domain that SPF and DKIM verify.
- **One-click unsubscribe** on marketing mail (the `List-Unsubscribe` header), honoured within two days.
- **A spam complaint rate** kept low. Google names a threshold of 0.3%.

"Bulk sender" means roughly 5,000 or more messages a day to Gmail addresses. That is Google's number; Yahoo has not put a figure on it.

## Don't let the 5,000 number talk you out of this

The threshold sounds like it lets small businesses off the hook. In practice I wouldn't lean on that, for three reasons.

It is easier to cross than you think. One decent promotional send to a mid-sized list, or a busy transactional system on a good day, and you are over it. The line is counted on a given day, not averaged.

The enforcement is gradual and easy to miss. Non-compliant mail starts getting temporary errors on a slice of traffic, then more. You don't get a warning letter; your numbers just soften.

And the requirements are exactly what every sender should have anyway. SPF, DKIM and a DMARC record aren't a tax Google invented. They are the baseline for not being trivially impersonated. My honest advice: ignore the threshold and treat all of it as the new normal.

## Where DMARC fits, for anyone landing here first

If this is the post you found and the other two are new to you:

- **[SPF](/why-your-email-needs-an-spf-record-20140428/)** (2014) lists which servers may send as you.
- **[DKIM](/why-you-need-dkim-as-well-as-spf-20160215/)** (2016) signs each message so a receiver can prove it really came from you, unchanged.
- **DMARC** ties both of those to the From address your readers actually see, tells receivers what to do when a message fails (`none`, `quarantine` or `reject`), and sends you reports listing everything sending mail as your domain.

Honestly, the reports alone are worth it, deadline or not. The first time you switch DMARC on in reporting mode for a domain, you almost always find legitimate systems nobody remembered were sending, an old form plugin, a finance tool, a newsletter from three jobs ago, and fairly often, someone spoofing you outright. The first time I switched a client to reporting mode, that is exactly what the reports showed: a steady trickle of mail going out to the world from servers that had nothing to do with them, their domain sitting in the From line. They had no idea it was happening. And why would they; until you turn DMARC reporting on, there is nothing to tell you.

## What to do before February

1. **SPF and DKIM on every sending source.** The two earlier posts walk through both. This is the foundation and nothing else works without it.
2. **Publish a DMARC record at `p=none`.** That switches on reporting without touching delivery:

```text
v=DMARC1; p=none; rua=mailto:dmarc@example.com
```

3. **Read the reports for a few weeks.** Authorise or fix every legitimate sender you find.
4. **Only then tighten** to `p=quarantine`, and later `p=reject`, once the reports are clean.
5. **Add one-click unsubscribe** to marketing sends and keep an eye on your complaint rate.

The mistake to avoid is going straight to `p=reject` to feel safe. It is the same error as slapping a `-all` on an SPF record on day one: you will reject your own mail, from the systems you didn't know about yet. Reporting first, enforcement later. The reporting stage is the slow part and you cannot rush it.

Four months, over Christmas, is less runway than it looks. If you send any real volume of email, this is the quarter to get it done. Hope it helps.
