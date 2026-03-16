// ─────────────────────────────────────────────────────────────
//  POST /api/admin/account
//  Freezes or unfreezes a specific account by accountId.
//  Writes directly to Redis — the change is immediately
//  visible on the user dashboard on next refresh.
//
//  Body: { email, accountId, action: "freeze" | "unfreeze" }
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { AuthUser, RK } from "@/lib/redis";

interface AccountEntry {
  id:     string;
  frozen: boolean;
  [key: string]: unknown;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, accountId, action } = body as {
      email?:     string;
      accountId?: string;
      action?:    "freeze" | "unfreeze";
    };

    if (!email || !accountId || !action) {
      return NextResponse.json(
        { error: "email, accountId, and action are required" },
        { status: 400 },
      );
    }
    if (action !== "freeze" && action !== "unfreeze") {
      return NextResponse.json(
        { error: "action must be 'freeze' or 'unfreeze'" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── Verify user exists ──────────────────────────────────
    const authUser = await redis.get<AuthUser>(RK.authUser(normalizedEmail));
    if (!authUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ── Load banking state ──────────────────────────────────
    const stateRaw = await redis.get<Record<string, unknown>>(RK.userState(normalizedEmail));
    if (!stateRaw?.accounts) {
      return NextResponse.json({ error: "No banking state found" }, { status: 404 });
    }

    // ── Find and toggle the account ─────────────────────────
    const accounts = (stateRaw.accounts as AccountEntry[]).map(a =>
      a.id === accountId ? { ...a, frozen: action === "freeze" } : { ...a },
    );

    if (!accounts.find(a => a.id === accountId)) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const updatedState = {
      ...stateRaw,
      accounts,
      lastUpdated: new Date().toISOString(),
    };

    await redis.set(RK.userState(normalizedEmail), updatedState);

    console.log(
      `[admin/account] ${action} → userId=${authUser.id}` +
      ` email=${normalizedEmail} accountId=${accountId}`,
    );

    return NextResponse.json({ success: true, frozen: action === "freeze" });
  } catch (err) {
    console.error("[POST /api/admin/account]", err);
    return NextResponse.json(
      { error: "Failed to update account" },
      { status: 500 },
    );
  }
}
