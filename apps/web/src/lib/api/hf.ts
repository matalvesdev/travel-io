// HuggingFace Inference API Client — Free tier, no key needed for basic models
// Models: sentiment analysis, text similarity, text generation

const HF_BASE = 'https://api-inference.huggingface.co/models';

async function inference(model: string, inputs: any): Promise<any> {
  const apiKey = process.env.HF_API_KEY || ''; // Optional for free tier
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (apiKey) headers['Authorization'] = `Bearer ${apiKey}`;

  const res = await fetch(`${HF_BASE}/${model}`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ inputs }),
    signal: AbortSignal.timeout(15000),
  });

  if (!res.ok) throw new Error(`HF API error: ${res.status}`);
  return res.json();
}

// ─── Sentiment Analysis ───
// Returns: { label: 'POSITIVE'|'NEGATIVE', score: 0-1 }
export async function analyzeSentiment(text: string): Promise<{ label: string; score: number }> {
  try {
    const result = await inference('distilbert-base-uncased-finetuned-sst-2-english', text);
    if (Array.isArray(result) && result.length > 0) {
      return { label: result[0].label, score: result[0].score };
    }
    return { label: 'NEUTRAL', score: 0.5 };
  } catch {
    return { label: 'NEUTRAL', score: 0.5 };
  }
}

// ─── Text Similarity ───
// Returns similarity score 0-1 between two texts
export async function textSimilarity(text1: string, text2: string): Promise<number> {
  try {
    const result = await inference('sentence-transformers/all-MiniLM-L6-v2', { inputs: { source_sentence: text1, sentences: [text2] } });
    if (Array.isArray(result) && result.length > 0) {
      return result[0].score || 0;
    }
    // Fallback: simple word overlap
    const words1 = text1.toLowerCase().split(/\s+/);
    const words2 = text2.toLowerCase().split(/\s+/);
    const overlap = words1.filter(w => words2.includes(w)).length;
    return overlap / Math.max(words1.length, words2.length, 1);
  } catch {
    return 0;
  }
}

// ─── Text Summarization ───
export async function summarize(text: string, maxLen = 130): Promise<string> {
  try {
    const result = await inference('facebook/bart-large-cnn', { inputs: text, parameters: { max_length: maxLen } });
    if (Array.isArray(result) && result.length > 0) {
      return result[0].summary_text || text.substring(0, maxLen);
    }
    return text.substring(0, maxLen);
  } catch {
    return text.substring(0, maxLen);
  }
}

// ─── Product Review Sentiment (for shopping) ───
export async function reviewSentiment(reviews: string[]): Promise<{ positive: number; negative: number; neutral: number; avgScore: number }> {
  const results = await Promise.all(reviews.map(r => analyzeSentiment(r)));
  const positive = results.filter(r => r.label === 'POSITIVE').length;
  const negative = results.filter(r => r.label === 'NEGATIVE').length;
  const neutral = results.length - positive - negative;
  const avgScore = results.reduce((a, r) => a + r.score, 0) / (results.length || 1);
  return { positive, negative, neutral, avgScore };
}

// ─── Destination Recommendation (for travel) ───
export async function recommendDestination(userPreferences: string, availableDestinations: string[]): Promise<{ destination: string; matchScore: number }[]> {
  const results = await Promise.all(
    availableDestinations.map(async dest => {
      const score = await textSimilarity(userPreferences, dest);
      return { destination: dest, matchScore: score };
    })
  );
  return results.sort((a, b) => b.matchScore - a.matchScore);
}

// ─── Smart Itinerary Description ───
export async function generateDescription(city: string, day: number, type: string): Promise<string> {
  const prompts: Record<string, string> = {
    activity: `Sugira uma atividade turística em ${city} para o dia ${day}. Seja específico com nome do lugar.`,
    food: `Recomende um restaurante típico de ${city} para almoço. Seja específico.`,
    transport: `Como se locomover em ${city}? Meio de transporte mais prático.`,
  };
  try {
    return await summarize(prompts[type] || `Atividade em ${city}`, 80);
  } catch {
    return '';
  }
}

// ─── Investment Sentiment (for investments module) ───
export async function investmentSentiment(newsHeadlines: string[]): Promise<{ bullish: number; bearish: number; neutral: number }> {
  const results = await Promise.all(newsHeadlines.map(h => analyzeSentiment(h)));
  const bullish = results.filter(r => r.label === 'POSITIVE' && r.score > 0.7).length;
  const bearish = results.filter(r => r.label === 'NEGATIVE' && r.score > 0.7).length;
  const neutral = results.length - bullish - bearish;
  return { bullish, bearish, neutral };
}

// ─── Miles Redemption Optimizer ───
export async function optimizeMilesRedemption(milesBalance: number, tripCost: number): Promise<{ strategy: string; description: string; savings: number }[]> {
  const strategies = [
    { strategy: 'Full Redemption', description: `Use ${milesBalance.toLocaleString()} pontos para ${(milesBalance * 0.025).toFixed(0)}% do custo`, savings: milesBalance * 0.025 },
    { strategy: 'Hybrid 50/50', description: 'Metade milhas, metade dinheiro', savings: milesBalance * 0.025 * 0.5 + tripCost * 0.5 },
    { strategy: 'Partial Redemption', description: 'Use milhas apenas para trechos caros', savings: milesBalance * 0.03 },
    { strategy: 'Wait for Promo', description: 'Espere promoção de milhas por R$0,015', savings: milesBalance * 0.04 },
  ];
  return strategies.sort((a, b) => b.savings - a.savings);
}
