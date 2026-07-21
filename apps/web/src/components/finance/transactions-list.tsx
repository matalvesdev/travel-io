'use client';

import * as React from 'react';
import { ChevronLeft, ChevronRight, Search, Trash2, Edit3, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatCurrency } from '@/lib/utils';
import type { Transaction } from '@/lib/api';

const ITEMS_PER_PAGE = 20;

interface TransactionsListProps {
  transactions: Transaction[];
  isLoading?: boolean;
  onDelete?: (ids: string[]) => void;
  onEdit?: (id: string, data: Partial<Transaction>) => void;
}

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

function inferMethod(description: string, categoryName?: string): string {
  const lower = (description + ' ' + (categoryName || '')).toLowerCase();
  if (lower.includes('crédito') || lower.includes('credito') || lower.includes('cartão')) return 'Crédito';
  if (lower.includes('débito') || lower.includes('debito')) return 'Débito';
  if (lower.includes('pix')) return 'PIX';
  return 'PIX';
}

type SortField = 'transactionDate' | 'amount' | 'description' | 'categoryName';
type SortDirection = 'asc' | 'desc';

export function TransactionsList({ transactions, isLoading, onDelete, onEdit }: TransactionsListProps) {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterType, setFilterType] = React.useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [filterCategory, setFilterCategory] = React.useState('ALL');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [sortField, setSortField] = React.useState<SortField>('transactionDate');
  const [sortDirection, setSortDirection] = React.useState<SortDirection>('desc');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editData, setEditData] = React.useState({ description: '', amount: '', category: '', date: '' });
  const [deleteConfirmId, setDeleteConfirmId] = React.useState<string | null>(null);

  const categories = React.useMemo(() => {
    const cats = [...new Set(transactions.map(t => t.categoryName).filter(Boolean))].sort();
    return cats;
  }, [transactions]);

  const filteredTransactions = React.useMemo(() => {
    let result = [...transactions];

    if (filterType !== 'ALL') {
      result = result.filter(t => t.type === filterType);
    }
    if (filterCategory !== 'ALL') {
      result = result.filter(t => t.categoryName === filterCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t =>
        t.description?.toLowerCase().includes(q) ||
        t.categoryName?.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      let aVal: any, bVal: any;
      switch (sortField) {
        case 'transactionDate': aVal = a.transactionDate || ''; bVal = b.transactionDate || ''; break;
        case 'amount': aVal = Math.abs(a.amount); bVal = Math.abs(b.amount); break;
        case 'description': aVal = a.description || ''; bVal = b.description || ''; break;
        case 'categoryName': aVal = a.categoryName || ''; bVal = b.categoryName || ''; break;
        default: aVal = a.transactionDate || ''; bVal = b.transactionDate || '';
      }
      if (typeof aVal === 'string') return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    });

    return result;
  }, [transactions, filterType, filterCategory, searchQuery, sortField, sortDirection]);

  const totalPages = Math.ceil(filteredTransactions.length / ITEMS_PER_PAGE);
  const paginatedTransactions = filteredTransactions.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  React.useEffect(() => { setCurrentPage(1); }, [filterType, filterCategory, searchQuery]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
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

  const handleBulkDelete = () => {
    onDelete?.(Array.from(selectedIds));
    setSelectedIds(new Set());
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
    if (!editingId || !onEdit) return;
    onEdit(editingId, {
      description: editData.description,
      amount: Math.abs(parseFloat(editData.amount) || 0),
      transactionDate: editData.date,
      categoryName: editData.category,
    });
    setEditingId(null);
  };

  const SortIndicator = ({ field }: { field: SortField }) => (
    <span className={`ml-1 text-[10px] ${sortField === field ? 'text-primary' : 'text-muted-foreground'}`}>
      {sortField === field ? (sortDirection === 'asc' ? '▲' : '▼') : '⇅'}
    </span>
  );

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-xl border border-border/50 bg-card/80 p-4">
            <div className="flex items-center gap-4">
              <div className="h-4 w-4 rounded bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
              <div className="h-4 w-24 rounded bg-muted" />
              <div className="h-4 flex-1 rounded bg-muted" />
              <div className="h-4 w-20 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar transações..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-9 h-9" />
        </div>
        <div className="flex rounded-lg border overflow-hidden">
          {(['ALL', 'INCOME', 'EXPENSE'] as const).map(type => (
            <button key={type} onClick={() => setFilterType(type)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${filterType === type ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'}`}>
              {type === 'ALL' ? 'Todos' : type === 'INCOME' ? 'Receitas' : 'Despesas'}
            </button>
          ))}
        </div>
        {categories.length > 0 && (
          <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}
            className="rounded-lg border border-border bg-background px-3 py-1.5 text-xs">
            <option value="ALL">Todas categorias</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        )}
      </div>

      {/* Bulk Actions */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg bg-primary/5 p-3">
          <span className="text-sm font-medium">{selectedIds.size} selecionada(s)</span>
          <Button variant="destructive" size="sm" onClick={handleBulkDelete}>
            <Trash2 className="mr-1 h-3 w-3" /> Excluir selecionadas
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setSelectedIds(new Set())}>
            <X className="mr-1 h-3 w-3" /> Limpar seleção
          </Button>
        </div>
      )}

      {/* Table */}
      <div className="rounded-xl border border-border/50 bg-card/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/50 bg-muted/20">
                <th className="w-12 p-4 text-left">
                  <input type="checkbox" className="rounded border-border" checked={paginatedTransactions.length > 0 && selectedIds.size === paginatedTransactions.length} onChange={toggleSelectAll} />
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase cursor-pointer hover:text-foreground" onClick={() => handleSort('transactionDate')}>
                  Data <SortIndicator field="transactionDate" />
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase cursor-pointer hover:text-foreground" onClick={() => handleSort('amount')}>
                  Valor <SortIndicator field="amount" />
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase cursor-pointer hover:text-foreground" onClick={() => handleSort('description')}>
                  Descrição <SortIndicator field="description" />
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase">Método</th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase cursor-pointer hover:text-foreground" onClick={() => handleSort('categoryName')}>
                  Categoria <SortIndicator field="categoryName" />
                </th>
                <th className="p-4 text-left text-xs font-semibold text-muted-foreground uppercase">Tipo</th>
                <th className="w-20 p-4"></th>
              </tr>
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
                  const method = inferMethod(t.description || '', t.categoryName);
                  const company = getCompanyInfo(t.description || '');
                  return (
                    <tr key={t.id}
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
                              <button onClick={saveEdit} className="text-muted-foreground hover:text-success p-1"><Check className="h-4 w-4" /></button>
                              <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:text-foreground p-1"><X className="h-4 w-4" /></button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => startEdit(t)} className="text-muted-foreground hover:text-foreground p-1"><Edit3 className="h-4 w-4" /></button>
                              {deleteConfirmId === tid ? (
                                <div className="flex items-center gap-1">
                                  <button onClick={() => { onDelete?.([tid]); setDeleteConfirmId(null); }} className="text-destructive hover:text-destructive/80 p-1"><Check className="h-4 w-4" /></button>
                                  <button onClick={() => setDeleteConfirmId(null)} className="text-muted-foreground hover:text-foreground p-1"><X className="h-4 w-4" /></button>
                                </div>
                              ) : (
                                <button onClick={() => setDeleteConfirmId(tid)} className="text-muted-foreground hover:text-destructive p-1"><Trash2 className="h-4 w-4" /></button>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
    </div>
  );
}
