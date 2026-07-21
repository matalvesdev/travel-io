import { NextRequest } from 'next/server';
import { authenticatedHandler } from '@/lib/api/supabase-helpers';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'ALL';

    const where: Record<string, unknown> = { userId };
    if (filter === 'UNREAD') where.read = false;
    else if (filter === 'READ') where.read = true;

    const data = await prisma.notification.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    const notifications = data.map((n) => ({
      id: n.id,
      type: n.type || 'info',
      title: n.title,
      body: n.body,
      read: n.read,
      createdAt: n.createdAt,
    }));

    const unreadCount = notifications.filter((n) => !n.read).length;

    return Response.json({ success: true, data: { notifications, unreadCount } });
  });
}

export async function POST(request: NextRequest) {
  return authenticatedHandler(request, async ({ userId }) => {
    const body = await request.json();
    const data = await prisma.notification.create({
      data: {
        type: body.type ?? 'info',
        title: body.title,
        body: body.body ?? null,
        read: false,
        alertId: body.alert_id ?? null,
        userId,
      },
    });

    return Response.json({ success: true, data });
  });
}
