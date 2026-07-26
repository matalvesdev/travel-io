'use client';

import * as React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, Loader2, DollarSign, Plane, Hotel } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookingsList } from '@/components/bookings/bookings-list';
import { BookingForm } from '@/components/bookings/booking-form';
import { CancelBookingModal } from '@/components/bookings/cancel-booking-modal';
import { useBookings, useCreateBooking, useUpdateBooking, useCancelBooking, useBookingSummary } from '@/hooks/api/use-bookings';
import type { Booking, CreateBookingInput } from '@/types/booking';
import { toast } from 'sonner';

export default function BookingsPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const { data: bookings = [], isLoading: bookingsLoading } = useBookings(tripId);
  const { data: summary } = useBookingSummary(tripId);
  const createBooking = useCreateBooking(tripId);
  const updateBooking = useUpdateBooking(tripId);
  const cancelBooking = useCancelBooking(tripId);

  const [showForm, setShowForm] = React.useState(false);
  const [editingBooking, setEditingBooking] = React.useState<Booking | null>(null);
  const [cancellingBooking, setCancellingBooking] = React.useState<Booking | null>(null);

  const handleSubmit = (data: CreateBookingInput) => {
    if (editingBooking) {
      updateBooking.mutate(
        { ...data, id: editingBooking.id },
        {
          onSuccess: () => {
            toast.success('Reserva atualizada com sucesso!');
            setShowForm(false);
            setEditingBooking(null);
          },
          onError: (error) => {
            toast.error(error.message || 'Erro ao atualizar reserva');
          },
        }
      );
    } else {
      createBooking.mutate(data, {
        onSuccess: () => {
          toast.success('Reserva criada com sucesso!');
          setShowForm(false);
        },
        onError: (error) => {
          toast.error(error.message || 'Erro ao criar reserva');
        },
      });
    }
  };

  const handleCancelBooking = () => {
    if (!cancellingBooking) return;

    cancelBooking.mutate(cancellingBooking.id, {
      onSuccess: () => {
        toast.success('Reserva cancelada com sucesso!');
        setCancellingBooking(null);
      },
      onError: (error) => {
        toast.error(error.message || 'Erro ao cancelar reserva');
      },
    });
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setShowForm(true);
  };

  const handleCancel = (booking: Booking) => {
    setCancellingBooking(booking);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingBooking(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push(`/trips/${tripId}`)}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Reservas</h1>
          <p className="text-muted-foreground">Gerencie as reservas desta viagem</p>
        </div>
        {!showForm && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Reserva
          </Button>
        )}
      </div>

      {/* Financial Summary */}
      {summary && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Gasto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {summary.totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Voos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Plane className="h-4 w-4 text-blue-600" />
                <span className="text-2xl font-bold">{summary.flightCount}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Hotéis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Hotel className="h-4 w-4 text-purple-600" />
                <span className="text-2xl font-bold">{summary.hotelCount}</span>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Orçamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summary.budget ? (
                <div>
                  <div className={`text-2xl font-bold ${summary.isOverBudget ? 'text-destructive' : ''}`}>
                    R$ {summary.remaining?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">restante</p>
                </div>
              ) : (
                <p className="text-muted-foreground">Não definido</p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Form or List */}
      {showForm ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="phantom-card p-6"
        >
          <h2 className="text-lg font-semibold mb-4">
            {editingBooking ? 'Editar Reserva' : 'Nova Reserva'}
          </h2>
          <BookingForm
            booking={editingBooking || undefined}
            tripId={tripId}
            onSubmit={handleSubmit}
            onCancel={handleCloseForm}
            isLoading={createBooking.isPending || updateBooking.isPending}
          />
        </motion.div>
      ) : (
        <BookingsList
          bookings={bookings}
          tripId={tripId}
          onCreateNew={() => setShowForm(true)}
          onEdit={handleEdit}
          onCancel={handleCancel}
          isLoading={bookingsLoading}
        />
      )}

      {/* Cancel Modal */}
      <CancelBookingModal
        booking={cancellingBooking}
        open={!!cancellingBooking}
        onClose={() => setCancellingBooking(null)}
        onConfirm={handleCancelBooking}
        isLoading={cancelBooking.isPending}
      />
    </motion.div>
  );
}
