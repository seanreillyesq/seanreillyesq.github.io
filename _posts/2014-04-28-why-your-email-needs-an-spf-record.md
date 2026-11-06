---
author: Sean
comments: true
date: 2014-04-28 09:00:00+00:00
layout: post
title: "Why your email needs an SPF record"
header-img: "img/post-bg-04.jpg"
meta-description: "SPF lets you tell mailbox providers which servers may send email as your domain. Here is why it matters, and how to publish a record that works."
categories:
- Blog
tags:
- Email
- Deliverability
hidden: true
robots: noindex
---

For something that has been around for a decade, SPF gets skipped by a lot of businesses that send real email every day. A good chunk of my work is working out why a client's perfectly ordinary newsletter has dropped into the junk folder, and the trail usually starts here.

So, before anything clever, the basics.

## Anyone can put your name on the envelope

Email was built in a more trusting age. The "From" address on a message is just text, and nothing in the original design checks that the server sending a message is actually allowed to send for the domain in that From line. I could set up a server this afternoon and send mail claiming to come from your company's domain, and the plumbing of email would carry it without complaint.

That is the gap spammers and phishers have used for years. It is also why the big mailbox providers have grown twitchy about anything they can't verify, and why your genuine mail gets caught in the same net as the forgeries.

## What an SPF record is

Sender Policy Framework is a list, published in your DNS, of the servers allowed to send email for your domain. A receiving server looks up that list, checks whether the message in front of it came from one of those servers, and uses the answer as one signal in deciding where to put it.

It is a single line of text (a TXT record) on your domain. Here is a realistic one for a company running its mail through Google Apps and sending campaigns through MailChimp:

```text
v=spf1 include:_spf.google.com include:servers.mcsv.net ~all
```

Reading left to right:

- `v=spf1` says this is an SPF record.
- each `include:` pulls in the servers belonging to a service you use, so you don't have to list individual IP addresses that the provider might change next month.
- `~all` is the important bit at the end. It says "anything not listed above is probably not us".

## The bit at the end that people get wrong

That final term is the policy, and it is where I see most mistakes.

- `~all` is a soft fail: mail from an unlisted server is marked suspicious but usually still delivered.
- `-all` is a hard fail: unlisted mail should be rejected outright.
- `+all` means "anyone can send as us", which is the same as having no record at all. I have genuinely seen this in the wild. Don't.

Start with `~all`. Once you are certain every legitimate sending source is in the record, you can tighten to `-all`. Jumping straight to a hard fail before you have found every system that sends on your behalf, the invoicing tool, the CRM, the contact form on the website, is how you make your own mail vanish. The one that catches people out most often, in my experience, is invoicing. The accounts system sends from the company domain but through a different provider, it never makes it into the SPF record, and nobody notices until someone rings up asking where their invoice has got to.

## Two things that will bite you

**The ten-lookup limit.** An SPF record is only allowed to trigger ten DNS lookups when it is evaluated. Every `include:` counts, and some providers' includes contain further includes of their own. Stack up enough services and you quietly blow the limit, at which point the whole record is treated as broken rather than strict. If you lean on a lot of third-party senders, this is the trap.

**Forwarding breaks it.** This is the honest limitation of SPF, and worth understanding before you rely on it too heavily. When someone forwards your email, the forwarding server is not in your SPF record, so the forwarded copy fails the check. SPF verifies the sending server, not the message, so it has no way of knowing the content started life as a legitimate mail from you.

That second problem is exactly why SPF is not the end of the story. There is a companion standard, DKIM, that signs the message itself rather than checking the server, and it survives being forwarded. I will come back to it in another post, because it earns its own.

## Worth doing this month

SPF has been usable for years, but this month it finally graduated from an experimental specification to a proper standards-track document, <a href="https://datatracker.ietf.org/doc/html/rfc7208" target="_blank">RFC 7208</a>. That changes nothing overnight. What it signals is that the thing is settled, the providers are building around it, and "we'll sort email authentication later" is getting harder to justify with a straight face.

If you do nothing else after reading this:

1. Check whether you already have an SPF record. <a href="https://mxtoolbox.com/spf.aspx" target="_blank">MXToolbox</a> will tell you in a few seconds.
2. If you don't, list every service that sends email as you, build the record, and publish it with `~all`.
3. Leave the hard fail until you are sure that list is complete.

It is about fifteen minutes of DNS editing that saves you from a class of deliverability problem that is genuinely miserable to debug after the fact. Hope it helps.
