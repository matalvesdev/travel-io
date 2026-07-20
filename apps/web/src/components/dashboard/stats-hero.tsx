'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatCompact } from '@/lib/utils/format';

interface StatsHeroProps {
  totalPatrimony: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  balance: number;
}

const stats = [
  { key: 'patrimony', title: 'Patrimônio Total', icon: Wallet, colorClass: 'bg-primary/10 text-primary' },
  { key: 'income', title: 'Receitas do Mês', icon: TrendingUp, colorClass: 'bg-success/10 text-success' },
  { key: 'expenses', title: 'Despesas do Mês', icon: TrendingDown, colorClass: 'bg-destructive/10 text-destructive' },
  { key: 'balance', title: 'Saldo', icon: PiggyBank, colorClass: 'bg-info/10 text-info' },
] as const;

export function StatsHero({ totalPatrimony, monthlyIncome, monthlyExpenses, balance }: StatsHeroProps) {
  const values: Record<string, number> = {
    patrimony: totalPatrimony,
    income: monthlyIncome,
    expenses: monthlyExpenses,
    balance,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => {
        const value = values[stat.key];
        const Icon = stat.icon;
        const isPositive = stat.key === 'balance' ? value >= 0 : stat.key === 'expenses' ? true : value > 0;

        return (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4, transition: { duration: 0.2 } }}
          >
            <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/80">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between">
                  <div className={`rounded-xl p-3 ${stat.colorClass}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  {stat.key === 'balance' && (
                    <motion.div
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 }}
                      className={`flex items-center text-xs font-medium px-2 py-1 rounded-full ${
                        balance >= 0 ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                      }`}
                    >
                      {balance >= 0 ? <ArrowUpRight className="mr-0.5 h-3 w-3" /> : <ArrowDownRight className="mr-0.5 h-3 w-3" />}
                      {balance >= 0 ? 'Positivo' : 'Negativo'}
                    </motion.div>
                  )}
                </div>
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground font-medium">{stat.title}</p>
                  <p className="text-2xl font-bold mt-1 tracking-tight">
                    {value > 1000 ? formatCompact(value) : formatCurrency(value)}
                  </p>
                </div>
                {/* Subtle decorative element */}
                <div className="absolute -bottom-2 -right-2 w-24 h-24 rounded-full bg-primary/5 -z-10" />
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
