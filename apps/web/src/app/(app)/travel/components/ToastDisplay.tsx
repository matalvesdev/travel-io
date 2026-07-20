'use client';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { useTrip } from '../contexts/TripContext';

export function ToastDisplay() {
  const { toast } = useTrip();
  return (
    <AnimatePresence>
      {toast && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
          className={`fixed top-4 left-1/2 -translate-x-1/2 z-[100] px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 text-sm font-medium ${toast.type === 'success' ? 'bg-green-600 text-white' : 'bg-destructive text-white'}`}>
          {toast.type === 'success' ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}{toast.message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
