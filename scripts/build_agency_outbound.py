#!/usr/bin/env python3
"""Build the Shopify Plus partner agency outbound CSV.

Hand-curated set of 10 agencies. Each row has the agency name, the
single most-relevant differentiator we'd lead with, the URL where the
sender should find a real contact name + email before sending, the
subject line, and the personalized message body. The personalization
hook is a real public reference about that agency (a case study, a
specialization, a published methodology, etc.), so the email reads as
researched, not blasted.

Output: outbound-agencies.csv at repo root.
"""
import csv
from typing import NamedTuple


class Agency(NamedTuple):
    name: str
    website: str
    contact_path: str       # where to find a real contact name + email
    specialty: str          # one-line specialty tag
    hook: str               # the specific public reference used in the email
    pitch_angle: str        # which of our value props maps best
    priority: int           # 1 = send first, 10 = send last
    notes: str


AGENCIES: list[Agency] = [
    Agency(
        name="eSEOspace",
        website="https://eseospace.com",
        contact_path="https://eseospace.com/contact",
        specialty="AI-first Shopify architecture, AI search optimization",
        hook="your AI-First Architecture methodology for making Shopify stores discoverable by AI engines",
        pitch_angle="Strongest fit: they sell AI search optim as a service. We give them a measurable input/output for that service.",
        priority=1,
        notes="Founder Aman Doshi often speaks at Shopify conferences; LinkedIn search likely productive.",
    ),
    Agency(
        name="Avenuez",
        website="https://avenuez.com",
        contact_path="https://avenuez.com/contact",
        specialty="500+ Shopify builds, performance media + AI search optim",
        hook="your acquisition of Varfaj and the move into AI search optimization for full-funnel DTC growth",
        pitch_angle="They explicitly added AI search optim recently. We are the tactical layer they need post-acquisition.",
        priority=2,
        notes="Recent acquisition (Feb 2026) means they are actively building the AI search practice.",
    ),
    Agency(
        name="Eastside Co",
        website="https://eastsideco.com",
        contact_path="https://eastsideco.com/contact",
        specialty="CRO and A/B testing, Shopify Plus",
        hook="your conversion rate methodology and the work you have published on data-driven A/B testing for DTC clients",
        pitch_angle="Our Pro plan's causal A/B with p-values is exactly what their CRO clients want. Joint sell.",
        priority=3,
        notes="UK-based, well-known in EU Shopify Plus circles. Strong content marketing presence.",
    ),
    Agency(
        name="Lantern Sol",
        website="https://lanternsol.com",
        contact_path="https://lanternsol.com/contact",
        specialty="SEO and growth, Shopify Plus partner since 2015",
        hook="the documented +692% organic revenue lift case study on your site",
        pitch_angle="They are the SEO-as-growth story. We are the next chapter of SEO (AI-readable structured data).",
        priority=4,
        notes="Public case studies make it easy to reference their work specifically.",
    ),
    Agency(
        name="Coalition Technologies",
        website="https://coalitiontechnologies.com",
        contact_path="https://coalitiontechnologies.com/contact",
        specialty="250+ team, full design + dev + SEO under one roof, Los Angeles",
        hook="your full-service SEO + dev integration approach for Shopify Plus brands",
        pitch_angle="They have the volume (250+ team = lots of clients). One agency partnership = potential 50+ installs.",
        priority=5,
        notes="Large agency, harder to penetrate but huge if you do. Aim for VP-level contact.",
    ),
    Agency(
        name="Swanky",
        website="https://swankyagency.com",
        contact_path="https://swankyagency.com/contact",
        specialty="CRO for Shopify Plus, recurring revenue specialist",
        hook="your work on subscription-based DTC brands and the friction-point methodology for checkout journeys",
        pitch_angle="Subscription brands have catalog problems we audit cleanly. Pre-purchase AI discovery = their top-of-funnel.",
        priority=6,
        notes="UK + US offices. Subscription specialty narrows their ICP, which makes them easier to qualify.",
    ),
    Agency(
        name="Avex Designs",
        website="https://avexdesigns.com",
        contact_path="https://avexdesigns.com/contact",
        specialty="NYC, DTC fashion and beauty Shopify Plus",
        hook="your specialization in apparel and beauty Shopify Plus with features like swatches and lookbook browsing",
        pitch_angle="Apparel and beauty are our top 2 verticals by data coverage. Their clients are exactly our captures population.",
        priority=7,
        notes="NYC fashion ecosystem. Founder ariel.aronoff@avexdesigns.com (verify on site).",
    ),
    Agency(
        name="We Make Websites",
        website="https://wemakewebsites.com",
        contact_path="https://wemakewebsites.com/contact",
        specialty="UK, premium and fast-growing DTC Shopify Plus",
        hook="your work on premium DTC brands and the design-led Shopify approach",
        pitch_angle="High-AOV premium brands = Score Guarantee +10pts in 30 days has real revenue value for them.",
        priority=8,
        notes="UK office. Time zone overlaps your morning.",
    ),
    Agency(
        name="Shero Commerce",
        website="https://sherocommerce.com",
        contact_path="https://sherocommerce.com/contact",
        specialty="500+ migrations to Shopify, SEO retention post-launch",
        hook="your 500-migration playbook and the SEO retention focus during platform moves",
        pitch_angle="Post-migration AI audit is a natural value-add for them. Recently migrated stores need re-scoring.",
        priority=9,
        notes="Their content marketing is heavy. Find their blog editor and pitch a guest post first as warm-up.",
    ),
    Agency(
        name="ECommerce Partners (ECP)",
        website="https://ecommercepartners.com",
        contact_path="https://ecommercepartners.com/contact",
        specialty="Los Angeles, beauty + fashion + wellness Shopify Plus",
        hook="your ROI-focused approach for beauty and wellness DTC and the TikTok Shop integration work",
        pitch_angle="Beauty + wellness = top 3 verticals in our dataset. ROI-focus aligns with our Score Guarantee positioning.",
        priority=10,
        notes="LA-based, strong on creative; tech-savvy enough to evaluate our methodology repo.",
    ),
]


SUBJECT_TEMPLATES = [
    "AI visibility audit + Shopify Plus client portfolio — partner thoughts?",
    "AI shopping agents are reading {agency_short} clients' catalogs differently",
    "Quick partner question for {agency_short} on AI catalog optim",
]


MESSAGE_TEMPLATE = """Hi [first name to find on LinkedIn],

I'm Alexandre, founder of AI Catalog Score (apps.shopify.com/ai-catalog-score). It's a Shopify app that scores how AI shopping agents (ChatGPT, Claude, Gemini, Perplexity, Mistral, DeepSeek) read product catalogs, and applies one-click fixes. The methodology is CC0 (github.com/commerce-agentic/agentic-catalog-scanner) and the underlying captures dataset is MIT-licensed at 1.2M+ rows.

Two reasons I'm reaching out specifically to {agency_name}:

1. {hook}. The AI-readability angle is becoming a real channel for DTC merchants (ChatGPT shopping queries are growing fast), and your work suggests {agency_short} is well positioned to be early on it.

2. I'd like to discuss a partner program. We don't have one set up yet; I want to design it with 1-2 launch agencies who understand the merchant side. The shape I'm thinking is revenue share on referred installs, or a flat referral fee per closed Pro/Performance plan ($149 to $399 per month per merchant). Open to your preferred structure.

You can audit any Shopify store free in 60 seconds at:
https://aicatalogscore.com/audit

If this is interesting, a 15-minute call this week or next would be useful. If not, no worries; happy to ship you a recap of our methodology + dataset for your team's reference regardless.

Best,
Alexandre Poulain
alexandre@aicatalogscore.com
"""


def short_name(name: str) -> str:
    """Take agency name, return a short version for templating."""
    overrides = {
        "ECommerce Partners (ECP)": "ECP",
        "We Make Websites": "WMW",
        "Coalition Technologies": "Coalition",
    }
    return overrides.get(name, name.split()[0])


def build_subject(agency: Agency) -> str:
    short = short_name(agency.name)
    # Use template 2 by default (most personalized); fallback to 1 if name awkward
    if len(short) <= 12 and " " not in short:
        return f"AI shopping agents are reading {short} clients' catalogs differently"
    return "AI visibility audit + Shopify Plus client portfolio: partner thoughts?"


def build_message(agency: Agency) -> str:
    short = short_name(agency.name)
    return MESSAGE_TEMPLATE.format(
        agency_name=agency.name,
        agency_short=short,
        hook=agency.hook,
    )


def main() -> None:
    rows = []
    for a in sorted(AGENCIES, key=lambda x: x.priority):
        rows.append({
            "priority": a.priority,
            "agency_name": a.name,
            "website": a.website,
            "contact_path": a.contact_path,
            "specialty": a.specialty,
            "pitch_angle": a.pitch_angle,
            "notes": a.notes,
            "subject_line": build_subject(a),
            "message_body": build_message(a),
        })

    out = r"C:\Users\Poulain\AppData\Local\Temp\ai-catalog-score-docs\outbound-agencies.csv"
    headers = [
        "priority", "agency_name", "website", "contact_path",
        "specialty", "pitch_angle", "notes",
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
