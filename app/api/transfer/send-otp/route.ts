// ─────────────────────────────────────────────────────────────
//  POST /api/transfer/send-otp
//  Step-up OTP for high-value bank transfers.
//
//  Generates a 6-digit code, stores it in Redis under
//  RK.transferOtp(email) with a 5-minute TTL, and emails it to the
//  signed-in user.  Subsequent calls within the 30-second cooldown
//  window return 429 to prevent spam.
//
//  This route never moves money — it only issues a code.  The actual
//  transfer is processed by the client only AFTER /api/transfer/
//  verify-otp returns success.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { RK, AuthUser, OtpRecord, SessionRecord } from "@/lib/redis";
import {
  generateOTP,
  getClientIP,
  parseUserAgent,
  TRANSFER_OTP_TTL_MS,
  TRANSFER_RESEND_COOLDOWN_MS,
  msToSeconds,
} from "@/lib/authHelpers";
import { sendTransferOtp } from "@/lib/emailService";

interface TransferOtpBody {
  amount?:    string | number;
  recipient?: string;
  bank?:      string;
}

export async function POST(req: NextRequest) {
  try {
    // ── Identify the signed-in user via the session cookie ──────────
    // We never trust an email from the request body for this — the OTP
    // must go to the actual account holder, not whoever asks.
    const sessionToken = req.cookies.get("vaulte_session")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    const session = await redis.get<SessionRecord>(RK.session(sessionToken));
    if (!session) {
      return NextResponse.json({ error: "Session expired. Please sign in again." }, { status: 401 });
    }

    const email   = session.email;
    const authUser = await redis.get<AuthUser>(RK.authUser(email));
    if (!authUser) {
      return NextResponse.json({ error: "Account not found." }, { status: 404 });
    }

    const body: TransferOtpBody = await req.json().catch(() => ({}));
    const amountStr  = (body.amount ?? "").toString().trim() || "—";
    const recipient  = (body.recipient ?? "").trim() || "your selected recipient";
    const bank       = (body.bank ?? "").trim() || undefined;

    // ── Cooldown check ──────────────────────────────────────────────
    const existing = await redis.get<OtpRecord>(RK.transferOtp(email));
    if (existing) {
      const elapsed = Date.now() - existing.lastResendAt;
      if (elapsed < TRANSFER_RESEND_COOLDOWN_MS) {
        const waitSecs = Math.ceil((TRANSFER_RESEND_COOLDOWN_MS - elapsed) / 1000);
        return NextResponse.json(
          { error: `Please wait ${waitSecs} second${waitSecs === 1 ? "" : "s"} before requesting a new code.`, waitSecs },
          { status: 429 }
        );
      }
    }

    // ── Generate + store new OTP ────────────────────────────────────
    const code = generateOTP();
    const otpRecord: OtpRecord = {
      code,
      expiresAt:    Date.now() + TRANSFER_OTP_TTL_MS,
      attempts:     0,
      lastResendAt: Date.now(),
    };
    await redis.set(RK.transferOtp(email), otpRecord, {
      ex: msToSeconds(TRANSFER_OTP_TTL_MS),
    });

    // ── Email it ────────────────────────────────────────────────────
    const ip       = getClientIP(req);
    const ua       = req.headers.get("user-agent") ?? "";
    const { device, os } = parseUserAgent(ua);
    const timeStr  = new Date().toLocaleString("en-US", {
      dateStyle: "medium", timeStyle: "short", timeZone: "UTC",
    }) + " UTC";

    const result = await sendTransferOtp({
      to:        email,
      firstName: authUser.firstName,
      code,
      amount:    amountStr,
      recipient,
      bank,
      ip,
      device:    `${device} · ${os}`,
      time:      timeStr,
    });

    return NextResponse.json({
      success:     result.success,
      message:     "Verification code sent to your email.",
      expiresInMs: TRANSFER_OTP_TTL_MS,
      cooldownMs:  TRANSFER_RESEND_COOLDOWN_MS,
    });
  } catch (err) {
    console.error("[POST /api/transfer/send-otp]", err);
    return NextResponse.json({ error: "Failed to send verification code. Please try again." }, { status: 500 });
  }
}
