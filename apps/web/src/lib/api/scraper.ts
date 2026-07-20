// Comprehensive Web Scraper — Playwright-based
// Covers: Shopping, Flights, Hotels, Events, Real Estate & Classifieds

import { chromium, type Browser } from 'playwright-core';

// ============ Types ============
export interface ScrapedProduct { id: string; title: string; price: number; originalPrice?: number; url: string; store: string; imageUrl?: string; rating?: number; seller?: string; condition?: string; }
export interface ScrapedFlight { id: string; airline: string; flightNumber: string; origin: string; destination: string; departure: string; arrival: string; price: number; duration: string; stops: number; }
export interface ScrapedHotel { id: string; name: string; price: number; rating: number; reviews: number; imageUrl?: string; address: string; amenities: string[]; }
export interface ScrapedEvent { id: string; name: string; date: string; location: string; price: number; url: string; }
export interface ScrapedListing { id: string; title: string; price: number; url: string; store: string; location?: string; area?: string; bedrooms?: number; }

// ============ Browser Manager ============
let browserInstance: Browser | null = null;
async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  }
  return browserInstance;
}

async function withPage<T>(fn: (page: any) => Promise<T>): Promise<T> {
  const browser = await getBrowser();
  const ctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36', locale: 'pt-BR' });
  const page = await ctx.newPage();
  try { return await fn(page); } finally { await page.close(); await ctx.close(); }
}

// ============ SHOPPING: AMAZON ============
export async function scrapeAmazon(keyword: string): Promise<ScrapedProduct[]> {
  return withPage(async (page) => {
    await page.goto(`https://www.amazon.com.br/s?k=${encodeURIComponent(keyword)}&language=pt_BR`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(3000);
    await page.waitForSelector('[data-component-type="s-search-result"], .s-result-item[data-asin]', { timeout: 15000 }).catch(() => {});
    return page.evaluate(() => {
      return Array.from(document.querySelectorAll('[data-component-type="s-search-result"], .s-result-item[data-asin]')).slice(0, 20).map((el, i) => {
        const title = el.querySelector('h2 span, .a-text-normal')?.textContent?.trim() || '';
        const w = el.querySelector('.a-price-whole')?.textContent?.replace(/\./g, '').trim() || '0';
        const f = el.querySelector('.a-price-fraction')?.textContent?.trim() || '00';
        const price = parseFloat(`${w}.${f}`) || 0;
        const link = el.querySelector('h2 a, a.a-link-normal')?.getAttribute('href') || '';
        return { id: `amz-${Date.now()}-${i}`, title, price, originalPrice: price, url: link.startsWith('http') ? link : `https://www.amazon.com.br${link}`, store: 'Amazon', imageUrl: el.querySelector('img')?.getAttribute('src') || '' };
      }).filter((p: any) => p.price > 0 && p.title);
    });
  });
}

// ============ SHOPPING: MERCADO LIVRE ============
export async function scrapeML(keyword: string): Promise<ScrapedProduct[]> {
  return withPage(async (page) => {
    await page.goto(`https://lista.mercadolivre.com.br/${encodeURIComponent(keyword)}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(5000);
    await page.waitForSelector('.ui-search-layout__item, .ui-search-result__wrapper', { timeout: 15000 }).catch(() => {});
    return page.evaluate(() => {
      return Array.from(document.querySelectorAll('.ui-search-layout__item, .ui-search-result')).slice(0, 20).map((el, i) => {
        const title = el.querySelector('.ui-search-item__title, .poly-component__title')?.textContent?.trim() || '';
        const priceEl = el.querySelector('.andes-money-amount__fraction');
        const price = priceEl ? parseFloat(priceEl.textContent.replace(/\./g, '').replace(',', '.')) : 0;
        const link = el.querySelector('a')?.href || '';
        return { id: `ml-${Date.now()}-${i}`, title, price, originalPrice: price, url: link.split('#')[0], store: 'Mercado Livre', imageUrl: el.querySelector('img')?.src || '' };
      }).filter((p: any) => p.price > 0 && p.title);
    });
  });
}

// ============ SHOPPING: MAGALU ============
export async function scrapeMagalu(keyword: string): Promise<ScrapedProduct[]> {
  return withPage(async (page) => {
    await page.goto(`https://www.magazineluiza.com.br/busca/${encodeURIComponent(keyword)}/`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(3000);
    return page.evaluate(() => {
      const items = document.querySelectorAll('[data-testid="product-card"], .product-card');
      return Array.from(items).slice(0, 20).map((el, i) => {
        const title = el.querySelector('h2, [data-testid="product-title"]')?.textContent?.trim() || '';
        const priceText = el.querySelector('[data-testid="product-price"], .price-value')?.textContent?.trim() || '';
        const price = parseFloat(priceText.replace(/R\$\s*/, '').replace(/\./g, '').replace(',', '.')) || 0;
        return { id: `mag-${Date.now()}-${i}`, title, price, originalPrice: price, url: el.querySelector('a')?.href || '', store: 'Magazine Luiza' };
      }).filter((p: any) => p.price > 0 && p.title);
    });
  });
}

// ============ SHOPPING: CASAS BAHIA ============
export async function scrapeCasasBahia(keyword: string): Promise<ScrapedProduct[]> {
  return withPage(async (page) => {
    await page.goto(`https://www.casasbahia.com.br/busca/${encodeURIComponent(keyword)}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(3000);
    return page.evaluate(() => {
      const items = document.querySelectorAll('[data-testid="product-card"], .product-card');
      return Array.from(items).slice(0, 20).map((el, i) => {
        const title = el.querySelector('[data-testid="product-card-title"], .product-card__title')?.textContent?.trim() || '';
        const priceText = el.querySelector('[data-testid="product-card-price"], .product-card__price')?.textContent?.trim() || '';
        const price = parseFloat(priceText.replace(/R\$\s*/, '').replace(/\./g, '').replace(',', '.')) || 0;
        return { id: `cb-${Date.now()}-${i}`, title, price, originalPrice: price, url: el.querySelector('a')?.href || '', store: 'Casas Bahia' };
      }).filter((p: any) => p.price > 0 && p.title);
    });
  });
}

// ============ SHOPPING: ALIEXPRESS ============
export async function scrapeAliExpress(keyword: string): Promise<ScrapedProduct[]> {
  return withPage(async (page) => {
    await page.goto(`https://www.aliexpress.com/w/wholesale-${encodeURIComponent(keyword)}.html`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(3000);
    return page.evaluate(() => {
      return Array.from(document.querySelectorAll('.list--gallery--C2f2tvm, [class*="product-card"]')).slice(0, 20).map((el, i) => {
        const title = el.querySelector('[class*="title"], h1')?.textContent?.trim() || '';
        const priceText = el.querySelector('[class*="price"]')?.textContent?.trim() || '';
        const price = parseFloat(priceText.replace(/[^\d.,]/g, '').replace('.', '').replace(',', '.')) || 0;
        return { id: `ali-${Date.now()}-${i}`, title, price, originalPrice: price, url: el.querySelector('a')?.href || '', store: 'AliExpress' };
      }).filter((p: any) => p.price > 0 && p.title);
    });
  });
}

// ============ SHOPPING: SHOPEE ============
export async function scrapeShopee(keyword: string): Promise<ScrapedProduct[]> {
  return withPage(async (page) => {
    await page.goto(`https://shopee.com.br/search?keyword=${encodeURIComponent(keyword)}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(5000);
    return page.evaluate(() => {
      return Array.from(document.querySelectorAll('[data-sqe="item"], .shopee-search-item-result__item')).slice(0, 20).map((el, i) => {
        const title = el.querySelector('[data-sqe="name"], .line-clamp-2')?.textContent?.trim() || '';
        const priceText = el.querySelector('[class*="price"]')?.textContent?.trim() || '';
        const price = parseFloat(priceText.replace(/[^\d.,]/g, '').replace('.', '').replace(',', '.')) || 0;
        return { id: `sh-${Date.now()}-${i}`, title, price, originalPrice: price, url: el.querySelector('a')?.href || '', store: 'Shopee' };
      }).filter((p: any) => p.price > 0 && p.title);
    });
  });
}

// ============ SHOPPING: NETSHOES ============
export async function scrapeNetshoes(keyword: string): Promise<ScrapedProduct[]> {
  return withPage(async (page) => {
    await page.goto(`https://www.netshoes.com.br/busca?q=${encodeURIComponent(keyword)}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(3000);
    return page.evaluate(() => {
      return Array.from(document.querySelectorAll('[data-testid="product-card"], .product-card')).slice(0, 20).map((el, i) => {
        const title = el.querySelector('h3, [data-testid="product-title"]')?.textContent?.trim() || '';
        const priceText = el.querySelector('[data-testid="price"], .price')?.textContent?.trim() || '';
        const price = parseFloat(priceText.replace(/R\$\s*/, '').replace(/\./g, '').replace(',', '.')) || 0;
        return { id: `ns-${Date.now()}-${i}`, title, price, originalPrice: price, url: el.querySelector('a')?.href || '', store: 'Netshoes' };
      }).filter((p: any) => p.price > 0 && p.title);
    });
  });
}

// ============ FLIGHTS: LATAM ============
export async function scrapeFlightsLATAM(origin: string, dest: string, date: string): Promise<ScrapedFlight[]> {
  return withPage(async (page) => {
    await page.goto(`https://www.latamairlines.com/br/pt/voos?origin=${origin}&outbound=${date}&destination=${dest}&adt=1&chd=0&inf=0`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(8000);
    return page.evaluate(() => {
      return Array.from(document.querySelectorAll('[class*="flight"], [class*="itinerary"]')).slice(0, 10).map((el, i) => {
        const text = el.textContent || '';
        const priceMatch = text.match(/R\$\s*([\d.,]+)/);
        const price = priceMatch ? parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.')) : 0;
        return { id: `latam-${Date.now()}-${i}`, airline: 'LATAM', flightNumber: '', origin, destination: dest, departure: '', arrival: '', price, duration: '', stops: 0 };
      }).filter((f: any) => f.price > 0);
    });
  });
}

// ============ FLIGHTS: GOL ============
export async function scrapeFlightsGOL(origin: string, dest: string, date: string): Promise<ScrapedFlight[]> {
  return withPage(async (page) => {
    await page.goto(`https://www.voegol.com.br/pt-br/voos?origin=${origin}&destination=${dest}&departure=${date}&adt=1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(8000);
    return page.evaluate(() => {
      return Array.from(document.querySelectorAll('[class*="flight"], [class*="itinerary"]')).slice(0, 10).map((el, i) => {
        const text = el.textContent || '';
        const priceMatch = text.match(/R\$\s*([\d.,]+)/);
        const price = priceMatch ? parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.')) : 0;
        return { id: `gol-${Date.now()}-${i}`, airline: 'GOL', flightNumber: '', origin, destination: dest, departure: '', arrival: '', price, duration: '', stops: 0 };
      }).filter((f: any) => f.price > 0);
    });
  });
}

// ============ FLIGHTS: AZUL ============
export async function scrapeFlightsAzul(origin: string, dest: string, date: string): Promise<ScrapedFlight[]> {
  return withPage(async (page) => {
    await page.goto(`https://www.voeazul.com.br/pt-br/voos?origin=${origin}&destination=${dest}&departureDate=${date}&adults=1`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(8000);
    return page.evaluate(() => {
      return Array.from(document.querySelectorAll('[class*="flight"], [class*="itinerary"]')).slice(0, 10).map((el, i) => {
        const text = el.textContent || '';
        const priceMatch = text.match(/R\$\s*([\d.,]+)/);
        const price = priceMatch ? parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.')) : 0;
        return { id: `azul-${Date.now()}-${i}`, airline: 'Azul', flightNumber: '', origin, destination: dest, departure: '', arrival: '', price, duration: '', stops: 0 };
      }).filter((f: any) => f.price > 0);
    });
  });
}

// ============ FLIGHTS: KAYAK ============
export async function scrapeFlightsKAYAK(origin: string, dest: string, date: string): Promise<ScrapedFlight[]> {
  return withPage(async (page) => {
    await page.goto(`https://www.kayak.com.br/flights/${origin}-${dest}/${date}?sort=bestflight_a`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(10000);
    return page.evaluate(() => {
      return Array.from(document.querySelectorAll('[class*="nrc6"], [class*="resultInner"]')).slice(0, 10).map((el, i) => {
        const text = el.textContent || '';
        const priceMatch = text.match(/R\$\s*([\d.,]+)/);
        const price = priceMatch ? parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.')) : 0;
        return { id: `kayak-${Date.now()}-${i}`, airline: '', flightNumber: '', origin, destination: dest, departure: '', arrival: '', price, duration: '', stops: 0 };
      }).filter((f: any) => f.price > 0);
    });
  });
}

// ============ HOTELS: BOOKING ============
export async function scrapeBooking(dest: string, checkin: string, checkout: string): Promise<ScrapedHotel[]> {
  return withPage(async (page) => {
    await page.goto(`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(dest)}&checkin=${checkout}&checkout=${checkin}&group_adults=2&no_rooms=1&lang=pt-br`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(8000);
    return page.evaluate(() => {
      return Array.from(document.querySelectorAll('[data-testid="property-card"]')).slice(0, 20).map((el, i) => {
        const name = el.querySelector('[data-testid="title"]')?.textContent?.trim() || '';
        const priceText = el.querySelector('[data-testid="price-and-discounted-price"]')?.textContent?.trim() || '';
        const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        const rating = el.querySelector('[data-testid="rating-stars"]')?.getAttribute('aria-label')?.match(/[\d.]+/)?.[0] || '';
        return { id: `bk-${Date.now()}-${i}`, name, price, rating: parseFloat(rating) || 0, reviews: 0, imageUrl: el.querySelector('img')?.src || '', address: dest, amenities: [] };
      }).filter((h: any) => h.price > 0 && h.name);
    });
  });
}

// ============ HOTELS: AIRBNB ============
export async function scrapeAirbnb(dest: string, checkin: string, checkout: string): Promise<ScrapedHotel[]> {
  return withPage(async (page) => {
    await page.goto(`https://www.airbnb.com.br/s/${encodeURIComponent(dest)}/homes?checkin=${checkout}&checkout=${checkin}&adults=2`, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(8000);
    return page.evaluate(() => {
      return Array.from(document.querySelectorAll('[itemprop="itemListElement"], [data-testid="card-container"]')).slice(0, 20).map((el, i) => {
        const name = el.querySelector('[data-testid="listing-card-title"]')?.textContent?.trim() || '';
        const priceText = el.querySelector('[data-testid="price-availability-row"]')?.textContent?.trim() || '';
        const priceMatch = priceText.match(/R\$\s*([\d.,]+)/);
        const price = priceMatch ? parseFloat(priceMatch[1].replace(/\./g, '').replace(',', '.')) : 0;
        return { id: `air-${Date.now()}-${i}`, name, price, rating: 0, reviews: 0, imageUrl: el.querySelector('img')?.src || '', address: dest, amenities: [] };
      }).filter((h: any) => h.price > 0 && h.name);
    });
  });
}

// ============ EVENTS: SYMPLA ============
export async function scrapeSympla(keyword: string): Promise<ScrapedEvent[]> {
  return withPage(async (page) => {
    await page.goto(`https://www.sympla.com.br/buscar?q=${encodeURIComponent(keyword)}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(5000);
    return page.evaluate(() => {
      return Array.from(document.querySelectorAll('[class*="event-card"], .sympla-card')).slice(0, 20).map((el, i) => {
        const name = el.querySelector('h2, [class*="title"]')?.textContent?.trim() || '';
        const dateText = el.querySelector('time, [class*="date"]')?.textContent?.trim() || '';
        const priceText = el.querySelector('[class*="price"]')?.textContent?.trim() || '';
        const price = parseFloat(priceText.replace(/[^\d,]/g, '').replace(',', '.')) || 0;
        return { id: `sym-${Date.now()}-${i}`, name, date: dateText, location: '', price, url: el.querySelector('a')?.href || '' };
      }).filter((e: any) => e.name);
    });
  });
}

// ============ REAL ESTATE: OLX ============
export async function scrapeOLX(keyword: string): Promise<ScrapedListing[]> {
  return withPage(async (page) => {
    await page.goto(`https://www.olx.com.br/imoveis?q=${encodeURIComponent(keyword)}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(5000);
    return page.evaluate(() => {
      return Array.from(document.querySelectorAll('[data-ds-component="DS-AdCard"], .adcard')).slice(0, 20).map((el, i) => {
        const title = el.querySelector('[data-ds-component="DS-Text"]')?.textContent?.trim() || '';
        const priceText = el.querySelector('[data-ds-component="DS-TextPrice"]')?.textContent?.trim() || '';
        const price = parseFloat(priceText.replace(/[^\d.,]/g, '').replace('.', '').replace(',', '.')) || 0;
        return { id: `olx-${Date.now()}-${i}`, title, price, url: el.querySelector('a')?.href || '', store: 'OLX' };
      }).filter((l: any) => l.price > 0 && l.title);
    });
  });
}

// ============ REAL ESTATE: ZAP IMÓVEIS ============
export async function scrapeZapImoveis(keyword: string): Promise<ScrapedListing[]> {
  return withPage(async (page) => {
    await page.goto(`https://www.zapimoveis.com.br/${encodeURIComponent(keyword)}`, { waitUntil: 'domcontentloaded', timeout: 25000 });
    await page.waitForTimeout(5000);
    return page.evaluate(() => {
      return Array.from(document.querySelectorAll('[data-type="property"], .card-listing')).slice(0, 20).map((el, i) => {
        const title = el.querySelector('[class*="title"]')?.textContent?.trim() || '';
        const priceText = el.querySelector('[class*="price"]')?.textContent?.trim() || '';
        const price = parseFloat(priceText.replace(/[^\d.,]/g, '').replace('.', '').replace(',', '.')) || 0;
        return { id: `zap-${Date.now()}-${i}`, title, price, url: el.querySelector('a')?.href || '', store: 'Zap Imóveis' };
      }).filter((l: any) => l.price > 0 && l.title);
    });
  });
}

// ============ UNIFIED SEARCH ============
export type SearchProvider = 'amazon' | 'mercadolivre' | 'magalu' | 'casasbahia' | 'aliexpress' | 'shopee' | 'netshoes' | 'latam' | 'gol' | 'azul' | 'kayak' | 'booking' | 'airbnb' | 'sympla' | 'olx' | 'zap';

export async function searchProvider(provider: SearchProvider, params: any): Promise<any[]> {
  switch (provider) {
    case 'amazon': return scrapeAmazon(params.keyword);
    case 'mercadolivre': return scrapeML(params.keyword);
    case 'magalu': return scrapeMagalu(params.keyword);
    case 'casasbahia': return scrapeCasasBahia(params.keyword);
    case 'aliexpress': return scrapeAliExpress(params.keyword);
    case 'shopee': return scrapeShopee(params.keyword);
    case 'netshoes': return scrapeNetshoes(params.keyword);
    case 'latam': return scrapeFlightsLATAM(params.origin, params.destination, params.date);
    case 'gol': return scrapeFlightsGOL(params.origin, params.destination, params.date);
    case 'azul': return scrapeFlightsAzul(params.origin, params.destination, params.date);
    case 'kayak': return scrapeFlightsKAYAK(params.origin, params.destination, params.date);
    case 'booking': return scrapeBooking(params.destination, params.checkin, params.checkout);
    case 'airbnb': return scrapeAirbnb(params.destination, params.checkin, params.checkout);
    case 'sympla': return scrapeSympla(params.keyword);
    case 'olx': return scrapeOLX(params.keyword);
    case 'zap': return scrapeZapImoveis(params.keyword);
    default: return [];
  }
}
