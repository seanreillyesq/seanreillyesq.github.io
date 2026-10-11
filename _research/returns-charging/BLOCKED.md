# Blocked: returns-charging research

Status: no research pack written. I could not open a single source page, so I could not meet the rule that every claim needs a URL I actually opened.

## What I tried (11 October 2026)

- WebFetch on the Ingrid report page (resources.ingrid.com), the Ingrid blog post on paid returns, Retail Insight Network, Retail Economics (ZigZag benchmark) and Retail Gazette. All failed with a DNS error (ENOTFOUND).
- curl through the session proxy to www.ingrid.com, www.retailgazette.co.uk, fashionunited.uk, www.bbc.co.uk and www.google.com. All returned no response. For ingrid.com the proxy status reported the CONNECT as rejected (egress proxy denial, organisation policy, HTTP 403). I did not retry or work around it.
- WebSearch works, but it returns a model-written summary and a list of links, not the pages. Nothing in it counts as a page I opened, so I have not used it as evidence.

## Leads from search summaries (NOT verified, do not cite)

These are what the search tool said. None is confirmed from a live page.

- The "Return Economics 2026" report appears to be hosted at resources.ingrid.com/returns-economics-report-2026, with a related Ingrid blog post titled "Charging for returns? What UK retail data shows in 2026". Reported figures: 35% of the UK top-100 fashion retailers charge, against 23% in 2023. The summary said the report page had an inconsistent "2024 Analysis" heading and that the methodology could not be seen.
- A ZigZag UK returns benchmark 2025 (hosted by Retail Economics) was summarised as finding 42% of retailers charge, probably on a different definition and sample.
- Retail Gazette was summarised as reporting H&M raising its UK return fee from 1.99 to 2.95 pounds from 3 February 2025, with Zara, Boohoo, Next and Uniqlo already charging. ASOS was described as keeping free returns on orders where 40 pounds or more is kept.
- No before-and-after conversion data for any retailer surfaced. If that holds on a real read, the "no measurable hit to conversion" part of the hook is unsupported by what I saw.

## What is needed to unblock

Allow outbound access to the publishers above (ingrid.com, retailgazette.co.uk, retail-insight-network.com, retaileconomics.co.uk, fashionunited.uk) in the environment network policy, then re-run the task.
