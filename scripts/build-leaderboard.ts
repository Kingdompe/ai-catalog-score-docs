/**
 * Build the catalog-score leaderboard data file.
 *
 * Fetches /api/public/insights, takes the top N most-mentioned brands,
 * runs the public audit on each via /audit/{shop}.json, ranks by score,
 * writes `public-data/catalog-score-leaderboard.json`.
 *
 * Run locally:
 *   tsx scripts/build-leaderboard.ts [--top=100] [--limit=200]
 *
 * Run in GitHub Action (future):
 *   nightly cron, commit refreshed JSON, Cloudflare rebuilds automatically.
 */

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';

const INSIGHTS_URL = 'https://shopify-app-production-7e58.up.railway.app/api/public/insights';
const AUDIT_BASE = 'https://aicatalogscore.com';
const TOP_BRANDS_LIMIT = 200;     // how many to attempt auditing
const CONCURRENCY = 6;            // gentle on the audit endpoint
const PER_REQ_TIMEOUT = 12_000;

interface Insights {
  topBrands: Array<{ domain: string; mentions: number; agents: string[] }>;
  totals: { captures: number; agents: number; stores: number; corpusDays: number };
}

interface StoreAudit {
  shop: string;
  productCount: number;
  averageScore: number;
  topIssues: Array<{ issue: string; count: number }>;
}

interface AuditError { error: string; }

interface LeaderboardEntry {
  domain: string;
  score: number;
  productCount: number;
  topIssue?: string;
  aiMentions: number;
}

async function fetchInsights(): Promise<Insights> {
  const res = await fetch(INSIGHTS_URL);
  if (!res.ok) throw new Error(`Insights fetch failed: ${res.status}`);
  return await res.json() as Insights;
}

async function auditOne(domain: string): Promise<StoreAudit | AuditError | null> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), PER_REQ_TIMEOUT);
  try {
    const res = await fetch(`${AUDIT_BASE}/audit/${encodeURIComponent(domain)}.json`, {
      signal: ctrl.signal,
      headers: { 'Accept': 'application/json' },
    });
    return await res.json() as StoreAudit | AuditError;
  } catch (err) {
    return { error: err instanceof Error ? err.message : 'unknown' };
  } finally {
    clearTimeout(timer);
  }
}

async function main(): Promise<void> {
  console.log('Fetching insights from Railway…');
  const insights = await fetchInsights();
  const candidates = insights.topBrands.slice(0, TOP_BRANDS_LIMIT);
  console.log(`Auditing top ${candidates.length} candidates (${CONCURRENCY} in parallel)…`);

  const results: LeaderboardEntry[] = [];
  const queue = [...candidates];
  let done = 0;

  async function worker() {
    while (queue.length > 0) {
      const b = queue.shift()!;
      const payload = await auditOne(b.domain);
      done++;
      if (payload && !('error' in payload) && payload.averageScore > 0) {
        results.push({
          domain: b.domain,
          score: payload.averageScore,
          productCount: payload.productCount,
          topIssue: payload.topIssues[0]?.issue,
          aiMentions: b.mentions,
        });
        console.log(`[${done}/${candidates.length}] ${b.domain.padEnd(40)} ${payload.averageScore}/100 (${payload.productCount} products)`);
      } else {
        const reason = payload && 'error' in payload ? payload.error : 'no data';
        console.log(`[${done}/${candidates.length}] ${b.domain.padEnd(40)} skip (${reason.slice(0, 50)})`);
      }
    }
  }

  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));

  results.sort((a, b) => b.score - a.score);

  if (!existsSync('public-data')) mkdirSync('public-data');
  const out = {
    builtAt: new Date().toISOString(),
    totalScanned: candidates.length,
    entries: results,
  };
  writeFileSync('public-data/catalog-score-leaderboard.json', JSON.stringify(out, null, 2), 'utf-8');
  console.log(`\n✓ Wrote public-data/catalog-score-leaderboard.json — ${results.length} successful audits out of ${candidates.length}`);
  if (results[0]) console.log(`  Top: ${results[0].domain} at ${results[0].score}/100`);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
