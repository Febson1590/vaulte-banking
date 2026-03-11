// ─────────────────────────────────────────────────────────────
//  POST /api/auth/forgot-password
//  Generates a secure password reset token and emails a link.
//  Does NOT reveal whether the email exists (security best practice).
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { RK, AuthUser, ResetTokenRecord, RateLimitRecord } from "@/lib/redis";
import {
  generateSecureToken,
  getClientIP,
  FORGOT_RATE_CONFIG,
  RESET_TOKEN_TTL_MS,
  msToSeconds,
} from "@/lib/authHelpers";
import { sendPasswordReset } from "@/lib/emailService";

const NEUTRAL_RESPONSE = {
  success: true,
  message: "If an account exists for this email, a password reset link has been sent.",
};

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "A valid email address is required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const ip              = getClientIP(req);

    // ── Rate limit per email ──────────────────────────────────
    const emailRateKey = RK.rateForgot(normalizedEmail);
    const emailRate    = await redis.get<RateLimitRecord>(emailRateKey) ?? { count: 0, windowStart: Date.now() };
    const emailWindowReset = Date.now() - emailRate.windowStart > FORGOT_RATE_CONFIG.windowMs;
    const emailNewRate: RateLimitRecord = {
      count:       emailWindowReset ? 1 : emailRate.count + 1,
      windowStart: emailWindowReset ? Date.now() : emailRate.windowStart,
    };

    if (!emailWindowReset && emailRate.count >= FORGOT_RATE_CONFIG.maxAttempts) {
      // Still return neutral response — don't leak timing info
      return NextResponse.json(NEUTRAL_RESPONSE);
    }
    await redis.set(emailRateKey, emailNewRate, { ex: msToSeconds(FORGOT_RATE_CONFIG.windowMs) });

    // ── Rate limit per IP ──────────────────────────────────────
    const ipRateKey = RK.rateForgotIp(ip);
    const ipRate    = await redis.get<RateLimitRecord>(ipRateKey) ?? { count: 0, windowStart: Date.now() };
    const ipWindowReset = Date.now() - ipRate.windowStart > FORGOT_RATE_CONFIG.windowMs;
    const ipNewRate: RateLimitRecord = {
      count:       ipWindowReset ? 1 : ipRate.count + 1,
      windowStart: ipWindowReset ? Date.now() : ipRate.windowStart,
    };
    if (!ipWindowReset && ipRate.count >= FORGOT_RATE_CONFIG.maxAttempts * 3) {
      return NextResponse.json(NEUTRAL_RESPONSE);
    }
    await redis.set(ipRateKey, ipNewRate, { ex: msToSeconds(FORGOT_RATE_CONFIG.windowMs) });

    // ── Load user (silently skip if not found) ────────────────
    const authUser = await redis.get<AuthUser>(RK.authUser(normalizedEmail));
    if (!authUser) {
      return NextResponse.json(NEUTRAL_RESPONSE);
    }

    // ── Generate reset token ──────────────────────────────────
    const token = generateSecureToken(48);
    const record: ResetTokenRecord = {
      email:     normalizedEmail,
      expiresAt: Date.now() + RESET_TOKEN_TTL_MS,
      used:      false,
    };
    await redis.set(RK.resetToken(token), record, {
      ex: msToSeconds(RESET_TOKEN_TTL_MS),
    });

    // ── Build reset URL ───────────────────────────────────────
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://vaulte-banking.vercel.app";
    const resetUrl = `${baseUrl}/reset-password?token=${token}`;

    // ── Send email ────────────────────────────────────────────
    const timeStr = new Date().toLocaleString("en-US", {
      dateStyle: "medium", timeStyle: "short", timeZone: "UTC",
    }) + " UTC";

    await sendPasswordReset({
      to:         normalizedEmail,
      firstName:  authUser.firstName,
      resetUrl,
      ip,
      time:       timeStr,
    });

    return NextResponse.json(NEUTRAL_RESPONSE);
  } catch (err) {
    console.error("[POST /api/auth/forgot-password]", err);
    // Always return neutral response on error too
    return NextResponse.json(NEUTRAL_RESPONSE);
  }
}
