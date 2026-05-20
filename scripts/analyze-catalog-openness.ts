/**
 * One-off analysis script for the "23% catalog openness" blog post.
 *
 * Re-audits the top 200 AI-mentioned brands, tracking *why* each one
 * failed (HTTP status, content-type, error). Writes a breakdown JSON
 * we can cite in the article.
 */

import { writeFileSync } from 'node:fs';

const INSIGHTS_URL = 'https://shopify-app-production-7e58.up.railway.app/api/public/insights';
const TOP = 200;
const CONCURRENCY = 6;
const TIMEOUT_MS = 12_000;

interface FailureBreakdown {
  total: number;
  successful: number;
  failures: {
    notFound404: string[];      // feed disabled or unknown route
    forbidden403: string[];     // actively blocked
    gone410: string[];          // removed
    serverError5xx: string[];   // upstream errors
    htmlResponse: string[];     // products.json returned an HTML page (auth wall)
    timeoutOrAbort: string[];
    other: Array<{ domain: string; reason: string }>;
  };
  successList: string[];
}

async function auditOne(domain: string): Promise<{ ok: boolean; reason: string }> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`https://${domain}/products.json?limit=1`, {
      signal: ctrl.signal,
      headers: { 'Accept': 'application/json', 'User-Agent': 'AICatalogScore-Bot/1.0' },
    });
    if (res.status === 404) return { ok: false, reason: '404' };
    if (res.status === 403) return { ok: false, reason: '403' };
    if (res.status === 410) return { ok: false, reason: '410' };
    if (res.status >= 500) return { ok: false, reason: `5xx-${res.status}` };
    const ct = res.headers.get('content-type') || '';
    if (!ct.includes('json')) {
      const text = await res.text();
      if (text.includes('<!DOCTYPE') || text.includes('<html')) return { ok: false, reason: 'html' };
      return { ok: false, reason: 'non-json' };
    }
    const data = await res.json() as { products?: unknown[] };
    if (!data.products || !Array.isArray(data.products) || data.products.length === 0) {
      return { ok: false, reason: 'empty' };
    }
    return { ok: true, reason: 'ok' };
  } catch (err) {
    const m = err instanceof Error ? err.message : 'unknown';
    if (m.toLowerCase().includes('abort')) return { ok: false, reason: 'timeout' };
    return { ok: false, reason: `error: ${m.slice(0, 60)}` };
  } finally {
    clearTimeout(timer);
  }
}

async function main(): Promise<void> {
  console.log('Fetching top brands…');
  const insights = await fetch(INSIGHTS_URL).then(r => r.json()) as { topBrands: Array<{ domain: string }> };
  const brands = insights.topBrands.slice(0, TOP).map(b => b.domain);
  console.log(`Probing ${brands.length} brands (concurrency ${CONCURRENCY})…\n`);

  const breakdown: FailureBreakdown = {
    total: brands.length,
    successful: 0,
    failures: {
      notFound404: [],
      forbidden403: [],
      gone410: [],
      serverError5xx: [],
      htmlResponse: [],
      timeoutOrAbort: [],
      other: [],
    },
    successList: [],
  };

  const queue = [...brands];
  let done = 0;

  async function worker() {
    while (queue.length > 0) {
      const d = queue.shift()!;
      const { ok, reason } = await auditOne(d);
      done++;
      if (ok) {
        breakdown.successful++;
        breakdown.successList.push(d);
        console.log(`[${done}/${brands.length}] ✓ ${d}`);
      } else {
        if (reason === '404') breakdown.failures.notFound404.push(d);
        else if (reason === '403') breakdown.failures.forbidden403.push(d);
        else if (reason === '410') breakdown.failures.gone410.push(d);
        else if (reason.startsWith('5xx')) breakdown.failures.serverError5xx.push(d);
        else if (reason === 'html') breakdown.failures.htmlResponse.push(d);
        else if (reason === 'timeout') breakdown.failures.timeoutOrAbort.push(d);
        else breakdown.failures.other.push({ domain: d, reason });
        console.log(`[${done}/${brands.length}] ✗ ${d.padEnd(36)} ${reason}`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  writeFileSync('public-data/catalog-openness-breakdown.json', JSON.stringify(breakdown, null, 2));
  console.log('\n--- summary ---');
  console.log(`Total probed:      ${breakdown.total}`);
  console.log(`Successful (open): ${breakdown.successful} (${(breakdown.successful / breakdown.total * 100).toFixed(0)}%)`);
  console.log(`404 (not found):   ${breakdown.failures.notFound404.length}`);
  console.log(`403 (forbidden):   ${breakdown.failures.forbidden403.length}`);
  console.log(`410 (gone):        ${breakdown.failures.gone410.length}`);
  console.log(`5xx (server):      ${breakdown.failures.serverError5xx.length}`);
  console.log(`html (auth wall):  ${breakdown.failures.htmlResponse.length}`);
  console.log(`timeout/abort:     ${breakdown.failures.timeoutOrAbort.length}`);
  console.log(`other:             ${breakdown.failures.other.length}`);
  console.log('\n✓ Wrote public-data/catalog-openness-breakdown.json');
}

main().catch(err => { console.error(err); process.exit(1); });
