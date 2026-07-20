'use client';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, X } from 'lucide-react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor = type === 'success' ? 'bg-success' : type === 'error' ? 'bg-destructive' : 'bg-info';
  const icon = type === 'success' ? <CheckCircle2 className="h-5 w-5" /> : type === 'error' ? <X className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 right-4 z-50"
    >
      <div className={`flex items-center gap-3 rounded-lg ${bgColor} px-4 py-3 text-white shadow-lg`}>
        {icon}
        <span className="text-sm font-medium">{message}</span>
        <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100">
          <X className="h-4 w-4" />
        </button>
      </div>
    </motion.div>
  );
}
