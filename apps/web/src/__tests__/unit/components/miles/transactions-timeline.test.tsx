import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TransactionsTimeline } from '@/components/miles/transactions-timeline';
import { mockTransactions } from '@/__tests__/unit/miles/__fixtures__/miles';

describe('TransactionsTimeline', () => {
  it('should render empty state when no transactions', () => {
    render(<TransactionsTimeline transactions={[]} />);
    expect(screen.getByText('Nenhuma transação registrada')).toBeInTheDocument();
  });

  it('should render transaction items', () => {
    render(<TransactionsTimeline transactions={mockTransactions} />);
    expect(screen.getByText('Compra no Mc Donalds')).toBeInTheDocument();
    expect(screen.getByText('Passagem GRU-SSA')).toBeInTheDocument();
    expect(screen.getByText('Transferência da Livelo')).toBeInTheDocument();
  });

  it('should display transaction count', () => {
    render(<TransactionsTimeline transactions={mockTransactions} />);
    expect(screen.getByText('3 movimentações')).toBeInTheDocument();
  });

  it('should format positive amounts with + sign', () => {
    render(<TransactionsTimeline transactions={mockTransactions} />);
    expect(screen.getByText('+500')).toBeInTheDocument();
    expect(screen.getByText('+10.000')).toBeInTheDocument();
  });

  it('should format negative amounts with no sign prefix', () => {
    render(<TransactionsTimeline transactions={mockTransactions} />);
    expect(screen.getByText('-20.000')).toBeInTheDocument();
  });

  it('should display type labels correctly', () => {
    render(<TransactionsTimeline transactions={[mockTransactions[0]]} />);
    expect(screen.getByText('Ganho')).toBeInTheDocument();
  });
});
