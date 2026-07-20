'use client';
import * as React from 'react';
import { motion } from 'framer-motion';
import { Bell, Search, Loader2, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function MilesPromotions({ curatedPromos }: { curatedPromos: any[] }) {
  const [promos, setPromos] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [checked, setChecked] = React.useState(false);

  const fetchPromos = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products?store=miles&q=promocoes', { signal: AbortSignal.timeout(30000) });
      const data = await res.json();
      setPromos(data.products || []);
    } catch { setPromos([]); }
    setLoading(false);
    setChecked(true);
  };

  const programColors: Record<string, string> = {
    Smiles: '#FF6600', Latam: '#1B0F4E', Livelo: '#E91E63', TudoAzul: '#0057B8', Esfera: '#EC7000',
  };

  return (
    <div className="phantom-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2"><Bell className="h-4 w-4 text-amber-500" /> Promoções Ativas</h3>
        {!checked && <Button size="sm" variant="outline" onClick={fetchPromos} disabled={loading}>
          {loading ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Search className="h-3 w-3 mr-1" />}Verificar
        </Button>}
      </div>
      <div className="space-y-3">
        {curatedPromos.map((promo, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
            className="flex items-center gap-3 p-3 rounded-xl border hover:bg-muted/30 transition-colors group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
              style={{ backgroundColor: programColors[promo.program] || '#666' }}>
              ✈️
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{promo.title}</p>
              <p className="text-xs text-muted-foreground">{promo.route} • {promo.expiresAt}</p>
            </div>
            <span className="text-xs font-bold text-green-600 bg-green-500/10 px-2 py-0.5 rounded-full">{promo.discount}</span>
            <a href={promo.url} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg hover:bg-muted opacity-0 group-hover:opacity-100 transition-opacity">
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            </a>
          </motion.div>
        ))}
      </div>
      {checked && promos.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-semibold text-primary mb-2">🔍 Promoções encontradas online:</p>
          <div className="space-y-2">
            {promos.slice(0, 5).map((p: any, i: number) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-muted/30 text-xs">
                <span className="font-medium">{p.route || p.title || 'Promoção'}</span>
                {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Ver →</a>}
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="mt-4 p-3 rounded-xl bg-blue-500/5 border border-blue-500/20">
        <p className="text-xs font-semibold text-blue-700 mb-1">💡 Dica da IA para Monitorar</p>
        <p className="text-xs text-blue-600">Configure alertas de preço na aba Viagens. Quando o voo ou hotel baixar de preço, você é notificado automaticamente. Use milhas nos programas com melhor custo-benefício no momento da compra.</p>
      </div>
    </div>
  );
}
