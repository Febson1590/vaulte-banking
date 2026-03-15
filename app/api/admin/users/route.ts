// ─────────────────────────────────────────────────────────────
//  GET  /api/admin/users  — list all users from Redis
//  DELETE /api/admin/users — permanently delete a user from Redis
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { AuthUser, RK } from "@/lib/redis";
import type { VaulteUser } from "@/lib/vaulteState";

export async function GET() {
  try {
    const authUsers: AuthUser[] = [];
    let cursor = 0;

    // Scan all auth:user:* keys from Redis
    do {
      const [nextCursor, keys] = await redis.scan(cursor, {
        match: "auth:user:*",
        count: 100,
      });
      cursor = Number(nextCursor);

      if (keys.length > 0) {
        const values = await redis.mget<(AuthUser | null)[]>(...(keys as [string, ...string[]]));
        (values as (AuthUser | null)[]).forEach(v => { if (v) authUsers.push(v); });
      }
    } while (cursor !== 0);

    // Map AuthUser (Redis) → VaulteUser-compatible shape for the admin panel
    const users: VaulteUser[] = authUsers.map(u => ({
      id:            u.id,
      firstName:     u.firstName,
      lastName:      u.lastName,
      email:         u.email,
      password:      "",            // never expose real hash
      kycStatus:     "unverified",  // default; overridden by localStorage admin copy
      createdAt:     u.createdAt,
      accountStatus: "active",
    }));

    return NextResponse.json({ success: true, users });
  } catch (err) {
    console.error("[GET /api/admin/users]", err);
    return NextResponse.json({ success: false, users: [] });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ error: "userId and email are required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── Delete all Redis keys for this user (one by one for reliability) ──
    await redis.del(RK.authUser(normalizedEmail));
    await redis.del(RK.verifyOtp(normalizedEmail));
    await redis.del(RK.loginOtp(normalizedEmail));
    await redis.del(RK.rateLoginEmail(normalizedEmail));
    await redis.del(RK.rateOtpVerify(normalizedEmail));
    await redis.del(RK.rateResendOtp(normalizedEmail));
    await redis.del(RK.rateForgot(normalizedEmail));
    await redis.del(RK.loginHistory(userId));
    // Note: rateLoginIp and rateForgotIp are keyed by IP address (unknown here),
    // so they expire naturally via their own TTL.

    // ── Verify the primary auth record is gone ────────────────
    const stillExists = await redis.exists(RK.authUser(normalizedEmail));
    if (stillExists) {
      console.error("[DELETE /api/admin/users] auth:user key still exists after del:", normalizedEmail);
      // Retry deletion of the primary key
      await redis.del(RK.authUser(normalizedEmail));
      const retryCheck = await redis.exists(RK.authUser(normalizedEmail));
      if (retryCheck) {
        return NextResponse.json(
          { error: "Failed to fully delete user from Redis. Please try again or delete manually from Upstash dashboard." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, message: "User deleted successfully." });
  } catch (err) {
    console.error("[DELETE /api/admin/users]", err);
    return NextResponse.json({ error: "Failed to delete user. Check that UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN are set in Vercel environment variables." }, { status: 500 });
  }
}
