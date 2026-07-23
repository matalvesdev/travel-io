import { NextRequest, NextResponse } from 'next/server';
import { checkAllStoresHealth, type StoreId } from '@/lib/api/scraper';

export async function GET(request: NextRequest) {
  try {
    const health = await checkAllStoresHealth();
    
    const summary = {
      total: Object.keys(health).length,
      healthy: Object.values(health).filter(h => h.healthy).length,
      degraded: Object.values(health).filter(h => !h.healthy && !h.error).length,
      down: Object.values(health).filter(h => h.error).length,
    };

    return NextResponse.json({
      success: true,
      data: {
        stores: health,
        summary,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('[health] Error checking scraper health:', error);
    return NextResponse.json(
      { error: 'Health check failed', details: error.message },
      { status: 500 }
    );
  }
}
