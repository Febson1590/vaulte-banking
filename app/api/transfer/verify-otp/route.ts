// ─────────────────────────────────────────────────────────────
//  POST /api/transfer/verify-otp
//  Verifies the step-up OTP that gates a bank transfer.
//
//  Returns:
//    200 { success: true }     → client may proceed to commit the transfer
//    400 { error, ... }        → wrong code, expired, or attempts exhausted
//    401 { error }             → not signed in
//
//  This route does NOT move money.  The client is responsible for
//  performing the actual transfer state mutation only AFTER receiving
//  success here.  A successful verification deletes the OTP, so the same
//  code cannot be reused.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { RK, OtpRecord, SessionRecord } from "@/lib/redis";
import { OTP_ATTEMPT_CONFIG, msToSeconds } from "@/lib/authHelpers";

export async function POST(req: NextRequest) {
  try {
    // ── Identify the signed-in user via the session cookie ──────────
    const sessionToken = req.cookies.get("vaulte_session")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    }
    const session = await redis.get<SessionRecord>(RK.session(sessionToken));
    if (!session) {
      return NextResponse.json({ error: "Session expired. Please sign in again." }, { status: 401 });
    }

    const { code } = (await req.json().catch(() => ({}))) as { code?: string };
    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Verification code is required." }, { status: 400 });
    }

    const email      = session.email;
    const otpRecord  = await redis.get<OtpRecord>(RK.transferOtp(email));

    if (!otpRecord) {
      return NextResponse.json(
        { error: "Verification code has expired or was not issued. Please request a new one.", expired: true },
        { status: 400 }
      );
    }

    // ── Attempt limit ───────────────────────────────────────────────
    if (otpRecord.attempts >= OTP_ATTEMPT_CONFIG.maxAttempts) {
      await redis.del(RK.transferOtp(email));
      return NextResponse.json(
        { error: "Too many incorrect attempts. Please request a new code.", tooManyAttempts: true },
        { status: 429 }
      );
    }

    // ── Expiry check ────────────────────────────────────────────────
    if (Date.now() > otpRecord.expiresAt) {
      await redis.del(RK.transferOtp(email));
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one.", expired: true },
        { status: 400 }
      );
    }

    // ── Code validation ─────────────────────────────────────────────
    const submitted = code.trim();
    if (submitted !== otpRecord.code) {
      const updated: OtpRecord = { ...otpRecord, attempts: otpRecord.attempts + 1 };
      const remainingTtl = msToSeconds(otpRecord.expiresAt - Date.now());
      await redis.set(RK.transferOtp(email), updated, { ex: remainingTtl });

      const attemptsLeft = OTP_ATTEMPT_CONFIG.maxAttempts - updated.attempts;
      return NextResponse.json(
        { error: `Incorrect code. ${attemptsLeft} attempt${attemptsLeft === 1 ? "" : "s"} remaining.`, attemptsLeft },
        { status: 400 }
      );
    }

    // ── Success: delete the OTP so the same code can't be reused ────
    await redis.del(RK.transferOtp(email));

    return NextResponse.json({
      success: true,
      message: "Verified. You can now complete your transfer.",
    });
  } catch (err) {
    console.error("[POST /api/transfer/verify-otp]", err);
    return NextResponse.json({ error: "Verification failed. Please try again." }, { status: 500 });
  }
}
