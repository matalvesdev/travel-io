'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Booking, CreateBookingInput, UpdateBookingInput, BookingSummary } from '@/types/booking';

// Fetch all bookings for a trip
export async function fetchBookings(tripId: string): Promise<{ bookings: Booking[] }> {
  const response = await fetch(`/api/trips/${tripId}/bookings`);
  if (!response.ok) throw new Error('Erro ao buscar reservas');
  return response.json();
}

// Create a new booking
export async function createBooking(tripId: string, data: CreateBookingInput): Promise<{ booking: Booking }> {
  const response = await fetch(`/api/trips/${tripId}/bookings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao criar reserva');
  }
  return response.json();
}

// Update a booking
export async function updateBooking(tripId: string, data: UpdateBookingInput & { id: string }): Promise<{ booking: Booking }> {
  const response = await fetch(`/api/trips/${tripId}/bookings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao atualizar reserva');
  }
  return response.json();
}

// Cancel a booking
export async function cancelBooking(tripId: string, bookingId: string): Promise<void> {
  const response = await fetch(`/api/trips/${tripId}/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'cancelled' }),
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao cancelar reserva');
  }
}

// Delete a booking
export async function deleteBooking(tripId: string, bookingId: string): Promise<void> {
  const response = await fetch(`/api/trips/${tripId}/bookings?bookingId=${bookingId}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Erro ao excluir reserva');
  }
}

// Fetch booking summary
export async function fetchBookingSummary(tripId: string): Promise<{ summary: BookingSummary }> {
  const response = await fetch(`/api/trips/${tripId}/bookings/summary`);
  if (!response.ok) throw new Error('Erro ao buscar resumo');
  return response.json();
}

// Hooks
export function useBookings(tripId: string) {
  return useQuery({
    queryKey: ['bookings', tripId],
    queryFn: () => fetchBookings(tripId),
    select: (data) => data.bookings,
  });
}

export function useCreateBooking(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateBookingInput) => createBooking(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', tripId] });
      queryClient.invalidateQueries({ queryKey: ['bookingSummary', tripId] });
    },
  });
}

export function useUpdateBooking(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateBookingInput & { id: string }) => updateBooking(tripId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', tripId] });
      queryClient.invalidateQueries({ queryKey: ['bookingSummary', tripId] });
    },
  });
}

export function useCancelBooking(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => cancelBooking(tripId, bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', tripId] });
      queryClient.invalidateQueries({ queryKey: ['bookingSummary', tripId] });
    },
  });
}

export function useDeleteBooking(tripId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (bookingId: string) => deleteBooking(tripId, bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings', tripId] });
      queryClient.invalidateQueries({ queryKey: ['bookingSummary', tripId] });
    },
  });
}

export function useBookingSummary(tripId: string) {
  return useQuery({
    queryKey: ['bookingSummary', tripId],
    queryFn: () => fetchBookingSummary(tripId),
    select: (data) => data.summary,
  });
}
