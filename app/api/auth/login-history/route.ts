// ─────────────────────────────────────────────────────────────
//  GET /api/auth/login-history?userId=xxx
//  Returns login history for the Security Activity page.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { RK, LoginRecord } from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const userId = req.nextUrl.searchParams.get("userId");
    if (!userId) {
      return NextResponse.json({ error: "userId is required." }, { status: 400 });
    }

    const raw = await redis.lrange(RK.loginHistory(userId), 0, 49);
    const history: LoginRecord[] = raw
      .map(item => {
        try {
          return typeof item === "string" ? JSON.parse(item) : item;
        } catch {
          return null;
        }
      })
      .filter(Boolean) as LoginRecord[];

    return NextResponse.json({ success: true, history });
  } catch (err) {
    console.error("[GET /api/auth/login-history]", err);
    return NextResponse.json({ error: "Failed to load login history." }, { status: 500 });
  }
}
