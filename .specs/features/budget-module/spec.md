# Budget Module Specification

## Problem Statement

O módulo de finanças permite registrar transações, mas não oferece planejamento de orçamento. Usuários não podem definir limites por categoria, comparar gastos reais com o planejado, ou receber alertas ao atingir limites. Isso dificulta o controle financeiro e o alcance de metas.

## Goals

- [ ] Usuários podem criar orçamentos mensais por categoria
- [ ] Comparação visual de gasto real vs orçado
- [ ] Alertas ao atingir 80% e 100% do orçamento
- [ ] Dashboard de orçamento com resumo mensal
- [ ] Histórico de orçamentos anteriores

## Out of Scope

| Feature | Reason |
|---------|--------|
| Orçamento automático baseado em IA | Requer análise histórica extensa |
| Integração com bancos para importação | Complexidade adicional |
| Orçamento compartilhado | Funcionalidade futura |
| Metas de poupança automática | Já existe no módulo Goals |

---

## Assumptions & Open Questions

| Assumption | Default | Rationale |
|-----------|---------|-----------|
| Orçamento é por mês | Sim | Padrão mais comum de uso |
| Categorias herdam do módulo Finance | Sim | Consistência com transações existentes |
| Alertas são in-app apenas | Sim | Sem push notifications por enquanto |
| Orçamento pode ser editado a qualquer momento | Sim | Flexibilidade para o usuário |

---

## User Stories

### P1: Create Monthly Budget ⭐ MVP

**User Story**: As a user, I want to set monthly spending limits for each category so that I can control my expenses.

**Why P1**: Core functionality - without budget creation, there's no budget management.

**Acceptance Criteria**:

1. WHEN user visits /budget THEN system SHALL show current month budget overview
2. WHEN user clicks "Criar Orçamento" THEN system SHALL show form with category and limit
3. WHEN user saves budget THEN system SHALL store with month/year
4. WHEN budget exists for category THEN system SHALL show edit option
5. WHEN budget is created THEN system SHALL show success toast

**Independent Test**: Create a budget for "Alimentação" with R$1500 limit, verify it appears in overview.

---

### P2: Budget Overview Dashboard

**User Story**: As a user, I want to see a visual overview of my budget so that I can quickly understand my spending status.

**Why P2**: Visual feedback is essential for budget management.

**Acceptance Criteria**:

1. WHEN user visits /budget THEN system SHALL show total budget vs total spent
2. WHEN categories have budgets THEN system SHALL show progress bars per category
3. WHEN spending exceeds budget THEN system SHALL show red warning
4. WHEN spending is under 80% THEN system SHALL show green status
5. WHEN spending is 80-100% THEN system SHALL show yellow warning

**Independent Test**: Create budgets, add transactions, verify progress bars reflect correct percentages.

---

### P3: Budget vs Actual Comparison

**User Story**: As a user, I want to compare my planned budget with actual spending so that I can adjust my habits.

**Why P3**: Comparison is key to budget effectiveness.

**Acceptance Criteria**:

1. WHEN user views budget details THEN system SHALL show planned vs actual per category
2. WHEN actual exceeds planned THEN system SHALL show overage amount
3. WHEN actual is under planned THEN system SHALL show remaining amount
4. WHEN viewing historical data THEN system SHALL show trend over months

**Independent Test**: Create budget, add transactions exceeding limit, verify overage is displayed.

---

### P4: Budget Alerts

**User Story**: As a user, I want to receive alerts when approaching my budget limits so that I can avoid overspending.

**Why P4**: Proactive alerts help prevent overspending.

**Acceptance Criteria**:

1. WHEN spending reaches 80% of budget THEN system SHALL show warning notification
2. WHEN spending reaches 100% of budget THEN system SHALL show critical notification
3. WHEN user dismisses alert THEN system SHALL not show again for same threshold
4. WHEN new month starts THEN system SHALL reset alerts

**Independent Test**: Create budget, add transactions to reach 80%, verify alert appears.

---

### P5: Budget History

**User Story**: As a user, I want to see my budget history so that I can track my financial progress over time.

**Why P3**: Historical data helps identify patterns and improve future budgets.

**Acceptance Criteria**:

1. WHEN user clicks "Histórico" THEN system SHALL show previous months' budgets
2. WHEN viewing history THEN system SHALL show total budget vs total spent per month
3. WHEN comparing months THEN system SHALL show improvement or regression
4. WHEN selecting a past month THEN system SHALL show detailed breakdown

**Independent Test**: Create budgets for multiple months, verify history shows all with correct data.

---

## Edge Cases

- WHEN user tries to create duplicate category budget THEN system SHALL update existing budget
- WHEN user deletes category with budget THEN system SHALL remove budget
- WHEN transactions are deleted THEN system SHALL recalculate spent amounts
- WHEN month changes THEN system SHALL show new month with no budget set

---

## Requirement Traceability

| ID | Story | Phase | Status |
|----|-------|-------|--------|
| BUD-01 | P1: Create budget form | Design | Pending |
| BUD-02 | P1: Save budget with category/limit | Design | Pending |
| BUD-03 | P2: Budget overview dashboard | Design | Pending |
| BUD-04 | P2: Progress bars per category | Design | Pending |
| BUD-05 | P3: Planned vs actual comparison | Design | Pending |
| BUD-06 | P4: Budget alerts | Design | Pending |
| BUD-07 | P5: Budget history | Design | Pending |

---

## Success Criteria

- [ ] User can create a budget in < 30 seconds
- [ ] Budget overview loads in < 1 second
- [ ] Progress bars accurately reflect spending
- [ ] Alerts appear within 1 minute of threshold
- [ ] History shows at least 6 months of data
