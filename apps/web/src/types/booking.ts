export type BookingType = 'flight' | 'hotel';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled' | 'completed';

export interface Booking {
  id: string;
  tripId: string;
  userId: string;
  type: BookingType;
  status: BookingStatus;

  // Common fields
  confirmationCode?: string;
  notes?: string;

  // Flight-specific
  airline?: string;
  flightNumber?: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  arrivalDate?: string;
  departureTime?: string;
  arrivalTime?: string;

  // Hotel-specific
  hotelName?: string;
  hotelAddress?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  roomType?: string;

  // Pricing
  price?: number;
  currency?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateBookingInput {
  type: BookingType;
  confirmationCode?: string;
  notes?: string;

  // Flight fields
  airline?: string;
  flightNumber?: string;
  origin?: string;
  destination?: string;
  departureDate?: string;
  arrivalDate?: string;
  departureTime?: string;
  arrivalTime?: string;

  // Hotel fields
  hotelName?: string;
  hotelAddress?: string;
  checkIn?: string;
  checkOut?: string;
  nights?: number;
  roomType?: string;

  // Pricing
  price?: number;
  currency?: string;
}

export interface UpdateBookingInput extends Partial<CreateBookingInput> {
  status?: BookingStatus;
}

export interface BookingSummary {
  totalSpent: number;
  flightCount: number;
  hotelCount: number;
  confirmedCount: number;
  cancelledCount: number;
}
