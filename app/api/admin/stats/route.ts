// ─────────────────────────────────────────────────────────────
//  GET /api/admin/stats
//  Returns live admin dashboard statistics computed entirely
//  from Redis — no localStorage, no client-side cache.
//  Called by the admin dashboard page on every mount.
// ─────────────────────────────────────────────────────────────
import { NextResponse } from "next/server";
import redis, { AuthUser, RK } from "@/lib/redis";

const RATES: Record<string, number> = { USD: 1, EUR: 1.09, GBP: 1.27, BTC: 66000 };

interface AccountEntry  { balance: number; currency: string; }
interface TxEntry       {
  id: string; reference?: string; type: string; amount: number;
  currency: string; date: string; status: string; name?: string;
}

export async function GET() {
  try {
    // ── 1. Scan all registered users from Redis ─────────────
    const authUsers: AuthUser[] = [];
    let cursor = 0;
    do {
      const [nextCursor, keys] = await redis.scan(cursor, {
        match: "auth:user:*",
        count: 100,
      });
      cursor = Number(nextCursor);
      if (keys.length > 0) {
        const values = await redis.mget<(AuthUser | null)[]>(...(keys as [string, ...string[]]));
        values.forEach(v => { if (v) authUsers.push(v); });
      }
    } while (cursor !== 0);

    const totalUsers = authUsers.length;

    if (totalUsers === 0) {
      return NextResponse.json({
        success: true,
        totalUsers: 0, totalAccounts: 0, totalTransactions: 0,
        totalAUM: 0, pendingKYC: 0, unverifiedUsers: 0,
        recentTransactions: [], recentKYC: [],
      });
    }

    // ── 2. Batch-fetch KYC + banking states in 3 round-trips ─
    const statusKeys = authUsers.map(u => RK.kycStatus(u.email))  as [string, ...string[]];
    const dataKeys   = authUsers.map(u => RK.kycData(u.email))    as [string, ...string[]];
    const stateKeys  = authUsers.map(u => RK.userState(u.email))  as [string, ...string[]];

    const [kycStatuses, kycDataArr, userStates] = await Promise.all([
      redis.mget<(string | null)[]>(...statusKeys),
      redis.mget<(Record<string, string> | null)[]>(...dataKeys),
      redis.mget<(Record<string, unknown> | null)[]>(...stateKeys),
    ]);

    // ── 3. Aggregate stats ───────────────────────────────────
    let totalAccounts     = 0;
    let totalTransactions = 0;
    let totalAUM          = 0;
    let pendingKYC        = 0;
    let unverifiedUsers   = 0;

    const allRecentTx: Array<{
      date: string; ref: string; user: string;
      type: string; amount: string; status: string; time: string;
    }> = [];
    const recentKYC: Array<{
      user: string; doc: string; submitted: string; status: string;
    }> = [];

    authUsers.forEach((u, i) => {
      const kycStatus = kycStatuses[i] ?? "unverified";
      const kycData   = kycDataArr[i];
      const state     = userStates[i];

      if (kycStatus === "pending") {
        pendingKYC++;
        recentKYC.push({
          user:      `${u.firstName} ${u.lastName}`,
          doc:       kycData?.docType === "passport"        ? "Passport"
                   : kycData?.docType === "drivers_license" ? "Driver's License"
                   : kycData?.docType === "national_id"     ? "National ID"
                   : "Not uploaded",
          submitted: kycData?.submittedAt
            ? new Date(kycData.submittedAt).toLocaleDateString()
            : "Not submitted",
          status: "Pending",
        });
      }
      if (kycStatus === "unverified") unverifiedUsers++;

      if (state?.accounts) {
        const accounts = state.accounts as AccountEntry[];
        totalAccounts += accounts.length;
        accounts.forEach(a => {
          totalAUM += (a.balance ?? 0) * (RATES[a.currency] ?? 1);
        });
      }

      if (state?.transactions) {
        const txns = state.transactions as TxEntry[];
        totalTransactions += txns.length;
        txns.slice(0, 3).forEach(tx => {
          allRecentTx.push({
            date:   tx.date ?? "",
            ref:    (tx.reference ?? tx.id ?? "").slice(0, 12),
            user:   `${u.firstName} ${u.lastName}`.slice(0, 18),
            type:   tx.type === "credit" ? "Credit" : "Debit",
            amount: `${tx.currency === "BTC" ? "₿" : "$"}${(tx.amount ?? 0).toLocaleString("en-US", { maximumFractionDigits: 2 })}`,
            status: tx.status === "completed" ? "Completed"
                  : tx.status === "pending"   ? "Pending"
                  : "Failed",
            time:   tx.date ? new Date(tx.date).toLocaleDateString() : "",
          });
        });
      }
    });

    // Sort by date desc, take 5 most recent
    allRecentTx.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    // Strip the internal date field before returning
    const recentTransactions = allRecentTx.slice(0, 5).map(({ date: _d, ...rest }) => rest);

    return NextResponse.json({
      success: true,
      totalUsers,
      totalAccounts,
      totalTransactions,
      totalAUM,
      pendingKYC,
      unverifiedUsers,
      recentTransactions,
      recentKYC: recentKYC.slice(0, 4),
    });
  } catch (err) {
    console.error("[GET /api/admin/stats]", err);
    return NextResponse.json(
      { success: false, error: "Failed to compute stats" },
      { status: 500 }
    );
  }
}
