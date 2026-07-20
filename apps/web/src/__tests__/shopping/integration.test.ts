import { describe, it, expect, beforeAll } from 'vitest';

const BASE = 'http://localhost:3000';
const TIMEOUT = 180_000; // 3 min — scraper needs time
const SHORT_TIMEOUT = 10_000;

beforeAll(async () => {
  const res = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Server not available: ${res.status}`);
});

// ============ /api/products — Scraper API ============
describe('GET /api/products', () => {
  it('returns 400 when no query provided', async () => {
    const res = await fetch(`${BASE}/api/products`);
    const data = await res.json();
    expect(res.status).toBe(400);
    expect(data.error).toBeDefined();
  }, SHORT_TIMEOUT);

  it('searches ML — returns sorted products with images', async () => {
    const res = await fetch(`${BASE}/api/products?q=iphone&store=mercadolivre`);
    const data = await res.json();
    expect(data.products).toBeDefined();
    expect(Array.isArray(data.products)).toBe(true);

    if (data.products.length > 0) {
      const prices = data.products.map((p: any) => p.price);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
      }
      expect(data.products.some((p: any) => p.imageUrl)).toBe(true);
    }
  }, TIMEOUT);

  it('searches AliExpress via Google Shopping', async () => {
    const res = await fetch(`${BASE}/api/products?q=fone&store=aliexpress`);
    const data = await res.json();
    expect(data.products).toBeDefined();
    expect(Array.isArray(data.products)).toBe(true);
  }, TIMEOUT);

  it('searches Shopee via Google Shopping', async () => {
    const res = await fetch(`${BASE}/api/products?q=capa&store=shopee`);
    const data = await res.json();
    expect(data.products).toBeDefined();
    expect(Array.isArray(data.products)).toBe(true);
  }, TIMEOUT);

  it('searches Magalu via Google Shopping', async () => {
    const res = await fetch(`${BASE}/api/products?q=notebook&store=magalu`);
    const data = await res.json();
    expect(data.products).toBeDefined();
    expect(Array.isArray(data.products)).toBe(true);
  }, TIMEOUT);

  it('searches Booking for hotels — sorted by price', async () => {
    const res = await fetch(`${BASE}/api/products?destination=Paris&checkin=2026-08-01&checkout=2026-08-05&store=booking`);
    const data = await res.json();
    expect(data.products).toBeDefined();
    expect(Array.isArray(data.products)).toBe(true);
    if (data.products.length > 0) {
      expect(data.products[0].price).toBeGreaterThan(0);
      const prices = data.products.map((p: any) => p.price);
      for (let i = 1; i < Math.min(prices.length, 10); i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
      }
    }
  }, TIMEOUT);

  it('searches Webmotors via REST API', async () => {
    const res = await fetch(`${BASE}/api/products?q=onix&store=webmotors`);
    const data = await res.json();
    expect(data.products).toBeDefined();
    expect(Array.isArray(data.products)).toBe(true);
  }, TIMEOUT);

  it('searches OLX', async () => {
    const res = await fetch(`${BASE}/api/products?q=apartamento&store=olx`);
    const data = await res.json();
    expect(data.products).toBeDefined();
  }, TIMEOUT);
});

// ============ /api/coupons — Coupon API ============

describe('GET /api/coupons', () => {
  it('returns active coupons with required fields', async () => {
    const res = await fetch(`${BASE}/api/coupons`);
    const data = await res.json();
    expect(data.coupons.length).toBeGreaterThan(0);
    for (const c of data.coupons) {
      expect(c.store_name).toBeDefined();
      expect(c.code).toBeDefined();
      expect(c.description).toBeDefined();
      expect(typeof c.value).toBe('number');
    }
  }, SHORT_TIMEOUT);

  it('force refresh works', async () => {
    const res = await fetch(`${BASE}/api/coupons?refresh=true`);
    const data = await res.json();
    expect(data.refreshed).toBe(true);
    expect(data.coupons.length).toBeGreaterThan(0);
  }, SHORT_TIMEOUT);
});
