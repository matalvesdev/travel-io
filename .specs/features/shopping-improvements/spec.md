# Shopping Module — Buttons, Reviews & Reliability

## Problem Statement

The shopping module has buttons (wishlist, monitor) that don't give user feedback, no product reviews/ratings visible, and no reliability signals. Users can't make informed purchase decisions.

## Goals

- [ ] All action buttons (wishlist, monitor, buy) provide visible feedback (toast + state update)
- [ ] Product detail panel shows reviews, condition, and reliability score
- [ ] Wishlist items show delete, target price, and savings tracking

## Out of Scope

| Feature | Reason |
|---------|--------|
| Real review scraping from stores | Anti-bot too aggressive; use synthetic reviews based on store reputation |
| Payment gateway integration | No real payments in this scope |
| Real-time price alerts (push notifications) | Only localStorage-based tracking |

---

## Assumptions & Open Questions

| Assumption | Default | Rationale |
|-----------|---------|-----------|
| Reviews are synthetic based on store reputation | Yes | Real review scraping blocked by anti-bot; synthetic is fast and useful |
| Reliability score = store reputation × condition factor | Yes | Combines trust signals into one number |
| Toast notifications use existing Toast component | Yes | Already imported in travel page |

---

## User Stories

### P1: Functional Buttons with Feedback ⭐ MVP

**User Story**: As a shopper, I want buttons that give me feedback when I click them.

**Acceptance Criteria**:

1. WHEN user clicks "♡ Adicionar à Wishlist" THEN system SHALL show green toast "Adicionado à wishlist!" AND product SHALL appear in wishlist section
2. WHEN user clicks "Monitorar" in detail panel THEN system SHALL show toast "Monitor adicionado!" AND price monitor SHALL appear in monitors table
3. WHEN user clicks "Comprar em [Loja]" THEN system SHALL open product URL in new tab
4. WHEN user clicks "Verificar Agora" THEN system SHALL check real prices via scraper API AND show toast with results count
5. WHEN user clicks delete on wishlist item THEN system SHALL remove item AND show toast "Removido da wishlist"
6. WHEN user clicks delete on monitor THEN system SHALL remove monitor AND show toast "Monitor removido"

**Independent Test**: Click each button, see toast, verify state updates in UI.

---

### P2: Product Reviews & Reliability

**User Story**: As a shopper, I want to see reviews and reliability score for each product.

**Acceptance Criteria**:

1. WHEN user views product detail THEN system SHALL show synthetic review score based on store reputation (Amazon: 4.5, ML: 4.2, Magalu: 4.0, etc.)
2. WHEN user views product detail THEN system SHALL show condition badge (Novo/Seminovo/Usado)
3. WHEN user views product detail THEN system SHALL show reliability score (0-100) based on: store reputation + condition + price vs market average
4. WHEN user views comparison table THEN each row SHALL show mini reliability badge

**Independent Test**: Open product detail, see reviews and reliability score.

---

### P3: Enhanced Wishlist with Price Tracking

**User Story**: As a shopper, I want my wishlist to track price changes.

**Acceptance Criteria**:

1. WHEN user adds product to wishlist THEN system SHALL save current price AND allow setting target price via inline edit
2. WHEN user views wishlist THEN system SHALL show price difference (current vs target) with color coding
3. WHEN price drops below target THEN system SHALL show green "Abaixo da Meta!" badge

---

## Edge Cases

- WHEN Supabase is unreachable THEN system SHALL use localStorage fallback silently
- WHEN product has no image THEN system SHALL show placeholder icon
- WHEN product has no URL THEN wishlist button SHALL be disabled with tooltip "Sem link de compra"

---

## Requirement Traceability

| ID | Story | Status |
|----|-------|--------|
| SHOP-01 | P1: Toast on wishlist add | Pending |
| SHOP-02 | P1: Toast on monitor add | Pending |
| SHOP-03 | P1: Toast on delete actions | Pending |
| SHOP-04 | P1: Verificar Agora shows results | Pending |
| SHOP-05 | P2: Store reputation scores | Pending |
| SHOP-06 | P2: Reliability score calc | Pending |
| SHOP-07 | P2: Review display in detail panel | Pending |
| SHOP-08 | P2: Reliability badge in table | Pending |
| SHOP-09 | P3: Inline target price edit | Pending |
| SHOP-10 | P3: Price tracking in wishlist | Pending |

---

## Success Criteria

- [ ] Every button click shows a toast notification within 500ms
- [ ] Product detail shows reviews + reliability score
- [ ] Wishlist shows delete + target price + savings
- [ ] All 10 requirements verified via tests
