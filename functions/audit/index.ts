/**
 * Cloudflare Pages Function — /audit
 *
 * Two modes:
 *   - GET /audit                  → render input form
 *   - GET /audit?store=foo.com    → 302 redirect to /audit/{normalized}
 */

import { renderForm } from '../lib/render';

interface Env {}

function normalizeShop(input: string): string | null {
  let s = input.trim().toLowerCase();
  s = s.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
  if (!s) return null;
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(s)) return null;
  return s;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);
  const store = url.searchParams.get('store');

  if (store) {
    const normalized = normalizeShop(store);
    if (!normalized) {
      return new Response(renderForm(store, 'That URL doesn\'t look like a Shopify store. Try the .myshopify.com format.'), {
        status: 400,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
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
};
