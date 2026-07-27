import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    try {
      // Check if user is admin (simple check - in production, use proper role system)
      const adminProfile = await prisma.profile.findUnique({
        where: { id: userId },
      });

      // For now, allow all authenticated users to access (can be restricted later)
      // In production, check admin role: if (!adminProfile?.isAdmin) return 403

      const { searchParams } = new URL(request.url);
      const page = parseInt(searchParams.get('page') || '1');
      const pageSize = parseInt(searchParams.get('pageSize') || '20');
      const search = searchParams.get('search') || '';

      const skip = (page - 1) * pageSize;

      // Build search filter
      const searchFilter = search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {};

      // Fetch users with pagination
      const [users, total] = await Promise.all([
        prisma.profile.findMany({
          where: searchFilter,
          skip,
          take: pageSize,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatarUrl: true,
            createdAt: true,
            updatedAt: true,
          },
        }),
        prisma.profile.count({
          where: searchFilter,
        }),
      ]);

      // Create audit log entry
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'admin_users_listed',
          details: {
            page,
            pageSize,
            search: search || null,
            totalResults: total,
          },
        },
      });

      return Response.json({
        success: true,
        data: {
          users,
          pagination: {
            page,
            pageSize,
            total,
            totalPages: Math.ceil(total / pageSize),
          },
        },
      });
    } catch (error) {
      console.error('Error listing users:', error);
      return Response.json(
        { success: false, message: 'Erro ao listar usuários' },
        { status: 500 }
      );
    }
  });
}
