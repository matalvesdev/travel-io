'use client';

import * as React from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { Booking } from '@/types/booking';

interface CancelBookingModalProps {
  booking: Booking | null;
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export function CancelBookingModal({ booking, open, onClose, onConfirm, isLoading }: CancelBookingModalProps) {
  if (!booking) return null;

  const isFlight = booking.type === 'flight';
  const bookingName = isFlight
    ? `${booking.airline || 'Voo'} ${booking.flightNumber || ''}`
    : booking.hotelName || 'Hotel';

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <DialogTitle className="text-center">Cancelar Reserva</DialogTitle>
          <DialogDescription className="text-center">
            Tem certeza que deseja cancelar esta reserva?
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-muted p-4 text-sm">
          <p className="font-medium">{bookingName}</p>
          {booking.confirmationCode && (
            <p className="text-muted-foreground mt-1">
              Confirmação: {booking.confirmationCode}
            </p>
          )}
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Esta ação não pode ser desfeita.
        </p>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose}>
            Voltar
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Confirmar Cancelamento
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
