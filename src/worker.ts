/**
 * Worker entry point for aicatalogscore.com.
 *
 * Handles dynamic routes:
 *   GET /audit               → audit form (and /audit?store=... redirect)
 *   GET /audit/{shop}        → run public products.json audit + render HTML
 *
 * Falls back to the ASSETS binding (static files at the project root) for
 * everything else (index.html, og-card.png, privacy.html, etc.).
 */

import { auditStore, type PublicProduct } from './audit';
import { renderAudit, renderError, renderForm } from './render';
import {
  fetchInsights,
  renderAiMentionsLeaderboard,
  renderCatalogScoreLeaderboard,
  renderLeaderboardIndex,
  type CatalogScoreEntry,
} from './leaderboard';

interface Env {
  ASSETS: { fetch: (request: Request) => Promise<Response> };
}

const MAX_PRODUCTS = 250;
const FETCH_TIMEOUT_MS = 8000;

function normalizeShop(input: string): string | null {
  let s = input.trim().toLowerCase();
  s = s.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!s) return null;
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(s)) return null;
  return s;
}

async function fetchProductsJson(shop: string): Promise<PublicProduct[]> {
  const url = `https://${shop}/products.json?limit=${MAX_PRODUCTS}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        'User-Agent': 'AICatalogScore-Bot/1.0 (+https://aicatalogscore.com/audit)',
        'Accept': 'application/json',
      },
      cf: { cacheTtl: 3600, cacheEverything: true },
    } as RequestInit);
    if (!res.ok) {
      throw new Error(`Store responded ${res.status} — feed may be disabled or this isn't a Shopify store`);
    }
    const data = await res.json() as { products?: PublicProduct[] };
    if (!data.products || !Array.isArray(data.products)) {
      throw new Error('No products found in the public feed');
    }
    return data.products;
  } finally {
    clearTimeout(timer);
  }
}

async function handleAuditShop(shop: string, format: 'html' | 'json'): Promise<Response> {
  const jsonHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': 'public, max-age=300, s-maxage=3600',
  };
  const normalized = normalizeShop(shop);
  if (!normalized) {
    if (format === 'json') {
      return new Response(JSON.stringify({ error: "That URL doesn't look like a Shopify store.", shop }), { status: 400, headers: jsonHeaders });
    }
    return new Response(renderError(shop, "That URL doesn't look like a Shopify store."), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
  try {
    const products = await fetchProductsJson(normalized);
    if (products.length === 0) {
      if (format === 'json') {
        return new Response(JSON.stringify({ error: 'The store has no public products.', shop: normalized }), { status: 404, headers: jsonHeaders });
      }
      return new Response(renderError(normalized, 'The store has no public products.'), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    const audit = auditStore(normalized, products);
    if (format === 'json') {
      return new Response(JSON.stringify(audit), { status: 200, headers: jsonHeaders });
    }
    return new Response(renderAudit(audit), {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=300, s-maxage=3600',
        'X-Robots-Tag': 'index,follow',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error fetching the public feed';
    if (format === 'json') {
      return new Response(JSON.stringify({ error: message, shop: normalized }), { status: 502, headers: jsonHeaders });
    }
    return new Response(renderError(normalized, message), {
      status: 502,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
}

function handleAuditForm(url: URL): Response {
  const store = url.searchParams.get('store');
  if (store) {
    const normalized = normalizeShop(store);
    if (!normalized) {
      return new Response(
        renderForm(store, "That URL doesn't look like a Shopify store. Try the .myshopify.com format."),
        { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } },
      );
    }
    return Response.redirect(`${url.origin}/audit/${encodeURIComponent(normalized)}`, 302);
  }
  return new Response(renderForm(), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=3600',
    },
  });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === 'GET' || request.method === 'HEAD') {
      const path = url.pathname;
      if (path === '/audit' || path === '/audit/') {
        return handleAuditForm(url);
      }
      const shopMatch = path.match(/^\/audit\/([^/]+?)(\.json)?\/?$/);
      if (shopMatch) {
        const format: 'html' | 'json' = (shopMatch[2] === '.json' || url.searchParams.get('format') === 'json') ? 'json' : 'html';
        return handleAuditShop(decodeURIComponent(shopMatch[1]), format);
      }

      if (path === '/leaderboard' || path === '/leaderboard/') {
        return handleLeaderboardIndex();
      }
      if (path === '/leaderboard/ai-mentions' || path === '/leaderboard/ai-mentions/') {
        return handleAiMentions();
      }
      if (path === '/leaderboard/catalog-score' || path === '/leaderboard/catalog-score/') {
        return handleCatalogScore(env);
      }
    }

    // Everything else → static assets (index.html, og-card.png, privacy.html, …)
    return env.ASSETS.fetch(request);
  },
};

async function handleLeaderboardIndex(): Promise<Response> {
  const insights = await fetchInsights();
  return new Response(renderLeaderboardIndex(insights), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=3600',
      'X-Robots-Tag': 'index,follow',
    },
  });
}

async function handleAiMentions(): Promise<Response> {
  const insights = await fetchInsights();
  if (!insights) {
    return new Response('Leaderboard data unavailable. Try again in a few minutes.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Retry-After': '300' },
    });
  }
  return new Response(renderAiMentionsLeaderboard(insights), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=600, s-maxage=3600',
      'X-Robots-Tag': 'index,follow',
    },
  });
}

async function handleCatalogScore(env: Env): Promise<Response> {
  // Pre-built leaderboard data ships as a static asset. The build script
  // (scripts/build-leaderboard.ts) refreshes it nightly via GitHub Action.
  const dataReq = new Request('https://placeholder/public-data/catalog-score-leaderboard.json');
  const dataRes = await env.ASSETS.fetch(dataReq);
  if (!dataRes.ok) {
    return new Response('Catalog-score leaderboard data not built yet. Run scripts/build-leaderboard.ts.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  }
  const data = await dataRes.json() as { builtAt: string; totalScanned: number; entries: CatalogScoreEntry[] };
  return new Response(
    renderCatalogScoreLeaderboard(data.entries, { totalScanned: data.totalScanned, auditedAt: data.builtAt }),
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=600, s-maxage=3600',
        'X-Robots-Tag': 'index,follow',
      },
    },
  );
}
