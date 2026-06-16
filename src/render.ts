/**
 * HTML renderer for the public audit pages.
 *
 * Returns a single self-contained HTML string per shop. Uses the shared
 * design tokens from /_shared-tokens.css and the canonical nav + footer
 * pattern so the audit pages match the blog + leaderboard visual surface.
 *
 * Designed to be SEO-indexable so the 100k+ shop pages drive organic
 * traffic over time (cf. GROWTH_STRATEGY.md Priority 1).
 */

import type { StoreAudit, ProductAudit } from './audit';
import { gradeFromScore } from './audit';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shopDisplayName(shop: string): string {
  const base = shop.replace(/\.myshopify\.com$/i, '').replace(/-/g, ' ');
  return base
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function shellHead(title: string, desc: string, canonical: string, opts: { noindex?: boolean; jsonLd?: any } = {}): string {
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="article">
<meta property="og:image" content="https://aicatalogscore.com/og-card.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="https://aicatalogscore.com/og-card.png">
<meta name="robots" content="${opts.noindex ? 'noindex' : 'index,follow,max-image-preview:large'}">
<link rel="icon" type="image/png" href="/logo-acs-1200-light.png">
<link rel="preconnect" href="https://api.fontshare.com">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@500,600,400,700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/_shared-tokens.css">
<script src="/_shared.js" defer></script>${opts.jsonLd ? `\n<script type="application/ld+json">${JSON.stringify(opts.jsonLd)}</script>` : ''}`;
}

function shellHeader(activeUtm?: string): string {
  const installUrl = activeUtm
    ? `/#install?utm_source=audit&utm_shop=${encodeURIComponent(activeUtm)}`
    : '/#install';
  return `<header class="nav">
  <div class="container">
    <a href="/" class="wordmark">
      <span class="mark"><img src="/logo-acs.png" alt="AI Catalog Score" loading="eager"></span>
      <span class="name">AI Catalog Score</span>
    </a>
    <nav>
      <a href="/audit" class="is-active">Free audit</a>
      <a href="/leaderboard/">Leaderboard</a>
      <a href="/blog/">Blog</a>
      <a href="https://github.com/commerce-agentic" target="_blank" rel="noopener">GitHub</a>
    </nav>
    <a href="${installUrl}" class="btn btn-sm btn-primary">Install free <span class="btn-arrow">→</span></a>
  </div>
</header>`;
}

function shellFooter(): string {
  return `<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <a href="/" class="wordmark">
          <span class="mark"><img src="/logo-acs.png" alt="AI Catalog Score"></span>
          <span class="name">AI Catalog Score</span>
        </a>
        <p class="blurb">The open standard for AI shopping agent visibility on Shopify. Score, fix, and prove uplift causally across ChatGPT, Gemini, Claude, Perplexity, Mistral, and DeepSeek.</p>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">Product</div>
        <div class="stack-12">
          <a href="/audit">Free audit</a>
          <a href="/leaderboard/">Leaderboard</a>
          <a href="/blog/">Blog</a>
          <a href="https://apps.shopify.com/ai-catalog-score?ref=audit_form" target="_blank" rel="noopener">Install on Shopify</a>
        </div>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">Open source</div>
        <div class="stack-12">
          <a href="https://github.com/commerce-agentic" target="_blank" rel="noopener">commerce-agentic</a>
        </div>
      </div>
      <div class="footer-col">
        <div class="footer-col-title">Legal</div>
        <div class="stack-12">
          <a href="/privacy.html">Privacy</a>
          <a href="/terms.html">Terms</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© 2026 AI Catalog Score · All rights reserved.</span>
      <span>aicatalogscore.com</span>
    </div>
  </div>
</footer>`;
}

function auditPageStyles(): string {
  // Page-specific styles only. Design tokens, typography, buttons, header,
  // footer, callouts all come from /_shared-tokens.css.
  return `.audit-hero{ padding: 56px 0 24px; }
.audit-hero h1{ font-size: clamp(32px, 4.4vw, 48px); margin-bottom: 12px; }
.audit-hero .sub{ font-size: 18px; color: var(--ink-2); max-width: 720px; line-height: 1.55; margin-bottom: 28px; }

.score-card{
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  padding: 36px;
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 36px;
  align-items: center;
  box-shadow: var(--shadow-sm);
}
.score-big{ text-align: center; }
.score-big .num{
  font-family: var(--font-display);
  font-size: 80px;
  font-weight: 700;
  line-height: 1;
  color: var(--ink-0);
  letter-spacing: -0.04em;
  font-variant-numeric: tabular-nums;
}
.score-big .pct{
  font-family: var(--font-mono);
  font-size: 14px;
  color: var(--ink-3);
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-top: 4px;
}
.score-big .grade{
  margin-top: 14px;
  display: inline-block;
  padding: 6px 16px;
  border-radius: 999px;
  color: #fff;
  font-weight: 700;
  font-size: 14px;
  font-family: var(--font-mono);
  letter-spacing: 0.04em;
}

.score-meta h2{
  font-family: var(--font-display);
  font-size: 22px;
  margin-bottom: 6px;
  color: var(--ink-0);
  font-weight: 600;
}
.score-meta .label{
  color: var(--ink-3);
  font-size: 13px;
  margin-bottom: 18px;
  font-family: var(--font-mono);
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.bucket-grid{
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin-top: 16px;
}
.bucket{
  padding: 16px 14px;
  border-radius: var(--r-md);
  text-align: center;
  font-size: 13px;
  font-family: var(--font-mono);
  border: 1px solid transparent;
}
.bucket b{
  display: block;
  font-size: 26px;
  font-weight: 700;
  font-family: var(--font-display);
  margin-bottom: 4px;
  font-variant-numeric: tabular-nums;
  letter-spacing: -0.01em;
}
.bucket.ai-ready{ background: var(--brand-wash); color: var(--brand-ink); border-color: color-mix(in oklab, var(--brand) 25%, transparent); }
.bucket.needs-work{ background: var(--warn-wash); color: #7A5B00; border-color: color-mix(in oklab, var(--warn) 30%, transparent); }
.bucket.invisible{ background: var(--crit-wash); color: #922; border-color: color-mix(in oklab, var(--crit) 25%, transparent); }

.partial{
  margin: 24px 0;
  padding: 14px 18px;
  background: var(--warn-wash);
  border-left: 3px solid var(--warn);
  border-radius: var(--r-md);
  font-size: 13px;
  color: var(--ink-1);
}
.partial strong{ color: var(--ink-0); }

section.audit-section{ margin-top: 48px; }
section.audit-section > h2{
  font-family: var(--font-display);
  font-size: 24px;
  margin-bottom: 18px;
  color: var(--ink-0);
  font-weight: 600;
}

.issue-list{
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: var(--r-lg);
  overflow: hidden;
}
.issue-row{
  display: grid;
  grid-template-columns: 64px 1fr;
  padding: 14px 20px;
  border-bottom: 1px solid var(--border);
  align-items: center;
  font-size: 14px;
  transition: background var(--transition);
}
.issue-row:hover{ background: var(--bg-sunk); }
.issue-row:last-child{ border-bottom: 0; }
.issue-count{
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 18px;
  color: var(--brand-deep);
  font-variant-numeric: tabular-nums;
}
.issue-text{ color: var(--ink-1); }

.product-card{
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: var(--r-md);
  padding: 18px 22px;
  margin-bottom: 12px;
  transition: transform var(--transition), box-shadow var(--transition), border-color var(--transition);
}
.product-card:hover{
  transform: translateY(-1px);
  border-color: var(--border-strong);
  box-shadow: var(--shadow-sm);
}
.product-card h3{
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 6px;
  color: var(--ink-0);
}
.product-card .pct{
  display: inline-block;
  padding: 3px 10px;
  border-radius: var(--r-sm);
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 10px;
  font-family: var(--font-mono);
}
.product-card .breakdown{
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--ink-2);
}
.product-card .breakdown span{
  padding: 3px 10px;
  background: var(--bg-sunk);
  border: 1px solid var(--border);
  border-radius: var(--r-sm);
  font-family: var(--font-mono);
}

@media (max-width: 640px){
  .score-card{ grid-template-columns: 1fr; text-align: center; padding: 24px; }
  .bucket-grid{ grid-template-columns: 1fr; }
}`;
}

export function renderAudit(audit: StoreAudit): string {
  const name = shopDisplayName(audit.shop);
  const grade = gradeFromScore(audit.averageScore);
  const title = `${name} AI Catalog Score: ${audit.averageScore}/100 (${grade.letter}) | AI Catalog Score`;
  const desc = `Free AI-readiness audit of ${name}'s Shopify catalog. ${audit.productCount} products scanned. ${audit.aiReady} AI-ready, ${audit.needsWork} need work, ${audit.invisible} effectively invisible to AI shopping agents.`;
  const canonical = `https://aicatalogscore.com/audit/${encodeURIComponent(audit.shop)}`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'AnalysisNewsArticle',
    headline: title,
    description: desc,
    url: canonical,
    datePublished: audit.fetchedAt,
    publisher: {
      '@type': 'Organization',
      name: 'AI Catalog Score',
      url: 'https://aicatalogscore.com',
    },
    about: {
      '@type': 'Organization',
      name,
      url: `https://${audit.shop}`,
    },
  };

  return `<!doctype html>
<html lang="en">
<head>
${shellHead(title, desc, canonical, { jsonLd })}
<style>${auditPageStyles()}</style>
</head>
<body>
${shellHeader(audit.shop)}

<main class="container-medium">
  <section class="audit-hero reveal">
    <h1>${esc(name)} AI Catalog Score</h1>
    <p class="sub">How well ${esc(name)}'s ${audit.productCount} products would be recommended by ChatGPT, Claude, Perplexity, Gemini, Mistral, and DeepSeek.</p>
  </section>

  <div class="score-card reveal">
    <div class="score-big">
      <div class="num"><span class="count-up">${audit.averageScore}</span></div>
      <div class="pct">/ 100</div>
      <div class="grade" style="background:${grade.color}">${grade.letter} · ${esc(grade.label)}</div>
    </div>
    <div class="score-meta">
      <h2>${audit.productCount} products audited</h2>
      <p class="label">Snapshot ${new Date(audit.fetchedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
      <div class="bucket-grid">
        <div class="bucket ai-ready"><b>${audit.aiReady}</b>AI-ready (≥80)</div>
        <div class="bucket needs-work"><b>${audit.needsWork}</b>Need work (50-79)</div>
        <div class="bucket invisible"><b>${audit.invisible}</b>Invisible (&lt;50)</div>
      </div>
    </div>
  </div>

  <div class="partial reveal">
    <strong>Partial audit.</strong> Public scan covers 61 of 100 signals. Install the Shopify app to audit metafields, SEO meta, image alt text, variant barcodes, and inventory (the remaining 39 pts).
  </div>

  ${audit.topIssues.length > 0 ? `
  <section class="audit-section reveal">
    <h2>Top issues across the catalog</h2>
    <div class="issue-list">
      ${audit.topIssues.map(i => `
        <div class="issue-row">
          <div class="issue-count">${i.count}×</div>
          <div class="issue-text">${esc(i.issue)}</div>
        </div>
      `).join('')}
    </div>
  </section>` : ''}

  ${audit.worstProducts.length > 0 ? `
  <section class="audit-section reveal">
    <h2>Lowest-scoring products</h2>
    ${audit.worstProducts.map(p => renderProductCard(p)).join('')}
  </section>` : ''}

  <div class="cta-section reveal">
    <h2>Fix every issue in one click</h2>
    <p>Install the free Shopify app and run Maximize to AI-optimize your full catalog. Score Guarantee: +10 points in 30 days or full refund.</p>
    <a href="https://apps.shopify.com/ai-catalog-score?utm_source=audit&utm_shop=${encodeURIComponent(audit.shop)}" class="btn btn-primary">Install free on Shopify <span class="btn-arrow">→</span></a>
    <a href="/audit" class="btn btn-dark-outline">Audit another store</a>
    <div class="small">Free plan covers 50 SKUs · No credit card required</div>
  </div>
</main>

${shellFooter()}
</body>
</html>`;
}

function renderProductCard(p: ProductAudit): string {
  const grade = gradeFromScore(p.scorePct);
  return `<div class="product-card">
    <h3>${esc(p.title)}</h3>
    <div class="pct" style="background:${grade.color}">${p.scorePct}/100 · ${grade.letter}</div>
    <div class="breakdown">
      <span>Title ${p.scoreTitle}/15</span>
      <span>Desc ${p.scoreDesc}/20</span>
      <span>Images ${p.scoreImages}/8</span>
      <span>Variants ${p.scoreVariants}/8</span>
      <span>Category ${p.scoreCategory}/10</span>
    </div>
  </div>`;
}

function formStyles(): string {
  return `.form-hero{ padding: 56px 0 24px; text-align: center; }
.form-hero h1{ font-size: clamp(32px, 4.4vw, 44px); margin-bottom: 14px; }
.form-hero .sub{
  font-size: 17px;
  color: var(--ink-2);
  max-width: 580px;
  line-height: 1.55;
  margin: 0 auto;
}

.audit-form-card{
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  padding: 36px;
  max-width: 580px;
  margin: 32px auto 0;
  box-shadow: var(--shadow-sm);
}
.audit-form-card form{ display: flex; flex-direction: column; gap: 14px; }
.audit-form-card label{
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 600;
  color: var(--ink-3);
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.audit-form-card input{
  padding: 14px 16px;
  border: 1px solid var(--border-strong);
  border-radius: var(--r-md);
  font-size: 16px;
  font-family: var(--font-body);
  width: 100%;
  background: var(--bg);
  color: var(--ink-0);
  transition: border-color var(--transition), box-shadow var(--transition);
}
.audit-form-card input:focus{
  outline: none;
  border-color: var(--brand-deep);
  box-shadow: 0 0 0 3px color-mix(in oklab, var(--brand) 18%, transparent);
}
.audit-form-card button{
  padding: 14px 24px;
  background: var(--brand);
  color: var(--brand-ink);
  border: 1px solid var(--brand-deep);
  border-radius: var(--r-md);
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--font-body);
  transition: all var(--transition);
  box-shadow: 0 1px 0 rgba(0,0,0,.04), inset 0 1px 0 rgba(255,255,255,.4), 0 4px 16px rgba(0,208,132,.25);
}
.audit-form-card button:hover{
  background: var(--brand-deep);
  color: #fff;
  transform: translateY(-1px);
  box-shadow: 0 1px 0 rgba(0,0,0,.04), inset 0 1px 0 rgba(255,255,255,.2), 0 10px 32px rgba(0,208,132,.45);
}
.audit-form-card .error{
  padding: 12px 14px;
  background: var(--crit-wash);
  color: #922;
  border-radius: var(--r-sm);
  font-size: 14px;
  margin-bottom: 4px;
}

.examples{
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid var(--border);
  font-size: 13px;
  color: var(--ink-3);
  text-align: center;
}
.examples a{
  color: var(--brand-deep);
  font-family: var(--font-mono);
  text-decoration: none;
  margin: 0 6px;
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: var(--r-sm);
  display: inline-block;
  transition: all var(--transition);
}
.examples a:hover{
  background: var(--brand-wash);
  border-color: color-mix(in oklab, var(--brand) 30%, transparent);
}`;
}

export function renderForm(prefilled?: string, error?: string): string {
  const title = 'Free AI Catalog Audit on Any Shopify Store';
  const desc = 'Get a free AI-readiness score for any Shopify store. See how AI shopping agents like ChatGPT, Claude, and Gemini discover your products.';
  const canonical = 'https://aicatalogscore.com/audit';

  return `<!doctype html>
<html lang="en">
<head>
${shellHead(title, desc, canonical)}
<style>${formStyles()}</style>
</head>
<body>
${shellHeader()}

<main class="container-medium">
  <section class="form-hero reveal">
    <h1>Free AI Catalog Audit</h1>
    <p class="sub">Enter any Shopify store URL to see its AI-readiness score. We scan the public catalog and grade how AI shopping agents (ChatGPT, Claude, Gemini, Perplexity, Mistral, DeepSeek) discover its products.</p>
  </section>

  <div class="audit-form-card reveal">
    ${error ? `<div class="error">${esc(error)}</div>` : ''}
    <form method="GET" action="/audit">
      <label for="store">Shopify store URL</label>
      <input type="text" name="store" id="store" placeholder="example.myshopify.com or example.com" value="${prefilled ? esc(prefilled) : ''}" autofocus required>
      <button type="submit">Run audit</button>
    </form>

    <div class="examples">
      Try a famous one:
      <a href="/audit/allbirds.com">allbirds</a>
      <a href="/audit/burtsbeesbaby.com">burt's bees baby</a>
      <a href="/audit/rothys.com">rothy's</a>
    </div>
  </div>
</main>

${shellFooter()}
</body>
</html>`;
}

function errorStyles(): string {
  return `.error-hero{
  max-width: 580px;
  margin: 64px auto 0;
  padding: 40px 32px;
  background: var(--bg-raised);
  border: 1px solid var(--border);
  border-radius: var(--r-xl);
  text-align: center;
  box-shadow: var(--shadow-sm);
}
.error-hero h1{
  font-family: var(--font-display);
  font-size: 26px;
  margin-bottom: 14px;
  color: var(--ink-0);
}
.error-hero p{
  color: var(--ink-2);
  margin-bottom: 20px;
  font-size: 15px;
}
.error-hero .error-box{
  padding: 14px 16px;
  background: var(--crit-wash);
  color: #922;
  border-radius: var(--r-md);
  font-size: 14px;
  margin: 20px 0;
  text-align: left;
  border-left: 3px solid var(--crit);
}
.error-hero .actions{ margin-top: 24px; display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }`;
}

export function renderError(shop: string, message: string): string {
  const title = `Audit failed for ${shop}`;
  const canonical = `https://aicatalogscore.com/audit`;
  return `<!doctype html>
<html lang="en">
<head>
${shellHead(title, 'Audit failed', canonical, { noindex: true })}
<style>${errorStyles()}</style>
</head>
<body>
${shellHeader()}

<main class="container-medium">
  <div class="error-hero">
    <h1>Couldn't audit ${esc(shop)}</h1>
    <div class="error-box">${esc(message)}</div>
    <p>The store may have its public products feed disabled, or the URL may not be a Shopify store.</p>
    <div class="actions">
      <a href="/audit" class="btn btn-primary">Try another store</a>
      <a href="/" class="btn btn-ghost">Back to homepage</a>
    </div>
  </div>
</main>

${shellFooter()}
</body>
</html>`;
}
