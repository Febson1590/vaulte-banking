// ─────────────────────────────────────────────────────────────
//  POST /api/auth/reset-password
//  Validates reset token, hashes new password, updates account,
//  and invalidates the token immediately after use.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { RK, AuthUser, ResetTokenRecord } from "@/lib/redis";
import { hashPassword, validatePasswordStrength } from "@/lib/authHelpers";

export async function POST(req: NextRequest) {
  try {
    const { token, password, confirmPassword } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Reset token is required." }, { status: 400 });
    }
    if (!password || !confirmPassword) {
      return NextResponse.json({ error: "Both password fields are required." }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match." }, { status: 400 });
    }

    // ── Validate password strength ────────────────────────────
    const strength = validatePasswordStrength(password);
    if (!strength.valid) {
      return NextResponse.json({ error: strength.message }, { status: 400 });
    }

    // ── Load and validate token ───────────────────────────────
    const tokenRecord = await redis.get<ResetTokenRecord>(RK.resetToken(token));
    if (!tokenRecord) {
      return NextResponse.json(
        { error: "This reset link is invalid or has expired. Please request a new one.", invalid: true },
        { status: 400 }
      );
    }
    if (tokenRecord.used) {
      return NextResponse.json(
        { error: "This reset link has already been used. Please request a new one.", invalid: true },
        { status: 400 }
      );
    }
    if (Date.now() > tokenRecord.expiresAt) {
      await redis.del(RK.resetToken(token));
      return NextResponse.json(
        { error: "This reset link has expired. Please request a new one.", expired: true },
        { status: 400 }
      );
    }

    const normalizedEmail = tokenRecord.email;

    // ── Load user ─────────────────────────────────────────────
    const authUser = await redis.get<AuthUser>(RK.authUser(normalizedEmail));
    if (!authUser) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    // ── Hash new password ─────────────────────────────────────
    const passwordHash = await hashPassword(password);

    // ── Update user credentials ───────────────────────────────
    const updatedUser: AuthUser = {
      ...authUser,
      passwordHash,
      failedLoginAttempts: 0,
      accountLockedUntil:  null,
      lastFailedLoginAt:   null,
    };
    await redis.set(RK.authUser(normalizedEmail), updatedUser);

    // ── Invalidate token immediately (single-use) ─────────────
    await redis.set(RK.resetToken(token), { ...tokenRecord, used: true }, { ex: 60 });

    // ── Clear any login OTPs in flight ────────────────────────
    await redis.del(RK.loginOtp(normalizedEmail));

    return NextResponse.json({
      success: true,
      message: "Your password has been reset successfully. You can now sign in.",
    });
  } catch (err) {
    console.error("[POST /api/auth/reset-password]", err);
    return NextResponse.json({ error: "Password reset failed. Please try again." }, { status: 500 });
  }
}

// ─────────────────────────────────────────────────────────────
//  GET /api/auth/reset-password?token=xxx
//  Validates token existence/expiry (for page load pre-check).
// ─────────────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) {
      return NextResponse.json({ valid: false, error: "No token provided." }, { status: 400 });
    }
    const record = await redis.get<ResetTokenRecord>(RK.resetToken(token));
    if (!record || record.used || Date.now() > record.expiresAt) {
      return NextResponse.json({ valid: false, error: "Token is invalid or expired." }, { status: 400 });
    }
    return NextResponse.json({ valid: true });
  } catch (err) {
    console.error("[GET /api/auth/reset-password]", err);
    return NextResponse.json({ valid: false, error: "Token validation failed." }, { status: 500 });
  }
}
