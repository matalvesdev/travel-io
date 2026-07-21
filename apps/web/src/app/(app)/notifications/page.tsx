'use client';
import * as React from 'react';
import { motion } from 'framer-motion';
import { Bell, Check, CheckCheck, Loader2, Filter, Mail, Smartphone, MessageSquare, ShoppingCart, Plane, Target, TrendingUp, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications, useMarkAsRead } from '@/hooks/api/use-notifications';
import type { Notification } from '@/lib/api/notifications';
import { toast } from 'sonner';

const channelIcons: Record<string, React.ReactNode> = {
  PUSH: <Bell className="h-4 w-4" />,
  EMAIL: <Mail className="h-4 w-4" />,
  SMS: <Smartphone className="h-4 w-4" />,
  WHATSAPP: <MessageSquare className="h-4 w-4" />,
};

const typeIcons: Record<string, React.ReactNode> = {
  BUDGET_ALERT: <ShoppingCart className="h-4 w-4 text-warning" />,
  BILL_REMINDER: <Bell className="h-4 w-4 text-info" />,
  PRICE_ALERT: <TrendingUp className="h-4 w-4 text-success" />,
  TRAVEL_DEAL: <Plane className="h-4 w-4 text-primary" />,
  MILES_ALERT: <Sparkles className="h-4 w-4 text-purple-500" />,
  INVESTMENT_ALERT: <TrendingUp className="h-4 w-4 text-info" />,
  GOAL_REMINDER: <Target className="h-4 w-4 text-warning" />,
  AI_INSIGHT: <Sparkles className="h-4 w-4 text-primary" />,
};

function formatRelativeTime(dateStr: string): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Agora';
  if (diffMins < 60) return `${diffMins} min atrás`;
  if (diffHours < 24) return `${diffHours}h atrás`;
  if (diffDays < 7) return `${diffDays} dias atrás`;
  return date.toLocaleDateString('pt-BR');
}

export default function NotificationsPage() {
  const [filter, setFilter] = React.useState<'ALL' | 'UNREAD' | 'READ'>('ALL');

  const { data, isLoading, error } = useNotifications(filter);
  const markAsReadMutation = useMarkAsRead();

  const notifications: Notification[] = data?.notifications || [];
  const unreadCount = data?.unreadCount ?? 0;

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsReadMutation.mutateAsync(id);
    } catch {
      toast.error('Erro ao marcar como lida');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      notifications.forEach(n => { if (!n.isRead) markAsReadMutation.mutateAsync(n.id); });
      toast.success('Todas marcadas como lidas');
    } catch {
      toast.error('Erro ao marcar todas como lidas');
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="phantom-card w-full max-w-md text-center p-8">
          <p className="text-muted-foreground mb-4">Erro ao carregar notificações</p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Tentar novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notificações</h1>
          <p className="text-muted-foreground">{unreadCount} não lidas</p>
        </div>
        <Button
          variant="outline"
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0 || markAsReadMutation.isPending}
        >
          {markAsReadMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCheck className="mr-2 h-4 w-4" />
          )}
          Marcar todas lidas
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { id: 'ALL' as const, label: 'Todas' },
          { id: 'UNREAD' as const, label: 'Não lidas' },
          { id: 'READ' as const, label: 'Lidas' },
        ].map(f => (
          <Button
            key={f.id}
            variant={filter === f.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setFilter(f.id)}
          >
            <Filter className="mr-2 h-3 w-3" />
            {f.label}
          </Button>
        ))}
      </div>

      <div className="phantom-card">
        <div className="p-6 pb-0">
          <h3 className="text-lg font-semibold">Recentes</h3>
        </div>
        <div className="p-6">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {filter === 'UNREAD' ? 'Nenhuma notificação não lida' : 'Nenhuma notificação encontrada'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((n: Notification) => (
                <div
                  key={n.id}
                  className={`flex items-start gap-4 rounded-lg border p-4 transition-colors ${
                    !n.isRead ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/50'
                  }`}
                >
                  <div className={`mt-1 ${!n.isRead ? 'text-primary' : 'text-muted-foreground'}`}>
                    {typeIcons[n.type] || <Bell className="h-4 w-4" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`font-medium ${!n.isRead ? '' : 'text-muted-foreground'}`}>{n.title}</p>
                      {!n.isRead && (
                        <span className="h-2 w-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{n.body}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs text-muted-foreground">{formatRelativeTime(n.createdAt)}</span>
                      {n.channelName && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          {channelIcons[n.channel]}
                          {n.channelName}
                        </span>
                      )}
                      {n.typeName && (
                        <span className="text-xs text-muted-foreground">• {n.typeName}</span>
                      )}
                    </div>
                  </div>
                  {!n.isRead && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 flex-shrink-0"
                      onClick={() => handleMarkAsRead(n.id)}
                      disabled={markAsReadMutation.isPending}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
