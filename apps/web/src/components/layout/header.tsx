'use client';

import * as React from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Recursos', href: '#features' },
  { name: 'Como funciona', href: '#how-it-works' },
  { name: 'Preços', href: '#pricing' },
  { name: 'FAQ', href: '#faq' },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <header className="fixed top-0 z-50 w-full">
      <nav className="mx-auto max-w-7xl px-6 lg:px-8 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-foreground">TRAVEL.IO</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              {item.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link href="/auth/login"><Button variant="ghost" size="sm">Entrar</Button></Link>
          <Link href="/auth/register"><Button size="sm" className="btn-primary-gradient">Começar agora</Button></Link>
          <button type="button" className="md:hidden p-2 rounded-lg hover:bg-muted/50 transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden mx-4 mb-4 phantom-card p-4">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href} className="block px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg transition-all" onClick={() => setMobileMenuOpen(false)}>
              {item.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
