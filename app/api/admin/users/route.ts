// ─────────────────────────────────────────────────────────────
//  GET  /api/admin/users  — list all users from Redis
//  DELETE /api/admin/users — permanently delete a user from Redis
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { AuthUser, RK } from "@/lib/redis";
import type { VaulteUser } from "@/lib/vaulteState";

// USD conversion rates for total balance calculation
const RATES: Record<string, number> = { USD: 1, EUR: 1.09, GBP: 1.27, BTC: 66000 };

function totalBalanceUSD(state: Record<string, unknown> | null): number {
  if (!state?.accounts) return 0;
  const accounts = state.accounts as Array<{ balance: number; currency: string }>;
  return accounts.reduce((sum, a) => sum + (a.balance ?? 0) * (RATES[a.currency] ?? 1), 0);
}

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

    if (authUsers.length === 0) {
      return NextResponse.json({ success: true, users: [], userCount: 0 });
    }

    // Batch-fetch KYC status, KYC data, and banking state for all users in
    // three parallel round-trips — avoids N+1 Redis calls.
    const statusKeys = authUsers.map(u => RK.kycStatus(u.email))  as [string, ...string[]];
    const dataKeys   = authUsers.map(u => RK.kycData(u.email))    as [string, ...string[]];
    const stateKeys  = authUsers.map(u => RK.userState(u.email))  as [string, ...string[]];

    const [kycStatuses, kycDataArr, userStates] = await Promise.all([
      redis.mget<(string | null)[]>(...statusKeys),
      redis.mget<(Record<string, string> | null)[]>(...dataKeys),
      redis.mget<(Record<string, unknown> | null)[]>(...stateKeys),
    ]);

    // Map AuthUser (Redis) → VaulteUser-compatible shape for the admin panel.
    // ALL fields come from Redis — no localStorage override.
    const users: (VaulteUser & { totalBalanceUSD: number; bankingState: Record<string, unknown> | null })[] =
      authUsers.map((u, i) => ({
        id:             u.id,
        firstName:      u.firstName,
        lastName:       u.lastName,
        email:          u.email,
        password:       "",                          // never expose real hash
        kycStatus:      (kycStatuses[i] ?? "unverified") as VaulteUser["kycStatus"],
        kycDocType:     kycDataArr[i]?.docType      ?? undefined,
        kycSubmittedAt: kycDataArr[i]?.submittedAt  ?? undefined,
        kycNationality: kycDataArr[i]?.nationality  ?? undefined,
        kycAddress:     kycDataArr[i]?.address      ?? undefined,
        kycCity:        kycDataArr[i]?.city         ?? undefined,
        createdAt:      u.createdAt,
        // Admin-managed fields stored on the auth record itself
        accountStatus:  (u.accountStatus ?? "active") as VaulteUser["accountStatus"],
        adminNotes:     u.adminNotes ?? undefined,
        // Banking state (full VaulteState from Redis — may be null for new users)
        bankingState:   userStates[i] ?? null,
        totalBalanceUSD: totalBalanceUSD(userStates[i] ?? null),
      }));

    return NextResponse.json({ success: true, users, userCount: users.length });
  } catch (err) {
    console.error("[GET /api/admin/users]", err);
    return NextResponse.json({ success: false, users: [], userCount: 0 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { userId, email } = await req.json();

    if (!userId || !email) {
      return NextResponse.json({ error: "userId and email are required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── Delete all Redis keys for this user ──────────────────────
    // Auth + OTP + rate limiting keys
    await redis.del(RK.authUser(normalizedEmail));
    await redis.del(RK.verifyOtp(normalizedEmail));
    await redis.del(RK.loginOtp(normalizedEmail));
    await redis.del(RK.rateLoginEmail(normalizedEmail));
    await redis.del(RK.rateOtpVerify(normalizedEmail));
    await redis.del(RK.rateResendOtp(normalizedEmail));
    await redis.del(RK.rateForgot(normalizedEmail));
    await redis.del(RK.loginHistory(userId));
    // KYC, banking state, and user profile data
    await redis.del(RK.kycStatus(normalizedEmail));
    await redis.del(RK.kycData(normalizedEmail));
    await redis.del(RK.userState(normalizedEmail));
    // Invalidate all active session tokens for this user by scanning
    // session:* keys and deleting any whose email matches this user.
    // This forces logout on all devices immediately after deletion.
    let cursor = 0;
    do {
      const [nextCursor, keys] = await redis.scan(cursor, { match: "session:*", count: 50 });
      cursor = Number(nextCursor);
      if (keys.length > 0) {
        const values = await redis.mget<({ email: string } | null)[]>(...(keys as [string, ...string[]]));
        const toDelete = keys.filter((_, i) => (values[i] as { email?: string } | null)?.email === normalizedEmail);
        if (toDelete.length > 0) {
          await Promise.all(toDelete.map(k => redis.del(k)));
        }
      }
    } while (cursor !== 0);
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
