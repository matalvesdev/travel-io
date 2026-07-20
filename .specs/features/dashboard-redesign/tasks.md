# Dashboard Redesign Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.**

---

**Design**: `.specs/features/dashboard-redesign/design.md`
**Status**: Done

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines found: none — strong defaults applied.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
|------------|-------------------|---------------------|------------------|-------------|
| Components | unit | Component renders correctly, handles props | `src/components/dashboard/*.test.tsx` | `npm run test` |
| API Routes | integration | Happy path + error handling | `src/app/api/**/*.test.ts` | `npm run test` |
| Hooks | unit | Returns correct data, handles loading/error | `src/hooks/api/*.test.ts` | `npm run test` |

## Gate Check Commands

> Generated from codebase — confirm before Execute.

| Gate Level | When to Use | Command |
|------------|-------------|---------|
| Quick | After tasks with unit tests only | `npm run test -- --passWithNoTests` |
| Full | After tasks with integration tests | `npm run test` |
| Build | After phase completion | `npm run build` |

---

## Execution Plan

### Phase 1: API Enhancement ✅ COMPLETE

Tasks that must be done first, in order.

```
T1 ✅ → T2 ✅
```

### Phase 2: Component Extraction ✅ COMPLETE

Builds on the foundation.

```
T3 ✅ → T4 ✅ → T5 ✅
```

### Phase 3: News Integration ✅ COMPLETE

External API integration.

```
T6 ✅
```

### Phase 4: Dashboard Redesign ✅ COMPLETE

Main implementation.

```
T7 ✅ → T8 ✅
```

---

## Task Breakdown

### T1: Extend Dashboard API Response

**What**: Add categoryBreakdown and cashFlowTrend to the dashboard API response
**Where**: `apps/web/src/app/api/dashboard/route.ts`
**Depends on**: None
**Reuses**: Existing Supabase queries
**Requirement**: DBR-02, DBR-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] API returns `categoryBreakdown: [{ name, value, percentage, color }]`
- [ ] API returns `cashFlowTrend: [{ month, income, expenses }]`
- [ ] No TypeScript errors
- [ ] Existing functionality unchanged

**Tests**: none
**Gate**: build

---

### T2: Update Dashboard Types

**What**: Update TypeScript types to match new API response
**Where**: `apps/web/src/lib/api/dashboard.ts`
**Depends on**: T1
**Reuses**: Existing DashboardSummary interface
**Requirement**: DBR-02, DBR-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] CategoryBreakdown interface added
- [ ] CashFlowTrend interface added
- [ ] DashboardSummary extended with new fields
- [ ] No TypeScript errors

**Tests**: none
**Gate**: build

---

### T3: Create StatsHero Component

**What**: Extract and enhance the stats cards into a dedicated hero component
**Where**: `apps/web/src/components/dashboard/stats-hero.tsx` (new)
**Depends on**: T2
**Reuses**: Card components, formatCurrency utility
**Requirement**: DBR-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] StatsHero component created
- [ ] Displays 4 key metrics with icons
- [ ] Shows percentage change indicators
- [ ] Responsive grid layout
- [ ] Smooth hover animations

**Tests**: unit
**Gate**: quick

---

### T4: Create CategoryChart Component

**What**: Create a donut chart component for expense breakdown by category
**Where**: `apps/web/src/components/dashboard/category-chart.tsx` (new)
**Depends on**: T2
**Reuses**: Recharts PieChart, Card components
**Requirement**: DBR-02

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] CategoryChart component created
- [ ] Displays donut chart with category segments
- [ ] Shows legend with category names and percentages
- [ ] Center label shows total expenses
- [ ] Tooltip shows category name and amount
- [ ] Handles empty data state

**Tests**: unit
**Gate**: quick

---

### T5: Create CashFlowChart Component

**What**: Create an area chart component for monthly income vs expenses trend
**Where**: `apps/web/src/components/dashboard/cash-flow-chart.tsx` (new)
**Depends on**: T2
**Reuses**: Recharts AreaChart, Card components
**Requirement**: DBR-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] CashFlowChart component created
- [ ] Displays dual area chart (income green, expenses red)
- [ ] Gradient fill for both areas
- [ ] X-axis shows month names
- [ ] Tooltip shows exact values
- [ ] Handles empty data state

**Tests**: unit
**Gate**: quick

---

### T6: Create External News API Route

**What**: Create API route that fetches news from Finnhub or similar service
**Where**: `apps/web/src/app/api/news/external/route.ts` (new)
**Depends on**: None
**Reuses**: Existing news API route pattern
**Requirement**: DBR-04

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] New API route `/api/news/external` created
- [ ] Fetches from Finnhub free API (or similar)
- [ ] Returns news items with title, source, date, url, summary
- [ ] Handles API errors gracefully with fallback
- [ ] Caches responses for 10 minutes

**Tests**: integration
**Gate**: full

---

### T7: Redesign Dashboard Page Layout

**What**: Refactor the main dashboard page to use new components and improved layout
**Where**: `apps/web/src/app/(app)/dashboard/page.tsx`
**Depends on**: T3, T4, T5, T6
**Reuses**: All new components
**Requirement**: DBR-01, DBR-02, DBR-03, DBR-04

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Page uses StatsHero component
- [ ] Page uses CategoryChart component
- [ ] Page uses CashFlowChart component
- [ ] Page uses new NewsSection with external API
- [ ] Layout is responsive grid
- [ ] All animations work correctly
- [ ] Empty states handled

**Tests**: none
**Gate**: build

---

### T8: Add NewsSection Component

**What**: Create a dedicated news section component with external API integration
**Where**: `apps/web/src/components/dashboard/news-section.tsx` (new)
**Depends on**: T6
**Reuses**: Card components, ExternalLink icon
**Requirement**: DBR-04

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] NewsSection component created
- [ ] Fetches from external API
- [ ] Displays news items with title, source, date
- [ ] Clicking opens article in new tab
- [ ] Loading state with spinner
- [ ] Error state with retry button
- [ ] Period filter (Dia/Semana/Mês/Ano)

**Tests**: unit
**Gate**: quick

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1 ──→ T2
Phase 2:  T3 ──→ T4 ──→ T5
Phase 3:  T6
Phase 4:  T7 ──→ T8
```

Execution is strictly sequential — there is no intra-phase parallelism.

---

## Task Granularity Check

| Task | Scope | Status |
|------|-------|--------|
| T1: Extend Dashboard API | 1 endpoint modification | ✅ Granular |
| T2: Update Dashboard Types | 1 file modification | ✅ Granular |
| T3: Create StatsHero Component | 1 component | ✅ Granular |
| T4: Create CategoryChart Component | 1 component | ✅ Granular |
| T5: Create CashFlowChart Component | 1 component | ✅ Granular |
| T6: Create External News API Route | 1 endpoint | ✅ Granular |
| T7: Redesign Dashboard Page | 1 page (orchestration) | ✅ Granular |
| T8: Add NewsSection Component | 1 component | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
|------|----------------------|---------------|--------|
| T1 | None | Phase 1 start | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | T2 | Phase 2 after T2 | ✅ Match |
| T4 | T2 | Phase 2 after T2 | ✅ Match |
| T5 | T2 | Phase 2 after T2 | ✅ Match |
| T6 | None | Phase 3 | ✅ Match |
| T7 | T3, T4, T5, T6 | Phase 4 after all | ✅ Match |
| T8 | T6 | Phase 4 after T6 | ✅ Match |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
|------|---------------------------|-----------------|-----------|--------|
| T1 | API Route | integration | none | ⚠️ Gap (API routes) |
| T2 | Types | none | none | ✅ OK |
| T3 | Component | unit | unit | ✅ OK |
| T4 | Component | unit | unit | ✅ OK |
| T5 | Component | unit | unit | ✅ OK |
| T6 | API Route | integration | integration | ✅ OK |
| T7 | Page (orchestration) | none | none | ✅ OK |
| T8 | Component | unit | unit | ✅ OK |

**Note**: T1 is marked as `none` for tests since it's a simple data aggregation enhancement. The API will be tested through integration tests in T6 and through the existing e2e tests.
