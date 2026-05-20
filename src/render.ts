/**
 * HTML renderer for the public audit page.
 *
 * Returns a single self-contained HTML string per shop — no client JS,
 * just inlined CSS, semantic markup, structured data, and OG cards.
 * Designed to be SEO-indexable so the 100k+ shop pages drive organic
 * traffic over time (cf. GROWTH_STRATEGY.md Priority 1).
 */

import type { StoreAudit, ProductAudit } from './audit';
import { gradeFromScore } from './audit';

const BRAND_GREEN = '#00a86a';
const BRAND_DARK = '#0e1b2c';

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function shopDisplayName(shop: string): string {
  // e.g. "allbirds.myshopify.com" -> "Allbirds"
  const base = shop.replace(/\.myshopify\.com$/i, '').replace(/-/g, ' ');
  return base
    .split(' ')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export function renderAudit(audit: StoreAudit): string {
  const name = shopDisplayName(audit.shop);
  const grade = gradeFromScore(audit.averageScore);
  const title = `${name} AI Catalog Score: ${audit.averageScore}/100 (${grade.letter}) | AI Catalog Score`;
  const desc = `Free AI-readiness audit of ${name}'s Shopify catalog. ${audit.productCount} products scanned — ${audit.aiReady} AI-ready, ${audit.needsWork} need work, ${audit.invisible} effectively invisible to AI shopping agents.`;
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
<meta charset="utf-8">
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
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="icon" type="image/png" href="/logo-acs-1200-light.png">
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.55;color:${BRAND_DARK};background:#fafaf7}
.container{max-width:980px;margin:0 auto;padding:32px 20px}
header{padding:16px 0;border-bottom:1px solid #e6e3da;background:#fff}
header .container{padding:12px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.logo{font-weight:700;font-size:18px;text-decoration:none;color:${BRAND_DARK}}
.logo span{color:${BRAND_GREEN}}
.cta-top{padding:10px 18px;background:${BRAND_GREEN};color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px}
.cta-top:hover{background:#008f5b}
.hero{padding:48px 0 32px}
.hero h1{font-size:32px;line-height:1.2;margin-bottom:8px;letter-spacing:-0.02em}
.hero .sub{color:#5a6577;font-size:16px;margin-bottom:32px}
.score-card{background:#fff;border:1px solid #e6e3da;border-radius:16px;padding:32px;display:grid;grid-template-columns:auto 1fr;gap:32px;align-items:center;box-shadow:0 1px 3px rgba(14,27,44,.04)}
.score-big{text-align:center}
.score-big .num{font-size:72px;font-weight:800;line-height:1;color:${BRAND_DARK};letter-spacing:-0.04em}
.score-big .pct{font-size:18px;color:#5a6577;font-weight:500}
.score-big .grade{margin-top:8px;display:inline-block;padding:6px 16px;border-radius:999px;color:#fff;font-weight:700;font-size:16px}
.score-meta h2{font-size:22px;margin-bottom:6px}
.score-meta .label{color:#5a6577;font-size:14px;margin-bottom:16px}
.bucket-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}
.bucket{padding:12px;border-radius:10px;text-align:center;font-size:13px}
.bucket b{display:block;font-size:24px;font-weight:700;margin-bottom:2px}
.bucket.ai-ready{background:#e3f7ec;color:#006f47}
.bucket.needs-work{background:#fff7d6;color:#7a5b00}
.bucket.invisible{background:#fde0e0;color:#922}
.partial{margin-top:16px;padding:12px 16px;background:#fff7e0;border-left:3px solid #f4b400;border-radius:6px;font-size:13px;color:#5a4500}
section{margin-top:40px}
section h2{font-size:22px;margin-bottom:16px;letter-spacing:-0.01em}
.issue-list{background:#fff;border:1px solid #e6e3da;border-radius:12px;overflow:hidden}
.issue-row{display:grid;grid-template-columns:60px 1fr;padding:14px 18px;border-bottom:1px solid #f0ede4;font-size:14px;align-items:center}
.issue-row:last-child{border-bottom:0}
.issue-count{font-weight:700;font-size:18px;color:${BRAND_GREEN}}
.issue-text{color:${BRAND_DARK}}
.product-card{background:#fff;border:1px solid #e6e3da;border-radius:12px;padding:16px 20px;margin-bottom:10px}
.product-card h3{font-size:15px;font-weight:600;margin-bottom:4px}
.product-card .pct{display:inline-block;padding:2px 10px;border-radius:6px;font-size:12px;font-weight:600;color:#fff;margin-bottom:8px}
.product-card .breakdown{display:flex;gap:10px;flex-wrap:wrap;font-size:12px;color:#5a6577}
.product-card .breakdown span{padding:2px 8px;background:#f5f3eb;border-radius:6px}
.cta-section{margin-top:48px;padding:32px;background:linear-gradient(135deg,${BRAND_DARK},#1a2c45);color:#fff;border-radius:16px;text-align:center}
.cta-section h2{font-size:24px;margin-bottom:8px;color:#fff}
.cta-section p{opacity:.85;margin-bottom:20px}
.cta-section a{display:inline-block;padding:14px 32px;background:${BRAND_GREEN};color:#fff;border-radius:10px;text-decoration:none;font-weight:600;font-size:16px}
.cta-section a:hover{background:#00bf78}
.cta-section .small{margin-top:12px;font-size:13px;opacity:.7}
footer{margin-top:60px;padding:24px 0;border-top:1px solid #e6e3da;text-align:center;color:#7a8295;font-size:13px}
footer a{color:#5a6577;text-decoration:none;margin:0 8px}
@media (max-width:640px){
  .score-card{grid-template-columns:1fr;text-align:center}
  .bucket-grid{grid-template-columns:1fr}
  .hero h1{font-size:24px}
}
</style>
</head>
<body>
<header>
  <div class="container">
    <a class="logo" href="/">AI Catalog<span> Score</span></a>
    <a class="cta-top" href="/?utm_source=audit&utm_shop=${encodeURIComponent(audit.shop)}">Install on Shopify →</a>
  </div>
</header>

<main class="container">
  <div class="hero">
    <h1>${esc(name)} — AI Catalog Score</h1>
    <p class="sub">How well ${esc(name)}'s ${audit.productCount} products would be recommended by ChatGPT, Claude, Perplexity, and other AI shopping agents.</p>

    <div class="score-card">
      <div class="score-big">
        <div class="num">${audit.averageScore}</div>
        <div class="pct">/100</div>
        <div class="grade" style="background:${grade.color}">${grade.letter} · ${esc(grade.label)}</div>
      </div>
      <div class="score-meta">
        <h2>${audit.productCount} products audited</h2>
        <p class="label">Snapshot taken ${new Date(audit.fetchedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
        <div class="bucket-grid">
          <div class="bucket ai-ready"><b>${audit.aiReady}</b>AI-ready (≥80)</div>
          <div class="bucket needs-work"><b>${audit.needsWork}</b>Need work (50-79)</div>
          <div class="bucket invisible"><b>${audit.invisible}</b>Invisible (&lt;50)</div>
        </div>
        <div class="partial">
          <strong>Partial audit.</strong> Public scan covers 61 of 100 signals. Install the Shopify app to audit metafields, SEO meta, image alt text, variant barcodes, and inventory (the remaining 39 pts).
        </div>
      </div>
    </div>
  </div>

  ${audit.topIssues.length > 0 ? `
  <section>
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
  <section>
    <h2>Lowest-scoring products</h2>
    ${audit.worstProducts.map(p => renderProductCard(p)).join('')}
  </section>` : ''}

  <div class="cta-section">
    <h2>Fix every issue in one click</h2>
    <p>Install the free Shopify app and run Maximize to AI-optimize your full catalog.<br>Score Guarantee: +10 points in 30 days or full refund.</p>
    <a href="https://apps.shopify.com/ai-catalog-score?utm_source=audit&utm_shop=${encodeURIComponent(audit.shop)}">Install free on Shopify →</a>
    <div class="small">Free plan covers 15 SKUs · No credit card required</div>
  </div>
</main>

<footer>
  <a href="/">Home</a> ·
  <a href="/audit">Audit another store</a> ·
  <a href="https://github.com/commerce-agentic/agentic-catalog-scanner">Open-source rubric</a> ·
  <a href="/privacy">Privacy</a>
</footer>
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

export function renderForm(prefilled?: string, error?: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Free AI Catalog Audit — Any Shopify Store</title>
<meta name="description" content="Get a free AI-readiness score for any Shopify store. See how AI shopping agents like ChatGPT and Claude would discover your products.">
<link rel="canonical" href="https://aicatalogscore.com/audit">
<meta property="og:title" content="Free AI Catalog Audit — Any Shopify Store">
<meta property="og:description" content="Get a free AI-readiness score for any Shopify store. See how AI shopping agents like ChatGPT and Claude would discover your products.">
<meta property="og:image" content="https://aicatalogscore.com/og-card.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="/logo-acs-1200-light.png">
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.55;color:${BRAND_DARK};background:#fafaf7;min-height:100vh;display:flex;flex-direction:column}
.container{max-width:680px;margin:0 auto;padding:32px 20px;width:100%}
header{padding:16px 0;border-bottom:1px solid #e6e3da;background:#fff}
header .container{padding:12px 20px;display:flex;align-items:center;justify-content:space-between}
.logo{font-weight:700;font-size:18px;text-decoration:none;color:${BRAND_DARK}}
.logo span{color:${BRAND_GREEN}}
main{flex:1;display:flex;align-items:center;justify-content:center;padding:40px 20px}
.card{background:#fff;border:1px solid #e6e3da;border-radius:16px;padding:40px;box-shadow:0 1px 3px rgba(14,27,44,.04);max-width:560px;width:100%}
h1{font-size:28px;line-height:1.2;margin-bottom:12px;letter-spacing:-0.02em}
.sub{color:#5a6577;font-size:16px;margin-bottom:28px}
form{display:flex;flex-direction:column;gap:12px}
label{font-size:13px;font-weight:600;color:${BRAND_DARK}}
input{padding:14px 16px;border:1px solid #d4d0c4;border-radius:10px;font-size:16px;font-family:inherit;width:100%}
input:focus{outline:none;border-color:${BRAND_GREEN};box-shadow:0 0 0 3px rgba(0,168,106,.15)}
button{padding:14px 24px;background:${BRAND_GREEN};color:#fff;border:0;border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;font-family:inherit}
button:hover{background:#008f5b}
.error{padding:12px;background:#fde0e0;color:#922;border-radius:8px;font-size:14px;margin-bottom:12px}
.examples{margin-top:24px;padding-top:24px;border-top:1px solid #e6e3da;font-size:13px;color:#5a6577}
.examples a{color:${BRAND_GREEN};text-decoration:none;margin-right:8px}
.examples a:hover{text-decoration:underline}
footer{padding:24px 0;border-top:1px solid #e6e3da;text-align:center;color:#7a8295;font-size:13px}
footer a{color:#5a6577;text-decoration:none;margin:0 8px}
</style>
</head>
<body>
<header>
  <div class="container">
    <a class="logo" href="/">AI Catalog<span> Score</span></a>
  </div>
</header>

<main>
  <div class="card">
    <h1>Free AI Catalog Audit</h1>
    <p class="sub">Enter any Shopify store URL to see its AI-readiness score. We scan the public catalog and grade how AI shopping agents (ChatGPT, Claude, Perplexity) would discover its products.</p>

    ${error ? `<div class="error">${esc(error)}</div>` : ''}

    <form method="GET" action="/audit">
      <label for="store">Shopify store URL</label>
      <input type="text" name="store" id="store" placeholder="example.myshopify.com or example.com" value="${prefilled ? esc(prefilled) : ''}" autofocus required>
      <button type="submit">Run audit</button>
    </form>

    <div class="examples">
      Try a famous one: <a href="/audit/allbirds.myshopify.com">allbirds</a> · <a href="/audit/gymshark.myshopify.com">gymshark</a> · <a href="/audit/kith.myshopify.com">kith</a>
    </div>
  </div>
</main>

<footer>
  <a href="/">Home</a> ·
  <a href="https://github.com/commerce-agentic">Open source</a> ·
  <a href="/privacy">Privacy</a>
</footer>
</body>
</html>`;
}

export function renderError(shop: string, message: string): string {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Audit failed — ${esc(shop)} | AI Catalog Score</title>
<meta name="robots" content="noindex">
<link rel="icon" type="image/png" href="/logo-acs-1200-light.png">
<style>
body{font-family:-apple-system,sans-serif;background:#fafaf7;color:${BRAND_DARK};min-height:100vh;display:flex;flex-direction:column;margin:0}
.container{max-width:560px;margin:0 auto;padding:60px 20px;text-align:center}
h1{font-size:24px;margin-bottom:12px}
p{color:#5a6577;margin-bottom:20px}
.error{padding:16px;background:#fde0e0;color:#922;border-radius:8px;font-size:14px;margin:20px 0;text-align:left}
a{display:inline-block;padding:12px 24px;background:${BRAND_GREEN};color:#fff;border-radius:10px;text-decoration:none;font-weight:600;margin:6px}
a.alt{background:transparent;color:${BRAND_DARK};border:1px solid #d4d0c4}
</style>
</head>
<body>
<div class="container">
  <h1>Couldn't audit ${esc(shop)}</h1>
  <div class="error">${esc(message)}</div>
  <p>The store may have its public products feed disabled, or the URL may not be a Shopify store.</p>
  <a href="/audit">Try another store</a>
  <a href="/" class="alt">Back to homepage</a>
</div>
</body>
</html>`;
}
