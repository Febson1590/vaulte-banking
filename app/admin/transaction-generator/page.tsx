"use client";
import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";

// ── User/account types from the API ──────────────────────────
interface ApiAccount {
  id: string;
  currency: string;
  name: string;
  balance: number;
  symbol: string;
}
interface ApiUser {
  id:           string;
  firstName:    string;
  lastName:     string;
  email:        string;
  bankingState: { accounts: ApiAccount[] } | null;
}

// ── Generated transaction (UI-local before commit) ───────────
interface GeneratedTx {
  date:        string;
  description: string;
  type:        "credit" | "debit";
  amount:      number;
  balance:     number;
  reference:   string;
  status:      string;
}

// ── Helpers ──────────────────────────────────────────────────
function generateRef() {
  return "VLT-" + Math.random().toString(36).substr(2, 8).toUpperCase();
}

function splitAmount(total: number, count: number): number[] {
  if (count === 0) return [];
  const amounts: number[] = [];
  let remaining = total;
  for (let i = 0; i < count - 1; i++) {
    const maxSlice = remaining - (count - i - 1) * 1;
    const amount   = Math.round((Math.random() * (maxSlice * 0.4 - 1) + 1) * 100) / 100;
    amounts.push(amount);
    remaining -= amount;
  }
  amounts.push(Math.round(remaining * 100) / 100);
  return amounts;
}

// ── Realistic date generator ─────────────────────────────────
//
// Replaces the old linear-interpolation approach:
//   OLD:  dayIndex = floor(i / N × M)  →  perfectly even steps every few days
//   NEW:  month-stratified + geometric-decay random placement
//
// Strategy:
//   1. Group the valid-day pool by calendar month (preserves chronological order).
//   2. Phase 1 — give every month at least 1 transaction slot (if budget allows).
//      This ensures no month is completely silent unless count < months.length.
//   3. Phase 2 — top up randomly using geometric-decay probability:
//      P(add another tx to a month already at k) = 1 / (k + 1)
//      · k=0 → p=1.00 (always add if empty, already handled in phase 1)
//      · k=1 → p=0.50 (coin flip for a 2nd tx in a month)
//      · k=2 → p=0.33 (unlikely 3rd)
//      · k=3 → p=0.25 (rare 4th)
//      This naturally produces mostly 1-2 tx/month with occasional 3-4 bursts.
//   4. Phase 3 — force-place any remainder (edge case: very many transactions).
//   5. Within each month, pick random valid days with replacement so
//      same-day transactions are allowed (realistic for debits).
//   6. Final sort ensures strict chronological order.
//
function generateRealisticDates(days: Date[], count: number): Date[] {
  if (count === 0 || days.length === 0) return [];

  // Group available days by calendar month, insertion-ordered → chronological
  const byMonth = new Map<string, Date[]>();
  for (const d of days) {
    const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(d);
  }
  const months = [...byMonth.values()];
  if (months.length === 0) return [];

  // Per-month cap — always high enough to hold all transactions if needed,
  // but the geometric probability keeps most months well below this ceiling.
  const dynCap = Math.max(5, Math.ceil(count / months.length) + 2);

  // Phase 1: one slot per month until budget runs out
  const slots = new Array<number>(months.length).fill(0);
  let remaining = count;
  for (let mi = 0; mi < months.length && remaining > 0; mi++) {
    const cap = Math.min(dynCap, months[mi].length);
    if (cap >= 1) { slots[mi] = 1; remaining--; }
  }

  // Phase 2: geometric-decay top-up — produces natural monthly variation
  let guard = count * 20; // safety valve; exits if loop is thrashing
  while (remaining > 0 && guard-- > 0) {
    const mi  = Math.floor(Math.random() * months.length);
    const cap = Math.min(dynCap, months[mi].length);
    const cur = slots[mi];
    // Probability drops off as month count rises → organic 1–4 range
    if (cur < cap && Math.random() < 1 / (cur + 1)) {
      slots[mi]++;
      remaining--;
    }
  }

  // Phase 3: force-place any stragglers (hits only when count is very large)
  for (let mi = 0; remaining > 0 && mi < months.length; mi++) {
    const cap = Math.min(dynCap, months[mi].length);
    while (slots[mi] < cap && remaining > 0) { slots[mi]++; remaining--; }
  }

  // Pick random days within each month (with replacement — same day is fine)
  const result: Date[] = [];
  months.forEach((monthDays, mi) => {
    for (let j = 0; j < slots[mi]; j++) {
      const base = monthDays[Math.floor(Math.random() * monthDays.length)];
      const date = new Date(base);
      date.setHours(
        Math.floor(Math.random() * 14) + 7,  // 07:00 – 20:59
        Math.floor(Math.random() * 60),
        Math.floor(Math.random() * 60),
        0,
      );
      result.push(date);
    }
  });

  result.sort((a, b) => a.getTime() - b.getTime());
  return result;
}

// ── Core generator ───────────────────────────────────────────
// Generates exactly creditCount credit transactions and debitCount debit
// transactions.  Descriptions are strictly drawn from the matching pool:
//   · creditDescs → only used for credit transactions
//   · debitDescs  → only used for debit transactions
// If the pool has fewer entries than the transaction count, descriptions are
// reused randomly within the same type.  No system descriptions are ever added.
function generateTransactions(
  startDate: string, endDate: string,
  openingBalance: number, totalCredits: number, totalDebits: number,
  creditCount: number, debitCount: number,
  includeWeekends: boolean,
  creditDescs: string[], debitDescs: string[]
): GeneratedTx[] {
  // Build available date pool (weekday filter applied here if needed)
  const start = new Date(startDate);
  const end   = new Date(endDate);
  const days: Date[] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay();
    if (!includeWeekends && (dow === 0 || dow === 6)) continue;
    days.push(new Date(d));
  }

  // Split amounts into exactly the admin-specified counts
  const creditAmounts = splitAmount(totalCredits, creditCount);
  const debitAmounts  = splitAmount(totalDebits,  debitCount);

  // Shuffle the combined list — type order has no effect on dates any more
  const allAmounts: { type: "credit" | "debit"; amount: number }[] = [
    ...creditAmounts.map(a => ({ type: "credit" as const, amount: a })),
    ...debitAmounts.map(a  => ({ type: "debit"  as const, amount: a })),
  ].sort(() => Math.random() - 0.5);

  // Generate realistic, naturally-spaced dates for every transaction
  const realisticDates = generateRealisticDates(days, allAmounts.length);

  // Build transactions — dates come from the pre-generated array
  let balance = openingBalance;
  const transactions: GeneratedTx[] = allAmounts.map((tx, i) => {
    const date = realisticDates[i] ?? new Date(); // ?? only fires on bad edge cases

    balance = tx.type === "credit"
      ? Math.round((balance + tx.amount) * 100) / 100
      : Math.round(Math.max(0, balance - tx.amount) * 100) / 100;

    // Strictly pick description from the matching type pool only
    const pool = tx.type === "credit" ? creditDescs : debitDescs;
    const description = pool[Math.floor(Math.random() * pool.length)];

    return {
      date:        date.toISOString(),
      description,
      type:        tx.type,
      amount:      tx.amount,
      balance,
      reference:   generateRef(),
      status:      "Completed",
    };
  });

  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  return transactions;
}

// ─────────────────────────────────────────────────────────────
export default function AdminTxGenerator() {
  // ── Real users from Redis ──────────────────────────────────
  const [users,        setUsers]        = useState<ApiUser[]>([]);
  const [usersLoaded,  setUsersLoaded]  = useState(false);
  const [selectedUser, setSelectedUser] = useState<ApiUser | null>(null);
  const [selectedAcc,  setSelectedAcc]  = useState<ApiAccount | null>(null);

  const loadUsers = useCallback(async () => {
    try {
      const res  = await fetch("/api/admin/users");
      const data = await res.json() as { success: boolean; users: ApiUser[] };
      if (!data.success) return;
      const real = data.users.filter(
        u => u.email !== "demo@vaulte.com" && u.bankingState?.accounts?.length
      );
      setUsers(real);
      if (real.length > 0) {
        setSelectedUser(real[0]);
        setSelectedAcc(real[0].bankingState?.accounts?.[0] ?? null);
      }
    } finally {
      setUsersLoaded(true);
    }
  }, []);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  // ── Form state ─────────────────────────────────────────────
  const [form, setForm] = useState({
    startDate:       "2025-01-01",
    endDate:         "2025-12-31",
    openingBalance:  "1000",
    finalBalance:    "85000",
    totalCredits:    "120000",
    totalDebits:     "36000",
    creditCount:     "8",
    debitCount:      "5",
    includeWeekends: true,
    creditDescs:     "",
    debitDescs:      "",
  });
  const set = (key: string, value: string | boolean) =>
    setForm(prev => ({ ...prev, [key]: value }));

  // ── UI state ───────────────────────────────────────────────
  const [preview,     setPreview]     = useState<GeneratedTx[] | null>(null);
  const [error,       setError]       = useState("");
  const [saving,      setSaving]      = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [savedResult, setSavedResult] = useState<{ count: number; balances: Record<string, number> } | null>(null);
  const [generating,  setGenerating]  = useState(false);

  // ── Validate & generate preview ────────────────────────────
  const validateAndGenerate = () => {
    setError("");
    const opening   = parseFloat(form.openingBalance);
    const final     = parseFloat(form.finalBalance);
    const credits   = parseFloat(form.totalCredits);
    const debits    = parseFloat(form.totalDebits);
    const creditCt  = parseInt(form.creditCount, 10);
    const debitCt   = parseInt(form.debitCount, 10);

    // Balance formula
    const expected = Math.round((opening + credits - debits) * 100) / 100;
    if (Math.abs(expected - final) > 0.01) {
      setError(`Balance formula mismatch: Opening ($${opening}) + Credits ($${credits}) − Debits ($${debits}) = $${expected}, but Final Balance is $${final}.`);
      return;
    }

    // Date range
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      setError("Start date must be before end date.");
      return;
    }

    // Credit count
    if (credits > 0 && (isNaN(creditCt) || creditCt < 1)) {
      setError("Number of Credit Transactions must be at least 1 when Total Credits > 0.");
      return;
    }

    // Debit count
    if (debits > 0 && (isNaN(debitCt) || debitCt < 1)) {
      setError("Number of Debit Transactions must be at least 1 when Total Debits > 0.");
      return;
    }

    // Parse description pools
    const creditDescs = form.creditDescs.split("\n").map(d => d.trim()).filter(Boolean);
    const debitDescs  = form.debitDescs.split("\n").map(d => d.trim()).filter(Boolean);

    // Descriptions required when the type has transactions
    if (credits > 0 && creditDescs.length === 0) {
      setError("Credit Transaction Descriptions must not be empty when Total Credits > 0. Enter at least one description.");
      return;
    }
    if (debits > 0 && debitDescs.length === 0) {
      setError("Debit Transaction Descriptions must not be empty when Total Debits > 0. Enter at least one description.");
      return;
    }

    setGenerating(true);
    setTimeout(() => {
      const txs = generateTransactions(
        form.startDate, form.endDate,
        opening, credits, debits,
        creditCt, debitCt,
        form.includeWeekends,
        creditDescs, debitDescs
      );
      setPreview(txs);
      setGenerating(false);
      setSaved(false);
    }, 800);
  };

  // ── Commit to Redis ────────────────────────────────────────
  const handleConfirm = async () => {
    if (!preview || !selectedUser || !selectedAcc) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/generate-history", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          email:        selectedUser.email,
          currency:     selectedAcc.currency,
          transactions: preview.map(tx => ({
            date:        tx.date,
            description: tx.description,
            type:        tx.type,
            amount:      tx.amount,
            reference:   tx.reference,
          })),
          openingBalance:          parseFloat(form.openingBalance),
          finalBalance:            parseFloat(form.finalBalance),
          distributeAcrossWallets: true,
        }),
      });
      const data = await res.json() as {
        success: boolean;
        transactionCount?: number;
        newBalances?: Record<string, number>;
        error?: string;
      };
      if (!data.success) throw new Error(data.error ?? "Failed to save");
      setSavedResult({ count: data.transactionCount ?? preview.length, balances: data.newBalances ?? {} });
      setSaved(true);
      setPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to commit transactions");
    } finally {
      setSaving(false);
    }
  };

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });

  const INPUT = {
    width: "100%", padding: "10px 14px",
    border: "1.5px solid #E5E7EB", borderRadius: "10px",
    fontSize: "13px", outline: "none", boxSizing: "border-box" as const,
  };

  // Derived counts for the preview header
  const previewCredits = preview?.filter(t => t.type === "credit").length ?? 0;
  const previewDebits  = preview?.filter(t => t.type === "debit").length ?? 0;

  // ── Render ─────────────────────────────────────────────────
  return (
    <AdminLayout title="Transaction Generator">
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0A1628" }}>Historical Transaction Generator</h1>
        <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>
          Generate realistic past transaction histories — committed directly to the user&apos;s live ledger in Redis.
        </p>
      </div>

      {/* Info banner */}
      <div style={{ background: "linear-gradient(135deg,#0A1628,#1A2B4A)", borderRadius: "14px", padding: "18px 24px", marginBottom: "24px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
        <div style={{ fontSize: "26px" }}>🔧</div>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Admin-Only — Strict Formula Required</div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>
            <strong style={{ color: "#FFC107" }}>Opening + Credits − Debits = Final Balance</strong> must hold exactly.
            After commit, the final balance is distributed: <strong style={{ color: "#4ADE80" }}>USD 55–65%</strong>, with GBP / EUR / BTC splitting the rest.
            All generated transactions appear in the user&apos;s live statement — no separate demo list.
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px", color: "#DC2626", fontSize: "13px" }}>
          ⚠️ {error}
        </div>
      )}

      {/* ── Success screen ── */}
      {saved && savedResult ? (
        <div style={{ background: "#ECFDF5", border: "1px solid #6EE7B7", borderRadius: "14px", padding: "40px 32px", textAlign: "center" }}>
          <div style={{ fontSize: "52px", marginBottom: "12px" }}>✅</div>
          <div style={{ fontSize: "22px", fontWeight: 800, color: "#059669", marginBottom: "8px" }}>
            {savedResult.count} Transactions Committed to Redis
          </div>
          <div style={{ fontSize: "14px", color: "#6B7280", marginBottom: "24px" }}>
            All transactions are now live in <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong>&apos;s statement.
          </div>
          {/* Wallet breakdown */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", maxWidth: "560px", margin: "0 auto 28px" }}>
            {Object.entries(savedResult.balances).map(([cur, bal]) => {
              const symbols: Record<string, string> = { USD: "$", EUR: "€", GBP: "£", BTC: "₿" };
              const flags:   Record<string, string> = { USD: "🇺🇸", EUR: "🇪🇺", GBP: "🇬🇧", BTC: "₿" };
              const sym = symbols[cur] ?? cur;
              const val = cur === "BTC" ? `${sym}${bal.toFixed(4)}` : `${sym}${bal.toLocaleString("en-US", { minimumFractionDigits: 2 })}`;
              return (
                <div key={cur} style={{ background: "#fff", border: "1px solid #D1FAE5", borderRadius: "12px", padding: "14px 10px", textAlign: "center" }}>
                  <div style={{ fontSize: "20px", marginBottom: "4px" }}>{flags[cur]}</div>
                  <div style={{ fontSize: "15px", fontWeight: 800, color: "#059669" }}>{val}</div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "2px" }}>{cur}</div>
                </div>
              );
            })}
          </div>
          <button onClick={() => { setSaved(false); setSavedResult(null); }}
            style={{ padding: "12px 32px", background: "#1A73E8", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer" }}>
            Generate Another
          </button>
        </div>

      ) : preview ? (
        /* ── Preview ── */
        <div>
          <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0A1628" }}>
                  Preview — {preview.length} Transactions
                  <span style={{ marginLeft: "12px", fontSize: "13px", fontWeight: 600, color: "#059669" }}>
                    {previewCredits} credits
                  </span>
                  <span style={{ marginLeft: "8px", fontSize: "13px", fontWeight: 600, color: "#DC2626" }}>
                    {previewDebits} debits
                  </span>
                </h2>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6B7280" }}>
                  For <strong>{selectedUser?.firstName} {selectedUser?.lastName}</strong> · {selectedAcc?.currency} account · Review before committing to Redis
                </p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setPreview(null)}
                  style={{ padding: "10px 18px", background: "#F3F4F6", color: "#6B7280", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  ← Back
                </button>
                <button onClick={validateAndGenerate}
                  style={{ padding: "10px 18px", background: "#FFFBEB", color: "#D97706", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  🔄 Regenerate
                </button>
                <button onClick={handleConfirm} disabled={saving}
                  style={{ padding: "10px 18px", background: saving ? "#9CA3AF" : "#059669", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer" }}>
                  {saving ? "⏳ Saving…" : "✅ Commit to Redis"}
                </button>
              </div>
            </div>
            {/* Summary */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
              {[
                { label: "Opening Balance",  value: `$${form.openingBalance}`,  color: "#1A73E8" },
                { label: "Total Credits",    value: `+$${form.totalCredits}`,   color: "#059669" },
                { label: "Total Debits",     value: `-$${form.totalDebits}`,    color: "#DC2626" },
                { label: "Final Balance",    value: `$${form.finalBalance}`,    color: "#7C3AED" },
              ].map(s => (
                <div key={s.label} style={{ background: "#F8FAFC", borderRadius: "10px", padding: "12px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Table */}
          <div style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "auto", maxHeight: "520px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "750px" }}>
              <thead style={{ background: "#F8FAFC", position: "sticky", top: 0 }}>
                <tr>
                  {["Date & Time", "Description", "Type", "Amount", "Running Balance", "Reference"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((tx, i) => (
                  <tr key={i} style={{ borderTop: "1px solid #F3F4F6", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                    <td style={{ padding: "10px 16px", fontSize: "12px", color: "#6B7280", whiteSpace: "nowrap" }}>{fmtDate(tx.date)}</td>
                    <td style={{ padding: "10px 16px", fontSize: "13px", color: "#374151" }}>{tx.description}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ background: tx.type === "credit" ? "#ECFDF5" : "#FEF2F2", color: tx.type === "credit" ? "#059669" : "#DC2626", borderRadius: "20px", padding: "2px 10px", fontSize: "11px", fontWeight: 600 }}>
                        {tx.type === "credit" ? "Credit" : "Debit"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: "13px", fontWeight: 700, color: tx.type === "credit" ? "#059669" : "#DC2626" }}>
                      {tx.type === "credit" ? "+" : "-"}${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: "13px", fontWeight: 700, color: "#0A1628" }}>${tx.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                    <td style={{ padding: "10px 16px", fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace" }}>{tx.reference}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      ) : (
        /* ── Input form ── */
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }} className="txgen-grid">
          {/* ── LEFT COLUMN ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Target user */}
            <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700, color: "#0A1628" }}>👤 Target User & Account</h3>
              {!usersLoaded ? (
                <div style={{ color: "#9CA3AF", fontSize: "13px" }}>Loading users from Redis…</div>
              ) : users.length === 0 ? (
                <div style={{ color: "#DC2626", fontSize: "13px" }}>No real registered users found. Users must log in at least once.</div>
              ) : (
                <>
                  <div style={{ marginBottom: "14px" }}>
                    <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>User</label>
                    <select
                      value={selectedUser?.email ?? ""}
                      onChange={e => {
                        const u = users.find(x => x.email === e.target.value) ?? null;
                        setSelectedUser(u);
                        setSelectedAcc(u?.bankingState?.accounts?.[0] ?? null);
                      }}
                      style={INPUT}
                    >
                      {users.map(u => (
                        <option key={u.email} value={u.email}>
                          {u.firstName} {u.lastName} — {u.email}
                        </option>
                      ))}
                    </select>
                  </div>
                  {selectedUser && (
                    <div>
                      <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Target Wallet</label>
                      <select
                        value={selectedAcc?.id ?? ""}
                        onChange={e => {
                          const acc = selectedUser.bankingState?.accounts?.find(a => a.id === e.target.value) ?? null;
                          setSelectedAcc(acc);
                        }}
                        style={INPUT}
                      >
                        {(selectedUser.bankingState?.accounts ?? []).map(a => (
                          <option key={a.id} value={a.id}>
                            {a.name} ({a.currency}) — Current: {a.symbol}{a.currency === "BTC" ? a.balance.toFixed(4) : a.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Date range */}
            <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700, color: "#0A1628" }}>📅 Date Range</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)} style={INPUT} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>End Date</label>
                  <input type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)} style={INPUT} />
                </div>
              </div>
            </div>

            {/* Balance parameters */}
            <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: "#0A1628" }}>💰 Balance Parameters</h3>
              <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: "8px", padding: "10px 12px", marginBottom: "16px", fontSize: "12px", color: "#92400E" }}>
                <strong>Formula:</strong> Opening + Credits − Debits = Final Balance
              </div>
              {[
                { key: "openingBalance", label: "Opening Balance ($)" },
                { key: "finalBalance",   label: "Final Balance — total USD wealth to distribute ($)" },
                { key: "totalCredits",   label: "Total Credits ($)" },
                { key: "totalDebits",    label: "Total Debits ($)" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>{f.label}</label>
                  <input type="number" value={form[f.key as keyof typeof form] as string}
                    onChange={e => set(f.key, e.target.value)} style={INPUT} />
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

            {/* Transaction counts + weekends */}
            <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700, color: "#0A1628" }}>⚙️ Transaction Counts</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#059669", marginBottom: "6px" }}>
                    Number of Credit Transactions <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    type="number" min="1" value={form.creditCount}
                    onChange={e => set("creditCount", e.target.value)}
                    style={{ ...INPUT, border: "1.5px solid #6EE7B7" }}
                  />
                  <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px" }}>Exact count — no randomisation</div>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#DC2626", marginBottom: "6px" }}>
                    Number of Debit Transactions <span style={{ color: "#DC2626" }}>*</span>
                  </label>
                  <input
                    type="number" min="1" value={form.debitCount}
                    onChange={e => set("debitCount", e.target.value)}
                    style={{ ...INPUT, border: "1.5px solid #FECACA" }}
                  />
                  <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px" }}>Exact count — no randomisation</div>
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid #F3F4F6" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>Include Weekends</div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF" }}>Generate on Saturdays & Sundays too</div>
                </div>
                <div onClick={() => set("includeWeekends", !form.includeWeekends)}
                  style={{ width: "48px", height: "26px", borderRadius: "13px", background: form.includeWeekends ? "#1A73E8" : "#D1D5DB", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#fff", position: "absolute", top: "3px", left: form.includeWeekends ? "25px" : "3px", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </div>
              </div>
            </div>

            {/* Credit descriptions */}
            <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: "3px solid #10B981" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: "#059669" }}>
                🟢 Credit Transaction Descriptions <span style={{ color: "#DC2626" }}>*</span>
              </h3>
              <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#9CA3AF" }}>
                Enter one description per line. Credit descriptions are used <strong>only for credit transactions</strong>.
                Descriptions may be reused randomly within this type if fewer lines are provided than the transaction count.
              </p>
              <textarea
                value={form.creditDescs}
                onChange={e => set("creditDescs", e.target.value)}
                placeholder={"Salary Payment – March\nFreelance Invoice – Web Project\nClient Transfer – Michael Turner\nContract Settlement – Apex Corp\nTimber Supply Payment – Weyerhaeuser"}
                style={{ ...INPUT, minHeight: "130px", resize: "vertical", borderColor: "#6EE7B7" }}
              />
              <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                  {form.creditDescs.split("\n").filter(d => d.trim()).length} description(s) entered
                  {form.creditCount && ` · ${form.creditCount} transactions to generate`}
                </div>
                {form.creditDescs.split("\n").filter(d => d.trim()).length > 0 &&
                  parseInt(form.creditCount, 10) > form.creditDescs.split("\n").filter(d => d.trim()).length && (
                  <div style={{ fontSize: "11px", color: "#059669", background: "#ECFDF5", borderRadius: "6px", padding: "2px 8px" }}>
                    ♻️ Descriptions will be reused
                  </div>
                )}
              </div>
            </div>

            {/* Debit descriptions */}
            <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderLeft: "3px solid #F87171" }}>
              <h3 style={{ margin: "0 0 4px", fontSize: "15px", fontWeight: 700, color: "#DC2626" }}>
                🔴 Debit Transaction Descriptions <span style={{ color: "#DC2626" }}>*</span>
              </h3>
              <p style={{ margin: "0 0 10px", fontSize: "12px", color: "#9CA3AF" }}>
                Enter one description per line. Debit descriptions are used <strong>only for debit transactions</strong>.
                Descriptions may be reused randomly within this type if fewer lines are provided than the transaction count.
              </p>
              <textarea
                value={form.debitDescs}
                onChange={e => set("debitDescs", e.target.value)}
                placeholder={"Netflix\nSpotify Premium\nAmazon Purchase\nUtility Bill\nTruck Fleet Diesel Payment\nEquipment Maintenance"}
                style={{ ...INPUT, minHeight: "130px", resize: "vertical", borderColor: "#FECACA" }}
              />
              <div style={{ marginTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ fontSize: "11px", color: "#9CA3AF" }}>
                  {form.debitDescs.split("\n").filter(d => d.trim()).length} description(s) entered
                  {form.debitCount && ` · ${form.debitCount} transactions to generate`}
                </div>
                {form.debitDescs.split("\n").filter(d => d.trim()).length > 0 &&
                  parseInt(form.debitCount, 10) > form.debitDescs.split("\n").filter(d => d.trim()).length && (
                  <div style={{ fontSize: "11px", color: "#DC2626", background: "#FEF2F2", borderRadius: "6px", padding: "2px 8px" }}>
                    ♻️ Descriptions will be reused
                  </div>
                )}
              </div>
            </div>

            {/* Multi-wallet allocation note */}
            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: "12px", padding: "14px 16px" }}>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#059669", marginBottom: "6px" }}>📊 Wallet Allocation After Commit</div>
              <div style={{ fontSize: "12px", color: "#065F46", lineHeight: 1.6 }}>
                The Final Balance is distributed across all 4 wallets:<br />
                <strong>USD:</strong> 55–65% &nbsp;·&nbsp; <strong>GBP / EUR / BTC:</strong> split randomly from the rest.<br />
                BTC value is converted at $66,000 / BTC.
              </div>
            </div>

            <button onClick={validateAndGenerate} disabled={generating || !selectedUser}
              style={{ width: "100%", padding: "16px", background: generating || !selectedUser ? "#9CA3AF" : "#1A73E8", color: "#fff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 700, cursor: generating || !selectedUser ? "not-allowed" : "pointer" }}>
              {generating ? "⏳ Generating Preview…" : "🔧 Generate Preview"}
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) { .txgen-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </AdminLayout>
  );
}
