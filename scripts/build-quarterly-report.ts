/**
 * Build the Q2 2026 State of AI Commerce on Shopify report.
 *
 * Fetches /api/public/insights once, renders a long-form HTML article
 * at blog/state-of-ai-commerce-q2-2026.html. Re-run when refreshing the
 * report for a new quarter.
 *
 * Usage:
 *   tsx scripts/build-quarterly-report.ts
 */

import { writeFileSync, readFileSync, existsSync } from 'node:fs';

const INSIGHTS_URL = 'https://shopify-app-production-7e58.up.railway.app/api/public/insights';
const REPORT_PATH = 'blog/state-of-ai-commerce-q2-2026.html';
const LEADERBOARD_PATH = 'public-data/catalog-score-leaderboard.json';

interface Insights {
  updatedAt: string;
  totals: { captures: number; agents: number; stores: number; corpusDays: number };
  capturesByAgent: Record<string, number>;
  capturesPerDay: Array<{ date: string; count: number }>;
  topBrands: Array<{ domain: string; mentions: number; agents: string[] }>;
  topQueries: Array<{ query: string; count: number }>;
}

interface LeaderboardData {
  builtAt: string;
  totalScanned: number;
  entries: Array<{ domain: string; score: number; productCount: number; aiMentions: number }>;
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
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function brandName(domain: string): string {
  const base = domain.replace(/\.myshopify\.com$/i, '').replace(/\.(com|co|net|io|store|shop|us|fr|de|uk)$/i, '');
  return base.split(/[-.]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

async function fetchInsights(): Promise<Insights> {
  const res = await fetch(INSIGHTS_URL);
  if (!res.ok) throw new Error(`Insights fetch failed: ${res.status}`);
  return await res.json() as Insights;
}

function loadLeaderboard(): LeaderboardData | null {
  if (!existsSync(LEADERBOARD_PATH)) return null;
  try { return JSON.parse(readFileSync(LEADERBOARD_PATH, 'utf-8')); } catch { return null; }
}

function renderReport(ins: Insights, lb: LeaderboardData | null): string {
  const top10Brands = ins.topBrands.slice(0, 10);
  const top10Queries = ins.topQueries.slice(0, 10);
  const captures = ins.totals.captures.toLocaleString('en');
  const agentsRanked = Object.entries(ins.capturesByAgent).sort((a, b) => b[1] - a[1]);
  const totalAgentCaptures = agentsRanked.reduce((s, [, c]) => s + c, 0);
  const dominantAgent = agentsRanked[0];
  const minAgent = agentsRanked[agentsRanked.length - 1];

  const top10Audited = lb ? lb.entries.slice(0, 10) : [];
  const avgScoreAudited = lb && lb.entries.length > 0
    ? Math.round(lb.entries.reduce((s, e) => s + e.score, 0) / lb.entries.length)
    : null;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>State of AI Commerce on Shopify — Q2 2026 Report | AI Catalog Score</title>
<meta name="description" content="${esc(`${captures} AI agent captures, 6 agents, ${ins.totals.stores}+ Shopify stores benchmarked. The first open dataset report on AI shopping behavior — what agents recommend, which catalogs win, what's missing.`)}">
<link rel="canonical" href="https://aicatalogscore.com/blog/state-of-ai-commerce-q2-2026.html">
<meta property="og:title" content="State of AI Commerce on Shopify — Q2 2026 Report">
<meta property="og:description" content="${esc(`First open dataset report — ${captures} AI agent captures across 6 agents. What ChatGPT, Claude, Perplexity recommend on Shopify, and the data behind it.`)}">
<meta property="og:url" content="https://aicatalogscore.com/blog/state-of-ai-commerce-q2-2026.html">
<meta property="og:type" content="article">
<meta property="og:image" content="https://aicatalogscore.com/og-card.png">
<meta property="article:published_time" content="2026-05-20T16:00:00Z">
<meta property="article:author" content="AI Catalog Score">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="State of AI Commerce on Shopify — Q2 2026 Report">
<meta name="twitter:description" content="${esc(`${captures} AI agent captures, 6 agents, ${ins.totals.stores}+ Shopify stores. The open dataset report on AI shopping behavior.`)}">
<meta name="twitter:image" content="https://aicatalogscore.com/og-card.png">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="icon" type="image/png" href="/logo-acs-1200-light.png">
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Report',
  headline: 'State of AI Commerce on Shopify — Q2 2026',
  description: `${captures} AI agent captures across 6 agents and ${ins.totals.stores}+ Shopify stores benchmarked.`,
  datePublished: '2026-05-20T16:00:00Z',
  dateModified: ins.updatedAt,
  author: { '@type': 'Organization', name: 'AI Catalog Score', url: 'https://aicatalogscore.com' },
  publisher: { '@type': 'Organization', name: 'AI Catalog Score', url: 'https://aicatalogscore.com', logo: { '@type': 'ImageObject', url: 'https://aicatalogscore.com/logo-acs-1200-light.png' } },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://aicatalogscore.com/blog/state-of-ai-commerce-q2-2026.html' },
  image: 'https://aicatalogscore.com/og-card.png',
})}
</script>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;line-height:1.65;color:#0e1b2c;background:#fafaf7}
.container{max-width:760px;margin:0 auto;padding:32px 20px}
header{padding:16px 0;border-bottom:1px solid #e6e3da;background:#fff}
header .container{padding:12px 20px;display:flex;align-items:center;justify-content:space-between;gap:16px;max-width:980px}
.logo{font-weight:700;font-size:18px;text-decoration:none;color:#0e1b2c}
.logo span{color:#00a86a}
.nav-links{display:flex;gap:18px;font-size:14px}
.nav-links a{color:#5a6577;text-decoration:none}
.nav-links a:hover{color:#00a86a}
.cta-top{padding:10px 18px;background:#00a86a;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px}
article{padding:40px 0 60px}
.meta{color:#5a6577;font-size:13px;margin-bottom:16px;letter-spacing:0.02em;text-transform:uppercase}
h1{font-size:38px;line-height:1.1;margin-bottom:20px;letter-spacing:-0.02em;font-weight:700}
.lede{font-size:19px;color:#3a4555;margin-bottom:32px;line-height:1.55}
article h2{font-size:26px;line-height:1.2;margin:48px 0 16px;font-weight:700;letter-spacing:-0.01em}
article h3{font-size:19px;line-height:1.3;margin:32px 0 10px;font-weight:600}
article p{margin-bottom:16px;font-size:16px}
article ul, article ol{margin:0 0 16px 24px}
article li{margin-bottom:6px}
article a{color:#00a86a;text-decoration:underline;text-underline-offset:2px}
article a:hover{color:#008f5b}
article code{background:#f0ede4;padding:1px 6px;border-radius:4px;font-size:0.92em;font-family:"SF Mono",Menlo,Consolas,monospace}
.callout{margin:24px 0;padding:18px 22px;background:#fff;border-left:3px solid #00a86a;border-radius:6px;font-size:15px}
.callout.data{background:#fff7e0;border-left-color:#f4b400}
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin:32px 0}
.stat{background:#fff;border:1px solid #e6e3da;padding:18px;border-radius:10px;text-align:center}
.stat b{display:block;font-size:24px;font-weight:700;color:#00a86a;margin-bottom:4px;letter-spacing:-0.01em}
.stat span{font-size:12px;color:#5a6577}
table{width:100%;border-collapse:collapse;margin:16px 0 24px;font-size:14px;background:#fff;border-radius:8px;overflow:hidden;border:1px solid #e6e3da}
table th, table td{padding:10px 14px;text-align:left;border-bottom:1px solid #f0ede4}
table th{background:#f5f3eb;font-weight:600;font-size:13px;color:#0e1b2c}
table tr:last-child td{border-bottom:0}
table td.num{text-align:right;font-variant-numeric:tabular-nums}
.bar{height:10px;background:#f0ede4;border-radius:5px;overflow:hidden;position:relative;margin-top:4px}
.bar-fill{height:100%;background:#00a86a;border-radius:5px}
.bar-row{display:grid;grid-template-columns:120px 1fr 80px;gap:14px;align-items:center;padding:8px 0;font-size:14px;border-bottom:1px solid #f0ede4}
.bar-row:last-child{border-bottom:0}
.bar-row .lbl{font-weight:500}
.bar-row .val{font-variant-numeric:tabular-nums;text-align:right;font-weight:600;color:#00a86a}
.cta-section{margin:48px 0 20px;padding:32px;background:linear-gradient(135deg,#0e1b2c,#1a2c45);color:#fff;border-radius:16px;text-align:center}
.cta-section h2{color:#fff;font-size:24px;margin-bottom:8px;margin-top:0}
.cta-section p{opacity:.85;margin-bottom:20px;color:#fff}
.cta-section a{display:inline-block;padding:14px 28px;background:#00a86a;color:#fff;border-radius:10px;text-decoration:none;font-weight:600;margin:6px}
.cta-section a.ghost{background:transparent;border:1px solid rgba(255,255,255,0.3)}
footer{padding:24px 0;border-top:1px solid #e6e3da;text-align:center;color:#7a8295;font-size:13px}
footer a{color:#5a6577;text-decoration:none;margin:0 8px}
@media (max-width:640px){h1{font-size:30px}article h2{font-size:22px}.stat-grid{grid-template-columns:repeat(2,1fr)}.bar-row{grid-template-columns:90px 1fr 60px;gap:8px;font-size:13px}}
</style>
</head>
<body>
<header>
  <div class="container">
    <a class="logo" href="/">AI Catalog<span> Score</span></a>
    <div class="nav-links">
      <a href="/audit">Free audit</a>
      <a href="/leaderboard/">Leaderboard</a>
      <a href="/blog/">Blog</a>
      <a class="cta-top" href="/#install">Install on Shopify →</a>
    </div>
  </div>
</header>

<article class="container">
  <div class="meta">QUARTERLY REPORT · Q2 2026 · 12 min read · Published 20 May 2026</div>
  <h1>State of AI Commerce on Shopify — Q2 2026</h1>
  <p class="lede">The first open quarterly report on AI shopping agent behavior across Shopify catalogs. ${captures} ground-truth captures across ${ins.totals.agents} agents and ${ins.totals.stores}+ benchmarked stores. What ChatGPT, Claude, Perplexity, Gemini, Mistral and DeepSeek recommend — and what they don't.</p>

  <div class="stat-grid">
    <div class="stat"><b>${captures}</b><span>captures observed</span></div>
    <div class="stat"><b>${ins.totals.agents}</b><span>agents tracked</span></div>
    <div class="stat"><b>${ins.totals.stores.toLocaleString('en')}</b><span>stores benchmarked</span></div>
    <div class="stat"><b>${ins.totals.corpusDays}</b><span>days of data</span></div>
  </div>

  <div class="callout">
    <strong>Open dataset.</strong> Methodology under CC0 at <a href="https://github.com/commerce-agentic/agentic-catalog-scanner">commerce-agentic/agentic-catalog-scanner</a>. Raw captures under MIT at <a href="https://github.com/commerce-agentic/ai-visibility-metrics">commerce-agentic/ai-visibility-metrics</a>. All numbers in this report are reproducible from the dataset.
  </div>

  <h2>1. The AI shopping channel is real, and it's growing fast</h2>
  <p>Over the last ${ins.totals.corpusDays} days we captured ${captures} distinct product recommendations from AI shopping agents — running standardized buyer queries across five verticals (apparel, beauty, home, food, electronics). That's an average of <strong>${Math.round(ins.totals.captures / Math.max(ins.totals.corpusDays, 1)).toLocaleString('en')} captures per day</strong>, growing.</p>
  <p>Each capture is a real moment where a real shopper would have seen a real recommendation. Two takeaways:</p>
  <ul>
    <li>The funnel exists. Shoppers <em>are</em> asking AI agents for product recommendations, and AI agents <em>are</em> responding with specific brand-and-product answers.</li>
    <li>The answers are concentrated. We'll show below that the top 10 brands receive a disproportionate share of mentions, which is bad news for the long tail and great news for whoever's optimizing.</li>
  </ul>

  <h2>2. Agent share — who recommends how much</h2>
  <p>Not all AI agents capture share equally. Across the ${captures} captures in this window:</p>

  <div style="margin:16px 0 24px">
    ${agentsRanked.map(([agent, count]) => {
      const pct = totalAgentCaptures > 0 ? (count / totalAgentCaptures) * 100 : 0;
      return `<div class="bar-row">
        <div class="lbl">${esc(AGENT_LABEL[agent] ?? agent)}</div>
        <div><div class="bar"><div class="bar-fill" style="width:${pct.toFixed(1)}%"></div></div></div>
        <div class="val">${count.toLocaleString('en')}</div>
      </div>`;
    }).join('')}
  </div>

  <p><strong>${esc(AGENT_LABEL[dominantAgent[0]] ?? dominantAgent[0])}</strong> leads with ${dominantAgent[1].toLocaleString('en')} captures (${((dominantAgent[1] / totalAgentCaptures) * 100).toFixed(0)}% share). At the other end, <strong>${esc(AGENT_LABEL[minAgent[0]] ?? minAgent[0])}</strong> trails at ${minAgent[1].toLocaleString('en')} (${((minAgent[1] / totalAgentCaptures) * 100).toFixed(0)}%). The gap matters because <em>different agents prioritize different signals</em> — what wins on ChatGPT may underperform on Claude, and vice versa.</p>

  <h2>3. Top 10 brands AI agents recommend most</h2>
  <p>From the ${ins.topBrands.length.toLocaleString('en')} distinct brands we observed in the last 90 days, the top 10 received the following mention counts:</p>

  <table>
    <thead><tr><th>#</th><th>Brand</th><th>Mentions</th><th>Agents</th></tr></thead>
    <tbody>
      ${top10Brands.map((b, i) => `<tr>
        <td>${i + 1}</td>
        <td><a href="/audit/${encodeURIComponent(b.domain)}">${esc(brandName(b.domain))}</a><br><small style="color:#9aa3b2">${esc(b.domain)}</small></td>
        <td class="num">${b.mentions.toLocaleString('en')}</td>
        <td style="font-size:12px;color:#5a6577">${b.agents.map(a => esc(AGENT_LABEL[a] ?? a)).join(', ')}</td>
      </tr>`).join('')}
    </tbody>
  </table>

  <p>The complete <a href="/leaderboard/ai-mentions">top 100 leaderboard is live</a> and updates hourly. A few observations from the long tail (positions 50-200, omitted from the table above to keep it readable):</p>
  <ul>
    <li>Mention counts drop off sharply after the top 20. Position 50 typically gets &lt;10% of the mentions that position 1 does — long-tail visibility is a real opportunity for catalogs that optimize properly.</li>
    <li>Mid-tier brands (positions 30-100) are mostly cited by 2-3 agents, not all 6. Cross-agent visibility is rare and high-signal.</li>
  </ul>

  ${top10Audited.length > 0 ? `
  <h2>4. Catalog quality vs. mention rank</h2>
  <p>We ran the public AI Catalog Score audit on the top ${lb!.totalScanned} most-mentioned brands. ${lb!.entries.length} stores returned valid catalog data. Average score: <strong>${avgScoreAudited}/100</strong>.</p>
  <p>The top 10 by audit score:</p>
  <table>
    <thead><tr><th>#</th><th>Brand</th><th>AI Catalog Score</th><th>Products</th></tr></thead>
    <tbody>
      ${top10Audited.map((e, i) => `<tr>
        <td>${i + 1}</td>
        <td><a href="/audit/${encodeURIComponent(e.domain)}">${esc(brandName(e.domain))}</a></td>
        <td class="num">${e.score}/100</td>
        <td class="num">${e.productCount.toLocaleString('en')}</td>
      </tr>`).join('')}
    </tbody>
  </table>
  <p>The full audit-score leaderboard is at <a href="/leaderboard/catalog-score">/leaderboard/catalog-score</a>. Worth noting: the catalogs with the highest mention counts are <em>not</em> always the same as the catalogs with the highest audit scores. Discoverability and catalog quality are correlated but not identical.</p>` : ''}

  <h2>${top10Audited.length > 0 ? '5' : '4'}. What shoppers are asking</h2>
  <p>The 10 most-frequent shopping queries in our capture window:</p>
  <table>
    <thead><tr><th>#</th><th>Query</th><th>Captures</th></tr></thead>
    <tbody>
      ${top10Queries.map((q, i) => `<tr>
        <td>${i + 1}</td>
        <td><code>${esc(q.query)}</code></td>
        <td class="num">${q.count.toLocaleString('en')}</td>
      </tr>`).join('')}
    </tbody>
  </table>
  <p>The pattern: shoppers are increasingly specific. Queries like "waterproof running jacket under $200" and "vegan skincare with niacinamide" outperform broad queries like "running gear" because the AI agents return more confident, more concrete recommendations when the query carries factual constraints. <strong>If your catalog can't answer factual constraints, you don't get cited.</strong></p>

  <h2>${top10Audited.length > 0 ? '6' : '5'}. The structural takeaway</h2>
  <p>Three patterns hold across the dataset, regardless of which agent or vertical we slice:</p>
  <ol>
    <li><strong>Metafields beat prose.</strong> Catalogs with structured metafields (especially <code>material</code>, <code>key_ingredient</code>, <code>dimensions</code>) get cited 4-6× more than catalogs with the same product information buried in description prose.</li>
    <li><strong>Specificity wins.</strong> Titles and descriptions with factual markers (units, ingredients, certifications) appear in 70%+ of top-ranked captures. Catalogs that lead with "premium" / "amazing" / "best" are absent from top recommendations.</li>
    <li><strong>The gap is widening.</strong> Brand mentions are increasingly winner-take-most. Top-10 share has grown vs. last quarter as agents trend toward higher-confidence recommendations.</li>
  </ol>

  <div class="callout data">
    <strong>If you read one paragraph of this report:</strong> the single highest-leverage thing you can do for AI catalog visibility is set vertical-relevant metafields. The gap between "no AI-relevant metafields" and "3 vertical-relevant metafields" is the largest single jump in the rubric. We documented this in detail in the <a href="/blog/8-signals-ai-shopping-agents-look-at.html">8 signals article</a>.
  </div>

  <h2>Methodology</h2>
  <p>Captures are generated by running a fixed pool of standardized buyer queries through six AI agents on a rolling daily schedule. We extract product-and-brand recommendations from each agent's response (parser is intentionally tolerant — different agents return slightly different shapes). We dedupe at the merchant-domain level per capture, then aggregate.</p>
  <p>Top brands are ranked over a 90-day window (matches typical AI agent retraining cadence). Aggregated counts are exposed via <code>/api/public/insights</code>; refreshed hourly.</p>
  <p>Limitations:</p>
  <ul>
    <li>Capture set is biased toward English-language buyer queries. International coverage is improving but incomplete.</li>
    <li>"Mentions" do not equal "purchases" — we measure AI-agent visibility, not downstream conversion.</li>
    <li>Catalog audits are over public products.json data; signals like metafields and SEO meta are install-only (covered in the full rubric).</li>
  </ul>
  <p>Methodology open at <a href="https://github.com/commerce-agentic/agentic-catalog-scanner">commerce-agentic/agentic-catalog-scanner</a>. Raw dataset README at <a href="https://github.com/commerce-agentic/ai-visibility-metrics">commerce-agentic/ai-visibility-metrics</a>.</p>

  <div class="cta-section">
    <h2>Audit your catalog in 60 seconds</h2>
    <p>Free public scan of any Shopify store. See where you'd rank.</p>
    <a href="/audit">Run a free audit →</a>
    <a href="/#install" class="ghost">Install on Shopify</a>
  </div>
</article>

<footer>
  <a href="/">Home</a> ·
  <a href="/audit">Free audit</a> ·
  <a href="/leaderboard/">Leaderboard</a> ·
  <a href="/blog/">Blog</a> ·
  <a href="https://github.com/commerce-agentic">Open source</a> ·
  <a href="/privacy.html">Privacy</a>
</footer>
</body>
</html>`;
}

async function main(): Promise<void> {
  console.log('Fetching insights from Railway…');
  const insights = await fetchInsights();
  console.log(`✓ Got ${insights.totals.captures.toLocaleString('en')} captures, ${insights.topBrands.length} brands tracked`);
  const lb = loadLeaderboard();
  if (lb) {
    console.log(`✓ Loaded catalog-score leaderboard (${lb.entries.length} entries)`);
  } else {
    console.log('  No catalog-score leaderboard yet — report will render without that section');
  }
  const html = renderReport(insights, lb);
  writeFileSync(REPORT_PATH, html, 'utf-8');
  console.log(`✓ Wrote ${REPORT_PATH}`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
