import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

const prisma = new PrismaClient();

function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId, supabase }) => {
    try {
      const body = await request.json();
      const { newEmail } = body;

      if (!newEmail) {
        return Response.json(
          { success: false, message: 'Novo email é obrigatório' },
          { status: 400 }
        );
      }

      if (!isValidEmail(newEmail)) {
        return Response.json(
          { success: false, message: 'Email inválido' },
          { status: 400 }
        );
      }

      // Check if email is already in use
      const existingProfile = await prisma.profile.findFirst({
        where: {
          email: newEmail,
          id: { not: userId },
        },
      });

      if (existingProfile) {
        return Response.json(
          { success: false, message: 'Este email já está em uso' },
          { status: 409 }
        );
      }

      // Update email in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (authError) {
        console.error('Supabase auth error:', authError);
        return Response.json(
          { success: false, message: 'Erro ao atualizar email' },
          { status: 500 }
        );
      }

      // Update email in profile
      await prisma.profile.update({
        where: { id: userId },
        data: {
          email: newEmail,
          emailVerified: false,
        },
      });

      // Create audit log entry
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'email_change_requested',
          details: {
            newEmail,
            timestamp: new Date().toISOString(),
          },
        },
      });

      return Response.json({
        success: true,
        message: 'Email de confirmação enviado. Verifique sua caixa de entrada.',
      });
    } catch (error) {
      console.error('Error changing email:', error);
      return Response.json(
        { success: false, message: 'Erro ao processar mudança de email' },
        { status: 500 }
      );
    }
  });
}
