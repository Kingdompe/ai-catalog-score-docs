# AI Catalog Score — Public Documentation

Legal & compliance documents for [AI Catalog Score](https://github.com/Kingdompe/ai-catalog-score), the Shopify app for AI shopping agent catalog optimization.

This repository hosts:

- [`privacy.html`](privacy.html) — Privacy Policy v2.0 (effective 2026-05-04)
- [`terms.html`](terms.html) — Score Guarantee contractual terms v1.0-2026-05-03

Live at:

- https://aicatalogscore.com/privacy.html
- https://aicatalogscore.com/terms.html

Hosted via [Cloudflare Pages](https://pages.cloudflare.com) connected to this repo. Updates auto-deploy on push to `main`.

The canonical source of these documents lives in the [main app repository](https://github.com/Kingdompe/ai-catalog-score) under `docs/`. This public mirror exists because:

1. The main app repo is private (contains sensitive operational config + commercial logic).
2. Shopify App Store reviewers + GDPR data subjects need public HTTPS URLs for these documents.
3. Cloudflare Pages requires a public repo to auto-deploy from (free tier).

## Updating

When `privacy.html` or `terms.html` change in the main repo's `docs/` folder, copy the updated files here and push. Cloudflare Pages will auto-deploy within ~30 seconds.

```bash
cp ../ai-catalog-score/docs/privacy.html .
cp ../ai-catalog-score/docs/terms.html .
git add . && git commit -m "docs: sync from main repo" && git push
```

## Contact

- Email: support@aicatalogscore.com
- Issues / questions: [main app repo issues](https://github.com/Kingdompe/ai-catalog-score/issues)
