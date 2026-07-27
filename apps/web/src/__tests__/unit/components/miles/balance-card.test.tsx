import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { BalanceCard } from '@/components/miles/balance-card';
import { mockMilesBalanceResponse } from '@/__tests__/unit/miles/__fixtures__/miles';

const mockBalanceWithExpiring = {
  ...mockMilesBalanceResponse,
  totalExpiring: 5000,
};

describe('BalanceCard', () => {
  it('should render program names', () => {
    render(<BalanceCard data={mockBalanceWithExpiring} />);
    expect(screen.getByText('Smiles')).toBeInTheDocument();
    expect(screen.getByText('Livelo')).toBeInTheDocument();
  });

  it('should render balances', () => {
    render(<BalanceCard data={mockBalanceWithExpiring} />);
    expect(screen.getByText('150.000')).toBeInTheDocument();
    expect(screen.getByText('80.000')).toBeInTheDocument();
  });

  it('should render tier information', () => {
    render(<BalanceCard data={mockBalanceWithExpiring} />);
    expect(screen.getByText('Diamante')).toBeInTheDocument();
    expect(screen.getByText('Ouro')).toBeInTheDocument();
  });

  it('should render monetary value', () => {
    render(<BalanceCard data={mockBalanceWithExpiring} />);
    expect(screen.getByText('~R$ 4.500,00')).toBeInTheDocument();
    expect(screen.getByText('~R$ 2.000,00')).toBeInTheDocument();
  });

  it('should show expiring alert when totalExpiring > 0', () => {
    render(<BalanceCard data={mockBalanceWithExpiring} />);
    expect(screen.getByText('Milhas expirando')).toBeInTheDocument();
    expect(screen.getByText(/5.000 milhas expiram nos próximos 30 dias/)).toBeInTheDocument();
  });

  it('should not show expiring alert when totalExpiring is 0', () => {
    const noExpiring = { ...mockMilesBalanceResponse, totalExpiring: 0 };
    render(<BalanceCard data={noExpiring} />);
    expect(screen.queryByText('Milhas expirando')).not.toBeInTheDocument();
  });
});
