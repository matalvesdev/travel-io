'use client';

import * as React from 'react';
import { Upload, FileText, X, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { parseCSV, parseOFX, parseXLSX, type ParsedTransaction } from '@/lib/api/parse-csv';

interface ImportCSVProps {
  onImport: (transactions: ParsedTransaction[]) => void;
  onClose?: () => void;
}

type MappingField = 'date' | 'description' | 'amount' | 'type';

interface ColumnMapping {
  date: string;
  description: string;
  amount: string;
  type: string;
}

const FIELD_LABELS: Record<MappingField, string> = {
  date: 'Data',
  description: 'Descrição',
  amount: 'Valor',
  type: 'Tipo',
};

export function ImportCSV({ onImport, onClose }: ImportCSVProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [rawHeaders, setRawHeaders] = React.useState<string[]>([]);
  const [rawRows, setRawRows] = React.useState<string[][]>([]);
  const [preview, setPreview] = React.useState<ParsedTransaction[]>([]);
  const [processing, setProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [step, setStep] = React.useState<'upload' | 'mapping' | 'preview'>('upload');
  const [columnMapping, setColumnMapping] = React.useState<ColumnMapping>({
    date: '',
    description: '',
    amount: '',
    type: '',
  });
  const [importing, setImporting] = React.useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOut = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) processFile(droppedFile);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) processFile(selectedFile);
  };

  const processFile = async (f: File) => {
    setFile(f);
    setProcessing(true);
    setError(null);

    try {
      if (f.name.endsWith('.xlsx') || f.name.endsWith('.xls')) {
        const buffer = await f.arrayBuffer();
        const transactions = await parseXLSX(buffer);
        setPreview(transactions);
        setStep('preview');
      } else {
        const content = await f.text();
        if (f.name.endsWith('.ofx')) {
          const transactions = parseOFX(content);
          setPreview(transactions);
          setStep('preview');
        } else {
          const lines = content.split('\n').filter(l => l.trim());
          if (lines.length < 2) {
            setError('Arquivo CSV deve ter pelo menos um cabeçalho e uma linha de dados.');
            setProcessing(false);
            return;
          }
          const sep = lines[0].includes(';') ? ';' : ',';
          const headers = lines[0].split(sep).map(h => h.trim().replace(/"/g, ''));
          const rows = lines.slice(1).map(l => l.split(sep).map(v => v.trim().replace(/"/g, '')));
          setRawHeaders(headers);
          setRawRows(rows);
          autoDetectMapping(headers);
          setStep('mapping');
        }
      }
    } catch {
      setError('Erro ao processar arquivo. Verifique o formato.');
    } finally {
      setProcessing(false);
    }
  };

  const autoDetectMapping = (headers: string[]) => {
    const lower = headers.map(h => h.toLowerCase());
    const mapping: ColumnMapping = { date: '', description: '', amount: '', type: '' };

    const dateKeys = ['data', 'date', 'dt', 'data_transacao', 'data_compra'];
    const descKeys = ['descricao', 'description', 'desc', 'historico', 'memo', 'nome', 'estabelecimento'];
    const amountKeys = ['valor', 'amount', 'value', 'quantia', 'montante'];
    const typeKeys = ['tipo', 'type', 'category_type'];

    for (let i = 0; i < lower.length; i++) {
      if (!mapping.date && dateKeys.some(k => lower[i].includes(k))) mapping.date = headers[i];
      if (!mapping.description && descKeys.some(k => lower[i].includes(k))) mapping.description = headers[i];
      if (!mapping.amount && amountKeys.some(k => lower[i].includes(k))) mapping.amount = headers[i];
      if (!mapping.type && typeKeys.some(k => lower[i].includes(k))) mapping.type = headers[i];
    }

    setColumnMapping(mapping);
  };

  const generatePreview = () => {
    if (!columnMapping.date || !columnMapping.description || !columnMapping.amount) {
      setError('Mapeie pelo menos Data, Descrição e Valor.');
      return;
    }

    const dateIdx = rawHeaders.indexOf(columnMapping.date);
    const descIdx = rawHeaders.indexOf(columnMapping.description);
    const amountIdx = rawHeaders.indexOf(columnMapping.amount);
    const typeIdx = columnMapping.type ? rawHeaders.indexOf(columnMapping.type) : -1;

    const transactions: ParsedTransaction[] = [];
    for (const row of rawRows) {
      const dateStr = row[dateIdx] || '';
      const desc = row[descIdx] || '';
      const amountStr = row[amountIdx] || '0';
      if (!dateStr || !desc) continue;

      let cleaned = amountStr.replace(/R\$/g, '').replace(/\s/g, '');
      if (cleaned.includes('.') && cleaned.includes(',')) {
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      } else if (cleaned.includes(',')) {
        cleaned = cleaned.replace(',', '.');
      }
      const amount = parseFloat(cleaned);
      if (isNaN(amount) || amount === 0) continue;

      let type: 'INCOME' | 'EXPENSE' = amount >= 0 ? 'INCOME' : 'EXPENSE';
      if (typeIdx !== -1) {
        const rawType = (row[typeIdx] || '').toLowerCase();
        if (rawType === 'despesa' || rawType === 'expense' || rawType === 'f' || rawType === 'v') type = 'EXPENSE';
        else if (rawType === 'receita' || rawType === 'income' || rawType === 'r') type = 'INCOME';
      }

      transactions.push({
        date: dateStr,
        description: desc,
        amount: Math.abs(amount),
        type,
      });
    }

    if (transactions.length === 0) {
      setError('Nenhuma transação válida encontrada com o mapeamento atual.');
      return;
    }

    setPreview(transactions);
    setError(null);
    setStep('preview');
  };

  const handleImport = async () => {
    setImporting(true);
    try {
      onImport(preview);
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setRawHeaders([]);
    setRawRows([]);
    setPreview([]);
    setError(null);
    setColumnMapping({ date: '', description: '', amount: '', type: '' });
    setStep('upload');
  };

  return (
    <div className="space-y-4">
      {step === 'upload' && (
        <>
          <div
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
              isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            {processing ? (
              <Loader2 className="mb-4 h-10 w-10 animate-spin text-primary" />
            ) : (
              <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
            )}
            <p className="mb-2 text-sm font-medium">
              {processing ? 'Processando arquivo...' : 'Arraste um arquivo aqui ou clique para selecionar'}
            </p>
            <p className="mb-4 text-xs text-muted-foreground">
              Formatos aceitos: CSV, OFX, XLSX
            </p>
            <label>
              <input
                type="file"
                accept=".csv,.ofx,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button variant="outline" size="sm" asChild>
                <span>Selecionar arquivo</span>
              </Button>
            </label>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}
        </>
      )}

      {step === 'mapping' && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-medium">{file?.name}</span>
              <span className="text-sm text-muted-foreground">({rawRows.length} linhas)</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <p className="text-sm text-muted-foreground">
            Mapeie as colunas do arquivo para os campos de transação.
          </p>

          <div className="space-y-3">
            {(Object.keys(FIELD_LABELS) as MappingField[]).map(field => (
              <div key={field}>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">
                  {FIELD_LABELS[field]}
                  {field !== 'type' && <span className="text-destructive ml-1">*</span>}
                </label>
                <select
                  value={columnMapping[field]}
                  onChange={e => setColumnMapping({ ...columnMapping, [field]: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                >
                  <option value="">Selecionar coluna...</option>
                  {rawHeaders.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {rawHeaders.length > 0 && rawRows.length > 0 && (
            <div className="max-h-40 overflow-auto rounded-lg border text-xs">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    {rawHeaders.slice(0, 6).map((h, i) => (
                      <th key={i} className="p-2 text-left font-medium">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rawRows.slice(0, 3).map((row, i) => (
                    <tr key={i} className="border-t">
                      {row.slice(0, 6).map((cell, j) => (
                        <td key={j} className="p-2 text-muted-foreground">{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Voltar
            </Button>
            <Button onClick={generatePreview} className="flex-1">
              Gerar Pré-visualização
            </Button>
          </div>
        </>
      )}

      {step === 'preview' && (
        <>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-success" />
              <span className="font-medium">{file?.name}</span>
              <span className="text-sm text-muted-foreground">({preview.length} transações)</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleReset}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="max-h-60 overflow-y-auto rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-2 text-left">Data</th>
                  <th className="p-2 text-left">Descrição</th>
                  <th className="p-2 text-right">Valor</th>
                  <th className="p-2 text-left">Tipo</th>
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 10).map((t, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2">{t.date}</td>
                    <td className="p-2 truncate max-w-[200px]">{t.description}</td>
                    <td className={`p-2 text-right ${t.type === 'INCOME' ? 'text-success' : 'text-destructive'}`}>
                      {t.type === 'INCOME' ? '+' : '-'}{t.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td className="p-2">
                      <span className={`rounded-full px-2 py-1 text-xs ${t.type === 'INCOME' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                        {t.type === 'INCOME' ? 'Receita' : 'Despesa'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {preview.length > 10 && (
              <p className="p-2 text-center text-sm text-muted-foreground">
                ... e mais {preview.length - 10} transações
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" onClick={handleReset} className="flex-1">
              Cancelar
            </Button>
            <Button onClick={handleImport} className="flex-1" disabled={importing}>
              {importing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Check className="mr-2 h-4 w-4" />
              )}
              Importar {preview.length} transações
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
