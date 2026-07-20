'use client';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="text-center max-w-md">
        <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Erro no servidor</h1>
        <p className="text-sm text-muted-foreground mb-6">
          {error.message || 'Ocorreu um erro inesperado. Tente novamente.'}
        </p>
        <Button onClick={reset} size="lg">
          <RefreshCw className="mr-2 h-5 w-5" /> Tentar novamente
        </Button>
      </div>
    </div>
  );
}
