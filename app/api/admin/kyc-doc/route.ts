// ─────────────────────────────────────────────────────────────
//  GET  /api/admin/kyc-doc?email={email}
//       Admin-only. Returns the KYC document image (base64 data URL)
//       stored in Redis for the given user.
//       Called lazily when admin opens a KYC review modal — not
//       included in the bulk /api/admin/users response (too large).
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { RK } from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const email = req.nextUrl.searchParams.get("email");
    if (!email) {
      return NextResponse.json({ error: "email query parameter is required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const kycDoc = await redis.get<string>(RK.kycDoc(normalizedEmail));

    // Return null (not 404) so the caller can cleanly distinguish
    // "no document uploaded" from an actual server error.
    return NextResponse.json({ kycDoc: kycDoc ?? null });
  } catch (err) {
    console.error("[GET /api/admin/kyc-doc]", err);
    return NextResponse.json({ kycDoc: null });
  }
}
