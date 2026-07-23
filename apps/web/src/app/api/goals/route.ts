import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const data = await prisma.goal.findMany({
      where: { userId },
      orderBy: { id: 'desc' },
    });

    return Response.json({ success: true, data: { goals: data } });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    const data = await prisma.goal.create({
      data: {
        name: body.name,
        targetAmount: body.target_amount,
        currentAmount: body.current_amount ?? 0,
        monthlyContribution: body.monthly_contribution ?? null,
        type: body.type ?? null,
        priority: body.priority ?? null,
        status: body.status ?? 'in_progress',
        userId,
      },
    });

    return Response.json({ success: true, data });
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

    const data = await prisma.goal.update({ where: { id }, data: updates });
    return Response.json({ success: true, data });
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
