// ─────────────────────────────────────────────────────────────
//  POST /api/auth/resend-verification
//  Resends the account verification OTP with cooldown enforcement.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { RK, AuthUser, OtpRecord } from "@/lib/redis";
import {
  generateOTP,
  VERIFY_OTP_TTL_MS,
  RESEND_COOLDOWN_MS,
  msToSeconds,
} from "@/lib/authHelpers";
import { sendVerificationCode } from "@/lib/emailService";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── Check user exists ─────────────────────────────────────
    const authUser = await redis.get<AuthUser>(RK.authUser(normalizedEmail));
    if (!authUser) {
      // Generic message — don't reveal account existence
      return NextResponse.json({ success: true, message: "If your email is registered, a new code has been sent." });
    }
    if (authUser.emailVerified) {
      return NextResponse.json({ error: "This email is already verified." }, { status: 400 });
    }

    // ── Enforce resend cooldown ───────────────────────────────
    const existing = await redis.get<OtpRecord>(RK.verifyOtp(normalizedEmail));
    if (existing) {
      const elapsed = Date.now() - existing.lastResendAt;
      if (elapsed < RESEND_COOLDOWN_MS) {
        const waitSecs = Math.ceil((RESEND_COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          { error: `Please wait ${waitSecs} second${waitSecs === 1 ? "" : "s"} before requesting a new code.`, waitSecs },
          { status: 429 }
        );
      }
    }

    // ── Generate new OTP ──────────────────────────────────────
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

    // ── Send email ────────────────────────────────────────────
    const result = await sendVerificationCode({
      to:        normalizedEmail,
      firstName: authUser.firstName,
      code,
    });

    return NextResponse.json({
      success:   result.success,
      message:   "A new verification code has been sent to your email.",
      emailSent: result.success,
    });
  } catch (err) {
    console.error("[POST /api/auth/resend-verification]", err);
    return NextResponse.json({ error: "Failed to resend code. Please try again." }, { status: 500 });
  }
}
