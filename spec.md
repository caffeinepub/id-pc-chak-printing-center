# ID&PC Chak - Printing Center

## Current State

- Employee add silently fails because `actor.addEmployee()` receives `ExternalBlob.fromBytes(new Uint8Array(0))` for the `photo` field, which cannot be Candid-serialized by the ICP SDK — this throws inside the try/catch, the employee is never written to the backend Map
- Service add has the same issue: `Service.image` is `Storage.ExternalBlob` in the backend, so `addService()` also throws silently
- `fetchExtendedData()` caches localStorage data as 'fresh' when actor is null, blocking real backend fetch for 500ms after actor loads
- `fetchExtendedData()` falls back to `getLocalExtendedData()` on backend error, returning device-local empty data on other devices instead of last known good cached data
- `fetchEmployees()` does not call `saveEmployees()` after backend fetch, so `backendUpdateEmployee`'s local cache update (which reads from localStorage) always skips
- `useEmployees`, `useProducts`, `useServices` all use `enabled: !isFetching` which allows queries to run with `actor = null`, returning `[]` and showing empty UI

## Requested Changes (Diff)

### Add
- Nothing new

### Modify
- `main.mo`: Change `Employee.photo: Storage.ExternalBlob` → `photoUrl: Text`; Change `Service.image: Storage.ExternalBlob` → `image: Text`
- `backend.d.ts`: Update `Employee` interface (`photo: ExternalBlob` → `photoUrl: string`); Update `Service` interface (`image: ExternalBlob` → `image: string`)
- `backendData.ts`: 
  - Remove `ExternalBlob` import
  - In `addEmployee()`/`updateEmployee()`: pass `photoUrl: ""` instead of `photo: ExternalBlob.fromBytes(...)`
  - In `addService()`/`updateService()`: pass `image: ""` instead of `image: ExternalBlob.fromBytes(...)`
  - In `fetchExtendedData()`: when actor is null, do NOT update cache — return local data directly without caching
  - In `fetchExtendedData()` catch: return `_extDataCache ?? defaults` instead of `getLocalExtendedData()`
  - In `fetchEmployees()`: call `saveEmployees(decoded)` after successful backend fetch
- `useQueries.ts`: Change `enabled: !isFetching` → `enabled: !isFetching && !!actor` in `useEmployees`, `useProducts`, `useServices`, `useReviews`

### Remove
- `ExternalBlob` import from `backendData.ts` (no longer used)

## Implementation Plan

1. Edit `src/backend/main.mo`: change `Employee.photo` and `Service.image` fields from `Storage.ExternalBlob` to `Text`
2. Edit `src/frontend/src/backend.d.ts`: update `Employee` and `Service` interface field types
3. Edit `src/frontend/src/lib/backendData.ts`: remove ExternalBlob import and usage; fix cache-on-null-actor; fix error fallback; add saveEmployees after fetch
4. Edit `src/frontend/src/hooks/useQueries.ts`: fix enabled conditions
5. Validate and deploy
