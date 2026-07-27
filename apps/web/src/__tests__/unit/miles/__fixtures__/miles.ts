import type { MilesAccount, MilesTransfer, MilesPromotion } from '@/types/shared';
import type { TransferRoute } from '@/lib/api/miles';

export const mockSmilesAccount: MilesAccount = {
  id: '1',
  program: 'SMILES',
  programName: 'Smiles',
  holderName: 'João Silva',
  balance: 150000,
  expiringIn30Days: 5000,
  expiringDate: '2026-08-15',
  tier: 'Diamante',
  milesValue: 0.03,
  monetaryValue: 4500,
};

export const mockLiveloAccount: MilesAccount = {
  id: '2',
  program: 'LIVELO',
  programName: 'Livelo',
  holderName: 'João Silva',
  balance: 80000,
  expiringIn30Days: 0,
  expiringDate: '2027-01-01',
  tier: 'Ouro',
  milesValue: 0.025,
  monetaryValue: 2000,
};

export const mockAccounts = [mockSmilesAccount, mockLiveloAccount];

export const mockTransactions = [
  { id: 't1', description: 'Compra no Mc Donalds', amount: 500, date: '2026-07-20', type: 'EARN' },
  { id: 't2', description: 'Passagem GRU-SSA', amount: -20000, date: '2026-07-15', type: 'BURN' },
  { id: 't3', description: 'Transferência da Livelo', amount: 10000, date: '2026-07-10', type: 'TRANSFER_IN' },
];

export const mockMilesBalanceResponse = {
  programs: mockAccounts,
  transactions: mockTransactions,
  totalMiles: 230000,
  totalExpiring: 5000,
};

export const mockTransferRoutes: TransferRoute[] = [
  {
    id: 'r1',
    fromProgram: 'SMILES',
    toProgram: 'LATAM_PASS',
    conversionRate: 1.2,
    minTransfer: 5000,
    maxTransfer: 100000,
    isActive: true,
  },
  {
    id: 'r2',
    fromProgram: 'LIVELO',
    toProgram: 'SMILES',
    conversionRate: 1.0,
    minTransfer: 3000,
    maxTransfer: null,
    isActive: true,
  },
];

export const mockMilesTransfer: MilesTransfer = {
  id: 'transfer-1',
  fromProgram: 'SMILES',
  toProgram: 'LATAM_PASS',
  miles: 20000,
  convertedMiles: 24000,
  conversionRate: 1.2,
  status: 'completed',
  createdAt: '2026-07-22T00:00:00.000Z',
};

export const mockPromotions: MilesPromotion[] = [
  {
    id: 'promo-1',
    program: 'SMILES',
    title: 'Bônus de 50% na transferência',
    description: 'Transfira pontos Livelo para Smiles e ganhe 50% de bônus',
    bonusPercentage: 50,
    validUntil: '2026-08-31',
    link: 'https://smiles.com.br/promocoes',
  },
  {
    id: 'promo-2',
    program: 'LIVELO',
    title: 'Parceiro Azul com 30% off',
    description: 'Resgate passagens Azul com 30% de desconto em milhas',
    bonusPercentage: 0,
    validUntil: '2026-09-15',
    link: 'https://livelo.com.br/promocoes',
  },
];
