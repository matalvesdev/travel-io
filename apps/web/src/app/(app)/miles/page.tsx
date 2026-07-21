'use client';

import * as React from 'react';
import { Award, ArrowRightLeft, AlertCircle, Loader2, Wallet, Clock, TrendingUp, Gift } from 'lucide-react';
import { MetricCard } from '@/components/analytics/metric-card';
import { BalanceCard } from '@/components/miles/balance-card';
import { SavingsCalculator } from '@/components/miles/savings-calculator';
import { PromotionsList } from '@/components/miles/promotions-list';
import { TransferModal } from '@/components/miles/transfer-modal';
import { Button } from '@/components/ui/button';
import { useMilesBalance, usePromotions } from '@/hooks/api/use-miles';
import { formatCurrency } from '@/lib/utils';

export default function MilesPage() {
  const [showTransferModal, setShowTransferModal] = React.useState(false);
  const [selectedProgram, setSelectedProgram] = React.useState<string | undefined>();

  const { data: balanceData, isLoading, error } = useMilesBalance();
  const { data: promotions = [] } = usePromotions();

  const programs = balanceData?.programs || [];
  const totalMiles = balanceData?.totalMiles || programs.reduce((a, p) => a + p.balance, 0);
  const totalValue = programs.reduce((a, p) => a + p.monetaryValue, 0);
  const activePrograms = programs.filter((p) => p.balance > 0).length;
  const totalExpiring = balanceData?.totalExpiring || programs.reduce((a, p) => a + p.expiringIn30Days, 0);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          <span>Erro ao carregar milhas</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Milhas & Pontos</h1>
          <p className="text-muted-foreground">Gerencie seus programas de fidelidade</p>
        </div>
        <Button
          onClick={() => {
            setSelectedProgram(undefined);
            setShowTransferModal(true);
          }}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white"
        >
          <ArrowRightLeft className="mr-2 h-4 w-4" />
          Transferir
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid gap-4 md:grid-cols-4">
        <MetricCard
          title="Total de Milhas"
          value={totalMiles.toLocaleString('pt-BR')}
          icon={Award}
          iconColor="text-blue-500"
        />
        <MetricCard
          title="Valor Estimado"
          value={formatCurrency(totalValue)}
          icon={Wallet}
          iconColor="text-green-500"
        />
        <MetricCard
          title="Programas Ativos"
          value={String(activePrograms)}
          icon={TrendingUp}
          iconColor="text-purple-500"
        />
        <MetricCard
          title="Expiring em 30 dias"
          value={totalExpiring.toLocaleString('pt-BR')}
          icon={Clock}
          iconColor={totalExpiring > 0 ? 'text-amber-500' : 'text-muted-foreground'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          <BalanceCard data={balanceData || { programs: [], transactions: [], totalMiles: 0, totalExpiring: 0 }} />

          <PromotionsList promotions={promotions} />
        </div>

        {/* Right Column */}
        <div>
          <SavingsCalculator totalMiles={totalMiles} />
        </div>
      </div>

      {/* Transfer Modal */}
      <TransferModal
        isOpen={showTransferModal}
        onClose={() => setShowTransferModal(false)}
        fromProgram={selectedProgram}
      />
    </div>
  );
}
