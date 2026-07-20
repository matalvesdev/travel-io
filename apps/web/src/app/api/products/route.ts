import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import { chromium } from 'playwright-core';
import path from 'path';

const execAsync = promisify(exec);

const PYTHON_STORES = new Set([
  'mercadolivre', 'ml', 'casasbahia', 'magalu',
  'aliexpress', 'shopee', 'netshoes',
  'booking', 'hoteis.com', 'hoteis', 'trivago', 'google-hotels',
  'sympla', 'eventbrite', 'miles',
  'olx', 'webmotors', 'vivareal', 'zapimoveis', 'zap', 'chavesnamao', 'chaves',
  'latam', 'gol', 'azul', 'kayak', 'smiles', 'maxmilhas', '123milhas', 'clickbus', 'decolar',
]);

const PLAYWRIGHT_STORES = new Set(['amazon']);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('q') || '';
  const store = searchParams.get('store') || 'amazon';
  const destination = searchParams.get('destination') || '';
  const checkin = searchParams.get('checkin') || '';
  const checkout = searchParams.get('checkout') || '';
  const origin = searchParams.get('origin') || '';
  const date = searchParams.get('date') || '';
  const adults = searchParams.get('adults') || '2';
  const guests = searchParams.get('guests') || '2';

  if (!keyword && !destination) {
    return NextResponse.json({ error: 'q or destination parameter required' }, { status: 400 });
  }

  const searchKeyword = keyword || destination;
  let results: any[] = [];
  let total = 0;

  try {
    if (PLAYWRIGHT_STORES.has(store)) {
      const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--disable-setuid-sandbox'] });
      const ctx = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        locale: 'pt-BR'});
      const pageObj = await ctx.newPage();
      try {
        await pageObj.goto(`https://www.amazon.com.br/s?k=${encodeURIComponent(searchKeyword)}&language=pt_BR`, { waitUntil: 'domcontentloaded', timeout: 25000 });
        await pageObj.waitForTimeout(3000);
        await pageObj.waitForSelector('[data-component-type="s-search-result"], .s-result-item[data-asin]', { timeout: 15000 }).catch(() => {});
        results = await pageObj.evaluate(() => {
          return Array.from(document.querySelectorAll('[data-component-type="s-search-result"], .s-result-item[data-asin]')).slice(0, 20).map((el, i) => {
            const title = el.querySelector('h2 span, .a-text-normal')?.textContent?.trim() || '';
            const w = el.querySelector('.a-price-whole')?.textContent?.replace(/\./g, '').trim() || '0';
            const f = el.querySelector('.a-price-fraction')?.textContent?.trim() || '00';
            const price = parseFloat(`${w}.${f}`) || 0;
            const link = el.querySelector('h2 a, a.a-link-normal')?.getAttribute('href') || '';
            return { id: `amz-${Date.now()}-${i}`, title, price, originalPrice: price, url: link.startsWith('http') ? link : `https://www.amazon.com.br${link}`, store: 'Amazon', imageUrl: el.querySelector('img')?.getAttribute('src') || '' };
          }).filter((p: any) => p.price > 0 && p.title);
        });
        total = results.length;
      } finally {
        await pageObj.close();
        await ctx.close();
        await browser.close();
      }
    } else if (PYTHON_STORES.has(store)) {
      const scraperPath = path.join(process.cwd(), '..', '..', 'tools', 'scraper.py');
      let cmd = `python "${scraperPath}" --store ${store}`;
      if (searchKeyword) cmd += ` --keyword "${searchKeyword.replace(/"/g, '\\"')}"`;
      if (destination) cmd += ` --destination "${destination.replace(/"/g, '\\"')}"`;
      if (origin) cmd += ` --origin "${origin.replace(/"/g, '\\"')}"`;
      if (date) cmd += ` --date ${date}`;
      if (checkin) cmd += ` --checkin ${checkin}`;
      if (checkout) cmd += ` --checkout ${checkout}`;
      if (adults) cmd += ` --adults ${adults}`;
      if (guests) cmd += ` --guests ${guests}`;
      const { stdout } = await execAsync(cmd, { timeout: 45000, maxBuffer: 1024 * 1024 });
      const lastLine = stdout.trim().split('\n').pop() || '{}';
      const data = JSON.parse(lastLine);
      results = data.products || [];
      total = data.total || results.length;
    }
  } catch (e: any) {
    console.error(`[scraper] Error [${store}]: ${e?.message || e}`);
  }

  results.sort((a: any, b: any) => (a.price || 0) - (b.price || 0));
  return NextResponse.json({ products: results, total, source: 'local', store });
}

