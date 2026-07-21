import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { prisma } from '@/lib/db';

const createInvestmentSchema = z.object({
  ticker: z.string().min(1, 'Ticker é obrigatório'),
  name: z.string().optional(),
  type: z.string().min(1, 'Tipo é obrigatório'),
  quantity: z.number().positive('Quantidade deve ser maior que 0'),
  avgCost: z.number().positive('Custo médio deve ser maior que 0'),
});

const updateInvestmentSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  ticker: z.string().optional(),
  name: z.string().optional(),
  type: z.string().optional(),
  quantity: z.number().positive('Quantidade deve ser maior que 0').optional(),
  avgCost: z.number().positive('Custo médio deve ser maior que 0').optional(),
});

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');

    const data = await prisma.investment.findMany({
      where: {
        userId,
        ...(type ? { type } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({ success: true, data: { investments: data } });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    const parsed = createInvestmentSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, message: parsed.error.errors[0].message }, { status: 400 });
    }

    const data = await prisma.investment.create({
      data: {
        ticker: parsed.data.ticker,
        name: parsed.data.name ?? '',
        type: parsed.data.type,
        quantity: parsed.data.quantity,
        avgCost: parsed.data.avgCost,
        userId,
      },
    });

    return Response.json({ success: true, data });
  });
}

export async function PATCH(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    const parsed = updateInvestmentSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, message: parsed.error.errors[0].message }, { status: 400 });
    }

    const { id, ...updates } = parsed.data;
    const existing = await prisma.investment.findFirst({ where: { id, userId } });
    if (!existing) {
      return Response.json({ success: false, message: 'Investimento não encontrado' }, { status: 404 });
    }

    const data = await prisma.investment.update({ where: { id }, data: updates });
    return Response.json({ success: true, data });
  });
}

export async function DELETE(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ success: false, message: 'ID não informado' }, { status: 400 });

    const existing = await prisma.investment.findFirst({ where: { id, userId } });
    if (!existing) {
      return Response.json({ success: false, message: 'Investimento não encontrado' }, { status: 404 });
    }

    await prisma.investment.delete({ where: { id } });
    return Response.json({ success: true, message: 'Investimento excluído' });
  });
}
