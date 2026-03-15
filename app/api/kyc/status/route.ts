// ─────────────────────────────────────────────────────────────
//  GET  /api/kyc/status?email={email}
//       Returns the server-side kycStatus for a given user.
//       Used by the dashboard to sync across devices.
//
//  POST /api/kyc/status
//       Body: { email, kycStatus }
//       Writes the kycStatus to Redis (called on KYC submission
//       to store "pending", and on admin approval to store
//       "verified" / "unverified").
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { RK } from "@/lib/redis";

const VALID_STATUSES = ["unverified", "pending", "verified"] as const;

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "email query parameter is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const kycStatus = await redis.get<string>(RK.kycStatus(normalizedEmail));

    return NextResponse.json({ kycStatus: kycStatus ?? "unverified" });
  } catch (err) {
    console.error("[GET /api/kyc/status]", err);
    // Fail gracefully — caller will use localStorage fallback
    return NextResponse.json({ kycStatus: "unverified" });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, kycStatus } = await req.json();

    if (!email || !kycStatus) {
      return NextResponse.json({ error: "email and kycStatus are required" }, { status: 400 });
    }
    if (!(VALID_STATUSES as readonly string[]).includes(kycStatus)) {
      return NextResponse.json({ error: "Invalid kycStatus value" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    await redis.set(RK.kycStatus(normalizedEmail), kycStatus);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/kyc/status]", err);
    return NextResponse.json({ error: "Failed to update KYC status" }, { status: 500 });
  }
}
