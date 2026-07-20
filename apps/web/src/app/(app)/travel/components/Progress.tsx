'use client';
import * as React from 'react';
import { Check } from 'lucide-react';

export function Progress({ current, steps }: { current: number; steps: string[] }) {
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground overflow-x-auto pb-1">
      {steps.map((s, i) => (
        <React.Fragment key={s}>
          {i > 0 && <div className={`flex-1 min-w-[12px] h-0.5 ${i <= current ? 'bg-primary' : 'bg-border'}`} />}
          <span className={`flex items-center gap-1 whitespace-nowrap ${i === current ? 'text-primary font-semibold' : i < current ? 'text-green-600' : ''}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] flex-shrink-0 ${i < current ? 'bg-green-500 text-white' : i === current ? 'bg-primary text-white' : 'bg-muted'}`}>
              {i < current ? <Check className="h-3 w-3" /> : i + 1}
            </span>{s}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}
