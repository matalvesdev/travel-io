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
**Uncommitted files**: .specs/features/dashboard-redesign/*, .specs/STATE.md, new component files
**Branch**: main

**Feature**: shopping-full-rewrite
**Phase**: Execute (Complete)
**Completed**: All 22 tasks (T1-T22), build passes, 62 unit tests pass
**In Progress**: None
**Next Step**: Feature complete - ready for review
**Blockers**: None
**Uncommitted files**: 30+ files modified/created
**Branch**: main

### Shopping Module Rewrite Summary

**What was done:**
- Unified Node.js scraper with hybrid approach (Playwright + fetch)
- Migrated deals/coupons from Supabase to Prisma
- Created unified types in types/shopping.ts
- Redesigned all UI components with FAANG-quality UX
- Added background price monitoring cron job
- Added scraper health monitoring
- Created CI/CD pipeline
- Added unit tests for reliability calculation
- Removed dead code (product-card.tsx, price-comparison.tsx, shopping-supabase.ts)

**Key files created/modified:**
- `prisma/schema.prisma` - Added missing columns
- `src/types/shopping.ts` - Single source of truth
- `src/lib/shopping/stores.ts` - Store definitions
- `src/lib/shopping/reliability.ts` - Reliability calculation
- `src/lib/api/scraper.ts` - Unified scraper
- `src/lib/api/shopping.ts` - Unified API client
- `src/app/api/products/route.ts` - Uses unified scraper
- `src/app/api/shopping/*/route.ts` - All CRUD routes updated
- `src/app/api/cron/price-check/route.ts` - Background monitoring
- `src/app/api/health/scraper/route.ts` - Health checks
- `src/app/(app)/shopping/page.tsx` - FAANG-quality redesign
- `src/components/shopping/*.tsx` - All components rewritten
- `src/hooks/api/use-shopping.ts` - Unified hooks
- `.github/workflows/ci.yml` - CI/CD pipeline
