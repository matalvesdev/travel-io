import { NextRequest, NextResponse } from 'next/server';
import { searchProducts, STORES, type StoreId } from '@/lib/api/scraper';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const keyword = searchParams.get('q') || '';
  const storeParam = searchParams.get('store') || 'all';

  if (!keyword) {
    return NextResponse.json({ error: 'q parameter required' }, { status: 400 });
  }

  try {
    // Determine which stores to search
    let storesToSearch: StoreId[];
    
    if (storeParam === 'all') {
      storesToSearch = Object.keys(STORES) as StoreId[];
    } else if (storeParam in STORES) {
      storesToSearch = [storeParam as StoreId];
    } else {
      return NextResponse.json({ error: `Invalid store: ${storeParam}` }, { status: 400 });
    }

    // Search products across stores
    const { products, resultsByStore } = await searchProducts(keyword, storesToSearch);

    return NextResponse.json({
      products,
      total: products.length,
      source: 'hybrid',
      store: storeParam,
      resultsByStore,
    });
  } catch (error: any) {
    console.error(`[products] Error searching "${keyword}":`, error);
    return NextResponse.json(
      { error: 'Failed to search products', details: error.message },
      { status: 500 }
    );
  }
}
