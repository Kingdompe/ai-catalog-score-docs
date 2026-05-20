/**
 * Portable audit engine — same scoring logic as the closed Shopify app
 * (app/services/audit.server.ts), but rewritten without Node / Prisma
 * deps so it runs inside a Cloudflare Pages Function.
 *
 * Scores what's available from the public `{shop}.myshopify.com/products.json`
 * endpoint (no auth required). That endpoint exposes:
 *   - title, handle, body_html, product_type, vendor, tags
 *   - images: [{ src, alt, ... }]
 *   - variants: [{ sku, barcode, price, option1, option2, option3, ... }]
 *
 * What's NOT available without app install:
 *   - metafields (-15 pts ceiling)
 *   - seo.title / seo.description (partial via meta tags scrape, skipped here)
 *   - Shopify Standard Product Taxonomy category (partial via product_type)
 *   - inventory + compare_at_price (sometimes partial in products.json)
 *
 * So the public audit scores against ~70/100 max. We rescale to a 0-100
 * percentage in the UI and clearly label "Partial audit — install to
 * unlock the remaining {30} points of signal."
 */

export interface PublicProduct {
  id: number;
  title: string;
  handle: string;
  body_html: string;
  product_type: string;
  vendor: string;
  tags: string | string[];   // Admin API returns comma-separated; public products.json returns string[]
  images: Array<{ id: number; src: string; alt: string | null }>;
  variants: Array<{
    id: number;
    title: string;
    sku: string;
    barcode: string | null;
    price: string;
    compare_at_price: string | null;
    option1: string | null;
    option2: string | null;
    option3: string | null;
  }>;
}

export interface ProductAudit {
  title: string;
  handle: string;
  scoreTitle: number;     // /15
  scoreDesc: number;      // /20
  scoreImages: number;    // /8 (count only — alt text install-only)
  scoreVariants: number;  // /8 (no barcode — install-only)
  scoreCategory: number;  // /10
  scoreTotal: number;     // /61 raw, rescaled to /100 in UI
  scorePct: number;       // 0-100 rescaled
  issues: string[];
}

const FLUFF_RE = /\b(premium|amazing|best|luxury|high.quality|top.quality|exceptional)\b/i;
const FACTUAL_RE = /\b(\d+\s*(?:ml|oz|g|mg|kg|cm|mm|inch|in|ft|lb|%)|cotton|leather|wool|silk|polyester|nylon|hyaluronic|niacinamide|retinol|vitamin\s*[abce]|organic|gluten.free|vegan|paraben.free|sulfate.free|cruelty.free)\b/i;
const PLACEHOLDER_RE = /^(product\s*title|untitled|test\s*product|sample)/i;

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function scoreTitle(p: PublicProduct): { score: number; issues: string[] } {
  const issues: string[] = [];
  let s = 0;
  const t = p.title || '';
  const tlen = t.length;
  if (PLACEHOLDER_RE.test(t)) {
    issues.push('Title is a placeholder — replace with a real product name');
    return { score: 2, issues };
  }
  if (tlen >= 30 && tlen <= 80) s += 4;
  else issues.push(`Title length ${tlen} chars — aim 30-80 for AI matching`);
  const words = t.split(/\s+/).filter(Boolean);
  if (words.length >= 5) s += 2;
  else issues.push(`Title only ${words.length} words — add product type + distinctive attribute`);
  if (p.product_type && t.toLowerCase().includes(p.product_type.toLowerCase())) s += 3;
  else if (p.product_type) issues.push(`Product type "${p.product_type}" missing from title — AI agents use it for category matching`);
  if (FACTUAL_RE.test(t)) s += 3;
  else issues.push('Title has no factual marker (material/spec/ingredient) — AI matches better with one');
  if (t.toUpperCase() !== t || t.length < 4) s += 2;
  else { issues.push('Title is ALL CAPS — AI agents parse title-case more reliably'); }
  if (!FLUFF_RE.test(t)) s += 1;
  return { score: Math.min(s, 15), issues };
}

function scoreDescription(p: PublicProduct): { score: number; issues: string[] } {
  const issues: string[] = [];
  let s = 0;
  const html = p.body_html || '';
  const desc = stripHtml(html);
  const words = desc.split(/\s+/).filter(Boolean);
  if (words.length >= 150) s += 6;
  else if (words.length >= 80) s += 3;
  else issues.push(`Description only ${words.length} words — too short for AI matching, aim 150+`);
  if (/<ul[\s>]|<ol[\s>]/i.test(html)) s += 3;
  else issues.push('No bullet list in description — AI agents parse structured lists better than prose');
  if (/<h[1-6][\s>]/i.test(html)) s += 2;
  const factualHits = (desc.match(new RegExp(FACTUAL_RE.source, 'gi')) || []).length;
  if (factualHits >= 3) s += 4;
  else if (factualHits >= 1) s += 2;
  else issues.push('Description has no specific attributes (materials, dimensions, ingredients, certifications)');
  if (!FLUFF_RE.test(desc)) s += 3;
  else issues.push('Description contains fluff words (premium, amazing, best) — replace with specific attributes');
  if (/\b(use|wear|apply|ideal|perfect for|designed for|works with)\b/i.test(desc)) s += 2;
  return { score: Math.min(s, 20), issues };
}

function scoreImages(p: PublicProduct): { score: number; issues: string[] } {
  // NOTE: alt text is NOT exposed in public products.json — that signal
  // is checked by the installed app only. Score is count-based here.
  const issues: string[] = [];
  let s = 0;
  const imgs = p.images || [];
  if (imgs.length >= 5) s += 8;
  else if (imgs.length >= 3) s += 6;
  else if (imgs.length >= 2) { s += 4; issues.push(`Only ${imgs.length} images — add 1-2 more angles for AI confidence`); }
  else if (imgs.length >= 1) { s += 2; issues.push('Only 1 image — add at least 2 more angles for AI discovery'); }
  else issues.push('No product images — AI agents need visuals to match queries');
  return { score: Math.min(s, 8), issues };
}

function scoreVariants(p: PublicProduct): { score: number; issues: string[] } {
  // NOTE: barcode is NOT exposed in public products.json — that signal
  // is checked by the installed app only.
  const issues: string[] = [];
  let s = 0;
  const variants = p.variants || [];
  if (variants.length > 1) s += 4;
  else if (variants.length === 1 && variants[0].option1 !== 'Default Title') s += 4;
  else { issues.push('Only default variant — add size/color/style options if product has them'); }
  if (variants.length > 0 && variants.every(v => v.sku && v.sku.length > 0)) s += 3;
  else issues.push('Some variants missing SKU — AI agents use SKU for unique-product identification');
  if (variants.length > 0 && variants[0].option1 && variants[0].option1 !== 'Default Title') s += 1;
  return { score: Math.min(s, 8), issues };
}

function scoreCategoryTags(p: PublicProduct): { score: number; issues: string[] } {
  const issues: string[] = [];
  let s = 0;
  const tags = Array.isArray(p.tags)
    ? p.tags.map(t => String(t).trim()).filter(Boolean)
    : String(p.tags || '').split(',').map(t => t.trim()).filter(Boolean);
  if (p.product_type && p.product_type.length > 0) s += 4;
  else issues.push('No product_type field — AI agents use it for taxonomy mapping');
  if (tags.length >= 5) s += 4;
  else if (tags.length >= 3) { s += 2; issues.push(`Only ${tags.length} tags — add more attribute tags (material, style, use-case)`); }
  else issues.push(`Only ${tags.length} tags — major AI signal gap, add 5+ relevant tags`);
  if (p.vendor && p.vendor.length > 0) s += 2;
  return { score: Math.min(s, 10), issues };
}

export function auditProduct(p: PublicProduct): ProductAudit {
  const t = scoreTitle(p);
  const d = scoreDescription(p);
  const i = scoreImages(p);
  const v = scoreVariants(p);
  const c = scoreCategoryTags(p);
  const raw = t.score + d.score + i.score + v.score + c.score;
  const MAX = 61;        // metafields + SEO + alt text + barcode + pricing/inventory not in public products.json
  const pct = Math.round((raw / MAX) * 100);
  return {
    title: p.title,
    handle: p.handle,
    scoreTitle: t.score,
    scoreDesc: d.score,
    scoreImages: i.score,
    scoreVariants: v.score,
    scoreCategory: c.score,
    scoreTotal: raw,
    scorePct: pct,
    issues: [...t.issues, ...d.issues, ...i.issues, ...v.issues, ...c.issues],
  };
}

export interface StoreAudit {
  shop: string;
  productCount: number;
  averageScore: number;
  aiReady: number;          // pct >= 80
  needsWork: number;        // pct 50-79
  invisible: number;        // pct < 50
  topIssues: Array<{ issue: string; count: number }>;
  worstProducts: ProductAudit[];
  fetchedAt: string;
}

export function auditStore(shop: string, products: PublicProduct[]): StoreAudit {
  const audited = products.map(auditProduct);
  const avg = audited.length ? Math.round(audited.reduce((sum, a) => sum + a.scorePct, 0) / audited.length) : 0;
  const aiReady = audited.filter(a => a.scorePct >= 80).length;
  const needsWork = audited.filter(a => a.scorePct >= 50 && a.scorePct < 80).length;
  const invisible = audited.filter(a => a.scorePct < 50).length;

  // Aggregate top issues across all products
  const issueCounts = new Map<string, number>();
  for (const a of audited) {
    for (const issue of a.issues) {
      // Normalize numbers + quoted snippets so similar issues group together
      const key = issue.replace(/\d+/g, 'N').replace(/"[^"]+"/g, '"..."');
      issueCounts.set(key, (issueCounts.get(key) || 0) + 1);
    }
  }
  const topIssues = Array.from(issueCounts.entries())
    .map(([issue, count]) => ({ issue, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const worstProducts = [...audited]
    .sort((a, b) => a.scorePct - b.scorePct)
    .slice(0, 5);

  return {
    shop,
    productCount: products.length,
    averageScore: avg,
    aiReady,
    needsWork,
    invisible,
    topIssues,
    worstProducts,
    fetchedAt: new Date().toISOString(),
  };
}

export function gradeFromScore(score: number): { letter: string; label: string; color: string } {
  if (score >= 95) return { letter: 'A+', label: 'AI-ready · top 1%',          color: '#00a86a' };
  if (score >= 85) return { letter: 'A',  label: 'Likely recommended',         color: '#00a86a' };
  if (score >= 70) return { letter: 'B',  label: 'Sometimes recommended',      color: '#92e8c0' };
  if (score >= 50) return { letter: 'C',  label: 'Rarely recommended',         color: '#facc15' };
  if (score >= 30) return { letter: 'D',  label: 'Occasional discovery',       color: '#fb923c' };
  return                  { letter: 'F',  label: 'Effectively invisible',     color: '#dc2626' };
}
