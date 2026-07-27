import type { Trip } from '@/types/shared';

export const mockTrip: Trip = {
  id: 'trip-1',
  name: 'GRU → CDG',
  destination: 'CDG',
  startDate: '2026-12-15',
  endDate: '2026-12-30',
  status: 'planned',
  totalCost: 8500,
  notes: '',
};

export const mockOngoingTrip: Trip = {
  id: 'trip-2',
  name: 'GRU → MIA',
  destination: 'MIA',
  startDate: '2026-08-01',
  endDate: '2026-08-10',
  status: 'ongoing',
  totalCost: 4200,
  notes: 'Hotel já reservado',
};

export const mockCompletedTrip: Trip = {
  id: 'trip-3',
  name: 'GRU → BSB',
  destination: 'BSB',
  startDate: '2026-03-10',
  endDate: '2026-03-15',
  status: 'completed',
  totalCost: 1800,
  notes: '',
};

export const mockTrips = [mockTrip, mockOngoingTrip, mockCompletedTrip];

export const mockTripFlight = {
  id: 'flight-1',
  tripId: 'trip-1',
  airline: 'LATAM',
  flightNumber: 'LA8080',
  origin: 'GRU',
  destination: 'CDG',
  departure: '2026-12-15T23:00:00Z',
  arrival: '2026-12-16T14:00:00Z',
  price: 5200,
  currency: 'BRL',
  duration: '11h',
  stops: 0,
};

export const mockTripHotel = {
  id: 'hotel-1',
  tripId: 'trip-1',
  name: 'Hotel Paris',
  address: 'Rue de Rivoli, Paris',
  price: 3300,
  currency: 'BRL',
  rating: 4.5,
  checkIn: '2026-12-16',
  checkOut: '2026-12-30',
  guests: 1,
};
