import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const data = await prisma.wishlistItem.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({ success: true, data: { items: data } });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    
    const data = await prisma.wishlistItem.create({
      data: {
        name: body.name,
        store: body.store ?? null,
        currentPrice: body.current_price ?? null,
        targetPrice: body.target_price ?? null,
        lowestPrice: body.lowest_price ?? null,
        url: body.url ?? null,
        imageUrl: body.image_url ?? null,
        category: body.category ?? null,
        brand: body.brand ?? null,
        monitorPrice: body.monitor_price ?? false,
        userId,
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

    const existing = await prisma.wishlistItem.findFirst({ where: { id, userId } });
    if (!existing) {
      return Response.json({ success: false, message: 'Item não encontrado' }, { status: 404 });
    }

    // Map snake_case to camelCase for Prisma
    const prismaData: any = {};
    if (updateData.name !== undefined) prismaData.name = updateData.name;
    if (updateData.store !== undefined) prismaData.store = updateData.store;
    if (updateData.current_price !== undefined) prismaData.currentPrice = updateData.current_price;
    if (updateData.target_price !== undefined) prismaData.targetPrice = updateData.target_price;
    if (updateData.lowest_price !== undefined) prismaData.lowestPrice = updateData.lowest_price;
    if (updateData.url !== undefined) prismaData.url = updateData.url;
    if (updateData.image_url !== undefined) prismaData.imageUrl = updateData.image_url;
    if (updateData.category !== undefined) prismaData.category = updateData.category;
    if (updateData.brand !== undefined) prismaData.brand = updateData.brand;
    if (updateData.monitor_price !== undefined) prismaData.monitorPrice = updateData.monitor_price;

    const data = await prisma.wishlistItem.update({
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

    const existing = await prisma.wishlistItem.findFirst({ where: { id, userId } });
    if (!existing) {
      return Response.json({ success: false, message: 'Item não encontrado' }, { status: 404 });
    }

    await prisma.wishlistItem.delete({ where: { id } });
    return Response.json({ success: true, message: 'Item removido' });
  });
}
