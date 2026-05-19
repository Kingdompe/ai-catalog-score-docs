# Shopify App Store Submission — Copy & Assets

Everything you need to paste into the Partner Dashboard submission form. All
text is drafted in English (Shopify App Store's primary locale); the listing
itself can be localized after first approval.

---

## 1. App Icon

**File:** `logo-acs-1200-dark.png` (repo root of ai-catalog-score-docs)
**Spec:** 1200×1200 PNG, dark warm background, AI bot mascot with shopping
bag — matches the brand on aicatalogscore.com hero. Upload as-is to the
"App icon" field in the Partner Dashboard.

If you want a lighter / alternate version later, regenerate from
`logo-acs.png` with a different background colour — the source PNG is in
the same folder.

---

## 2. Short Description (160 char max)

**Pick one:**

**A.** *Audit how AI agents read your products. One-click fixes from Claude. +10 points in 30 days or money back.* — 113 chars

**B.** *Make your Shopify catalog visible to ChatGPT, Claude, and Gemini. Score, fix, and prove the revenue lift with p-values.* — 121 chars

**C.** *The first Shopify app that scores, rewrites, and proves your catalog is AI-ready. Score Guarantee in writing.* — 109 chars

**Recommended: A.** It opens with the *what* (audit), drops the *who* (Claude
= recognizable AI brand), and closes with the unique guarantee. Best
mix of specificity + hook for the App Store search snippet.

---

## 3. Long Description

> **Your products are invisible to AI agents — and that's costing you real revenue.**
>
> Every day, ChatGPT, Claude, Gemini, Mistral, and DeepSeek recommend
> products to your customers. The catalogs they can read clearly get
> recommended. The ones full of weak titles, missing alt text, and zero
> structured data don't. AI Catalog Score is the first Shopify app built
> from the ground up for the AI agent era.
>
> **What you get**
>
> - **8-dimension AI Catalog Score** — every product audited against the
>   signals real AI agents actually use: title structure, description
>   factual density, image alt text, variant attributes, metafields,
>   Shopify category, SEO, and pricing.
> - **One-click Maximize** — Claude rewrites titles, descriptions,
>   SEO copy, alt text, and metafields directly into Shopify. Every
>   change is journaled with a 30-day undo. Nothing applied without
>   your approval on a per-fix preview.
> - **Bulk Maximize** — apply the full cascade to dozens of products at
>   once. Growth caps at 25 / run; Pro is unlimited.
> - **Causal A/B testing** — prove every fix worked with DiD + Welch's
>   t-test on real session data. p-values reported, not vibes.
> - **Score Guarantee, in writing** — if your average AI Catalog Score
>   doesn't lift by +10 points within 30 days of activation (after
>   applying the top 5 recommended fixes), every dollar refunds
>   automatically. No support ticket. The guarantee is in our Terms
>   of Service v1.0, not the marketing copy.
> - **AI Agent Traffic dashboard** — see which agents are actually
>   sending you sessions (ChatGPT, Claude, Gemini, Perplexity, Copilot,
>   You.com, Le Chat, DeepSeek), what they're buying, and the revenue
>   tied to each one.
> - **AI Query Simulator** — type a real shopper query and see which of
>   your products an AI agent would recommend, ranked by match score
>   from a model trained on real ground-truth captures.
> - **Slack alerts** — Guardrails fire on every product edit. Connect
>   any Slack workspace via Incoming Webhook to get notified when a
>   product loses AI visibility.
> - **Shared Experiment Library** — anonymized, opt-in: see what's
>   working for other merchants in your vertical (skincare, apparel,
>   food, electronics, etc.) before deciding on a fix.
>
> **Built on open standards.** Our scoring methodology and the
> agentic-catalog-scanner are open source (CC0 / MIT) on GitHub —
> github.com/commerce-agentic. The dataset of 270k+ AI agent captures
> across 5+ verticals is the same one our audit engine evaluates
> against.
>
> **Pricing that aligns with results.** Free forever for catalogs up to
> 15 SKUs. Performance tier charges only 5% of measured AI revenue
> uplift (capped at $5,000/mo) — zero base fee if no lift.
>
> **Install free. Audit your store in 90 seconds. See exactly what's
> blocking AI agents from recommending your products.**

---

## 4. Categories

**Primary:** Marketing and conversion → **SEO**
*(Reasoning: AI agent visibility is the new SEO. Closest matching
existing taxonomy.)*

**Secondary:** Store management → **Product display**
*(Reasoning: we rewrite titles, descriptions, alt text, metafields —
all product-display fields.)*

If Shopify forces a single category, pick **SEO** — that's where
merchants who already think about AI agent visibility will look first.

---

## 5. Pricing Setup (in Partner Dashboard)

Shopify wants the pricing plans declared at submission time. Match these
to the in-app `lib/plans.ts`:

| Plan | Recurring | SKU cap | Trial | Notes |
|---|---|---|---|---|
| Free | $0 / month | 15 | none — free forever | No credit card required |
| Growth | $49 / month | 500 | none (free plan is the trial) | |
| Pro | $149 / month | 3,000 | none | |
| Performance | $0 base + usage | unlimited | none | 5% of measured AI revenue uplift, capped $5,000 / month. Skin-in-the-game pricing. |

In the Partner Dashboard pricing section, declare 4 plans:
- 3 "Recurring" plans (Free, Growth $49, Pro $149)
- 1 "Usage-based" plan (Performance, $0 base + 5% capped)

**Pricing details copy** (paste into "Pricing description"):

> **Free** — Audit up to 15 SKUs with the full 8-dimension scoring engine,
> One-Click Apply Fixes, agent visibility report, and 30-day score
> history. No credit card. No expiry.
>
> **Growth** ($49/mo) — Up to 500 SKUs, Bulk Fix (25 products/run),
> Competitor comparison, Review Intelligence, unlimited AI Query
> Simulator, 90-day score history.
>
> **Pro** ($149/mo) — Up to 3,000 SKUs, unlimited Bulk Fix and Bulk
> Maximize, Causal A/B testing with p-values, Guardrails on every
> catalog edit, Agent Traffic Monitor, Slack alerts.
>
> **Performance** ($399/mo OR 5% of AI uplift, $5,000/mo cap) —
> Unlimited SKUs, Double Score Guarantee (+20 pts in 30 days),
> Causal Attribution dashboard, dedicated success manager. Choose
> a flat fee or pay only on measured AI revenue uplift (zero if no
> lift).
>
> Score Guarantee — refund of any month where the catalog's average
> AI Catalog Score did not lift by at least +10 points (Performance:
> +20 pts). Written into our Terms of Service v1.0.

---

## 6. URLs

Paste these into the corresponding fields:

| Field | URL |
|---|---|
| App URL | `https://shopify-app-production-7e58.up.railway.app` |
| Marketing website | `https://aicatalogscore.com` |
| Support URL | `https://aicatalogscore.com/#faq` |
| Privacy policy | `https://aicatalogscore.com/privacy.html` |
| Terms of Service | `https://aicatalogscore.com/terms.html` |
| Support email | `support@aicatalogscore.com` (set up first — see below) |

**Support email setup (Cloudflare Email Routing, ~5 min):**
1. cloudflare.com → aicatalogscore.com → **Email** → **Email Routing**
2. Enable Email Routing if not already
3. **Routing addresses** → Add `support@aicatalogscore.com` → forward to your
   personal Gmail (e.g., `apalexandre14@gmail.com`)
4. Verify the destination address (Cloudflare sends you a confirmation
   email — click the link)

---

## 7. Promo Video

**File:** `videos/hero.mp4` — already in the docs repo (6.5 MB, 50s, 1080p).

The Cap recording you produced for the landing hero works as-is for the
App Store promo slot. Shopify's max is 30 MB / 60 sec — we're well under
both.

---

## 8. Screenshots (you take these on your dev store)

Shopify requires **5 minimum, 8 ideal**, exact spec: **1600×900 PNG**
(landscape, 16:9). Use your dev store `test-ai-catalog.myshopify.com`
where you've already maximized 14 skincare products. Capture in this
order — they tell a coherent story to the App Store reviewer reading
top-to-bottom:

| # | Page | What to frame | Caption |
|---|---|---|---|
| 1 | Dashboard / app._index | The score hero ('A' grade + 88-95/100) + Store AI Score breakdown (14 AI Ready / 0 invisible) | "Your store's AI Catalog Score, scored against the same signals ChatGPT and Claude use" |
| 2 | Product detail (`/app/product/$id`) after Maximize | The 94-97/100 score + Score Breakdown panel with all the green bars + the "Last Maximize" banner | "Every product audited across 8 dimensions. One click to fix what's broken." |
| 3 | Bulk Maximize results page | The 14/14 products improved table with score deltas | "Bulk Maximize: apply Claude rewrites to dozens of products in one click. 30-day undo on every change." |
| 4 | AI Visibility Index (`/app/ai-visibility`) | The 5 agent badges + your per-agent visibility data | "See which AI agents are actually recommending your catalog — and which aren't." |
| 5 | Causal Experiments (`/app/experiments`) | An experiment with p-value < 0.05 and a measured uplift | "Prove every fix worked with causal A/B testing. p < 0.05 or it didn't ship." |
| 6 | Settings → Slack alerts | The Slack webhook config card with the green "Slack alerts enabled" pill | "Get notified the moment a product loses AI visibility. Direct to your Slack workspace." |
| 7 | Score Guarantee (`/app/score-guarantee`) | The +10 pts ring + the ToS reference card | "+10 points in 30 days, or every dollar refunds automatically. Written into the Terms of Service." |
| 8 | Pricing (`/app/pricing`) | All four plan cards visible | "Free forever up to 15 SKUs. Performance tier pays only when AI revenue actually lifts." |

**Tip:** Use **macOS Cmd+Shift+5** or **Windows Win+Shift+S** with a
fixed crop rectangle of 1600×900. Or use ScreenStudio for cleaner
output. Make sure the browser is in incognito (no extensions in the
frame), zoom set to 100%, and the Shopify admin chrome is visible at
the top.

---

## 9. Built-for-Shopify nice-to-haves (optional, recommended later)

Don't block submission on these, but worth knocking out in the first
month post-launch:

- **Core Web Vitals** — Lighthouse audit on the dashboard route (LCP
  < 2.5s, CLS < 0.1, INP < 200ms)
- **Theme app extensions** — already done (`extensions/ai-catalog-jsonld`)
- **Embedded admin highlight** — already done (App Bridge integrated)
- **Latest App Bridge** — verify by running `npm outdated
  @shopify/app-bridge-react` and bumping if behind

---

## 10. Submission checklist before clicking "Submit"

- [ ] Icon uploaded (`logo-acs-1200-dark.png`)
- [ ] Short description pasted (option A recommended)
- [ ] Long description pasted (section 3)
- [ ] Categories selected (SEO primary, Product display secondary)
- [ ] 4 pricing plans declared with correct prices
- [ ] All URLs filled in (app, marketing, support, privacy, terms)
- [ ] Support email forwarding live (test by sending yourself a mail)
- [ ] 5+ screenshots uploaded (section 8)
- [ ] Promo video uploaded (`videos/hero.mp4`)
- [ ] Test install + uninstall + reinstall on dev store one more time
  (reviewers always re-test this)
- [ ] Run a fresh audit on a clean product to confirm score lifts work
- [ ] Verify Score Guarantee auto-refund logic at least *renders*
  (reviewers check the page exists)
- [ ] No `console.log` left in client-side bundle (already done — see
  `app/lib/logger.server.ts`)
- [ ] Click **Submit for review**

Shopify review window is typically **5-12 business days** for first-time
submissions. If they request changes, the iteration loop is usually
1-2 days per round.

---

*Generated 2026-05-20.*
