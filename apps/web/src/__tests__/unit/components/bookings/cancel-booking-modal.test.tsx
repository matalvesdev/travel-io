import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CancelBookingModal } from '@/components/bookings/cancel-booking-modal';
import type { Booking } from '@/types/booking';

const mockBooking: Booking = {
  id: '1',
  tripId: 'trip-1',
  userId: 'user-1',
  type: 'flight',
  status: 'confirmed',
  confirmationCode: 'ABC123',
  airline: 'LATAM',
  flightNumber: 'LA1234',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

describe('CancelBookingModal', () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render when open', () => {
    render(
      <CancelBookingModal
        booking={mockBooking}
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Cancelar Reserva')).toBeInTheDocument();
  });

  it('should not render when closed', () => {
    render(
      <CancelBookingModal
        booking={mockBooking}
        open={false}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('should show booking details', () => {
    render(
      <CancelBookingModal
        booking={mockBooking}
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    expect(screen.getByText(/LATAM/)).toBeInTheDocument();
    expect(screen.getByText(/LA1234/)).toBeInTheDocument();
    expect(screen.getByText(/Confirmação/)).toBeInTheDocument();
  });

  it('should call onClose when cancel is clicked', () => {
    render(
      <CancelBookingModal
        booking={mockBooking}
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByText('Voltar'));

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('should call onConfirm when confirm is clicked', () => {
    render(
      <CancelBookingModal
        booking={mockBooking}
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
      />
    );

    fireEvent.click(screen.getByText('Confirmar Cancelamento'));

    expect(mockOnConfirm).toHaveBeenCalled();
  });

  it('should show loading state', () => {
    render(
      <CancelBookingModal
        booking={mockBooking}
        open={true}
        onClose={mockOnClose}
        onConfirm={mockOnConfirm}
        isLoading={true}
      />
    );

    const confirmButton = screen.getByText('Confirmar Cancelamento').closest('button');
    expect(confirmButton).toBeDisabled();
  });
});
