// ─────────────────────────────────────────────────────────────
//  POST /api/admin/balance
//  Credits or debits any currency account for a given user.
//  Reads banking state from Redis, modifies it, writes it back.
//
//  Body: {
//    email:        string               – target user
//    amount:       number               – positive value
//    type:         "credit" | "debit"
//    currency?:    string               – defaults to "USD"
//    description?: string               – user-visible transaction name
//    internalNote?:string               – admin audit note (never shown to user)
//    txDate?:      string               – ISO date override (defaults to now)
//  }
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

/** Classify a description string into visual badge / icon metadata */
function classifyTx(description: string, type: "credit" | "debit"): {
  category: string; badge: string;
  badgeBg: string; badgeBorder: string; badgeColor: string;
  icon: string; iconBg: string; iconColor: string;
  txType: string;
} {
  const d = description.toLowerCase();
  if (type === "credit") {
    if (d.includes("salary") || d.includes("payroll") || d.includes("wages"))
      return { category: "Income",    badge: "Salary",   badgeBg: "#EFF6FF", badgeBorder: "#BFDBFE", badgeColor: "#2563EB", icon: "💼", iconBg: "linear-gradient(135deg,#EEF4FF,#DBEAFE)", iconColor: "#1A73E8", txType: "deposit" };
    if (d.includes("refund") || d.includes("return") || d.includes("reversal"))
      return { category: "Refund",    badge: "Refund",   badgeBg: "#F0FDF4", badgeBorder: "#BBF7D0", badgeColor: "#16A34A", icon: "↩", iconBg: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", iconColor: "#059669", txType: "refund" };
    if (d.includes("transfer") || d.includes("wire") || d.includes("client transfer"))
      return { category: "Transfer",  badge: "Incoming", badgeBg: "#F0FDF4", badgeBorder: "#BBF7D0", badgeColor: "#16A34A", icon: "↙", iconBg: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", iconColor: "#059669", txType: "transfer_in" };
    if (d.includes("invoice") || d.includes("contract") || d.includes("settlement") || d.includes("payment"))
      return { category: "Income",    badge: "Payment",  badgeBg: "#F0FDF4", badgeBorder: "#BBF7D0", badgeColor: "#16A34A", icon: "📄", iconBg: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", iconColor: "#059669", txType: "deposit" };
    if (d.includes("freelance") || d.includes("consulting") || d.includes("consulting fee"))
      return { category: "Income",    badge: "Income",   badgeBg: "#EFF6FF", badgeBorder: "#BFDBFE", badgeColor: "#2563EB", icon: "💻", iconBg: "linear-gradient(135deg,#EEF4FF,#DBEAFE)", iconColor: "#1A73E8", txType: "deposit" };
    if (d.includes("dividend") || d.includes("interest") || d.includes("yield"))
      return { category: "Income",    badge: "Income",   badgeBg: "#ECFDF5", badgeBorder: "#A7F3D0", badgeColor: "#059669", icon: "📈", iconBg: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", iconColor: "#059669", txType: "deposit" };
    // default credit
    return   { category: "Income",    badge: "Deposit",  badgeBg: "#EFF6FF", badgeBorder: "#BFDBFE", badgeColor: "#2563EB", icon: "↙", iconBg: "linear-gradient(135deg,#EEF4FF,#DBEAFE)", iconColor: "#1A73E8", txType: "deposit" };
  }

  // ── Debit ────────────────────────────────────────────────────
  if (d.includes("netflix") || d.includes("spotify") || d.includes("hulu") || d.includes("disney") || d.includes("prime video") || d.includes("apple tv"))
    return { category: "Entertainment", badge: "Card",      badgeBg: "#FEF2F2", badgeBorder: "#FECACA", badgeColor: "#DC2626", icon: "▶", iconBg: "linear-gradient(135deg,#FEE2E2,#FECACA)", iconColor: "#DC2626", txType: "card_payment" };
  if (d.includes("amazon") && !d.includes("aws"))
    return { category: "Shopping",      badge: "Card",      badgeBg: "#FFFBEB", badgeBorder: "#FDE68A", badgeColor: "#D97706", icon: "📦", iconBg: "linear-gradient(135deg,#FFFBEB,#FDE68A)", iconColor: "#D97706", txType: "card_payment" };
  if (d.includes("uber") || d.includes("lyft") || d.includes("ride") || d.includes("taxi"))
    return { category: "Transport",     badge: "Card",      badgeBg: "#F8FAFC", badgeBorder: "#E2E8F0", badgeColor: "#64748B", icon: "🚗", iconBg: "linear-gradient(135deg,#F1F5F9,#E2E8F0)", iconColor: "#374151", txType: "card_payment" };
  if (d.includes("grocery") || d.includes("whole foods") || d.includes("kroger") || d.includes("costco") || d.includes("walmart") || d.includes("trader joe") || d.includes("supermarket"))
    return { category: "Food",          badge: "Card",      badgeBg: "#F0FDF4", badgeBorder: "#BBF7D0", badgeColor: "#16A34A", icon: "🛒", iconBg: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", iconColor: "#059669", txType: "card_payment" };
  if (d.includes("restaurant") || d.includes("diner") || d.includes("cafe") || d.includes("starbucks") || d.includes("mcdonald") || d.includes("chipotle"))
    return { category: "Food",          badge: "Card",      badgeBg: "#F0FDF4", badgeBorder: "#BBF7D0", badgeColor: "#16A34A", icon: "🍽", iconBg: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", iconColor: "#059669", txType: "card_payment" };
  if (d.includes("utility") || d.includes("electric") || d.includes("water bill") || d.includes("utility bill") || d.includes("con ed") || d.includes("pge"))
    return { category: "Utilities",     badge: "Card",      badgeBg: "#FFF7ED", badgeBorder: "#FED7AA", badgeColor: "#EA580C", icon: "🔌", iconBg: "linear-gradient(135deg,#FFEDD5,#FED7AA)", iconColor: "#EA580C", txType: "card_payment" };
  if (d.includes("at&t") || d.includes("verizon") || d.includes("t-mobile") || d.includes("wireless") || d.includes("mobile plan") || d.includes("phone bill"))
    return { category: "Utilities",     badge: "Card",      badgeBg: "#FFF7ED", badgeBorder: "#FED7AA", badgeColor: "#EA580C", icon: "📱", iconBg: "linear-gradient(135deg,#FFEDD5,#FED7AA)", iconColor: "#EA580C", txType: "card_payment" };
  if (d.includes("atm") || d.includes("cash withdrawal") || d.includes("cash advance"))
    return { category: "Cash",          badge: "Cash",      badgeBg: "#EFF6FF", badgeBorder: "#BFDBFE", badgeColor: "#2563EB", icon: "🏧", iconBg: "linear-gradient(135deg,#DBEAFE,#BFDBFE)", iconColor: "#2563EB", txType: "withdrawal" };
  if (d.includes("wire") || d.includes("transfer") || d.includes("send") || d.includes("payroll transfer") || d.includes("payroll"))
    return { category: "Transfer",      badge: "Transfer",  badgeBg: "#EFF6FF", badgeBorder: "#BFDBFE", badgeColor: "#2563EB", icon: "↗", iconBg: "linear-gradient(135deg,#DBEAFE,#BFDBFE)", iconColor: "#2563EB", txType: "transfer_out" };
  if (d.includes("hotel") || d.includes("airbnb") || d.includes("flight") || d.includes("airline") || d.includes("travel") || d.includes("booking"))
    return { category: "Travel",        badge: "Card",      badgeBg: "#EEF4FF", badgeBorder: "#C4B5FD", badgeColor: "#7C3AED", icon: "✈", iconBg: "linear-gradient(135deg,#EEF4FF,#C4B5FD)", iconColor: "#7C3AED", txType: "card_payment" };
  if (d.includes("insurance") || d.includes("premium"))
    return { category: "Insurance",     badge: "Card",      badgeBg: "#F5F3FF", badgeBorder: "#DDD6FE", badgeColor: "#7C3AED", icon: "🛡", iconBg: "linear-gradient(135deg,#F5F3FF,#DDD6FE)", iconColor: "#7C3AED", txType: "card_payment" };
  if (d.includes("rent") || d.includes("mortgage") || d.includes("lease") || d.includes("office rent"))
    return { category: "Housing",       badge: "Card",      badgeBg: "#F5F3FF", badgeBorder: "#DDD6FE", badgeColor: "#7C3AED", icon: "🏠", iconBg: "linear-gradient(135deg,#F5F3FF,#DDD6FE)", iconColor: "#7C3AED", txType: "card_payment" };
  if (d.includes("diesel") || d.includes("fuel") || d.includes("gas station") || d.includes("petrol") || d.includes("fleet"))
    return { category: "Transport",     badge: "Card",      badgeBg: "#F8FAFC", badgeBorder: "#E2E8F0", badgeColor: "#64748B", icon: "⛽", iconBg: "linear-gradient(135deg,#F1F5F9,#E2E8F0)", iconColor: "#374151", txType: "card_payment" };
  if (d.includes("equipment") || d.includes("maintenance") || d.includes("repair") || d.includes("service"))
    return { category: "Equipment",     badge: "Card",      badgeBg: "#F8FAFC", badgeBorder: "#E2E8F0", badgeColor: "#64748B", icon: "🔧", iconBg: "linear-gradient(135deg,#F1F5F9,#E2E8F0)", iconColor: "#374151", txType: "card_payment" };
  if (d.includes("timber") || d.includes("lumber") || d.includes("forestry") || d.includes("weyerhaeuser") || d.includes("georgia-pacific") || d.includes("redwood"))
    return { category: "Business",      badge: "Business",  badgeBg: "#F0FDF4", badgeBorder: "#BBF7D0", badgeColor: "#16A34A", icon: "🌲", iconBg: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", iconColor: "#059669", txType: "transfer_out" };
  // default debit
  return   { category: "Shopping",      badge: "Card",      badgeBg: "#FFFBEB", badgeBorder: "#FDE68A", badgeColor: "#D97706", icon: "💳", iconBg: "linear-gradient(135deg,#FFFBEB,#FDE68A)", iconColor: "#D97706", txType: "card_payment" };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email, amount, type, currency,
      description, internalNote, txDate,
    } = body as {
      email?:        string;
      amount?:       number;
      type?:         "credit" | "debit";
      currency?:     string;   // defaults to "USD"
      description?:  string;   // user-visible transaction name
      internalNote?: string;   // admin-only audit note
      txDate?:       string;   // ISO date override
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

    // ── Resolve target currency (default USD) ───────────────
    const targetCurrency = (currency ?? "USD").toUpperCase();

    const accounts = (stateRaw.accounts as AccountEntry[]).map(a => ({ ...a }));
    const primaryIdx = accounts.findIndex(a => a.currency === targetCurrency);
    if (primaryIdx === -1) {
      return NextResponse.json(
        { error: `No ${targetCurrency} account found for this user` },
        { status: 404 }
      );
    }

    const oldBal = accounts[primaryIdx].balance as number;
    const newBal = type === "credit" ? oldBal + amt : Math.max(0, oldBal - amt);
    accounts[primaryIdx] = { ...accounts[primaryIdx], balance: newBal };

    console.log(
      `[admin/balance] ${type} ${amt} ${targetCurrency} →` +
      ` userId=${authUser.id} email=${normalizedEmail}` +
      ` accountId=${accounts[primaryIdx].id} newBalance=${newBal}` +
      ` desc="${description ?? "(none)"}"`
    );

    // ── Build user-visible description ──────────────────────
    // The public-facing name is whatever the admin typed.
    // "Admin Credit / Admin Debit" is NEVER shown to users.
    const visibleName = description?.trim()
      || (type === "credit" ? "Incoming Transfer" : "Payment");

    // ── Classify based on description for icon/badge ────────
    const visual = classifyTx(visibleName, type);

    // ── Build transaction record ─────────────────────────────
    const txDate_ = txDate ? new Date(txDate).toISOString() : new Date().toISOString();
    const txn = {
      id:           genTxId(),
      txType:       type === "credit" ? "admin_credit" : "admin_debit",  // internal only
      type,
      name:         visibleName,           // what user sees
      sub:          "Vaulte Banking",
      amount:       amt,
      fee:          0,
      balanceAfter: newBal,
      currency:     targetCurrency,
      date:         txDate_,
      category:     visual.category,
      badge:        visual.badge,
      badgeBg:      visual.badgeBg,
      badgeBorder:  visual.badgeBorder,
      badgeColor:   visual.badgeColor,
      status:       "completed",
      accountId:    accounts[primaryIdx].id,
      icon:         visual.icon,
      iconBg:       visual.iconBg,
      iconColor:    visual.iconColor,
      reference:    genRef(),
      // ── Audit fields — admin-only, never rendered in user UI ──
      source:       "admin_manual" as const,
      createdBy:    "admin",
      ...(internalNote ? { internalNote: internalNote.trim() } : {}),
    };

    const updatedState = {
      ...stateRaw,
      accounts,
      transactions: [txn, ...((stateRaw.transactions as unknown[]) ?? [])],
      lastUpdated:  new Date().toISOString(),
    };

    await redis.set(RK.userState(normalizedEmail), updatedState);

    return NextResponse.json({
      success:      true,
      newBalance:   newBal,
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
