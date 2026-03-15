// ─────────────────────────────────────────────────────────────
//  POST /api/admin/flush-data
//
//  ONE-TIME DATA WIPE — deletes every piece of user-generated
//  data from Redis while leaving all code, config, and env vars
//  untouched.
//
//  Protected by a secret key in the request body.
//  DELETE THIS FILE immediately after use.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis from "@/lib/redis";

// Every key pattern the app writes to Redis
const PATTERNS = [
  "auth:user:*",        // registered user records
  "session:*",          // active login sessions
  "otp:verify:*",       // email-verification OTP codes
  "otp:login:*",        // login step-up OTP codes
  "reset:token:*",      // password-reset tokens
  "rate:login:email:*", // login rate-limit (by email)
  "rate:login:ip:*",    // login rate-limit (by IP)
  "rate:otp:verify:*",  // OTP-verify rate-limit
  "rate:resend:*",      // resend-OTP rate-limit
  "rate:forgot:*",      // forgot-password rate-limit (by email)
  "rate:forgot:ip:*",   // forgot-password rate-limit (by IP)
  "login:history:*",    // per-user login history lists
  "kyc:status:*",       // KYC verification status
  "kyc:data:*",         // KYC submission details
  "user:state:*",       // full banking state (accounts, txns, card…)
];

// Simple single-use secret — change this before deploying if you want
// extra safety, then pass the same value in the request body.
const FLUSH_SECRET = "vaulte-flush-2026";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    if (body.secret !== FLUSH_SECRET) {
      return NextResponse.json(
        { error: "Invalid or missing secret." },
        { status: 401 },
      );
    }

    const report: Record<string, number> = {};
    let totalDeleted = 0;

    for (const pattern of PATTERNS) {
      let cursor = 0;
      let patternCount = 0;

      do {
        const [nextCursor, keys] = await redis.scan(cursor, {
          match: pattern,
          count: 100,
        });
        cursor = Number(nextCursor);

        if (keys.length > 0) {
          await Promise.all(keys.map((k) => redis.del(k)));
          patternCount += keys.length;
        }
      } while (cursor !== 0);

      report[pattern] = patternCount;
      totalDeleted += patternCount;
    }

    return NextResponse.json({
      success:      true,
      totalDeleted,
      breakdown:    report,
      message:      `Wiped ${totalDeleted} Redis key(s). All user data cleared. DELETE /api/admin/flush-data/route.ts now.`,
    });
  } catch (err) {
    console.error("[POST /api/admin/flush-data]", err);
    return NextResponse.json(
      { error: "Flush failed. Check UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN." },
      { status: 500 },
    );
  }
}
