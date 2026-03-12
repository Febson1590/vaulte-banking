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

    // ── Delete all Redis keys for this user ───────────────────
    await redis.del(
      RK.authUser(normalizedEmail),
      RK.verifyOtp(normalizedEmail),
      RK.loginOtp(normalizedEmail),
      RK.rateLoginEmail(normalizedEmail),
      RK.rateLoginIp(normalizedEmail),   // best-effort; real IP key may differ
      RK.rateOtpVerify(normalizedEmail),
      RK.rateResendOtp(normalizedEmail),
      RK.rateForgot(normalizedEmail),
      RK.loginHistory(userId),
    );

    return NextResponse.json({ success: true, message: "User deleted successfully." });
  } catch (err) {
    console.error("[DELETE /api/admin/users]", err);
    return NextResponse.json({ error: "Failed to delete user." }, { status: 500 });
  }
}
