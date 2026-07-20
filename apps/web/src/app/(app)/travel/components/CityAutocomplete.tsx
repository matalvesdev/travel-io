'use client';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin } from 'lucide-react';
import { ALL_LOCATIONS } from '@/lib/data/cities';

function removeAccents(s: string) { return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase(); }

export function CityAutocomplete({ value, onChange, placeholder, icon: Icon, label }: { value: string; onChange: (v: string) => void; placeholder: string; icon: any; label?: string }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState(value);
  const ref = React.useRef<HTMLDivElement>(null);
  React.useEffect(() => { setQuery(value); }, [value]);
  React.useEffect(() => { const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }; document.addEventListener('mousedown', h); return () => document.removeEventListener('mousedown', h); }, []);
  const q = removeAccents(query);
  const filtered = query.length > 0 ? ALL_LOCATIONS.filter(l => removeAccents(l.city).includes(q) || removeAccents(l.state).includes(q)) : [];
  const cityEntries = filtered.reduce<[string, typeof ALL_LOCATIONS][]>((acc, l) => {
    if (!acc.some(e => e[0] === l.city)) acc.push([l.city, filtered.filter(x => x.city === l.city)]);
    return acc;
  }, []).slice(0, 8);
  return (
    <div ref={ref} className="relative">
      {label && <label className="text-xs font-medium text-muted-foreground mb-1 block">{label}</label>}
      <div className="relative">
        <Icon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input value={query} onChange={e => { setQuery(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder={placeholder}
          className="w-full rounded-xl border bg-background/50 pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all" />
      </div>
      <AnimatePresence>
        {open && cityEntries.length > 0 && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="absolute z-50 mt-1 w-full rounded-xl border bg-card shadow-xl max-h-64 overflow-auto">
            {cityEntries.map(([city, locs]) => (
              <button key={city} onClick={() => { onChange(city); setQuery(city); setOpen(false); }}
                className="w-full px-4 py-2.5 text-left hover:bg-muted/50 transition-colors flex items-center gap-3 border-b border-border/20 last:border-0">
                <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <div><p className="text-sm font-medium">{city}</p><p className="text-[11px] text-muted-foreground">{locs[0]?.state || ''} — {locs.length} aeroporto{locs.length > 1 ? 's' : ''}</p></div>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
