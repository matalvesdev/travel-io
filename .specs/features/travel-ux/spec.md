# Travel UX Improvements

## Problem Statement

The travel planner has basic functionality but poor UX: no toast feedback, flight/hotel results lack detail (no images, no duration, no rating stars), itinerary is static, and there's no way to go back to edit selections. The search progress animation is generic.

## Goals

- [ ] Toast feedback for all actions
- [ ] Richer flight cards (airline, duration, stops, price comparison)
- [ ] Richer hotel cards (image, rating stars, address, price per night)
- [ ] Budget tracker showing spent vs remaining
- [ ] Back navigation between steps
- [ ] Interactive itinerary (add/edit/remove activities)
- [ ] Search progress shows real status per source
- [ ] Empty states with helpful messages

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real booking integration | No payment gateway |
| Flight seat selection | Beyond scope |
| Hotel room types | Beyond scope |

## User Stories

### P1: Toast + Navigation + Budget ⭐

1. WHEN user clicks "Buscar" THEN system SHALL show search progress per source
2. WHEN user clicks "Aprovar" THEN system SHALL show toast "Roteiro criado!"
3. WHEN user clicks "Voltar" on any step THEN system SHALL navigate to previous step
4. WHEN user reviews options THEN system SHALL show budget tracker (spent vs remaining)

### P2: Richer Results Cards

1. WHEN flights load THEN each card SHALL show airline logo placeholder, duration, stops, price
2. WHEN hotels load THEN each card SHALL show image placeholder, rating stars, address, price/night
3. WHEN no results THEN system SHALL show empty state with suggestion

### P3: Interactive Itinerary

1. WHEN user views itinerary THEN system SHALL allow adding custom activities
2. WHEN user clicks "Salvar" THEN system SHALL show toast "Roteiro salvo!"
3. WHEN itinerary loads THEN system SHALL group by day with colored headers
