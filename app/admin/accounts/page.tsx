"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getUsers, getUserState, saveUserState, DEMO_USER, fmtAmount } from "@/lib/vaulteState";
import type { Account, VaulteState } from "@/lib/vaulteState";

// ─── Enriched account row ─────────────────────────────────
interface AdminAccount extends Account {
  ownerName:  string;
  ownerEmail: string;
  userId:     string;
  state:      VaulteState;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Active:  { bg: "#ECFDF5", color: "#059669" },
    Frozen:  { bg: "#EFF6FF", color: "#2563EB" },
    Closed:  { bg: "#F3F4F6", color: "#6B7280" },
  };
  const s = map[status] || { bg: "#F3F4F6", color: "#6B7280" };
  return <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: 600 }}>{status}</span>;
}

export default function AdminAccounts() {
  const [accounts,  setAccounts]  = useState<AdminAccount[]>([]);
  const [selected,  setSelected]  = useState<AdminAccount | null>(null);
  const [search,    setSearch]    = useState("");
  const [loaded,    setLoaded]    = useState(false);
  const [adjustAmt, setAdjustAmt] = useState("");
  const [adjType,   setAdjType]   = useState<"credit" | "debit">("credit");
  const [adjDone,   setAdjDone]   = useState(false);

  const loadAccounts = () => {
    const users = [DEMO_USER, ...getUsers()];
    const rows: AdminAccount[] = [];
    users.forEach(u => {
      const state = getUserState(u.id);
      state.accounts.forEach(acc => {
        rows.push({ ...acc, ownerName: `${u.firstName} ${u.lastName}`, ownerEmail: u.email, userId: u.id, state });
      });
    });
    setAccounts(rows);
    setLoaded(true);
  };

  useEffect(() => { loadAccounts(); }, []);

  const filtered = accounts.filter(a => {
    const q = search.toLowerCase();
    return !q || a.ownerName.toLowerCase().includes(q) || a.ownerEmail.toLowerCase().includes(q) || a.accountNumber.includes(q);
  });

  const toggleFreeze = (acc: AdminAccount) => {
    const state  = getUserState(acc.userId);
    const accs   = state.accounts.map(a => a.id === acc.id ? { ...a, frozen: !a.frozen } : a);
    saveUserState(acc.userId, { ...state, accounts: accs });
    loadAccounts();
    setSelected(null);
  };

  const handleAdjust = () => {
    if (!selected || !adjustAmt) return;
    const amt  = parseFloat(adjustAmt);
    if (isNaN(amt) || amt <= 0) return;
    const state = getUserState(selected.userId);
    const accs  = state.accounts.map(a => {
      if (a.id !== selected.id) return a;
      const newBal = adjType === "credit" ? a.balance + amt : Math.max(0, a.balance - amt);
      return { ...a, balance: newBal };
    });
    saveUserState(selected.userId, { ...state, accounts: accs });
    setAdjDone(true);
    setTimeout(() => { setAdjDone(false); setSelected(null); setAdjustAmt(""); loadAccounts(); }, 1500);
  };

  const totalUSD = accounts.reduce((s, a) => {
    const rates: Record<string, number> = { USD: 1, EUR: 1.09, GBP: 1.27, BTC: 66000 };
    return s + a.balance * (rates[a.currency] ?? 1);
  }, 0);

  return (
    <AdminLayout title="Account Management">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0A1628" }}>Account Management</h1>
          <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>
            {loaded ? `${accounts.length} account${accounts.length !== 1 ? "s" : ""} · Total AUM: $${totalUSD.toLocaleString("en-US", { maximumFractionDigits: 2 })}` : "Loading..."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {[
            { label: `Active (${accounts.filter(a => !a.frozen).length})`,  color: "#059669", bg: "#ECFDF5" },
            { label: `Frozen (${accounts.filter(a => a.frozen).length})`,   color: "#2563EB", bg: "#EFF6FF" },
          ].map(b => (
            <div key={b.label} style={{ background: b.bg, color: b.color, borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: 700 }}>{b.label}</div>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ background: "#fff", borderRadius: "14px", padding: "14px 20px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
        <div style={{ position: "relative" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by owner or account number..."
            style={{ width: "100%", padding: "10px 14px 10px 36px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {!loaded ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#9CA3AF" }}>Loading accounts...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <p style={{ fontSize: "36px", marginBottom: "12px" }}>🏦</p>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>
              {accounts.length === 0 ? "No accounts yet" : "No accounts match your search"}
            </p>
            <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
              {accounts.length === 0 ? "Accounts will appear here once users register." : "Try a different search term."}
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#F8FAFC" }}>
              <tr>
                {["Account", "Owner", "Currency", "Balance", "Account Number", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((acc, i) => (
                <tr key={`${acc.userId}-${acc.id}`} style={{ borderTop: "1px solid #F3F4F6", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div style={{ width: "34px", height: "34px", borderRadius: "8px", background: acc.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "16px", flexShrink: 0 }}>{acc.flag}</div>
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
                  <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 700, color: "#0A1628" }}>{fmtAmount(acc.balance, acc.currency, acc.symbol)}</td>
                  <td style={{ padding: "14px 16px", fontSize: "12px", color: "#9CA3AF", fontFamily: "monospace" }}>{acc.accountNumber}</td>
                  <td style={{ padding: "14px 16px" }}><StatusBadge status={acc.frozen ? "Frozen" : "Active"} /></td>
                  <td style={{ padding: "14px 16px" }}>
                    <button onClick={() => { setSelected(acc); setAdjustAmt(""); setAdjDone(false); }}
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

      {/* Manage modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0A1628" }}>{selected.name}</h2>
                <p style={{ fontSize: "13px", color: "#6B7280", marginTop: "2px" }}>{selected.ownerName} · {selected.currency}</p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9CA3AF" }}>✕</button>
            </div>

            {/* Current balance */}
            <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
              <p style={{ fontSize: "11.5px", color: "#9CA3AF", marginBottom: "4px" }}>Current Balance</p>
              <p style={{ fontSize: "26px", fontWeight: 800, color: "#0A1628" }}>{fmtAmount(selected.balance, selected.currency, selected.symbol)}</p>
              <p style={{ fontSize: "12px", color: "#9CA3AF", marginTop: "4px" }}>Account · {selected.accountNumber}</p>
            </div>

            {/* Balance adjustment */}
            {!adjDone ? (
              <>
                <p style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "12px" }}>Manual Balance Adjustment</p>
                <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
                  {(["credit", "debit"] as const).map(t => (
                    <button key={t} onClick={() => setAdjType(t)}
                      style={{ flex: 1, padding: "10px", border: `2px solid ${adjType === t ? (t === "credit" ? "#059669" : "#DC2626") : "#E5E7EB"}`, borderRadius: "10px", background: adjType === t ? (t === "credit" ? "#ECFDF5" : "#FEF2F2") : "#fff", color: adjType === t ? (t === "credit" ? "#059669" : "#DC2626") : "#6B7280", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      {t === "credit" ? "+ Credit" : "– Debit"}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
                  <input type="number" value={adjustAmt} onChange={e => setAdjustAmt(e.target.value)} placeholder={`Amount (${selected.currency})`}
                    style={{ flex: 1, padding: "11px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "14px", outline: "none", fontFamily: "inherit" }} />
                  <button onClick={handleAdjust}
                    style={{ padding: "11px 20px", borderRadius: "10px", border: "none", background: "#1A73E8", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    Apply
                  </button>
                </div>
              </>
            ) : (
              <div style={{ background: "#ECFDF5", borderRadius: "12px", padding: "16px", marginBottom: "20px", textAlign: "center", color: "#059669", fontWeight: 700 }}>
                ✓ Balance updated successfully
              </div>
            )}

            {/* Freeze / unfreeze */}
            <div style={{ display: "flex", gap: "8px" }}>
              <button onClick={() => toggleFreeze(selected)}
                style={{ flex: 1, padding: "10px", background: selected.frozen ? "#ECFDF5" : "#EFF6FF", color: selected.frozen ? "#059669" : "#2563EB", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                {selected.frozen ? "✅ Unfreeze Account" : "❄️ Freeze Account"}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
