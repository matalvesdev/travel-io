export const STORE_REPUTATION: Record<string, number> = {
  'Amazon': 4.7,
  'Mercado Livre': 4.5,
  'Magazine Luiza': 4.3,
  'Casas Bahia': 4.0,
  'AliExpress': 3.8,
  'Shopee': 3.9,
  'Netshoes': 4.2,
};

export const CONDITION_FACTORS: Record<string, number> = {
  'Novo': 1.0,
  'Seminovo': 0.8,
  'Usado': 0.6,
};

export function calcReliability(
  store: string,
  condition: string,
  price: number,
  avgPrice: number
): number {
  const storeScore = STORE_REPUTATION[store] || 3.5;
  const conditionFactor = CONDITION_FACTORS[condition] || 0.8;
  
  // Normalize store score to 0-50 range
  const storeNormalized = (storeScore / 5) * 50;
  
  // Condition factor contributes 0-20 points
  const conditionPoints = conditionFactor * 20;
  
  // Price competitiveness contributes 0-30 points
  let pricePoints = 15; // neutral
  if (avgPrice > 0) {
    const priceRatio = price / avgPrice;
    if (priceRatio <= 0.8) pricePoints = 30; // great deal
    else if (priceRatio <= 0.95) pricePoints = 25;
    else if (priceRatio <= 1.05) pricePoints = 20;
    else if (priceRatio <= 1.2) pricePoints = 10;
    else pricePoints = 5; // overpriced
  }
  
  const total = Math.round(storeNormalized + conditionPoints + pricePoints);
  return Math.min(100, Math.max(0, total));
}

export function getReliabilityColor(score: number): string {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-amber-500';
  return 'text-destructive';
}

export function getReliabilityBg(score: number): string {
  if (score >= 80) return 'bg-success/10';
  if (score >= 60) return 'bg-amber-500/10';
  return 'bg-destructive/10';
}