// ─────────────────────────────────────────────────────────────
//  POST /api/auth/track-login
//  Records a login event (success or failure) in login history.
//  Called by the client after dashboard access (for demo users
//  and cases where we need to log without OTP flow).
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { RK, AuthUser, LoginRecord } from "@/lib/redis";
import { getClientIP, parseUserAgent } from "@/lib/authHelpers";
import { sendLoginAlert } from "@/lib/emailService";

export async function POST(req: NextRequest) {
  try {
    const { userId, email, status = "success" } = await req.json();
    if (!userId || !email) {
      return NextResponse.json({ error: "userId and email required." }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const ip     = getClientIP(req);
    const ua     = req.headers.get("user-agent") ?? "";
    const { device, browser, os } = parseUserAgent(ua);

    // ── Check if new IP (only for real auth users) ───────────
    const authUser = await redis.get<AuthUser>(RK.authUser(normalizedEmail));
    const knownIps = authUser?.knownIps ?? [];
    const isNewIp  = !knownIps.includes(ip) && ip !== "unknown" && status === "success";

    // ── Record login history ──────────────────────────────────
    const loginRecord: LoginRecord = {
      timestamp: new Date().toISOString(),
      ip,
      userAgent: ua,
      device:    `${device} · ${os}`,
      browser,
      status:    status as "success" | "failed",
      isNewIp,
    };
    await redis.lpush(RK.loginHistory(userId), JSON.stringify(loginRecord));
    await redis.ltrim(RK.loginHistory(userId), 0, 49);  // Keep last 50

    // ── New IP alert (for auth users with new IP) ─────────────
    if (isNewIp && authUser) {
      const newKnownIps = [...knownIps.slice(-19), ip];
      await redis.set(RK.authUser(normalizedEmail), {
        ...authUser,
        lastLoginIp: ip,
        knownIps:    newKnownIps,
      });

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
      }).catch(e => console.error("[track-login] Alert email failed:", e));
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/auth/track-login]", err);
    return NextResponse.json({ error: "Failed to track login." }, { status: 500 });
  }
}
