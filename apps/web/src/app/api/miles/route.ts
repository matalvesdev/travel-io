import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const program = searchParams.get('program');

    const [programs, transactions] = await Promise.all([
      prisma.milesAccount.findMany({
        where: {
          userId,
          ...(program ? { program } : {}),
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.milesTransaction.findMany({
        where: { userId },
        orderBy: { date: 'desc' },
        take: 50,
      }),
    ]);

    return Response.json({
      success: true,
      data: { programs, transactions },
    });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    const data = await prisma.milesAccount.create({
      data: {
        program: body.program,
        balance: body.balance ?? 0,
        expiringIn30Days: body.expiring_in_30_days ?? 0,
        expiringDate: body.expiring_date ? new Date(body.expiring_date) : null,
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

    const existing = await prisma.milesAccount.findFirst({ where: { id, userId } });
    if (!existing) {
      return Response.json({ success: false, message: 'Conta de milhas não encontrada' }, { status: 404 });
    }

    const data = await prisma.milesAccount.update({ where: { id }, data: updates });
    return Response.json({ success: true, data });
  });
}
