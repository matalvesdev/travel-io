'use client';

import * as React from 'react';
import { Upload, FileText, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { parseCSV, parseOFX, parseXLSX, type ParsedTransaction } from '@/lib/api/parse-csv';

interface FileUploadProps {
  onImport: (transactions: ParsedTransaction[]) => void;
}

export function FileUpload({ onImport }: FileUploadProps) {
  const [isDragging, setIsDragging] = React.useState(false);
  const [file, setFile] = React.useState<File | null>(null);
  const [preview, setPreview] = React.useState<ParsedTransaction[]>([]);
  const [processing, setProcessing] = React.useState(false);

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
    if (droppedFile) {
      processFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      processFile(selectedFile);
    }
  };

  const processFile = async (file: File) => {
    setFile(file);
    setProcessing(true);
    
    try {
      let transactions: ParsedTransaction[];
      
      if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
        const buffer = await file.arrayBuffer();
        transactions = await parseXLSX(buffer);
      } else {
        const content = await file.text();
        if (file.name.endsWith('.ofx')) {
          transactions = parseOFX(content);
        } else {
          transactions = parseCSV(content);
        }
      }
      
      setPreview(transactions);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleImport = () => {
    onImport(preview);
    setFile(null);
    setPreview([]);
  };

  const handleClear = () => {
    setFile(null);
    setPreview([]);
  };

  if (preview.length > 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-success" />
            <span className="font-medium">{file?.name}</span>
            <span className="text-sm text-muted-foreground">({preview.length} transações)</span>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClear}>
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
                  <td className="p-2">{t.description}</td>
                  <td className={`p-2 text-right ${t.type === 'INCOME' ? 'text-success' : 'text-destructive'}`}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatCurrency(t.amount)}
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
          <Button onClick={handleImport} className="flex-1">
            <Check className="mr-2 h-4 w-4" />
            Importar {preview.length} transações
          </Button>
          <Button variant="outline" onClick={handleClear}>
            Cancelar
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
        isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
      }`}
    >
      <Upload className="mb-4 h-10 w-10 text-muted-foreground" />
      <p className="mb-2 text-sm font-medium">
        Arraste um arquivo aqui ou clique para selecionar
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
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}
