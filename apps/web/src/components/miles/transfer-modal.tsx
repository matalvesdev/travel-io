'use client';

import * as React from 'react';
import { ArrowRight, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  fromProgram?: string;
}

const programLabels: Record<string, string> = {
  SMILES: 'Smiles', LIVELO: 'Livelo', LATAM_PASS: 'LATAM Pass', AZUL_FIDELIDADE: 'Azul Fidelidade',
};

export function TransferModal({ isOpen, onClose, fromProgram }: TransferModalProps) {
  const [from, setFrom] = React.useState(fromProgram || 'SMILES');
  const [to, setTo] = React.useState('LIVELO');
  const [amount, setAmount] = React.useState('');
  const [processing, setProcessing] = React.useState(false);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Transferir Milhas</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}><X className="h-4 w-4" /></Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium">De</label>
              <select value={from} onChange={e => setFrom(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                {Object.entries(programLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Para</label>
              <select value={to} onChange={e => setTo(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm">
                {Object.entries(programLabels).filter(([k]) => k !== from).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Quantidade de milhas</label>
            <Input type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="10000" className="mt-1" />
          </div>
          <Button disabled={!amount || processing} className="w-full bg-gradient-to-r from-blue-600 to-purple-600" onClick={() => {
            setProcessing(true);
            setTimeout(() => { setProcessing(false); onClose(); }, 1500);
          }}>
            {processing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Transferindo...</> : <><ArrowRight className="mr-2 h-4 w-4" /> Transferir</>}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
