# Dashboard Redesign Specification

## Problem Statement

The current dashboard has a basic layout with limited visual appeal and incomplete data visualization. The "Composição das Despesas" pie chart is always empty (pieData never populated), the "Fluxo Financeiro" area chart only shows 3 static data points (Receitas/Despesas/Saldo), and the news section uses a basic Google News RSS proxy with fallback to hardcoded data. The goal is to create a FAANG-quality dashboard with proper data visualization, real-time financial news from an external API, and a modern, professional layout.

## Goals

- [ ] Redesign the dashboard layout to follow modern fintech design patterns (FAANG-level quality)
- [ ] Fix and enhance the "Gastos por Categoria" chart to display actual expense breakdown data
- [ ] Redesign the "Fluxo Financeiro" chart to show meaningful time-series financial flow data
- [ ] Integrate a real external financial news API (not just Google News RSS)
- [ ] Maintain all existing functionality while improving visual quality

## Out of Scope

| Feature | Reason |
|---------|--------|
| Backend data model changes | Current Supabase schema supports the needed data |
| Authentication changes | Auth system works correctly |
| Mobile app changes | Dashboard is web-only for now |
| Real-time WebSocket updates | Keeping existing polling mechanism |

---

## Assumptions & Open Questions

| Assumption / decision | Chosen default | Rationale | Confirmed? |
|----------------------|----------------|-----------|------------|
| News API choice | Use Finnhub or similar free API | Free tier available, financial news focus | No |
| Chart library | Keep Recharts (already in use) | Consistent with existing codebase | Yes |
| Animation library | Keep Framer Motion (already in use) | Consistent with existing codebase | Yes |
| Color palette | Extend existing purple/violet theme | Brand consistency | Yes |
| Data granularity | Monthly aggregation for charts | Balance between detail and readability | Yes |

**Open questions:** 
- Which external news API to use? (Finnhub, Alpha Vantage, NewsAPI, etc.) - Need to research free options
- Should we add investment portfolio chart to dashboard?

---

## User Stories

### P1: Dashboard Layout Redesign ⭐ MVP

**User Story**: As a user, I want a modern, visually appealing dashboard that presents my financial data in a clear and professional way.

**Why P1**: The current layout is basic and doesn't reflect the quality of a fintech product.

**Acceptance Criteria**:

1. WHEN the dashboard loads THEN the system SHALL display a hero section with key metrics (Patrimônio Total, Receitas, Despesas, Saldo) with proper visual hierarchy
2. WHEN the dashboard loads THEN the system SHALL display charts in a responsive grid layout that adapts to screen size
3. WHEN hovering over any card or chart THEN the system SHALL show smooth hover animations
4. WHEN the dashboard loads THEN the system SHALL display a gradient-based header section

**Independent Test**: Can demo by loading the dashboard and verifying visual hierarchy and responsiveness

---

### P2: Gastos por Categoria Chart Fix

**User Story**: As a user, I want to see a proper breakdown of my expenses by category in a donut/pie chart.

**Why P2**: The current pie chart is always empty because pieData is never populated from the API.

**Acceptance Criteria**:

1. WHEN the dashboard loads THEN the system SHALL display a donut chart showing expense breakdown by category
2. WHEN there are transactions with categories THEN the system SHALL group expenses by category and display percentages
3. WHEN hovering over a chart segment THEN the system SHALL show the category name, amount, and percentage
4. WHEN there are no expenses THEN the system SHALL display an empty state message

**Independent Test**: Can demo by importing transactions with different categories and seeing the chart populate

---

### P3: Fluxo Financeiro Time-Series Chart

**User Story**: As a user, I want to see my financial flow over time (monthly income vs expenses trend).

**Why P3**: The current chart only shows 3 static data points which provides no useful insight.

**Acceptance Criteria**:

1. WHEN the dashboard loads THEN the system SHALL display an area/line chart showing income and expenses over the last 6 months
2. WHEN displaying the chart THEN the system SHALL show both income and expense lines with a gradient fill
3. WHEN hovering over the chart THEN the system SHALL show a tooltip with exact values for each month
4. WHEN there is no historical data THEN the system SHALL display an empty state

**Independent Test**: Can demo by having transactions across multiple months and seeing the trend line

---

### P4: Financial News API Integration

**User Story**: As a user, I want to see real financial news from a reliable external API source.

**Why P3**: The current implementation uses Google News RSS with hardcoded fallback, which is unreliable.

**Acceptance Criteria**:

1. WHEN the news section loads THEN the system SHALL fetch news from an external financial news API
2. WHEN the API fails THEN the system SHALL gracefully fall back to cached/default data
3. WHEN news loads successfully THEN the system SHALL display title, source, date, and summary
4. WHEN clicking a news item THEN the system SHALL open the full article in a new tab

**Independent Test**: Can demo by loading the dashboard and verifying real news appears (or fallback if no API key)

---

## Edge Cases

- WHEN user has no transactions THEN system SHALL show empty states for all charts
- WHEN API is rate-limited THEN system SHALL use cached data with a "last updated" indicator
- WHEN user has transactions in only one category THEN system SHALL show a single-color chart
- WHEN network is offline THEN system SHALL show cached data or empty states gracefully

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
|----------------|-------|-------|--------|
| DBR-01 | P1: Dashboard Layout Redesign | Design | Pending |
| DBR-02 | P2: Gastos por Categoria Chart Fix | Design | Pending |
| DBR-03 | P3: Fluxo Financeiro Time-Series Chart | Design | Pending |
| DBR-04 | P4: Financial News API Integration | Design | Pending |

---

## Success Criteria

- [ ] Dashboard loads in under 2 seconds
- [ ] All charts render with proper data visualization
- [ ] News section shows real financial news (or graceful fallback)
- [ ] Responsive layout works on desktop and tablet
- [ ] Smooth animations on all interactive elements
