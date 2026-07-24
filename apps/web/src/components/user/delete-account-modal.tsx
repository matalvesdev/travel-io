'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useDeleteAccount } from '@/hooks/api/use-user';
import { toast } from 'sonner';

interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
}

export function DeleteAccountModal({ open, onClose }: DeleteAccountModalProps) {
  const router = useRouter();
  const deleteAccount = useDeleteAccount();
  const [password, setPassword] = React.useState('');

  const handleConfirm = () => {
    if (!password) {
      toast.error('Digite sua senha para confirmar');
      return;
    }

    deleteAccount.mutate(
      { password },
      {
        onSuccess: () => {
          toast.success('Conta marcada para exclusão. Você tem 30 dias para recuperar.');
          onClose();
          router.push('/auth/login');
        },
        onError: (error) => {
          toast.error(error.message || 'Erro ao excluir conta');
        },
      }
    );
  };

  const handleClose = () => {
    setPassword('');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle className="text-center">Excluir Conta</DialogTitle>
          <DialogDescription className="text-center">
            Esta ação é irreversível. Sua conta será marcada para exclusão e removida permanentemente após 30 dias.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-lg bg-muted p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">O que acontecerá:</p>
            <ul className="mt-2 space-y-1">
              <li>• Sua conta será desativada imediatamente</li>
              <li>• Você não conseguirá fazer login</li>
              <li>• Todos os dados serão removidos após 30 dias</li>
              <li>• Você pode recuperar a conta dentro de 30 dias</li>
            </ul>
          </div>

          <div>
            <label className="text-sm font-medium">Digite sua senha para confirmar</label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Sua senha"
              className="mt-1"
            />
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={deleteAccount.isPending || !password}
          >
            {deleteAccount.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Excluindo...
              </>
            ) : (
              'Excluir Conta'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
