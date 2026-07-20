'use client';
import * as React from 'react';
import { Users, Settings, Shield, Activity, Loader2, RefreshCw, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useFeatureFlags, useSystemHealth, usePlans } from '@/hooks/api';
import { toast } from 'sonner';

export default function AdminPage() {
  const { data: health, isLoading: healthLoading, error: healthError, refetch: refetchHealth } = useSystemHealth();
  const { data: flagsData, isLoading: flagsLoading } = useFeatureFlags();
  const { data: plansData, isLoading: plansLoading } = usePlans();

  const stats = [
    { t: 'Sistema', v: health?.status === 'healthy' ? 'Online' : 'Degradado', icon: Activity, color: health?.status === 'healthy' ? 'text-success' : 'text-destructive' },
    { t: 'Uptime', v: health?.uptime ? `${Math.floor(health.uptime)}s` : '—', icon: Activity, color: 'text-primary' },
    { t: 'Feature Flags', v: flagsData?.flags?.length ?? '—', icon: Settings, color: 'text-info' },
    { t: 'Planos', v: plansData?.plans?.length ?? '—', icon: Shield, color: 'text-success' },
  ];

  const flags: Array<{ id: string; name: string; key: string; isEnabled: boolean }> = flagsData?.flags ?? [];

  const isLoading = healthLoading || flagsLoading || plansLoading;

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (healthError) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="flex flex-col items-center gap-4 p-6">
            <AlertTriangle className="h-8 w-8 text-destructive" />
            <p className="text-muted-foreground">Erro ao carregar dados administrativos</p>
            <Button variant="outline" onClick={() => refetchHealth()}>Tentar novamente</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Administração</h1>
          <p className="text-muted-foreground">Painel administrativo</p>
        </div>
        <Button variant="outline" onClick={() => refetchHealth()} disabled={healthLoading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${healthLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{s.t}</p>
                  <p className="text-2xl font-bold">{s.v}</p>
                </div>
                <s.icon className={`h-6 w-6 ${s.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Feature Flags</CardTitle></CardHeader>
          <CardContent>
            {flags.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhuma feature flag encontrada</p>
            ) : (
              <div className="space-y-3">
                {flags.map((f) => (
                  <div key={f.id} className="flex items-center justify-between">
                    <div>
                      <span className="text-sm font-medium">{f.name}</span>
                      <span className="ml-2 text-xs text-muted-foreground">{f.key}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${f.isEnabled ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                      {f.isEnabled ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>System Health</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">API Status</span>
              <span className={`rounded-full px-2 py-1 text-xs ${health?.status === 'healthy' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                {health?.status === 'healthy' ? 'Online' : 'Offline'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
