// ─────────────────────────────────────────────────────────────
//  POST /api/auth/verify-login-otp
//  Verifies the login step-up OTP code.
//  On success, tracks login activity and returns user data.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { RK, AuthUser, OtpRecord, LoginRecord } from "@/lib/redis";
import {
  OTP_ATTEMPT_CONFIG,
  getClientIP,
  parseUserAgent,
  msToSeconds,
} from "@/lib/authHelpers";
import { sendLoginAlert } from "@/lib/emailService";

export async function POST(req: NextRequest) {
  try {
    const { email, code } = await req.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const ip              = getClientIP(req);
    const ua              = req.headers.get("user-agent") ?? "";
    const { device, browser, os } = parseUserAgent(ua);

    // ── Load OTP ──────────────────────────────────────────────
    const otpRecord = await redis.get<OtpRecord>(RK.loginOtp(normalizedEmail));
    if (!otpRecord) {
      return NextResponse.json(
        { error: "Login code has expired or was not issued. Please sign in again.", expired: true },
        { status: 400 }
      );
    }

    // ── Attempt limit ─────────────────────────────────────────
    if (otpRecord.attempts >= OTP_ATTEMPT_CONFIG.maxAttempts) {
      await redis.del(RK.loginOtp(normalizedEmail));
      return NextResponse.json(
        { error: "Too many incorrect attempts. Please sign in again.", tooManyAttempts: true },
        { status: 429 }
      );
    }

    // ── Expiry check ──────────────────────────────────────────
    if (Date.now() > otpRecord.expiresAt) {
      await redis.del(RK.loginOtp(normalizedEmail));
      return NextResponse.json(
        { error: "Login code has expired. Please sign in again.", expired: true },
        { status: 400 }
      );
    }

    // ── Code validation ───────────────────────────────────────
    if (code.trim() !== otpRecord.code) {
      const updated: OtpRecord = { ...otpRecord, attempts: otpRecord.attempts + 1 };
      const remaining = msToSeconds(otpRecord.expiresAt - Date.now());
      await redis.set(RK.loginOtp(normalizedEmail), updated, { ex: remaining });

      const attemptsLeft = OTP_ATTEMPT_CONFIG.maxAttempts - updated.attempts;
      return NextResponse.json(
        { error: `Incorrect code. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining.`, attemptsLeft },
        { status: 400 }
      );
    }

    // ── Code correct ──────────────────────────────────────────
    const authUser = await redis.get<AuthUser>(RK.authUser(normalizedEmail));
    if (!authUser) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    // Clean up OTP
    await redis.del(RK.loginOtp(normalizedEmail));

    // ── Detect new IP ─────────────────────────────────────────
    const knownIps = authUser.knownIps ?? [];
    const isNewIp  = !knownIps.includes(ip) && ip !== "unknown";

    // ── Update user: lastLoginIp, knownIps ───────────────────
    const newKnownIps = isNewIp ? [...knownIps.slice(-19), ip] : knownIps;
    await redis.set(RK.authUser(normalizedEmail), {
      ...authUser,
      lastLoginIp: ip,
      knownIps:    newKnownIps,
    });

    // ── Record login history ──────────────────────────────────
    const loginRecord: LoginRecord = {
      timestamp: new Date().toISOString(),
      ip,
      userAgent: ua,
      device:    `${device} · ${os}`,
      browser,
      status:    "success",
      isNewIp,
    };
    await redis.lpush(RK.loginHistory(authUser.id), JSON.stringify(loginRecord));
    await redis.ltrim(RK.loginHistory(authUser.id), 0, 49);  // Keep last 50

    // ── New IP alert email (async) ────────────────────────────
    if (isNewIp) {
      const timeStr = new Date().toLocaleString("en-US", {
        dateStyle: "medium", timeStyle: "short", timeZone: "UTC",
      }) + " UTC";
      sendLoginAlert({
        to:        normalizedEmail,
        firstName: authUser.firstName,
        ip,
        device:    `${device} · ${os}`,
        browser,
        time:      timeStr,
        isNewIp:   true,
      }).catch(e => console.error("[verify-login-otp] Alert email failed:", e));
    }

    return NextResponse.json({
      success:   true,
      message:   "Login successful.",
      userId:    authUser.id,
      firstName: authUser.firstName,
      lastName:  authUser.lastName,
      email:     normalizedEmail,
    });
  } catch (err) {
    console.error("[POST /api/auth/verify-login-otp]", err);
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
  }
}
