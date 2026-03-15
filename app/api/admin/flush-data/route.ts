// ─────────────────────────────────────────────────────────────
//  POST /api/admin/flush-data  — ONE-SHOT: delete all user data
//  Scans and deletes every user-related key in Redis.
//  Admin credentials are hardcoded client-side — nothing to preserve.
//  DELETE THIS FILE AFTER USE.
// ─────────────────────────────────────────────────────────────
import { NextResponse } from "next/server";
import redis from "@/lib/redis";

const PATTERNS = [
  "auth:user:*",
  "kyc:status:*",
  "kyc:data:*",
  "user:state:*",
  "user:photo:*",
  "session:*",
  "otp:verify:*",
  "otp:login:*",
  "login:history:*",
  "rate:login:email:*",
  "rate:login:ip:*",
  "rate:otp:verify:*",
  "rate:resend:*",
  "rate:forgot:*",
  "rate:forgot:ip:*",
  "reset:token:*",
];

async function deletePattern(pattern: string): Promise<number> {
  let cursor = 0;
  let deleted = 0;
  do {
    const [nextCursor, keys] = await redis.scan(cursor, { match: pattern, count: 100 });
    cursor = Number(nextCursor);
    if (keys.length > 0) {
      await Promise.all(keys.map((k: string) => redis.del(k)));
      deleted += keys.length;
    }
  } while (cursor !== 0);
  return deleted;
}

export async function POST() {
  try {
    const results: Record<string, number> = {};

    for (const pattern of PATTERNS) {
      results[pattern] = await deletePattern(pattern);
    }

    const totalDeleted = Object.values(results).reduce((a, b) => a + b, 0);

    return NextResponse.json({
      success: true,
      totalDeleted,
      breakdown: results,
      message: "All user data has been wiped. Admin credentials are hardcoded — no Redis keys needed for admin access.",
    });
  } catch (err) {
    console.error("[POST /api/admin/flush-data]", err);
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
