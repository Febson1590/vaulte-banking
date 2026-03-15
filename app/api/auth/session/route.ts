// ─────────────────────────────────────────────────────────────
//  GET  /api/auth/session
//       Reads the vaulte_session httpOnly cookie, verifies it
//       against Redis, and returns the current user's profile
//       (id, name, email, kycStatus, accountStatus).
//       Returns { user: null } when no valid session exists.
//
//  DELETE /api/auth/session
//       Clears the session cookie and deletes the Redis session
//       record (logout).
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { RK, AuthUser, SessionRecord } from "@/lib/redis";

export async function GET(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("vaulte_session")?.value;
    if (!sessionToken) return NextResponse.json({ user: null });

    const session = await redis.get<SessionRecord>(RK.session(sessionToken));
    if (!session) return NextResponse.json({ user: null });

    const authUser = await redis.get<AuthUser>(RK.authUser(session.email));
    if (!authUser) return NextResponse.json({ user: null });

    // Fetch KYC status (stored separately for cross-device consistency)
    const kycStatus = await redis.get<string>(RK.kycStatus(session.email)) ?? "unverified";

    // Fetch full KYC submission data if available
    const kycData = await redis.get<Record<string, string>>(RK.kycData(session.email));

    return NextResponse.json({
      user: {
        id:             authUser.id,
        firstName:      authUser.firstName,
        lastName:       authUser.lastName,
        email:          authUser.email,
        kycStatus,
        kycDocType:     kycData?.docType     ?? null,
        kycNationality: kycData?.nationality ?? null,
        kycDob:         kycData?.dob         ?? null,
        kycAddress:     kycData?.address     ?? null,
        kycCity:        kycData?.city        ?? null,
        kycSubmittedAt: kycData?.submittedAt ?? null,
        createdAt:      authUser.createdAt,
        emailVerified:  authUser.emailVerified,
        accountStatus:  "active" as const,
      },
    });
  } catch (err) {
    console.error("[GET /api/auth/session]", err);
    return NextResponse.json({ user: null });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const sessionToken = req.cookies.get("vaulte_session")?.value;
    if (sessionToken) {
      await redis.del(RK.session(sessionToken));
    }
    const response = NextResponse.json({ success: true });
    response.cookies.set("vaulte_session", "", {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   0,           // expire immediately
      path:     "/",
    });
    return response;
  } catch (err) {
    console.error("[DELETE /api/auth/session]", err);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
