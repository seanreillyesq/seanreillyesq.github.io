---
author: Sean
comments: true
date: 2016-02-15 09:00:00+00:00
last_modified_at: 2016-02-15 09:00:00+00:00
layout: post
title: "Why you need DKIM as well as SPF"
header-img: "img/post-bg-05.jpg"
meta-description: "Gmail now flags unauthenticated senders, so SPF on its own no longer cuts it. Here is what DKIM adds, and why it survives forwarding when SPF doesn't."
categories:
- Blog
tags:
- Email
- Deliverability
---

Last week Gmail started showing a little question mark where a sender's photo or logo should be, on any message it can't authenticate. It is warnings-only for now, nothing gets blocked. But providers don't put a question mark next to your email and then forget about it. This won't stay cosmetic for long.

A couple of years ago I wrote about [SPF](/why-your-email-needs-an-spf-record-20140428/), the record that tells the world which servers may send mail for your domain. If you haven't done that yet, start there, because what follows sits on top of it. SPF is necessary. It is just no longer sufficient.

I had this recently with a client whose order confirmation emails kept landing in spam. Their SPF record was fine; it checked out every way I tested it, and the mail still wasn't reaching inboxes reliably. SPF was answering the only question it can answer, honestly, and it wasn't enough on its own. What those emails needed was a DKIM signature.

## The weakness I flagged last time

I said then that SPF has an honest flaw: it breaks the moment a message is forwarded. SPF checks the server that delivered the mail, and a forwarding server isn't in your record, so the forwarded copy fails. SPF is checking the envelope, not the letter inside it.

DKIM fixes exactly that.

## What DKIM does differently

DomainKeys Identified Mail attaches a cryptographic signature to the message when it leaves your sending system. The matching public key lives in your DNS. A receiving server fetches that key, recomputes the signature over the message, and checks that the two agree.

Because the signature covers the content and headers rather than the connection, it travels with the message. Forward it, and the signature still checks out. That is the whole point: DKIM proves the message really came from your domain and hasn't been tampered with on the way, which is a different question from the one SPF answers.

The way I keep the two straight:

- **SPF** asks: was this server allowed to send for the domain?
- **DKIM** asks: was this message actually produced by the domain, and is it unchanged?

You want both answered yes. Gmail's new question mark appears when it can't get a yes from either.

## Setting it up, honestly less fun than SPF

Your sending platform generates a key pair and hands you a DNS record to publish, usually under a name like `selector._domainkey.example.com`. Google Apps, MailChimp and the rest all have a DKIM or "authenticate your domain" setting now; you turn it on, copy the record into DNS, and the platform starts signing.

Two things make it more fiddly than SPF:

- **Every sender signs separately.** With SPF you list all your services in one record. With DKIM, each platform that sends as you needs its own key and its own selector published. More records to keep track of.
- **Long records trip up some DNS panels.** A 2048-bit key (and you should use 2048, not 1024) produces a TXT value long enough that older registrar interfaces mangle it or force you to split it across quoted strings. If DKIM "isn't working" an hour after you set it up, this is the first thing to check.

The thing that bites you later is maintenance. Change email provider, rotate a key, add a new tool, and if the DNS doesn't keep step you start failing silently. Nothing bounces. Your mail just starts sliding into spam while everything looks fine from your side.

## Why this matters now rather than later

The question mark does nothing today. But it tells you where things are going. Authentication used to be something only the careful senders bothered with. Now receivers expect it, and mail that skips it will keep losing ground in the inbox.

There is a third piece that sits on top of SPF and DKIM, called DMARC. It lets you tell receivers what to do when a message fails both checks, and, usefully, it reports back who is sending mail as your domain. It is the natural next step once SPF and DKIM are both in place. Another post, another day.

For now:

1. If SPF isn't done, do that first ([here's how](/why-your-email-needs-an-spf-record-20140428/)).
2. Turn DKIM on in every platform that sends as you, and publish each record.
3. Send yourself a test to a Gmail account, open "Show original", and check you see **SPF: PASS** and **DKIM: PASS**.

Get both passing and the question mark goes away. Hope it helps.
