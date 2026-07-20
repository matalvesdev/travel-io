import { describe, it, expect, beforeAll } from 'vitest';

const BASE = 'http://localhost:3000';
const TIMEOUT = 180_000; // 3 min — scraper sequential

beforeAll(async () => {
  // Verify server is running, fail fast if not
  const res = await fetch(`${BASE}/`, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`Server not available: ${res.status}`);
});

// ============ /api/products — Flights ============
describe('Flights — /api/products', () => {
  it('searches LATAM flights via Google Flights', async () => {
    const res = await fetch(`${BASE}/api/products?origin=GRU&destination=Paris&date=2026-08-01&store=latam`);
    const data = await res.json();
    expect(data.products).toBeDefined();
    expect(Array.isArray(data.products)).toBe(true);

    if (data.products.length > 0) {
      const flight = data.products[0];
      expect(flight.airline).toBeDefined();
      expect(flight.price).toBeGreaterThan(0);
    }
  }, TIMEOUT);

  it('flights are sorted by price ascending', async () => {
    const res = await fetch(`${BASE}/api/products?origin=GRU&destination=Paris&date=2026-08-01&store=latam`);
    const data = await res.json();
    if (data.products.length > 1) {
      const prices = data.products.map((p: any) => p.price);
      for (let i = 1; i < prices.length; i++) {
        expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
      }
    }
  }, TIMEOUT);

  it('searches GOL flights', async () => {
    const res = await fetch(`${BASE}/api/products?origin=GRU&destination=Rio+de+Janeiro&date=2026-08-01&store=gol`);
    const data = await res.json();
    expect(data.products).toBeDefined();
  }, TIMEOUT);

  it('searches KAYAK flights', async () => {
    const res = await fetch(`${BASE}/api/products?origin=GRU&destination=Paris&date=2026-08-01&store=kayak`);
    const data = await res.json();
    expect(data.products).toBeDefined();
  }, TIMEOUT);

  it('flight has required fields', async () => {
    const res = await fetch(`${BASE}/api/products?origin=GRU&destination=Paris&date=2026-08-01&store=latam`);
    const data = await res.json();
    if (data.products.length > 0) {
      const flight = data.products[0];
      expect(typeof flight.price).toBe('number');
      expect(flight.airline).toBeDefined();
    }
  }, TIMEOUT);
});

// ============ /api/products — Hotels ============
describe('Hotels — /api/products', () => {
  it('searches Booking hotels', async () => {
    const res = await fetch(`${BASE}/api/products?destination=Paris&checkin=2026-08-01&checkout=2026-08-05&store=booking`);
    const data = await res.json();
    expect(data.products).toBeDefined();
    expect(Array.isArray(data.products)).toBe(true);
    if (data.products.length > 0) {
      const hotel = data.products[0];
      expect(hotel.name || hotel.title).toBeDefined();
      expect(hotel.price).toBeGreaterThan(0);
    }
  }, TIMEOUT);

  it('hotels are sorted by price ascending', async () => {
    const res = await fetch(`${BASE}/api/products?destination=Paris&checkin=2026-08-01&checkout=2026-08-05&store=booking`);
    const data = await res.json();
    const prices = data.products.map((p: any) => p.price);
    for (let i = 1; i < Math.min(prices.length, 10); i++) {
      expect(prices[i]).toBeGreaterThanOrEqual(prices[i - 1]);
    }
  }, TIMEOUT);

  it('searches Google Hotels', async () => {
    const res = await fetch(`${BASE}/api/products?destination=Paris&checkin=2026-08-01&checkout=2026-08-05&store=google-hotels`);
    const data = await res.json();
    expect(data.products).toBeDefined();
    if (data.products.length > 0) {
      expect(data.products[0].price).toBeGreaterThan(0);
    }
  }, TIMEOUT);

  it('hotel has rating or name', async () => {
    const res = await fetch(`${BASE}/api/products?destination=Paris&checkin=2026-08-01&checkout=2026-08-05&store=booking`);
    const data = await res.json();
    if (data.products.length > 0) {
      const hasName = data.products.filter((h: any) => h.name && h.name.length > 2);
      expect(hasName.length).toBeGreaterThan(0);
    }
  }, TIMEOUT);
});

// ============ /api/products — Combined search ============
describe('Travel Search — Combined', () => {
  it('can search both flights and hotels sequentially', async () => {
    // Step 1: Flights
    const flightRes = await fetch(`${BASE}/api/products?origin=GRU&destination=Paris&date=2026-08-01&store=latam`);
    const flightData = await flightRes.json();
    expect(flightData.products).toBeDefined();

    // Step 2: Hotels
    const hotelRes = await fetch(`${BASE}/api/products?destination=Paris&checkin=2026-08-01&checkout=2026-08-05&store=booking`);
    const hotelData = await hotelRes.json();
    expect(hotelData.products).toBeDefined();

    // Calculate total cost if both have results
    if (flightData.products.length > 0 && hotelData.products.length > 0) {
      const cheapestFlight = flightData.products.reduce((a: any, b: any) => a.price < b.price ? a : b);
      const cheapestHotel = hotelData.products.reduce((a: any, b: any) => a.price < b.price ? a : b);
      const nights = 4;
      const totalCost = cheapestFlight.price + cheapestHotel.price * nights;
      expect(totalCost).toBeGreaterThan(0);
    }
  }, TIMEOUT * 2);
});
