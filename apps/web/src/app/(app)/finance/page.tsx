'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Loader2, X, Upload,
  Search, Wallet, ChevronLeft, ChevronRight, Filter, Plus, Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import { MetricCard } from '@/components/analytics/metric-card';
import { ImportCSV } from '@/components/finance/import-csv';
import { useTransactions, useCreateTransaction, useDeleteTransaction, useUpdateTransaction } from '@/hooks/api/use-finance';
import type { Transaction, CreateTransactionRequest } from '@/lib/api';

const ITEMS_PER_PAGE = 20;

const MONTH_OPTIONS = [
  { value: '0', label: 'Jan' }, { value: '1', label: 'Fev' }, { value: '2', label: 'Mar' },
  { value: '3', label: 'Abr' }, { value: '4', label: 'Mai' }, { value: '5', label: 'Jun' },
  { value: '6', label: 'Jul' }, { value: '7', label: 'Ago' }, { value: '8', label: 'Set' },
  { value: '9', label: 'Out' }, { value: '10', label: 'Nov' }, { value: '11', label: 'Dez' },
];

const YEAR_OPTIONS = [
  { value: '2023', label: '2023' }, { value: '2024', label: '2024' },
  { value: '2025', label: '2025' }, { value: '2026', label: '2026' },
];

const TYPE_OPTIONS = [
  { value: 'ALL', label: 'Todos' },
  { value: 'INCOME', label: 'Receitas' },
  { value: 'EXPENSE', label: 'Despesas' },
];

const CATEGORY_OPTIONS = [
  { value: 'ALL', label: 'Todas' },
  { value: 'Renda', label: 'Renda' },
  { value: 'Alimentação', label: 'Alimentação' },
  { value: 'Moradia', label: 'Moradia' },
  { value: 'Transporte', label: 'Transporte' },
  { value: 'Saúde', label: 'Saúde' },
  { value: 'Educação', label: 'Educação' },
  { value: 'Lazer', label: 'Lazer' },
  { value: 'Pets', label: 'Pets' },
  { value: 'Casa', label: 'Casa' },
  { value: 'Trabalho', label: 'Trabalho' },
  { value: 'Vestuário', label: 'Vestuário' },
  { value: 'Dívidas', label: 'Dívidas' },
  { value: 'Outros', label: 'Outros' },
];

const MONTH_NAMES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

const COMPANY_LOGOS: Record<string, { letter: string; color: string }> = {
  'ifood': { letter: 'iF', color: '#EA1D2C' },
  'uber': { letter: 'U', color: '#000000' },
  '99 food': { letter: '99', color: '#FF441F' },
  '99food': { letter: '99', color: '#FF441F' },
  'netflix': { letter: 'N', color: '#E50914' },
  'spotify': { letter: 'S', color: '#1DB954' },
  'amazon': { letter: 'A', color: '#FF9900' },
  'apple': { letter: 'A', color: '#A2AAAD' },
  'canva': { letter: 'C', color: '#00C4CC' },
  'deezer': { letter: 'D', color: '#A238FF' },
  'starbucks': { letter: 'SB', color: '#00704A' },
  'mcdonald': { letter: 'M', color: '#FFC72C' },
  'popeyes': { letter: 'PP', color: '#E51636' },
  'carrefour': { letter: 'C', color: '#004A97' },
  'oxxo': { letter: 'O', color: '#D32F2F' },
  'pague menos': { letter: 'PM', color: '#D32F2F' },
  'enxuto': { letter: 'E', color: '#4CAF50' },
  'savegnago': { letter: 'S', color: '#E53935' },
  'drogasil': { letter: 'D', color: '#0066CC' },
  'petlove': { letter: 'PL', color: '#E65100' },
  'unimed': { letter: 'U', color: '#009C3B' },
  'claro': { letter: 'C', color: '#DA291C' },
  'tim': { letter: 'T', color: '#004B93' },
  'ludens': { letter: 'L', color: '#7C4DFF' },
  'bottcher': { letter: 'B', color: '#5C6BC0' },
  'shein': { letter: 'SH', color: '#000000' },
  'shopee': { letter: 'SP', color: '#EE4D2D' },
  'mercado livre': { letter: 'ML', color: '#FFE600' },
  'magalu': { letter: 'MG', color: '#0086FF' },
  'nubank': { letter: 'NU', color: '#820AD1' },
  'itaú': { letter: 'IT', color: '#EC7000' },
  'itau': { letter: 'IT', color: '#EC7000' },
  'c6': { letter: 'C6', color: '#000000' },
};

function getCompanyInfo(description: string) {
  const lower = description.toLowerCase();
  for (const [key, info] of Object.entries(COMPANY_LOGOS)) {
    if (lower.includes(key)) return info;
  }
  return null;
}

function inferMethod(description: string): string {
  const lower = description.toLowerCase();
  if (lower.includes('crédito') || lower.includes('credito') || lower.includes('cartão')) return 'Crédito';
  if (lower.includes('débito') || lower.includes('debito')) return 'Débito';
  if (lower.includes('pix')) return 'PIX';
  if (['netflix', 'spotify', 'amazon', 'apple', 'canva', 'deezer'].some(s => lower.includes(s))) return 'Crédito';
  return 'PIX';
}

function detectCategoryFromInput(desc: string): string {
  const lower = desc.toLowerCase();
  const cats: Record<string, string[]> = {
    'Alimentação': ['supermercado', 'mercado', 'ifood', 'restaurante', 'almoço', 'jantar', 'lanche', 'padaria', 'starbucks', 'mcdonald', 'bk', 'popeyes', 'pizza', 'sushi', 'café', '99 food', 'pague menos', 'enxuto', 'savegnago'],
    'Moradia': ['aluguel', 'condomínio', 'luz', 'água', 'internet', 'celular', 'sanasa', 'cpfl', 'energia'],
    'Transporte': ['uber', '99', 'combustível', 'gasolina', 'estacionamento', 'ônibus'],
    'Saúde': ['farmácia', 'médico', 'hospital', 'academia', 'drogasil', 'unimed', 'conselho', 'psicoterapia'],
    'Lazer': ['netflix', 'spotify', 'cinema', 'show', 'bar'],
    'Pets': ['pet', 'paco', 'animal'],
    'Educação': ['faculdade', 'curso', 'livro', 'escola', 'marketing'],
    'Casa': ['casa', 'consultório', 'coisa'],
    'Vestuário': ['roupa', 'shein', 'renner', 'pernambucanas', 'cosmético'],
    'Dívidas': ['serasa', 'empréstimo', 'acordo'],
  };
  for (const [cat, kws] of Object.entries(cats)) {
    if (kws.some(kw => lower.includes(kw))) return cat;
  }
  return 'Outros';
}

export default function FinancePage() {
  const now = new Date();
  const [showAddModal, setShowAddModal] = React.useState(false);
  const [showImportModal, setShowImportModal] = React.useState(false);
  const [newTransaction, setNewTransaction] = React.useState({
    description: '', amount: '', type: 'EXPENSE' as 'INCOME' | 'EXPENSE',
    date: new Date().toISOString().split('T')[0], category: '',
  });

  const [filterType, setFilterType] = React.useState('ALL');
  const [filterCategory, setFilterCategory] = React.useState('ALL');
  const [filterYear, setFilterYear] = React.useState(String(now.getFullYear()));
  const [filterMonth, setFilterMonth] = React.useState(String(now.getMonth()));
  const [searchQuery, setSearchQuery] = React.useState('');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [showFilters, setShowFilters] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editData, setEditData] = React.useState({ description: '', amount: '', category: '', date: '' });

  const startDate = `${filterYear}-${String(parseInt(filterMonth) + 1).padStart(2, '0')}-01`;
  const endMonth = parseInt(filterMonth) + 1;
  const endYear = parseInt(filterYear);
  const endDate = `${endYear}-${String(endMonth).padStart(2, '0')}-${new Date(endYear, endMonth, 0).getDate()}`;

  const { data: transactionsData, isLoading } = useTransactions({ startDate, endDate });
  const allTransactions = transactionsData?.transactions || [];
  const createTransaction = useCreateTransaction();
  const deleteTransaction = useDeleteTransaction();
  const updateTransaction = useUpdateTransaction();

  const filteredTransactions = React.useMemo(() => {
    let result = [...allTransactions];

    if (filterType !== 'ALL') result = result.filter(t => t.type === filterType);
    if (filterCategory !== 'ALL') result = result.filter(t => t.categoryName === filterCategory);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.description?.toLowerCase().includes(q) ||
        t.categoryName?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const dateA = a.transactionDate || '';
      const dateB = b.transactionDate || '';
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      return Math.abs(b.amount) - Math.abs(a.amount);
    });

    return result;
  }, [allTransactions, filterType, filterCategory, searchQuery]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  React.useEffect(() => { setCurrentPage(1); }, [filterType, filterCategory, searchQuery, filterYear, filterMonth]);

  const totalIncome = filteredTransactions.filter(t => t.type === 'INCOME').reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalExpenses = filteredTransactions.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Math.abs(t.amount), 0);
  const monthlyBalance = totalIncome - totalExpenses;

  const handleAddTransaction = () => {
    if (!newTransaction.description || !newTransaction.amount) return;
    const amount = parseFloat(newTransaction.amount);
    if (isNaN(amount) || amount === 0) return;

    const payload: CreateTransactionRequest = {
      type: newTransaction.type,
      amount: Math.abs(amount),
      description: newTransaction.description,
      transactionDate: newTransaction.date,
      accountId: '',
    };
    createTransaction.mutate(payload, {
      onSuccess: () => {
        setShowAddModal(false);
        setNewTransaction({ description: '', amount: '', type: 'EXPENSE', date: new Date().toISOString().split('T')[0], category: '' });
      },
    });
  };

  const handleImportTransactions = (parsed: { date: string; description: string; amount: number; type: string }[]) => {
    for (const t of parsed) {
      createTransaction.mutate({
        type: t.type,
        amount: t.amount,
        description: t.description,
        transactionDate: t.date,
        accountId: '',
      });
    }
    setShowImportModal(false);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedTransactions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedTransactions.map(t => String(t.id))));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const startEdit = (t: Transaction) => {
    setEditingId(String(t.id));
    setEditData({
      description: t.description || '',
      amount: String(Math.abs(t.amount)),
      category: t.categoryName || '',
      date: t.transactionDate || '',
    });
  };

  const saveEdit = () => {
    if (!editingId) return;
    updateTransaction.mutate({
      id: editingId,
      data: {
        description: editData.description,
        amount: Math.abs(parseFloat(editData.amount) || 0),
        transactionDate: editData.date,
      },
    }, { onSuccess: () => setEditingId(null) });
  };

  const deleteSelected = () => {
    for (const id of selectedIds) {
      deleteTransaction.mutate(id);
    }
    setSelectedIds(new Set());
  };

  const deleteSingle = (id: string) => {
    deleteTransaction.mutate(id);
  };

  if (isLoading) {
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
          <h1 className="text-3xl font-bold">Finanças</h1>
          <p className="text-muted-foreground">{MONTH_NAMES[parseInt(filterMonth)]} {filterYear}</p>
        </div>
      </div>

      {/* Period Selector */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex rounded-lg border overflow-hidden">
          {MONTH_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setFilterMonth(opt.value)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${filterMonth === opt.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex rounded-lg border overflow-hidden">
          {YEAR_OPTIONS.map(opt => (
            <button key={opt.value} onClick={() => setFilterYear(opt.value)}
              className={`px-3 py-2 text-xs font-medium transition-colors ${filterYear === opt.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Saldo Mensal"
          value={formatCurrency(monthlyBalance)}
          icon={Wallet}
          iconColor={monthlyBalance >= 0 ? 'text-success' : 'text-destructive'}
        />
        <MetricCard
          title="Receitas do Mês"
          value={formatCurrency(totalIncome)}
          icon={TrendingUp}
          iconColor="text-success"
        />
        <MetricCard
          title="Despesas do Mês"
          value={formatCurrency(totalExpenses)}
          icon={TrendingDown}
          iconColor="text-destructive"
        />
      </div>

      {/* Transactions Table */}
      <div className="phantom-card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-border/50">
          <h3 className="text-lg font-semibold">Histórico de Transações</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar transações..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 w-64 h-9" />
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
              <Filter className="mr-1 h-3 w-3" /> Filtros
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowImportModal(true)}>
              <Upload className="mr-1 h-3 w-3" /> Importar
            </Button>
            <Button size="sm" onClick={() => setShowAddModal(true)} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white border-0">
              <Plus className="mr-1 h-3 w-3" /> Nova Transação
            </Button>
          </div>
        </div>

        {showFilters && (
          <div className="p-5 border-b border-border/50 bg-muted/20">
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Tipo</label>
                <div className="flex rounded-lg border overflow-hidden">
                  {TYPE_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setFilterType(opt.value)}
                      className={`px-3 py-1.5 text-xs font-medium transition-colors ${filterType === opt.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Categoria</label>
                <div className="flex flex-wrap rounded-lg border overflow-hidden">
                  {CATEGORY_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setFilterCategory(opt.value)}
                      className={`px-3 py-1.5 text-xs font-medium transition-colors ${filterCategory === opt.value ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                <th className="w-12 p-4 text-left">
                  <input type="checkbox" className="rounded border-border" checked={paginatedTransactions.length > 0 && selectedIds.size === paginatedTransactions.length} onChange={toggleSelectAll} />
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Data</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Valor</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nome</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Método</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Categoria</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="w-20 p-4"></th>
              </tr>
              {selectedIds.size > 0 && (
                <tr className="bg-primary/5">
                  <td colSpan={8} className="px-4 py-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{selectedIds.size} selecionada(s)</span>
                      <Button variant="destructive" size="sm" onClick={deleteSelected}>
                        <X className="mr-1 h-3 w-3" /> Excluir selecionadas
                      </Button>
                    </div>
                  </td>
                </tr>
              )}
            </thead>
            <tbody>
              {paginatedTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-12 text-center">
                    <Search className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">Nenhuma transação encontrada</p>
                    <p className="text-sm text-muted-foreground/60 mt-1">Ajuste os filtros ou importe uma planilha</p>
                  </td>
                </tr>
              ) : (
                paginatedTransactions.map((t, i) => {
                  const tid = String(t.id);
                  const isEditing = editingId === tid;
                  const isSelected = selectedIds.has(tid);
                  const method = inferMethod(t.description || '');
                  const company = getCompanyInfo(t.description || '');
                  return (
                    <motion.tr key={t.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.015 }}
                      className={`border-b border-border/30 hover:bg-muted/30 transition-colors ${isSelected ? 'bg-primary/5' : i % 2 === 0 ? 'bg-muted/10' : ''}`}>
                      <td className="p-4"><input type="checkbox" className="rounded border-border" checked={isSelected} onChange={() => toggleSelect(tid)} /></td>
                      <td className="p-4">
                        {isEditing ? (
                          <Input type="date" value={editData.date} onChange={e => setEditData({ ...editData, date: e.target.value })} className="h-8 text-xs w-32" />
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            {t.transactionDate ? new Date(t.transactionDate + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) : '—'}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <Input type="number" step="0.01" value={editData.amount} onChange={e => setEditData({ ...editData, amount: e.target.value })} className="h-8 text-xs w-24" />
                        ) : (
                          <span className={`font-semibold text-sm ${t.type === 'INCOME' ? 'text-success' : 'text-destructive'}`}>
                            {t.type === 'INCOME' ? '+' : '-'} {formatCurrency(Math.abs(t.amount))}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <Input value={editData.description} onChange={e => setEditData({ ...editData, description: e.target.value })} className="h-8 text-xs" />
                        ) : (
                          <div className="flex items-center gap-3">
                            {company ? (
                              <div className="h-8 w-8 rounded-lg flex items-center justify-center text-[10px] font-bold text-white" style={{ backgroundColor: company.color }}>{company.letter}</div>
                            ) : (
                              <div className={`h-8 w-8 rounded-lg flex items-center justify-center text-xs font-bold text-white ${t.type === 'INCOME' ? 'bg-success/80' : 'bg-primary/80'}`}>
                                {t.type === 'INCOME' ? 'R' : 'D'}
                              </div>
                            )}
                            <span className="font-medium text-sm">{t.description || 'Sem descrição'}</span>
                          </div>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${
                          method === 'PIX' ? 'bg-emerald-500/10 text-emerald-500' :
                          method === 'Crédito' ? 'bg-violet-500/10 text-violet-500' :
                          'bg-blue-500/10 text-blue-500'
                        }`}>{method}</span>
                      </td>
                      <td className="p-4">
                        {isEditing ? (
                          <Input value={editData.category} onChange={e => setEditData({ ...editData, category: e.target.value })} className="h-8 text-xs w-32" />
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-muted/50 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                            {t.categoryName || 'Geral'}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-medium ${t.type === 'INCOME' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                          {t.type === 'INCOME' ? 'Receita' : 'Despesa'}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          {isEditing ? (
                            <>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={saveEdit}><Check className="h-3 w-3" /></Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditingId(null)}><X className="h-3 w-3" /></Button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(t)} className="text-muted-foreground hover:text-foreground p-1">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                              </button>
                              <button onClick={() => deleteSingle(tid)} className="text-muted-foreground hover:text-destructive p-1">
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-border/50">
            <p className="text-xs text-muted-foreground">
              Mostrando {((currentPage - 1) * ITEMS_PER_PAGE) + 1} a {Math.min(currentPage * ITEMS_PER_PAGE, filteredTransactions.length)} de {filteredTransactions.length}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
              <span className="text-xs text-muted-foreground">{currentPage} / {totalPages}</span>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
            </div>
          </div>
        )}
      </div>

      {/* Add Transaction Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="phantom-card-elevated w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 pb-0">
              <h3 className="text-lg font-semibold">Nova Transação</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowAddModal(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Tipo</label>
                <div className="flex gap-2">
                  <Button variant={newTransaction.type === 'EXPENSE' ? 'default' : 'outline'} onClick={() => setNewTransaction({ ...newTransaction, type: 'EXPENSE' })} className="flex-1">
                    <TrendingDown className="mr-2 h-4 w-4" /> Despesa
                  </Button>
                  <Button variant={newTransaction.type === 'INCOME' ? 'default' : 'outline'} onClick={() => setNewTransaction({ ...newTransaction, type: 'INCOME' })} className="flex-1">
                    <TrendingUp className="mr-2 h-4 w-4" /> Receita
                  </Button>
                </div>
              </div>
              <div><label className="text-sm font-medium mb-1 block">Descrição</label><Input value={newTransaction.description} onChange={e => setNewTransaction({ ...newTransaction, description: e.target.value })} placeholder="Ex: Netflix, Supermercado..." /></div>
              <div><label className="text-sm font-medium mb-1 block">Valor (R$)</label><Input type="number" step="0.01" value={newTransaction.amount} onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })} placeholder="0,00" /></div>
              <div><label className="text-sm font-medium mb-1 block">Data</label><Input type="date" value={newTransaction.date} onChange={e => setNewTransaction({ ...newTransaction, date: e.target.value })} /></div>
              <div><label className="text-sm font-medium mb-1 block">Categoria</label><Input value={newTransaction.category} onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })} placeholder="Auto-detectar (opcional)" /></div>
              <Button onClick={handleAddTransaction} className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white" disabled={!newTransaction.description || !newTransaction.amount || createTransaction.isPending}>
                {createTransaction.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}
                Adicionar Transação
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="phantom-card-elevated w-full max-w-lg mx-4">
            <div className="flex items-center justify-between p-6 pb-0">
              <h3 className="text-lg font-semibold">Importar Planilha</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowImportModal(false)}><X className="h-4 w-4" /></Button>
            </div>
            <div className="p-6">
              <ImportCSV onImport={handleImportTransactions} onClose={() => setShowImportModal(false)} />
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}
