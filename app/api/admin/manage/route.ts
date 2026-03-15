// ─────────────────────────────────────────────────────────────
//  PATCH /api/admin/manage
//  Updates admin-managed fields (accountStatus, kycStatus, adminNotes)
//  for a given user directly in Redis.
//  All writes are confirmed before returning success.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { AuthUser, RK } from "@/lib/redis";

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, accountStatus, kycStatus, adminNotes } = body as {
      email?: string;
      accountStatus?: "active" | "suspended" | "frozen" | "closed";
      kycStatus?: "unverified" | "pending" | "verified" | "rejected";
      adminNotes?: string;
    };

    if (!email) {
      return NextResponse.json({ error: "email is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── Load the auth record ────────────────────────────────
    const authUser = await redis.get<AuthUser>(RK.authUser(normalizedEmail));
    if (!authUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ── Apply updates to auth:user: record ─────────────────
    const updatedUser: AuthUser = { ...authUser };
    if (accountStatus !== undefined) updatedUser.accountStatus = accountStatus;
    if (adminNotes    !== undefined) updatedUser.adminNotes    = adminNotes;

    await redis.set(RK.authUser(normalizedEmail), updatedUser);

    // ── If kycStatus provided, also update kyc:status: key ─
    if (kycStatus !== undefined) {
      await redis.set(RK.kycStatus(normalizedEmail), kycStatus);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PATCH /api/admin/manage]", err);
    return NextResponse.json({ error: "Failed to update user" }, { status: 500 });
  }
}
