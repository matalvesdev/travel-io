import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const limit = parseInt(searchParams.get('limit') || '20');

    const where: any = { isActive: true };
    
    if (category && category !== 'all') {
      where.category = category;
    }
    
    if (search) {
      where.OR = [
        { productName: { contains: search, mode: 'insensitive' } },
        { storeName: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } },
      ];
    }

    const data = await prisma.deal.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return Response.json({ success: true, data: { deals: data } });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    
    const data = await prisma.deal.create({
      data: {
        productName: body.product_name,
        storeName: body.store_name,
        originalPrice: body.original_price,
        dealPrice: body.deal_price,
        savings: body.savings,
        url: body.url ?? null,
        category: body.category ?? null,
        isActive: body.is_active ?? true,
      },
    });

    return Response.json({ success: true, data });
  });
}

export async function PATCH(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return Response.json({ success: false, message: 'ID não informado' }, { status: 400 });
    }

    const existing = await prisma.deal.findFirst({ where: { id } });
    if (!existing) {
      return Response.json({ success: false, message: 'Deal não encontrado' }, { status: 404 });
    }

    // Map snake_case to camelCase for Prisma
    const prismaData: any = {};
    if (updateData.product_name !== undefined) prismaData.productName = updateData.product_name;
    if (updateData.store_name !== undefined) prismaData.storeName = updateData.store_name;
    if (updateData.original_price !== undefined) prismaData.originalPrice = updateData.original_price;
    if (updateData.deal_price !== undefined) prismaData.dealPrice = updateData.deal_price;
    if (updateData.savings !== undefined) prismaData.savings = updateData.savings;
    if (updateData.url !== undefined) prismaData.url = updateData.url;
    if (updateData.category !== undefined) prismaData.category = updateData.category;
    if (updateData.is_active !== undefined) prismaData.isActive = updateData.is_active;

    const data = await prisma.deal.update({
      where: { id },
      data: prismaData,
    });

    return Response.json({ success: true, data });
  });
}

export async function DELETE(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ success: false, message: 'ID não informado' }, { status: 400 });

    const existing = await prisma.deal.findFirst({ where: { id } });
    if (!existing) {
      return Response.json({ success: false, message: 'Deal não encontrado' }, { status: 404 });
    }

    await prisma.deal.delete({ where: { id } });
    return Response.json({ success: true, message: 'Deal removido' });
  });
}
