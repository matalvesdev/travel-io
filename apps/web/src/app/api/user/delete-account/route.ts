import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { getSupabaseAdmin } from '@/lib/api/supabase-helpers';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    try {
      const body = await request.json();
      const { password, reason } = body;

      if (!password) {
        return Response.json(
          { success: false, message: 'Senha é obrigatória' },
          { status: 400 }
        );
      }

      // Check if account is already deleted
      const profile = await prisma.profile.findUnique({
        where: { id: userId },
      });

      if (!profile) {
        return Response.json(
          { success: false, message: 'Perfil não encontrado' },
          { status: 404 }
        );
      }

      if (profile.accountStatus === 'deleted') {
        return Response.json(
          { success: false, message: 'Conta já foi excluída' },
          { status: 400 }
        );
      }

      // Soft delete: update profile status
      await prisma.profile.update({
        where: { id: userId },
        data: {
          accountStatus: 'deleted',
          deletedAt: new Date(),
        },
      });

      // Create audit log entry
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'account_deletion_requested',
          details: {
            reason: reason || 'No reason provided',
            scheduledFor: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          },
        },
      });

      // Invalidate user session via Supabase admin
      const supabaseAdmin = getSupabaseAdmin();
      await supabaseAdmin.auth.admin.signOut(userId);

      return Response.json({
        success: true,
        message: 'Conta marcada para exclusão. Você tem 30 dias para recuperar.',
        scheduledFor: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      });
    } catch (error) {
      console.error('Error deleting account:', error);
      return Response.json(
        { success: false, message: 'Erro ao processar exclusão' },
        { status: 500 }
      );
    }
  });
}
