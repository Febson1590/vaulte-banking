// ─────────────────────────────────────────────────────────────
//  POST /api/auth/login
//  Validates credentials, enforces rate limiting, generates
//  a login OTP and sends it via email (step-up 2FA).
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { RK, AuthUser, OtpRecord, RateLimitRecord } from "@/lib/redis";
import {
  verifyPassword,
  generateOTP,
  getClientIP,
  parseUserAgent,
  LOGIN_RATE_CONFIG,
  LOGIN_OTP_TTL_MS,
  msToSeconds,
} from "@/lib/authHelpers";
import { sendLoginOtp } from "@/lib/emailService";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const ip              = getClientIP(req);
    const ua              = req.headers.get("user-agent") ?? "";
    const { device }      = parseUserAgent(ua);

    // ── IP-based Rate Limit ───────────────────────────────────
    const ipRateKey  = RK.rateLoginIp(ip);
    const ipRate     = await redis.get<RateLimitRecord>(ipRateKey) ?? { count: 0, windowStart: Date.now() };

    if (ipRate.lockedUntil && Date.now() < ipRate.lockedUntil) {
      const waitMins = Math.ceil((ipRate.lockedUntil - Date.now()) / 60_000);
      return NextResponse.json(
        { error: `Too many failed login attempts. Please try again in ${waitMins} minute${waitMins === 1 ? "" : "s"}.`, locked: true },
        { status: 429 }
      );
    }

    // ── Load user ─────────────────────────────────────────────
    const authUser = await redis.get<AuthUser>(RK.authUser(normalizedEmail));

    // ── Account-level Rate Limit ──────────────────────────────
    if (authUser?.accountLockedUntil) {
      const lockedUntil = new Date(authUser.accountLockedUntil).getTime();
      if (Date.now() < lockedUntil) {
        const waitMins = Math.ceil((lockedUntil - Date.now()) / 60_000);
        return NextResponse.json(
          { error: `This account is temporarily locked. Please try again in ${waitMins} minute${waitMins === 1 ? "" : "s"}.`, locked: true },
          { status: 429 }
        );
      }
    }

    // ── Validate credentials ──────────────────────────────────
    const credentialsValid = authUser
      ? await verifyPassword(password, authUser.passwordHash)
      : false;

    if (!authUser || !credentialsValid) {
      // Record failed attempt for IP
      const windowReset = Date.now() - ipRate.windowStart > LOGIN_RATE_CONFIG.windowMs;
      const newIpRate: RateLimitRecord = {
        count:       windowReset ? 1 : ipRate.count + 1,
        windowStart: windowReset ? Date.now() : ipRate.windowStart,
      };
      if (newIpRate.count >= LOGIN_RATE_CONFIG.maxAttempts) {
        newIpRate.lockedUntil = Date.now() + LOGIN_RATE_CONFIG.lockoutMs;
      }
      await redis.set(ipRateKey, newIpRate, { ex: msToSeconds(LOGIN_RATE_CONFIG.windowMs) });

      // Record failed attempt on account
      if (authUser) {
        const failCount = (authUser.failedLoginAttempts ?? 0) + 1;
        const updates: Partial<AuthUser> = {
          failedLoginAttempts: failCount,
          lastFailedLoginAt:   new Date().toISOString(),
        };
        if (failCount >= LOGIN_RATE_CONFIG.maxAttempts) {
          updates.accountLockedUntil = new Date(Date.now() + LOGIN_RATE_CONFIG.lockoutMs).toISOString();
        }
        await redis.set(RK.authUser(normalizedEmail), { ...authUser, ...updates });
      }

      return NextResponse.json(
        { error: "Incorrect email or password. Please try again." },
        { status: 401 }
      );
    }

    // ── Check email verified ──────────────────────────────────
    if (!authUser.emailVerified) {
      return NextResponse.json(
        { error: "Please verify your email before signing in.", notVerified: true, email: normalizedEmail },
        { status: 403 }
      );
    }

    // ── Reset failed attempts on success ──────────────────────
    if (authUser.failedLoginAttempts > 0) {
      await redis.set(RK.authUser(normalizedEmail), {
        ...authUser,
        failedLoginAttempts: 0,
        lastFailedLoginAt:   null,
        accountLockedUntil:  null,
      });
    }
    // Reset IP rate
    await redis.del(ipRateKey);

    // ── Generate login OTP ────────────────────────────────────
    const code = generateOTP();
    const now  = Date.now();
    const otpRecord: OtpRecord = {
      code,
      expiresAt:    now + LOGIN_OTP_TTL_MS,
      attempts:     0,
      lastResendAt: now,
    };
    await redis.set(RK.loginOtp(normalizedEmail), otpRecord, {
      ex: msToSeconds(LOGIN_OTP_TTL_MS),
    });

    // ── Send OTP email ────────────────────────────────────────
    const timeStr = new Date().toLocaleString("en-US", {
      dateStyle: "medium", timeStyle: "short", timeZone: "UTC",
    }) + " UTC";

    const emailResult = await sendLoginOtp({
      to:        normalizedEmail,
      firstName: authUser.firstName,
      code,
      ip,
      device,
      time:      timeStr,
    });

    if (!emailResult.success) {
      console.error("[login] OTP email failed:", emailResult.error);
    }

    return NextResponse.json({
      success:   true,
      message:   "Login code sent to your email.",
      email:     normalizedEmail,
      firstName: authUser.firstName,
      emailSent: emailResult.success,
    });
  } catch (err) {
    console.error("[POST /api/auth/login]", err);
    return NextResponse.json({ error: "Login failed. Please try again." }, { status: 500 });
  }
}
