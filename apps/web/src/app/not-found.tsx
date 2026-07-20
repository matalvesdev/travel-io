import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-8">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-muted-foreground/20 mb-4">404</div>
        <h1 className="text-2xl font-bold mb-2">Página não encontrada</h1>
        <p className="text-sm text-muted-foreground mb-6">
          A página que você procura não existe ou foi movida.
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild variant="outline">
            <Link href="/"><Home className="mr-2 h-4 w-4" /> Início</Link>
          </Button>
          <Button asChild>
            <Link href="/travel"><Search className="mr-2 h-4 w-4" /> Planejar viagem</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
