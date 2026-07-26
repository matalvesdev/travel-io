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
      orderBy: { category: 'asc' },
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

    const budgetsWithSpent = budgets.map((b) => {
      const spent = spentByCategory[b.category] || 0;
      const remaining = Number(b.limit) - spent;
      const percentage = Number(b.limit) > 0 ? (spent / Number(b.limit)) * 100 : 0;
      const status = percentage >= 100 ? 'danger' : percentage >= 80 ? 'warning' : 'safe';

      return {
        ...b,
        limit: Number(b.limit),
        spent,
        remaining,
        percentage: Math.round(percentage * 100) / 100,
        status,
      };
    });

    return Response.json({ success: true, data: { budgets: budgetsWithSpent } });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    const { category, limit, month, year } = body;

    if (!category || !limit || !month || !year) {
      return Response.json({ success: false, message: 'Campos obrigatórios: category, limit, month, year' }, { status: 400 });
    }

    if (limit <= 0) {
      return Response.json({ success: false, message: 'Limite deve ser maior que zero' }, { status: 400 });
    }

    const data = await prisma.budget.upsert({
      where: {
        userId_category_month_year: { userId, category, month, year },
      },
      update: { limit },
      create: { userId, category, limit, month, year },
    });

    return Response.json({ success: true, data: { ...data, limit: Number(data.limit) } });
  });
}

export async function PUT(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    const { id, limit } = body;

    if (!id) {
      return Response.json({ success: false, message: 'ID não informado' }, { status: 400 });
    }

    const existing = await prisma.budget.findFirst({ where: { id, userId } });
    if (!existing) {
      return Response.json({ success: false, message: 'Orçamento não encontrado' }, { status: 404 });
    }

    if (limit !== undefined && limit <= 0) {
      return Response.json({ success: false, message: 'Limite deve ser maior que zero' }, { status: 400 });
    }

    const data = await prisma.budget.update({
      where: { id },
      data: { limit },
    });

    return Response.json({ success: true, data: { ...data, limit: Number(data.limit) } });
  });
}

export async function DELETE(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return Response.json({ success: false, message: 'ID não informado' }, { status: 400 });
    }

    const existing = await prisma.budget.findFirst({ where: { id, userId } });
    if (!existing) {
      return Response.json({ success: false, message: 'Orçamento não encontrado' }, { status: 404 });
    }

    await prisma.budget.delete({ where: { id } });
    return Response.json({ success: true, message: 'Orçamento excluído' });
  });
}

export async function PATCH(request: NextRequest) {
  return PUT(request);
}
