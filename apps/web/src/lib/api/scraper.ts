// Unified Web Scraper — Hybrid Approach
// Playwright for complex stores (Amazon, ML, Magalu)
// Fetch + HTML parse for simpler stores (Casas Bahia, AliExpress, Shopee, Netshoes)

import { chromium, type Browser } from 'playwright-core';
import type { ScrapedProduct } from '@/types/shopping';

// ============ Cache ============
const cache = new Map<string, { data: ScrapedProduct[]; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

function getCached(key: string): ScrapedProduct[] | null {
  const entry = cache.get(key);
  if (entry && Date.now() - entry.timestamp < CACHE_TTL) {
    return entry.data;
  }
  cache.delete(key);
  return null;
}

function setCache(key: string, data: ScrapedProduct[]): void {
  cache.set(key, { data, timestamp: Date.now() });
}

// ============ Browser Manager (Playwright) ============
let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (!browserInstance || !browserInstance.isConnected()) {
    browserInstance = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  }
  return browserInstance;
}

async function withPage<T>(fn: (page: any) => Promise<T>): Promise<T> {
  const browser = await getBrowser();
  const ctx = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    locale: 'pt-BR',
  });
  const page = await ctx.newPage();
  try {
    return await fn(page);
  } finally {
    await page.close();
    await ctx.close();
  }
}

// ============ Fetch + HTML Parse Helper ============
async function fetchAndParse(url: string, parser: (html: string) => ScrapedProduct[]): Promise<ScrapedProduct[]> {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(30000),
  });
  
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  
  const html = await res.text();
  return parser(html);
}

// ============ HTML Parser Helpers ============
function parsePrice(text: string): number {
  // Remove R$, spaces, and parse Brazilian price format
  const cleaned = text.replace(/R\$\s*/, '').replace(/\./g, '').replace(',', '.').trim();
  return parseFloat(cleaned) || 0;
}

function extractText(html: string, selector: string): string {
  // Simple regex-based extraction for static HTML
  const regex = new RegExp(`<[^>]*class="[^"]*${selector}[^"]*"[^>]*>([^<]*)<`, 'i');
  const match = html.match(regex);
  return match?.[1]?.trim() || '';
}

function extractAttribute(html: string, selector: string, attribute: string): string {
  const regex = new RegExp(`<[^>]*class="[^"]*${selector}[^"]*"[^>]*${attribute}="([^"]*)"`, 'i');
  const match = html.match(regex);
  return match?.[1]?.trim() || '';
}

// ============ SHOPPING SCRAPERS ============

// === PLAYWRIGHT SCRAPERS (Complex stores) ===

export async function scrapeAmazon(keyword: string): Promise<ScrapedProduct[]> {
  const cacheKey = `amazon:${keyword}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const results = await withPage(async (page) => {
    await page.goto(`https://www.amazon.com.br/s?k=${encodeURIComponent(keyword)}&language=pt_BR`, {
      waitUntil: 'domcontentloaded',
      timeout: 25000,
    });
    await page.waitForTimeout(3000);
    await page.waitForSelector('[data-component-type="s-search-result"], .s-result-item[data-asin]', { timeout: 15000 }).catch(() => {});
    
    return page.evaluate(() => {
      return Array.from(document.querySelectorAll('[data-component-type="s-search-result"], .s-result-item[data-asin]'))
        .slice(0, 20)
        .map((el, i) => {
          const title = el.querySelector('h2 span, .a-text-normal')?.textContent?.trim() || '';
          const w = el.querySelector('.a-price-whole')?.textContent?.replace(/\./g, '').trim() || '0';
          const f = el.querySelector('.a-price-fraction')?.textContent?.trim() || '00';
          const price = parseFloat(`${w}.${f}`) || 0;
          const link = el.querySelector('h2 a, a.a-link-normal')?.getAttribute('href') || '';
          const imageUrl = el.querySelector('img')?.getAttribute('src') || '';
          const rating = el.querySelector('.a-icon-alt')?.textContent?.match(/[\d.]+/)?.[0];
          
          return {
            id: `amz-${Date.now()}-${i}`,
            title,
            price,
            originalPrice: price,
            url: link.startsWith('http') ? link : `https://www.amazon.com.br${link}`,
            store: 'Amazon',
            imageUrl,
            rating: rating ? parseFloat(rating) : undefined,
          };
        })
        .filter((p: any) => p.price > 0 && p.title);
    });
  });

  setCache(cacheKey, results);
  return results;
}

export async function scrapeML(keyword: string): Promise<ScrapedProduct[]> {
  const cacheKey = `ml:${keyword}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const results = await withPage(async (page) => {
    await page.goto(`https://lista.mercadolivre.com.br/${encodeURIComponent(keyword)}`, {
      waitUntil: 'domcontentloaded',
      timeout: 25000,
    });
    await page.waitForTimeout(5000);
    await page.waitForSelector('.ui-search-layout__item, .ui-search-result__wrapper', { timeout: 15000 }).catch(() => {});
    
    return page.evaluate(() => {
      return Array.from(document.querySelectorAll('.ui-search-layout__item, .ui-search-result'))
        .slice(0, 20)
        .map((el, i) => {
          const title = el.querySelector('.ui-search-item__title, .poly-component__title')?.textContent?.trim() || '';
          const priceEl = el.querySelector('.andes-money-amount__fraction');
          const price = priceEl ? parseFloat(priceEl.textContent.replace(/\./g, '').replace(',', '.')) : 0;
          const link = el.querySelector('a')?.href || '';
          const imageUrl = el.querySelector('img')?.src || '';
          
          return {
            id: `ml-${Date.now()}-${i}`,
            title,
            price,
            originalPrice: price,
            url: link.split('#')[0],
            store: 'Mercado Livre',
            imageUrl,
          };
        })
        .filter((p: any) => p.price > 0 && p.title);
    });
  });

  setCache(cacheKey, results);
  return results;
}

export async function scrapeMagalu(keyword: string): Promise<ScrapedProduct[]> {
  const cacheKey = `magalu:${keyword}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const results = await withPage(async (page) => {
    await page.goto(`https://www.magazineluiza.com.br/busca/${encodeURIComponent(keyword)}/`, {
      waitUntil: 'domcontentloaded',
      timeout: 25000,
    });
    await page.waitForTimeout(3000);
    
    return page.evaluate(() => {
      const items = document.querySelectorAll('[data-testid="product-card"], .product-card');
      return Array.from(items)
        .slice(0, 20)
        .map((el, i) => {
          const title = el.querySelector('h2, [data-testid="product-title"]')?.textContent?.trim() || '';
          const priceText = el.querySelector('[data-testid="product-price"], .price-value')?.textContent?.trim() || '';
          const price = parsePrice(priceText);
          const link = el.querySelector('a')?.href || '';
          const imageUrl = el.querySelector('img')?.src || '';
          
          return {
            id: `mag-${Date.now()}-${i}`,
            title,
            price,
            originalPrice: price,
            url: link,
            store: 'Magazine Luiza',
            imageUrl,
          };
        })
        .filter((p: any) => p.price > 0 && p.title);
    });
  });

  setCache(cacheKey, results);
  return results;
}

// === FETCH + HTML PARSE SCRAPERS (Simpler stores) ===

export async function scrapeCasasBahia(keyword: string): Promise<ScrapedProduct[]> {
  const cacheKey = `casasbahia:${keyword}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const results = await fetchAndParse(
    `https://www.casasbahia.com.br/busca/${encodeURIComponent(keyword)}`,
    (html) => {
      const products: ScrapedProduct[] = [];
      // Parse product cards from HTML
      const cardRegex = /<div[^>]*data-testid="product-card"[^>]*>([\s\S]*?)<\/div>/gi;
      let match;
      let i = 0;
      
      while ((match = cardRegex.exec(html)) && i < 20) {
        const cardHtml = match[1];
        const title = extractText(cardHtml, 'product-card-title');
        const priceText = extractText(cardHtml, 'product-card-price');
        const price = parsePrice(priceText);
        const url = extractAttribute(cardHtml, 'product-card', 'href');
        const imageUrl = extractAttribute(cardHtml, 'product-card', 'src');
        
        if (price > 0 && title) {
          products.push({
            id: `cb-${Date.now()}-${i}`,
            title,
            price,
            originalPrice: price,
            url: url.startsWith('http') ? url : `https://www.casasbahia.com.br${url}`,
            store: 'Casas Bahia',
            imageUrl,
          });
          i++;
        }
      }
      
      return products;
    }
  );

  setCache(cacheKey, results);
  return results;
}

export async function scrapeAliExpress(keyword: string): Promise<ScrapedProduct[]> {
  const cacheKey = `aliexpress:${keyword}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const results = await fetchAndParse(
    `https://www.aliexpress.com/w/wholesale-${encodeURIComponent(keyword)}.html`,
    (html) => {
      const products: ScrapedProduct[] = [];
      const cardRegex = /<div[^>]*class="[^"]*product-card[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
      let match;
      let i = 0;
      
      while ((match = cardRegex.exec(html)) && i < 20) {
        const cardHtml = match[1];
        const title = extractText(cardHtml, 'title');
        const priceText = extractText(cardHtml, 'price');
        const price = parsePrice(priceText);
        const url = extractAttribute(cardHtml, 'product-card', 'href');
        const imageUrl = extractAttribute(cardHtml, 'product-card', 'src');
        
        if (price > 0 && title) {
          products.push({
            id: `ali-${Date.now()}-${i}`,
            title,
            price,
            originalPrice: price,
            url: url.startsWith('http') ? url : `https://www.aliexpress.com${url}`,
            store: 'AliExpress',
            imageUrl,
          });
          i++;
        }
      }
      
      return products;
    }
  );

  setCache(cacheKey, results);
  return results;
}

export async function scrapeShopee(keyword: string): Promise<ScrapedProduct[]> {
  const cacheKey = `shopee:${keyword}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const results = await fetchAndParse(
    `https://shopee.com.br/search?keyword=${encodeURIComponent(keyword)}`,
    (html) => {
      const products: ScrapedProduct[] = [];
      const cardRegex = /<div[^>]*class="[^"]*shopee-search-item[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
      let match;
      let i = 0;
      
      while ((match = cardRegex.exec(html)) && i < 20) {
        const cardHtml = match[1];
        const title = extractText(cardHtml, 'name');
        const priceText = extractText(cardHtml, 'price');
        const price = parsePrice(priceText);
        const url = extractAttribute(cardHtml, 'shopee-search-item', 'href');
        const imageUrl = extractAttribute(cardHtml, 'shopee-search-item', 'src');
        
        if (price > 0 && title) {
          products.push({
            id: `sh-${Date.now()}-${i}`,
            title,
            price,
            originalPrice: price,
            url: url.startsWith('http') ? url : `https://shopee.com.br${url}`,
            store: 'Shopee',
            imageUrl,
          });
          i++;
        }
      }
      
      return products;
    }
  );

  setCache(cacheKey, results);
  return results;
}

export async function scrapeNetshoes(keyword: string): Promise<ScrapedProduct[]> {
  const cacheKey = `netshoes:${keyword}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const results = await fetchAndParse(
    `https://www.netshoes.com.br/busca?q=${encodeURIComponent(keyword)}`,
    (html) => {
      const products: ScrapedProduct[] = [];
      const cardRegex = /<div[^>]*data-testid="product-card"[^>]*>([\s\S]*?)<\/div>/gi;
      let match;
      let i = 0;
      
      while ((match = cardRegex.exec(html)) && i < 20) {
        const cardHtml = match[1];
        const title = extractText(cardHtml, 'product-title');
        const priceText = extractText(cardHtml, 'price');
        const price = parsePrice(priceText);
        const url = extractAttribute(cardHtml, 'product-card', 'href');
        const imageUrl = extractAttribute(cardHtml, 'product-card', 'src');
        
        if (price > 0 && title) {
          products.push({
            id: `ns-${Date.now()}-${i}`,
            title,
            price,
            originalPrice: price,
            url: url.startsWith('http') ? url : `https://www.netshoes.com.br${url}`,
            store: 'Netshoes',
            imageUrl,
          });
          i++;
        }
      }
      
      return products;
    }
  );

  setCache(cacheKey, results);
  return results;
}

// ============ UNIFIED SEARCH ============

export type StoreId = 'amazon' | 'mercadolivre' | 'magalu' | 'casasbahia' | 'aliexpress' | 'shopee' | 'netshoes';

export const STORES: Record<StoreId, { name: string; color: string; scraper: (keyword: string) => Promise<ScrapedProduct[]> }> = {
  amazon: { name: 'Amazon', color: '#FF9900', scraper: scrapeAmazon },
  mercadolivre: { name: 'Mercado Livre', color: '#FFE600', scraper: scrapeML },
  magalu: { name: 'Magazine Luiza', color: '#E41E2C', scraper: scrapeMagalu },
  casasbahia: { name: 'Casas Bahia', color: '#0066CC', scraper: scrapeCasasBahia },
  aliexpress: { name: 'AliExpress', color: '#E43225', scraper: scrapeAliExpress },
  shopee: { name: 'Shopee', color: '#EE4D2D', scraper: scrapeShopee },
  netshoes: { name: 'Netshoes', color: '#00A859', scraper: scrapeNetshoes },
};

export async function searchProducts(
  keyword: string,
  stores: StoreId[] = Object.keys(STORES) as StoreId[]
): Promise<{ products: ScrapedProduct[]; resultsByStore: Record<string, ScrapedProduct[]> }> {
  const resultsByStore: Record<string, ScrapedProduct[]> = {};
  
  // Scrape all stores in parallel
  const promises = stores.map(async (storeId) => {
    try {
      const store = STORES[storeId];
      const products = await store.scraper(keyword);
      resultsByStore[storeId] = products;
      return products;
    } catch (error) {
      console.error(`[scraper] Error scraping ${storeId}:`, error);
      resultsByStore[storeId] = [];
      return [];
    }
  });
  
  const allResults = await Promise.all(promises);
  const allProducts = allResults.flat();
  
  // Deduplicate by title + store + price
  const seen = new Set<string>();
  const deduped = allProducts.filter((p) => {
    const key = `${p.title.toLowerCase().substring(0, 30)}-${p.store}-${p.price}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  
  // Sort by price
  deduped.sort((a, b) => a.price - b.price);
  
  return { products: deduped, resultsByStore };
}

// ============ HEALTH CHECK ============

export async function checkStoreHealth(storeId: StoreId): Promise<{ healthy: boolean; latency: number; error?: string }> {
  const start = Date.now();
  try {
    const store = STORES[storeId];
    const products = await store.scraper('teste');
    const latency = Date.now() - start;
    return { healthy: products.length > 0, latency };
  } catch (error: any) {
    const latency = Date.now() - start;
    return { healthy: false, latency, error: error.message || 'Unknown error' };
  }
}

export async function checkAllStoresHealth(): Promise<Record<StoreId, { healthy: boolean; latency: number; error?: string }>> {
  const results: Record<string, any> = {};
  const storeIds = Object.keys(STORES) as StoreId[];
  
  await Promise.all(
    storeIds.map(async (storeId) => {
      results[storeId] = await checkStoreHealth(storeId);
    })
  );
  
  return results as Record<StoreId, { healthy: boolean; latency: number; error?: string }>;
}
