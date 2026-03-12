// ─────────────────────────────────────────────────────────────
//  GET /api/admin/users
//  Returns all registered users from Upstash Redis.
//  Used by the admin panel to show users who registered from
//  any device (not just the admin's browser localStorage).
// ─────────────────────────────────────────────────────────────
import { NextResponse } from "next/server";
import redis, { AuthUser } from "@/lib/redis";
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
    // Return empty so admin panel degrades gracefully
    return NextResponse.json({ success: false, users: [] });
  }
}
