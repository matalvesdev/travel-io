# Bookings Module Tasks

## Execution Protocol (MANDATORY)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.**

---

**Design**: `.specs/features/bookings-module/design.md`
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

Backend endpoints for booking operations.

```
T3 → T4 → T5 → T6
```

### Phase 3: Hooks & Components

Frontend hooks and reusable components.

```
T7 → T8 → T9 → T10 → T11
```

### Phase 4: Pages & Integration

UI pages and final integration.

```
T12 → T13
```

---

## Task Breakdown

### T1: Update Prisma Schema with Booking Model

**What**: Add Booking model with relations to Trip
**Where**: `apps/web/prisma/schema.prisma`
**Depends on**: None
**Reuses**: Existing Trip model
**Requirement**: BOOK-01

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Booking model defined with all fields from design
- [ ] Trip model extended with bookings relation
- [ ] No TypeScript errors after `npx prisma generate`
- [ ] Gate check passes: `npm run build`

**Tests**: none (schema only)
**Gate**: build

---

### T2: Update Booking Types

**What**: Add new types for booking CRUD operations
**Where**: `apps/web/src/types/booking.ts` (novo)
**Depends on**: T1
**Reuses**: Existing `types/shared.ts` patterns

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `Booking` interface defined
- [ ] `CreateBookingInput` type defined
- [ ] `UpdateBookingInput` type defined
- [ ] `BookingStatus` enum defined
- [ ] Types exported from `types/index.ts`

**Tests**: none (types only)
**Gate**: build

---

### T3: Create Bookings API Route (CRUD)

**What**: GET/POST/PUT/DELETE `/api/trips/[id]/bookings`
**Where**: `apps/web/src/app/api/trips/[id]/bookings/route.ts`
**Depends on**: T1, T2
**Reuses**: `authenticatedHandler` from `lib/api/supabase-helpers.ts`

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] GET returns all bookings for trip
- [ ] POST creates new booking with validation
- [ ] PUT updates existing booking
- [ ] DELETE removes booking
- [ ] All endpoints validate trip ownership
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 6+ tests (CRUD + validation + ownership)

**Tests**: unit
**Gate**: quick

---

### T4: Create Booking Status API Route

**What**: PATCH `/api/trips/[id]/bookings/[bookingId]/status`
**Where**: `apps/web/src/app/api/trips/[id]/bookings/[bookingId]/status/route.ts`
**Depends on**: T3
**Reuses**: `authenticatedHandler`

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] PATCH endpoint updates booking status
- [ ] Validates status transitions
- [ ] Returns updated booking
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 4+ tests (success, invalid status, not found, unauthorized)

**Tests**: unit
**Gate**: quick

---

### T5: Create Booking Financial Summary API

**What**: GET `/api/trips/[id]/bookings/summary`
**Where**: `apps/web/src/app/api/trips/[id]/bookings/summary/route.ts`
**Depends on**: T3
**Reuses**: `authenticatedHandler`, Prisma aggregation

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] GET returns total spent, count by type
- [ ] Includes budget comparison
- [ ] Handles null prices gracefully
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 3+ tests (success, empty, with budget)

**Tests**: unit
**Gate**: quick

---

### T6: Create useBookings Hook

**What**: React Query hooks for booking CRUD
**Where**: `apps/web/src/hooks/api/use-bookings.ts`
**Depends on**: T3, T4, T5
**Reuses**: `useQuery`, `useMutation` patterns

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `useBookings(tripId)` hook defined
- [ ] `useCreateBooking()` hook defined
- [ ] `useUpdateBooking()` hook defined
- [ ] `useCancelBooking()` hook defined
- [ ] `useBookingSummary(tripId)` hook defined
- [ ] All hooks invalidate relevant queries
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 5+ tests (one per hook)

**Tests**: unit
**Gate**: quick

---

### T7: Create BookingForm Component

**What**: Form to create/edit a booking
**Where**: `apps/web/src/components/bookings/booking-form.tsx`
**Depends on**: T2, T6
**Reuses**: Form patterns from profile page

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Form supports both flight and hotel types
- [ ] Flight fields: airline, flightNumber, origin, destination, dates, times
- [ ] Hotel fields: name, address, checkIn, checkOut, nights, roomType
- [ ] Common fields: confirmationCode, notes, price, currency
- [ ] Form validation for required fields
- [ ] Submit button with loading state
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 5+ tests (render, validation, submit, edit mode, cancel)

**Tests**: unit
**Gate**: quick

---

### T8: Create BookingCard Component

**What**: Display a single booking with key details
**Where**: `apps/web/src/components/bookings/booking-card.tsx`
**Depends on**: T2
**Reuses**: Card component, Badge component

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Shows booking type icon (flight/hotel)
- [ ] Shows confirmation code prominently
- [ ] Shows status badge (confirmed/cancelled)
- [ ] Shows key details based on type
- [ ] Edit and Cancel buttons
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 4+ tests (flight, hotel, status, buttons)

**Tests**: unit
**Gate**: quick

---

### T9: Create BookingsList Component

**What**: List all bookings for a trip, grouped by type
**Where**: `apps/web/src/components/bookings/bookings-list.tsx`
**Depends on**: T8
**Reuses**: `BookingCard`

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Groups bookings by type (flights/hotels)
- [ ] Shows section headers with count
- [ ] Empty state with "Registrar primeira reserva" button
- [ ] Loading state
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 4+ tests (grouping, empty, loading, buttons)

**Tests**: unit
**Gate**: quick

---

### T10: Create CancelBookingModal Component

**What**: Confirmation modal for booking cancellation
**Where**: `apps/web/src/components/bookings/cancel-booking-modal.tsx`
**Depends on**: T6
**Reuses**: Dialog component patterns

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Shows warning message
- [ ] Requires confirmation
- [ ] Calls `useCancelBooking` on confirm
- [ ] Shows loading state
- [ ] Closes on success
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 3+ tests (open, confirm, loading)

**Tests**: unit
**Gate**: quick

---

### T11: Create BookingsPage Component

**What**: Main bookings page for a trip
**Where**: `apps/web/src/app/(app)/trips/[id]/bookings/page.tsx`
**Depends on**: T7, T9, T10
**Reuses**: `BookingsList`, `BookingForm`, `CancelBookingModal`

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Shows trip header with destination and dates
- [ ] Shows financial summary (total spent vs budget)
- [ ] "Registrar Reserva" button opens form
- [ ] Bookings list with create/edit/cancel
- [ ] Responsive design
- [ ] Build passes: `npm run build`

**Tests**: none (integration only)
**Gate**: build

---

### T12: Update Trip Detail with Bookings Link

**What**: Add "Reservas" tab to trip detail page
**Where**: `apps/web/src/app/(app)/trips/[id]/page.tsx`
**Depends on**: T11
**Reuses**: Existing trip detail page

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] "Reservas" tab added to trip navigation
- [ ] Tab shows booking count badge
- [ ] Click navigates to bookings page
- [ ] Build passes: `npm run build`

**Tests**: none (integration only)
**Gate**: build

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1 ──→ T2
Phase 2:  T3 ──→ T4 ──→ T5
Phase 3:  T6 ──→ T7 ──→ T8 ──→ T9 ──→ T10
Phase 4:  T11 ──→ T12
```

---

## Task Granularity Check

| Task | Scope | Status |
|------|-------|--------|
| T1: Update Prisma Schema | 1 model | ✅ Granular |
| T2: Update Booking Types | 1 file | ✅ Granular |
| T3: Bookings API Route | 1 endpoint | ✅ Granular |
| T4: Booking Status API | 1 endpoint | ✅ Granular |
| T5: Booking Summary API | 1 endpoint | ✅ Granular |
| T6: useBookings Hook | 1 hook file | ✅ Granular |
| T7: BookingForm | 1 component | ✅ Granular |
| T8: BookingCard | 1 component | ✅ Granular |
| T9: BookingsList | 1 component | ✅ Granular |
| T10: CancelBookingModal | 1 component | ✅ Granular |
| T11: BookingsPage | 1 page | ✅ Granular |
| T12: Trip Detail Update | 1 modification | ✅ Granular |

**Granularity check**: All 12 tasks are atomic ✅

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
| T10 | T6 | Phase 3 (after T6) | ✅ Match |
| T11 | T7, T9, T10 | Phase 4 (after T10) | ✅ Match |
| T12 | T11 | Phase 4 (after T11) | ✅ Match |

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
| T10 | Component | unit | unit | ✅ OK |
| T11 | Page | none | none | ✅ OK |
| T12 | Page (modify) | none | none | ✅ OK |

**Test co-location**: All tasks valid ✅

---

## Summary

- **Total Tasks**: 12
- **Phases**: 4
- **Estimated Tests**: 35+ unit tests
- **Commit Messages**:
  - T1: `feat(bookings): add Booking model to Prisma schema`
  - T2: `feat(bookings): add booking types`
  - T3: `feat(bookings): add bookings CRUD API route`
  - T4: `feat(bookings): add booking status API route`
  - T5: `feat(bookings): add booking financial summary API`
  - T6: `feat(bookings): add useBookings hooks`
  - T7: `feat(bookings): add BookingForm component`
  - T8: `feat(bookings): add BookingCard component`
  - T9: `feat(bookings): add BookingsList component`
  - T10: `feat(bookings): add CancelBookingModal component`
  - T11: `feat(bookings): add BookingsPage`
  - T12: `feat(trips): add Reservas tab to trip detail`
