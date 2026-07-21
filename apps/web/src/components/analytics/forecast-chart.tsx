'use client';

import { motion } from 'framer-motion';
import { LineChart as LineChartIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Area,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import { formatCurrency, formatCompact } from '@/lib/utils/format';

interface ForecastData {
  month: string;
  forecast: number;
  confidence: number;
}

interface ForecastChartProps {
  data: ForecastData[];
  historicalData?: Array<{ month: string; expenses: number }>;
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
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.stroke }} />
            <span className="text-sm text-muted-foreground">{entry.name}</span>
          </div>
          <span className="text-sm font-semibold" style={{ color: entry.color || entry.stroke }}>
            {typeof entry.value === 'number' ? formatCurrency(entry.value) : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export function ForecastChart({ data, historicalData = [], loading = false }: ForecastChartProps) {
  const chartData = [
    ...historicalData.map((d) => ({ month: d.month, expenses: d.expenses, forecast: undefined as number | undefined })),
    ...data.map((d) => ({ month: d.month, expenses: undefined as number | undefined, forecast: d.forecast })),
  ];

  const avgForecast = data.length > 0
    ? data.reduce((sum, d) => sum + d.forecast, 0) / data.length
    : 0;

  if (loading) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <LineChartIcon className="h-4 w-4 text-muted-foreground" />
            Previsão de Gastos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[300px]">
          <div className="animate-pulse flex flex-col items-center gap-2">
            <div className="w-full h-48 bg-muted rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (chartData.length === 0 || (data.length === 0 && historicalData.length === 0)) {
    return (
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <LineChartIcon className="h-4 w-4 text-muted-foreground" />
            Previsão de Gastos
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-[300px] text-muted-foreground">
          <LineChartIcon className="h-12 w-12 mb-3 opacity-30" />
          <p className="text-sm font-medium">Sem dados de previsão</p>
          <p className="text-xs">Adicione transações para gerar previsões</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <LineChartIcon className="h-4 w-4 text-muted-foreground" />
            Previsão de Gastos
          </CardTitle>
          <p className="text-xs text-muted-foreground">Próximos {data.length} meses</p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={chartData} margin={{ left: 10, right: 10, top: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradientForecast" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
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
              {avgForecast > 0 && (
                <ReferenceLine
                  y={avgForecast}
                  stroke="#8b5cf6"
                  strokeDasharray="5 5"
                  strokeOpacity={0.5}
                  label={{ value: 'Média', position: 'right', fill: '#8b5cf6', fontSize: 11 }}
                />
              )}
              <Area
                type="monotone"
                dataKey="forecast"
                name="Previsão"
                fill="url(#gradientForecast)"
                stroke="transparent"
              />
              <Line
                type="monotone"
                dataKey="expenses"
                name="Histórico"
                stroke="#f87171"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#f87171', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                animationDuration={800}
              />
              <Line
                type="monotone"
                dataKey="forecast"
                name="Previsão"
                stroke="#8b5cf6"
                strokeWidth={2.5}
                strokeDasharray="6 3"
                dot={{ r: 4, fill: '#8b5cf6', strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
                animationDuration={800}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </motion.div>
  );
}
