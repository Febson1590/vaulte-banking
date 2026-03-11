// ─────────────────────────────────────────────────────────────
//  POST /api/auth/resend-login-otp
//  Resends the login step-up OTP with cooldown enforcement.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { RK, AuthUser, OtpRecord } from "@/lib/redis";
import {
  generateOTP,
  getClientIP,
  parseUserAgent,
  LOGIN_OTP_TTL_MS,
  RESEND_COOLDOWN_MS,
  msToSeconds,
} from "@/lib/authHelpers";
import { sendLoginOtp } from "@/lib/emailService";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ error: "Email is required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const authUser = await redis.get<AuthUser>(RK.authUser(normalizedEmail));
    if (!authUser) {
      return NextResponse.json({ success: true, message: "If your email is registered, a new code has been sent." });
    }

    // ── Cooldown check ────────────────────────────────────────
    const existing = await redis.get<OtpRecord>(RK.loginOtp(normalizedEmail));
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

    // ── New OTP ───────────────────────────────────────────────
    const code = generateOTP();
    const otpRecord: OtpRecord = {
      code,
      expiresAt:    Date.now() + LOGIN_OTP_TTL_MS,
      attempts:     0,
      lastResendAt: Date.now(),
    };
    await redis.set(RK.loginOtp(normalizedEmail), otpRecord, {
      ex: msToSeconds(LOGIN_OTP_TTL_MS),
    });

    const ip     = getClientIP(req);
    const ua     = req.headers.get("user-agent") ?? "";
    const { device } = parseUserAgent(ua);
    const timeStr    = new Date().toLocaleString("en-US", {
      dateStyle: "medium", timeStyle: "short", timeZone: "UTC",
    }) + " UTC";

    const result = await sendLoginOtp({
      to:        normalizedEmail,
      firstName: authUser.firstName,
      code,
      ip,
      device,
      time:      timeStr,
    });

    return NextResponse.json({
      success:   result.success,
      message:   "A new login code has been sent to your email.",
      emailSent: result.success,
    });
  } catch (err) {
    console.error("[POST /api/auth/resend-login-otp]", err);
    return NextResponse.json({ error: "Failed to resend code. Please try again." }, { status: 500 });
  }
}
