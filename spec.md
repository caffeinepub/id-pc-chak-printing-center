# ID&PC Chak - Printing Center

## Current State

Employee add karne par `failed to save` error aata hai. Services bhi add nahi ho rahi.

Root cause: Employee add ka current flow 2-step hai:
1. `actor.addEmployee()` → record backend Map mein
2. `actor.setEmployeesJson()` → photo alag blob mein

Agar step 1 succeed ho lekin step 2 fail ho (ya ulta), data split ho jaata hai aur employee nahi dikhta. Isi tarah services ka flow bhi 2-step hai jo fail hota hai.

Services ab `products` Map mein migrate ho chuki hain — admin panel mein "Services" tab actually products use karta hai.

## Requested Changes (Diff)

### Add
- Employee: single blob architecture — sab kuch (text data + photo) ek hi `employeesJson` JSON blob mein. `employeesV2` Map ka use bilkul band.
- Services (products): clean single-step add using `backendAddProduct` only. No `servicesV2` Map at all.

### Modify
- `backendAddEmployee` / `backendUpdateEmployee` / `backendDeleteEmployee` in `backendData.ts` — rewrite to use ONLY `getEmployeesJson`/`setEmployeesJson`. No `actor.addEmployee()` call at all.
- `fetchEmployees` — rewrite to parse ONLY from `employeesJson` blob.
- Admin panel "Services" tab — wire entirely to `backendAddProduct`/`backendUpdateProduct`/`backendDeleteProduct` (already done for products). Rename "Services" label ke form fields to match. Keep UI same but backend calls must be product calls.
- `useEmployees` hook — remove `initialData: getEmployees` (stale localStorage data causes cross-device issues).

### Remove
- All calls to `actor.addEmployee()`, `actor.updateEmployee()`, `actor.deleteEmployee()`, `actor.getAllEmployees()` from frontend (these backend methods still exist but frontend won't call them — all employee data lives in employeesJson blob).
- All calls to `actor.addService()`, `actor.updateService()`, `actor.deleteService()`, `actor.getAllServices()` from frontend.
- localStorage fallback in `fetchEmployees`.

## Implementation Plan

1. Rewrite `fetchEmployees`, `backendAddEmployee`, `backendUpdateEmployee`, `backendDeleteEmployee` in `backendData.ts` — pure JSON blob approach, no Map calls.
2. Update `useEmployees` in `useQueries.ts` — remove `initialData: getEmployees`.
3. Update Admin Panel services tab — replace `backendAddService` calls with `backendAddProduct` calls (services are products).
4. AboutPage already uses `useProducts` for services — no change needed.
5. Validate and deploy.
