'use client';

import * as React from 'react';
import { Download, Loader2, FileJson } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useExportData } from '@/hooks/api/use-user';
import { toast } from 'sonner';

interface ExportDataModalProps {
  open: boolean;
  onClose: () => void;
}

export function ExportDataModal({ open, onClose }: ExportDataModalProps) {
  const exportData = useExportData();

  const handleExport = () => {
    exportData.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(`Dados exportados: ${data.filename}`);
        onClose();
      },
      onError: (error) => {
        toast.error(error.message || 'Erro ao exportar dados');
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <FileJson className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-center">Exportar Dados</DialogTitle>
          <DialogDescription className="text-center">
            Baixe uma cópia de todos os seus dados em formato JSON.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Dados incluídos:</p>
            <ul className="mt-2 space-y-1">
              <li>• Perfil pessoal</li>
              <li>• Transações financeiras</li>
              <li>• Investimentos</li>
              <li>• Viagens e roteiros</li>
              <li>• Metas financeiras</li>
              <li>• Milhas e programas</li>
              <li>• Wishlist e monitores de preço</li>
              <li>• Notificações</li>
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">
            O arquivo será baixado automaticamente. Os dados sensíveis (senhas, tokens) serão mascarados.
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleExport} disabled={exportData.isPending}>
            {exportData.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exportando...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Baixar Dados
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
