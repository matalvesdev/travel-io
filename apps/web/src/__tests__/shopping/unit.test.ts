import { describe, it, expect } from 'vitest';

// ============ parse_brl — Brazilian price parser ============
function parse_brl(text: string): number {
  if (!text) return 0;
  let cleaned = text.replace(/[^\d,.]/g, '').trim();
  if (!cleaned) return 0;
  if (cleaned.includes(',')) {
    const parts = cleaned.split(',');
    const integer = parts[0].replace(/\./g, '');
    const decimal = (parts[1] || '00').slice(0, 2);
    return parseFloat(`${integer}.${decimal}`);
  } else {
    const parts = cleaned.split('.');
    if (parts.length > 1) return parseFloat(parts.join(''));
    return parseFloat(cleaned);
  }
}

// ============ extractMeta — product metadata extraction ============
function extractMeta(title: string): { condition: string; brand: string } {
  const lower = title.toLowerCase();
  let condition = 'Novo';
  if (lower.includes('seminovo') || lower.includes('semi-novo')) condition = 'Seminovo';
  else if (lower.includes('usado') || lower.includes('recondicionado') || lower.includes('aceitável') || lower.includes('bom')) condition = 'Usado';
  const brands = ['Asus', 'Lenovo', 'HP', 'Dell', 'Samsung', 'Acer', 'Apple', 'Microsoft', 'Huawei', 'Xiaomi', 'Positivo', 'Multilaser', 'Avell', 'Msi', 'Gigabyte', 'Nvidia', 'Razer'];
  const brand = brands.find(b => lower.includes(b.toLowerCase())) || '';
  return { condition, brand };
}

// ============ parse_brl Tests ============
describe('parse_brl', () => {
  it('parses standard Brazilian price "R$ 1.234,56"', () => {
    expect(parse_brl('R$ 1.234,56')).toBe(1234.56);
  });

  it('parses price without decimals "R$ 1.018"', () => {
    expect(parse_brl('R$ 1.018')).toBe(1018);
  });

  it('parses price with both dot and comma "R$ 1.018,90"', () => {
    expect(parse_brl('R$ 1.018,90')).toBe(1018.90);
  });

  it('parses small price "R$ 29,90"', () => {
    expect(parse_brl('R$ 29,90')).toBe(29.90);
  });

  it('parses large price "R$ 12.499,00"', () => {
    expect(parse_brl('R$ 12.499,00')).toBe(12499.00);
  });

  it('handles empty string', () => {
    expect(parse_brl('')).toBe(0);
  });

  it('handles null/undefined', () => {
    expect(parse_brl(null as any)).toBe(0);
    expect(parse_brl(undefined as any)).toBe(0);
  });

  it('handles price without R$ prefix', () => {
    expect(parse_brl('1.234,56')).toBe(1234.56);
  });

  it('handles integer price', () => {
    expect(parse_brl('500')).toBe(500);
  });

  it('handles price with extra spaces', () => {
    expect(parse_brl('  R$  1.234,56  ')).toBe(1234.56);
  });
});

// ============ extractMeta Tests ============
describe('extractMeta', () => {
  it('detects Apple brand', () => {
    const result = extractMeta('Apple iPhone 15 (128 GB) Preto');
    expect(result.brand).toBe('Apple');
    expect(result.condition).toBe('Novo');
  });

  it('detects Asus brand', () => {
    const result = extractMeta('Notebook Asus TUF Gaming A15');
    expect(result.brand).toBe('Asus');
  });

  it('detects Lenovo brand', () => {
    const result = extractMeta('Lenovo IdeaPad Slim 3');
    expect(result.brand).toBe('Lenovo');
  });

  it('detects HP brand', () => {
    const result = extractMeta('HP Pavilion Gamer Core 5');
    expect(result.brand).toBe('HP');
  });

  it('detects Samsung brand', () => {
    const result = extractMeta('Samsung Galaxy S24 Ultra');
    expect(result.brand).toBe('Samsung');
  });

  it('detects used condition from "usado"', () => {
    const result = extractMeta('iPhone 15 Usado - Bom Estado');
    expect(result.condition).toBe('Usado');
  });

  it('detects used condition from "recondicionado"', () => {
    const result = extractMeta('iPhone 14 Recondicionado');
    expect(result.condition).toBe('Usado');
  });

  it('detects seminovo condition', () => {
    const result = extractMeta('iPhone 15 Seminovo Excelente');
    expect(result.condition).toBe('Seminovo');
  });

  it('detects novo as default', () => {
    const result = extractMeta('Notebook Dell Inspiron 15');
    expect(result.condition).toBe('Novo');
  });

  it('detects brand when case is mixed', () => {
    const result = extractMeta('ACER NITRO V15 RTX 4050');
    expect(result.brand).toBe('Acer');
  });

  it('returns empty brand for unknown', () => {
    const result = extractMeta('Notebook Genérico 8GB RAM');
    expect(result.brand).toBe('');
  });

  it('handles empty title', () => {
    const result = extractMeta('');
    expect(result.condition).toBe('Novo');
    expect(result.brand).toBe('');
  });
});
