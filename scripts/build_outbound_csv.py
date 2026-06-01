#!/usr/bin/env python3
"""Build outbound DTC CSV from catalog-score leaderboard JSON."""
import csv
import json
from urllib.parse import quote

SRC = r"C:\Users\Poulain\AppData\Local\Temp\ai-catalog-score-docs\public-data\catalog-score-leaderboard.json"
DST = r"C:\Users\Poulain\AppData\Local\Temp\ai-catalog-score-docs\outbound-batch-1.csv"


# Hand-curated display names for brands whose domain doesn't split cleanly
# into words. Auto-derivation gives "Burtsbeesbaby" / "Mattandnat" / "Aloyoga"
# which read as broken templates in outbound prose; fixed names below.
BRAND_OVERRIDES = {
    "burtsbeesbaby.com": "Burt's Bees Baby",
    "mattandnat.com": "Matt & Nat",
    "aloyoga.com": "Alo Yoga",
    "rothys.com": "Rothy's",
    "thursdayboots.com": "Thursday Boots",
    "stevemadden.com": "Steve Madden",
    "vansoutdoor.com": "Vans Outdoor",
    "thelounge.com": "The Lounge",
    "thirdlove.com": "ThirdLove",
    "saatva.com": "Saatva",
    "fjallraven.com": "Fjällräven",
    "honest.com": "The Honest Company",
    "outdoorvoices.com": "Outdoor Voices",
    "mackweldon.com": "Mack Weldon",
    "thegrommet.com": "The Grommet",
    "untuckit.com": "UNTUCKit",
    "thursday.com": "Thursday Boots",
    "moroccanoil.com": "Moroccanoil",
    "tula.com": "Tula",
    "tatcha.com": "Tatcha",
}


def brand_name(domain: str) -> str:
    # Curated override wins over auto-derivation
    if domain in BRAND_OVERRIDES:
        return BRAND_OVERRIDES[domain]
    # Strip TLD: take the part before the first dot
    stem = domain.split(".")[0]
    # Replace - with space
    stem = stem.replace("-", " ")
    # Title-case each word
    return " ".join(w.capitalize() for w in stem.split())


def possessive(name: str) -> str:
    """Apostrophe-s, but just an apostrophe if the name already ends in s."""
    if name.endswith(("'s", "'S")):
        return name  # already possessive (e.g. "Burt's Bees Baby" stays as-is)
    if name.endswith(("s", "S", "z", "Z", "x", "X")):
        return f"{name}'"
    return f"{name}'s"


def clean_issue(issue: str) -> str:
    """Strip trailing period so it embeds cleanly mid-sentence."""
    return issue.rstrip(".").strip()


def tier_for(product_count: int) -> str:
    if product_count <= 50:
        return "Free"
    if product_count <= 500:
        return "Growth"
    if product_count <= 3000:
        return "Pro"
    return "Performance"


# Pricing facts (must match aicatalogscore.com/#pricing exactly)
TIER_PRICES = {
    "Free": 0,
    "Growth": 49,
    "Pro": 149,
    "Performance": 399,
}
TIER_LIMITS = {
    "Free": "50",
    "Growth": "500",
    "Pro": "3,000",
    "Performance": "unlimited",
}


def pricing_line(tier: str, product_count: int) -> str:
    """One honest line of pricing context, tailored to the target tier.

    Never claims a paid tier is free. The Free tier is free up to 50 SKUs;
    every tier above is paid monthly. For Growth/Pro/Performance targets
    we tell the prospect they can test the app on 50 SKUs free, then name
    the actual monthly price for their catalog size.
    """
    if tier == "Free":
        return (
            "Pricing: the Free plan covers up to 50 SKUs, which is your "
            f"full {product_count}-product catalog. No card required."
        )
    price = TIER_PRICES[tier]
    return (
        f"Pricing: Free plan up to 50 SKUs to test the app on a slice "
        f"of your catalog. For your {product_count} products the {tier} "
        f"plan at ${price}/mo is the fit."
    )


def pitch_angle(score: int) -> str:
    if score >= 70:
        return "polish the last 25%"
    if score >= 50:
        return "two big jumps available"
    return "fast catch-up"


PITCH_ONELINER = {
    "polish the last 25%": (
        "You're in the top quartile. The 25 points you're leaving on the table are "
        "the same three signals across the board: structured metafields, image alt "
        "text, and SEO title parity."
    ),
    "two big jumps available": (
        "You're in the middle of the pack. The two biggest jumps in our rubric are "
        "adding 3 vertical-relevant metafields per product (worth 12 points) and "
        "rewriting descriptions with bulleted spec lists (worth 8 points)."
    ),
    "fast catch-up": (
        "The catalog is leaving most of the rubric on the table. Five quick wins "
        "move you 30 points: product-type noun in titles, ≥150-word "
        "descriptions with at least one bullet list, three factual markers per "
        "product, image alt text, and seo.title disambiguation."
    ),
}


APP_STORE_URL = "https://apps.shopify.com/ai-catalog-score"


def build_message(brand: str, score: int, top_issue: str, audit_url: str,
                  tier: str, product_count: int, oneliner: str) -> str:
    issue_clean = clean_issue(top_issue)
    pricing = pricing_line(tier, product_count)
    return (
        f"Hi there,\n\n"
        f"We benchmark how AI shopping agents (ChatGPT, Claude, Gemini, "
        f"Perplexity) read Shopify catalogs. {brand} just scored {score}/100 "
        f"in our public audit. The top issue is: {issue_clean}.\n\n"
        f"{oneliner}\n\n"
        f"Full breakdown without install: {audit_url}\n"
        f"App Store listing: {APP_STORE_URL}\n\n"
        f"Our app rewrites the top issues with one click and lets you "
        f"verify the revenue lift causally. {pricing}\n\n"
        f"If this is useful, hit reply and I'll walk you through the biggest "
        f"two fixes for your specific catalog.\n\n"
        f"Best,\n"
        f"[Your name]"
    )


def main() -> None:
    with open(SRC, "r", encoding="utf-8") as f:
        data = json.load(f)

    entries = data["entries"]
    # Sort by score descending, stable on input order for ties
    entries_sorted = sorted(entries, key=lambda e: -e["score"])

    rows = []
    for e in entries_sorted:
        domain = e["domain"]
        score = int(e["score"])
        top_issue = e["topIssue"]
        product_count = int(e["productCount"])
        ai_mentions = int(e["aiMentions"])

        brand = brand_name(domain)
        audit_url = f"https://aicatalogscore.com/audit/{quote(domain, safe='')}"
        tier = tier_for(product_count)
        target_score = min(100, score + 10)
        angle = pitch_angle(score)
        oneliner = PITCH_ONELINER[angle]
        subject_line = f"{possessive(brand)} AI catalog score: {score}/100"
        message_body = build_message(
            brand, score, top_issue, audit_url, tier, product_count, oneliner
        )

        rows.append({
            "domain": domain,
            "score": score,
            "top_issue": top_issue,
            "product_count": product_count,
            "ai_mentions": ai_mentions,
            "audit_url": audit_url,
            "tier_target": tier,
            "subject_line": subject_line,
            "message_body": message_body,
            "target_score": target_score,
            "pitch_angle": angle,
        })

    headers = [
        "domain", "score", "top_issue", "product_count", "ai_mentions",
        "audit_url", "tier_target", "subject_line", "message_body",
        "target_score", "pitch_angle",
    ]

    with open(DST, "w", encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(
            f, fieldnames=headers,
            quoting=csv.QUOTE_ALL,
            quotechar='"',
            doublequote=True,
        )
        writer.writeheader()
        for r in rows:
            writer.writerow(r)

    print(f"Wrote {len(rows)} rows to {DST}")


if __name__ == "__main__":
    main()
