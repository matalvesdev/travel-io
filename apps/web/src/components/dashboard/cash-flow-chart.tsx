'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency, formatCompact } from '@/lib/utils/format';

interface CashFlowChartData {
  month: string;
  income: number;
  expenses: number;
}

interface CashFlowChartProps {
  data: CashFlowChartData[];
  loading?: boolean;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border bg-background/95 backdrop-blur p-4 shadow-xl min-w-[180px]">
      <p className="text-sm font-semibold mb-2 capitalize">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 py-1">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-sm text-muted-foreground">{entry.name}</span>
          </div>
          <span className="text-sm font-semibold" style={{ color: entry.color }}>
            {formatCurrency(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export function CashFlowChart({ data, loading = false }: CashFlowChartProps) {
  if (loading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Fluxo Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[280px]">
          <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="w-full h-48 bg-muted rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (data.length === 0 || data.every(d => d.income === 0 && d.expenses === 0)) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Fluxo Financeiro
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[280px] text-muted-foreground">
          <BarChart3 className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">Sem dados para exibir</p>
          <p className="text-xs">Adicione transações para ver o fluxo financeiro</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
            Fluxo Financeiro
          </CardTitle>
          <p className="text-xs text-muted-foreground">Últimos 6 meses</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4ade80" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradientExpenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f87171" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f87171" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="month"
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(v) => formatCompact(v)}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ paddingBottom: '10px' }}
                formatter={(value: string) => (
                  <span className="text-sm text-muted-foreground">{value}</span>
                )}
              />
              <Area
                type="monotone"
                dataKey="income"
                name="Receitas"
                stroke="#4ade80"
                strokeWidth={2.5}
                fill="url(#gradientIncome)"
                animationDuration={1000}
                dot={{ r: 4, fill: '#4ade80', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Despesas"
                stroke="#f87171"
                strokeWidth={2.5}
                fill="url(#gradientExpenses)"
                animationDuration={1000}
                dot={{ r: 4, fill: '#f87171', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
