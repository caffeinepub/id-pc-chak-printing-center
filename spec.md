# ID&PC Chak - Printing Center

## Current State

- Backend (`main.mo`) has full CRUD for invoices, employees, services, reviews, logo, banner.
- **Invoice bug**: `encodeInvoice` converts invoice IDs to bigint using `idStringToBigInt` which extracts trailing number. IDs like "INV-001", "INV-002" map to `1n`, `2n`. But `addInvoice` in backend uses `invoices.add(invoice.id, invoice)` — `Map.add` is an *update/upsert*. So invoice with id `1n` overwrites previous invoice with id `1n` if the same sequence is re-used. The real issue: `getNextInvoiceNumber()` in `storage.ts` uses `invoices.length + 1` — but after backend sync, the frontend local list may be empty, so all new invoices get id INV-001, colliding in the backend map.
- **Customer orders (Purchase Page)**: `PurchasePage.tsx` `handleSubmit` only shows a toast — orders are never saved to localStorage or backend. No backend type, no storage function, no admin panel tab exists for orders.
- **Contact form**: `ContactPage.tsx` calls `saveMessage()` which saves to localStorage only. No backend storage, no admin panel tab to view messages, no notification system.
- **Product images**: `Service` type has no image field. No upload UI in Admin Panel services tab. No display of product image on Products page or Purchase page.

## Requested Changes (Diff)

### Add
- `CustomerOrder` type in storage + backend: id, serviceId, serviceName, customerName, phone, quantity, notes, totalPrice, date, status
- `ContactMessage` type exposed to backend: id, name, phone, message, date (currently only in localStorage)
- Backend functions: `addOrder`, `getAllOrders`, `deleteOrder`; `addContactMessage`, `getAllContactMessages`, `deleteContactMessage`
- Admin panel: "Orders" tab showing all customer orders with details; "Messages" tab showing contact form submissions with notification badge for unread
- Notification badge on admin panel nav when there are unread contact messages
- Product image field (`image: Text`) in Service type (backend and frontend)
- Image upload UI in Admin Panel services tab (edit/add service form)
- Product image display on ProductsPage cards and PurchasePage

### Modify
- **Fix invoice ID collision**: Change `getNextInvoiceNumber()` to use `Date.now()` as unique ID base instead of `invoices.length + 1`, ensuring unique IDs even after backend re-sync. Also update `encodeInvoice` to handle timestamp-based IDs properly.
- `PurchasePage.tsx`: On order submit, save order to backend via new `addOrder` function instead of just showing toast
- `ContactPage.tsx`: On form submit, also save contact message to backend via new `addContactMessage`
- `storage.ts`: Add `CustomerOrder` and order helpers; update `ContactMessage` helpers to also sync; add `getOrders`, `saveOrders`, `addOrder` functions
- `backendData.ts`: Add `fetchOrders`, `backendAddOrder`, `fetchContactMessages`, `backendAddContactMessage`, `backendDeleteOrder`, `backendDeleteContactMessage`
- `useQueries.ts`: Add `useOrders()` and `useContactMessages()` hooks
- `Service` type: Add optional `image` field (string, base64 data URL)
- Admin services form: Add image upload field
- Service encoding/decoding: include image field

### Remove
- Nothing removed

## Implementation Plan

1. **Backend** — Add `CustomerOrder` type, `ContactMessage` type, and full CRUD for both. Add `image` field to `Service` type.
2. **storage.ts** — Add `CustomerOrder` interface and helpers (`getOrders`, `saveOrders`, `addOrder`, `deleteOrder`). Add `getContactMessages`/`saveContactMessages` helpers. Add `getUnreadMessageCount`/`markMessagesRead`. Add `image` to `Service` interface.
3. **backendData.ts** — Add encode/decode for `CustomerOrder` and `ContactMessage`. Add `fetchOrders`, `backendAddOrder`, `backendDeleteOrder`, `fetchContactMessages`, `backendAddContactMessage`, `backendDeleteContactMessage`. Update service encode/decode to handle `image` field.
4. **useQueries.ts** — Add `useOrders()` and `useContactMessages()` hooks with 5s polling.
5. **Fix invoice IDs** — Update `getNextInvoiceNumber()` to generate timestamp-based unique IDs. Update `encodeInvoice` to handle these IDs in bigint conversion.
6. **PurchasePage.tsx** — Wire submit to call `backendAddOrder` and store to backend.
7. **ContactPage.tsx** — Wire submit to also call `backendAddContactMessage`.
8. **AdminDashboardPage.tsx** — Add "Orders" tab and "Messages" tab. Show notification badge for unread messages. Show order details table. Show contact message table with delete option.
9. **ProductsPage.tsx** — Show product image if available in service card.
10. **PurchasePage.tsx** — Show product image if available.
11. **Admin services form** — Add image upload field (file input → base64).
