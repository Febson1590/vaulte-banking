// ─────────────────────────────────────────────────────────────
//  POST /api/admin/card
//  Issues, freezes, or unfreezes a user's virtual card.
//  Reads the user's banking state from Redis, updates the card
//  object, writes state back, and returns the updated card.
//
//  Body: { email: string, action: "issue" | "freeze" | "unfreeze" }
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { AuthUser, RK } from "@/lib/redis";

interface CardState {
  issued: boolean;
  frozen: boolean;
  onlinePayments?: boolean;
  contactless?: boolean;
  internationalTxns?: boolean;
  spendingLimit?: number;
  spentThisMonth?: number;
  [key: string]: unknown;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, action } = body as {
      email?: string;
      action?: "issue" | "freeze" | "unfreeze";
    };

    if (!email || !action) {
      return NextResponse.json(
        { error: "email and action are required" },
        { status: 400 }
      );
    }
    if (!["issue", "freeze", "unfreeze"].includes(action)) {
      return NextResponse.json(
        { error: "action must be 'issue', 'freeze', or 'unfreeze'" },
        { status: 400 }
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
    if (!stateRaw) {
      return NextResponse.json(
        { error: "No banking state found. The user may not have logged in yet." },
        { status: 404 }
      );
    }

    const card = ((stateRaw.card ?? {}) as CardState);
    let updatedCard: CardState;

    if (action === "issue") {
      updatedCard = {
        ...card,
        issued:            true,
        frozen:            false,
        onlinePayments:    true,
        contactless:       true,
        internationalTxns: true,
        spendingLimit:     2000,
        spentThisMonth:    0,
      };
    } else if (action === "freeze") {
      updatedCard = { ...card, frozen: true };
    } else {
      updatedCard = { ...card, frozen: false };
    }

    const updatedState = {
      ...stateRaw,
      card:        updatedCard,
      lastUpdated: new Date().toISOString(),
    };

    await redis.set(RK.userState(normalizedEmail), updatedState);

    return NextResponse.json({ success: true, card: updatedCard, updatedState });
  } catch (err) {
    console.error("[POST /api/admin/card]", err);
    return NextResponse.json(
      { error: "Failed to update card" },
      { status: 500 }
    );
  }
}
