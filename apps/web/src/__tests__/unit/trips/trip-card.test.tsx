import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { TripCard } from '@/components/travel/trip-card';
import { mockTrip, mockOngoingTrip, mockCompletedTrip } from './__fixtures__/trips';

vi.mock('@/lib/api', () => ({}));

describe('TripCard', () => {
  const onClick = vi.fn();

  it('should render trip name', () => {
    render(<TripCard trip={mockTrip as any} onClick={onClick} />);
    expect(screen.getByText('GRU → CDG')).toBeInTheDocument();
  });

  it('should render destination', () => {
    render(<TripCard trip={mockTrip as any} onClick={onClick} />);
    expect(screen.getByText('CDG')).toBeInTheDocument();
  });

  it('should render status badge for planned trips', () => {
    render(<TripCard trip={mockTrip as any} onClick={onClick} />);
    expect(screen.getByText('Planejada')).toBeInTheDocument();
  });

  it('should render status badge for ongoing trips', () => {
    render(<TripCard trip={mockOngoingTrip as any} onClick={onClick} />);
    expect(screen.getByText('Em andamento')).toBeInTheDocument();
  });

  it('should render status badge for completed trips', () => {
    render(<TripCard trip={mockCompletedTrip as any} onClick={onClick} />);
    expect(screen.getByText('Concluída')).toBeInTheDocument();
  });

  it('should render total cost', () => {
    render(<TripCard trip={mockTrip as any} onClick={onClick} />);
    expect(screen.getByText('R$ 8.500,00')).toBeInTheDocument();
  });

  it('should render dates', () => {
    render(<TripCard trip={mockTrip as any} onClick={onClick} />);
    expect(screen.getByText(/dez/)).toBeInTheDocument();
  });
});
