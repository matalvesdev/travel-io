'use client';

import * as React from 'react';
import { ArrowRight, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTransferMiles, useMilesBalance } from '@/hooks/api/use-miles';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromProgram?: string;
}

const PROGRAM_OPTIONS = [
  { value: 'SMILES', label: 'Smiles' },
  { value: 'LIVELO', label: 'Livelo' },
  { value: 'LATAM_PASS', label: 'LATAM Pass' },
  { value: 'AZUL_FIDELIDADE', label: 'Azul Fidelidade' },
];

const CONVERSION_RATES: Record<string, Record<string, number>> = {
  SMILES: { LIVELO: 1, LATAM_PASS: 1, AZUL_FIDELIDADE: 0.9 },
  LIVELO: { SMILES: 1, LATAM_PASS: 1, AZUL_FIDELIDADE: 1.2 },
  LATAM_PASS: { SMILES: 1, LIVELO: 1, AZUL_FIDELIDADE: 0.95 },
  AZUL_FIDELIDADE: { SMILES: 1.1, LIVELO: 0.85, LATAM_PASS: 1 },
};

export function TransferModal({ isOpen, onClose, fromProgram }: TransferModalProps) {
  const [from, setFrom] = React.useState(fromProgram || 'SMILES');
  const [to, setTo] = React.useState('LIVELO');
  const [amount, setAmount] = React.useState('');

  const { data: balanceData } = useMilesBalance();
  const transferMutation = useTransferMiles();

  React.useEffect(() => {
    if (fromProgram) {
      setFrom(fromProgram);
      const available = PROGRAM_OPTIONS.filter((o) => o.value !== fromProgram);
      if (available.length > 0 && available.every((o) => o.value === to)) {
        setTo(available[0].value);
      }
    }
  }, [fromProgram]);

  const numericAmount = parseInt(amount, 10) || 0;
  const rate = CONVERSION_RATES[from]?.[to] || 1;
  const result = Math.floor(numericAmount * rate);
  const sourceBalance = balanceData?.programs.find((p) => p.program === from)?.balance || 0;
  const hasEnough = numericAmount > 0 && numericAmount <= sourceBalance;

  const handleTransfer = () => {
    if (!hasEnough || !numericAmount) return;
    transferMutation.mutate(
      { fromProgram: from, toProgram: to, miles: numericAmount },
      {
        onSuccess: () => {
          setAmount('');
          onClose();
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transferir Milhas</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">De</label>
              <select
                value={from}
                onChange={(e) => {
                  setFrom(e.target.value);
                  if (e.target.value === to) {
                    const available = PROGRAM_OPTIONS.filter((o) => o.value !== e.target.value);
                    if (available.length > 0) setTo(available[0].value);
                  }
                }}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {PROGRAM_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-muted-foreground">
                Saldo: {sourceBalance.toLocaleString('pt-BR')} milhas
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Para</label>
              <select
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                {PROGRAM_OPTIONS.filter((o) => o.value !== from).map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Quantidade de milhas</label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10000"
              className="mt-1"
              min={1000}
              step={1000}
            />
          </div>

          {numericAmount > 0 && (
            <div className="rounded-xl bg-muted/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Taxa de conversão</span>
                <span className="font-medium">1:{rate}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Você receberá</span>
                <span className="font-bold text-primary">{result.toLocaleString('pt-BR')} milhas</span>
              </div>
            </div>
          )}

          {numericAmount > 0 && !hasEnough && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              Saldo insuficiente. Máximo: {sourceBalance.toLocaleString('pt-BR')} milhas.
            </div>
          )}

          {transferMutation.isSuccess && (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 p-3 text-sm text-success">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              Transferência realizada com sucesso!
            </div>
          )}

          <Button
            disabled={!hasEnough || !numericAmount || transferMutation.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
            onClick={handleTransfer}
          >
            {transferMutation.isPending ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Transferindo...</>
            ) : (
              <><ArrowRight className="mr-2 h-4 w-4" /> Transferir</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
