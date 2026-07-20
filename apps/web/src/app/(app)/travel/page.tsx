'use client';
import * as React from 'react';
import { AnimatePresence } from 'framer-motion';
import { TripProvider, useTrip } from './contexts/TripContext';
import { PlanStep } from './components/PlanStep';
import { FlightsStep } from './components/FlightsStep';
import { HotelsStep } from './components/HotelsStep';
import { ConfirmStep } from './components/ConfirmStep';
import { ItineraryStep } from './components/ItineraryStep';
import { SavedStep } from './components/SavedStep';
import { MilesPanel } from './components/MilesPanel';

function TravelRouter() {
  const { step } = useTrip();
  switch (step) {
    case 'plan': return <PlanStep />;
    case 'flights': return <FlightsStep />;
    case 'hotels': return <HotelsStep />;
    case 'confirm': return <ConfirmStep />;
    case 'itinerary': return <ItineraryStep />;
    case 'saved': return <SavedStep />;
    case 'miles': return <MilesPanel />;
    default: return <PlanStep />;
  }
}

export default function TravelPage() {
  return (
    <TripProvider>
      <AnimatePresence mode="wait">
        <TravelRouter />
      </AnimatePresence>
    </TripProvider>
  );
}
