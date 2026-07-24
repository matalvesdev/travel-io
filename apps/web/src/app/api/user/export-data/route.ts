import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    try {
      // Fetch all user data
      const [
        profile,
        transactions,
        investments,
        trips,
        goals,
        milesAccounts,
        milesTransactions,
        wishlistItems,
        priceMonitors,
        deals,
        coupons,
        priceAlerts,
        notifications,
        notificationPreferences,
        aiConversations,
        aiMessages,
        paymentMethods,
      ] = await Promise.all([
        prisma.profile.findUnique({ where: { id: userId } }),
        prisma.transaction.findMany({ where: { userId } }),
        prisma.investment.findMany({ where: { userId } }),
        prisma.trip.findMany({ where: { userId } }),
        prisma.goal.findMany({ where: { userId } }),
        prisma.milesAccount.findMany({ where: { userId } }),
        prisma.milesTransaction.findMany({ where: { userId } }),
        prisma.wishlistItem.findMany({ where: { userId } }),
        prisma.priceMonitor.findMany({ where: { userId } }),
        prisma.deal.findMany({ where: { userId } }),
        prisma.coupon.findMany({ where: { userId } }),
        prisma.priceAlert.findMany({ where: { userId } }),
        prisma.notification.findMany({ where: { userId } }),
        prisma.notificationPreference.findUnique({ where: { userId } }),
        prisma.aiConversation.findMany({ where: { userId } }),
        prisma.aiMessage.findMany({
          where: { conversation: { userId } },
        }),
        prisma.paymentMethod.findMany({ where: { userId } }),
      ]);

      // Create audit log entry
      await prisma.auditLog.create({
        data: {
          userId,
          action: 'data_export_requested',
          details: {
            sections: [
              'profile',
              'transactions',
              'investments',
              'trips',
              'goals',
              'miles',
              'shopping',
              'notifications',
              'ai',
              'payments',
            ],
          },
        },
      });

      // Build export data
      const exportData = {
        exportDate: new Date().toISOString(),
        userId,
        data: {
          profile: profile ? {
            name: profile.name,
            email: profile.email,
            phone: profile.phone,
            birthDate: profile.birthDate,
            createdAt: profile.createdAt,
          } : null,
          transactions,
          investments,
          trips,
          goals,
          miles: {
            accounts: milesAccounts,
            transactions: milesTransactions,
          },
          shopping: {
            wishlist: wishlistItems,
            monitors: priceMonitors,
            deals,
            coupons,
            alerts: priceAlerts,
          },
          notifications: {
            items: notifications,
            preferences: notificationPreferences,
          },
          ai: {
            conversations: aiConversations,
            messages: aiMessages,
          },
          payments: paymentMethods,
        },
      };

      // Return as downloadable JSON
      return new Response(JSON.stringify(exportData, null, 2), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="travel-io-export-${new Date().toISOString().split('T')[0]}.json"`,
        },
      });
    } catch (error) {
      console.error('Error exporting data:', error);
      return Response.json(
        { success: false, message: 'Erro ao exportar dados' },
        { status: 500 }
      );
    }
  });
}
