// ─────────────────────────────────────────────────────────────
//  POST /api/auth/register
//  Registers a new user, stores hashed credentials in Redis,
//  generates a verification OTP, and sends verification email.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { RK, AuthUser, OtpRecord } from "@/lib/redis";
import {
  hashPassword,
  generateOTP,
  generateSecureToken,
  validatePasswordStrength,
  VERIFY_OTP_TTL_MS,
  msToSeconds,
  getClientIP,
} from "@/lib/authHelpers";
import { sendVerificationCode } from "@/lib/emailService";

export async function POST(req: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await req.json();

    // ── Input Validation ──────────────────────────────────────
    if (!firstName?.trim() || !lastName?.trim()) {
      return NextResponse.json({ error: "First and last name are required." }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }
    const pwStrength = validatePasswordStrength(password);
    if (!pwStrength.valid) {
      return NextResponse.json({ error: pwStrength.message }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── Check if email already exists in Redis ─────────────────
    const existing = await redis.get<AuthUser>(RK.authUser(normalizedEmail));
    if (existing) {
      return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 });
    }

    // ── Hash password + create user record ────────────────────
    const passwordHash = await hashPassword(password);
    const userId = `user-${Date.now()}-${generateSecureToken(4)}`;

    const authUser: AuthUser = {
      id:                  userId,
      firstName:           firstName.trim(),
      lastName:            lastName.trim(),
      email:               normalizedEmail,
      passwordHash,
      emailVerified:       false,
      createdAt:           new Date().toISOString(),
      failedLoginAttempts: 0,
      lastFailedLoginAt:   null,
      accountLockedUntil:  null,
      lastLoginIp:         getClientIP(req),
      knownIps:            [],
    };

    // Store in Redis (no expiry — permanent user record)
    await redis.set(RK.authUser(normalizedEmail), authUser);

    // ── Generate + store OTP ──────────────────────────────────
    const code = generateOTP();
    const otpRecord: OtpRecord = {
      code,
      expiresAt:    Date.now() + VERIFY_OTP_TTL_MS,
      attempts:     0,
      lastResendAt: Date.now(),
    };
    await redis.set(RK.verifyOtp(normalizedEmail), otpRecord, {
      ex: msToSeconds(VERIFY_OTP_TTL_MS),
    });

    // ── Send verification email ───────────────────────────────
    const emailResult = await sendVerificationCode({
      to:        normalizedEmail,
      firstName: firstName.trim(),
      code,
    });

    if (!emailResult.success) {
      console.error("[register] Email send failed:", emailResult.error);
      // Continue — user is created; they can resend
    }

    return NextResponse.json({
      success:  true,
      userId,
      email:    normalizedEmail,
      message:  "Account created. Verification code sent to your email.",
      emailSent: emailResult.success,
    });
  } catch (err) {
    console.error("[POST /api/auth/register]", err);
    return NextResponse.json({ error: "Registration failed. Please try again." }, { status: 500 });
  }
}
