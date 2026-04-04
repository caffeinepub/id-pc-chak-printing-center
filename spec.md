# ID&PC Chak - Printing Center

## Current State

The app has:
- Admin login with OTP (2-step: credentials → OTP shown on screen)
- Password reset via OTP (3 steps: send OTP → verify → new password)
- No customer login/account system
- BillCheckPage: public invoice lookup by userId + invoice number (no login required)
- PurchasePage: anyone can place orders (no login gate)
- Admin dashboard with full management: services, employees, invoices, orders, reviews, billing items, reports, contact messages
- Backend: ICP Motoko canister with CRUD for all entities. No authentication on any endpoint.
- No customer data model (no customer profiles, passwords, sessions)

## Requested Changes (Diff)

### Add
- **Customer data model**: `CustomerAccount` type in backend with fields: id (Nat), name (Text), phone (Text), email (Text), passwordHash (Text), googleId (Option Text), isGoogleUser (Bool), createdAt (Int), lastLoginAt (Int)
- **Backend functions**: `registerCustomer`, `loginCustomer` (returns token/id), `getCustomerByEmail`, `getCustomerById`, `getAllCustomers`, `updateCustomer`, `deleteCustomer`, `getCustomerOrders` (by customer id), `getCustomerInvoices` (by customer phone)
- **Security questions storage on backend**: `getSecurityAnswers`, `setSecurityAnswers` — store the 3 fixed answers (DOB, CNIC, mobile) so password reset works by matching them
- **Customer login page** (`/customer/login`): email + password form with OTP verification step. Also shows "Continue with Google" button (simulated for FYP demo — button present but shows info message that Google OAuth requires production setup). OTP shown on screen in demo box.
- **Customer register page** (`/customer/register`): name, email, phone, password fields
- **Customer dashboard page** (`/customer/dashboard`): shows logged-in customer's invoices, orders, order status (Completed/Pending), total work summary
- **Password reset with security questions**: Replace OTP-based reset with a 3-question form. Questions are hardcoded labels but answers are stored/matched in backend. All 3 must match to allow reset.
- **Admin panel "Customers" tab**: shows all registered customers, their login history (lastLoginAt), order count, invoice count
- **Login-required gate on PurchasePage**: if customer is not logged in, show login prompt before allowing order placement
- **BillCheckPage**: keep working without login (just invoice number lookup). No change needed.

### Modify
- **ResetPasswordPage**: Replace 3-step OTP flow with 3-step security questions flow:
  1. Enter admin username to identify
  2. Answer 3 security questions (all 3 must match stored answers)
  3. Enter new password
- **AdminLoginPage**: Keep OTP flow as-is. No change.
- **App.tsx**: Add new routes: `/customer/login`, `/customer/register`, `/customer/dashboard`
- **Navbar**: Add "Customer Login" button/link in the nav
- **backendData.ts**: Add customer CRUD functions
- **AdminDashboardPage**: Add "Customers" tab showing registered customers and their activity
- **PurchasePage**: Check if customer is logged in (localStorage `customerSession`); if not, show modal/prompt to login before submitting order. Link order to customer account on submit.

### Remove
- OTP logic from `ResetPasswordPage` (replace entirely with security questions)

## Implementation Plan

1. **Backend (Motoko)**: Add `CustomerAccount` type, security answers storage, and all customer-related canister functions.
2. **backendData.ts**: Add `fetchCustomers`, `registerCustomer`, `loginCustomer`, `fetchCustomerOrders`, `fetchCustomerInvoices`, `getSecurityAnswers`, `setSecurityAnswers` functions.
3. **ResetPasswordPage**: Rewrite to use 3 security questions instead of OTP.
4. **New pages**: `CustomerLoginPage`, `CustomerRegisterPage`, `CustomerDashboardPage`.
5. **App.tsx**: Register new customer routes.
6. **Navbar**: Add customer login/account link.
7. **PurchasePage**: Add login gate before order submission.
8. **AdminDashboardPage**: Add Customers tab.
