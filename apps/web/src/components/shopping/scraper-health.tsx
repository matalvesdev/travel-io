'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { Activity, CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { STORES, type StoreId } from '@/lib/shopping/stores';

interface StoreHealth {
  healthy: boolean;
  latency: number;
  error?: string;
}

interface HealthData {
  stores: Record<StoreId, StoreHealth>;
  summary: {
    total: number;
    healthy: number;
    degraded: number;
    down: number;
  };
}

export function ScraperHealth() {
  const [health, setHealth] = React.useState<HealthData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchHealth = React.useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/health/scraper');
      if (!res.ok) throw new Error('Failed to fetch health');
      const data = await res.json();
      setHealth(data.data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchHealth();
    // Refresh every 5 minutes
    const interval = setInterval(fetchHealth, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  if (loading && !health) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-border/50">
        <CardContent className="p-6 text-center">
          <p className="text-sm text-muted-foreground">Erro ao carregar status</p>
        </CardContent>
      </Card>
    );
  }

  if (!health) return null;

  return (
    <Card className="border-border/50">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Activity className="h-4 w-4 text-primary" />
          Status dos Scrapers
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Summary */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 text-success" />
            <span className="text-sm font-medium">{health.summary.healthy}</span>
            <span className="text-xs text-muted-foreground">saudáveis</span>
          </div>
          {health.summary.degraded > 0 && (
            <div className="flex items-center gap-1.5">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span className="text-sm font-medium">{health.summary.degraded}</span>
              <span className="text-xs text-muted-foreground">degradados</span>
            </div>
          )}
          {health.summary.down > 0 && (
            <div className="flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-sm font-medium">{health.summary.down}</span>
              <span className="text-xs text-muted-foreground">fora</span>
            </div>
          )}
        </div>

        {/* Store Status */}
        <div className="space-y-2">
          {(Object.entries(health.stores) as [StoreId, StoreHealth][]).map(([storeId, storeHealth]) => {
            const store = STORES[storeId];
            return (
              <motion.div
                key={storeId}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/30"
              >
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: store.color }}
                  />
                  <span className="text-sm font-medium">{store.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {storeHealth.latency}ms
                  </span>
                  {storeHealth.healthy ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : storeHealth.error ? (
                    <XCircle className="h-4 w-4 text-destructive" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Refresh Button */}
        <button
          onClick={fetchHealth}
          className="mt-4 text-xs text-muted-foreground hover:text-primary transition-colors"
        >
          Atualizar status
        </button>
      </CardContent>
    </Card>
  );
}
