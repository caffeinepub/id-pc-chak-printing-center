# ID&PC Chak - Printing Center

## Current State

The website is a full-stack React + Motoko app for a printing center. The frontend has multiple pages: Home, About, Contact, Products, Purchase, Bill Check, Admin Dashboard, Customer Dashboard, Customer Login, Reset Password.

Key data flows:
- Employees, services, companies are stored in backend via two systems: structural data (CRUD endpoints) + compressed JSON blobs for images (`employeesJson`, `servicesJson`, `companiesJson`)
- `backendData.ts` has `fetchEmployees`, `fetchServices`, `fetchCompanies` which call backend + parse extended JSON blobs for photos
- `paymentStatus` and `userId` on invoices are frontend-only (localStorage), not in backend Invoice type
- Cart: "Add to Cart" button just navigates to individual purchase page — no real multi-item cart
- Customer orders: `getOrdersByCustomer` matches by `customerId` BigInt; phone fallback exists but old orders without customerId don't show
- Reports: profit calculation only works for items with a `billingItemId`; manually typed items show 0 profit

## Requested Changes (Diff)

### Add
- Real "Add to Cart" system: CartContext storing cart items (serviceId, name, qty, price, notes), CartPage showing all items, checkout submitting a single combined order to backend
- Cart icon in navbar showing item count badge
- Cart icon on Products page per item ("Add to Cart" adds to cart without navigating away) and a "View Cart" button
- Admin Reports: print button that opens browser print dialog with formatted report; report should include total money received, pending payments (customers who owe money — from invoices with status 'unpaid' or 'partial'), profit per customer, overall profit summary
- Pending payments section in reports: list of customers with unpaid/partial invoices, amount owed, contact info
- Profit per customer section in reports: table showing each customer's total invoiced, total paid, total profit earned from them

### Modify
- **Employee fetching bug fix**: In `backendData.ts` `fetchEmployees()`, when `extData.employeePhotos` is empty or fails to parse, DO NOT silently fallback — instead retry once, then continue with empty photos (show initials). The current `getEmployees()` fallback returns stale localStorage data that may be from a different device session.
  - Remove `initialData` from `useEmployees` query in `useQueries.ts` to prevent stale localStorage seeding
  - In `fetchExtendedData`, if `employeesChunk` is empty string, still return valid empty `employeePhotos: {}` — this is already done but ensure the parse path handles all edge cases
  - In `AdminDashboardPage` employees tab: when saving an employee, ensure `setEmployeesJson` is called with the updated photo blob before returning success

- **Services/Products fetching bug fix**: Same pattern as employees. In `fetchServices()`, ensure service images from extData are applied correctly. Remove stale localStorage fallback that masks backend failures. Products page should always show services from backend, not localStorage cache that may be outdated.

- **Customer orders visibility fix**: In `fetchCustomerOrders`, after calling `actor.getOrdersByCustomer(customerId)`, also do a second pass: fetch ALL orders from backend and filter by matching phone number OR customer name from session. Merge results (dedup by order ID). This ensures orders placed before login or with slight ID mismatch still appear.
  - In `CustomerDashboardPage`, show orders sorted by date descending, with status badge (Pending = yellow, Completed = green)
  - Fix the order status display — show proper status text

- **Invoice search**: Already includes userId in search filter in AdminDashboardPage. Verify it works and ensure the search placeholder text says "Search by name, phone, invoice # or User ID..."

- **Admin Reports improvements**: 
  - Add a "Print Report" button that calls `window.print()` with a print-specific CSS that shows only the report section
  - Add "Pending Payments" section showing customers with unpaid/partial invoices: customer name, phone, invoice IDs, total owed
  - Add "Profit Per Customer" table: customer name, total invoiced, total cost, profit, profit %
  - Fix profit calculation to also estimate profit for items without billingItemId using a default margin (e.g., 20% if purchase price unknown) OR just show those items as "cost unknown" but still count revenue

- **Products page**: "Add to Cart" button should ADD to cart context and show a toast "Added to cart!" — NOT navigate away. Add a "View Cart" button that appears when cart has items.

### Remove
- Remove `initialData: getInvoices` from `useInvoices` in `useQueries.ts` to prevent stale data seeding cross-device issues (or at minimum make it only seed if backend fetch fails)
- Remove stale localStorage fallbacks that silently mask backend fetch failures for employees and services

## Implementation Plan

1. **Create CartContext** (`src/frontend/src/lib/cartContext.tsx`): React context with cart items array, addToCart(service), removeFromCart(id), updateQty(id, qty), clearCart, total calculation. Wrap App.tsx with CartProvider.

2. **Create CartPage** (`src/frontend/src/pages/CartPage.tsx`): Shows cart items with qty controls, notes input per item, order summary, "Place Order" button. On submit, creates multiple orders (one per item) OR a single combined order. Requires customer login.

3. **Update ProductsPage.tsx**: Import useCart hook. "Add to Cart" button calls addToCart(service) and shows toast. Add cart badge indicator. Add "View Cart" CTA when cart has items.

4. **Update Navbar.tsx**: Add cart icon with item count badge, links to /cart route.

5. **Update App.tsx**: Add /cart route, wrap with CartProvider.

6. **Fix backendData.ts `fetchEmployees`**: Remove localStorage fallback (`getEmployees()` call at end). Instead return `[]` if backend fails — the UI already handles empty array gracefully with initials fallback. This prevents cross-device stale data.

7. **Fix backendData.ts `fetchServices`**: Same — remove localStorage fallback, return `[]` on failure.

8. **Fix `fetchCustomerOrders` in backendData.ts**: After primary fetch by customerId, also call `actor.getAllOrders()` (if it exists) or fetch all and filter by phone. If `getAllOrders` doesn't exist in backend, filter from the full orders list by phone number matching session.phone.

9. **Fix `useQueries.ts`**: Remove `initialData: getEmployees` and `initialData: getServices` if they exist. Keep `useInvoices` initialData for now but ensure backend data overwrites it.

10. **Update AdminDashboardPage.tsx Reports tab**:
    - Add Print Report button
    - Add Pending Payments section
    - Add Profit Per Customer table
    - Fix profit calculation to handle items without billingItemId
    - Add print CSS class on the report container

11. **Update index.css**: Add `@media print` styles to hide everything except `.print-report` section.
