'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown,
  Loader2, RefreshCw, Wallet, Target, Plane,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/hooks/api';
import { formatCurrency, formatCompact } from '@/lib/utils/format';
import { StatsHero } from '@/components/dashboard/stats-hero';
import { CategoryChart } from '@/components/dashboard/category-chart';
import { CashFlowChart } from '@/components/dashboard/cash-flow-chart';
import { NewsSection } from '@/components/dashboard/news-section';

export default function DashboardPage() {
  const [period, setPeriod] = React.useState('ALL');
  const { data, isLoading, isError, refetch, isFetching } = useDashboard();

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Card className="w-full max-w-md text-center p-8">
          <p className="text-muted-foreground mb-4">Erro ao carregar dados</p>
          <Button onClick={() => refetch()} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" /> Tentar novamente
          </Button>
        </Card>
      </div>
    );
  }

  const fin = data?.financialSummary || { totalRevenue: 0, totalExpenses: 0, balance: 0, totalInvested: 0, totalPortfolio: 0 };
  const goalsData = data?.goals || { total: 0, completed: 0 };
  const tripsData = data?.trips || { planned: 0, completed: 0 };
  const categoryBreakdown = data?.categoryBreakdown || [];
  const cashFlowTrend = data?.cashFlowTrend || [];
  const transactions = data?.transactions || [];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das suas finanças</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl border bg-card/50 backdrop-blur overflow-hidden">
            {['ALL', 'MONTH', 'YEAR'].map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 text-sm font-medium transition-all ${
                  period === p
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                }`}
              >
                {p === 'ALL' ? 'Total' : p === 'MONTH' ? 'Mês' : 'Ano'}
              </button>
            ))}
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-xl"
          >
            <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </motion.div>

      {/* Stats Hero Section */}
      <StatsHero
        totalPatrimony={fin.totalPortfolio}
        monthlyIncome={fin.totalRevenue}
        monthlyExpenses={fin.totalExpenses}
        balance={fin.balance}
      />

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Cash Flow Chart */}
        <CashFlowChart data={cashFlowTrend} />

        {/* Category Chart */}
        <CategoryChart data={categoryBreakdown} />
      </div>

      {/* Transactions + Goals */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Transactions List */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="border-border/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                Últimas Transações
              </CardTitle>
              <Button variant="ghost" size="sm" className="text-xs">
                Ver todas
              </Button>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">Nenhuma transação encontrada</p>
              ) : (
                <div className="space-y-2">
                  {transactions.slice(0, 6).map((t, i) => (
                    <motion.div
                      key={t.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.5 + i * 0.05 }}
                      whileHover={{ x: 4, backgroundColor: 'hsl(var(--muted) / 0.3)' }}
                      className="flex items-center justify-between rounded-xl p-3 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
                          t.type === 'INCOME' ? 'bg-success/10' : 'bg-destructive/10'
                        }`}>
                          {t.type === 'INCOME'
                            ? <TrendingUp className="h-4 w-4 text-success" />
                            : <TrendingDown className="h-4 w-4 text-destructive" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-sm">{t.description}</p>
                          {t.date && (
                            <p className="text-xs text-muted-foreground">
                              {new Date(t.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                            </p>
                          )}
                        </div>
                      </div>
                      <span className={`font-semibold text-sm ${
                        t.amount > 0 ? 'text-success' : 'text-destructive'
                      }`}>
                        {t.amount > 0 ? '+' : ''}{formatCurrency(t.amount)}
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Goals & Trips Summary */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          {/* Goals Card */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-muted-foreground" />
                Metas
              </CardTitle>
            </CardHeader>
            <CardContent>
              {goalsData.total === 0 ? (
                <p className="text-center text-muted-foreground py-4 text-sm">Nenhuma meta encontrada</p>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progresso</span>
                    <span className="font-semibold">{goalsData.completed}/{goalsData.total}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${goalsData.total > 0 ? (goalsData.completed / goalsData.total) * 100 : 0}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-primary to-primary/70"
                    />
                  </div>
                  <p className="text-xs text-right text-muted-foreground">
                    {goalsData.total > 0 ? Math.round((goalsData.completed / goalsData.total) * 100) : 0}% concluído
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Trips Card */}
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <Plane className="h-4 w-4 text-muted-foreground" />
                Viagens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Planejadas</span>
                  <span className="font-semibold">{tripsData.planned}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Concluídas</span>
                  <span className="font-semibold text-success">{tripsData.completed}</span>
                </div>
                <div className="pt-2 border-t">
                  <p className="text-2xl font-bold">{tripsData.planned + tripsData.completed}</p>
                  <p className="text-xs text-muted-foreground">total de viagens</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Balance */}
          <Card className="border-border/50 bg-gradient-to-br from-primary/5 to-transparent">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-primary/10 p-3">
                  <Wallet className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Saldo Disponível</p>
                  <p className="text-xl font-bold">{formatCompact(fin.balance)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Financial News */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <NewsSection />
      </motion.div>
    </motion.div>
  );
}
