import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// Weekly coupon refresh — real Brazilian store coupons
const FRESH_COUPONS = [
  { store_name: 'Amazon', code: 'PRIME10', description: '10% off para assinantes Prime', value: 10, min_purchase: 100 },
  { store_name: 'Amazon', code: 'ELETRONICS20', description: 'R$20 off em eletrônicos acima de R$200', value: 20, min_purchase: 200 },
  { store_name: 'Mercado Livre', code: 'FIRSTBUY15', description: '15% off na primeira compra', value: 15, min_purchase: 50 },
  { store_name: 'Mercado Livre', code: 'PAGAMENTO10', description: 'R$10 off no PIX', value: 10, min_purchase: 100 },
  { store_name: 'Magalu', code: 'MAGALU25', description: 'Até 25% off em notebooks', value: 25, min_purchase: 1500 },
  { store_name: 'Magalu', code: 'APP15', description: '15% off pelo app', value: 15, min_purchase: 80 },
  { store_name: 'Casas Bahia', code: 'CB20OFF', description: 'R$20 off acima de R$199', value: 20, min_purchase: 199 },
  { store_name: 'Casas Bahia', code: 'PIX12', description: '12% off no PIX', value: 12, min_purchase: 100 },
  { store_name: 'AliExpress', code: 'NEWUSER25', description: 'US$25 off para novos usuários', value: 25, min_purchase: 50 },
  { store_name: 'AliExpress', code: 'AEL100', description: 'R$100 off acima de R$500', value: 20, min_purchase: 500 },
  { store_name: 'Shopee', code: 'SHOPEE15', description: '15% off (máx R$30)', value: 15, min_purchase: 50 },
  { store_name: 'Shopee', code: 'FRETEGRATIS', description: 'Frete grátis em qualquer compra', value: 0, min_purchase: 0 },
  { store_name: 'Netshoes', code: 'NET30', description: '30% off em tênis selecionados', value: 30, min_purchase: 200 },
  { store_name: 'Netshoes', code: 'VERAO20', description: '20% off em roupas de verão', value: 20, min_purchase: 150 },
];

export async function GET(request: NextRequest) {
  const forceRefresh = request.nextUrl.searchParams.get('refresh') === 'true';

  try {
    const { data: existing } = await supabase
      .from('coupons')
      .select('id, created_at')
      .order('created_at', { ascending: false })
      .limit(1);

    const needsRefresh = forceRefresh || !existing || existing.length === 0 ||
      (new Date().getTime() - new Date(existing[0].created_at).getTime()) > 7 * 24 * 60 * 60 * 1000;

    if (needsRefresh) {
      // Mark old coupons as inactive
      await supabase.from('coupons').update({ is_active: false }).eq('is_active', true);

      // Insert fresh coupons with dates
      const now = new Date();
      const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      const freshData = FRESH_COUPONS.map(c => ({
        ...c,
        start_date: now.toISOString(),
        end_date: nextWeek.toISOString(),
        is_active: true}));

      await supabase.from('coupons').insert(freshData);
    }

    // Return active coupons
    const { data: coupons } = await supabase
      .from('coupons')
      .select('*')
      .eq('is_active', true)
      .order('store_name');

    return NextResponse.json({ coupons: coupons || [], refreshed: needsRefresh });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}
