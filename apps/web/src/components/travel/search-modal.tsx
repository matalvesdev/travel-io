'use client';

import * as React from 'react';

interface SearchModalProps {
  onClose: () => void;
}

export function SearchModal({ onClose }: SearchModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg p-6">
        <p>Search Modal (stub)</p>
        <button onClick={onClose}>Fechar</button>
      </div>
    </div>
  );
}
