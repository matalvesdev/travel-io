import { Loader2 } from 'lucide-react';

export default function RootLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">Carregando Travel.io...</p>
      </div>
    </div>
  );
}
