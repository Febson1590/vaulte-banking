"use client";
import { useState, useEffect, useMemo } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getState, VaulteState, DEFAULT_STATE, Transaction, fmtDate } from "@/lib/vaulteState";

const C = {
  bg: "#F3F5FA", card: "#ffffff", navy: "#0F172A", blue: "#1A73E8",
  border: "rgba(15,23,42,0.07)", muted: "#94A3B8", text: "#0F172A", sub: "#64748B",
  shadow: "0 1px 3px rgba(15,23,42,0.05), 0 6px 20px rgba(15,23,42,0.07)",
} as const;

const CATEGORIES = ["All", "Income", "Transfer", "Shopping", "Food", "Entertainment", "Transport", "Cash", "Crypto"];
const STATUSES    = ["All", "completed", "pending", "failed"];
const PAGE_SIZE   = 8;

export default function TransactionsPage() {
  const [state,   setState]   = useState<VaulteState>(DEFAULT_STATE);
  const [search,  setSearch]  = useState("");
  const [type,    setType]    = useState<"All" | "debit" | "credit">("All");
  const [cat,     setCat]     = useState("All");
  const [status,  setStatus]  = useState("All");
  const [account, setAccount] = useState("All");
  const [sort,    setSort]    = useState<"newest" | "oldest" | "highest" | "lowest">("newest");
  const [page,    setPage]    = useState(1);

  useEffect(() => { setState(getState()); }, []);

  const filtered: Transaction[] = useMemo(() => {
    let txns = [...state.transactions];
    if (search.trim()) {
      const q = search.toLowerCase();
      txns = txns.filter(t => t.name.toLowerCase().includes(q) || t.sub.toLowerCase().includes(q) || t.id.toLowerCase().includes(q));
    }
    if (type    !== "All") txns = txns.filter(t => t.type     === type);
    if (cat     !== "All") txns = txns.filter(t => t.category === cat);
    if (status  !== "All") txns = txns.filter(t => t.status   === status);
    if (account !== "All") txns = txns.filter(t => t.accountId === account);

    txns.sort((a, b) => {
      if (sort === "newest")  return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sort === "oldest")  return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sort === "highest") return b.amount - a.amount;
      if (sort === "lowest")  return a.amount - b.amount;
      return 0;
    });
    return txns;
  }, [state.transactions, search, type, cat, status, account, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalIn  = state.transactions.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
  const totalOut = state.transactions.filter(t => t.type === "debit").reduce((s, t) => s + t.amount, 0);
  const net      = totalIn - totalOut;

  const resetFilters = () => { setSearch(""); setType("All"); setCat("All"); setStatus("All"); setAccount("All"); setSort("newest"); setPage(1); };

  const SelectStyle: React.CSSProperties = {
    padding: "8px 12px", borderRadius: 10, border: `1.5px solid ${C.border}`,
    background: C.card, fontSize: 12.5, color: C.text, cursor: "pointer",
    outline: "none", fontFamily: "inherit",
  };

  const statCards = [
    { label: "Total Received", value: `+$${totalIn.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: "#059669", iconBg: "#F0FDF4", icon: "↓" },
    { label: "Total Spent",    value: `-$${totalOut.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: "#DC2626", iconBg: "#FEF2F2", icon: "↑" },
    { label: "Net Flow",       value: `${net >= 0 ? "+" : ""}$${Math.abs(net).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, color: net >= 0 ? "#059669" : "#DC2626", iconBg: net >= 0 ? "#F0FDF4" : "#FEF2F2", icon: "≈" },
    { label: "Transactions",   value: state.transactions.length.toString(), color: C.blue, iconBg: "#EEF4FF", icon: "≡" },
  ];

  return (
    <DashboardLayout title="Transactions" subtitle={`${filtered.length} result${filtered.length !== 1 ? "s" : ""}`}>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }} className="tx-stats-grid">
        {statCards.map(s => (
          <div key={s.label} style={{ background: C.card, borderRadius: 16, padding: "18px 20px", border: `1px solid ${C.border}`, boxShadow: C.shadow, display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: s.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: s.color, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <p style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 3 }}>{s.label}</p>
              <p style={{ fontSize: 18, fontWeight: 800, color: s.color, letterSpacing: "-0.5px" }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ background: C.card, borderRadius: 16, padding: "16px 20px", border: `1px solid ${C.border}`, boxShadow: C.shadow, marginBottom: 20 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 200px", minWidth: 160 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: C.muted, pointerEvents: "none" }}>⌕</span>
            <input
              value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, merchant, ID…"
              style={{ width: "100%", padding: "8px 14px 8px 34px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: 12.5, color: C.text, background: C.bg, outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.18s" }}
              onFocus={e => e.target.style.borderColor = C.blue}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </div>

          {/* Type */}
          <select value={type} onChange={e => { setType(e.target.value as typeof type); setPage(1); }} style={SelectStyle}>
            <option value="All">All Types</option>
            <option value="credit">Money In</option>
            <option value="debit">Money Out</option>
          </select>

          {/* Category */}
          <select value={cat} onChange={e => { setCat(e.target.value); setPage(1); }} style={SelectStyle}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c === "All" ? "All Categories" : c}</option>)}
          </select>

          {/* Status */}
          <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} style={SelectStyle}>
            {STATUSES.map(s => <option key={s} value={s}>{s === "All" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>

          {/* Account */}
          <select value={account} onChange={e => { setAccount(e.target.value); setPage(1); }} style={SelectStyle}>
            <option value="All">All Accounts</option>
            {state.accounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>

          {/* Sort */}
          <select value={sort} onChange={e => { setSort(e.target.value as typeof sort); setPage(1); }} style={SelectStyle}>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Amount</option>
            <option value="lowest">Lowest Amount</option>
          </select>

          {/* Reset */}
          {(search || type !== "All" || cat !== "All" || status !== "All" || account !== "All") && (
            <button onClick={resetFilters} style={{ padding: "8px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: "transparent", fontSize: 12.5, color: C.sub, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg; (e.currentTarget as HTMLElement).style.color = C.text; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = C.sub; }}
            >✕ Clear</button>
          )}
        </div>
      </div>

      {/* Transactions list */}
      <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: C.shadow, overflow: "hidden" }}>

        {/* Table header */}
        <div className="tx-table-header" style={{ padding: "14px 20px", borderBottom: `1px solid ${C.border}`, display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 100px", gap: 12, background: "#FAFBFD" }}>
          {["Transaction", "Date", "Account", "Status", "Amount"].map(h => (
            <p key={h} style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.07em" }}>{h}</p>
          ))}
        </div>

        {paginated.length === 0 ? (
          <div style={{ padding: "60px 20px", textAlign: "center" }}>
            <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
            <p style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 6 }}>No transactions found</p>
            <p style={{ fontSize: 13, color: C.muted }}>Try adjusting your filters or search query.</p>
            <button onClick={resetFilters} style={{ marginTop: 16, padding: "9px 20px", borderRadius: 10, background: C.blue, color: "#fff", border: "none", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Clear Filters</button>
          </div>
        ) : (
          paginated.map((tx, i) => {
            const acc = state.accounts.find(a => a.id === tx.accountId);
            const isLast = i === paginated.length - 1;
            return (
              <div key={tx.id} className="tx-table-row" style={{ padding: "14px 20px", display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 100px", gap: 12, alignItems: "center", borderBottom: isLast ? "none" : `1px solid ${C.border}`, transition: "background 0.12s" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FAFBFD"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                {/* Name + icon */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: tx.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: tx.iconColor, flexShrink: 0 }}>{tx.icon}</div>
                  <div style={{ minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.name}</p>
                    <p style={{ fontSize: 11.5, color: C.muted, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{tx.sub}</p>
                    {/* Mobile-only date line — hidden on desktop where the Date column already shows it */}
                    {tx.date && <p className="tx-date-mobile" style={{ fontSize: 11, color: C.sub, marginTop: 2, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fmtDate(tx.date)}</p>}
                  </div>
                </div>

                {/* Date */}
                <p style={{ fontSize: 12.5, color: C.sub }}>{fmtDate(tx.date)}</p>

                {/* Account */}
                <p style={{ fontSize: 12, color: C.sub, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{acc?.name ?? "—"}</p>

                {/* Status badge */}
                <div>
                  <span style={{
                    fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 7,
                    background: tx.status === "completed" ? "#F0FDF4" : tx.status === "pending" ? "#FFFBEB" : "#FEF2F2",
                    color: tx.status === "completed" ? "#16A34A" : tx.status === "pending" ? "#D97706" : "#DC2626",
                    border: `1px solid ${tx.status === "completed" ? "#BBF7D0" : tx.status === "pending" ? "#FDE68A" : "#FECACA"}`,
                  }}>
                    {tx.status === "completed" ? "✓ Done" : tx.status === "pending" ? "⏳ Pending" : "✗ Failed"}
                  </span>
                </div>

                {/* Amount */}
                <p style={{ fontSize: 14, fontWeight: 700, color: tx.type === "credit" ? "#059669" : C.text, textAlign: "right" }}>
                  {tx.type === "credit" ? "+" : "−"}${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </div>
            );
          })
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ padding: "14px 20px", borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center", background: "#FAFBFD" }}>
            <p style={{ fontSize: 12.5, color: C.muted }}>
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div style={{ display: "flex", gap: 6 }}>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${C.border}`, background: "transparent", fontSize: 12.5, color: page === 1 ? C.muted : C.text, cursor: page === 1 ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                ← Prev
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  style={{ padding: "6px 12px", borderRadius: 8, border: `1.5px solid ${p === page ? C.blue : C.border}`, background: p === page ? C.blue : "transparent", fontSize: 12.5, fontWeight: p === page ? 700 : 400, color: p === page ? "#fff" : C.text, cursor: "pointer", fontFamily: "inherit" }}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ padding: "6px 14px", borderRadius: 8, border: `1.5px solid ${C.border}`, background: "transparent", fontSize: 12.5, color: page === totalPages ? C.muted : C.text, cursor: page === totalPages ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                Next →
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* Desktop: date is shown in its own column — hide the inline copy */
        .tx-date-mobile { display: none; }

        @media (max-width: 768px) {
          .tx-stats-grid { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 480px) {
          .tx-stats-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 640px) {
          .tx-table-header { display: none !important; }
          .tx-table-row { grid-template-columns: 1fr auto !important; padding: 12px 16px !important; }
          /* Hide the standalone Date / Account / Status columns on mobile */
          .tx-table-row > *:nth-child(2),
          .tx-table-row > *:nth-child(3),
          .tx-table-row > *:nth-child(4) { display: none !important; }
          /* Show the inline date line that lives inside the name column */
          .tx-date-mobile { display: block !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}
