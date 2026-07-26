import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));
    const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));

    const budgets = await prisma.budget.findMany({
      where: { userId, month, year },
    });

    const transactions = await prisma.transaction.findMany({
      where: {
        userId,
        category: { not: null },
        date: {
          gte: new Date(year, month - 1, 1),
          lt: new Date(year, month, 1),
        },
      },
    });

    const spentByCategory: Record<string, number> = {};
    for (const t of transactions) {
      if (t.category) {
        spentByCategory[t.category] = (spentByCategory[t.category] || 0) + Number(t.amount);
      }
    }

    let totalBudget = 0;
    let totalSpent = 0;
    const categories = budgets.map((b) => {
      const spent = spentByCategory[b.category] || 0;
      const limit = Number(b.limit);
      totalBudget += limit;
      totalSpent += spent;
      const percentage = limit > 0 ? (spent / limit) * 100 : 0;
      const status = percentage >= 100 ? 'danger' : percentage >= 80 ? 'warning' : 'safe';

      return {
        id: b.id,
        category: b.category,
        limit,
        spent,
        remaining: limit - spent,
        percentage: Math.round(percentage * 100) / 100,
        status,
      };
    });

    const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;
    const overallStatus = overallPercentage >= 100 ? 'danger' : overallPercentage >= 80 ? 'warning' : 'safe';

    return Response.json({
      success: true,
      data: {
        totalBudget,
        totalSpent,
        percentage: Math.round(overallPercentage * 100) / 100,
        status: overallStatus,
        categories,
      },
    });
  });
}
