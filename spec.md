# ID&PC Chak - OTP-Based Admin Authentication

## Current State
- Admin login at `/admin` uses username `Kamran911` + password (checked against localStorage / backend `getAdminPassword`).
- Forgot Password uses 3 security questions at `/admin/reset-password`.
- No OTP system exists; no rate limiting; no audit logging.
- Admin session is stored in `sessionStorage.isAdminLoggedIn`.

## Requested Changes (Diff)

### Add
- OTP generation logic (4-digit random code) stored in localStorage with timestamp and expiry (120 seconds)
- OTP attempt counter (max 3 tries); lockout state after 3 failures
- Rate limiting: one OTP request per 30 seconds (cooldown timer on resend)
- Masked phone display: `0303******58` format
- Audit log in localStorage: records login attempts, OTP sends, OTP successes/failures with timestamps
- OTP step in Admin Login flow: after correct username+password → show OTP entry screen (simulated — OTP displayed on screen since no SMS API available)
- OTP-based Forgot Password flow replacing security questions
- Resend OTP button with 30-second cooldown countdown
- Single-use OTP: cleared after successful use
- `src/lib/otp.ts` — OTP utility module

### Modify
- `AdminLoginPage.tsx` — add Step 2 OTP verification after credentials
- `ResetPasswordPage.tsx` — replace security questions with OTP step

### Remove
- Security questions from `ResetPasswordPage.tsx`

## Implementation Plan
1. Create `src/frontend/src/lib/otp.ts` with:
   - `generateOTP()` → stores 4-digit OTP in localStorage with timestamp, returns the code
   - `verifyOTP(code)` → checks code, expiry (120s), attempts (max 3); returns `{success, error}`
   - `canRequestOTP()` → checks 30-second rate limit; returns boolean
   - `clearOTP()` → removes OTP after successful use
   - `getOTPCooldownSeconds()` → returns remaining cooldown seconds
   - `logAuditEvent(event, detail)` → appends to audit log array in localStorage
   - `getAuditLog()` → returns the log array
   - `getMaskedPhone()` → returns `0303******58`
2. Update `AdminLoginPage.tsx`:
   - Step 1: username + password form (existing)
   - On correct credentials → call `generateOTP()`, show OTP on screen ("Your OTP is: XXXX" for demo since no SMS), advance to Step 2
   - Step 2: 4-digit OTP input with countdown timer (120s), attempt counter display, resend button (30s cooldown)
   - On OTP success → set session, navigate to dashboard
   - On OTP fail → increment attempts, show error, lock after 3 fails
3. Update `ResetPasswordPage.tsx`:
   - Step 1: Click to send OTP (show masked phone, generate OTP, display it on screen for demo)
   - Step 2: Enter OTP (same rules: 120s expiry, 3 attempts, resend with 30s cooldown)
   - Step 3: New password entry (existing UI)
   - Remove all security question logic
