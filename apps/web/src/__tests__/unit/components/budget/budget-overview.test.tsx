import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BudgetOverview } from '@/components/budget/budget-overview';

const mockBudgets = [
  {
    id: '1',
    userId: 'u1',
    category: 'Alimentação',
    limit: 1500,
    month: 1,
    year: 2025,
    spent: 500,
    remaining: 1000,
    percentage: 33.33,
    status: 'safe' as const,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  },
];

const mockSummary = {
  totalBudget: 2000,
  totalSpent: 500,
  percentage: 25,
  status: 'safe' as const,
  categories: [
    { id: '1', category: 'Alimentação', limit: 1500, spent: 500, remaining: 1000, percentage: 33.33, status: 'safe' as const },
  ],
};

describe('BudgetOverview', () => {
  it('should show loading state', () => {
    const { container } = render(
      <BudgetOverview
        summary={undefined}
        budgets={[]}
        isLoading={true}
        onAddBudget={vi.fn()}
        onEditBudget={vi.fn()}
        onDeleteBudget={vi.fn()}
      />
    );

    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('should show empty state', () => {
    render(
      <BudgetOverview
        summary={undefined}
        budgets={[]}
        isLoading={false}
        onAddBudget={vi.fn()}
        onEditBudget={vi.fn()}
        onDeleteBudget={vi.fn()}
      />
    );

    expect(screen.getByText(/nenhum orçamento/i)).toBeTruthy();
    expect(screen.getByText(/criar primeiro orçamento/i)).toBeTruthy();
  });

  it('should render summary header with totals', () => {
    render(
      <BudgetOverview
        summary={mockSummary}
        budgets={mockBudgets}
        isLoading={false}
        onAddBudget={vi.fn()}
        onEditBudget={vi.fn()}
        onDeleteBudget={vi.fn()}
      />
    );

    expect(screen.getByText('Orçamento total')).toBeTruthy();
    expect(screen.getByText('Gasto total')).toBeTruthy();
    expect(screen.getByText(/25.0% utilizado/)).toBeTruthy();
  });

  it('should render budget cards', () => {
    render(
      <BudgetOverview
        summary={mockSummary}
        budgets={mockBudgets}
        isLoading={false}
        onAddBudget={vi.fn()}
        onEditBudget={vi.fn()}
        onDeleteBudget={vi.fn()}
      />
    );

    expect(screen.getByText('Alimentação')).toBeTruthy();
    expect(screen.getByText(/categorias/i)).toBeTruthy();
  });

  it('should call onAddBudget when add button is clicked', () => {
    const onAddBudget = vi.fn();
    render(
      <BudgetOverview
        summary={mockSummary}
        budgets={mockBudgets}
        isLoading={false}
        onAddBudget={onAddBudget}
        onEditBudget={vi.fn()}
        onDeleteBudget={vi.fn()}
      />
    );

    fireEvent.click(screen.getByText(/adicionar/i));

    expect(onAddBudget).toHaveBeenCalled();
  });
});
