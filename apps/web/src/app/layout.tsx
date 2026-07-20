import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';

import { ThemeProvider } from '@/components/providers/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { Toaster } from '@/components/ui/sonner';

import '@/styles/globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'Travel.io - Sua Plataforma Financeira Inteligente',
    template: '%s | Travel.io',
  },
  description: 'Finance Pessoais, Investimentos, Viagens, Milhas e Shopping Inteligente em um único ecossistema. AI-First.',
  keywords: ['finanças', 'investimentos', 'viagens', 'milhas', 'shopping', 'IA', 'inteligência artificial'],
  authors: [{ name: 'Travel.io' }],
  creator: 'Travel.io',
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://travel.io',
    siteName: 'Travel.io',
    title: 'Travel.io - Sua Plataforma Financeira Inteligente',
    description: 'Finance Pessoais, Investimentos, Viagens, Milhas e Shopping Inteligente em um único ecossistema.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Travel.io - Sua Plataforma Financeira Inteligente',
    description: 'Finance Pessoais, Investimentos, Viagens, Milhas e Shopping Inteligente em um único ecossistema.',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#ffffff' },
    { media: '(prefers-color-scheme: dark)', color: '#09090b' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {children}
            <Toaster richColors position="top-right" />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
