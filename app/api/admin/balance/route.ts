// ─────────────────────────────────────────────────────────────
//  POST /api/admin/balance
//  Credits or debits the primary USD account for a given user.
//  Reads the user's banking state from Redis, modifies it,
//  writes it back, and returns the new USD balance.
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { AuthUser, RK } from "@/lib/redis";

function genTxId() {
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
function genRef() {
  return `VLT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
}

interface AccountEntry {
  id: string;
  currency: string;
  balance: number;
  [key: string]: unknown;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, amount, type } = body as {
      email?: string;
      amount?: number;
      type?: "credit" | "debit";
    };

    if (!email || amount === undefined || !type) {
      return NextResponse.json(
        { error: "email, amount, and type are required" },
        { status: 400 }
      );
    }
    if (type !== "credit" && type !== "debit") {
      return NextResponse.json(
        { error: "type must be 'credit' or 'debit'" },
        { status: 400 }
      );
    }
    const amt = parseFloat(String(amount));
    if (isNaN(amt) || amt <= 0) {
      return NextResponse.json(
        { error: "amount must be a positive number" },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // ── Verify user exists ──────────────────────────────────
    const authUser = await redis.get<AuthUser>(RK.authUser(normalizedEmail));
    if (!authUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ── Load banking state from Redis ───────────────────────
    const stateRaw = await redis.get<Record<string, unknown>>(RK.userState(normalizedEmail));
    if (!stateRaw?.accounts) {
      return NextResponse.json(
        { error: "No banking state found. The user may not have logged in yet." },
        { status: 404 }
      );
    }

    const accounts = (stateRaw.accounts as AccountEntry[]).map(a => ({ ...a }));
    const primaryIdx = accounts.findIndex(a => a.currency === "USD");
    if (primaryIdx === -1) {
      return NextResponse.json(
        { error: "No USD account found for this user" },
        { status: 404 }
      );
    }

    const oldBal = accounts[primaryIdx].balance as number;
    const newBal = type === "credit" ? oldBal + amt : Math.max(0, oldBal - amt);
    accounts[primaryIdx] = { ...accounts[primaryIdx], balance: newBal };

    // ── Build an admin transaction record ───────────────────
    const txn = {
      id:          genTxId(),
      txType:      type === "credit" ? "admin_credit" : "admin_debit",
      type,
      name:        type === "credit" ? "Admin Credit" : "Admin Debit",
      sub:         "Manual Adjustment by Admin",
      amount:      amt,
      fee:         0,
      balanceAfter: newBal,
      currency:    "USD",
      date:        new Date().toISOString(),
      category:    "Adjustment",
      badge:       "Admin",
      badgeBg:     "#F5F3FF",
      badgeBorder: "#DDD6FE",
      badgeColor:  "#7C3AED",
      status:      "completed",
      accountId:   accounts[primaryIdx].id,
      icon:        "⚙",
      iconBg:      "linear-gradient(135deg,#F5F3FF,#DDD6FE)",
      iconColor:   "#7C3AED",
      reference:   genRef(),
    };

    const updatedState = {
      ...stateRaw,
      accounts,
      transactions: [txn, ...((stateRaw.transactions as unknown[]) ?? [])],
      lastUpdated:  new Date().toISOString(),
    };

    await redis.set(RK.userState(normalizedEmail), updatedState);

    return NextResponse.json({
      success:        true,
      newBalance:     newBal,
      updatedState,
    });
  } catch (err) {
    console.error("[POST /api/admin/balance]", err);
    return NextResponse.json(
      { error: "Failed to apply balance adjustment" },
      { status: 500 }
    );
  }
}
