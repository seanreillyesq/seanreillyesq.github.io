# Blocked: shopify-checkout-tracking

No research pack was written. The brief requires every claim to cite a page that was actually opened in the session. No page could be opened, so a pack would have rested on search summaries and memory.

## What I tried (11 October 2026)

- WebFetch on shopify.dev, help.shopify.com, support.google.com, docs.getelevar.com and community.shopify.com: each failed with a DNS error (getaddrinfo ENOTFOUND).
- curl through the session's agent proxy to shopify.dev, support.google.com, docs.getelevar.com, littledata.io, en.wikipedia.org and example.com: each refused with "CONNECT tunnel failed, response 403". The proxy reported the shopify.dev and support.google.com connections as rejected (egress denied by organisation policy or unreachable).
- WebSearch worked and returned short summaries with URLs, but search snippets are not opened pages, so I have not treated them as sources.

## What the searches suggested (leads only, not confirmed, not facts)

- Shopify docs reportedly give 28 August 2025 as the end of checkout.liquid and additional scripts on Thank you and Order status pages for Plus, and 26 August 2026 for non-Plus. Check on shopify.dev and help.shopify.com.
- Google's help page "Limitations of using a custom pixel for conversion measurement on Shopify" (support.google.com/analytics/answer/16000892) reportedly says Google tags in Shopify custom pixels are not a supported implementation.
- Claims about the Google and YouTube app (Google-only destinations, no server-side route, limited consent controls) came only from third-party guides and forum posts.

## To unblock

Allow the egress proxy to reach shopify.dev, help.shopify.com, support.google.com, developers.google.com and the vendor sites (getelevar.com, littledata.io, stape.io), then re-run the task.
