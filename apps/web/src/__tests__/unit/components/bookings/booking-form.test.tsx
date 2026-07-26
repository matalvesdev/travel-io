import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BookingForm } from '@/components/bookings/booking-form';

describe('BookingForm', () => {
  const mockOnSubmit = vi.fn();
  const mockOnCancel = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render flight form by default', () => {
    render(
      <BookingForm
        tripId="trip-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByText('Voo')).toBeInTheDocument();
    expect(screen.getByText('Hotel')).toBeInTheDocument();
    expect(screen.getByText('Companhia Aérea')).toBeInTheDocument();
    expect(screen.getByText('Número do Voo')).toBeInTheDocument();
  });

  it('should switch to hotel form when Hotel button is clicked', () => {
    render(
      <BookingForm
        tripId="trip-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Hotel'));

    expect(screen.getByText('Nome do Hotel')).toBeInTheDocument();
    expect(screen.getByText('Check-in')).toBeInTheDocument();
    expect(screen.getByText('Check-out')).toBeInTheDocument();
  });

  it('should call onCancel when cancel button is clicked', () => {
    render(
      <BookingForm
        tripId="trip-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Cancelar'));

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('should call onSubmit with flight data', () => {
    render(
      <BookingForm
        tripId="trip-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.change(screen.getByPlaceholderText('LATAM'), { target: { value: 'LATAM' } });
    fireEvent.change(screen.getByPlaceholderText('LA1234'), { target: { value: 'LA1234' } });
    fireEvent.change(screen.getByPlaceholderText('GRU'), { target: { value: 'GRU' } });
    fireEvent.change(screen.getByPlaceholderText('CDG'), { target: { value: 'CDG' } });

    fireEvent.click(screen.getByText('Registrar'));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'flight',
        airline: 'LATAM',
        flightNumber: 'LA1234',
        origin: 'GRU',
        destination: 'CDG',
      })
    );
  });

  it('should call onSubmit with hotel data', () => {
    render(
      <BookingForm
        tripId="trip-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    fireEvent.click(screen.getByText('Hotel'));
    fireEvent.change(screen.getByPlaceholderText('Hotel Maravilha'), { target: { value: 'Hotel Test' } });

    fireEvent.click(screen.getByText('Registrar'));

    expect(mockOnSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'hotel',
        hotelName: 'Hotel Test',
      })
    );
  });

  it('should show loading state', () => {
    render(
      <BookingForm
        tripId="trip-1"
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
        isLoading={true}
      />
    );

    const submitButton = screen.getByText('Registrar').closest('button');
    expect(submitButton).toBeDisabled();
  });
});
