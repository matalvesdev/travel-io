import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { prisma } from '@/lib/db';

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    const { goalId, amount, description, date, type } = body;

    if (!goalId || amount === undefined) {
      return Response.json({ success: false, message: 'goalId e amount são obrigatórios' }, { status: 400 });
    }

    const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
    if (!goal) {
      return Response.json({ success: false, message: 'Meta não encontrada' }, { status: 404 });
    }

    const [progress] = await prisma.$transaction([
      prisma.goalProgress.create({
        data: {
          goalId,
          amount: Number(amount),
          description: description || null,
          date: date ? new Date(date) : new Date(),
          type: type || 'manual',
        },
      }),
      prisma.goal.update({
        where: { id: goalId },
        data: {
          currentAmount: { increment: Number(amount) },
        },
      }),
    ]);

    return Response.json({ success: true, data: progress });
  });
}

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const goalId = searchParams.get('goalId');

    if (!goalId) {
      return Response.json({ success: false, message: 'goalId é obrigatório' }, { status: 400 });
    }

    const goal = await prisma.goal.findFirst({ where: { id: goalId, userId } });
    if (!goal) {
      return Response.json({ success: false, message: 'Meta não encontrada' }, { status: 404 });
    }

    const progress = await prisma.goalProgress.findMany({
      where: { goalId },
      orderBy: { date: 'desc' },
    });

    return Response.json({ success: true, data: progress });
  });
}
