import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { GoalCard } from '@/components/goals/goal-card';
import { mockGoal, mockCompletedGoal } from './__fixtures__/goals';

describe('GoalCard', () => {
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  const onContribute = vi.fn();

  it('should render goal name', () => {
    render(<GoalCard goal={mockGoal} onEdit={onEdit} onDelete={onDelete} onContribute={onContribute} />);
    expect(screen.getByText('Comprar carro')).toBeInTheDocument();
  });

  it('should render priority label', () => {
    render(<GoalCard goal={mockGoal} onEdit={onEdit} onDelete={onDelete} onContribute={onContribute} />);
    expect(screen.getByText('Alta')).toBeInTheDocument();
  });

  it('should render progress percentage', () => {
    render(<GoalCard goal={mockGoal} onEdit={onEdit} onDelete={onDelete} onContribute={onContribute} />);
    expect(screen.getByText('30%')).toBeInTheDocument();
  });

  it('should render remaining amount', () => {
    render(<GoalCard goal={mockGoal} onEdit={onEdit} onDelete={onDelete} onContribute={onContribute} />);
    expect(screen.getByText('Restante')).toBeInTheDocument();
  });

  it('should render monthly contribution when available', () => {
    render(<GoalCard goal={mockGoal} onEdit={onEdit} onDelete={onDelete} onContribute={onContribute} />);
    expect(screen.getByText('Contribuição/mês')).toBeInTheDocument();
  });

  it('should show completed status for completed goal', () => {
    render(<GoalCard goal={mockCompletedGoal} onEdit={onEdit} onDelete={onDelete} onContribute={onContribute} />);
    expect(screen.getByText('Concluído')).toBeInTheDocument();
  });

  it('should render contribute button', () => {
    render(<GoalCard goal={mockGoal} onEdit={onEdit} onDelete={onDelete} onContribute={onContribute} />);
    expect(screen.getByText('Contribuir')).toBeInTheDocument();
  });
});
