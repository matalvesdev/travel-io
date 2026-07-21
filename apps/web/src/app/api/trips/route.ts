import { NextRequest } from 'next/server';
import { z } from 'zod';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { prisma } from '@/lib/db';

const createTripSchema = z.object({
  destination: z.string().min(1, 'Destino é obrigatório'),
  startDate: z.string().min(1, 'Data de início é obrigatória'),
  endDate: z.string().min(1, 'Data de término é obrigatória'),
  budget: z.number().positive('Orçamento deve ser maior que 0').optional(),
  status: z.string().optional(),
});

const updateTripSchema = z.object({
  id: z.string().min(1, 'ID é obrigatório'),
  status: z.string().optional(),
  destination: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  budget: z.number().optional(),
});

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const data = await prisma.trip.findMany({
      where: {
        userId,
        ...(status ? { status } : {}),
      },
      orderBy: { startDate: 'desc' },
    });

    return Response.json({ success: true, data: { trips: data } });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    const parsed = createTripSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, message: parsed.error.errors[0].message }, { status: 400 });
    }

    const data = await prisma.trip.create({
      data: {
        destination: parsed.data.destination,
        startDate: new Date(parsed.data.startDate),
        endDate: new Date(parsed.data.endDate),
        budget: parsed.data.budget ?? null,
        status: parsed.data.status ?? 'planned',
        userId,
      },
    });

    return Response.json({ success: true, data });
  });
}

export async function PATCH(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    const parsed = updateTripSchema.safeParse(body);
    if (!parsed.success) {
      return Response.json({ success: false, message: parsed.error.errors[0].message }, { status: 400 });
    }

    const { id, startDate, endDate, ...rest } = parsed.data;
    const existing = await prisma.trip.findFirst({ where: { id, userId } });
    if (!existing) {
      return Response.json({ success: false, message: 'Viagem não encontrada' }, { status: 404 });
    }

    const data = await prisma.trip.update({
      where: { id },
      data: {
        ...rest,
        ...(startDate ? { startDate: new Date(startDate) } : {}),
        ...(endDate ? { endDate: new Date(endDate) } : {}),
      },
    });

    return Response.json({ success: true, data });
  });
}

export async function DELETE(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ success: false, message: 'ID não informado' }, { status: 400 });

    const existing = await prisma.trip.findFirst({ where: { id, userId } });
    if (!existing) {
      return Response.json({ success: false, message: 'Viagem não encontrada' }, { status: 404 });
    }

    await prisma.trip.delete({ where: { id } });
    return Response.json({ success: true, message: 'Viagem excluída' });
  });
}
