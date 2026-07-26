import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BudgetCard } from '@/components/budget/budget-card';

const baseBudget = {
  id: '1',
  userId: 'u1',
  category: 'Alimentação',
  limit: 1500,
  month: 1,
  year: 2025,
  spent: 500,
  remaining: 1000,
  percentage: 33.33,
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('BudgetCard', () => {
  it('should render category name and spending info', () => {
    render(<BudgetCard budget={{ ...baseBudget, status: 'safe' }} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText('Alimentação')).toBeTruthy();
    expect(screen.getByText('33.3%')).toBeTruthy();
    expect(screen.getByText(/R\$\s*500,00 gastos/)).toBeTruthy();
    expect(screen.getByText(/R\$\s*1.000,00 restantes/)).toBeTruthy();
  });

  it('should show green color for safe status', () => {
    render(<BudgetCard budget={{ ...baseBudget, status: 'safe', percentage: 50 }} onEdit={vi.fn()} onDelete={vi.fn()} />);

    const percentage = screen.getByText('50.0%');
    expect(percentage.className).toContain('text-green-600');
  });

  it('should show yellow for warning status', () => {
    render(<BudgetCard budget={{ ...baseBudget, status: 'warning', percentage: 85 }} onEdit={vi.fn()} onDelete={vi.fn()} />);

    const percentage = screen.getByText('85.0%');
    expect(percentage.className).toContain('text-yellow-600');
  });

  it('should show red for danger status', () => {
    render(<BudgetCard budget={{ ...baseBudget, status: 'danger', percentage: 120 }} onEdit={vi.fn()} onDelete={vi.fn()} />);

    const percentage = screen.getByText('120.0%');
    expect(percentage.className).toContain('text-red-600');
  });

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<BudgetCard budget={{ ...baseBudget, status: 'safe' }} onEdit={onEdit} onDelete={vi.fn()} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);

    expect(onEdit).toHaveBeenCalled();
  });

  it('should call onDelete when delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<BudgetCard budget={{ ...baseBudget, status: 'safe' }} onEdit={vi.fn()} onDelete={onDelete} />);

    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[1]);

    expect(onDelete).toHaveBeenCalled();
  });
});
