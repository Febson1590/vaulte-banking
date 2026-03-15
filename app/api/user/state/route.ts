// ─────────────────────────────────────────────────────────────
//  GET  /api/user/state
//       Returns the authenticated user's full VaulteState
//       (accounts, transactions, card, preferences, etc.)
//       from Redis. Returns { state: null } when no state has
//       been saved yet (new user — client should seed with
//       createEmptyUserState and push it back).
//
//  PUT  /api/user/state
//       Body: { state: VaulteState }
//       Saves the user's VaulteState to Redis.
//       Called from saveState() in lib/vaulteState.ts.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { RK, SessionRecord } from "@/lib/redis";

// ── Auth helper ────────────────────────────────────────────
async function getSessionEmail(req: NextRequest): Promise<string | null> {
  const token = req.cookies.get("vaulte_session")?.value;
  if (!token) return null;
  const session = await redis.get<SessionRecord>(RK.session(token));
  return session?.email ?? null;
}

export async function GET(req: NextRequest) {
  try {
    const email = await getSessionEmail(req);
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const state = await redis.get(RK.userState(email));
    return NextResponse.json({ state: state ?? null });
  } catch (err) {
    console.error("[GET /api/user/state]", err);
    return NextResponse.json({ state: null });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const email = await getSessionEmail(req);
    if (!email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const state = body?.state;
    if (!state) {
      return NextResponse.json({ error: "state is required in request body" }, { status: 400 });
    }

    await redis.set(RK.userState(email), {
      ...state,
      lastUpdated: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[PUT /api/user/state]", err);
    return NextResponse.json({ error: "Failed to save state" }, { status: 500 });
  }
}
