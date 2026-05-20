# Growth Strategy — Pre & Post Launch Priorities

The 5 levers that determine whether AI Catalog Score gets traction or
dies in the App Store long tail. Ordered by ROI and dependency: each
priority is more impactful when the previous one is in place.

**Context:** Shopify App Store has ~13,000 apps. New apps with 0 reviews
get 0-5 installs/day organic. Average B2B app: ~100 installs in 6 months.
Without leverage, we are invisible. The 5 priorities below are designed
to escape that default trajectory.

---

## Our 4 unique structural advantages (use in everything)

These are referenced across the 5 priorities below. They're what makes
our launch strategy work where others fail:

1. **Public audit capability** — our engine audits any public Shopify
   store without install. Lets us show value before any friction.
2. **Score Guarantee in ToS** (+10 pts in 30 days or auto-refund) —
   contractual moat. Zero competitor matches it.
3. **Open source methodology** (CC0 rubric + MIT dataset published at
   github.com/commerce-agentic) — credibility for technical buyers.
4. **270k+ captures ground-truth dataset** — benchmark authority
   competitors can't replicate quickly.

---

## Priority 1 — Public Audit Page (THE killer feature)

**What:** A page at `aicatalogscore.com/audit?store={shop}.myshopify.com`
that auto-runs an audit on any public Shopify store and shows:
- Score 0-100 + grade A-F
- 8-dimension breakdown
- Top 5 critical issues
- Sticky CTA: "Install free to fix these in one click"

**Why it's the highest-ROI move:**
- Generates 100,000+ unique indexable SEO pages (one per scannable Shopify store)
- Merchants who Google their own store land on our page → see their score → convert
- Same for competitors auditing each other → free word-of-mouth
- Enables viral "Top 100 worst/best AI-readiness scores" content
- Cannot be copied by competitors without replicating the audit engine + dataset
- Makes every other marketing tactic (outbound, partnerships, content) 10x more effective

**First action:** 2-3 days of code. New route at `aicatalogscore.com/audit/[shop]`
that runs the audit via Shopify Storefront API (no auth needed for public
catalog data), renders a clean HTML page with structured data, OG card
per shop, and a strong install CTA.

**Expected impact:** Without this, all other priorities work at 20-30% of
their potential. With it, each priority compounds — every outbound email,
every partnership pitch, every social mention can link to a personalized
audit URL.

---

## Priority 2 — Outbound with Personalized Audit Preview

**What:** Cold email or DM to 500-1000 Shopify FR/EU stores, each with
a pre-generated audit attached. Pitch is value-first, not feature-list.

**Pitch template:**
> "I audited {store name}. Current AI Catalog Score: {score}/100.
> Top 3 issues I found: {issue 1, 2, 3}. The app launches on the
> Shopify App Store on {date}. If you install in the first 7 days I'll
> personally onboard you (15 min call) and our Score Guarantee in ToS
> covers you for +10 pts in 30 days or every dollar refunds. Methodology
> is open source: github.com/commerce-agentic/agentic-catalog-scanner"

**Why this works:**
- Value demonstrated BEFORE pitch (audit attached)
- Score Guarantee bypasses scepticism
- Open source link signals technical credibility
- Personalization at scale = ~5-15% reply rate (vs 1-2% generic cold)

**First action:**
1. Buy StoreLeads or use Shopify Plus directory ($50-150/mo) for 500-1000 FR/EU stores filtered by industry (beauty, apparel, food, home — verticals where AI search is meaningful)
2. Run automated audits on all of them (~3 hrs compute)
3. Generate personalized email bodies via Claude (audit + pitch template) — ~$10-20 in API costs
4. Send 30-50/day from a non-Gmail address (Apollo, Instantly, or manual Hey) to stay under spam thresholds
5. **GDPR compliance:** only email addresses that are publicly listed on the merchant's contact page

**Expected impact:**
- 500 emails → 50-100 conversations → 15-40 beta installs ready at day 1
- These 40 installs at launch = velocity signal Shopify algo rewards
- Each early install is a future review (target 15-20 5★ reviews in first 30 days)

---

## Priority 3 — Quarterly Report + Pillar Content

**What:** A "State of AI Commerce on Shopify" report based on our
270k+ captures dataset. 10-15 pages PDF, public, branded. Plus 3-5
SEO pillar articles ranking for queries like "AI agent visibility
Shopify", "how to optimize for ChatGPT shopping", "AI catalog audit".

**Why:**
- Press hook: nobody else has 270k+ ground-truth captures
- Linkbait: Hacker News, Twitter, Modern Retail, Retail Dive, eCommerceFuel
- SEO authority: 5 pillar articles + audit pages = our SEO moat
- Repeatable: ship a new report every quarter, compounds

**First action:**
- Q2 2026 report draft: extract 8-10 insights from the captures dataset
  ("Which agents recommend which brands most", "AI ↔ Shopify product
  match rate by vertical", "Top 100 most-recommended Shopify brands
  on ChatGPT")
- Pillar article #1: "How to make your Shopify catalog visible to
  ChatGPT (the 8 signals AI agents actually look at)" — link to
  audit page, link to open-source rubric, soft CTA

**Expected impact:** Slow burn — 6-12 months to rank — but compounds.
By month 12, organic SEO can be 30-50% of installs. Without content,
that channel doesn't exist.

---

## Priority 4 — Coordinated Launch (Product Hunt + Hacker News)

**What:** When Shopify approves the app, fire all marketing channels
the same week.

**Sequencing (T-day = Shopify approval day):**
- T-3: push 3 open source repos to GitHub (already done)
- T-1: warm up beta pipeline of 50 users with "we're live tomorrow" email
- T+0 morning: invoice beta users to install — 30-50 installs in first 24h = velocity signal Shopify algo loves
- T+0 09:30 UTC: Product Hunt launch (page already prepped in LAUNCH_MARKETING.md)
- T+0 18:00 UTC: Hacker News Show HN (draft in LAUNCH_MARKETING.md, technical angle)
- T+1 12:00 UTC: Indie Hackers post (story angle)
- T+1 → T+7: reply to every comment, iterate copy on App Store listing based on feedback

**Why sequencing matters:**
- Shopify algo measures installs/day in first 14-30 days → ranks new apps
- 50 installs at T+0 + PH echo = top 10 in our category for the first week
- Top 10 placement → organic discovery loops → compounds

**Expected impact:** 100-300 incremental installs over launch week beyond
what outbound alone would produce.

---

## Priority 5 — Agency Partnerships (longest payoff)

**What:** Partner with 5-10 Shopify Plus agencies (FR/EU first) who
each manage 50-200 client stores. Affiliate deal: 30% lifetime
revenue share.

**Why slow but valuable:**
- One agency = 10-50 installs over 6 months
- Recurring source of qualified merchants (not one-time)
- Defensible — once they're using us as their AI-readiness tool,
  switching cost is high

**First action (post-launch):**
- List 20 Shopify Plus partner agencies in FR/EU (Bold, Underwaterpistol,
  ConvertCart, niche FR agencies)
- Outreach to each with personalized portfolio audit (audit 5 of their
  client stores, show the aggregate score breakdown) → "Imagine offering
  this to all your clients as a value-add"
- Negotiate affiliate deal (30% lifetime is generous but locks them in)
- Provide white-label option (already on Performance tier roadmap)

**Expected impact:** Slow ramp (3-6 months to first deal), but a single
big agency relationship = recurring 5-20 installs/month + retention

---

## What's intentionally NOT in the top 5

- **Paid ads (Google/Meta)** — low ROI for B2B Shopify, $50-200 CAC
  vs $49-149 ARPU. Skip until product-market fit is proven.
- **LinkedIn social posting** — low signal for our ICP. Skip unless
  it's value-first audit reveals (e.g. "I audited Sézane, here's the
  score").
- **Free trial 14-30 days** — already have a Free plan (15 SKUs). Adding
  a trial on top creates friction without solving any problem.
- **Lower entry pricing ($9-19)** — dilutes brand and breaks LTV/CAC.
  Free plan IS the low-friction entry.

---

## Realistic install trajectory

| Milestone | Cumulative installs | Dominant source |
|---|---|---|
| Month 1 | 30-60 | Outbound + beta pipeline |
| Month 3 | 200-400 | + PH echo + audit pages indexed |
| Month 6 | 800-1500 | + content SEO ranking |
| Month 12 | 3,000-6,000 | + agency partnerships + word of mouth |
| Month 24 | 10,000-20,000 | + Featured Shopify status + ecosystem effect |

**Inflection point:** Month 3. If we hit 200-400 installs, we enter
the "Trending" of the AI/SEO Shopify category → organic flywheel
starts. If we're below 100 at Month 3, we're in the long tail and
need to question execution.

---

## Decision: build the public audit page first

Priority 1 is the only one that can't be unlocked by execution speed
alone — it requires actual product work. Everything else (outbound,
content, launches, partnerships) is execution against a playbook.
Without Priority 1, the playbook works at 20-30% efficiency.

**Resource allocation pre-launch:**
- 60-70% engineering: Public audit page + supporting infrastructure
- 20% marketing: Outbound list build + email prep
- 10-20% content: Quarterly report data extraction + pillar article draft

---

*Strategy locked 2026-05-20 during Railway outage. Update quarterly
based on actual install velocity vs targets above.*
