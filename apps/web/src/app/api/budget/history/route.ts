import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const currentDate = new Date();
    const months: { month: number; year: number }[] = [];

    for (let i = 0; i < 12; i++) {
      const d = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      months.push({ month: d.getMonth() + 1, year: d.getFullYear() });
    }

    const history = [];

    for (const { month, year } of months) {
      const budgets = await prisma.budget.findMany({
        where: { userId, month, year },
      });

      if (budgets.length === 0) continue;

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
        totalBudget += Number(b.limit);
        totalSpent += spent;
        return { category: b.category, budget: Number(b.limit), spent };
      });

      history.push({ month, year, totalBudget, totalSpent, categories });
    }

    return Response.json({ success: true, data: { history } });
  });
}
