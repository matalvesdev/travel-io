'use client';

import * as React from 'react';
import { Trash2, Download, Mail, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useChangeEmail } from '@/hooks/api/use-user';
import { DeleteAccountModal } from './delete-account-modal';
import { ExportDataModal } from './export-data-modal';
import { toast } from 'sonner';

export function AccountSettings() {
  const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
  const [exportModalOpen, setExportModalOpen] = React.useState(false);
  const [newEmail, setNewEmail] = React.useState('');
  const changeEmail = useChangeEmail();

  const handleChangeEmail = () => {
    if (!newEmail) {
      toast.error('Digite o novo email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      toast.error('Email inválido');
      return;
    }

    changeEmail.mutate(
      { newEmail, currentPassword: '' },
      {
        onSuccess: () => {
          toast.success('Email de confirmação enviado');
          setNewEmail('');
        },
        onError: (error) => {
          toast.error(error.message || 'Erro ao mudar email');
        },
      }
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Configurações da Conta</h3>
        <p className="text-sm text-muted-foreground">
          Gerencie as configurações da sua conta
        </p>
      </div>

      {/* Change Email */}
      <div className="rounded-lg border p-4">
        <div className="flex items-center gap-3 mb-4">
          <Mail className="h-5 w-5 text-muted-foreground" />
          <div>
            <h4 className="font-medium">Mudar Email</h4>
            <p className="text-sm text-muted-foreground">
              Atualize o email da sua conta
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            placeholder="novo@email.com"
            className="flex-1"
          />
          <Button
            variant="outline"
            onClick={handleChangeEmail}
            disabled={changeEmail.isPending || !newEmail}
          >
            {changeEmail.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              'Atualizar'
            )}
          </Button>
        </div>
      </div>

      {/* Export Data */}
      <div className="rounded-lg border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Download className="h-5 w-5 text-muted-foreground" />
            <div>
              <h4 className="font-medium">Exportar Dados</h4>
              <p className="text-sm text-muted-foreground">
                Baixe uma cópia de todos os seus dados
              </p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setExportModalOpen(true)}>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Delete Account */}
      <div className="rounded-lg border border-destructive/50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Trash2 className="h-5 w-5 text-destructive" />
            <div>
              <h4 className="font-medium text-destructive">Excluir Conta</h4>
              <p className="text-sm text-muted-foreground">
                Exclua sua conta permanentemente (ação irreversível)
              </p>
            </div>
          </div>
          <Button
            variant="destructive"
            onClick={() => setDeleteModalOpen(true)}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Excluir
          </Button>
        </div>
      </div>

      {/* Modals */}
      <DeleteAccountModal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
      />
      <ExportDataModal
        open={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
      />
    </div>
  );
}
