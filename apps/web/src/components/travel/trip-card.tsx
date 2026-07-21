'use client';

import * as React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface TripCardProps {
  trip: any;
  onClick: () => void;
}

export function TripCard({ trip, onClick }: TripCardProps) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <CardContent className="p-4">
        <p className="font-medium">{trip.name || trip.destination}</p>
      </CardContent>
    </Card>
  );
}
