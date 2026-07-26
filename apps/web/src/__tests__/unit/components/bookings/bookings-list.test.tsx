import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookingsList } from '@/components/bookings/bookings-list';
import type { Booking } from '@/types/booking';

const mockFlightBooking: Booking = {
  id: '1',
  tripId: 'trip-1',
  userId: 'user-1',
  type: 'flight',
  status: 'confirmed',
  airline: 'LATAM',
  flightNumber: 'LA1234',
  origin: 'GRU',
  destination: 'CDG',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockHotelBooking: Booking = {
  id: '2',
  tripId: 'trip-1',
  userId: 'user-1',
  type: 'hotel',
  status: 'confirmed',
  hotelName: 'Hotel Maravilha',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('BookingsList', () => {
  const mockOnCreateNew = vi.fn();
  const mockOnEdit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show empty state when no bookings', () => {
    render(
      <BookingsList
        bookings={[]}
        tripId="trip-1"
        onCreateNew={mockOnCreateNew}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Nenhuma reserva registrada')).toBeInTheDocument();
    expect(screen.getByText('Registrar primeira reserva')).toBeInTheDocument();
  });

  it('should call onCreateNew when empty state button is clicked', () => {
    render(
      <BookingsList
        bookings={[]}
        tripId="trip-1"
        onCreateNew={mockOnCreateNew}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Registrar primeira reserva'));

    expect(mockOnCreateNew).toHaveBeenCalled();
  });

  it('should group bookings by type', () => {
    render(
      <BookingsList
        bookings={[mockFlightBooking, mockHotelBooking]}
        tripId="trip-1"
        onCreateNew={mockOnCreateNew}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/Voos \(1\)/)).toBeInTheDocument();
    expect(screen.getByText(/Hotéis \(1\)/)).toBeInTheDocument();
  });

  it('should show booking cards', () => {
    render(
      <BookingsList
        bookings={[mockFlightBooking, mockHotelBooking]}
        tripId="trip-1"
        onCreateNew={mockOnCreateNew}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/LATAM/)).toBeInTheDocument();
    expect(screen.getByText('Hotel Maravilha')).toBeInTheDocument();
  });

  it('should show loading state', () => {
    render(
      <BookingsList
        bookings={[]}
        tripId="trip-1"
        onCreateNew={mockOnCreateNew}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );

    expect(screen.queryByText('Nenhuma reserva registrada')).not.toBeInTheDocument();
  });

  it('should show add button when bookings exist', () => {
    render(
      <BookingsList
        bookings={[mockFlightBooking]}
        tripId="trip-1"
        onCreateNew={mockOnCreateNew}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Adicionar reserva')).toBeInTheDocument();
  });
});
