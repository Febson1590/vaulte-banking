// ─────────────────────────────────────────────────────────────
//  Vaulte — Upstash Redis Client (lazy-initialized)
//  Serverless Redis for OTPs, tokens, rate limits, login history
// ─────────────────────────────────────────────────────────────
import { Redis } from "@upstash/redis";

// Lazy singleton — only instantiated on first use (not at build time)
let _redis: Redis | null = null;

function getRedis(): Redis {
  if (!_redis) {
    const url   = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;
    if (!url || !token) {
      throw new Error(
        "Upstash Redis is not configured. Please set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN in your .env.local file. See .env.example for setup instructions."
      );
    }
    _redis = new Redis({ url, token });
  }
  return _redis;
}

// Proxy that defers instantiation to first method call
const redis = new Proxy({} as Redis, {
  get(_target, prop: string) {
    const client = getRedis();
    const val = (client as unknown as Record<string, unknown>)[prop];
    if (typeof val === "function") return val.bind(client);
    return val;
  },
});

export default redis;

// ─── Redis Key Factories ────────────────────────────────────
export const RK = {
  authUser:       (email: string) => `auth:user:${email.toLowerCase()}`,
  verifyOtp:      (email: string) => `otp:verify:${email.toLowerCase()}`,
  loginOtp:       (email: string) => `otp:login:${email.toLowerCase()}`,
  resetToken:     (token: string) => `reset:token:${token}`,
  rateLoginEmail: (email: string) => `rate:login:email:${email.toLowerCase()}`,
  rateLoginIp:    (ip: string)    => `rate:login:ip:${ip}`,
  rateOtpVerify:  (email: string) => `rate:otp:verify:${email.toLowerCase()}`,
  rateResendOtp:  (email: string) => `rate:resend:${email.toLowerCase()}`,
  rateForgot:     (email: string) => `rate:forgot:${email.toLowerCase()}`,
  rateForgotIp:   (ip: string)    => `rate:forgot:ip:${ip}`,
  loginHistory:   (userId: string) => `login:history:${userId}`,
  // KYC status — cross-device sync
  kycStatus:      (email: string) => `kyc:status:${email.toLowerCase()}`,
  // Full KYC submission data (doc type, nationality, dob, etc.)
  kycData:        (email: string) => `kyc:data:${email.toLowerCase()}`,
  // httpOnly session token → { email, userId, createdAt }
  session:        (token: string) => `session:${token}`,
  // User banking state (accounts, transactions, card, preferences, etc.)
  userState:      (email: string) => `user:state:${email.toLowerCase()}`,
  // User profile photo (stored as base64 data URL)
  userPhoto:      (email: string) => `user:photo:${email.toLowerCase()}`,
} as const;

// ─── Session Record ───────────────────────────────────────────
export interface SessionRecord {
  email:     string;
  userId:    string;
  createdAt: string;
}

// ─── Auth User Record Interface ──────────────────────────────
export interface AuthUser {
  id:                    string;
  firstName:             string;
  lastName:              string;
  email:                 string;
  passwordHash:          string;
  emailVerified:         boolean;
  createdAt:             string;
  failedLoginAttempts:   number;
  lastFailedLoginAt:     string | null;
  accountLockedUntil:    string | null;
  lastLoginIp:           string | null;
  knownIps:              string[];
  // Admin-managed fields (written via /api/admin/manage)
  accountStatus?:        "active" | "suspended" | "frozen" | "closed";
  adminNotes?:           string;
  profilePhoto?:         string;
}

export interface OtpRecord {
  code:          string;
  expiresAt:     number;
  attempts:      number;
  lastResendAt:  number;
}

export interface ResetTokenRecord {
  email:     string;
  expiresAt: number;
  used:      boolean;
}

export interface RateLimitRecord {
  count:        number;
  windowStart:  number;
  lockedUntil?: number;
}

export interface LoginRecord {
  timestamp:  string;
  ip:         string;
  userAgent:  string;
  device:     string;
  browser:    string;
  status:     "success" | "failed";
  isNewIp:    boolean;
}
