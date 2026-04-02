// OTP Authentication Module for ID&PC Chak Admin Panel
// Handles OTP generation, verification, rate limiting, and audit logging

const OTP_STORAGE_KEY = "idpc_otp_data";
const AUDIT_LOG_KEY = "idpc_audit_log";

const OTP_EXPIRY_MS = 120_000; // 2 minutes
const MAX_ATTEMPTS = 3;
const RATE_LIMIT_MS = 30_000; // 30 seconds between requests

export interface OTPData {
  code: string; // 4-digit string e.g. "4821"
  timestamp: number; // Date.now() when generated
  attempts: number; // failed attempts so far
  lastRequest: number; // Date.now() of last OTP request (for rate limiting)
}

export interface AuditEvent {
  event: string;
  detail: string;
  timestamp: string; // human-readable date string
}

/** Read OTP data from localStorage, returns null if not found */
function getOTPData(): OTPData | null {
  try {
    const raw = localStorage.getItem(OTP_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as OTPData;
  } catch {
    return null;
  }
}

/** Save OTP data to localStorage */
function saveOTPData(data: OTPData): void {
  localStorage.setItem(OTP_STORAGE_KEY, JSON.stringify(data));
}

/**
 * Log an audit event to localStorage.
 * Keeps only the last 100 events.
 */
export function logAuditEvent(event: string, detail: string): void {
  let log: AuditEvent[] = [];
  try {
    const raw = localStorage.getItem(AUDIT_LOG_KEY);
    if (raw) log = JSON.parse(raw) as AuditEvent[];
  } catch {
    log = [];
  }

  log.push({
    event,
    detail,
    timestamp: new Date().toLocaleString(),
  });

  // Keep only last 100 events
  if (log.length > 100) log = log.slice(log.length - 100);

  localStorage.setItem(AUDIT_LOG_KEY, JSON.stringify(log));
}

/** Get all audit log events */
export function getAuditLog(): AuditEvent[] {
  try {
    const raw = localStorage.getItem(AUDIT_LOG_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AuditEvent[];
  } catch {
    return [];
  }
}

/**
 * Generate a new OTP.
 * Throws Error("rate_limited") if last request was within 30 seconds.
 * Returns the 4-digit OTP code string.
 */
export function generateOTP(): string {
  const existing = getOTPData();

  // Rate limiting check
  if (existing && Date.now() - existing.lastRequest < RATE_LIMIT_MS) {
    throw new Error("rate_limited");
  }

  // Generate random 4-digit code (padded with leading zeros if needed)
  const code = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
  const now = Date.now();

  saveOTPData({
    code,
    timestamp: now,
    attempts: 0,
    lastRequest: now,
  });

  logAuditEvent(
    "OTP_GENERATED",
    `New OTP generated at ${new Date(now).toLocaleString()}`,
  );

  return code;
}

/**
 * Verify the entered OTP against stored code.
 * Returns { success: true } or { success: false, error: string }
 */
export function verifyOTP(input: string): { success: boolean; error?: string } {
  const data = getOTPData();
  if (!data) {
    return { success: false, error: "no_otp" };
  }

  // Check expiry
  if (Date.now() - data.timestamp > OTP_EXPIRY_MS) {
    logAuditEvent("OTP_FAILED", "OTP verification attempted on expired OTP");
    return { success: false, error: "expired" };
  }

  // Check attempts
  if (data.attempts >= MAX_ATTEMPTS) {
    return { success: false, error: "locked" };
  }

  // Check code match
  if (data.code === input.trim()) {
    clearOTP();
    logAuditEvent("OTP_SUCCESS", "OTP verified successfully");
    return { success: true };
  }

  // Increment attempts
  const newAttempts = data.attempts + 1;
  saveOTPData({ ...data, attempts: newAttempts });
  logAuditEvent(
    "OTP_FAILED",
    `Invalid OTP attempt ${newAttempts}/${MAX_ATTEMPTS}`,
  );

  if (newAttempts >= MAX_ATTEMPTS) {
    return { success: false, error: "locked" };
  }

  return { success: false, error: "invalid" };
}

/** Remove OTP data from localStorage */
export function clearOTP(): void {
  localStorage.removeItem(OTP_STORAGE_KEY);
}

/** Returns true if admin can request a new OTP (not in rate limit window) */
export function canRequestOTP(): boolean {
  const data = getOTPData();
  if (!data) return true;
  return Date.now() - data.lastRequest >= RATE_LIMIT_MS;
}

/** Returns seconds remaining in rate limit cooldown (0 if not in cooldown) */
export function getOTPCooldownSeconds(): number {
  const data = getOTPData();
  if (!data) return 0;
  const remaining = RATE_LIMIT_MS - (Date.now() - data.lastRequest);
  return Math.max(0, Math.ceil(remaining / 1000));
}

/** Returns seconds until OTP expires (0 if already expired or no OTP) */
export function getOTPExpirySeconds(): number {
  const data = getOTPData();
  if (!data) return 0;
  const remaining = OTP_EXPIRY_MS - (Date.now() - data.timestamp);
  return Math.max(0, Math.ceil(remaining / 1000));
}

/** Returns number of failed attempts so far */
export function getOTPAttempts(): number {
  const data = getOTPData();
  if (!data) return 0;
  return data.attempts;
}

/** Returns masked phone number for privacy display */
export function getMaskedPhone(): string {
  return "0303******58";
}
