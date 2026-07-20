# Travel Search Fix

## Problem Statement

Flight and hotel search in the travel module doesn't work. Root causes:
1. Origin hardcoded as "GRU" — ignores user selection
2. AutocompleteInput returns "Paris (CDG)" but API needs city name, not airport code in parentheses
3. Search catch blocks silently swallow errors
4. No loading state feedback when search is slow

## User Stories

### P1: Search works end-to-end
1. WHEN user selects origin "Rio de Janeiro (GIG)" AND destination "Paris (CDG)" AND dates THEN clicking "Buscar" SHALL call API with correct params
2. WHEN API returns results THEN review step SHALL show flights and hotels
3. WHEN API returns empty THEN system SHALL show "Nenhum resultado" message

### P2: Search progress visible
1. WHEN search is running THEN system SHALL show animated progress per source
2. WHEN search fails THEN system SHALL show error toast

## Acceptance Criteria

1. WHEN user selects origin from autocomplete THEN system SHALL extract airport code for API call ✅
2. WHEN user selects destination from autocomplete THEN system SHALL extract city name for API call ✅
3. WHEN flight search returns 0 results THEN system SHALL show "Nenhum voo encontrado" ✅
4. WHEN hotel search returns 0 results THEN system SHALL show empty state ✅
5. WHEN API call fails THEN system SHALL show toast with error message ✅
