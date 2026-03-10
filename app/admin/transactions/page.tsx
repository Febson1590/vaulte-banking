"use client";
import { useState, useEffect, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getUsers, getUserState, saveUserState, DEMO_USER, DEMO_USER_ID } from "@/lib/vaulteState";
import type { Transaction } from "@/lib/vaulteState";

// ─── Enriched transaction type ────────────────────────────
interface AdminTx extends Transaction {
  userName: string;
  userEmail: string;
  userId: string;
}

const typeBadge: Record<string, { bg: string; color: string }> = {
  credit:     { bg: "#ECFDF5", color: "#059669" },
  debit:      { bg: "#FFF7ED", color: "#EA580C" },
  Transfer:   { bg: "#EEF4FF", color: "#1A73E8" },
  Deposit:    { bg: "#ECFDF5", color: "#059669" },
  Withdrawal: { bg: "#FFF7ED", color: "#EA580C" },
  Adjustment: { bg: "#F5F3FF", color: "#7C3AED" },
};

const statusBadge: Record<string, { bg: string; color: string }> = {
  completed:  { bg: "#ECFDF5", color: "#059669" },
  pending:    { bg: "#FFFBEB", color: "#D97706" },
  failed:     { bg: "#F3F4F6", color: "#6B7280" },
  Flagged:    { bg: "#FEF2F2", color: "#DC2626" },
  Reversed:   { bg: "#F5F3FF", color: "#7C3AED" },
};

function Badge({ label, map }: { label: string; map: Record<string, { bg: string; color: string }> }) {
  const s = map[label] || { bg: "#F3F4F6", color: "#6B7280" };
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: 600, textTransform: "capitalize" }}>
      {label}
    </span>
  );
}

export default function AdminTransactions() {
  const [allTx, setAllTx]         = useState<AdminTx[]>([]);
  const [search, setSearch]       = useState("");
  const [typeFilter, setType]     = useState("All");
  const [statusFilter, setStatus] = useState("All");
  const [selected, setSelected]   = useState<AdminTx | null>(null);
  const [loaded, setLoaded]       = useState(false);

  // ─── Load all user transactions ─────────────────────────
  useEffect(() => {
    const users = getUsers();
    // Include demo user's transactions
    const allUsers = [DEMO_USER, ...users];
    const txs: AdminTx[] = [];

    allUsers.forEach(u => {
      const state = getUserState(u.id);
      state.transactions.forEach(tx => {
        txs.push({
          ...tx,
          userName:  `${u.firstName} ${u.lastName}`,
          userEmail: u.email,
          userId:    u.id,
        });
      });
    });

    // Sort by date descending
    txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setAllTx(txs);
    setLoaded(true);
  }, []);

  const filtered = useMemo(() => allTx.filter(tx => {
    const matchType   = typeFilter   === "All" || tx.type === typeFilter || tx.category === typeFilter;
    const matchStatus = statusFilter === "All" || tx.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || tx.userName.toLowerCase().includes(q) || tx.id.toLowerCase().includes(q) || tx.name.toLowerCase().includes(q);
    return matchType && matchStatus && matchSearch;
  }), [allTx, typeFilter, statusFilter, search]);

  // ─── Flag/approve a transaction ────────────────────────
  const updateTxStatus = (tx: AdminTx, newStatus: string) => {
    const state = getUserState(tx.userId);
    const updated = state.transactions.map(t => t.id === tx.id ? { ...t, status: newStatus as Transaction["status"] } : t);
    saveUserState(tx.userId, { ...state, transactions: updated });
    setAllTx(prev => prev.map(t => t.id === tx.id && t.userId === tx.userId ? { ...t, status: newStatus as Transaction["status"] } : t));
    setSelected(null);
  };

  return (
    <AdminLayout title="Transactions">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0A1628" }}>Transaction Monitor</h1>
          <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>
            {loaded ? `${allTx.length} total transaction${allTx.length !== 1 ? "s" : ""} across all users` : "Loading..."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {[
            { label: `Completed (${allTx.filter(t => t.status === "completed").length})`,color: "#059669", bg: "#ECFDF5" },
            { label: `Pending (${allTx.filter(t => t.status === "pending").length})`,    color: "#D97706", bg: "#FFFBEB" },
            { label: `Failed (${allTx.filter(t => t.status === "failed").length})`,      color: "#6B7280", bg: "#F3F4F6" },
          ].map(b => (
            <div key={b.label} style={{ background: b.bg, color: b.color, borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: 700 }}>{b.label}</div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: "14px", padding: "16px 20px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user, ID, or name..."
            style={{ width: "100%", padding: "10px 14px 10px 36px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={typeFilter} onChange={e => setType(e.target.value)}
          style={{ padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", background: "#fff", color: "#374151", outline: "none" }}>
          {["All", "credit", "debit"].map(t => <option key={t} value={t}>{t === "All" ? "All Types" : t === "credit" ? "Credits" : "Debits"}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatus(e.target.value)}
          style={{ padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", background: "#fff", color: "#374151", outline: "none" }}>
          {["All", "completed", "pending", "failed"].map(s => <option key={s} value={s}>{s === "All" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {!loaded ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#9CA3AF" }}>Loading transactions...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <p style={{ fontSize: "36px", marginBottom: "12px" }}>💸</p>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>
              {allTx.length === 0 ? "No transactions yet" : "No transactions match your filters"}
            </p>
            <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
              {allTx.length === 0 ? "Transactions will appear here once users start making transfers and deposits." : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#F8FAFC" }}>
              <tr>
                {["User", "Transaction", "Type", "Amount", "Status", "Date", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((tx, i) => (
                <tr key={`${tx.id}-${tx.userId}`} style={{ borderTop: "1px solid #F3F4F6", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#0A1628" }}>{tx.userName}</div>
                    <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{tx.userEmail}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#0A1628" }}>{tx.name}</div>
                    <div style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace" }}>{tx.id}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}><Badge label={tx.type} map={typeBadge} /></td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 700, color: tx.type === "credit" ? "#059669" : "#DC2626" }}>
                    {tx.type === "credit" ? "+" : "-"}{tx.currency === "BTC" ? `₿${tx.amount}` : `$${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                  </td>
                  <td style={{ padding: "12px 16px" }}><Badge label={tx.status} map={statusBadge} /></td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "#9CA3AF" }}>{new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                  <td style={{ padding: "12px 16px" }}>
                    <button onClick={() => setSelected(tx)}
                      style={{ background: "#EEF4FF", color: "#1A73E8", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {filtered.length > 50 && (
          <div style={{ padding: "14px", textAlign: "center", color: "#9CA3AF", fontSize: "13px", borderTop: "1px solid #F3F4F6" }}>
            Showing first 50 of {filtered.length} transactions. Use filters to narrow results.
          </div>
        )}
      </div>

      {/* Review modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0A1628" }}>Transaction Detail</h2>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9CA3AF" }}>✕</button>
            </div>
            <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
              {[
                { label: "User",        value: `${selected.userName} (${selected.userEmail})` },
                { label: "Name",        value: selected.name },
                { label: "Description", value: selected.sub },
                { label: "Amount",      value: `${selected.currency} ${selected.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
                { label: "Type",        value: selected.type },
                { label: "Status",      value: selected.status },
                { label: "Category",    value: selected.category },
                { label: "Date",        value: new Date(selected.date).toLocaleString() },
                { label: "Tx ID",       value: selected.id },
              ].map(f => (
                <div key={f.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #E5E7EB", gap: "12px" }}>
                  <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600, flexShrink: 0 }}>{f.label}</span>
                  <span style={{ fontSize: "12.5px", color: "#0A1628", fontWeight: 500, textAlign: "right", wordBreak: "break-all" }}>{f.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              <button onClick={() => updateTxStatus(selected, "completed")}
                style={{ flex: 1, padding: "10px", background: "#059669", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                ✅ Mark Completed
              </button>
              <button onClick={() => updateTxStatus(selected, "pending")}
                style={{ flex: 1, padding: "10px", background: "#D97706", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                ⏳ Mark Pending
              </button>
              <button onClick={() => updateTxStatus(selected, "failed")}
                style={{ flex: 1, padding: "10px", background: "#DC2626", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                ❌ Mark Failed
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
