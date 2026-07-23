import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const data = await prisma.priceMonitor.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return Response.json({ success: true, data: { monitors: data } });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    
    const data = await prisma.priceMonitor.create({
      data: {
        productName: body.product_name,
        url: body.url ?? null,
        targetPrice: body.target_price ?? null,
        currentPrice: body.current_price ?? null,
        lowestPrice: body.lowest_price ?? null,
        imageUrl: body.image_url ?? null,
        category: body.category ?? null,
        brand: body.brand ?? null,
        isActive: body.is_active ?? true,
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

    const existing = await prisma.priceMonitor.findFirst({ where: { id, userId } });
    if (!existing) {
      return Response.json({ success: false, message: 'Monitor não encontrado' }, { status: 404 });
    }

    // Map snake_case to camelCase for Prisma
    const prismaData: any = {};
    if (updateData.product_name !== undefined) prismaData.productName = updateData.product_name;
    if (updateData.url !== undefined) prismaData.url = updateData.url;
    if (updateData.target_price !== undefined) prismaData.targetPrice = updateData.target_price;
    if (updateData.current_price !== undefined) prismaData.currentPrice = updateData.current_price;
    if (updateData.lowest_price !== undefined) prismaData.lowestPrice = updateData.lowest_price;
    if (updateData.image_url !== undefined) prismaData.imageUrl = updateData.image_url;
    if (updateData.category !== undefined) prismaData.category = updateData.category;
    if (updateData.brand !== undefined) prismaData.brand = updateData.brand;
    if (updateData.is_active !== undefined) prismaData.isActive = updateData.is_active;
    if (updateData.last_checked !== undefined) prismaData.lastChecked = new Date(updateData.last_checked);
    
    // Handle price history - append new entry
    if (updateData.price_history) {
      const currentHistory = (existing.priceHistory as any[]) || [];
      const newEntry = {
        price: updateData.price_history.price,
        timestamp: new Date().toISOString(),
        source: updateData.price_history.source || 'manual',
      };
      prismaData.priceHistory = [...currentHistory, newEntry].slice(-50); // Keep last 50 entries
    }

    const data = await prisma.priceMonitor.update({
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

    const existing = await prisma.priceMonitor.findFirst({ where: { id, userId } });
    if (!existing) {
      return Response.json({ success: false, message: 'Monitor não encontrado' }, { status: 404 });
    }

    await prisma.priceMonitor.delete({ where: { id } });
    return Response.json({ success: true, message: 'Monitor removido' });
  });
}
