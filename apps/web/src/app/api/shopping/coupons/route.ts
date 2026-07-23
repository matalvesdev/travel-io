import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const activeOnly = searchParams.get('activeOnly') !== 'false';
    const search = searchParams.get('search');

    const where: any = {};
    
    if (activeOnly) {
      where.isActive = true;
      where.endDate = { gte: new Date() };
    }
    
    if (search) {
      where.OR = [
        { storeName: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const data = await prisma.coupon.findMany({
      where,
      orderBy: { endDate: 'asc' },
    });

    // Add computed fields
    const couponsWithMeta = data.map(coupon => {
      const endDate = coupon.endDate ? new Date(coupon.endDate) : null;
      const daysRemaining = endDate ? Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))) : null;
      
      return {
        ...coupon,
        daysRemaining,
        isUsable: coupon.isActive && (!endDate || endDate > new Date()),
      };
    });

    return Response.json({ success: true, data: { coupons: couponsWithMeta } });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    
    const data = await prisma.coupon.create({
      data: {
        storeName: body.store_name,
        code: body.code,
        description: body.description ?? null,
        value: body.value ?? null,
        minPurchase: body.min_purchase ?? null,
        startDate: body.start_date ? new Date(body.start_date) : null,
        endDate: body.end_date ? new Date(body.end_date) : null,
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

    const existing = await prisma.coupon.findFirst({ where: { id } });
    if (!existing) {
      return Response.json({ success: false, message: 'Coupon não encontrado' }, { status: 404 });
    }

    // Map snake_case to camelCase for Prisma
    const prismaData: any = {};
    if (updateData.store_name !== undefined) prismaData.storeName = updateData.store_name;
    if (updateData.code !== undefined) prismaData.code = updateData.code;
    if (updateData.description !== undefined) prismaData.description = updateData.description;
    if (updateData.value !== undefined) prismaData.value = updateData.value;
    if (updateData.min_purchase !== undefined) prismaData.minPurchase = updateData.min_purchase;
    if (updateData.start_date !== undefined) prismaData.startDate = new Date(updateData.start_date);
    if (updateData.end_date !== undefined) prismaData.endDate = new Date(updateData.end_date);
    if (updateData.is_active !== undefined) prismaData.isActive = updateData.is_active;

    const data = await prisma.coupon.update({
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

    const existing = await prisma.coupon.findFirst({ where: { id } });
    if (!existing) {
      return Response.json({ success: false, message: 'Coupon não encontrado' }, { status: 404 });
    }

    await prisma.coupon.delete({ where: { id } });
    return Response.json({ success: true, message: 'Coupon removido' });
  });
}
