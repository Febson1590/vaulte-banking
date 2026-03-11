// ─────────────────────────────────────────────────────────────
//  Vaulte — Auth Helpers
//  OTP generation, token generation, password hashing, IP utils
// ─────────────────────────────────────────────────────────────
import crypto from "crypto";
import bcrypt from "bcryptjs";

// ─── OTP / Code Generation ───────────────────────────────────

/**
 * Generate a cryptographically random 6-digit OTP code.
 * Uses crypto.randomInt to avoid modulo bias.
 */
export function generateOTP(): string {
  const code = crypto.randomInt(100_000, 999_999);
  return String(code);
}

/**
 * Generate a cryptographically secure URL-safe token.
 * Default 48 bytes = 96 hex chars — extremely hard to guess.
 */
export function generateSecureToken(bytes = 48): string {
  return crypto.randomBytes(bytes).toString("hex");
}

// ─── Password Hashing ────────────────────────────────────────

const SALT_ROUNDS = 12;

/** Hash a plain-text password using bcrypt. */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/** Verify a plain-text password against a bcrypt hash. */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// ─── Password Validation ─────────────────────────────────────

export interface PasswordStrength {
  valid:    boolean;
  message?: string;
}

/**
 * Validate password strength for a banking-grade application.
 * Requirements: min 8 chars, at least one uppercase, one lowercase,
 * one digit, one special character.
 */
export function validatePasswordStrength(password: string): PasswordStrength {
  if (!password || password.length < 8) {
    return { valid: false, message: "Password must be at least 8 characters." };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: "Password must contain at least one lowercase letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one number." };
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    return { valid: false, message: "Password must contain at least one special character (e.g. @, #, !)." };
  }
  return { valid: true };
}

// ─── IP Extraction ───────────────────────────────────────────

/**
 * Extract the real client IP from a Next.js Request object.
 * Handles common proxy headers (Vercel, Cloudflare, etc.).
 */
export function getClientIP(req: Request): string {
  const headers = req.headers;
  return (
    headers.get("x-real-ip") ??
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    "unknown"
  );
}

// ─── User Agent Parsing ──────────────────────────────────────

export interface DeviceInfo {
  browser: string;
  device:  string;
  os:      string;
}

/**
 * Parse basic device / browser info from a User-Agent string.
 * This is a lightweight parser sufficient for display purposes.
 */
export function parseUserAgent(ua: string = ""): DeviceInfo {
  const lower = ua.toLowerCase();

  // Browser detection
  let browser = "Unknown Browser";
  if (lower.includes("edg/"))        browser = "Microsoft Edge";
  else if (lower.includes("chrome")) browser = "Chrome";
  else if (lower.includes("safari")) browser = "Safari";
  else if (lower.includes("firefox")) browser = "Firefox";
  else if (lower.includes("opera"))   browser = "Opera";

  // OS detection
  let os = "Unknown OS";
  if (lower.includes("windows nt"))  os = "Windows";
  else if (lower.includes("mac os")) os = "macOS";
  else if (lower.includes("android")) os = "Android";
  else if (lower.includes("iphone"))  os = "iOS";
  else if (lower.includes("ipad"))    os = "iPadOS";
  else if (lower.includes("linux"))   os = "Linux";

  // Device type
  let device = "Desktop";
  if (lower.includes("mobile") || lower.includes("android") || lower.includes("iphone")) {
    device = "Mobile";
  } else if (lower.includes("ipad") || lower.includes("tablet")) {
    device = "Tablet";
  }

  return { browser, device, os };
}

// ─── Rate Limiting (window-based) ────────────────────────────

export interface RateLimitState {
  allowed:    boolean;
  remaining:  number;
  lockedUntil?: number;  // Unix ms
  message?:   string;
}

export interface RateLimitConfig {
  maxAttempts:    number;   // max within window
  windowMs:       number;   // rolling window in ms
  lockoutMs:      number;   // lockout duration in ms
}

// Login rate limit config
export const LOGIN_RATE_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  windowMs:    15 * 60 * 1000,   // 15 min window
  lockoutMs:   15 * 60 * 1000,   // 15 min lockout
};

// OTP verification attempts
export const OTP_ATTEMPT_CONFIG: RateLimitConfig = {
  maxAttempts: 5,
  windowMs:    10 * 60 * 1000,   // 10 min window
  lockoutMs:   15 * 60 * 1000,   // 15 min lockout
};

// Resend OTP cooldown
export const RESEND_COOLDOWN_MS = 60 * 1000;  // 60 seconds

// Forgot password: max 3 per hour per email/IP
export const FORGOT_RATE_CONFIG: RateLimitConfig = {
  maxAttempts: 3,
  windowMs:    60 * 60 * 1000,   // 1 hour
  lockoutMs:   60 * 60 * 1000,   // 1 hour
};

// ─── Expiry Helpers ──────────────────────────────────────────

export const VERIFY_OTP_TTL_MS  = 10 * 60 * 1000;  // 10 minutes
export const LOGIN_OTP_TTL_MS   =  5 * 60 * 1000;  //  5 minutes
export const RESET_TOKEN_TTL_MS = 15 * 60 * 1000;  // 15 minutes

/** Convert ms TTL to seconds for Redis EXPIRE. */
export function msToSeconds(ms: number): number {
  return Math.ceil(ms / 1000);
}

/** Format a Unix timestamp as a human-readable string. */
export function formatExpiry(ms: number): string {
  const minutes = Math.ceil((ms - Date.now()) / 60_000);
  if (minutes <= 1) return "less than a minute";
  return `${minutes} minutes`;
}
