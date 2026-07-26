# Budget Module Tasks

## Execution Protocol (MANDATORY)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.**

---

**Design**: `.specs/features/budget-module/design.md`
**Status**: Approved

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec. Guidelines found: `vitest.config.ts`, `package.json` scripts.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
|------------|-------------------|---------------------|------------------|-------------|
| Components | unit | All props, states, user interactions | `src/__tests__/unit/components/**/*.test.tsx` | `npm run test:unit` |
| Hooks | unit | All hooks, mutations, queries | `src/__tests__/unit/hooks/**/*.test.ts` | `npm run test:unit` |
| API Routes | unit | All endpoints: happy + error paths | `src/__tests__/unit/api/**/*.test.ts` | `npm run test:unit` |
| Lib/Utils | unit | All functions, edge cases | `src/__tests__/unit/**/*.test.ts` | `npm run test:unit` |

## Gate Check Commands

| Gate Level | When to Use | Command |
|------------|-------------|---------|
| Quick | After tasks with unit tests only | `npm run test:unit` |
| Full | After tasks with integration tests | `npm run test:unit && npm run test:integration` |
| Build | After phase completion | `npm run build && npm run test:unit` |

---

## Execution Plan

### Phase 1: Schema & Types (Foundation)

Tasks that must be done first — data models and types.

```
T1 → T2
```

### Phase 2: API Routes

Backend endpoints for budget operations.

```
T3 → T4 → T5
```

### Phase 3: Hooks & Components

Frontend hooks and reusable components.

```
T6 → T7 → T8 → T9
```

### Phase 4: Pages & Integration

UI pages and final integration.

```
T10 → T11
```

---

## Task Breakdown

### T1: Update Prisma Schema with Budget Model

**What**: Add Budget model with unique constraint
**Where**: `apps/web/prisma/schema.prisma`
**Depends on**: None
**Reuses**: Existing Transaction model for spending calculation
**Requirement**: BUD-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Budget model defined with all fields from design
- [ ] Unique constraint on user+category+month+year
- [ ] No TypeScript errors after `npx prisma generate`
- [ ] Gate check passes: `npm run build`

**Tests**: none (schema only)
**Gate**: build

---

### T2: Update Budget Types

**What**: Add new types for budget CRUD operations
**Where**: `apps/web/src/types/budget.ts` (novo)
**Depends on**: T1
**Reuses**: Existing `types/shared.ts` patterns

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `Budget` interface defined
- [ ] `BudgetWithSpent` interface defined
- [ ] `CreateBudgetInput` type defined
- [ ] `BudgetAlert` type defined
- [ ] `BudgetHistoryItem` type defined
- [ ] Types exported from `types/index.ts`

**Tests**: none (types only)
**Gate**: build

---

### T3: Create Budget API Route (CRUD)

**What**: GET/POST/PUT/DELETE `/api/budget`
**Where**: `apps/web/src/app/api/budget/route.ts`
**Depends on**: T1, T2
**Reuses**: `authenticatedHandler` from `lib/api/supabase-helpers.ts`

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] GET returns budgets for month/year
- [ ] POST creates or updates budget (upsert)
- [ ] PUT updates existing budget
- [ ] DELETE removes budget
- [ ] All endpoints calculate spent from transactions
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 6+ tests (CRUD + upsert + spending calculation)

**Tests**: unit
**Gate**: quick

---

### T4: Create Budget Summary API

**What**: GET `/api/budget/summary`
**Where**: `apps/web/src/app/api/budget/summary/route.ts`
**Depends on**: T3
**Reuses**: `authenticatedHandler`, Prisma aggregation

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] GET returns total budget vs total spent
- [ ] Includes per-category breakdown
- [ ] Calculates percentage and status per category
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 4+ tests (success, empty, with spending, alerts)

**Tests**: unit
**Gate**: quick

---

### T5: Create Budget History API

**What**: GET `/api/budget/history`
**Where**: `apps/web/src/app/api/budget/history/route.ts`
**Depends on**: T3
**Reuses**: `authenticatedHandler`

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] GET returns previous months' budgets
- [ ] Includes total budget vs total spent per month
- [ ] Supports pagination (last 12 months)
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 3+ tests (success, empty, pagination)

**Tests**: unit
**Gate**: quick

---

### T6: Create useBudgets Hook

**What**: React Query hooks for budget CRUD
**Where**: `apps/web/src/hooks/api/use-budget.ts`
**Depends on**: T3, T4, T5
**Reuses**: `useQuery`, `useMutation` patterns

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `useBudgets(month, year)` hook defined
- [ ] `useBudgetSummary(month, year)` hook defined
- [ ] `useBudgetHistory()` hook defined
- [ ] `useCreateBudget()` hook defined
- [ ] `useUpdateBudget()` hook defined
- [ ] `useDeleteBudget()` hook defined
- [ ] All hooks invalidate relevant queries
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 6+ tests (one per hook)

**Tests**: unit
**Gate**: quick

---

### T7: Create BudgetForm Component

**What**: Form to create/edit a budget category
**Where**: `apps/web/src/components/budget/budget-form.tsx`
**Depends on**: T2, T6
**Reuses**: Form patterns from booking-form

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Form shows category dropdown
- [ ] Form shows limit input
- [ ] Form validates limit > 0
- [ ] Submit button with loading state
- [ ] Edit mode pre-fills existing data
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 4+ tests (render, validation, submit, edit mode)

**Tests**: unit
**Gate**: quick

---

### T8: Create BudgetCard Component

**What**: Display a single budget category with progress
**Where**: `apps/web/src/components/budget/budget-card.tsx`
**Depends on**: T2
**Reuses**: Progress component, Card component

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Shows category name
- [ ] Shows progress bar (spent/limit)
- [ ] Shows percentage
- [ ] Shows remaining amount
- [ ] Color coding: green (<80%), yellow (80-100%), red (>100%)
- [ ] Edit and Delete buttons
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 5+ tests (safe, warning, danger, buttons, formatting)

**Tests**: unit
**Gate**: quick

---

### T9: Create BudgetOverview Component

**What**: Dashboard showing all budgets with summary
**Where**: `apps/web/src/components/budget/budget-overview.tsx`
**Depends on**: T8
**Reuses**: `BudgetCard`

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Shows total budget vs total spent
- [ ] Shows overall progress bar
- [ ] Lists all budget cards
- [ ] Empty state with "Criar primeiro orçamento" button
- [ ] Loading state
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 4+ tests (summary, cards, empty, loading)

**Tests**: unit
**Gate**: quick

---

### T10: Create BudgetPage Component

**What**: Main budget page
**Where**: `apps/web/src/app/(app)/budget/page.tsx`
**Depends on**: T7, T9
**Reuses**: `BudgetOverview`, `BudgetForm`

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Shows month/year selector
- [ ] "Criar Orçamento" button opens form
- [ ] BudgetOverview with all budgets
- [ ] Alert banner for approaching limits
- [ ] Responsive design
- [ ] Build passes: `npm run build`

**Tests**: none (integration only)
**Gate**: build

---

### T11: Add Budget Link to Sidebar

**What**: Add "Orçamento" link to navigation sidebar
**Where**: `apps/web/src/components/layout/sidebar.tsx`
**Depends on**: T10
**Reuses**: Existing sidebar patterns

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] "Orçamento" link added to sidebar
- [ ] Link navigates to /budget
- [ ] Icon matches existing style
- [ ] Build passes: `npm run build`

**Tests**: none (integration only)
**Gate**: build

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1 ──→ T2
Phase 2:  T3 ──→ T4 ──→ T5
Phase 3:  T6 ──→ T7 ──→ T8 ──→ T9
Phase 4:  T10 ──→ T11
```

---

## Task Granularity Check

| Task | Scope | Status |
|------|-------|--------|
| T1: Update Prisma Schema | 1 model | ✅ Granular |
| T2: Update Budget Types | 1 file | ✅ Granular |
| T3: Budget CRUD API | 1 endpoint | ✅ Granular |
| T4: Budget Summary API | 1 endpoint | ✅ Granular |
| T5: Budget History API | 1 endpoint | ✅ Granular |
| T6: useBudgets Hook | 1 hook file | ✅ Granular |
| T7: BudgetForm | 1 component | ✅ Granular |
| T8: BudgetCard | 1 component | ✅ Granular |
| T9: BudgetOverview | 1 component | ✅ Granular |
| T10: BudgetPage | 1 page | ✅ Granular |
| T11: Sidebar Update | 1 modification | ✅ Granular |

**Granularity check**: All 11 tasks are atomic ✅

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
|------|----------------------|---------------|--------|
| T1 | None | None | ✅ Match |
| T2 | T1 | T1 | ✅ Match |
| T3 | T1, T2 | Phase 2 (after T2) | ✅ Match |
| T4 | T3 | Phase 2 (after T3) | ✅ Match |
| T5 | T3 | Phase 2 (after T3) | ✅ Match |
| T6 | T3, T4, T5 | Phase 3 (after T5) | ✅ Match |
| T7 | T2, T6 | Phase 3 (after T6) | ✅ Match |
| T8 | T2 | Phase 3 (after T6) | ✅ Match |
| T9 | T8 | Phase 3 (after T8) | ✅ Match |
| T10 | T7, T9 | Phase 4 (after T9) | ✅ Match |
| T11 | T10 | Phase 4 (after T10) | ✅ Match |

**Cross-check**: All dependencies match ✅

---

## Test Co-location Validation

| Task | Code Layer Created | Matrix Requires | Task Says | Status |
|------|-------------------|-----------------|-----------|--------|
| T1 | Schema | none | none | ✅ OK |
| T2 | Types | none | none | ✅ OK |
| T3 | API Route | unit | unit | ✅ OK |
| T4 | API Route | unit | unit | ✅ OK |
| T5 | API Route | unit | unit | ✅ OK |
| T6 | Hook | unit | unit | ✅ OK |
| T7 | Component | unit | unit | ✅ OK |
| T8 | Component | unit | unit | ✅ OK |
| T9 | Component | unit | unit | ✅ OK |
| T10 | Page | none | none | ✅ OK |
| T11 | Sidebar (modify) | none | none | ✅ OK |

**Test co-location**: All tasks valid ✅

---

## Summary

- **Total Tasks**: 11
- **Phases**: 4
- **Estimated Tests**: 32+ unit tests
- **Commit Messages**:
  - T1: `feat(budget): add Budget model to Prisma schema`
  - T2: `feat(budget): add budget types`
  - T3: `feat(budget): add budget CRUD API route`
  - T4: `feat(budget): add budget summary API`
  - T5: `feat(budget): add budget history API`
  - T6: `feat(budget): add useBudgets hooks`
  - T7: `feat(budget): add BudgetForm component`
  - T8: `feat(budget): add BudgetCard component`
  - T9: `feat(budget): add BudgetOverview component`
  - T10: `feat(budget): add BudgetPage`
  - T11: `feat(layout): add Orçamento link to sidebar`
