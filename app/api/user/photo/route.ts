// ─────────────────────────────────────────────────────────────
//  GET    /api/user/photo  — returns the current user's profile photo
//  POST   /api/user/photo  — saves a base64 data URL as the profile photo
//  DELETE /api/user/photo  — removes the profile photo
//
//  Photos are stored in Redis under user:photo:{email}.
//  Requires a valid vaulte_session httpOnly cookie.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { RK, SessionRecord } from "@/lib/redis";

// ── Resolve the email from the session cookie ─────────────────
async function getEmailFromSession(req: NextRequest): Promise<string | null> {
  const sessionToken = req.cookies.get("vaulte_session")?.value;
  if (!sessionToken) return null;
  const session = await redis.get<SessionRecord>(RK.session(sessionToken));
  if (!session) return null;
  return session.email;
}

// ── GET — return current photo ────────────────────────────────
export async function GET(req: NextRequest) {
  try {
    const email = await getEmailFromSession(req);
    if (!email) return NextResponse.json({ photo: null }, { status: 401 });

    const photo = await redis.get<string>(RK.userPhoto(email));
    return NextResponse.json({ photo: photo ?? null });
  } catch (err) {
    console.error("[GET /api/user/photo]", err);
    return NextResponse.json({ photo: null }, { status: 500 });
  }
}

// ── POST — upload / replace photo ────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const email = await getEmailFromSession(req);
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { photo } = body as { photo?: string };

    if (!photo || !photo.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid photo data. Must be a base64 image data URL." }, { status: 400 });
    }

    // ~150 KB max (base64 is ~133% of binary; 256×256 JPEG at 70% ≈ 25–40 KB)
    if (photo.length > 200_000) {
      return NextResponse.json({ error: "Photo too large. Please use a smaller image (max ~150 KB)." }, { status: 400 });
    }

    await redis.set(RK.userPhoto(email), photo);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/user/photo]", err);
    return NextResponse.json({ error: "Failed to save photo" }, { status: 500 });
  }
}

// ── DELETE — remove photo ─────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const email = await getEmailFromSession(req);
    if (!email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await redis.del(RK.userPhoto(email));
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE /api/user/photo]", err);
    return NextResponse.json({ error: "Failed to remove photo" }, { status: 500 });
  }
}
