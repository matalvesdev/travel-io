# User Module Tasks

## Execution Protocol (MANDATORY)

Implement these tasks with the `tlc-spec-driven` skill: **activate it by name and follow its Execute flow and Critical Rules.** Do not search for skill files by filesystem path. The skill is the source of truth for the full flow (per-task cycle, sub-agent delegation, adequacy review, Verifier, discrimination sensor).

**If the skill cannot be activated, STOP and tell the user — do not proceed without it.**

---

**Design**: `.specs/features/user-module/design.md`
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
| Integration | integration | API + DB flows | `src/__tests__/integration/**/*.test.ts` | `npm run test:integration` |

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

Backend endpoints for user operations.

```
T3 → T4 → T5 → T6
```

### Phase 3: Hooks & Components

Frontend hooks and reusable components.

```
T7 → T8 → T9 → T10
```

### Phase 4: Pages & Integration

UI pages and final integration.

```
T11 → T12
```

---

## Task Breakdown

### T1: Update Prisma Schema with Account Fields

**What**: Add `emailVerified`, `accountStatus`, `deletedAt` fields to Profile model
**Where**: `apps/web/prisma/schema.prisma`
**Depends on**: None
**Reuses**: Existing Profile model
**Requirement**: USER-02

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Profile model has `emailVerified Boolean @default(false)`
- [ ] Profile model has `accountStatus String @default("active")`
- [ ] Profile model has `deletedAt DateTime?`
- [ ] No TypeScript errors after `npx prisma generate`
- [ ] Gate check passes: `npm run build`

**Tests**: none (schema only)
**Gate**: build

---

### T2: Update User Types

**What**: Add new types for account deletion, data export, email change
**Where**: `apps/web/src/types/user.ts`
**Depends on**: T1
**Reuses**: Existing `types/shared.ts` patterns

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `AccountDeletionRequest` type defined
- [ ] `DataExportLog` type defined
- [ ] `ChangeEmailRequest` type defined
- [ ] `AccountStatus` enum defined
- [ ] Types exported from `types/index.ts`

**Tests**: none (types only)
**Gate**: build

---

### T3: Create Account Deletion API Route

**What**: POST `/api/user/delete-account` with soft delete logic
**Where**: `apps/web/src/app/api/user/delete-account/route.ts`
**Depends on**: T1, T2
**Reuses**: `authenticatedHandler` from `lib/api/supabase-helpers.ts`

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] POST endpoint validates request
- [ ] Sets `accountStatus: 'deleted'` and `deletedAt: now()`
- [ ] Invalidates user session via Supabase
- [ ] Creates audit log entry
- [ ] Returns success response
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 4+ tests (valid, invalid, already deleted, audit log)

**Tests**: unit
**Gate**: quick

---

### T4: Create Data Export API Route

**What**: POST `/api/user/export-data` generates JSON with all user data
**Where**: `apps/web/src/app/api/user/export-data/route.ts`
**Depends on**: T1, T2
**Reuses**: `authenticatedHandler`, Prisma queries

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] POST endpoint fetches all user data from Prisma
- [ ] Includes profile, transactions, investments, trips, goals
- [ ] Masks sensitive fields (passwords, tokens)
- [ ] Returns JSON with download headers
- [ ] Logs export request in audit trail
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 3+ tests (success, empty data, audit log)

**Tests**: unit
**Gate**: quick

---

### T5: Create Change Email API Route

**What**: POST `/api/user/change-email` with confirmation flow
**Where**: `apps/web/src/app/api/user/change-email/route.ts`
**Depends on**: T1, T2
**Reuses**: `authenticatedHandler`, Supabase auth

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] POST endpoint validates new email format
- [ ] Checks email not already in use
- [ ] Calls `supabase.auth.updateUser({ email })`
- [ ] Returns success with confirmation message
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 4+ tests (success, invalid email, duplicate, validation)

**Tests**: unit
**Gate**: quick

---

### T6: Create Admin Users List API Route

**What**: GET `/api/admin/users` with pagination and search
**Where**: `apps/web/src/app/api/admin/users/route.ts`
**Depends on**: T1, T2
**Reuses**: `authenticatedHandler`, Prisma pagination

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] GET endpoint paginates users (default 20 per page)
- [ ] Supports search by name/email
- [ ] Returns user list with profile data
- [ ] Validates admin role
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 4+ tests (pagination, search, empty, unauthorized)

**Tests**: unit
**Gate**: quick

---

### T7: Create useDeleteAccount Hook

**What**: React Query mutation hook for account deletion
**Where**: `apps/web/src/hooks/api/use-user.ts`
**Depends on**: T3
**Reuses**: `useQuery`, `useMutation` patterns from `use-profile.ts`

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `useDeleteAccount()` hook defined
- [ ] Calls POST `/api/user/delete-account`
- [ ] Invalidates profile query on success
- [ ] Returns mutation state
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 2+ tests (success, error)

**Tests**: unit
**Gate**: quick

---

### T8: Create useExportData Hook

**What**: React Query mutation hook for data export
**Where**: `apps/web/src/hooks/api/use-user.ts`
**Depends on**: T4
**Reuses**: `useMutation` patterns

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `useExportData()` hook defined
- [ ] Calls POST `/api/user/export-data`
- [ ] Handles blob download
- [ ] Returns mutation state
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 2+ tests (success, error)

**Tests**: unit
**Gate**: quick

---

### T9: Create useChangeEmail Hook

**What**: React Query mutation hook for email change
**Where**: `apps/web/src/hooks/api/use-user.ts`
**Depends on**: T5
**Reuses**: `useMutation` patterns

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] `useChangeEmail()` hook defined
- [ ] Calls POST `/api/user/change-email`
- [ ] Returns mutation state
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 2+ tests (success, error)

**Tests**: unit
**Gate**: quick

---

### T10: Create UserAvatar Component

**What**: Reusable avatar component with image or initials fallback
**Where**: `apps/web/src/components/user/user-avatar.tsx`
**Depends on**: None
**Reuses**: `@/components/ui/avatar`

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Component accepts `src`, `name`, `size` props
- [ ] Shows image when `src` provided
- [ ] Shows initials when no `src`
- [ ] Supports sm/md/lg sizes
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 4+ tests (image, initials, sizes, fallback)

**Tests**: unit
**Gate**: quick

---

### T11: Create DeleteAccountModal Component

**What**: Confirmation modal for account deletion with password input
**Where**: `apps/web/src/components/user/delete-account-modal.tsx`
**Depends on**: T7, T10
**Reuses**: `@/components/ui/dialog`, `useDeleteAccount`

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Modal shows warning message
- [ ] Requires password confirmation
- [ ] Calls `useDeleteAccount` on confirm
- [ ] Shows loading state during deletion
- [ ] Closes and redirects on success
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 4+ tests (open, confirm, loading, error)

**Tests**: unit
**Gate**: quick

---

### T12: Create ExportDataModal Component

**What**: Modal to request and download data export
**Where**: `apps/web/src/components/user/export-data-modal.tsx`
**Depends on**: T8
**Reuses**: `@/components/ui/dialog`, `useExportData`

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Modal explains what data is included
- [ ] Shows "Gerar Exportação" button
- [ ] Calls `useExportData` on click
- [ ] Shows download link when ready
- [ ] Handles large data with loading state
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 3+ tests (open, generate, download)

**Tests**: unit
**Gate**: quick

---

### T13: Create AccountSettings Component

**What**: Account management panel with delete, export, email change
**Where**: `apps/web/src/components/user/account-settings.tsx`
**Depends on**: T11, T12
**Reuses**: `DeleteAccountModal`, `ExportDataModal`, `useChangeEmail`

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Shows "Excluir Conta" button (opens DeleteAccountModal)
- [ ] Shows "Exportar Dados" button (opens ExportDataModal)
- [ ] Shows "Mudar Email" form with validation
- [ ] Uses sonner for feedback
- [ ] Unit tests pass: `npm run test:unit`
- [ ] Test count: 5+ tests (all buttons, email validation, success/error)

**Tests**: unit
**Gate**: quick

---

### T14: Update Profile Page with AccountSettings

**What**: Add AccountSettings section to profile page
**Where**: `apps/web/src/app/(app)/profile/page.tsx`
**Depends on**: T13
**Reuses**: Existing profile page, `AccountSettings`

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] AccountSettings section added to profile page
- [ ] Section shows below personal data
- [ ] Styled consistently with existing page
- [ ] Build passes: `npm run build`

**Tests**: none (integration only)
**Gate**: build

---

### T15: Create Admin Users Page

**What**: Admin page to list and manage users
**Where**: `apps/web/src/app/(app)/admin/users/page.tsx`
**Depends on**: T6
**Reuses**: Existing admin page patterns

**Tools**:
- MCP: NONE
- Skill: NONE

**Done when**:
- [ ] Page shows paginated user list
- [ ] Search input filters by name/email
- [ ] Click on user shows details modal
- [ ] Admin-only access enforced
- [ ] Build passes: `npm run build`

**Tests**: none (integration only)
**Gate**: build

---

## Phase Execution Map

```
Phase 1 → Phase 2 → Phase 3 → Phase 4

Phase 1:  T1 ──→ T2
Phase 2:  T3 ──→ T4 ──→ T5 ──→ T6
Phase 3:  T7 ──→ T8 ──→ T9 ──→ T10
Phase 4:  T11 ──→ T12 ──→ T13 ──→ T14 ──→ T15
```

---

## Task Granularity Check

| Task | Scope | Status |
|------|-------|--------|
| T1: Update Prisma Schema | 1 model | ✅ Granular |
| T2: Update User Types | 1 file | ✅ Granular |
| T3: Account Deletion API | 1 endpoint | ✅ Granular |
| T4: Data Export API | 1 endpoint | ✅ Granular |
| T5: Change Email API | 1 endpoint | ✅ Granular |
| T6: Admin Users API | 1 endpoint | ✅ Granular |
| T7: useDeleteAccount Hook | 1 hook | ✅ Granular |
| T8: useExportData Hook | 1 hook | ✅ Granular |
| T9: useChangeEmail Hook | 1 hook | ✅ Granular |
| T10: UserAvatar Component | 1 component | ✅ Granular |
| T11: DeleteAccountModal | 1 component | ✅ Granular |
| T12: ExportDataModal | 1 component | ✅ Granular |
| T13: AccountSettings | 1 component | ✅ Granular |
| T14: Update Profile Page | 1 modification | ✅ Granular |
| T15: Admin Users Page | 1 page | ✅ Granular |

**Granularity check**: All 15 tasks are atomic ✅

---

## Diagram-Definition Cross-Check

| Task | Depends On (task body) | Diagram Shows | Status |
|------|----------------------|---------------|--------|
| T1 | None | None | ✅ Match |
| T2 | T1 | T1 | ✅ Match |
| T3 | T1, T2 | Phase 2 (after T2) | ✅ Match |
| T4 | T1, T2 | Phase 2 (after T2) | ✅ Match |
| T5 | T1, T2 | Phase 2 (after T2) | ✅ Match |
| T6 | T1, T2 | Phase 2 (after T2) | ✅ Match |
| T7 | T3 | Phase 3 (after T3) | ✅ Match |
| T8 | T4 | Phase 3 (after T4) | ✅ Match |
| T9 | T5 | Phase 3 (after T5) | ✅ Match |
| T10 | None | Phase 3 | ✅ Match |
| T11 | T7, T10 | Phase 4 (after T7, T10) | ✅ Match |
| T12 | T8 | Phase 4 (after T8) | ✅ Match |
| T13 | T11, T12 | Phase 4 (after T11, T12) | ✅ Match |
| T14 | T13 | Phase 4 (after T13) | ✅ Match |
| T15 | T6 | Phase 4 (after T6) | ✅ Match |

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
| T6 | API Route | unit | unit | ✅ OK |
| T7 | Hook | unit | unit | ✅ OK |
| T8 | Hook | unit | unit | ✅ OK |
| T9 | Hook | unit | unit | ✅ OK |
| T10 | Component | unit | unit | ✅ OK |
| T11 | Component | unit | unit | ✅ OK |
| T12 | Component | unit | unit | ✅ OK |
| T13 | Component | unit | unit | ✅ OK |
| T14 | Page (modify) | none | none | ✅ OK |
| T15 | Page | none | none | ✅ OK |

**Test co-location**: All tasks valid ✅

---

## Summary

- **Total Tasks**: 15
- **Phases**: 4
- **Estimated Tests**: 40+ unit tests
- **Commit Messages**:
  - T1: `feat(user): add account fields to Prisma schema`
  - T2: `feat(user): add user types for account management`
  - T3: `feat(user): add account deletion API route`
  - T4: `feat(user): add data export API route`
  - T5: `feat(user): add change email API route`
  - T6: `feat(admin): add users list API route`
  - T7: `feat(user): add useDeleteAccount hook`
  - T8: `feat(user): add useExportData hook`
  - T9: `feat(user): add useChangeEmail hook`
  - T10: `feat(user): add UserAvatar component`
  - T11: `feat(user): add DeleteAccountModal component`
  - T12: `feat(user): add ExportDataModal component`
  - T13: `feat(user): add AccountSettings component`
  - T14: `feat(user): integrate AccountSettings in profile page`
  - T15: `feat(admin): add admin users page`
