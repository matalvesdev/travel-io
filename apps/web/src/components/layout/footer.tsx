import * as React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/50" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">Footer</h2>
      <div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center mb-6">
              <span className="text-lg font-bold tracking-tight">TRAVEL.IO</span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Goal-Driven Financial Intelligence. Dinheiro, investimentos, viagens e objetivos conectados.
            </p>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Produto</h3>
            <ul className="space-y-3">
              {['Money', 'Investments', 'Travel', 'Loyalty', 'Shopping'].map((item) => (
                <li key={item}><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Empresa</h3>
            <ul className="space-y-3">
              {['Sobre', 'Blog', 'Carreiras', 'Contato'].map((item) => (
                <li key={item}><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              {['Privacidade', 'Termos', 'LGPD', 'Cookies'].map((item) => (
                <li key={item}><Link href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{item}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-16 border-t border-white/5 pt-8 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">&copy; {new Date().getFullYear()} Travel.io. Todos os direitos reservados.</p>
          <p className="text-xs text-muted-foreground">Goal-Driven Financial Intelligence</p>
        </div>
      </div>
    </footer>
  );
}
