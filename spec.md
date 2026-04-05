# ID&PC Chak - Printing Center

## Current State

The website is live and functional. However 4 issues have been identified:

1. **Real-time sync broken** for bannerImage, employees, and companies — these 3 data types are stored in localStorage only and never synced to the ICP backend. This means changes made on one device (admin's phone) don't appear on other devices or the live site.
   - `fetchBannerImage()` does NOT call backend at all
   - `fetchEmployees()` does NOT call backend at all  
   - `getCompanies()` in AboutPage is loaded only once in `useEffect([])` — no polling

2. **Billing customers** have no `address` field — only `name` and `phone`.

3. **Invoice search** only searches by customer name. No phone number or invoice number search.

4. **Sales report** has no date range filter — only Daily (today) / Weekly (last 7 days) / Monthly (current month). Cannot view past dates.

## Requested Changes (Diff)

### Add
- Backend: `BillingCustomer` type with `address` field, `getAllBillingCustomers`, `addBillingCustomer`, `deleteBillingCustomer`, `updateBillingCustomer` methods
- Backend: `bannerImage` stored as a text variable with `getBannerImage` / `setBannerImage` methods
- Backend: companies stored as JSON text with `getCompanies` / `setCompanies` methods  
- Frontend: `useCompanies` React Query hook that polls backend every 5 seconds
- Frontend: Invoice search — add phone number search (inv.phone.includes) and invoice number search (inv.id.includes)
- Frontend: Sales report — add "Custom Date Range" option with start date + end date pickers
- Frontend: Billing customer add/edit form — add `address` field
- Frontend: Billing customers table — show address column

### Modify
- `fetchBannerImage` in backendData.ts — call `actor.getBannerImage()` backend method
- `saveBannerImage` in backendData.ts — call `actor.setBannerImage()` backend method
- `fetchEmployees` in backendData.ts — call `actor.getAllEmployees()` backend method
- `backendAddEmployee` — call `actor.addEmployee()` backend method
- `backendUpdateEmployee` — call `actor.updateEmployee()` backend method
- AboutPage.tsx — replace one-time `useEffect` companies load with `useCompanies()` hook
- AdminDashboardPage.tsx — update billing customers CRUD to include address field; update invoice search filter; update reports date filter
- storage.ts — add `address` field to `BillingCustomer` interface

### Remove
- Nothing removed

## Implementation Plan

1. Update `src/backend/main.mo`:
   - Add `bannerImage` text variable + `getBannerImage`/`setBannerImage` functions
   - Add `companiesJson` text variable + `getCompanies`/`setCompanies` functions
   - Add `BillingCustomer` type with id, name, phone, address fields
   - Add `billingCustomers` Map with full CRUD methods
   - Employee backend already has full CRUD — just need frontend to use it

2. Update `src/frontend/src/lib/backendData.ts`:
   - Fix `fetchBannerImage` / `saveBannerImage` to use backend
   - Fix `fetchEmployees` / `backendAddEmployee` / `backendUpdateEmployee` to use backend
   - Add `fetchCompanies` / `saveCompanies` backend functions
   - Add `fetchBillingCustomers` / `backendAddBillingCustomer` / `backendDeleteBillingCustomer` / `backendUpdateBillingCustomer`

3. Update `src/frontend/src/lib/storage.ts`:
   - Add `address` field to `BillingCustomer` interface
   - Add `getBillingCustomers` / `saveBillingCustomers` / `addBillingCustomer` helper functions with address support

4. Update `src/frontend/src/hooks/useQueries.ts`:
   - Add `useCompanies` hook with 5s polling
   - Add `useBillingCustomers` hook with 5s polling

5. Update `src/frontend/src/pages/AboutPage.tsx`:
   - Replace one-time companies `useEffect` with `useCompanies()` hook

6. Update `src/frontend/src/pages/AdminDashboardPage.tsx`:
   - Add address field to billing customer add/edit form and table
   - Update invoice search to include phone number and invoice number
   - Add custom date range filter to reports tab
   - Wire billing customers to use backend via `useBillingCustomers` hook
