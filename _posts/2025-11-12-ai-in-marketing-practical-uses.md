---
author: Sean
comments: true
date: 2025-11-12 09:00:00+00:00
layout: post
slug: ai-in-marketing-practical-uses
hidden: true
robots: noindex
title: "AI in Marketing Teams: The Boring Uses Are the Good Ones"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Where generative AI saves a marketing team real time, where it quietly makes things worse, and the data rules I would set before anyone starts.
categories:
- Digital Marketing
tags:
- AI
- Productivity
- Strategy
---

Most of what I read about AI in marketing falls into two camps. One says it will replace the whole department by next spring. The other says it produces generic slop and serious marketers should stay clear. Neither matches what I see when people actually use these tools day to day.

My view, after a couple of years of using ChatGPT, Claude and Gemini for real work, is that the value is mostly in unglamorous tasks. The things nobody puts in a conference talk.

## Where it earns its keep

**Spreadsheet and analytics plumbing.** Regex for a GA4 channel group or a Search Console filter. A Google Sheets formula you half remember. A short Apps Script to pull data from one place to another. A SQL query against BigQuery. These used to mean twenty minutes on forums, or waiting for someone technical to have time. Now they take two minutes and a sanity check. For me this is the single biggest time saving, by some distance.

**Classifying messy data.** Search query reports, product feeds, survey responses, customer service tags. Give a model a list of a few thousand rows and a set of categories, and it will do a decent first pass. Not perfect. Far better than nobody doing it at all, which is often the real alternative.

**First drafts of repetitive copy.** Product descriptions from a spec sheet, meta descriptions, ad variations to test, alt text. Anything where you need a lot of competent text built from structured information. The output still needs a human edit, but editing is quicker than starting from a blank page.

**Summarising and comparing.** A long industry report, a set of competitor pages, a contract's renewal terms, a call transcript. Ask for the five points that matter and where in the document they come from, so you can check.

**Thinking partner for structure.** Before writing a brief or a plan, asking a model to poke holes in it or list what's missing is a useful habit. It's rarely brilliant, but it catches the obvious gaps.

## Where it makes things worse

**Anything that is meant to sound like you.** Brand voice is the first casualty. Models drift towards the same polite, slightly breathless tone, and readers have learned to spot it. If a piece of writing is supposed to carry personality or opinion, AI can help with research and structure, but the words should be yours.

**Facts you don't check.** Models still invent statistics, quotes and sources with total confidence. Every number in AI-assisted content needs tracing back to where it came from. If you can't find the source, the number goes.

**Content at scale for search.** Google's spam policies have covered scaled content abuse since last year, and churning out hundreds of thin AI pages to catch long-tail queries is exactly what that's aimed at. I'd stay well away, whatever the tools promise.

**Decisions.** A model can tell you what a dataset looks like. It shouldn't be deciding the budget split or which campaign gets cut. It doesn't know your margins, your history or the conversation you had with finance last month.

## Rules worth setting before anyone starts

This is the part I'd push hardest on, because it's where the real risk is.

- **No personal data in consumer tools.** Customer lists, email addresses, anything identifying a person. Even with training switched off, you're sending it to a third party, and under UK GDPR that needs a legal basis and probably a data processing agreement. Use the business tiers with proper terms, or run a local model for anything sensitive.
- **No confidential commercial data without approval.** Unpublished results, pricing plans, supplier terms. Same reasoning.
- **A human signs off everything published.** By name, so it's clear who is responsible.
- **Write down what's allowed.** A one-page policy beats an unspoken assumption, and people are already using these tools whether there's a policy or not. Better to know how.

## Where I'd start

If your team hasn't used AI in a structured way yet, pick one repetitive task that everyone dislikes. Product descriptions, monthly report commentary, tagging a feed. Try it for a month, measure the time saved honestly (including the editing), and decide from there whether to try a second one.
