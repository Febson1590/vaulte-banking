"use client";
import { useState, useEffect, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";
import { fmtAmount } from "@/lib/vaulteState";
import type { Account, VaulteState } from "@/lib/vaulteState";

// ─── Enriched account row ─────────────────────────────────────
// Every row is linked to a REAL Redis user — no orphan / stale
// localStorage entries will appear here.
interface AdminAccount extends Account {
  ownerName:  string;
  ownerEmail: string;
  userId:     string;
}

const RATES: Record<string, number> = { USD: 1, EUR: 1.09, GBP: 1.27, BTC: 66000 };

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Active: { bg: "#ECFDF5", color: "#059669" },
    Frozen: { bg: "#EFF6FF", color: "#2563EB" },
    Closed: { bg: "#F3F4F6", color: "#6B7280" },
  };
  const s = map[status] ?? { bg: "#F3F4F6", color: "#6B7280" };
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: 600 }}>
      {status}
    </span>
  );
}

export default function AdminAccounts() {
  const [accounts,      setAccounts]      = useState<AdminAccount[]>([]);
  const [selected,      setSelected]      = useState<AdminAccount | null>(null);
  const [search,        setSearch]        = useState("");
  const [loaded,        setLoaded]        = useState(false);
  const [loadErr,       setLoadErr]       = useState<string | null>(null);
  const [adjustAmt,     setAdjustAmt]     = useState("");
  const [adjType,       setAdjType]       = useState<"credit" | "debit">("credit");
  const [adjDesc,       setAdjDesc]       = useState("");
  const [adjNote,       setAdjNote]       = useState("");
  const [adjDate,       setAdjDate]       = useState("");
  const [adjDone,       setAdjDone]       = useState(false);
  const [adjLoading,    setAdjLoading]    = useState(false);
  const [freezeLoading, setFreezeLoading] = useState(false);
  const [opError,       setOpError]       = useState<string | null>(null);

  // ── Load accounts from Redis via /api/admin/users ──────────
  // Only real registered users appear here — orphan localStorage
  // entries (e.g. samsonfebaide1@gmail.com) are never included
  // because they have no auth:user:* record in Redis.
  const loadAccounts = useCallback(async () => {
    setLoaded(false);
    setLoadErr(null);
    try {
      const res  = await fetch("/api/admin/users");
      const data = await res.json() as {
        success: boolean;
        users: Array<{
          id: string; firstName: string; lastName: string;
          email: string; bankingState: VaulteState | null;
        }>;
      };
      if (!data.success) throw new Error("Failed to load users from Redis");

      const rows: AdminAccount[] = [];
      for (const user of data.users) {
        // Skip demo account (local simulation, no real Redis state)
        if (user.email === "demo@vaulte.com") continue;
        // Skip users who haven't logged in yet (no banking state)
        if (!user.bankingState?.accounts) continue;
        for (const acc of user.bankingState.accounts) {
          rows.push({
            ...acc,
            ownerName:  `${user.firstName} ${user.lastName}`,
            ownerEmail: user.email,
            userId:     user.id,
          });
        }
      }
      setAccounts(rows);
    } catch (err) {
      setLoadErr(err instanceof Error ? err.message : "Unknown error loading accounts");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { loadAccounts(); }, [loadAccounts]);

  const filtered = accounts.filter(a => {
    const q = search.toLowerCase();
    return !q
      || a.ownerName.toLowerCase().includes(q)
      || a.ownerEmail.toLowerCase().includes(q)
      || a.accountNumber.toLowerCase().includes(q);
  });

  const totalUSD = accounts.reduce((s, a) => s + a.balance * (RATES[a.currency] ?? 1), 0);

  // ── Freeze / Unfreeze → writes directly to Redis ──────────
  const toggleFreeze = async (acc: AdminAccount) => {
    setFreezeLoading(true);
    setOpError(null);
    try {
      const res  = await fetch("/api/admin/account", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          email:     acc.ownerEmail,
          accountId: acc.id,
          action:    acc.frozen ? "unfreeze" : "freeze",
        }),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (!data.success) throw new Error(data.error ?? "Failed to update account");
      await loadAccounts();
      setSelected(null);
    } catch (err) {
      setOpError(err instanceof Error ? err.message : "Error updating account");
    } finally {
      setFreezeLoading(false);
    }
  };

  // ── Balance adjustment → writes directly to Redis ─────────
  // Passes currency so the API can find the right account (USD,
  // EUR, GBP, or BTC) instead of always defaulting to USD.
  const handleAdjust = async () => {
    if (!selected || !adjustAmt) return;
    const amt = parseFloat(adjustAmt);
    if (isNaN(amt) || amt <= 0) return;
    setAdjLoading(true);
    setOpError(null);
    try {
      const body: Record<string, unknown> = {
        email:    selected.ownerEmail,
        amount:   amt,
        type:     adjType,
        currency: selected.currency,
      };
      if (adjDesc.trim())        body.description  = adjDesc.trim();
      if (adjNote.trim())        body.internalNote = adjNote.trim();
      if (adjDate.trim())        body.txDate       = adjDate.trim();
      const res  = await fetch("/api/admin/balance", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (!data.success) throw new Error(data.error ?? "Failed to adjust balance");
      setAdjDone(true);
      setTimeout(async () => {
        setAdjDone(false);
        setAdjustAmt("");
        setAdjDesc("");
        setAdjNote("");
        setAdjDate("");
        setSelected(null);
        await loadAccounts();
      }, 1600);
    } catch (err) {
      setOpError(err instanceof Error ? err.message : "Error adjusting balance");
    } finally {
      setAdjLoading(false);
    }
  };

  return (
    <AdminLayout title="Account Management">

      {/* ── Header ─────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0A1628" }}>Account Management</h1>
          <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>
            {loaded
              ? `${accounts.length} account${accounts.length !== 1 ? "s" : ""} · Total AUM: $${totalUSD.toLocaleString("en-US", { maximumFractionDigits: 2 })} · Source: Redis ✓`
              : "Loading from Redis…"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button onClick={loadAccounts} disabled={!loaded}
            style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: "13px", fontWeight: 600, cursor: loaded ? "pointer" : "not-allowed" }}>
            ↻ Refresh
          </button>
          {[
            { label: `Active (${accounts.filter(a => !a.frozen).length})`, color: "#059669", bg: "#ECFDF5" },
            { label: `Frozen (${accounts.filter(a =>  a.frozen).length})`, color: "#2563EB", bg: "#EFF6FF" },
          ].map(b => (
            <div key={b.label} style={{ background: b.bg, color: b.color, borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: 700 }}>
              {b.label}
            </div>
          ))}
        </div>
      </div>

      {/* ── Load-error banner ──────────────────────────────── */}
      {loadErr && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", color: "#DC2626", fontSize: "13px" }}>
          ⚠ {loadErr}
        </div>
      )}

      {/* ── Search ────────────────────────────────────────── */}
      <div style={{ background: "#fff", borderRadius: "14px", padding: "14px 20px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by owner name, email, or account number…"
            style={{ width: "100%", padding: "10px 14px 10px 36px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────── */}
      <div className="admin-table-scroll" style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {!loaded ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#9CA3AF" }}>
            Loading accounts from Redis…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <p style={{ fontSize: "36px", marginBottom: "12px" }}>🏦</p>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>
              {accounts.length === 0 ? "No accounts yet" : "No accounts match your search"}
            </p>
            <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
              {accounts.length === 0
                ? "Accounts appear here after users register and log in for the first time."
                : "Try a different name, email, or account number."}
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#F8FAFC" }}>
              <tr>
                {["Account", "Owner", "Currency", "Balance", "Account Number", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((acc, i) => (
                <tr key={`${acc.userId}-${acc.id}`}
                  style={{ borderTop: "1px solid #F3F4F6", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: acc.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>
                        {acc.flag}
                      </div>
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#0A1628" }}>{acc.name}</div>
                        <div style={{ fontSize: "11px", color: "#9CA3AF", textTransform: "capitalize" }}>{acc.type}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#0A1628" }}>{acc.ownerName}</div>
                    <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{acc.ownerEmail}</div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "13px", color: "#374151", fontWeight: 600 }}>{acc.currency}</td>
                  <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 700, color: "#0A1628" }}>
                    {fmtAmount(acc.balance, acc.currency, acc.symbol)}
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "12px", color: "#9CA3AF", fontFamily: "monospace" }}>
                    {acc.accountNumber}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <StatusBadge status={acc.frozen ? "Frozen" : "Active"} />
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <button onClick={() => { setSelected(acc); setAdjustAmt(""); setAdjDesc(""); setAdjNote(""); setAdjDate(""); setAdjDone(false); setOpError(null); }}
                      style={{ background: "#EEF4FF", color: "#1A73E8", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Manage modal ──────────────────────────────────── */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>

            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0A1628" }}>{selected.name}</h2>
                <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "2px" }}>
                  {selected.ownerName} · {selected.ownerEmail} · {selected.currency}
                </p>
              </div>
              <button onClick={() => setSelected(null)}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9CA3AF" }}>
                ✕
              </button>
            </div>

            {/* Current balance */}
            <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
              <p style={{ fontSize: "11.5px", color: "#9CA3AF", marginBottom: "4px" }}>Current Balance</p>
              <p style={{ fontSize: "26px", fontWeight: 800, color: "#0A1628" }}>
                {fmtAmount(selected.balance, selected.currency, selected.symbol)}
              </p>
              <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px", fontFamily: "monospace" }}>
                {selected.accountNumber} · userId: {selected.userId.slice(0, 24)}…
              </p>
            </div>

            {/* Operation error */}
            {opError && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", color: "#DC2626", fontSize: "12.5px" }}>
                ⚠ {opError}
              </div>
            )}

            {/* Balance adjustment */}
            {!adjDone ? (
              <>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "12px" }}>
                  Manual Balance Adjustment ({selected.currency})
                </p>
                {/* Credit / Debit toggle */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
                  {(["credit", "debit"] as const).map(t => (
                    <button key={t} onClick={() => setAdjType(t)}
                      style={{ flex: 1, padding: "10px", border: `2px solid ${adjType === t ? (t === "credit" ? "#059669" : "#DC2626") : "#E5E7EB"}`, borderRadius: "10px", background: adjType === t ? (t === "credit" ? "#ECFDF5" : "#FEF2F2") : "#fff", color: adjType === t ? (t === "credit" ? "#059669" : "#DC2626") : "#6B7280", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      {t === "credit" ? "+ Credit" : "– Debit"}
                    </button>
                  ))}
                </div>
                {/* Amount */}
                <input type="number" value={adjustAmt} onChange={e => setAdjustAmt(e.target.value)}
                  placeholder={`Amount (${selected.currency})`}
                  style={{ width: "100%", padding: "11px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "14px", outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: "10px" }} />
                {/* Visible description — what the USER sees on their statement */}
                <input type="text" value={adjDesc} onChange={e => setAdjDesc(e.target.value)}
                  placeholder={adjType === "credit"
                    ? "e.g. Timber Supply Payment – Weyerhaeuser"
                    : "e.g. Netflix  /  AT&T Wireless  /  Equipment Maintenance"}
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: "8px" }} />
                <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 10px" }}>
                  ↑ Visible description shown on user's statement (leave blank for auto-label)
                </p>
                {/* Transaction date */}
                <input type="datetime-local" value={adjDate} onChange={e => setAdjDate(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: "10px" }} />
                <p style={{ fontSize: "11px", color: "#9CA3AF", margin: "0 0 10px" }}>
                  ↑ Transaction date (optional — defaults to now)
                </p>
                {/* Internal note — admin only, never shown to user */}
                <input type="text" value={adjNote} onChange={e => setAdjNote(e.target.value)}
                  placeholder="Internal note (admin only — never shown to user)"
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #FDE68A", borderRadius: "10px", fontSize: "12px", outline: "none", fontFamily: "inherit", boxSizing: "border-box", background: "#FFFBEB", marginBottom: "16px" }} />
                <button onClick={handleAdjust} disabled={adjLoading}
                  style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", background: adjLoading ? "#9CA3AF" : "#1A73E8", color: "#fff", fontSize: "14px", fontWeight: 700, cursor: adjLoading ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                  {adjLoading ? "Saving to Redis…" : "Apply & Save"}
                </button>
              </>
            ) : (
              <div style={{ background: "#ECFDF5", borderRadius: "12px", padding: "16px", marginBottom: "20px", textAlign: "center", color: "#059669", fontWeight: 700 }}>
                ✓ Saved to Redis — user dashboard reflects update on next refresh
              </div>
            )}

            {/* Freeze / unfreeze */}
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => toggleFreeze(selected)} disabled={freezeLoading}
                style={{ flex: 1, padding: "10px", background: selected.frozen ? "#ECFDF5" : "#EFF6FF", color: selected.frozen ? "#059669" : "#2563EB", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: freezeLoading ? "not-allowed" : "pointer", opacity: freezeLoading ? 0.7 : 1 }}>
                {freezeLoading ? "Updating…" : selected.frozen ? "✅ Unfreeze Account" : "❄️ Freeze Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
