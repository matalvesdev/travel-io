# Shopping Improvements Tasks

## Execution Protocol (MANDATORY -- do not skip)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.**

---

**Spec**: `.specs/features/shopping-improvements/spec.md`
**Status**: Complete

---

## Test Coverage Matrix

> Generated from codebase, project guidelines, and spec — confirm before Execute. Guidelines found: none — strong defaults applied.

| Code Layer | Required Test Type | Coverage Expectation | Location Pattern | Run Command |
|------------|-------------------|---------------------|------------------|-------------|
| Components | unit | Component renders correctly, handles props | `src/components/shopping/*.test.tsx` | `npm run test` |
| Hooks | unit | Returns correct data, handles loading/error | `src/hooks/api/*.test.ts` | `npm run test` |
| API Routes | integration | Happy path + error handling | `src/app/api/shopping/**/*.test.ts` | `npm run test` |

## Gate Check Commands

> Generated from codebase — confirm before Execute.

| Gate Level | When to Use | Command |
|------------|-------------|---------|
| Quick | After tasks with unit tests only | `npm run test -- --passWithNoTests` |
| Full | After tasks with integration tests | `npm run test` |
| Build | After phase completion | `npm run build` |

---

## Execution Plan

### Phase 1: Toast System & Button Feedback ✅ COMPLETE

Tasks that must be done first, in order.

```
T1 → T2 → T3
```

### Phase 2: Product Reviews & Reliability ✅ COMPLETE

Builds on the foundation.

```
T4 → T5 → T6
```

### Phase 3: Enhanced Wishlist with Price Tracking ✅ COMPLETE

Final integration.

```
T7 → T8 → T9 → T10
```

---

## Task Breakdown

### T1: Add Toast Notifications to Shopping Components

**What**: Import sonner toast and add to search-panel, monitors-panel, and wishlist-panel
**Where**: `apps/web/src/components/shopping/search-panel.tsx`, `monitors-panel.tsx`, `wishlist-panel.tsx`
**Depends on**: None
**Reuses**: Existing sonner toast pattern from trips page
**Requirement**: SHOP-01, SHOP-02, SHOP-03

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `import { toast } from 'sonner'` added to each component
- [x] Wishlist button shows toast "Adicionado à wishlist!" on success
- [x] Monitor add shows toast "Monitor adicionado!" on success
- [x] Delete wishlist item shows toast "Removido da wishlist"
- [x] Delete monitor shows toast "Monitor removido"

**Tests**: unit
**Gate**: quick

---

### T2: Add Toast to "Verificar Agora" Button

**What**: Create a "Verificar Agora" button in monitors panel that checks prices via scraper API
**Where**: `apps/web/src/components/shopping/monitors-panel.tsx`
**Depends on**: T1
**Reuses**: Existing scraper API endpoint
**Requirement**: SHOP-04

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] "Verificar Agora" button added to each monitor item
- [x] Button calls scraper API with product URL
- [x] Shows toast with results count
- [x] Shows toast "X produtos abaixo da meta!" when price drops below target

**Tests**: unit
**Gate**: quick

---

### T3: Add Store Reputation Scores

**What**: Create STORE_REPUTATION constant and utility function for reliability calculation
**Where**: `apps/web/src/lib/shopping/reliability.ts` (new)
**Depends on**: None
**Reuses**: None
**Requirement**: SHOP-05, SHOP-06

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] `STORE_REPUTATION` map created: Amazon 4.7, ML 4.5, Magalu 4.3, CB 4.0, AliExpress 3.8, Shopee 3.9, Netshoes 4.2
- [x] `calcReliability(store, condition, price, avgPrice)` function created
- [x] Returns 0-100 score based on: store reputation + condition + price vs market average
- [x] No TypeScript errors

**Tests**: unit
**Gate**: quick

---

### T4: Create Product Detail Panel Component

**What**: Create a slide-out detail panel for products showing reviews and reliability
**Where**: `apps/web/src/components/shopping/product-detail-panel.tsx` (new)
**Depends on**: T3
**Reuses**: Card components, formatCurrency utility
**Requirement**: SHOP-07

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] ProductDetailPanel component created
- [x] Shows star rating based on store reputation (synthetic)
- [x] Shows store reputation bar
- [x] Shows reliability score (0-100) with color coding
- [x] Shows condition badge (Novo/Seminovo/Usado)
- [x] Shows synthetic reviews section

**Tests**: unit
**Gate**: quick

---

### T5: Integrate Detail Panel with Search Results

**What**: Add click handler to product cards in search results to open detail panel
**Where**: `apps/web/src/components/shopping/search-panel.tsx`
**Depends on**: T4
**Reuses**: ProductDetailPanel component
**Requirement**: SHOP-07

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Product cards are clickable
- [x] Clicking opens ProductDetailPanel with product data
- [x] Panel shows all required information
- [x] Panel can be closed

**Tests**: unit
**Gate**: quick

---

### T6: Add Reliability Badge to Comparison Table

**What**: Add reliability score badge to price comparison table rows
**Where**: `apps/web/src/components/shopping/price-comparison.tsx`
**Depends on**: T3
**Reuses**: calcReliability function
**Requirement**: SHOP-08

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Each row in price comparison shows mini reliability badge
- [x] Badge color-coded: green ≥80, amber ≥60, red <60
- [x] Badge shows score number
- [x] Uses Shield icon from lucide-react

**Tests**: unit
**Gate**: quick

---

### T7: Add Inline Target Price Edit to Wishlist

**What**: Add inline editing for target price in wishlist items
**Where**: `apps/web/src/components/shopping/wishlist-panel.tsx`
**Depends on**: T1
**Reuses**: Input component
**Requirement**: SHOP-09

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Wishlist items show target price with "Meta:" label
- [x] Clicking on target price enables inline edit
- [x] Can save new target price
- [x] Shows "✓ Abaixo!" when current price ≤ target price

**Tests**: unit
**Gate**: quick

---

### T8: Add Price Tracking to Wishlist

**What**: Add price checking functionality to wishlist items
**Where**: `apps/web/src/components/shopping/wishlist-panel.tsx`
**Depends on**: T7
**Reuses**: Scraper API
**Requirement**: SHOP-10

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Each wishlist item has "Verificar Preço" button
- [x] Button calls scraper API with product URL
- [x] Updates current price if found
- [x] Shows toast with results

**Tests**: unit
**Gate**: quick

---

### T9: Update Shopping API Routes

**What**: Ensure API routes support new functionality (price checking, reliability)
**Where**: `apps/web/src/app/api/shopping/**/*.ts`
**Depends on**: T3
**Reuses**: Existing API patterns
**Requirement**: SHOP-04, SHOP-06

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] API route for price checking exists
- [x] Returns reliability score data
- [x] Handles errors gracefully
- [x] No TypeScript errors

**Tests**: integration
**Gate**: full

---

### T10: Write Unit Tests

**What**: Write unit tests for all new functionality
**Where**: `apps/web/src/__tests__/shopping/`
**Depends on**: All previous tasks
**Reuses**: Existing test patterns
**Requirement**: All

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [x] Tests for reliability calculation
- [x] Tests for toast notifications
- [x] Tests for price checking
- [x] All tests pass
- [x] Coverage meets minimum threshold

**Tests**: unit
**Gate**: full

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3

Phase 1:  T1 ──→ T2 ──→ T3
Phase 2:  T4 ──→ T5 ──→ T6
Phase 3:  T7 ──→ T8 ──→ T9 ──→ T10
```

Execution is strictly sequential — there is no intra-phase parallelism.

---

## Task Granularity Check

| Task | Scope | Status |
|------|-------|--------|
| T1: Add Toast Notifications | 3 component modifications | ✅ Granular |
| T2: Add Toast to "Verificar Agora" | 1 component modification | ✅ Granular |
| T3: Add Store Reputation Scores | 1 new file | ✅ Granular |
| T4: Create Product Detail Panel | 1 new component | ✅ Granular |
| T5: Integrate Detail Panel | 1 component modification | ✅ Granular |
| T6: Add Reliability Badge | 1 component modification | ✅ Granular |
| T7: Add Inline Target Price Edit | 1 component modification | ✅ Granular |
| T8: Add Price Tracking | 1 component modification | ✅ Granular |
| T9: Update Shopping API Routes | 1-2 API routes | ✅ Granular |
| T10: Write Unit Tests | 1 test file | ✅ Granular |

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
|------|----------------------|---------------|--------|
| T1 | None | Phase 1 start | ✅ Match |
| T2 | T1 | T1 → T2 | ✅ Match |
| T3 | None | Phase 1 after T1 | ✅ Match |
| T4 | T3 | Phase 2 after T3 | ✅ Match |
| T5 | T4 | T2 → T5 | ✅ Match |
| T6 | T3 | Phase 2 after T3 | ✅ Match |
| T7 | T1 | Phase 3 after T1 | ✅ Match |
| T8 | T7 | T7 → T8 | ✅ Match |
| T9 | T3 | Phase 3 after T3 | ✅ Match |
| T10 | All | Final | ✅ Match |

---

## Test Co-location Validation

| Task | Code Layer Created/Modified | Matrix Requires | Task Says | Status |
|------|---------------------------|-----------------|-----------|--------|
| T1 | Components | unit | unit | ✅ OK |
| T2 | Component | unit | unit | ✅ OK |
| T3 | Utility | unit | unit | ✅ OK |
| T4 | Component | unit | unit | ✅ OK |
| T5 | Component | unit | unit | ✅ OK |
| T6 | Component | unit | unit | ✅ OK |
| T7 | Component | unit | unit | ✅ OK |
| T8 | Component | unit | unit | ✅ OK |
| T9 | API Routes | integration | integration | ✅ OK |
| T10 | Tests | unit | unit | ✅ OK |