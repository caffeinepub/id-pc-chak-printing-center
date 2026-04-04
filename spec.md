# ID&PC Chak - Printing Center

## Current State
Full-stack printing shop website with React/TypeScript frontend and Motoko backend. Current backend supports: logo (text), bannerImage (blob), adminPassword, services (with blob image), employees, reviews, invoices, customerOrders, contactMessages. Frontend has Home, About, Products, Purchase, Contact, Bill Check, Admin Dashboard, Admin Login, Reset Password pages.

Backend already has blob-storage component (for service images, banner), and standard CRUD for all entities.

## Requested Changes (Diff)

### Add
1. **Product Card Redesign** — New card layout with "In Stock" / "Sold Out" label badge at top, multiple images support (images array on Service), product name/price/discount/finalPrice visible on card, NO description on card. Clicking opens product detail page with full description + order form.
2. **Stock Status** — Simple toggle on each service: `inStock: Bool`. Admin can toggle In Stock / Sold Out from Services tab.
3. **Discount on Services** — Add `discount: Nat` (percentage) and `finalPrice: Text` fields to Service type.
4. **Item Management for Billing** — New `BillingItem` type: id, name, sellingPrice (Nat), purchasePrice (Nat, hidden from invoice), category (Text). CRUD in backend. Admin can add/edit/delete items. While creating invoice, items are auto-suggested via search/dropdown.
5. **Profit & Reports** — Daily/Weekly/Monthly reports based on invoice data matched against BillingItems. Report shows: total sales, total purchase cost, total profit.
6. **Reviews with Admin Approval** — Add `status: Text` field to Review (`"pending"` | `"approved"` | `"rejected"`). User-submitted reviews go in as `"pending"`. Admin can approve/reject. Only approved reviews show on About and Product pages.
7. **About Stats Admin Control** — Add `aboutStats` (experience: Text, clientsCount: Text) to backend. Admin can update from About Stats tab. Already partially implemented (tab exists), needs full backend persistence.
8. **Order System** — Orders already exist. Ensure auto-generated Order Number (ORD-XXXX format). Admin can view orders and generate invoice from order.
9. **Reviews on Product Detail Page** — Approved reviews shown on product detail/purchase page.

### Modify
- Service type: add `inStock: Bool`, `discount: Nat`, images array (keep existing `image` blob for compatibility).
- Invoice creation: show item suggestions (dropdown from BillingItems), purchase price hidden from invoice output.
- About page: show approved reviews section. Show experience and clients count from backend.
- Admin Dashboard: add Items Management tab, add Reports tab (daily/weekly/monthly), Reviews tab shows pending reviews for approval.
- Products page: new card design with label, discount badge, no description.

### Remove
- Auto-generated About stats (hardcoded 10 years experience, 1000+ clients) — replace with backend-driven values.

## Implementation Plan
1. Update Motoko backend: add BillingItem type + CRUD, add aboutStats getter/setter, add `status` field to Review, add `inStock`/`discount` fields to Service.
2. Update frontend:
   a. New product card component with In Stock/Sold Out label, discount badge, no description, image slider.
   b. Admin Dashboard: new Items tab (add/edit/delete billing items), new Reports tab (daily/weekly/monthly profit), Reviews tab shows pending + approve/reject buttons, About Stats tab already exists but now calls real backend.
   c. Invoice form: item search/dropdown auto-suggest from BillingItems list.
   d. About page: dynamic experience/clients from backend, approved reviews section.
   e. Product detail page: approved reviews section at bottom.
   f. Services tab in Admin: stock status toggle, discount field.
