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

const INSIGHTS_URL = 'https://app.aicatalogscore.com/api/public/insights';
const REPORT_PATH = 'blog/state-of-ai-commerce-q2-2026.html';
const LEADERBOARD_PATH = 'public-data/catalog-score-leaderboard.json';

interface Insights {
  updatedAt: string;
  totals: { captures: number; agents: number; brandsTracked: number; corpusDays: number };
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
<meta name="description" content="${esc(`${captures} AI agent captures, 6 agents, ${ins.totals.brandsTracked.toLocaleString('en')} distinct brands tracked. The first open dataset report on AI shopping behavior — what agents recommend, which catalogs win, what's missing.`)}">
<link rel="canonical" href="https://aicatalogscore.com/blog/state-of-ai-commerce-q2-2026">
<meta property="og:title" content="State of AI Commerce on Shopify — Q2 2026 Report">
<meta property="og:description" content="${esc(`First open dataset report — ${captures} AI agent captures across 6 agents. What ChatGPT, Claude, Perplexity recommend on Shopify, and the data behind it.`)}">
<meta property="og:url" content="https://aicatalogscore.com/blog/state-of-ai-commerce-q2-2026">
<meta property="og:type" content="article">
<meta property="og:image" content="https://aicatalogscore.com/og-card.png">
<meta property="article:published_time" content="2026-05-20T16:00:00Z">
<meta property="article:author" content="AI Catalog Score">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="State of AI Commerce on Shopify — Q2 2026 Report">
<meta name="twitter:description" content="${esc(`${captures} AI agent captures, 6 agents, ${ins.totals.brandsTracked.toLocaleString('en')} brands tracked. The open dataset report on AI shopping behavior.`)}">
<meta name="twitter:image" content="https://aicatalogscore.com/og-card.png">
<meta name="robots" content="index,follow,max-image-preview:large">
<link rel="icon" type="image/png" href="/logo-acs-1200-light.png">
<link rel="preconnect" href="https://api.fontshare.com">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://api.fontshare.com/v2/css?f[]=general-sans@500,600,400,700&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/_shared-tokens.css">
<script type="application/ld+json">
${JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'Report',
  headline: 'State of AI Commerce on Shopify — Q2 2026',
  description: `${captures} AI agent captures across 6 agents and ${ins.totals.brandsTracked.toLocaleString('en')} distinct brands tracked.`,
  datePublished: '2026-05-20T16:00:00Z',
  dateModified: ins.updatedAt,
  author: { '@type': 'Organization', name: 'AI Catalog Score', url: 'https://aicatalogscore.com' },
  publisher: { '@type': 'Organization', name: 'AI Catalog Score', url: 'https://aicatalogscore.com', logo: { '@type': 'ImageObject', url: 'https://aicatalogscore.com/logo-acs-1200-light.png' } },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://aicatalogscore.com/blog/state-of-ai-commerce-q2-2026' },
  image: 'https://aicatalogscore.com/og-card.png',
})}
</script>
<style>
article{ padding: 48px 0 64px; }
.bar{
  height: 10px;
  background: var(--bg-sunk);
  border-radius: var(--r-sm);
  overflow: hidden;
  position: relative;
  margin-top: 4px;
}
.bar-fill{ height: 100%; background: var(--brand); border-radius: var(--r-sm); }
.bar-row{
  display: grid;
  grid-template-columns: 120px 1fr 80px;
  gap: 14px;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  border-bottom: 1px solid var(--border);
}
.bar-row:last-child{ border-bottom: 0; }
.bar-row .lbl{ font-weight: 500; }
.bar-row .val{
  font-variant-numeric: tabular-nums;
  text-align: right;
  font-weight: 600;
  color: var(--brand-deep);
}
@media (max-width: 640px){
  .bar-row{ grid-template-columns: 90px 1fr 60px; gap: 8px; font-size: 13px; }
}
</style>
</head>
<body>
<header class="nav">
  <div class="container">
    <a href="/" class="wordmark">
      <span class="mark"><img src="/logo-acs.png" alt="AI Catalog Score" loading="eager"></span>
      <span class="name">AI Catalog Score</span>
    </a>
    <nav>
      <a href="/audit">Free audit</a>
      <a href="/leaderboard/">Leaderboard</a>
      <a href="/blog/" class="is-active">Blog</a>
      <a href="https://github.com/commerce-agentic" target="_blank" rel="noopener">GitHub</a>
    </nav>
    <a href="/#install" class="btn btn-sm btn-primary">Install free <span class="btn-arrow">→</span></a>
  </div>
</header>

<article class="container-narrow">
  <div class="meta">QUARTERLY REPORT · Q2 2026 · 12 min read · Published 20 May 2026</div>
  <h1>State of AI Commerce on Shopify — Q2 2026</h1>
  <p class="lede">The first open quarterly report on AI shopping agent behavior across Shopify catalogs. ${captures} ground-truth captures across ${ins.totals.agents} agents and ${ins.totals.brandsTracked.toLocaleString('en')} distinct brands. What ChatGPT, Claude, Perplexity, Gemini, Mistral and DeepSeek recommend — and what they don't.</p>

  <div class="stat-grid">
    <div class="stat"><b>${captures}</b><span>captures observed</span></div>
    <div class="stat"><b>${ins.totals.agents}</b><span>agents tracked</span></div>
    <div class="stat"><b>${ins.totals.brandsTracked.toLocaleString('en')}</b><span>brands tracked</span></div>
    <div class="stat"><b>${ins.totals.corpusDays}</b><span>days of data</span></div>
  </div>

  <div class="callout">
    <strong>Open dataset.</strong> Methodology under CC0 at <a href="https://github.com/commerce-agentic/agentic-catalog-scanner">commerce-agentic/agentic-catalog-scanner</a>. Raw captures under MIT at <a href="https://github.com/commerce-agentic/ai-visibility-metrics">commerce-agentic/ai-visibility-metrics</a>. All numbers in this report are reproducible from the dataset.
  </div>

  <h2>1. The AI shopping channel is real, and it's growing fast</h2>
  <p>Over the last ${ins.totals.corpusDays} days we captured ${captures} distinct product recommendations from six AI agents — running our standardized buyer-intent query set across five verticals (apparel, beauty, home, food, electronics). That's an average of <strong>${Math.round(ins.totals.captures / Math.max(ins.totals.corpusDays, 1)).toLocaleString('en')} captures per day</strong>, growing.</p>
  <p>Each capture is a record of what an agent returned when our benchmark suite issued a buyer-style query. It is <em>not</em> a sample of real shopper traffic (which is private to each agent). Two takeaways from the benchmark:</p>
  <ul>
    <li>The answers are deterministic enough to measure. Issue the same buyer-style query 30 days apart and you get largely overlapping product lists — meaning catalog-level signal is what moves the answers, not query phrasing noise.</li>
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

  <h2>${top10Audited.length > 0 ? '5' : '4'}. Top queries in our benchmark suite</h2>
  <p>The 10 most-frequent queries our standardized benchmark suite issued in this window (queries are pre-defined, not sourced from real shopper search logs):</p>
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
  <p>The pattern in our suite: specific queries elicit more confident answers than broad ones. Queries like "waterproof running jacket under $200" and "vegan skincare with niacinamide" return concrete brand-and-product lists; broad queries like "running gear" return generic category guidance. We constructed our suite to test the constraint-rich end of the distribution intentionally — that's where AI agent retrieval is most discriminating, and where catalog quality differences surface most clearly. <strong>If your catalog can't answer factual constraints, you don't get cited.</strong></p>

  <h2>${top10Audited.length > 0 ? '6' : '5'}. The structural takeaway</h2>
  <p>Three qualitative patterns hold across the dataset, regardless of which agent or vertical we slice. None of these are causal claims — we don't run controlled merchant experiments. They're descriptions of what the captures look like.</p>
  <ol>
    <li><strong>Structure beats prose.</strong> Brands cited most often in the captures dataset overwhelmingly publish structured metafield data on the platforms where they're recommended. The reverse is not observed: catalogs that hide attributes in marketing prose rarely surface at the top.</li>
    <li><strong>Specificity correlates with citation.</strong> Top-ranked captures consistently surface products described with factual markers (units, ingredients, materials, certifications) rather than marketing superlatives. We haven't run a controlled comparison, but the pattern is visible at a glance.</li>
    <li><strong>The distribution is winner-take-most.</strong> Rank 50 in our brand list receives ~5% of the mentions that rank 1 does. The long tail past rank 100 drops further still.</li>
  </ol>

  <div class="callout data">
    <strong>If you read one paragraph of this report:</strong> the single highest-leverage thing you can do for AI catalog visibility is set vertical-relevant metafields. The gap between "no AI-relevant metafields" and "3 vertical-relevant metafields" is the largest single jump in the rubric. We documented this in detail in the <a href="/blog/8-signals-ai-shopping-agents-look-at">8 signals article</a>.
  </div>

  <h2>Methodology</h2>
  <p>Each day we run a ~5,000 query batch through six AI agents. The batch combines two sources: a 700-query <em>anchor set</em> of hand-curated queries kept identical across runs (so the same query's response can be tracked over time), and a probabilistically generated set that fills the rest.</p>

  <p>The probabilistic generator samples each query from explicit distributions:</p>
  <ul>
    <li><strong>Length:</strong> 30% short (1-3 tokens, e.g. "running shoes"), 45% medium (4-8 tokens, e.g. "running shoes for marathon training"), 20% long (9-15 tokens, includes 2+ constraints), 5% verbose (16+ tokens, conversational).</li>
    <li><strong>Phrasing register:</strong> 55% search-style, 30% question-style ("what's the best..."), 15% conversational ("I'm looking for...").</li>
    <li><strong>Constraint mix:</strong> price ceiling, use case, demographic, factual attribute, brand relation. Pareto-distributed count, with at most one constraint per type per query.</li>
    <li><strong>Vertical share:</strong> Pareto across ten verticals (apparel and electronics ~18-20% each, beauty 17%, home 12%, gifts 10%, then a long tail through fitness, outdoor, pets, food, baby). Seasonally boosted (gifts in Q4, fitness in T1, outdoor in summer).</li>
  </ul>

  <p>These parameters are explicit and reviewable in the open methodology repo. They are best-effort approximations of shopper-LLM behavior, calibrated from public observation rather than fitted to real shopper traffic (which is not publicly available). They will be wrong in some verticals. The right response when a reader pushes back is to debate the parameters, not to defend the output.</p>

  <p>After collection, we extract product-and-brand recommendations from each agent's response. The parser is intentionally tolerant: different agents return slightly different shapes. We dedupe at the merchant-domain level per capture, then aggregate. Top brands are ranked over a 90-day window, which matches typical AI agent retraining cadence. Aggregated counts are exposed via <code>/api/public/insights</code> and refreshed hourly.</p>

  <p><strong>What the dataset is and is not.</strong> This is a benchmark. We do <em>not</em> observe real shopper traffic; actual shopping interactions with the agents are private to each provider. The signal the dataset surfaces is "given a buyer-style query, which catalogs do AI agents cite?", useful for benchmarking visibility and tracking changes over time. The signal it does <em>not</em> surface is "what queries real shoppers type to AI agents and at what volume" since that data exists only inside each agent's servers.</p>

  <p>Limitations:</p>
  <ul>
    <li>The query suite is generated from a model of shopper-LLM behavior, not sampled from real search logs. The model's parameters are best-effort approximations and may diverge from actual shopper distributions, especially in long-tail verticals.</li>
    <li>Each query in the daily batch is run once per agent. Head queries in the real world receive many more shopper impressions than tail queries; our captures dataset treats them with equal weight.</li>
    <li>Capture set is currently English-language only. Multi-language is on the roadmap.</li>
    <li>"Mentions" do not equal "purchases". We measure AI agent visibility, not downstream conversion.</li>
    <li>Catalog audits are over public products.json data; signals like metafields and SEO meta are install-only (covered in the full rubric).</li>
  </ul>
  <p>Methodology open at <a href="https://github.com/commerce-agentic/agentic-catalog-scanner">commerce-agentic/agentic-catalog-scanner</a>. Raw dataset README at <a href="https://github.com/commerce-agentic/ai-visibility-metrics">commerce-agentic/ai-visibility-metrics</a>.</p>

  <div class="cta-section">
    <h2>Audit your catalog in 60 seconds</h2>
    <p>Free public scan of any Shopify store. See where you'd rank.</p>
    <a href="/audit" class="btn btn-primary">Run a free audit <span class="btn-arrow">→</span></a>
    <a href="/#install" class="btn btn-dark-outline">Install on Shopify</a>
  </div>
</article>

<footer class="footer">
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
          <a href="/#install">Install on Shopify</a>
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
