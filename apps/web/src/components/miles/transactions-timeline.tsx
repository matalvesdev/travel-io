'use client';

import * as React from 'react';
import { ArrowUpRight, ArrowDownRight, RefreshCw, Clock, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  type: string | null;
}

interface TransactionsTimelineProps {
  transactions: Transaction[];
}

const TYPE_ICONS: Record<string, typeof ArrowUpRight> = {
  EARN: ArrowUpRight,
  BURN: ArrowDownRight,
  TRANSFER_IN: RefreshCw,
  TRANSFER_OUT: RefreshCw,
  EXPIRY: Clock,
};

const TYPE_COLORS: Record<string, string> = {
  EARN: 'text-green-500 bg-green-500/10',
  BURN: 'text-red-500 bg-red-500/10',
  TRANSFER_IN: 'text-blue-500 bg-blue-500/10',
  TRANSFER_OUT: 'text-orange-500 bg-orange-500/10',
  EXPIRY: 'text-amber-500 bg-amber-500/10',
};

const TYPE_LABELS: Record<string, string> = {
  EARN: 'Ganho',
  BURN: 'Resgate',
  TRANSFER_IN: 'Transferência recebida',
  TRANSFER_OUT: 'Transferência enviada',
  EXPIRY: 'Expiração',
};

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function TransactionsTimeline({ transactions }: TransactionsTimelineProps) {
  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Histórico de Transações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Wallet className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <p className="text-muted-foreground">Nenhuma transação registrada</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              Suas movimentações aparecerão aqui
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Histórico de Transações
          <span className="ml-auto text-sm font-normal text-muted-foreground">
            {transactions.length} movimentações
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative space-y-0">
          {transactions.map((tx, idx) => {
            const Icon = TYPE_ICONS[tx.type || ''] || Wallet;
            const colorClass = TYPE_COLORS[tx.type || ''] || 'text-muted-foreground bg-muted';
            const label = TYPE_LABELS[tx.type || ''] || tx.type || 'Movimentação';
            const isLast = idx === transactions.length - 1;

            return (
              <div key={tx.id} className="relative flex gap-4 pb-6">
                {!isLast && (
                  <div className="absolute left-[17px] top-8 bottom-0 w-px bg-border" />
                )}
                <div className={`shrink-0 rounded-full p-2 ${colorClass}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium truncate">{tx.description || label}</span>
                    <span className={`text-sm font-bold shrink-0 ${
                      tx.amount > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">{formatDate(tx.date)}</span>
                    <span className="text-xs text-muted-foreground">·</span>
                    <span className="text-xs text-muted-foreground capitalize">{label}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
