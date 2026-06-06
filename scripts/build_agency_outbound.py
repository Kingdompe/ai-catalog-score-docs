#!/usr/bin/env python3
"""Build the Shopify Plus partner agency outbound CSV.

4 agencies, each verified by reading their actual site (not listicles).
Each row uses a hook based on a concrete real reference from their
own published case studies, not a paraphrased listicle blurb.

Verification snapshot taken 2026-06-06.

Output: outbound-agencies.csv at repo root.
"""
import csv
from typing import NamedTuple


class Agency(NamedTuple):
    name: str
    website: str
    contact_path: str
    plus_status: str          # exact status quote from their site
    specialty: str
    hook: str                 # specific verified reference
    why_us: str               # why this agency in particular
    priority: int
    notes: str


AGENCIES: list[Agency] = [
    Agency(
        name="Eastside Co",
        website="https://eastsideco.com",
        contact_path="https://eastsideco.com/contact",
        plus_status="Platinum Shopify Plus Partner (one of the first 3 UK agencies)",
        specialty="CRO, SEO, Shopify Plus design + dev, full-funnel marketing",
        hook="your DJI Hasselblad full-funnel SEO programme that turned organic search into a primary revenue channel",
        why_us="Our 1.2M-capture dataset is exactly the source-of-truth you need to build the AI search angle into your SEO offering for brands like DJI and Gold Collagen",
        priority=1,
        notes="UK-based. Contact form is the primary public channel: eastsideco.com/contact. Sub: 'Partnership inquiry from AI Catalog Score (Shopify app)' so it routes to the right inbox.",
    ),
    Agency(
        name="Lantern Sol",
        website="https://lanternsol.com",
        contact_path="https://lanternsol.com/contact-us",
        plus_status="Shopify Partner since 2015, focused on Shopify Plus D2C",
        specialty="SEO, CRO, Facebook/Google Ads, growth marketing for D2C brands",
        hook="your $113M+ in Shopify revenue generated and the 538+ stores built playbook for D2C growth",
        why_us="Your growth playbook is heavily SEO-driven. As shopper queries shift to AI agents, our scoring rubric is a natural addition to your SEO toolkit",
        priority=2,
        notes="Has Calendly booking link (calendly.com/lanternsol/30min). After they reply via the contact form, can book directly from Calendly. Easy meeting path.",
    ),
    Agency(
        name="Swanky",
        website="https://swankyagency.com",
        contact_path="https://swankyagency.com/contact-us",
        plus_status="Shopify Platinum Partner",
        specialty="Conversion Rate Optimisation, DTC subscription brands, full-service Shopify Plus",
        hook="your work for Shackleton (74% YoY revenue increase) and the subscription DTC specialization",
        why_us="Subscription brands depend on AI agent recommendation for new-customer acquisition. Our app measures that channel quantitatively, which complements your CRO data work",
        priority=3,
        notes="Public phone +44 1392 92 70 70 if contact form fails. UK time zone overlaps morning Paris.",
    ),
    Agency(
        name="Avex Designs",
        website="https://avexdesigns.com",
        contact_path="https://avexdesigns.com/contact",
        plus_status="Platinum Shopify Plus Agency",
        specialty="Shopify Plus design + engineering for premium DTC, headless commerce, retention marketing",
        hook="your premium DTC work for brands like KHAITE, AriZona Beverages, FILA, and quip",
        why_us="Your client portfolio is exactly the apparel + beauty + lifestyle population where our captures dataset has the strongest coverage. Concrete numbers for your clients to act on",
        priority=4,
        notes="NYC-based. Contact form has structured fields (company, project details) so be specific in the form. NY time zone = afternoon Paris.",
    ),
]


def short_name(name: str) -> str:
    overrides = {
        "Avex Designs": "Avex",
        "Eastside Co": "Eastside",
    }
    return overrides.get(name, name.split()[0])


def build_subject(agency: Agency) -> str:
    short = short_name(agency.name)
    return f"AI shopping agents are reading {short} clients' catalogs differently"


def build_message(agency: Agency) -> str:
    return f"""Hello,

We're the team behind AI Catalog Score (apps.shopify.com/ai-catalog-score), a Shopify app that scores how AI shopping agents (ChatGPT, Claude, Gemini, Perplexity, Mistral, DeepSeek) read product catalogs and applies one-click fixes. The scoring methodology is CC0 (github.com/commerce-agentic/agentic-catalog-scanner) and the captures dataset is MIT-licensed at 1.2M+ rows.

Two reasons we're reaching out to {agency.name} specifically:

1. {agency.hook}. {agency.why_us}.

2. We'd like to discuss a partner program. We don't have one set up yet and want to design it with 1 or 2 launch agencies who understand the merchant side. The shape we're thinking is revenue share on referred installs, or a flat referral fee per closed Pro/Performance plan ($149 to $399 per month per merchant). Open to your preferred structure.

You can audit any Shopify store free in 60 seconds at:
https://aicatalogscore.com/audit

If this is interesting, a 15-minute call this week or next would be useful. If not, no worries, happy to send a recap of our methodology and dataset for your team's reference regardless.

Best,
The AI Catalog Score team
hello@aicatalogscore.com
"""


def main() -> None:
    rows = []
    for a in sorted(AGENCIES, key=lambda x: x.priority):
        rows.append({
            "priority": a.priority,
            "agency_name": a.name,
            "website": a.website,
            "contact_path": a.contact_path,
            "plus_status": a.plus_status,
            "specialty": a.specialty,
            "hook": a.hook,
            "why_us": a.why_us,
            "notes": a.notes,
            "subject_line": build_subject(a),
            "message_body": build_message(a),
        })

    out = r"C:\Users\Poulain\AppData\Local\Temp\ai-catalog-score-docs\outbound-agencies.csv"
    headers = [
        "priority", "agency_name", "website", "contact_path",
        "plus_status", "specialty", "hook", "why_us", "notes",
        "subject_line", "message_body",
    ]
    with open(out, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(
            f, fieldnames=headers,
            quoting=csv.QUOTE_ALL,
            quotechar='"',
            doublequote=True,
        )
        writer.writeheader()
        for r in rows:
            writer.writerow(r)
    print(f"Wrote {len(rows)} agencies to {out}")


if __name__ == "__main__":
    main()
