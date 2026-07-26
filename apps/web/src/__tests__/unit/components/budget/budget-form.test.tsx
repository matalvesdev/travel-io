import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BudgetForm } from '@/components/budget/budget-form';

describe('BudgetForm', () => {
  const defaultProps = {
    month: 1,
    year: 2025,
    onSubmit: vi.fn(),
    onCancel: vi.fn(),
  };

  it('should render category select and limit input', () => {
    render(<BudgetForm {...defaultProps} />);

    expect(screen.getByText('Categoria')).toBeTruthy();
    expect(screen.getByText('Limite (R$)')).toBeTruthy();
    expect(screen.getByRole('button', { name: /criar/i })).toBeTruthy();
    expect(screen.getByRole('button', { name: /cancelar/i })).toBeTruthy();
  });

  it('should validate category is required', () => {
    render(<BudgetForm {...defaultProps} />);

    fireEvent.click(screen.getByRole('button', { name: /criar/i }));

    expect(screen.getByText(/selecione uma categoria/i)).toBeTruthy();
    expect(defaultProps.onSubmit).not.toHaveBeenCalled();
  });

  it('should validate limit is required', () => {
    const budget = {
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
    };

    const { container } = render(<BudgetForm {...defaultProps} budget={budget} />);

    const input = screen.getByDisplayValue('1500');
    fireEvent.change(input, { target: { value: '-1' } });

    const form = container.querySelector('form')!;
    fireEvent.submit(form);

    expect(screen.getByText(/limite deve ser maior que zero/i)).toBeTruthy();
  });

  it('should pre-fill data in edit mode', () => {
    const budget = {
      id: '1',
      userId: 'u1',
      category: 'Transporte',
      limit: 500,
      month: 1,
      year: 2025,
      spent: 200,
      remaining: 300,
      percentage: 40,
      status: 'safe' as const,
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };

    render(<BudgetForm {...defaultProps} budget={budget} />);

    expect(screen.getByDisplayValue('Transporte')).toBeTruthy();
    expect(screen.getByDisplayValue('500')).toBeTruthy();
    expect(screen.getByRole('button', { name: /atualizar/i })).toBeTruthy();
  });

  it('should show loading state', () => {
    render(<BudgetForm {...defaultProps} isLoading={true} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons[1]).toBeDisabled();
  });
});
