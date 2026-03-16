// ─────────────────────────────────────────────────────────────
//  POST /api/admin/generate-history
//
//  Commits a batch of historically-generated transactions into
//  the user's live Redis ledger. This creates one continuous
//  transaction history — historical entries appear BEFORE any
//  live entries, all in the same array.
//
//  Body:
//  {
//    email:        string           – target user email
//    currency?:    string           – which wallet TXs belong to (default "USD")
//    transactions: IncomingTx[]    – the generated transaction batch
//    openingBalance: number        – opening balance for the TX run
//    finalBalance:   number        – total USD wealth to distribute across wallets
//    distributeAcrossWallets?: boolean  – default true
//  }
//
//  Where IncomingTx = {
//    date:         string           – ISO or human date string
//    description:  string           – user-visible label
//    type:         "credit"|"debit"
//    amount:       number
//    reference?:   string
//    internalNote?:string
//  }
//
//  Multi-wallet allocation (when distributeAcrossWallets = true):
//    USD gets rand(55–65)% of finalBalance
//    GBP, EUR, BTC split the remaining % randomly
//    BTC value is divided by 66 000 to get BTC units
// ─────────────────────────────────────────────────────────────
import { NextRequest, NextResponse } from "next/server";
import redis, { AuthUser, RK } from "@/lib/redis";

// ── Exchange rates (USD as base) ─────────────────────────────
const USD_RATES: Record<string, number> = {
  USD: 1, EUR: 1.09, GBP: 1.27, BTC: 66000,
};

function usdTo(amount: number, currency: string): number {
  return amount / (USD_RATES[currency] ?? 1);
}

// ── ID helpers ────────────────────────────────────────────────
function genTxId() {
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
function genRef() {
  return `VLT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
}

// ── Incoming transaction shape from the generator UI ─────────
interface IncomingTx {
  date:         string;
  description:  string;
  type:         "credit" | "debit";
  amount:       number;
  reference?:   string;
  internalNote?:string;
}

// ── Account shape in Redis state ─────────────────────────────
interface AccountEntry {
  id:       string;
  currency: string;
  balance:  number;
  [key: string]: unknown;
}

// ── Classify a description into visual metadata ──────────────
function classifyTx(description: string, type: "credit" | "debit"): {
  category: string; badge: string;
  badgeBg: string; badgeBorder: string; badgeColor: string;
  icon: string; iconBg: string; iconColor: string;
  txType: string;
} {
  const d = description.toLowerCase();
  if (type === "credit") {
    if (d.includes("salary") || d.includes("payroll") || d.includes("wages"))
      return { category:"Income",        badge:"Salary",   badgeBg:"#EFF6FF", badgeBorder:"#BFDBFE", badgeColor:"#2563EB", icon:"💼", iconBg:"linear-gradient(135deg,#EEF4FF,#DBEAFE)", iconColor:"#1A73E8", txType:"deposit" };
    if (d.includes("refund") || d.includes("return") || d.includes("reversal"))
      return { category:"Refund",        badge:"Refund",   badgeBg:"#F0FDF4", badgeBorder:"#BBF7D0", badgeColor:"#16A34A", icon:"↩", iconBg:"linear-gradient(135deg,#D1FAE5,#A7F3D0)", iconColor:"#059669", txType:"refund" };
    if (d.includes("transfer") || d.includes("wire") || d.includes("received"))
      return { category:"Transfer",      badge:"Incoming", badgeBg:"#F0FDF4", badgeBorder:"#BBF7D0", badgeColor:"#16A34A", icon:"↙", iconBg:"linear-gradient(135deg,#D1FAE5,#A7F3D0)", iconColor:"#059669", txType:"transfer_in" };
    if (d.includes("invoice") || d.includes("contract") || d.includes("settlement") || d.includes("supply payment") || d.includes("payment"))
      return { category:"Income",        badge:"Payment",  badgeBg:"#F0FDF4", badgeBorder:"#BBF7D0", badgeColor:"#16A34A", icon:"📄", iconBg:"linear-gradient(135deg,#D1FAE5,#A7F3D0)", iconColor:"#059669", txType:"deposit" };
    if (d.includes("freelance") || d.includes("consulting"))
      return { category:"Income",        badge:"Income",   badgeBg:"#EFF6FF", badgeBorder:"#BFDBFE", badgeColor:"#2563EB", icon:"💻", iconBg:"linear-gradient(135deg,#EEF4FF,#DBEAFE)", iconColor:"#1A73E8", txType:"deposit" };
    if (d.includes("dividend") || d.includes("interest") || d.includes("yield"))
      return { category:"Income",        badge:"Income",   badgeBg:"#ECFDF5", badgeBorder:"#A7F3D0", badgeColor:"#059669", icon:"📈", iconBg:"linear-gradient(135deg,#D1FAE5,#A7F3D0)", iconColor:"#059669", txType:"deposit" };
    return   { category:"Income",        badge:"Deposit",  badgeBg:"#EFF6FF", badgeBorder:"#BFDBFE", badgeColor:"#2563EB", icon:"↙", iconBg:"linear-gradient(135deg,#EEF4FF,#DBEAFE)", iconColor:"#1A73E8", txType:"deposit" };
  }
  // debits
  if (d.includes("netflix") || d.includes("spotify") || d.includes("hulu") || d.includes("disney") || d.includes("apple tv"))
    return { category:"Entertainment",  badge:"Card",     badgeBg:"#FEF2F2", badgeBorder:"#FECACA", badgeColor:"#DC2626", icon:"▶", iconBg:"linear-gradient(135deg,#FEE2E2,#FECACA)", iconColor:"#DC2626", txType:"card_payment" };
  if (d.includes("amazon") && !d.includes("aws"))
    return { category:"Shopping",       badge:"Card",     badgeBg:"#FFFBEB", badgeBorder:"#FDE68A", badgeColor:"#D97706", icon:"📦", iconBg:"linear-gradient(135deg,#FFFBEB,#FDE68A)", iconColor:"#D97706", txType:"card_payment" };
  if (d.includes("uber") || d.includes("lyft") || d.includes("ride") || d.includes("taxi"))
    return { category:"Transport",      badge:"Card",     badgeBg:"#F8FAFC", badgeBorder:"#E2E8F0", badgeColor:"#64748B", icon:"🚗", iconBg:"linear-gradient(135deg,#F1F5F9,#E2E8F0)", iconColor:"#374151", txType:"card_payment" };
  if (d.includes("grocery") || d.includes("whole foods") || d.includes("kroger") || d.includes("walmart") || d.includes("costco") || d.includes("supermarket"))
    return { category:"Food",           badge:"Card",     badgeBg:"#F0FDF4", badgeBorder:"#BBF7D0", badgeColor:"#16A34A", icon:"🛒", iconBg:"linear-gradient(135deg,#D1FAE5,#A7F3D0)", iconColor:"#059669", txType:"card_payment" };
  if (d.includes("restaurant") || d.includes("diner") || d.includes("cafe") || d.includes("starbucks") || d.includes("mcdonald"))
    return { category:"Food",           badge:"Card",     badgeBg:"#F0FDF4", badgeBorder:"#BBF7D0", badgeColor:"#16A34A", icon:"🍽", iconBg:"linear-gradient(135deg,#D1FAE5,#A7F3D0)", iconColor:"#059669", txType:"card_payment" };
  if (d.includes("utility") || d.includes("utility bill") || d.includes("electric") || d.includes("water bill") || d.includes("con ed"))
    return { category:"Utilities",      badge:"Card",     badgeBg:"#FFF7ED", badgeBorder:"#FED7AA", badgeColor:"#EA580C", icon:"🔌", iconBg:"linear-gradient(135deg,#FFEDD5,#FED7AA)", iconColor:"#EA580C", txType:"card_payment" };
  if (d.includes("at&t") || d.includes("verizon") || d.includes("t-mobile") || d.includes("wireless") || d.includes("mobile plan") || d.includes("phone bill"))
    return { category:"Utilities",      badge:"Card",     badgeBg:"#FFF7ED", badgeBorder:"#FED7AA", badgeColor:"#EA580C", icon:"📱", iconBg:"linear-gradient(135deg,#FFEDD5,#FED7AA)", iconColor:"#EA580C", txType:"card_payment" };
  if (d.includes("atm") || d.includes("cash withdrawal"))
    return { category:"Cash",           badge:"Cash",     badgeBg:"#EFF6FF", badgeBorder:"#BFDBFE", badgeColor:"#2563EB", icon:"🏧", iconBg:"linear-gradient(135deg,#DBEAFE,#BFDBFE)", iconColor:"#2563EB", txType:"withdrawal" };
  if (d.includes("wire") || d.includes("transfer") || d.includes("send") || d.includes("payroll transfer") || d.includes("payroll"))
    return { category:"Transfer",       badge:"Transfer", badgeBg:"#EFF6FF", badgeBorder:"#BFDBFE", badgeColor:"#2563EB", icon:"↗", iconBg:"linear-gradient(135deg,#DBEAFE,#BFDBFE)", iconColor:"#2563EB", txType:"transfer_out" };
  if (d.includes("hotel") || d.includes("airbnb") || d.includes("flight") || d.includes("airline") || d.includes("travel"))
    return { category:"Travel",         badge:"Card",     badgeBg:"#EEF4FF", badgeBorder:"#C4B5FD", badgeColor:"#7C3AED", icon:"✈", iconBg:"linear-gradient(135deg,#EEF4FF,#C4B5FD)", iconColor:"#7C3AED", txType:"card_payment" };
  if (d.includes("insurance") || d.includes("premium"))
    return { category:"Insurance",      badge:"Card",     badgeBg:"#F5F3FF", badgeBorder:"#DDD6FE", badgeColor:"#7C3AED", icon:"🛡", iconBg:"linear-gradient(135deg,#F5F3FF,#DDD6FE)", iconColor:"#7C3AED", txType:"card_payment" };
  if (d.includes("rent") || d.includes("mortgage") || d.includes("lease") || d.includes("office rent"))
    return { category:"Housing",        badge:"Card",     badgeBg:"#F5F3FF", badgeBorder:"#DDD6FE", badgeColor:"#7C3AED", icon:"🏠", iconBg:"linear-gradient(135deg,#F5F3FF,#DDD6FE)", iconColor:"#7C3AED", txType:"card_payment" };
  if (d.includes("diesel") || d.includes("fuel") || d.includes("gas station") || d.includes("petrol") || d.includes("fleet"))
    return { category:"Transport",      badge:"Card",     badgeBg:"#F8FAFC", badgeBorder:"#E2E8F0", badgeColor:"#64748B", icon:"⛽", iconBg:"linear-gradient(135deg,#F1F5F9,#E2E8F0)", iconColor:"#374151", txType:"card_payment" };
  if (d.includes("equipment") || d.includes("maintenance") || d.includes("repair"))
    return { category:"Equipment",      badge:"Card",     badgeBg:"#F8FAFC", badgeBorder:"#E2E8F0", badgeColor:"#64748B", icon:"🔧", iconBg:"linear-gradient(135deg,#F1F5F9,#E2E8F0)", iconColor:"#374151", txType:"card_payment" };
  if (d.includes("timber") || d.includes("lumber") || d.includes("forestry") || d.includes("weyerhaeuser") || d.includes("georgia-pacific") || d.includes("redwood"))
    return { category:"Business",       badge:"Business", badgeBg:"#F0FDF4", badgeBorder:"#BBF7D0", badgeColor:"#16A34A", icon:"🌲", iconBg:"linear-gradient(135deg,#D1FAE5,#A7F3D0)", iconColor:"#059669", txType:"transfer_out" };
  // default debit
  return   { category:"Shopping",       badge:"Card",     badgeBg:"#FFFBEB", badgeBorder:"#FDE68A", badgeColor:"#D97706", icon:"💳", iconBg:"linear-gradient(135deg,#FFFBEB,#FDE68A)", iconColor:"#D97706", txType:"card_payment" };
}

// ── Random in range (inclusive) ──────────────────────────────
function randBetween(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      email,
      currency = "USD",
      transactions: incoming,
      openingBalance,
      finalBalance,
      distributeAcrossWallets = true,
    } = body as {
      email:                   string;
      currency?:               string;
      transactions:            IncomingTx[];
      openingBalance:          number;
      finalBalance:            number;
      distributeAcrossWallets?:boolean;
    };

    if (!email || !incoming || !Array.isArray(incoming) || incoming.length === 0) {
      return NextResponse.json(
        { error: "email and a non-empty transactions array are required" },
        { status: 400 }
      );
    }

    const normalizedEmail  = email.toLowerCase().trim();
    const targetCurrency   = currency.toUpperCase();

    // ── Verify user ─────────────────────────────────────────
    const authUser = await redis.get<AuthUser>(RK.authUser(normalizedEmail));
    if (!authUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // ── Load current state ───────────────────────────────────
    const stateRaw = await redis.get<Record<string, unknown>>(RK.userState(normalizedEmail));
    if (!stateRaw?.accounts) {
      return NextResponse.json(
        { error: "No banking state found. User must log in first." },
        { status: 404 }
      );
    }

    // ── Find target account ──────────────────────────────────
    const accounts = (stateRaw.accounts as AccountEntry[]).map(a => ({ ...a }));
    const targetIdx = accounts.findIndex(a => a.currency === targetCurrency);
    if (targetIdx === -1) {
      return NextResponse.json(
        { error: `No ${targetCurrency} account found for this user` },
        { status: 404 }
      );
    }

    // ── Sort incoming by date ascending ──────────────────────
    const sorted = [...incoming].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // ── Convert to full Transaction records with running balance
    let runningBalance = openingBalance;
    const histTxns = sorted.map((tx) => {
      if (tx.type === "credit") {
        runningBalance = round2(runningBalance + tx.amount);
      } else {
        runningBalance = round2(Math.max(0, runningBalance - tx.amount));
      }
      const visual = classifyTx(tx.description, tx.type);
      return {
        id:           genTxId(),
        txType:       visual.txType,
        type:         tx.type,
        name:         tx.description,          // user-visible — no "Admin Credit"
        sub:          "Vaulte Banking",
        amount:       round2(tx.amount),
        fee:          0,
        balanceAfter: runningBalance,
        currency:     targetCurrency,
        date:         new Date(tx.date).toISOString(),
        category:     visual.category,
        badge:        visual.badge,
        badgeBg:      visual.badgeBg,
        badgeBorder:  visual.badgeBorder,
        badgeColor:   visual.badgeColor,
        status:       "completed" as const,
        accountId:    accounts[targetIdx].id,
        icon:         visual.icon,
        iconBg:       visual.iconBg,
        iconColor:    visual.iconColor,
        reference:    tx.reference ?? genRef(),
        // audit fields
        source:       "historical_generator" as const,
        createdBy:    "admin",
        ...(tx.internalNote ? { internalNote: tx.internalNote } : {}),
      };
    });

    // ── Distribute final balance across wallets ───────────────
    // USD: 55–65 %  |  GBP + EUR + BTC: 35–45 % split randomly
    if (distributeAcrossWallets) {
      const usdShare   = randBetween(0.55, 0.65);             // e.g. 0.62
      const remaining  = 1 - usdShare;                        // e.g. 0.38

      // Split remaining randomly among 3 currencies
      const r1 = randBetween(0.2, 0.6);  // GBP share of remaining
      const r2 = randBetween(0.2, 0.6 - (r1 - 0.2));  // EUR share
      const r3 = 1 - r1 - r2;            // BTC share (rest)

      const shares: Record<string, number> = {
        USD: usdShare,
        GBP: remaining * r1,
        EUR: remaining * r2,
        BTC: remaining * r3,
      };

      // Apply to each account
      accounts.forEach((acc, i) => {
        const shareUSD = finalBalance * (shares[acc.currency] ?? 0);
        const newBal   = acc.currency === "BTC"
          ? round2(usdTo(shareUSD, "BTC"))   // convert USD → BTC
          : round2(usdTo(shareUSD, acc.currency));
        accounts[i] = { ...acc, balance: newBal };
      });

      // Correct: target account's balanceAfter on last historical TX
      // should reflect the allocated amount, not the running total
      if (histTxns.length > 0) {
        histTxns[histTxns.length - 1] = {
          ...histTxns[histTxns.length - 1],
          balanceAfter: accounts[targetIdx].balance,
        };
      }
    } else {
      // Without distribution: just set the target account to finalBalance
      accounts[targetIdx] = { ...accounts[targetIdx], balance: round2(finalBalance) };
      if (histTxns.length > 0) {
        histTxns[histTxns.length - 1] = {
          ...histTxns[histTxns.length - 1],
          balanceAfter: round2(finalBalance),
        };
      }
    }

    // ── Merge into existing transactions ─────────────────────
    // Historical transactions go BEFORE any existing live TXs.
    // The array is kept newest-first (most UIs render .slice(0,N)),
    // so we append hist at the END and sort the whole thing.
    const existingTxns = (stateRaw.transactions as unknown[] ?? []) as Record<string, unknown>[];
    const merged = [...existingTxns, ...histTxns].sort(
      (a, b) =>
        new Date(b.date as string).getTime() - new Date(a.date as string).getTime()
    );

    const updatedState = {
      ...stateRaw,
      accounts,
      transactions: merged,
      lastUpdated: new Date().toISOString(),
    };

    await redis.set(RK.userState(normalizedEmail), updatedState);

    console.log(
      `[generate-history] ${histTxns.length} historical TXs → userId=${authUser.id}` +
      ` email=${normalizedEmail} currency=${targetCurrency}` +
      ` finalBalance=${finalBalance} distribute=${distributeAcrossWallets}`
    );

    return NextResponse.json({
      success:          true,
      transactionCount: histTxns.length,
      newBalances:      Object.fromEntries(accounts.map(a => [a.currency, a.balance])),
    });
  } catch (err) {
    console.error("[POST /api/admin/generate-history]", err);
    return NextResponse.json(
      { error: "Failed to commit transaction history" },
      { status: 500 }
    );
  }
}
