# Travel.io

**Plataforma de Finanças, Viagens e Compras Inteligentes**

Travel.io integra Finanças Pessoais, Investimentos, Viagens, Milhas, Promoções e Compras em um único ecossistema com IA.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-blue)](https://www.typescriptlang.org/)
[![Tests](https://img.shields.io/badge/tests-87%20passing-brightgreen)](#testes)

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Next.js 16 (App Router) + React 19 + TypeScript |
| Estilo | Tailwind CSS v4 + shadcn/ui + Framer Motion |
| State | Zustand (client) + TanStack Query (server) |
| Gráficos | Recharts |
| Backend | Next.js API Routes (server-side) |
| Database | Supabase (PostgreSQL + RLS + Auth) |
| Testes | Vitest (unit/integration) + Playwright (E2E) |

## Início Rápido

### Pré-requisitos

- Node.js 20+
- npm
- Conta no [Supabase](https://supabase.com)

### Instalação

```bash
# Clone
git clone https://github.com/matalvesdev/travel-io.git
cd travel-io

# Configure variáveis de ambiente
cp apps/web/.env.example apps/web/.env.local
# Edite .env.local com suas credenciais Supabase

# Instale dependências
cd apps/web
npm install

# Execute as migrations no Supabase Dashboard
# Copie o conteúdo de supabase/migrations/000_init.sql

# Inicie o servidor de desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

## Estrutura

```
travel-io/
├── apps/
│   └── web/                     # Next.js Frontend
│       ├── src/app/             # Páginas (App Router)
│       │   ├── (app)/           # Rotas autenticadas
│       │   ├── api/             # API Routes
│       │   └── auth/            # Login/Register/Callback
│       ├── src/components/      # Componentes UI
│       │   ├── dashboard/       # StatsHero, CategoryChart, CashFlowChart, NewsSection
│       │   ├── travel/          # FlightCard, HotelCard, CityAutocomplete
│       │   ├── shopping/        # ProductCard, PriceComparison
│       │   └── ui/              # shadcn/ui base
│       ├── src/hooks/api/       # React Query hooks
│       ├── src/lib/api/         # API clients + helpers
│       ├── src/stores/          # Zustand stores
│       └── e2e/                 # Playwright E2E tests
├── packages/
│   └── shared/                  # Tipos e utilitários compartilhados
├── supabase/
│   └── migrations/              # Schema SQL + RLS policies
└── .specs/                      # Specs de features
```

## Módulos

| Módulo | Descrição | Status |
|--------|-----------|--------|
| **Dashboard** | Visão geral financeira, gráficos, notícias | Concluído |
| **Finance** | Transações, categorias, importação CSV | Concluído |
| **Investments** | Ações, FIIs, criptomoedas, carteira | Concluído |
| **Travel** | Planejador de viagens com IA, voos, hotéis | Concluído |
| **Miles** | Programs de milhas, acúmulo, resgate | Concluído |
| **Shopping** | Comparador de preços, wishlist, cupons | Concluído |
| **Goals** | Metas financeiras com progresso | Concluído |
| **AI** | Assistente financeiro (chat) | Concluído |
| **Analytics** | Insights, previsões, relatórios | Concluído |
| **Alerts** | Alertas de preço de voos/hotéis | Concluído |
| **Profile** | Perfil, preferências, foto | Concluído |
| **Admin** | Gestão de planos, feature flags | Concluído |

### Dashboard Redesign

O dashboard foi redesenhado com foco em qualidade visual:

- **StatsHero** — Métricas-chave (Patrimônio, Receitas, Despesas, Saldo) com animações
- **CategoryChart** — Gráfico donut de despesas por categoria com legenda interativa
- **CashFlowChart** — Gráfico de área mostrando receitas vs despesas (6 meses)
- **NewsSection** — Notícias financeiras via Finnhub API com fallback Google News RSS

### Travel Planner

Planejador de viagens multi-step com IA:

1. **Destino** — Autocomplete de cidades com aeroportos
2. **Voos** — Busca em múltiplas fontes (LATAM, GOL, KAYAK)
3. **Hotéis** — Busca com filtros (estrelas, preço, ordenação)
4. **Confirmar** — Resumo com custo total
5. **Roteiro** — IA gera itinerário dia a dia
6. **Salvo** — Plano financeiro com dicas de economia

## Testes

```bash
# Todos os testes (requer dev server rodando)
npm run dev &
npm run test          # Vitest: 67 testes (unit + integration)
npm run test:e2e      # Playwright: 20 testes E2E

# Build
npm run build
```

### Cobertura

| Suite | Testes | Tipo |
|-------|--------|------|
| Shopping unit | 22 | parseBRL, extractMeta |
| Travel unit | 25 | calcNights, findCheapest, calcTotalCost, generateItinerary |
| Shopping integration | 10 | API products, coupons (scrapers externos) |
| Travel integration | 10 | API flights, hotels (scrapers externos) |
| E2E | 20 | Dashboard, Finance, Investments, Shopping, Travel |
| **Total** | **87** | **100% passando** |

## Scripts

```bash
npm run dev          # Desenvolvimento (Turbopack)
npm run build        # Build de produção
npm run start        # Iniciar em produção
npm run lint         # TypeScript type checking
npm run test         # Testes unitários (Vitest)
npm run test:e2e     # Testes E2E (Playwright)
npm run storybook    # Storybook (port 6006)
```

## Arquitetura

### Auth

- Autenticação via Supabase Auth (email + OAuth Google/Apple)
- Middleware verifica cookie `accessToken` para rotas protegidas
- RLS policies em todas as tabelas PostgreSQL

### API Routes

Todas as API Routes usam `authenticatedHandler` para:
- Verificar autenticação via Supabase
- Extrair `userId` do token
- Retornar erros padronizados

### State Management

- **Zustand** — UI state (sidebar, modals, filtros)
- **TanStack Query** — Server state (dados do banco com cache, stale-while-revalidate)

## Variáveis de Ambiente

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# News API (opcional)
FINNHUB_API_KEY=your_key
```

## Licença

MIT
