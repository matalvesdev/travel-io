'use client';
import * as React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, Target, Plane, Loader2 } from 'lucide-react';
import { MetricCard } from '@/components/analytics/metric-card';
import { formatCurrency } from '@/lib/utils';
import { analyticsApi } from '@/lib/api';

export default function AnalyticsPage() {
  const [loading, setLoading] = React.useState(true);
  const [insights, setInsights] = React.useState<Array<{ title: string; description: string; priority: string }>>([]);
  const [forecast, setForecast] = React.useState<Array<{ month: string; forecast: number; confidence: number }>>([]);
  const [monthlyData, setMonthlyData] = React.useState<Array<{ month: string; income: number; expenses: number }>>([]);
  const [categoryBreakdown, setCategoryBreakdown] = React.useState<Array<{ name: string; value: number; color: string }>>([]);

  React.useEffect(() => {
    Promise.all([
      analyticsApi.getInsights().catch(() => null),
      analyticsApi.getForecast().catch(() => null),
    ]).then(([insightsRes, forecastRes]) => {
      if (insightsRes?.success && insightsRes.data) {
        if (insightsRes.data.insights) setInsights(insightsRes.data.insights);
        if (insightsRes.data.monthlyData) setMonthlyData(insightsRes.data.monthlyData);
        if (insightsRes.data.categoryBreakdown) setCategoryBreakdown(insightsRes.data.categoryBreakdown);
      }
      if (forecastRes?.success && forecastRes.data?.forecast) {
        setForecast(forecastRes.data.forecast.map((f: any) => ({ month: f.period, forecast: f.value, confidence: f.confidence })));
      }
      setLoading(false);
    });
  }, []);

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  const totalIncome = monthlyData.reduce((a, d) => a + d.income, 0);
  const totalExpenses = monthlyData.reduce((a, d) => a + d.expenses, 0);
  const savingsRate = totalIncome > 0 ? Math.round(((totalIncome - totalExpenses) / totalIncome) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics</h1>
        <p className="text-muted-foreground">Insights e previsões financeiras</p>
      </div>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard title="Receita Mensal" value={formatCurrency(totalIncome || 0)} change={0} icon={TrendingUp} iconColor="text-success" />
        <MetricCard title="Despesas Mensal" value={formatCurrency(totalExpenses || 0)} change={0} icon={TrendingDown} iconColor="text-destructive" />
        <MetricCard title="Taxa de Poupança" value={`${savingsRate}%`} change={0} icon={Wallet} iconColor="text-primary" />
        <MetricCard title="Meses Analisados" value={String(monthlyData.length)} change={0} icon={Target} iconColor="text-info" />
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Monthly Chart */}
        <div className="phantom-card">
          <div className="p-6 pb-0">
            <h3 className="text-lg font-semibold">Receitas vs Despesas</h3>
          </div>
          <div className="p-6">
            {monthlyData.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Sem dados de receitas/despesas para exibir.</p>
            ) : (
            <div className="space-y-4">
              {monthlyData.map((data) => (
                <div key={data.month} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{data.month}</span>
                    <span className="text-muted-foreground">
                      +{formatCurrency(data.income)} / -{formatCurrency(data.expenses)}
                    </span>
                  </div>
                  <div className="flex gap-1 h-4">
                    <div
                      className="h-full rounded bg-success"
                      style={{ width: `${(data.income / 15000) * 100}%` }}
                    />
                    <div
                      className="h-full rounded bg-destructive"
                      style={{ width: `${(data.expenses / 15000) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="phantom-card">
          <div className="p-6 pb-0">
            <h3 className="text-lg font-semibold">Despesas por Categoria</h3>
          </div>
          <div className="p-6">
            {categoryBreakdown.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Sem dados de categorias para exibir.</p>
            ) : (
            <div className="space-y-4">
              {categoryBreakdown.map((cat) => (
                <div key={cat.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="text-sm font-medium">{cat.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">{cat.value}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${cat.value}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
            )}
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="phantom-card">
        <div className="p-6 pb-0">
          <h3 className="text-lg font-semibold">Insights da IA</h3>
        </div>
        <div className="p-6">
          {insights.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Nenhum insight disponível no momento.</p>
          ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {insights.map((insight, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`rounded-lg border p-4 ${
                  insight.priority === 'HIGH' ? 'border-destructive/50 bg-destructive/5' :
                  insight.priority === 'MEDIUM' ? 'border-warning/50 bg-warning/5' :
                  'border-success/50 bg-success/5'
                }`}
              >
                <p className="font-medium">{insight.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
              </motion.div>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* Forecast */}
      <div className="phantom-card">
        <div className="p-6 pb-0">
          <h3 className="text-lg font-semibold">Previsão de Gastos (Próximos Meses)</h3>
        </div>
        <div className="p-6">
          {forecast.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4">Sem dados de previsão disponíveis.</p>
          ) : (
          <div className="space-y-4">
            {forecast.map((item) => (
              <div key={item.month} className="flex items-center justify-between">
                <span className="text-sm font-medium w-12">{item.month}</span>
                <div className="flex-1 mx-4">
                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${(item.forecast / 10000) * 100}%` }}
                    />
                  </div>
                </div>
                <div className="text-right w-24">
                  <p className="text-sm font-medium">{formatCurrency(item.forecast)}</p>
                  <p className="text-xs text-muted-foreground">{item.confidence}% confiança</p>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
