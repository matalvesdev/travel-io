import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { prisma } from '@/lib/db';

function toPersistedGoal(goal: any) {
  const target = Number(goal.targetAmount);
  const current = Number(goal.currentAmount);
  const now = new Date();
  const targetDate = goal.targetDate ? new Date(goal.targetDate) : null;
  const startDate = goal.startDate ? new Date(goal.startDate) : goal.createdAt ? new Date(goal.createdAt) : now;
  const daysRemaining = targetDate ? Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : null;
  const monthsRemaining = targetDate ? Math.max(0, (targetDate.getFullYear() - now.getFullYear()) * 12 + targetDate.getMonth() - now.getMonth()) : null;
  const monthlyContribution = goal.monthlyContribution ? Number(goal.monthlyContribution) : 0;
  const remaining = Math.max(0, target - current);
  const progressPercentage = target > 0 ? Math.round((current / target) * 100) : 0;
  const requiredMonthly = monthsRemaining && monthsRemaining > 0 && remaining > 0 ? remaining / monthsRemaining : 0;
  const estimatedMonths = monthlyContribution > 0 ? Math.ceil(remaining / monthlyContribution) : null;
  const estimatedDate = estimatedMonths ? new Date(now.getFullYear(), now.getMonth() + estimatedMonths, 1) : null;
  const isCompleted = goal.status === 'completed';
  const isExpired = !!targetDate && targetDate < now && !isCompleted;
  const isOnTrack = !isExpired && !isCompleted;

  return {
    id: goal.id,
    name: goal.name,
    description: goal.description || '',
    type: goal.type || 'CUSTOM',
    typeName: typeNames[goal.type as keyof typeof typeNames] || 'Personalizado',
    icon: goal.icon || 'target',
    color: goal.color || '#6366f1',
    targetAmount: target,
    currentAmount: current,
    remainingAmount: remaining,
    progressPercentage,
    monthlyContribution,
    startDate: startDate.toISOString(),
    targetDate: targetDate ? targetDate.toISOString() : '',
    daysRemaining,
    monthsRemaining,
    priority: goal.priority || 'MEDIUM',
    status: goal.status,
    isOnTrack,
    isExpired,
    isCompleted,
    requiredMonthlyContribution: Math.round(requiredMonthly * 100) / 100,
    estimatedCompletionDate: estimatedDate ? estimatedDate.toISOString() : '',
    milestones: [],
    progressHistoryCount: goal.progressHistoryCount ?? 0,
  };
}

const typeNames: Record<string, string> = {
  SAVINGS: 'Poupança',
  INVESTMENT: 'Investimento',
  TRAVEL: 'Viagem',
  CUSTOM: 'Personalizado',
};

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const goals = await prisma.goal.findMany({
      where: { userId },
      select: {
        id: true, name: true, description: true, type: true, icon: true, color: true,
        targetAmount: true, currentAmount: true, monthlyContribution: true,
        priority: true, status: true, startDate: true, targetDate: true,
        createdAt: true,
        _count: { select: { progress: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const persisted = goals.map((g) => toPersistedGoal({ ...g, progressHistoryCount: g._count.progress }));
    const totalGoals = persisted.length;
    const activeGoals = persisted.filter((g) => !g.isCompleted).length;
    const totalTarget = persisted.reduce((s, g) => s + g.targetAmount, 0);
    const totalProgress = persisted.reduce((s, g) => s + g.currentAmount, 0);

    return Response.json({
      success: true,
      data: {
        goals: persisted.map((g) => ({ ...g, milestones: [] })),
        totalGoals,
        activeGoals,
        totalTarget,
        totalProgress,
      },
    });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    const data = await prisma.goal.create({
      data: {
        name: body.name,
        description: body.description || null,
        type: body.type || 'CUSTOM',
        icon: body.icon || 'target',
        color: body.color || '#6366f1',
        targetAmount: body.targetAmount ?? 0,
        currentAmount: body.currentAmount ?? 0,
        monthlyContribution: body.monthlyContribution ? Number(body.monthlyContribution) : null,
        priority: body.priority || 'MEDIUM',
        status: body.status || 'in_progress',
        startDate: body.startDate ? new Date(body.startDate) : null,
        targetDate: body.targetDate ? new Date(body.targetDate) : null,
        userId,
      },
    });

    return Response.json({ success: true, data: toPersistedGoal(data) });
  });
}

export async function PATCH(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    const { id, ...updates } = body;
    if (!id) return Response.json({ success: false, message: 'ID não informado' }, { status: 400 });

    const existing = await prisma.goal.findFirst({ where: { id, userId } });
    if (!existing) {
      return Response.json({ success: false, message: 'Meta não encontrada' }, { status: 404 });
    }

    const prismaData: Record<string, unknown> = {};
    if (updates.name !== undefined) prismaData.name = updates.name;
    if (updates.description !== undefined) prismaData.description = updates.description;
    if (updates.type !== undefined) prismaData.type = updates.type;
    if (updates.icon !== undefined) prismaData.icon = updates.icon;
    if (updates.color !== undefined) prismaData.color = updates.color;
    if (updates.targetAmount !== undefined) prismaData.targetAmount = updates.targetAmount;
    if (updates.currentAmount !== undefined) prismaData.currentAmount = updates.currentAmount;
    if (updates.monthlyContribution !== undefined) prismaData.monthlyContribution = updates.monthlyContribution ? Number(updates.monthlyContribution) : null;
    if (updates.priority !== undefined) prismaData.priority = updates.priority;
    if (updates.status !== undefined) prismaData.status = updates.status;
    if (updates.startDate !== undefined) prismaData.startDate = updates.startDate ? new Date(updates.startDate) : null;
    if (updates.targetDate !== undefined) prismaData.targetDate = updates.targetDate ? new Date(updates.targetDate) : null;

    const data = await prisma.goal.update({
      where: { id },
      data: prismaData,
    });

    return Response.json({ success: true, data: toPersistedGoal(data) });
  });
}

export async function DELETE(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ success: false, message: 'ID não informado' }, { status: 400 });

    const existing = await prisma.goal.findFirst({ where: { id, userId } });
    if (!existing) {
      return Response.json({ success: false, message: 'Meta não encontrada' }, { status: 404 });
    }

    await prisma.goal.delete({ where: { id } });
    return Response.json({ success: true, message: 'Meta excluída' });
  });
}

export async function PUT(request: NextRequest) {
  return PATCH(request);
}
