import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const DEALS = [
  { product_name: 'iPhone 15 Pro Max 256GB', store_name: 'Apple Store', original_price: 9499, deal_price: 8499, savings: 1000, url: 'https://apple.com.br', is_active: true },
  { product_name: 'MacBook Air M3 13"', store_name: 'Amazon', original_price: 12999, deal_price: 10999, savings: 2000, url: 'https://amazon.com.br', is_active: true },
  { product_name: 'Samsung Galaxy S24 Ultra', store_name: 'Magazine Luiza', original_price: 8999, deal_price: 7499, savings: 1500, url: 'https://magazineluiza.com.br', is_active: true },
  { product_name: 'Sony WH-1000XM5', store_name: 'Americanas', original_price: 1899, deal_price: 1399, savings: 500, url: 'https://americanas.com.br', is_active: true },
  { product_name: 'iPad Air M2 11"', store_name: 'Casas Bahia', original_price: 6499, deal_price: 5799, savings: 700, url: 'https://casasbahia.com.br', is_active: true },
  { product_name: 'PlayStation 5 Slim', store_name: 'Amazon', original_price: 3999, deal_price: 3499, savings: 500, url: 'https://amazon.com.br', is_active: true },
  { product_name: 'Nike Air Max 270', store_name: 'Netshoes', original_price: 899, deal_price: 599, savings: 300, url: 'https://netshoes.com.br', is_active: true },
  { product_name: 'Dyson V15 Detect', store_name: 'Magazine Luiza', original_price: 4999, deal_price: 3999, savings: 1000, url: 'https://magazineluiza.com.br', is_active: true },
  { product_name: 'Air Fryer Mondial 5L', store_name: 'Mercado Livre', original_price: 399, deal_price: 269, savings: 130, url: 'https://mercadolivre.com.br', is_active: true },
  { product_name: 'Kindle Paperwhite 11a Gen', store_name: 'Amazon', original_price: 649, deal_price: 499, savings: 150, url: 'https://amazon.com.br', is_active: true },
  { product_name: 'LG OLED C3 55"', store_name: 'Ponto', original_price: 5999, deal_price: 4499, savings: 1500, url: 'https://pfrf.com.br', is_active: true },
  { product_name: 'JBL Charge 5', store_name: 'Shopee', original_price: 599, deal_price: 399, savings: 200, url: 'https://shopee.com.br', is_active: true },
  { product_name: 'Robot Roborock S8', store_name: 'Mercado Livre', original_price: 3999, deal_price: 2999, savings: 1000, url: 'https://mercadolivre.com.br', is_active: true },
  { product_name: 'Apple Watch Series 9', store_name: 'iPlace', original_price: 3999, deal_price: 3499, savings: 500, url: 'https://iplace.com.br', is_active: true },
  { product_name: 'Sofa 3 Lugares Collon', store_name: 'Mobly', original_price: 2499, deal_price: 1799, savings: 700, url: 'https://mobly.com.br', is_active: true },
  { product_name: 'Nintendo Switch OLED', store_name: 'Americanas', original_price: 2499, deal_price: 2199, savings: 300, url: 'https://americanas.com.br', is_active: true },
  { product_name: 'AirPods Pro 2a Gen', store_name: 'Amazon', original_price: 2199, deal_price: 1899, savings: 300, url: 'https://amazon.com.br', is_active: true },
  { product_name: 'Camera Canon EOS R50', store_name: 'Calumet', original_price: 4999, deal_price: 4299, savings: 700, url: 'https://calumet.com.br', is_active: true },
  { product_name: 'Bicicleta MTB Rock Mountain', store_name: 'Decathlon', original_price: 1999, deal_price: 1499, savings: 500, url: 'https://decathlon.com.br', is_active: true },
  { product_name: 'Smart TV Samsung 65 Crystal UHD', store_name: 'Casas Bahia', original_price: 3499, deal_price: 2799, savings: 700, url: 'https://casasbahia.com.br', is_active: true },
];

const COUPONS = [
  { store_name: 'Amazon', code: 'PRIME15', description: '15% off para assinantes Prime', value: 15, min_purchase: 100, is_active: true },
  { store_name: 'Mercado Livre', code: 'PRIMEIRO10', description: 'R$10 off na primeira compra', value: 10, min_purchase: 50, is_active: true },
  { store_name: 'Magazine Luiza', code: 'ML20', description: '20% off em eletronicos', value: 20, min_purchase: 200, is_active: true },
  { store_name: 'Shopee', code: 'FRETEGRATIS', description: 'Frete gratis em qualquer compra', value: 0, min_purchase: 30, is_active: true },
  { store_name: 'Casas Bahia', code: 'CB15', description: '15% off em moveis e decoracao', value: 15, min_purchase: 300, is_active: true },
  { store_name: 'Netshoes', code: 'EXTRA10', description: 'R$10 off em roupas esportivas', value: 10, min_purchase: 100, is_active: true },
  { store_name: 'Americanas', code: 'AMEI10', description: '10% off em qualquer compra', value: 10, min_purchase: 80, is_active: true },
  { store_name: 'Mobly', code: 'MOVEL20', description: '20% off em moveis selecionados', value: 20, min_purchase: 500, is_active: true },
  { store_name: 'Decathlon', code: 'ESPORTE15', description: '15% off em equipamentos esportivos', value: 15, min_purchase: 150, is_active: true },
  { store_name: 'iPlace', code: 'APPLE10', description: '10% off em acessorios Apple', value: 10, min_purchase: 100, is_active: true },
];

export async function POST() {
  try {
    const { error: dealsError } = await supabase.from('deals').insert(DEALS);
    const { error: couponsError } = await supabase.from('coupons').insert(COUPONS);

    return NextResponse.json({
      success: !dealsError && !couponsError,
      message: dealsError || couponsError ? 'Alguns dados falharam' : 'Dados populados com sucesso',
      deals: DEALS.length,
      coupons: COUPONS.length,
      errors: { deals: dealsError?.message, coupons: couponsError?.message }});
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
