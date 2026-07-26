# Bookings Module Specification

## Problem Statement

O módulo de viagens atual busca voos e hotéis mas não persiste reservas reais. Usuários clicam em "Reservar" e são redirecionados para sites externos, sem registro do que foi efetivamente reservado, números de confirmação, preços reais ou status da reserva. Isso impossibilita gerenciar viagens de forma completa.

## Goals

- [ ] Usuários podem registrar reservas de voos e hotéis
- [ ] Cada reserva tem status rastreável (pendente, confirmada, cancelada, concluída)
- [ ] Reservas são vinculadas a uma viagem (Trip)
- [ ] Armazenamento de códigos de confirmação e preços reais
- [ ] Página de gerenciamento de reservas

## Out of Scope

| Feature | Reason |
|---------|--------|
| Integração com provedores de reserva | Requer parcerias e APIs externas |
| Pagamento integrado | Fora do escopo atual |
| Check-in online | Funcionalidade avançada futura |
| Docs de viagem (passes, e-tickets) | Armazenamento de documentos |

---

## Assumptions & Open Questions

| Assumption | Default | Rationale |
|-----------|---------|-----------|
| Reservas são registradas manualmente pelo usuário | Sim | Sem integração com provedores |
| Status inicial é "confirmed" ao criar | Sim | Usuário só registra o que já reservou |
| Reservas podem ser canceladas | Sim | Permite atualizar status |
| Preço real é opcional | Sim | Usuário pode não lembrar do valor exato |

---

## User Stories

### P1: Create Booking ⭐ MVP

**User Story**: As a traveler, I want to record my flight and hotel bookings so that I can track all my reservations in one place.

**Why P1**: Core functionality - without recording bookings, there's no booking management.

**Acceptance Criteria**:

1. WHEN user clicks "Registrar Reserva" THEN system SHALL show form with booking type (flight/hotel)
2. WHEN user fills booking details THEN system SHALL save with status "confirmed"
3. WHEN booking is saved THEN system SHALL link it to the selected trip
4. WHEN booking has confirmation code THEN system SHALL store it for reference
5. WHEN booking is created THEN system SHALL show success toast

**Independent Test**: Create a flight booking, verify it appears in the bookings list with correct details.

---

### P2: View Bookings List

**User Story**: As a traveler, I want to see all my bookings for a trip so that I can quickly find reservation details.

**Why P2**: Essential for managing multiple bookings per trip.

**Acceptance Criteria**:

1. WHEN user visits /trips/[id]/bookings THEN system SHALL show all bookings for that trip
2. WHEN bookings exist THEN system SHALL display them grouped by type (flights/hotels)
3. WHEN booking has confirmation code THEN system SHALL show it prominently
4. WHEN no bookings exist THEN system SHALL show empty state with "Registrar primeira reserva" button

**Independent Test**: Create 2 bookings, verify both appear in the list with correct grouping.

---

### P3: Edit Booking

**User Story**: As a traveler, I want to update my booking details so that I can correct mistakes or add missing information.

**Why P3**: Users may need to update prices, dates, or confirmation codes after booking.

**Acceptance Criteria**:

1. WHEN user clicks edit on booking THEN system SHALL open edit form pre-filled with current data
2. WHEN user saves changes THEN system SHALL update the booking
3. WHEN user changes status THEN system SHALL reflect the new status
4. WHEN update succeeds THEN system SHALL show success toast

**Independent Test**: Create booking, edit price, verify change is saved.

---

### P4: Cancel Booking

**User Story**: As a traveler, I want to cancel a booking so that I can mark it as no longer active.

**Why P3**: Bookings may be cancelled, and the system should reflect this.

**Acceptance Criteria**:

1. WHEN user clicks "Cancelar Reserva" THEN system SHALL show confirmation modal
2. WHEN user confirms cancellation THEN system SHALL update status to "cancelled"
3. WHEN booking is cancelled THEN system SHALL keep it in list with cancelled badge
4. WHEN cancellation succeeds THEN system SHALL show success toast

**Independent Test**: Create booking, cancel it, verify status changes to "cancelled".

---

### P5: Booking Financial Summary

**User Story**: As a traveler, I want to see total spent on bookings vs budget so that I can track my travel spending.

**Why P3**: Important for budget management.

**Acceptance Criteria**:

1. WHEN bookings have prices THEN system SHALL calculate total cost
2. WHEN trip has budget THEN system SHALL show spent vs remaining
3. WHEN total exceeds budget THEN system SHALL show warning

**Independent Test**: Create bookings with prices, verify total matches sum.

---

## Edge Cases

- WHEN user tries to create booking without selecting trip THEN system SHALL require trip selection
- WHEN user enters invalid dates THEN system SHALL show validation error
- WHEN booking price is 0 THEN system SHALL accept it (free booking)
- WHEN trip is deleted THEN system SHALL cascade delete bookings

---

## Requirement Traceability

| ID | Story | Phase | Status |
|----|-------|-------|--------|
| BOOK-01 | P1: Create booking form | Design | Pending |
| BOOK-02 | P1: Save booking with status | Design | Pending |
| BOOK-03 | P1: Link booking to trip | Design | Pending |
| BOOK-04 | P1: Store confirmation code | Design | Pending |
| BOOK-05 | P2: Bookings list page | Design | Pending |
| BOOK-06 | P2: Group by type | Design | Pending |
| BOOK-07 | P3: Edit booking form | Design | Pending |
| BOOK-08 | P4: Cancel booking | Design | Pending |
| BOOK-09 | P5: Financial summary | Design | Pending |

---

## Success Criteria

- [ ] User can create a booking in < 30 seconds
- [ ] Bookings list loads in < 1 second
- [ ] All bookings linked to correct trip
- [ ] Status changes are reflected immediately
- [ ] Financial summary matches booking prices
