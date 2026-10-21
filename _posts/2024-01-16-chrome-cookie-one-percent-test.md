---
author: Sean
comments: true
date: 2024-01-16 09:30:00+00:00
layout: post
slug: chrome-cookie-one-percent-test
hidden: true
robots: noindex
title: "Chrome Has Switched Off Third-Party Cookies for 1% of Users. Check Your Site"
header-img: "img/post-bg-01.jpg"
header_overlay: true
meta-description: Chrome began blocking third-party cookies for 1% of users on 4 January. A small test, but it's the first real one. How to see what breaks on your site.
categories:
- Digital Marketing
tags:
- Privacy
- Cookies
- Analytics
---

On 4 January Chrome started restricting third-party cookies for 1% of its users. Google calls it Tracking Protection, and people who've been picked get a small prompt explaining that sites can no longer follow them around the web. One percent sounds trivial. On a browser with Chrome's share it's a lot of people, and it's the first time the phase-out has been real rather than a date on a roadmap.

I wrote about the [2021 delay](/third-party-cookie-delay-extra-time-20210706/) and argued that the extra time should be used, not banked. That was two and a half years ago. The date slipped again after that, and plenty of businesses I talk to have read each slip as permission to wait for the next one. The 1% test is useful because it removes the guesswork. You don't have to imagine what breaks any more; you can go and look.

## What Google says happens next

The stated plan is to move from 1% to all Chrome users in the second half of this year. That's still subject to the Competition and Markets Authority, which has to be satisfied that the replacement technology doesn't simply hand Google's ad business an advantage. I'd put real money on the timeline moving at least once more. I wouldn't put any money on the direction changing. Safari and Firefox block third-party cookies already. Chrome is the last big browser still allowing them.

The replacements, the Privacy Sandbox APIs (Topics, Protected Audience and Attribution Reporting being the ones most marketers will hear about), have been generally available in Chrome since last autumn. Adoption by ad tech has been patchy, and the industry testing that's been published so far hasn't been glowing.

## How to see what breaks

This is the bit worth an hour of your time this week. You don't need to be in the 1% to test.

1. **Turn the restriction on in your own Chrome.** There's a flag at `chrome://flags/#test-third-party-cookie-phaseout` that simulates the phase-out. Enable it, restart Chrome, and browse your own site the way a customer would.
2. **Open DevTools and watch the Issues tab.** Chrome now flags cookies that would be blocked, and the Application tab shows which cookies are set by which domains. Anything set from a domain that isn't yours is the thing to worry about.
3. **Walk through the money journeys.** Basket, checkout, payment, account login, any embedded chat widget, any third-party review platform. Embedded payment steps and single sign-on are the ones most likely to break in ways that cost you orders, not just data.
4. **Check your measurement.** Fire a test conversion and see whether it arrives in Google Ads, Meta and whatever affiliate platform you use. Affiliate tracking is the one I'd look at hardest, because a lot of it still leans on third-party cookies and the commission disputes that follow can get ugly.
5. **Ask your vendors directly.** Every tag in your container belongs to someone. Email them and ask what their product does without third-party cookies. If the answer is vague, push for specifics.

## What I'd do now

For an ecommerce business of any size, the practical advice hasn't changed much in two years. It's just less optional now.

- **Get Google's enhanced conversions and the Meta Conversions API running properly.** Both send hashed first-party data server-to-server, with consent, and both recover signal you're already losing to Safari.
- **Sort out consent.** Google is also asking advertisers with European traffic to implement Consent Mode v2 by March, which is a separate deadline but lands in the same place. If your banner and your tags disagree about what the visitor agreed to, you've got a compliance problem and a data problem at once.
- **Stop treating last-click attribution in an ad platform as the truth.** It was always generous to itself, and it's going to get worse. Look at total revenue against total spend and run the occasional holdout test.
- **Keep investing in owned channels.** Email, customer accounts and repeat custom, which carry on regardless of browser policy.

## A small test with a useful side effect

If the 1% sample includes a few of your customers, you may already be seeing the effect in your numbers without knowing it. It won't be dramatic at this scale. But it's worth adding a note to your reporting so that if conversions dip slightly in Chrome this quarter, nobody spends a week blaming the new landing page.

I'll keep the flag switched on in my own browser for a while and see how much of the web quietly stops working. I suspect a lot of it carries on fine and a small number of things fall over badly, which is roughly what happened when Safari did this.
