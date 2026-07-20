'use client';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="flex h-64 items-center justify-center p-8">
      <div className="text-center max-w-md">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="h-6 w-6 text-destructive" />
        </div>
        <h2 className="text-lg font-bold mb-2">Algo deu errado</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {error.message || 'Ocorreu um erro inesperado. Tente novamente.'}
        </p>
        <Button onClick={reset} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" /> Tentar novamente
        </Button>
      </div>
    </div>
  );
}
