# Project State

## Decisions

| ID | Decision | Rationale | Status | Feature |
|----|----------|-----------|--------|---------|
| AD-01 | Use Recharts for charting | Already in project, consistent | active | dashboard-redesign |
| AD-02 | Use Framer Motion for animations | Already in project, consistent | active | dashboard-redesign |
| AD-03 | Extend existing useDashboard hook | Single data source, less complexity | active | dashboard-redesign |
| AD-04 | Use Finnhub for news API | Free tier, financial focus, no CORS | active | dashboard-redesign |
| AD-05 | Keep purple/violet color scheme | Brand consistency | active | dashboard-redesign |
| AD-06 | Use sonner for toast notifications | Consistent with trips page, simple API | active | shopping-improvements |
| AD-07 | Synthetic reviews based on store reputation | Real review scraping blocked by anti-bot; synthetic is fast and useful | active | shopping-improvements |
| AD-08 | Reliability score = store reputation × condition factor | Combines trust signals into one number | active | shopping-improvements |
| AD-09 | Hybrid scraper (Playwright + fetch) | Playwright for complex stores, fetch for simpler ones | active | shopping-full-rewrite |
| AD-10 | Migrate deals/coupons from Supabase to Prisma | Single database, consistent data layer | active | shopping-full-rewrite |
| AD-11 | Unified types in types/shopping.ts | Single source of truth, eliminates type mismatches | active | shopping-full-rewrite |

## Handoff

**Feature**: dashboard-redesign
**Phase**: Execute (Complete)
**Completed**: All 8 tasks (T1-T8), build passes
**In Progress**: None
**Next Step**: Feature complete - ready for review
**Blockers**: None
**Branch**: main

**Feature**: shopping-full-rewrite
**Phase**: Execute (Complete)
**Completed**: All 22 tasks (T1-T22), build passes, 62 unit tests pass
**In Progress**: None
**Next Step**: Feature complete - ready for review
**Blockers**: None
**Branch**: main

**Feature**: bookings-module
**Phase**: Execute (Complete)
**Completed**: All 12 tasks (T1-T12), build passes, 48 unit tests pass, migration applied
**In Progress**: None
**Next Step**: Feature complete
**Blockers**: None
**Branch**: develop

**Feature**: user-module
**Phase**: Execute (Complete)
**Completed**: All 15 tasks (T1-T15), build passes, 43 unit tests pass, migration applied
**In Progress**: None
**Next Step**: Feature complete
**Blockers**: None
**Branch**: develop
