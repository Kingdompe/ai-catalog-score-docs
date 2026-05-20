/**
 * Cloudflare Pages Function — /audit/{shop}
 *
 * Fetches the public products.json feed of a Shopify store, runs the
 * portable audit engine, and returns an SEO-optimized HTML page.
 *
 * Cached at the CDN edge for 1 hour so the same shop URL doesn't
 * re-fetch the upstream feed on every visit.
 */

import { auditStore, type PublicProduct } from '../lib/audit';
import { renderAudit, renderError } from '../lib/render';

interface Env {}

const MAX_PRODUCTS = 250;   // 1 page of products.json — enough signal, keeps runtime fast
const FETCH_TIMEOUT_MS = 8000;

function normalizeShop(input: string): string | null {
  let s = input.trim().toLowerCase();
  s = s.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!s) return null;
  // Accept "foo.myshopify.com" directly. If it's a custom domain we leave
  // it — many stores use products.json on their custom domain too.
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
      cf: { cacheTtl: 3600, cacheEverything: true } as RequestInitCfProperties,
    });
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

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const raw = (context.params.shop as string) || '';
  const decoded = decodeURIComponent(raw);
  const shop = normalizeShop(decoded);

  if (!shop) {
    return new Response(renderError(decoded, 'That URL doesn\'t look like a Shopify store.'), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }

  try {
    const products = await fetchProductsJson(shop);
    if (products.length === 0) {
      return new Response(renderError(shop, 'The store has no public products.'), {
        status: 404,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    const audit = auditStore(shop, products);
    const html = renderAudit(audit);
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        // Cache 1h at the edge so repeat visitors and crawlers get a fast page
        'Cache-Control': 'public, max-age=300, s-maxage=3600',
        'X-Robots-Tag': 'index,follow',
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error fetching the public feed';
    return new Response(renderError(shop, message), {
      status: 502,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  }
};
