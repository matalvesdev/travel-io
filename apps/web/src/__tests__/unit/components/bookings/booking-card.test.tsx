import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookingCard } from '@/components/bookings/booking-card';
import type { Booking } from '@/types/booking';

const mockFlightBooking: Booking = {
  id: '1',
  tripId: 'trip-1',
  userId: 'user-1',
  type: 'flight',
  status: 'confirmed',
  confirmationCode: 'ABC123',
  airline: 'LATAM',
  flightNumber: 'LA1234',
  origin: 'GRU',
  destination: 'CDG',
  departureDate: '2024-06-01T10:00:00Z',
  departureTime: '10:00',
  price: 5000,
  currency: 'BRL',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockHotelBooking: Booking = {
  id: '2',
  tripId: 'trip-1',
  userId: 'user-1',
  type: 'hotel',
  status: 'confirmed',
  confirmationCode: 'HOT456',
  hotelName: 'Hotel Maravilha',
  hotelAddress: 'Rua das Flores, 123',
  checkIn: '2024-06-01T14:00:00Z',
  checkOut: '2024-06-07T11:00:00Z',
  nights: 6,
  roomType: 'Standard',
  price: 3000,
  currency: 'BRL',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('BookingCard', () => {
  const mockOnEdit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render flight booking details', () => {
    render(
      <BookingCard
        booking={mockFlightBooking}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText(/LATAM/)).toBeInTheDocument();
    expect(screen.getByText(/LA1234/)).toBeInTheDocument();
    expect(screen.getByText(/GRU → CDG/)).toBeInTheDocument();
    expect(screen.getByText('ABC123')).toBeInTheDocument();
    expect(screen.getByText(/R\$5.000,00/)).toBeInTheDocument();
  });

  it('should render hotel booking details', () => {
    render(
      <BookingCard
        booking={mockHotelBooking}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Hotel Maravilha')).toBeInTheDocument();
    expect(screen.getByText('Rua das Flores, 123')).toBeInTheDocument();
    expect(screen.getByText('HOT456')).toBeInTheDocument();
    expect(screen.getByText('6 noites')).toBeInTheDocument();
    expect(screen.getByText('Standard')).toBeInTheDocument();
  });

  it('should show status badge', () => {
    render(
      <BookingCard
        booking={mockFlightBooking}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Confirmada')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(
      <BookingCard
        booking={mockFlightBooking}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Editar'));

    expect(mockOnEdit).toHaveBeenCalled();
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(
      <BookingCard
        booking={mockFlightBooking}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Cancelar'));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should hide cancel button for cancelled bookings', () => {
    render(
      <BookingCard
        booking={{ ...mockFlightBooking, status: 'cancelled' }}
        onEdit={mockOnEdit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.queryByText('Cancelar')).not.toBeInTheDocument();
    expect(screen.getByText('Cancelada')).toBeInTheDocument();
  });
});
