# User Module Specification

## Problem Statement

O Travel.io possui funcionalidades básicas de perfil, mas falta conformidade com LGPD e funcionalidades essenciais de gestão de conta. Usuários não podem exportar dados, excluir contas, ou mudar email — requisitos legais e de UX importantes.

## Goals

- [ ] Usuários podem excluir sua conta (LGPD compliance)
- [ ] Usuários podem exportar seus dados (LGPD portability)
- [ ] Usuários podem mudar o email da conta
- [ ] Componentes reutilizáveis para avatar e perfil
- [ ] Admin pode listar e gerenciar usuários

## Out of Scope

| Feature | Reason |
|---------|--------|
| MFA/2FA | Complexidade adicional, pode ser futuro |
| Perfis públicos | Não é requisito atual |
| Verificação de email | Supabase já gerencia isso |

---

## Assumptions & Open Questions

| Assumption | Default | Rationale |
|-----------|---------|-----------|
| Exclusão de conta é soft delete | Sim | Permite recuperação dentro de 30 dias |
| Exportação gera JSON | Sim | Formato padronizado, fácil de processar |
| Mudança de email requer confirmação | Sim | Segurança padrão industry |
| Admin pode ver todos os usuários | Sim | Funcionalidade admin padrão |

---

## User Stories

### P1: Account Deletion (LGPD) ⭐ MVP

**User Story**: As a user, I want to delete my account so that I can exercise my right to be forgotten under LGPD.

**Why P1**: LGPD compliance is legally required; non-compliance risks fines.

**Acceptance Criteria**:

1. WHEN user clicks "Excluir Conta" THEN system SHALL show confirmation modal with warning
2. WHEN user confirms deletion THEN system SHALL soft-delete account and invalidate session
3. WHEN account is deleted THEN user SHALL be redirected to login page
4. WHEN user logs in within 30 days THEN system SHALL offer account recovery
5. WHEN 30 days pass THEN system SHALL permanently delete all user data

**Independent Test**: Click "Excluir Conta", confirm, verify redirect and session invalidation.

---

### P2: Data Export (LGPD)

**User Story**: As a user, I want to export all my data so that I can exercise my right to data portability under LGPD.

**Why P2**: LGPD compliance requirement; important for user trust.

**Acceptance Criteria**:

1. WHEN user clicks "Exportar Dados" THEN system SHALL generate JSON with all user data
2. WHEN export is ready THEN system SHALL provide download link
3. WHEN export contains sensitive data THEN system SHALL mask passwords/tokens
4. WHEN export is requested THEN system SHALL log the request in audit trail

**Independent Test**: Request export, download JSON, verify contains profile, transactions, investments, trips.

---

### P3: Change Email

**User Story**: As a user, I want to change my account email so that I can update my contact information.

**Why P2**: Common user need; improves account management.

**Acceptance Criteria**:

1. WHEN user enters new email THEN system SHALL send confirmation to new email
2. WHEN user confirms via link THEN system SHALL update email
3. WHEN email is already in use THEN system SHALL show error message
4. WHEN change is pending THEN system SHALL show "Email não confirmado" status

**Independent Test**: Change email, check inbox for confirmation, verify email updated.

---

### P4: Reusable User Components

**User Story**: As a developer, I want reusable user components so that UI is consistent across the app.

**Why P2**: Code quality and consistency.

**Acceptance Criteria**:

1. WHEN `<UserAvatar>` is rendered THEN system SHALL show user image or initials fallback
2. WHEN `<UserProfileCard>` is rendered THEN system SHALL display name, email, plan badge
3. WHEN `<AccountSettings>` is rendered THEN system SHALL show all account management options

**Independent Test**: Import and render each component, verify props work correctly.

---

### P5: Admin User Management

**User Story**: As an admin, I want to list and manage users so that I can support users and manage the platform.

**Why P3**: Nice-to-have for admin functionality.

**Acceptance Criteria**:

1. WHEN admin visits /admin/users THEN system SHALL show paginated user list
2. WHEN admin searches THEN system SHALL filter users by name/email
3. WHEN admin clicks user THEN system SHALL show user details modal
4. WHEN admin deactivates user THEN system SHALL prevent login

**Independent Test**: Login as admin, navigate to /admin/users, search and view user details.

---

## Edge Cases

- WHEN user has active subscriptions THEN system SHALL warn before deletion
- WHEN user data is large THEN export SHALL use background job
- WHEN email change fails THEN system SHALL keep old email active
- WHEN admin deactivates self THEN system SHALL prevent action

---

## Requirement Traceability

| ID | Story | Phase | Status |
|----|-------|-------|--------|
| USER-01 | P1: Delete account modal | Implementing | ✅ Verified |
| USER-02 | P1: Soft delete logic | Implementing | ✅ Verified |
| USER-03 | P1: Session invalidation | Implementing | ✅ Verified |
| USER-04 | P1: Recovery within 30 days | - | Deferred |
| USER-05 | P2: Generate JSON export | Implementing | ✅ Verified |
| USER-06 | P2: Download link | Implementing | ✅ Verified |
| USER-07 | P3: Email confirmation flow | Implementing | ✅ Verified |
| USER-08 | P3: Duplicate email check | Implementing | ✅ Verified |
| USER-09 | P4: UserAvatar component | Implementing | ✅ Verified |
| USER-10 | P4: UserProfileCard component | - | Deferred |
| USER-11 | P5: Admin user list | Implementing | ✅ Verified |
| USER-12 | P5: Admin user details | - | Deferred |

---

## Success Criteria

- [ ] User can delete account in < 30 seconds
- [ ] User can export data in < 60 seconds
- [ ] Email change completes in < 2 minutes
- [ ] All components render consistently
- [ ] Admin can manage users without bugs
