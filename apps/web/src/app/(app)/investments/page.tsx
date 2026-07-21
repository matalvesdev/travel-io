'use client';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Loader2, Search, X, Check, TrendingUp, TrendingDown,
  DollarSign, PieChart, Trash2, Edit3, RefreshCw, Filter,
  ArrowUpRight, ArrowDownRight, BarChart3, Sparkles, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MetricCard } from '@/components/analytics/metric-card';
import { toast } from 'sonner';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { useQueryClient } from '@tanstack/react-query';
import {
  usePortfolio,
  useCreateInvestment,
  useUpdateInvestment,
  useDeleteInvestment,
  useQuotes,
} from '@/hooks/api/use-investments';

const TYPE_OPTIONS = [
  { value: 'STOCK', label: 'Ação', color: '#3B82F6', icon: '📈' },
  { value: 'FII', label: 'FII', color: '#10B981', icon: '🏢' },
  { value: 'ETF', label: 'ETF', color: '#8B5CF6', icon: '📊' },
  { value: 'FIXED_INCOME', label: 'Renda Fixa', color: '#F59E0B', icon: '🏦' },
  { value: 'CRYPTO', label: 'Cripto', color: '#EC4899', icon: '₿' },
  { value: 'OTHER', label: 'Outro', color: '#6B7280', icon: '📦' },
];

function BrApiLogo({ symbol }: { symbol: string }) {
  const [failed, setFailed] = React.useState(false);
  if (failed)
    return (
      <div className="h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center text-[10px] font-bold text-muted-foreground">
        {symbol.slice(0, 4)}
      </div>
    );
  return (
    <img
      src={`https://brapi.dev/api/v1/logo/${symbol}?size=64`}
      alt={symbol}
      className="h-8 w-8 rounded-lg object-contain bg-muted/30 p-0.5"
      onError={() => setFailed(true)}
    />
  );
}

function SimpleBarChart({ data }: { data: { label: string; value: number; color: string }[] }) {
  const total = data.reduce((a, d) => a + d.value, 0) || 1;
  return (
    <div className="flex items-end gap-1 h-32">
      {data.map((d, i) => {
        const pct = (d.value / total) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] text-muted-foreground">{pct.toFixed(0)}%</span>
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${Math.max(pct, 3)}%` }}
              transition={{ delay: i * 0.1, type: 'spring' }}
              className="w-full rounded-t-md"
              style={{ backgroundColor: d.color }}
            />
            <span className="text-[10px] text-muted-foreground truncate w-full text-center">
              {d.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function InvestmentsPage() {
  const queryClient = useQueryClient();
  const { data: portfolioData, isLoading } = usePortfolio();
  const createInvestment = useCreateInvestment();
  const updateInvestment = useUpdateInvestment();
  const deleteInvestment = useDeleteInvestment();

  const investments = portfolioData?.investments || [];

  const tickerSymbols = React.useMemo(
    () =>
      investments
        .map((i) => i.ticker)
        .filter(Boolean)
        .join(','),
    [investments]
  );

  const { data: quoteData } = useQuotes(tickerSymbols);

  const livePrices: Record<string, number> = React.useMemo(() => {
    if (!quoteData?.results) return {};
    const p: Record<string, number> = {};
    quoteData.results.forEach((r: any) => {
      p[r.stock] = r.close;
    });
    return p;
  }, [quoteData]);

  const [showAddModal, setShowAddModal] = React.useState(false);
  const [editItem, setEditItem] = React.useState<any>(null);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [searchResults, setSearchResults] = React.useState<any[]>([]);
  const [searching, setSearching] = React.useState(false);
  const [form, setForm] = React.useState({
    ticker: '',
    name: '',
    type: 'STOCK',
    quantity: '',
    price: '',
  });
  const [filterType, setFilterType] = React.useState('all');

  const portfolio = React.useMemo(() => {
    const totalInvested = investments.reduce(
      (a, i) => a + (i.quantity || 0) * (i.avgCost || 0),
      0
    );
    const currentValue = investments.reduce((a, i) => {
      const current = livePrices[i.ticker] || i.avgCost || 0;
      return a + current * (i.quantity || 0);
    }, 0);
    const totalReturn = currentValue - totalInvested;
    const returnPct = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
    const byType: Record<string, { value: number; count: number }> = {};
    investments.forEach((i) => {
      const current = livePrices[i.ticker] || i.avgCost || 0;
      const val = current * (i.quantity || 0);
      if (!byType[i.type]) byType[i.type] = { value: 0, count: 0 };
      byType[i.type].value += val;
      byType[i.type].count++;
    });
    return {
      totalInvested,
      currentValue,
      totalReturn,
      returnPct,
      byType,
    };
  }, [investments, livePrices]);

  const filtered =
    filterType === 'all'
      ? investments
      : investments.filter((i) => i.type === filterType);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const ticker = searchQuery.toUpperCase().replace(/\.\w+$/, '');
      const res = await fetch(`/api/brapi?symbols=${ticker}`);
      if (res.ok) {
        const d = await res.json();
        setSearchResults(
          (d.results || []).map((r: any) => ({
            symbol: r.stock,
            shortName: r.shortName || r.name || r.stock,
            price: r.close,
            change: r.change,
            changePercent: r.changePercent,
          }))
        );
      }
    } catch {}
    setSearching(false);
  };

  const handleSave = async () => {
    if (!form.ticker || !form.quantity || !form.price) return;
    const data = {
      ticker: form.ticker.toUpperCase(),
      name: form.name || form.ticker,
      type: form.type,
      quantity: parseFloat(form.quantity),
      avgCost: parseFloat(form.price),
    };
    try {
      if (editItem) {
        await updateInvestment.mutateAsync({ ...data, id: editItem.id } as any);
        toast.success('Ativo atualizado!');
      } else {
        await createInvestment.mutateAsync(data);
        toast.success('Ativo adicionado!');
      }
      setShowAddModal(false);
      setEditItem(null);
      setForm({ ticker: '', name: '', type: 'STOCK', quantity: '', price: '' });
    } catch {
      toast.error('Erro ao salvar');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteInvestment.mutateAsync(id);
      toast.success('Ativo removido!');
    } catch {
      toast.error('Erro ao remover');
    }
  };

  const handleEdit = (inv: any) => {
    setForm({
      ticker: inv.ticker,
      name: inv.name,
      type: inv.type,
      quantity: String(inv.quantity),
      price: String(inv.avgCost),
    });
    setEditItem(inv);
    setShowAddModal(true);
  };

  const getInsights = () => {
    const insights: {
      type: 'warning' | 'tip' | 'info';
      message: string;
      icon?: any;
    }[] = [];
    if (investments.length === 0) {
      insights.push({
        type: 'tip',
        message: 'Adicione seu primeiro ativo para começar a acompanhar sua carteira.',
        icon: Sparkles,
      });
      return insights;
    }
    if (portfolio.returnPct < -5)
      insights.push({
        type: 'warning',
        message: `Sua carteira está ${Math.abs(portfolio.returnPct).toFixed(1)}% abaixo do investido. Considere revisar sua estratégia de investimento.`,
        icon: TrendingDown,
      });
    if (portfolio.returnPct > 10)
      insights.push({
        type: 'info',
        message: `Excelente rentabilidade de ${portfolio.returnPct.toFixed(1)}%! Considere diversificar para manter o crescimento.`,
        icon: TrendingUp,
      });
    const types = Object.keys(portfolio.byType);
    if (types.length === 1) {
      const typeLabel =
        TYPE_OPTIONS.find((t) => t.value === types[0])?.label || types[0];
      insights.push({
        type: 'warning',
        message: `Todos os ativos são ${typeLabel}. Diversifique entre Ações, FIIs, ETFs e Renda Fixa para reduzir risco.`,
        icon: AlertCircle,
      });
    } else if (types.length <= 2) {
      insights.push({
        type: 'tip',
        message: `Sua carteira tem ${types.length} tipos de ativo. Considere adicionar mais diversificação (Renda Fixa, Cripto, ETFs).`,
        icon: TrendingUp,
      });
    } else {
      insights.push({
        type: 'info',
        message: `Boa diversificação com ${types.length} tipos de ativo. Continue assim!`,
        icon: Check,
      });
    }
    if (portfolio.totalInvested > 0 && portfolio.currentValue > portfolio.totalInvested) {
      const gain = portfolio.currentValue - portfolio.totalInvested;
      const monthly = gain / 12;
      insights.push({
        type: 'info',
        message: `Lucro acumulado de ${formatCurrency(gain)} (~${formatCurrency(monthly)}/mês). Continue investindo consistentemente!`,
        icon: TrendingUp,
      });
    }
    const largestType = Object.entries(portfolio.byType).sort(
      (a, b) => b[1].value - a[1].value
    )[0];
    if (largestType) {
      const pct =
        portfolio.currentValue > 0
          ? (largestType[1].value / portfolio.currentValue) * 100
          : 0;
      if (pct > 70) {
        insights.push({
          type: 'warning',
          message: `${largestType[0]} representa ${pct.toFixed(0)}% da carteira. Risco de concentração alto.`,
        });
      }
    }
    const liveCount = Object.keys(livePrices).length;
    if (liveCount > 0) {
      const gainers = investments.filter(
        (i) => livePrices[i.ticker] > i.avgCost
      );
      const losers = investments.filter(
        (i) => livePrices[i.ticker] > 0 && livePrices[i.ticker] < i.avgCost
      );
      if (gainers.length > 0)
        insights.push({
          type: 'info',
          message: `${gainers.length} ativo(s) com lucro no momento: ${gainers.map((g) => g.ticker).join(', ')}. Considere take profit.`,
          icon: TrendingUp,
        });
      if (losers.length > 0)
        insights.push({
          type: 'warning',
          message: `${losers.length} ativo(s) com prejuízo: ${losers.map((l) => l.ticker).join(', ')}. Avalie se vale manter.`,
          icon: TrendingDown,
        });
    }
    return insights;
  };

  const isSaving = createInvestment.isPending || updateInvestment.isPending;

  if (isLoading)
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );

  const allocData = Object.entries(portfolio.byType).map(([type, data]) => ({
    label: TYPE_OPTIONS.find((t) => t.value === type)?.label || type,
    value: data.value,
    color: TYPE_OPTIONS.find((t) => t.value === type)?.color || '#6B7280',
    count: data.count,
    percentage:
      portfolio.currentValue > 0 ? (data.value / portfolio.currentValue) * 100 : 0,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Investimentos</h1>
          <p className="text-muted-foreground">
            Acompanhe sua carteira em tempo real
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries()}
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button
            onClick={() => {
              setEditItem(null);
              setForm({
                ticker: '',
                name: '',
                type: 'STOCK',
                quantity: '',
                price: '',
              });
              setShowAddModal(true);
            }}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Novo
          </Button>
        </div>
      </div>

      {/* Summary Cards using MetricCard */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Investido"
          value={formatCurrency(portfolio.totalInvested)}
          icon={DollarSign}
          iconColor="text-blue-500"
        />
        <MetricCard
          title="Valor Atual"
          value={formatCurrency(portfolio.currentValue)}
          icon={TrendingUp}
          iconColor="text-purple-500"
        />
        <MetricCard
          title="Lucro/Prejuízo"
          value={formatCurrency(portfolio.totalReturn)}
          icon={portfolio.totalReturn >= 0 ? ArrowUpRight : ArrowDownRight}
          iconColor={
            portfolio.totalReturn >= 0 ? 'text-green-500' : 'text-red-500'
          }
          change={
            portfolio.totalReturn !== 0
              ? undefined
              : 0
          }
        />
        <MetricCard
          title="Rentabilidade"
          value={`${portfolio.returnPct >= 0 ? '+' : ''}${portfolio.returnPct.toFixed(2)}%`}
          icon={BarChart3}
          iconColor={
            portfolio.returnPct >= 0 ? 'text-green-500' : 'text-red-500'
          }
        />
      </div>

      {/* AI Insights */}
      {getInsights().length > 0 && (
        <div className="phantom-card p-4">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">Insights</span>
          </div>
          <div className="space-y-2">
            {getInsights().map((ins, i) => (
              <div
                key={i}
                className={`flex items-start gap-2 text-sm p-2 rounded-lg ${
                  ins.type === 'warning'
                    ? 'bg-amber-500/5'
                    : ins.type === 'tip'
                    ? 'bg-blue-500/5'
                    : 'bg-green-500/5'
                }`}
              >
                {ins.type === 'warning' ? (
                  <TrendingDown className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                ) : ins.type === 'tip' ? (
                  <Sparkles className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <TrendingUp className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                )}
                <span>{ins.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Positions Table */}
        <div className="phantom-card lg:col-span-2 overflow-hidden">
          <div className="p-4 border-b border-border/50 flex items-center justify-between">
            <h3 className="font-semibold">
              Posições ({filtered.length})
            </h3>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-sm rounded-lg border bg-background px-2 py-1"
              >
                <option value="all">Todos</option>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.icon} {t.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {filtered.length === 0 ? (
            <div className="p-8 text-center">
              <PieChart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">
                Nenhum investimento
                {filterType !== 'all' ? ' neste tipo' : ''}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/50 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                    <th className="p-3 text-left text-xs font-semibold text-muted-foreground uppercase">
                      Ativo
                    </th>
                    <th className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase">
                      Tipo
                    </th>
                    <th className="p-3 text-right text-xs font-semibold text-muted-foreground uppercase">
                      Qtd
                    </th>
                    <th className="p-3 text-right text-xs font-semibold text-muted-foreground uppercase">
                      Custo
                    </th>
                    <th className="p-3 text-right text-xs font-semibold text-muted-foreground uppercase">
                      Atual
                    </th>
                    <th className="p-3 text-right text-xs font-semibold text-muted-foreground uppercase">
                      Total
                    </th>
                    <th className="p-3 text-right text-xs font-semibold text-muted-foreground uppercase">
                      Lucro
                    </th>
                    <th className="p-3 text-center text-xs font-semibold text-muted-foreground uppercase">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((inv: any, i: number) => {
                    const current = livePrices[inv.ticker] || inv.avgCost;
                    const totalValue = current * inv.quantity;
                    const costBasis = inv.avgCost * inv.quantity;
                    const profit = totalValue - costBasis;
                    const profitPct =
                      costBasis > 0 ? (profit / costBasis) * 100 : 0;
                    const typeOpt = TYPE_OPTIONS.find(
                      (t) => t.value === inv.type
                    );
                    return (
                      <motion.tr
                        key={inv.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.02 }}
                        className="border-b border-border/20 hover:bg-muted/30 transition-colors"
                      >
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <BrApiLogo symbol={inv.ticker} />
                            <div>
                              <p className="font-medium text-sm">
                                {inv.ticker}
                              </p>
                              <p className="text-[10px] text-muted-foreground truncate max-w-[140px]">
                                {inv.name}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full font-medium"
                            style={{
                              backgroundColor:
                                (typeOpt?.color || '#6B7280') + '15',
                              color: typeOpt?.color || '#6B7280',
                            }}
                          >
                            {typeOpt?.label || inv.type}
                          </span>
                        </td>
                        <td className="p-3 text-right text-sm">
                          {inv.quantity}
                        </td>
                        <td className="p-3 text-right text-sm text-muted-foreground">
                          {formatCurrency(inv.avgCost)}
                        </td>
                        <td className="p-3 text-right text-sm font-medium">
                          {formatCurrency(current)}
                          {livePrices[inv.ticker] && (
                            <span className="text-[10px] ml-1 text-muted-foreground">
                              live
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right text-sm font-semibold">
                          {formatCurrency(totalValue)}
                        </td>
                        <td className="p-3 text-right">
                          <span
                            className={`text-sm font-medium flex items-center justify-end gap-0.5 ${
                              profit >= 0 ? 'text-green-600' : 'text-red-500'
                            }`}
                          >
                            {profit >= 0 ? (
                              <ArrowUpRight className="h-3 w-3" />
                            ) : (
                              <ArrowDownRight className="h-3 w-3" />
                            )}
                            {profit >= 0 ? '+' : ''}
                            {formatPercent(profitPct)}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleEdit(inv)}
                              className="h-7 w-7 rounded flex items-center justify-center hover:bg-muted text-muted-foreground hover:text-primary"
                            >
                              <Edit3 className="h-3.5 w-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(inv.id)}
                              className="h-7 w-7 rounded flex items-center justify-center hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Allocation Chart */}
          <div className="phantom-card">
            <div className="p-4 border-b border-border/50">
              <h3 className="font-semibold flex items-center gap-2">
                <PieChart className="h-4 w-4" /> Alocação
              </h3>
            </div>
            <div className="p-4">
              {allocData.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Sem dados
                </p>
              ) : (
                <>
                  <SimpleBarChart data={allocData} />
                  <div className="mt-4 space-y-2">
                    {allocData.map((d) => (
                      <div
                        key={d.label}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: d.color }}
                          />
                          <span>{d.label}</span>
                          <span className="text-muted-foreground">
                            ({d.count})
                          </span>
                        </div>
                        <span className="font-medium">
                          {d.percentage.toFixed(1)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Top movers */}
          {investments.length > 0 && (
            <div className="phantom-card">
              <div className="p-4 border-b border-border/50">
                <h3 className="font-semibold flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Movimentação
                </h3>
              </div>
              <div className="p-4 space-y-3">
                {investments
                  .map((inv) => ({
                    ...inv,
                    current: livePrices[inv.ticker] || inv.avgCost,
                    profit:
                      (livePrices[inv.ticker] || inv.avgCost) - inv.avgCost,
                  }))
                  .sort((a, b) => Math.abs(b.profit) - Math.abs(a.profit))
                  .slice(0, 5)
                  .map((inv) => (
                    <div
                      key={inv.id}
                      className="flex items-center justify-between text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <BrApiLogo symbol={inv.ticker} />
                        <span className="font-medium">{inv.ticker}</span>
                      </div>
                      <span
                        className={`font-medium ${
                          inv.profit >= 0 ? 'text-green-600' : 'text-red-500'
                        }`}
                      >
                        {inv.profit >= 0 ? '+' : ''}
                        {formatCurrency(inv.profit)}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="phantom-card-elevated w-full max-w-md mx-4"
            >
              <div className="flex items-center justify-between p-6 pb-0">
                <h3 className="text-lg font-semibold">
                  {editItem ? 'Editar Investimento' : 'Novo Investimento'}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditItem(null);
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-medium">Buscar ativo</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="ITUB4, PETR4, HGLG11..."
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <Button
                      onClick={handleSearch}
                      disabled={searching}
                      variant="outline"
                      size="icon"
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </div>
                  {searchResults.length > 0 && (
                    <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border">
                      {searchResults.map((r) => (
                        <div
                          key={r.symbol}
                          onClick={() => {
                            setForm({
                              ...form,
                              ticker: r.symbol,
                              name: r.shortName,
                              price: String(r.price || ''),
                            });
                            setSearchResults([]);
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-muted/50 cursor-pointer border-b last:border-0"
                        >
                          <BrApiLogo symbol={r.symbol} />
                          <div className="flex-1">
                            <p className="font-medium text-sm">{r.symbol}</p>
                            <p className="text-xs text-muted-foreground">
                              {r.shortName}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-semibold">
                              {formatCurrency(r.price || 0)}
                            </p>
                            {r.changePercent !== undefined && (
                              <p
                                className={`text-xs ${
                                  r.changePercent >= 0
                                    ? 'text-green-600'
                                    : 'text-red-500'
                                }`}
                              >
                                {r.changePercent >= 0 ? '+' : ''}
                                {r.changePercent?.toFixed(2)}%
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">Ticker *</label>
                    <Input
                      value={form.ticker}
                      onChange={(e) =>
                        setForm({ ...form, ticker: e.target.value.toUpperCase() })
                      }
                      placeholder="ITUB4"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Tipo</label>
                    <select
                      value={form.type}
                      onChange={(e) =>
                        setForm({ ...form, type: e.target.value })
                      }
                      className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
                    >
                      {TYPE_OPTIONS.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.icon} {t.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium">
                      Quantidade *
                    </label>
                    <Input
                      type="number"
                      value={form.quantity}
                      onChange={(e) =>
                        setForm({ ...form, quantity: e.target.value })
                      }
                      placeholder="100"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">
                      Preço Médio (R$) *
                    </label>
                    <Input
                      type="number"
                      step="0.01"
                      value={form.price}
                      onChange={(e) =>
                        setForm({ ...form, price: e.target.value })
                      }
                      placeholder="25.50"
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Nome (opcional)
                  </label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                    }
                    placeholder="Nome do ativo"
                    className="mt-1"
                  />
                </div>
                <Button
                  onClick={handleSave}
                  className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
                  disabled={
                    !form.ticker ||
                    !form.quantity ||
                    !form.price ||
                    isSaving
                  }
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{' '}
                      Salvando...
                    </>
                  ) : editItem ? (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Salvar Alterações
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" /> Adicionar à Carteira
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
