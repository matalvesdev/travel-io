'use client';
import * as React from 'react';
import { Award, Loader2, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ProgramCard } from '@/components/miles/program-card';
import { TransferModal } from '@/components/miles/transfer-modal';
import { milesApi } from '@/lib/api';

const PROGRAM_COLORS: Record<string, string> = {
  smiles: '#0066CC',
  livelo: '#FF6B00',
  latam: '#E31837',
  azul: '#0057B8',
};

function mapAccountToProgram(account: { id: string; program: string; programName: string; balance: number; expiringIn30Days: number; milesValue: number; monetaryValue: number }) {
  const key = account.program.toLowerCase();
  return {
    name: account.programName || account.program,
    balance: account.balance,
    expiring: account.expiringIn30Days || 0,
    color: PROGRAM_COLORS[key] || '#6366f1',
    conversionRate: account.balance > 0 ? account.monetaryValue / account.balance : 0.04,
    id: account.id,
  };
}

export default function MilesPage() {
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [programs, setPrograms] = React.useState<ReturnType<typeof mapAccountToProgram>[]>([]);
  const [showTransferModal, setShowTransferModal] = React.useState(false);
  const [selectedProgram, setSelectedProgram] = React.useState<string | undefined>();

  React.useEffect(() => {
    milesApi.getBalance()
      .then((res) => {
        if (res.success && res.data?.programs) {
          setPrograms(res.data.programs.map(mapAccountToProgram));
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : 'Erro ao carregar milhas'))
      .finally(() => setLoading(false));
  }, []);

  const totalMiles = programs.reduce((a, p) => a + p.balance, 0);
  const totalValue = programs.reduce((a, p) => a + (p.balance * p.conversionRate), 0);

  const conversionTable = [
    { from: 'Smiles', to: 'Livelo', rate: '1:1' },
    { from: 'Smiles', to: 'LATAM', rate: '1:1' },
    { from: 'Livelo', to: 'Smiles', rate: '1:1' },
    { from: 'Livelo', to: 'LATAM', rate: '1:1' },
    { from: 'Azul', to: 'Livelo', rate: '1:1.2' },
  ];

  if (loading) return <div className="flex h-64 items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (error) return (
    <div className="flex h-64 items-center justify-center">
      <div className="flex items-center gap-2 text-destructive">
        <AlertCircle className="h-5 w-5" />
        <span>{error}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Milhas</h1>
          <p className="text-muted-foreground">Gerencie seus programas de milhas</p>
        </div>
        <Button onClick={() => { setSelectedProgram(undefined); setShowTransferModal(true); }}>
          <ArrowRightLeft className="mr-2 h-4 w-4" />Transferir
        </Button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total de Milhas</p>
                <p className="text-3xl font-bold">{totalMiles.toLocaleString('pt-BR')}</p>
              </div>
              <Award className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Valor Estimado</p>
                <p className="text-3xl font-bold text-success">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Programas Ativos</p>
                <p className="text-3xl font-bold">{programs.filter(p => p.balance > 0).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Programs Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {programs.map((program) => (
          <ProgramCard
            key={program.name}
            program={program}
            onConvert={(p) => { setSelectedProgram(p.name); setShowTransferModal(true); }}
          />
        ))}
      </div>

      {/* Conversion Table */}
      <Card>
        <CardHeader>
          <CardTitle>Taxas de Conversão</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm text-muted-foreground">
                <th className="pb-3 font-medium">De</th>
                <th className="pb-3 font-medium">Para</th>
                <th className="pb-3 font-medium text-right">Taxa</th>
              </tr>
            </thead>
            <tbody>
              {conversionTable.map((row, i) => (
                <tr key={i} className="border-b">
                  <td className="py-3">{row.from}</td>
                  <td className="py-3">{row.to}</td>
                  <td className="py-3 text-right font-medium">{row.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Transfer Modal */}
      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        fromProgram={selectedProgram}
      />
    </div>
  );
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}
