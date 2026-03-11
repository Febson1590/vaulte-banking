// ─────────────────────────────────────────────────────────────
//  POST /api/auth/change-password
//  Verifies current password, then updates to new password.
//  Requires the user to be logged in (email passed in body).
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { RK, AuthUser } from "@/lib/redis";
import { verifyPassword, hashPassword, validatePasswordStrength } from "@/lib/authHelpers";

export async function POST(req: NextRequest) {
  try {
    const { email, currentPassword, newPassword, confirmPassword } = await req.json();

    // ── Input validation ──────────────────────────────────────
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }
    if (!currentPassword) {
      return NextResponse.json({ error: "Current password is required." }, { status: 400 });
    }
    if (!newPassword || !confirmPassword) {
      return NextResponse.json({ error: "New password and confirmation are required." }, { status: 400 });
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "New passwords do not match." }, { status: 400 });
    }
    if (newPassword === currentPassword) {
      return NextResponse.json({ error: "New password must be different from your current password." }, { status: 400 });
    }

    // ── Validate new password strength ────────────────────────
    const strength = validatePasswordStrength(newPassword);
    if (!strength.valid) {
      return NextResponse.json({ error: strength.message }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── Load user from Redis ──────────────────────────────────
    const authUser = await redis.get<AuthUser>(RK.authUser(normalizedEmail));
    if (!authUser) {
      // Return generic error to avoid email enumeration
      return NextResponse.json({ error: "Invalid credentials. Please try again." }, { status: 401 });
    }

    // ── Check account lock ────────────────────────────────────
    const lockUntilMs = authUser.accountLockedUntil ? new Date(authUser.accountLockedUntil).getTime() : 0;
    if (authUser.accountLockedUntil && Date.now() < lockUntilMs) {
      const mins = Math.ceil((lockUntilMs - Date.now()) / 60000);
      return NextResponse.json(
        { error: `Account is temporarily locked. Try again in ${mins} minute${mins !== 1 ? "s" : ""}.` },
        { status: 423 }
      );
    }

    // ── Verify current password ───────────────────────────────
    const valid = await verifyPassword(currentPassword, authUser.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect." }, { status: 401 });
    }

    // ── Hash and save new password ────────────────────────────
    const passwordHash = await hashPassword(newPassword);
    const updatedUser: AuthUser = {
      ...authUser,
      passwordHash,
      failedLoginAttempts: 0,
      accountLockedUntil:  null,
      lastFailedLoginAt:   null,
    };
    await redis.set(RK.authUser(normalizedEmail), updatedUser);

    // ── Invalidate any active login OTPs ─────────────────────
    await redis.del(RK.loginOtp(normalizedEmail));

    return NextResponse.json({
      success: true,
      message:  "Password changed successfully.",
    });
  } catch (err) {
    console.error("[POST /api/auth/change-password]", err);
    return NextResponse.json({ error: "Password change failed. Please try again." }, { status: 500 });
  }
}
