# ID&PC Chak - Printing Center

## Current State
A full-stack printing center website with React frontend + Motoko backend. Has admin panel, customer dashboard, billing system, employee management, order tracking, reviews system. 24 versions deployed.

## Requested Changes (Diff)

### Add
- Homepage dynamic products/services section (was missing)
- paymentStatus field saved to backend (currently lost on cross-device)

### Modify
- **CRITICAL REAL-TIME SYNC FIXES:**
  - `backendData.ts`: Remove `if (array.length > 0)` guards in ALL fetch functions (fetchServices, fetchEmployees, fetchReviews, fetchInvoices, fetchOrders, fetchContactMessages, fetchBillingItems, fetchBillingCustomers) — always trust backend response even if empty
  - `AdminDashboardPage.tsx`: Replace local useState for employees/services with useEmployees()/useServices() React Query hooks so admin sees live data
  - `AdminDashboardPage.tsx`: bannerPreview/logoPreview should sync from useBannerImage()/useLogo() hooks not just localStorage
- **INVOICE FIXES:**
  - `InvoiceView.tsx`: Use `invoice.discount` directly instead of recomputing from grandTotal subtraction
  - `InvoiceView.tsx`: Clamp discount to >=0 to prevent negative values
  - `AdminDashboardPage.tsx`: handleEditInvoice should restore discountPct from stored discount amount
  - `AdminDashboardPage.tsx`: handleSaveInvoice auto-save billing customer should use form.address not empty string
  - `main.mo`: Add paymentStatus field to Invoice type; update all invoice functions
  - `backendData.ts`: fetchInvoices — drop merge logic, always use backend data; map paymentStatus
- **ROUTING FIX:**
  - `PurchasePage.tsx`: Fix useParams `from` path to match actual route `/products/$serviceId`
  - `ProductsPage.tsx`: Fix Add to Cart button to use router navigate instead of window.location.href
- **CUSTOMER DASHBOARD FIXES:**
  - `CustomerDashboardPage.tsx`: Wrap BigInt(session.id) in try/catch to prevent crash
  - `backendData.ts`: backendAddOrder — ensure customerId is always preserved in localStorage record
- **OTHER FIXES:**
  - `BillCheckPage.tsx`: Allow search by invoice number alone (no userId required)
  - `HomePage.tsx`: Use useApprovedReviews() not useReviews()
  - `AdminDashboardPage.tsx`: Fix visionText/missionText useEffect to allow empty strings
  - `ContactPage.tsx`: Remove duplicate localStorage save (message saved twice)
  - `ContactPage.tsx`: Use proper Google Maps embed from provided share link
  - `backendData.ts`: saveExtendedData should not update cache on failure
  - `backendData.ts`: Move serviceImages to servicesJson chunk
  - `backendData.ts`: Use storage.ts helpers for billing customers
  - `storage.ts`: Remove DEFAULT_SERVICES hardcoded data (initialize empty)
  - `AdminLoginPage.tsx`: Fetch admin password from backend for cross-device login
  - `ResetPasswordPage.tsx`: Fetch admin password from backend for cross-device reset
  - `AdminDashboardPage.tsx`: Compress company logos before saving
  - `Navbar.tsx`: Customer session reactivity fix
  - `main.mo`: Remove hardcoded security answers (initialize empty)
  - `main.mo`: Fix getCustomerById/updateCustomerLastLogin to not trap
  - `HomePage.tsx`: Add dynamic products section (loads from backend services)

### Remove
- Hardcoded default services from storage.ts initial state
- Duplicate localStorage message save in ContactPage

## Implementation Plan
1. Fix `main.mo` backend: add paymentStatus to Invoice, fix trap → optional returns, remove hardcoded answers, remove DEFAULT_SERVICES
2. Fix `backendData.ts`: remove length>0 guards, fix fetchInvoices merge, fix order customerId, add paymentStatus mapping, move serviceImages chunk, fix billing customers storage helpers, fix cache on save failure
3. Fix `AdminDashboardPage.tsx`: use React Query hooks for employees/services, fix edit invoice discount, fix banner/logo preview sync, fix vision/mission empty string, fix billing customer auto-save address, compress company logos
4. Fix page-level bugs: PurchasePage route param, ProductsPage navigation, CustomerDashboardPage crash guard, BillCheckPage userId requirement, HomePage approved reviews + products section, ContactPage duplicate save + map, AdminLoginPage backend password check
5. Fix InvoiceView discount computation
6. Validate and deploy
