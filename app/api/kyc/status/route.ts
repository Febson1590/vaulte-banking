// ─────────────────────────────────────────────────────────────
//  GET  /api/kyc/status?email={email}
//       Returns the server-side kycStatus for a given user.
//       Used by the dashboard to sync across devices.
//
//  POST /api/kyc/status
//       Authenticated. Body: { email, kycStatus: "pending" }
//       Only allows setting "pending" (KYC submission).
//       Only the authenticated user can update their own email.
//       Admin writes (verified/rejected) go through /api/admin/manage.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { RK, SessionRecord } from "@/lib/redis";

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
    return NextResponse.json({ kycStatus: "unverified" });
  }
}

export async function POST(req: NextRequest) {
  try {
    // ── Require a valid session ──────────────────────────────
    const sessionToken = req.cookies.get("vaulte_session")?.value;
    if (!sessionToken) {
      return NextResponse.json({ error: "Authentication required." }, { status: 401 });
    }
    const session = await redis.get<SessionRecord>(RK.session(sessionToken));
    if (!session) {
      return NextResponse.json({ error: "Session expired. Please sign in again." }, { status: 401 });
    }

    const { email, kycStatus, kycData, kycDoc } = await req.json();
    if (!email || !kycStatus) {
      return NextResponse.json({ error: "email and kycStatus are required" }, { status: 400 });
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── Users can only update their own KYC record ───────────
    if (session.email !== normalizedEmail) {
      return NextResponse.json({ error: "Forbidden." }, { status: 403 });
    }

    // ── Users can only set their status to "pending" ─────────
    // "verified" and "rejected" are admin-only — written via /api/admin/manage.
    if (kycStatus !== "pending") {
      return NextResponse.json(
        { error: "Invalid status. Users may only submit a pending KYC request." },
        { status: 403 }
      );
    }

    // ── Write all three KYC keys atomically in parallel ──────
    const writes: Promise<unknown>[] = [
      redis.set(RK.kycStatus(normalizedEmail), kycStatus),
    ];

    // Persist full KYC form data (docType, nationality, dob, address, city, submittedAt)
    // so admin can read it cross-device without relying on localStorage.
    if (kycData && typeof kycData === "object") {
      writes.push(redis.set(RK.kycData(normalizedEmail), kycData));
    }

    // Persist the uploaded ID document (base64 data URL) to Redis so admin can
    // retrieve and preview it from any device.
    if (typeof kycDoc === "string" && kycDoc.startsWith("data:")) {
      writes.push(redis.set(RK.kycDoc(normalizedEmail), kycDoc));
    }

    await Promise.all(writes);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/kyc/status]", err);
    return NextResponse.json({ error: "Failed to update KYC status" }, { status: 500 });
  }
}
