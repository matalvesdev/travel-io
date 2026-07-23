import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { searchProducts, type StoreId } from '@/lib/api/scraper';

// This route can be triggered by external cron (Vercel Cron, GitHub Actions, etc.)
// It checks all active monitors for price changes and updates them

export async function GET(request: NextRequest) {
  // Verify cron secret (for production use)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Get all active monitors
    const monitors = await prisma.priceMonitor.findMany({
      where: { isActive: true },
    });

    console.log(`[price-check] Checking ${monitors.length} monitors...`);

    const results = {
      checked: 0,
      updated: 0,
      alerts: 0,
      errors: 0,
    };

    // Check each monitor
    for (const monitor of monitors) {
      try {
        results.checked++;
        
        // Search for the product
        const { products } = await searchProducts(monitor.productName, ['amazon', 'mercadolivre', 'magalu']);
        
        if (products.length === 0) {
          console.log(`[price-check] No products found for "${monitor.productName}"`);
          continue;
        }

        const cheapest = products[0];
        const newPrice = cheapest.price;
        const oldPrice = Number(monitor.currentPrice) || 0;
        const targetPrice = Number(monitor.targetPrice) || 0;

        // Update monitor with new price
        const currentHistory = (monitor.priceHistory as any[]) || [];
        const newEntry = {
          price: newPrice,
          timestamp: new Date().toISOString(),
          source: cheapest.store,
        };

        await prisma.priceMonitor.update({
          where: { id: monitor.id },
          data: {
            currentPrice: newPrice,
            lowestPrice: Math.min(Number(monitor.lowestPrice) || newPrice, newPrice),
            lastChecked: new Date(),
            priceHistory: [...currentHistory, newEntry].slice(-50), // Keep last 50 entries
          },
        });

        results.updated++;

        // Check if price dropped below target
        if (targetPrice > 0 && newPrice <= targetPrice && (oldPrice === 0 || oldPrice > targetPrice)) {
          // Create alert
          await prisma.priceAlert.create({
            data: {
              userId: monitor.userId,
              name: monitor.productName,
              type: 'price_drop',
              store: cheapest.store,
              currentPrice: newPrice,
              targetPrice: targetPrice,
              active: true,
            },
          });

          results.alerts++;
          console.log(`[price-check] ALERT: ${monitor.productName} dropped to ${newPrice} (target: ${targetPrice})`);
        }

        // Small delay between checks to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        results.errors++;
        console.error(`[price-check] Error checking monitor ${monitor.id}:`, error);
      }
    }

    console.log(`[price-check] Completed: ${results.checked} checked, ${results.updated} updated, ${results.alerts} alerts, ${results.errors} errors`);

    return NextResponse.json({
      success: true,
      message: 'Price check completed',
      results,
      timestamp: new Date().toISOString(),
    });

  } catch (error: any) {
    console.error('[price-check] Fatal error:', error);
    return NextResponse.json(
      { error: 'Price check failed', details: error.message },
      { status: 500 }
    );
  }
}
