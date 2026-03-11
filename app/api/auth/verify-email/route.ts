// ─────────────────────────────────────────────────────────────
//  POST /api/auth/verify-email
//  Verifies the 6-digit email verification OTP.
//  Marks email_verified = true and activates the account.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { RK, AuthUser, OtpRecord } from "@/lib/redis";
import { OTP_ATTEMPT_CONFIG, msToSeconds } from "@/lib/authHelpers";
import { sendWelcomeEmail } from "@/lib/emailService";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── Load OTP record ───────────────────────────────────────
    const otpRecord = await redis.get<OtpRecord>(RK.verifyOtp(normalizedEmail));
    if (!otpRecord) {
      return NextResponse.json(
        { error: "Verification code has expired or was not issued. Please request a new one." },
        { status: 400 }
      );
    }

    // ── Check attempt limit ───────────────────────────────────
    if (otpRecord.attempts >= OTP_ATTEMPT_CONFIG.maxAttempts) {
      // Delete OTP to force a resend
      await redis.del(RK.verifyOtp(normalizedEmail));
      return NextResponse.json(
        { error: "Too many incorrect attempts. Please request a new verification code.", tooManyAttempts: true },
        { status: 429 }
      );
    }

    // ── Check expiry ──────────────────────────────────────────
    if (Date.now() > otpRecord.expiresAt) {
      await redis.del(RK.verifyOtp(normalizedEmail));
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one.", expired: true },
        { status: 400 }
      );
    }

    // ── Validate code ─────────────────────────────────────────
    if (code.trim() !== otpRecord.code) {
      // Increment attempt counter
      const updated: OtpRecord = { ...otpRecord, attempts: otpRecord.attempts + 1 };
      const remaining = msToSeconds(otpRecord.expiresAt - Date.now());
      await redis.set(RK.verifyOtp(normalizedEmail), updated, { ex: remaining });

      const attemptsLeft = OTP_ATTEMPT_CONFIG.maxAttempts - updated.attempts;
      return NextResponse.json(
        {
          error:        `Incorrect code. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining.`,
          attemptsLeft,
        },
        { status: 400 }
      );
    }

    // ── Code correct — activate account ──────────────────────
    const authUser = await redis.get<AuthUser>(RK.authUser(normalizedEmail));
    if (!authUser) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const updatedUser: AuthUser = { ...authUser, emailVerified: true };
    await redis.set(RK.authUser(normalizedEmail), updatedUser);

    // Clean up OTP
    await redis.del(RK.verifyOtp(normalizedEmail));

    // Send welcome email (fire-and-forget)
    sendWelcomeEmail({
      to:        normalizedEmail,
      firstName: authUser.firstName,
      email:     normalizedEmail,
    }).catch(e => console.error("[verify-email] Welcome email failed:", e));

    return NextResponse.json({
      success:   true,
      message:   "Email verified successfully. Your account is now active.",
      userId:    authUser.id,
      firstName: authUser.firstName,
      lastName:  authUser.lastName,
      email:     normalizedEmail,
    });
  } catch (err) {
    console.error("[POST /api/auth/verify-email]", err);
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
  }
}
