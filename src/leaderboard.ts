/**
 * Leaderboard renderer — consumes /api/public/insights from the Railway
 * app and produces SEO-indexable HTML pages.
 *
 *  /leaderboard/                  → landing page (both leaderboards)
 *  /leaderboard/ai-mentions       → top 100 brands cited by AI agents
 *  /leaderboard/catalog-score     → top stores by public audit score
 *                                   (computed from the top-mentioned brands —
 *                                   we audit each via /audit/{shop}.json)
 */

const BRAND_GREEN = '#00a86a';
const BRAND_DARK = '#0e1b2c';
const INSIGHTS_URL = 'https://shopify-app-production-7e58.up.railway.app/api/public/insights';

interface Insights {
  updatedAt: string;
  totals: { captures: number; agents: number; stores: number; corpusDays: number };
  capturesByAgent: Record<string, number>;
  capturesPerDay: Array<{ date: string; count: number }>;
  topBrands: Array<{ domain: string; mentions: number; agents: string[] }>;
  topQueries: Array<{ query: string; count: number }>;
}

const AGENT_LABEL: Record<string, string> = {
  openai: 'ChatGPT',
  claude: 'Claude',
  gemini: 'Gemini',
  perplexity: 'Perplexity',
  mistral: 'Mistral',
  deepseek: 'DeepSeek',
};

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function brandName(domain: string): string {
  const base = domain.replace(/\.myshopify\.com$/i, '').replace(/\.(com|co|net|io|store|shop|us|fr|de|uk)$/i, '');
  return base.split(/[-.]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

function shellStyles(): string {
  return `*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.55;color:${BRAND_DARK};background:#fafaf7}
.container{max-width:980px;margin:0 auto;padding:32px 20px}
header{padding:16px 0;border-bottom:1px solid #e6e3da;background:#fff}
header .container{padding:12px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px}
.logo{font-weight:700;font-size:18px;text-decoration:none;color:${BRAND_DARK}}
.logo span{color:${BRAND_GREEN}}
.nav-links{display:flex;gap:18px;font-size:14px;align-items:center}
.nav-links a{color:#5a6577;text-decoration:none}
.nav-links a:hover{color:${BRAND_GREEN}}
.cta-top{padding:10px 18px;background:${BRAND_GREEN};color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px}
.cta-top:hover{background:#008f5b}
.hero{padding:48px 0 24px}
.hero h1{font-size:36px;line-height:1.15;margin-bottom:12px;letter-spacing:-0.02em}
.hero .sub{font-size:18px;color:#5a6577;max-width:680px;margin-bottom:24px}
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:24px 0 32px}
.stat{background:#fff;border:1px solid #e6e3da;padding:16px;border-radius:10px;text-align:center}
.stat b{display:block;font-size:24px;font-weight:700;color:${BRAND_GREEN};margin-bottom:4px;letter-spacing:-0.01em}
.stat span{font-size:12px;color:#5a6577}
.leaderboard{background:#fff;border:1px solid #e6e3da;border-radius:12px;overflow:hidden}
.lb-head, .lb-row{display:grid;grid-template-columns:64px 1fr 110px 1fr;gap:16px;padding:12px 20px;align-items:center;font-size:14px}
.lb-head{background:#f5f3eb;font-weight:600;font-size:13px;color:#5a6577;text-transform:uppercase;letter-spacing:0.04em}
.lb-row{border-top:1px solid #f0ede4}
.lb-rank{font-weight:700;font-size:16px;color:${BRAND_DARK}}
.lb-rank.top1{color:#d4a017}
.lb-rank.top2{color:#7a7a7a}
.lb-rank.top3{color:#b87333}
.lb-brand a{color:${BRAND_DARK};text-decoration:none;font-weight:600}
.lb-brand a:hover{color:${BRAND_GREEN}}
.lb-brand .domain{display:block;font-size:12px;color:#9aa3b2;font-weight:400;margin-top:2px}
.lb-mentions{font-weight:600;color:${BRAND_GREEN}}
.lb-agents{display:flex;gap:4px;flex-wrap:wrap}
.agent-pill{display:inline-block;padding:2px 9px;background:#f5f3eb;color:#3a4555;border-radius:999px;font-size:11px;font-weight:500}
.audit-pct{display:inline-block;padding:2px 10px;border-radius:6px;font-size:12px;font-weight:600;color:#fff}
.audit-link{font-size:12px;color:#9aa3b2;text-decoration:none}
.audit-link:hover{color:${BRAND_GREEN};text-decoration:underline}
.partial{margin:24px 0;padding:14px 18px;background:#fff7e0;border-left:3px solid #f4b400;border-radius:6px;font-size:13px;color:#5a4500}
.cta-section{margin-top:48px;padding:32px;background:linear-gradient(135deg,${BRAND_DARK},#1a2c45);color:#fff;border-radius:16px;text-align:center}
.cta-section h2{color:#fff;font-size:22px;margin-bottom:8px}
.cta-section p{opacity:.85;margin-bottom:20px;color:#fff}
.cta-section a{display:inline-block;padding:14px 28px;background:${BRAND_GREEN};color:#fff;border-radius:10px;text-decoration:none;font-weight:600}
.cta-section a:hover{background:#00bf78}
.cta-section .small{margin-top:12px;font-size:13px;opacity:.7}
footer{margin-top:60px;padding:24px 0;border-top:1px solid #e6e3da;text-align:center;color:#7a8295;font-size:13px}
footer a{color:#5a6577;text-decoration:none;margin:0 8px}
.choice-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:20px;margin:32px 0}
.choice{background:#fff;border:1px solid #e6e3da;border-radius:14px;padding:28px;text-decoration:none;color:inherit;transition:transform .15s,box-shadow .15s;display:block}
.choice:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(14,27,44,.08)}
.choice h2{font-size:20px;margin-bottom:8px;color:${BRAND_DARK}}
.choice p{font-size:14px;color:#5a6577;margin-bottom:16px}
.choice .arrow{color:${BRAND_GREEN};font-weight:600;font-size:14px}
@media (max-width:640px){
  .stat-grid{grid-template-columns:repeat(2,1fr)}
  .lb-head, .lb-row{grid-template-columns:48px 1fr 100px;gap:10px;padding:10px 12px;font-size:13px}
  .lb-head .col-agents, .lb-row .lb-agents{display:none}
  .hero h1{font-size:28px}
  .choice-grid{grid-template-columns:1fr}
}`;
}

function shellHead(title: string, desc: string, canonical: string, ogPath = '/og-card.png'): string {
  return `<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${canonical}">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${canonical}">
<meta property="og:type" content="website">
<meta property="og:image" content="https://aicatalogscore.com${ogPath}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(desc)}">
<meta name="twitter:image" content="https://aicatalogscore.com${ogPath}">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="icon" type="image/png" href="/logo-acs-1200-light.png">`;
}

function shellHeader(): string {
  return `<header>
  <div class="container">
    <a class="logo" href="/">AI Catalog<span> Score</span></a>
    <div class="nav-links">
      <a href="/audit">Free audit</a>
      <a href="/leaderboard/">Leaderboard</a>
      <a href="/blog/">Blog</a>
      <a class="cta-top" href="/#install">Install on Shopify →</a>
    </div>
  </div>
</header>`;
}

function shellFooter(): string {
  return `<footer>
  <a href="/">Home</a> ·
  <a href="/audit">Free audit</a> ·
  <a href="/leaderboard/">Leaderboard</a> ·
  <a href="/blog/">Blog</a> ·
  <a href="https://github.com/commerce-agentic">Open source</a> ·
  <a href="/privacy.html">Privacy</a>
</footer>`;
}

export function renderLeaderboardIndex(insights: Insights | null): string {
  const totals = insights?.totals;
  const title = 'Shopify AI Visibility Leaderboard — Top brands recommended by ChatGPT, Claude, Perplexity';
  const desc = totals
    ? `Two leaderboards, calibrated on ${totals.captures.toLocaleString('en')} AI agent captures across ${totals.agents} agents and ${totals.stores}+ Shopify stores. Updated hourly.`
    : 'Two open leaderboards of Shopify AI visibility — most-mentioned by AI agents, and highest AI Catalog Score.';
  const canonical = 'https://aicatalogscore.com/leaderboard/';

  return `<!doctype html>
<html lang="en">
<head>
${shellHead(title, desc, canonical)}
<style>${shellStyles()}</style>
</head>
<body>
${shellHeader()}
<main class="container">
  <section class="hero">
    <h1>Shopify AI Visibility Leaderboards</h1>
    <p class="sub">Two open rankings of Shopify catalogs from the AI agent perspective. ${totals ? `Based on ${totals.captures.toLocaleString('en')} captures across ${totals.agents} agents.` : ''}</p>
    ${totals ? `
    <div class="stat-grid">
      <div class="stat"><b>${totals.captures.toLocaleString('en')}</b><span>captures</span></div>
      <div class="stat"><b>${totals.agents}</b><span>AI agents</span></div>
      <div class="stat"><b>${totals.stores.toLocaleString('en')}</b><span>stores</span></div>
      <div class="stat"><b>${totals.corpusDays}</b><span>days of data</span></div>
    </div>` : ''}
  </section>

  <section class="choice-grid">
    <a class="choice" href="/leaderboard/ai-mentions">
      <h2>Most-Mentioned by AI</h2>
      <p>The 100 brands AI shopping agents (ChatGPT, Claude, Perplexity, Gemini, Mistral, DeepSeek) recommend most across thousands of shopping queries.</p>
      <span class="arrow">View ranking →</span>
    </a>

    <a class="choice" href="/leaderboard/catalog-score">
      <h2>Highest AI Catalog Score</h2>
      <p>The top Shopify stores by AI-readiness score — title, description, images, variants, category, all weighted. Audited from public catalog data, no install required.</p>
      <span class="arrow">View ranking →</span>
    </a>
  </section>

  <div class="cta-section">
    <h2>See where your store ranks</h2>
    <p>Free public audit of any Shopify store. No install required.</p>
    <a href="/audit">Run a free audit →</a>
    <div class="small">Methodology open at github.com/commerce-agentic</div>
  </div>
</main>
${shellFooter()}
</body>
</html>`;
}

export function renderAiMentionsLeaderboard(insights: Insights): string {
  const top = insights.topBrands.slice(0, 100);
  const title = 'Top 100 Brands Recommended by AI Shopping Agents — ChatGPT, Claude, Perplexity';
  const desc = `The 100 brands AI agents recommend most — ${insights.topBrands[0]?.domain ?? ''} leads with ${insights.topBrands[0]?.mentions ?? 0} mentions. Calibrated on ${insights.totals.captures.toLocaleString('en')} captures across ${insights.totals.agents} agents.`;
  const canonical = 'https://aicatalogscore.com/leaderboard/ai-mentions';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Top 100 Brands Recommended by AI Shopping Agents',
    description: desc,
    url: canonical,
    numberOfItems: top.length,
    itemListElement: top.slice(0, 25).map((b, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: brandName(b.domain),
      url: `https://${b.domain}`,
    })),
  };

  return `<!doctype html>
<html lang="en">
<head>
${shellHead(title, desc, canonical)}
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<style>${shellStyles()}</style>
</head>
<body>
${shellHeader()}
<main class="container">
  <section class="hero">
    <h1>Top 100 Brands Recommended by AI</h1>
    <p class="sub">Brands cited most often when shoppers ask ChatGPT, Claude, Perplexity, Gemini, Mistral, or DeepSeek "what should I buy?" Updated hourly from the open captures dataset.</p>
    <div class="stat-grid">
      <div class="stat"><b>${insights.totals.captures.toLocaleString('en')}</b><span>captures analyzed</span></div>
      <div class="stat"><b>${insights.topBrands.length.toLocaleString('en')}</b><span>brands tracked</span></div>
      <div class="stat"><b>${insights.totals.agents}</b><span>AI agents</span></div>
      <div class="stat"><b>${insights.totals.corpusDays}</b><span>days of data</span></div>
    </div>
  </section>

  <div class="partial">
    Mentions reflect distinct AI agent capture events over the last 90 days. Methodology and raw dataset open at <a href="https://github.com/commerce-agentic/ai-visibility-metrics">commerce-agentic/ai-visibility-metrics</a> (MIT).
  </div>

  <section class="leaderboard">
    <div class="lb-head">
      <div>#</div>
      <div>Brand</div>
      <div>Mentions</div>
      <div class="col-agents">Cited by</div>
    </div>
    ${top.map((b, i) => {
      const rank = i + 1;
      const rankClass = rank === 1 ? 'top1' : rank === 2 ? 'top2' : rank === 3 ? 'top3' : '';
      const agentPills = b.agents.map(a => `<span class="agent-pill">${esc(AGENT_LABEL[a] ?? a)}</span>`).join('');
      return `<div class="lb-row">
        <div class="lb-rank ${rankClass}">${rank}</div>
        <div class="lb-brand"><a href="/audit/${encodeURIComponent(b.domain)}">${esc(brandName(b.domain))}</a><span class="domain">${esc(b.domain)}</span></div>
        <div class="lb-mentions">${b.mentions.toLocaleString('en')}</div>
        <div class="lb-agents">${agentPills}</div>
      </div>`;
    }).join('')}
  </section>

  <div class="cta-section">
    <h2>How does your store compare?</h2>
    <p>Free audit of any Shopify catalog. See where you'd rank.</p>
    <a href="/audit">Run a free audit →</a>
    <div class="small">Score Guarantee: +10 pts in 30 days or refund.</div>
  </div>
</main>
${shellFooter()}
</body>
</html>`;
}

export interface CatalogScoreEntry {
  domain: string;
  score: number;
  productCount: number;
  topIssue?: string;
}

export function renderCatalogScoreLeaderboard(
  entries: CatalogScoreEntry[],
  meta: { totalScanned: number; auditedAt: string },
): string {
  const top = entries.slice(0, 100);
  const title = 'Top 100 Shopify Stores by AI Catalog Score — open methodology, public audit';
  const desc = `The 100 highest-scoring Shopify catalogs by AI-readiness. ${meta.totalScanned} stores scanned; ${top[0]?.domain ?? '—'} leads at ${top[0]?.score ?? 0}/100. Open methodology, audit any store free.`;
  const canonical = 'https://aicatalogscore.com/leaderboard/catalog-score';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Top 100 Shopify Stores by AI Catalog Score',
    description: desc,
    url: canonical,
    numberOfItems: top.length,
    itemListElement: top.slice(0, 25).map((e, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: brandName(e.domain),
      url: `https://aicatalogscore.com/audit/${encodeURIComponent(e.domain)}`,
    })),
  };

  return `<!doctype html>
<html lang="en">
<head>
${shellHead(title, desc, canonical)}
<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
<style>${shellStyles()}</style>
</head>
<body>
${shellHeader()}
<main class="container">
  <section class="hero">
    <h1>Top 100 Shopify Stores by AI Catalog Score</h1>
    <p class="sub">Highest AI-readiness scores from our public audit engine — derived from the brands most cited by AI agents, audited from their public Shopify catalogs (no install required).</p>
    <div class="stat-grid">
      <div class="stat"><b>${meta.totalScanned.toLocaleString('en')}</b><span>stores scanned</span></div>
      <div class="stat"><b>${top.length}</b><span>top entries</span></div>
      <div class="stat"><b>${Math.round(top.reduce((s, e) => s + e.score, 0) / Math.max(1, top.length))}</b><span>top 100 avg</span></div>
      <div class="stat"><b>${new Date(meta.auditedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</b><span>last refresh</span></div>
    </div>
  </section>

  <div class="partial">
    Public audit covers 61 of 100 signals — install the app to score the remaining 39 (metafields, SEO meta, alt text, barcodes, inventory). Full methodology at <a href="https://github.com/commerce-agentic/agentic-catalog-scanner">commerce-agentic/agentic-catalog-scanner</a> (CC0).
  </div>

  <section class="leaderboard">
    <div class="lb-head">
      <div>#</div>
      <div>Brand</div>
      <div>Score</div>
      <div>Top issue</div>
    </div>
    ${top.map((e, i) => {
      const rank = i + 1;
      const rankClass = rank === 1 ? 'top1' : rank === 2 ? 'top2' : rank === 3 ? 'top3' : '';
      const color = e.score >= 80 ? '#00a86a' : e.score >= 60 ? '#92e8c0' : e.score >= 40 ? '#facc15' : '#fb923c';
      return `<div class="lb-row">
        <div class="lb-rank ${rankClass}">${rank}</div>
        <div class="lb-brand"><a href="/audit/${encodeURIComponent(e.domain)}">${esc(brandName(e.domain))}</a><span class="domain">${esc(e.domain)} · ${e.productCount} products</span></div>
        <div><span class="audit-pct" style="background:${color}">${e.score}/100</span></div>
        <div style="font-size:12px;color:#5a6577">${esc(e.topIssue ?? '—')}</div>
      </div>`;
    }).join('')}
  </section>

  <div class="cta-section">
    <h2>Want to make this list?</h2>
    <p>Install free, run Maximize, get on the leaderboard. Score Guarantee covers you.</p>
    <a href="/#install">Install on Shopify →</a>
    <div class="small">Free plan: 15 SKUs · Score Guarantee: +10 pts in 30 days or refund.</div>
  </div>
</main>
${shellFooter()}
</body>
</html>`;
}

export async function fetchInsights(): Promise<Insights | null> {
  try {
    const res = await fetch(INSIGHTS_URL, {
      headers: { 'Accept': 'application/json' },
      cf: { cacheTtl: 3600, cacheEverything: true },
    } as RequestInit);
    if (!res.ok) return null;
    return await res.json() as Insights;
  } catch {
    return null;
  }
}
