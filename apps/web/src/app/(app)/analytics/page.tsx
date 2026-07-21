'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, Target, Loader2 } from 'lucide-react';
import { MetricCard } from '@/components/analytics/metric-card';
import { MonthlyChart } from '@/components/analytics/monthly-chart';
import { CategoryBreakdown } from '@/components/analytics/category-breakdown';
import { ForecastChart } from '@/components/analytics/forecast-chart';
import { useAnalyticsSummary, useMonthlyData, useCategoryBreakdown, useForecast } from '@/hooks/api/use-analytics';
import { formatCurrency } from '@/lib/utils';

export default function AnalyticsPage() {
  const [period, setPeriod] = React.useState<string>('6m');

  const { data: summary, isLoading: summaryLoading } = useAnalyticsSummary(period);
  const { data: monthlyData, isLoading: monthlyLoading } = useMonthlyData(period);
  const { data: categoryData, isLoading: categoryLoading } = useCategoryBreakdown(period);
  const { data: forecastData, isLoading: forecastLoading } = useForecast(6);

  const totalIncome = monthlyData.reduce((a, d) => a + d.income, 0);
  const totalExpenses = monthlyData.reduce((a, d) => a + d.expenses, 0);
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

  if (summaryLoading && monthlyLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics</h1>
          <p className="text-muted-foreground">Insights e previsões financeiras</p>
        </div>
        <div className="flex gap-1 rounded-lg border p-1">
          {['3m', '6m', '12m'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                period === p
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p === '3m' ? '3 meses' : p === '6m' ? '6 meses' : '12 meses'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Receita Mensal"
          value={formatCurrency(totalIncome || 0)}
          change={0}
          icon={TrendingUp}
          iconColor="text-success"
        />
        <MetricCard
          title="Despesas Mensal"
          value={formatCurrency(totalExpenses || 0)}
          change={0}
          icon={TrendingDown}
          iconColor="text-destructive"
        />
        <MetricCard
          title="Taxa de Poupança"
          value={`${savingsRate}%`}
          change={0}
          icon={Wallet}
          iconColor="text-primary"
        />
        <MetricCard
          title="Meses Analisados"
          value={String(monthlyData.length)}
          change={0}
          icon={Target}
          iconColor="text-info"
        />
      </div>

      {/* Monthly Chart */}
      <MonthlyChart data={monthlyData} loading={monthlyLoading} />

      {/* Category Breakdown + Forecast row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryBreakdown data={categoryData} loading={categoryLoading} />
        <ForecastChart
          data={forecastData}
          historicalData={monthlyData.map((d) => ({ month: d.month, expenses: d.expenses }))}
          loading={forecastLoading}
        />
      </div>

      {/* AI Insights */}
      {summary?.insights && summary.insights.length > 0 && (
        <div className="phantom-card">
          <div className="p-6 pb-0">
            <h3 className="text-lg font-semibold">Insights da IA</h3>
          </div>
          <div className="p-6">
            <div className="grid gap-4 md:grid-cols-3">
              {summary.insights.map((insight, i) => (
                <motion.div
                  key={insight.id || i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`rounded-lg border p-4 ${
                    insight.priority === 'HIGH'
                      ? 'border-destructive/50 bg-destructive/5'
                      : insight.priority === 'MEDIUM'
                      ? 'border-warning/50 bg-warning/5'
                      : 'border-success/50 bg-success/5'
                  }`}
                >
                  <p className="font-medium">{insight.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
