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
    // eslint-disable-next-line prefer-const
    let state = body?.state as Record<string, unknown> | undefined;
    if (!state) {
      return NextResponse.json({ error: "state is required in request body" }, { status: 400 });
    }

    // ── Merge missed admin transactions ──────────────────────
    // When the admin credits/debits a wallet directly in Redis,
    // the client's local state won't know about it. If the client
    // then saves its stale state, it would overwrite the admin's
    // change. We prevent that by re-applying any admin_credit /
    // admin_debit transactions that are in Redis but absent from
    // the incoming client state.
    try {
      const serverState = await redis.get<Record<string, unknown>>(RK.userState(email));
      if (serverState?.transactions && state.transactions) {
        const clientTxnIds = new Set(
          (state.transactions as Array<{ id: string }>).map(t => t.id),
        );
        type TxEntry = {
          id: string; txType: string; type: string;
          amount: number; accountId: string;
        };
        const missedAdminTxns = (serverState.transactions as TxEntry[]).filter(
          t => !clientTxnIds.has(t.id) &&
               (t.txType === "admin_credit" || t.txType === "admin_debit"),
        );

        if (missedAdminTxns.length > 0) {
          console.log(
            `[PUT /api/user/state] Merging ${missedAdminTxns.length} missed admin` +
            ` transaction(s) for ${email}:`,
            missedAdminTxns.map(t => `${t.txType} ${t.amount} acct=${t.accountId}`),
          );

          // Re-apply each admin delta to the matching account balance
          const accounts = (
            (state.accounts as Array<{ id: string; balance: number }>) ?? []
          ).map(acc => {
            const delta = missedAdminTxns
              .filter(t => t.accountId === acc.id)
              .reduce((sum, t) => sum + (t.type === "credit" ? t.amount : -t.amount), 0);
            return delta !== 0
              ? { ...acc, balance: Math.max(0, acc.balance + delta) }
              : acc;
          });

          state = {
            ...state,
            accounts,
            transactions: [
              ...missedAdminTxns,
              ...(state.transactions as unknown[]),
            ],
          };
        }
      }
    } catch (mergeErr) {
      // Merge is best-effort — a failure must never block the save
      console.warn("[PUT /api/user/state] Admin-merge warning:", mergeErr);
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
