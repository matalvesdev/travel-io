# Travel.io

**Plataforma de Finanças, Viagens e Compras Inteligentes**

Travel.io integra Finanças Pessoais, Investimentos, Viagens, Milhas, Promoções e Compras em um único ecossistema com IA.

## Stack

- **Next.js 16** — App Router, Server Actions, API Routes
- **React 19** — Server Components, Client Components
- **TypeScript** — Tipagem completa
- **TailwindCSS v4** — Estilização
- **shadcn/ui** — Componentes base
- **TanStack Query** — Data fetching/caching
- **Framer Motion** — Animações
- **Recharts** — Gráficos
- **Supabase** — Autenticação + Banco de dados (PostgreSQL + RLS)
- **Playwright** — Testes E2E
- **Vitest** — Testes unitários

## Início Rápido

### Pré-requisitos

- Node.js 20+
- npm

### Rodando localmente

```bash
# Clone
git clone https://github.com/your-org/travel-io.git
cd travel-io

# Configure variáveis de ambiente
cp apps/web/.env.example apps/web/.env.local

# Instale dependências
cd apps/web
npm install

# Inicie o frontend
npm run dev
```

Acesse: http://localhost:3000

## Estrutura

```
travel-io/
├── apps/
│   └── web/                # Next.js Frontend
│       ├── src/app/        # Páginas (App Router)
│       ├── src/components/ # Componentes compartilhados
│       ├── src/lib/        # Utilitários, API clients
│       ├── src/hooks/      # Hooks customizados
│       └── e2e/            # Testes E2E Playwright
├── supabase/
│   └── migrations/         # Schema SQL + RLS
└── .opencode/              # Configuração do assistente
```

## Módulos

1. **Dashboard** — Visão geral financeira, saldos, gráficos
2. **Finance** — Transações, cartões, orçamentos, assinaturas
3. **Investments** — Ações, FIIs, criptomoedas, renda fixa
4. **Travel** — Voos, hotéis, roteiros com IA
5. **Miles** — Milhas, pontos, promoções, programas
6. **Shopping** — Comparador de preços, wishlist, cupons
7. **Goals** — Metas financeiras
8. **AI** — Assistente financeiro inteligente (chat)
9. **Analytics** — Insights, previsões, relatórios
10. **Alerts** — Alertas de preço de voos/hotéis
11. **Profile** — Perfil, preferências, foto
12. **Admin** — Gestão de planos, feature flags

## Scripts

```bash
npm run dev          # Desenvolvimento (Turbopack)
npm run build        # Build de produção
npm run type-check   # TypeScript type checking
npm run lint         # TypeScript type checking (alias)
npm run test         # Testes unitários (Vitest)
npm run test:e2e     # Testes E2E (Playwright)
npm run storybook    # Storybook
```
