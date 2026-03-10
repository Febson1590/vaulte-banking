"use client";
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";

const allTransactions = [
  { id: "TX1045", user: "Samson Febaide", type: "Transfer", amount: "$500.00", currency: "USD", status: "Completed", date: "Mar 10, 2025 · 14:32", ref: "VLT-2025-001045", desc: "Internal Transfer to Maria K." },
  { id: "TX1046", user: "Maria Kowalski", type: "Deposit", amount: "$1,000.00", currency: "USD", status: "Completed", date: "Mar 10, 2025 · 14:08", ref: "VLT-2025-001046", desc: "Bank Deposit — Chase" },
  { id: "TX1047", user: "John Doe", type: "Withdrawal", amount: "$2,000.00", currency: "USD", status: "Pending", date: "Mar 10, 2025 · 13:55", ref: "VLT-2025-001047", desc: "Withdrawal Request" },
  { id: "TX1048", user: "Aisha Bello", type: "Transfer", amount: "$340.00", currency: "USD", status: "Flagged", date: "Mar 10, 2025 · 13:38", ref: "VLT-2025-001048", desc: "External Transfer — Unknown Recipient" },
  { id: "TX1049", user: "Carlos Mendez", type: "Deposit", amount: "$5,000.00", currency: "USD", status: "Completed", date: "Mar 10, 2025 · 13:25", ref: "VLT-2025-001049", desc: "Salary Payment" },
  { id: "TX1050", user: "Priya Sharma", type: "Transfer", amount: "€800.00", currency: "EUR", status: "Completed", date: "Mar 10, 2025 · 12:44", ref: "VLT-2025-001050", desc: "International Transfer — UK" },
  { id: "TX1051", user: "Li Wei", type: "Withdrawal", amount: "$1,200.00", currency: "USD", status: "Failed", date: "Mar 10, 2025 · 12:10", ref: "VLT-2025-001051", desc: "ATM Withdrawal — insufficient balance" },
  { id: "TX1052", user: "Oluwaseun Adeyemi", type: "Deposit", amount: "£200.00", currency: "GBP", status: "Completed", date: "Mar 10, 2025 · 11:30", ref: "VLT-2025-001052", desc: "Online Transfer Received" },
  { id: "TX1053", user: "Samson Febaide", type: "Adjustment", amount: "+$500.00", currency: "USD", status: "Completed", date: "Mar 9, 2025 · 15:45", ref: "VLT-2025-001053", desc: "Manual Credit — Admin Correction" },
  { id: "TX1054", user: "John Doe", type: "Transfer", amount: "$250.00", currency: "USD", status: "Reversed", date: "Mar 9, 2025 · 10:00", ref: "VLT-2025-001054", desc: "Disputed Transfer — Reversed by Admin" },
];

const typeBadge: Record<string, { bg: string; color: string }> = {
  Transfer: { bg: "#EEF4FF", color: "#1A73E8" },
  Deposit: { bg: "#ECFDF5", color: "#059669" },
  Withdrawal: { bg: "#FFF7ED", color: "#EA580C" },
  Adjustment: { bg: "#F5F3FF", color: "#7C3AED" },
  Flagged: { bg: "#FEF2F2", color: "#DC2626" },
};

const statusBadge: Record<string, { bg: string; color: string }> = {
  Completed: { bg: "#ECFDF5", color: "#059669" },
  Pending: { bg: "#FFFBEB", color: "#D97706" },
  Flagged: { bg: "#FEF2F2", color: "#DC2626" },
  Failed: { bg: "#F3F4F6", color: "#6B7280" },
  Reversed: { bg: "#F5F3FF", color: "#7C3AED" },
};

function Badge({ label, map }: { label: string; map: Record<string, { bg: string; color: string }> }) {
  const s = map[label] || { bg: "#F3F4F6", color: "#6B7280" };
  return <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: 600 }}>{label}</span>;
}

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState(allTransactions);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selected, setSelected] = useState<typeof allTransactions[0] | null>(null);

  const filtered = transactions.filter(tx =>
    (typeFilter === "All" || tx.type === typeFilter) &&
    (statusFilter === "All" || tx.status === statusFilter) &&
    (tx.user.toLowerCase().includes(search.toLowerCase()) || tx.id.toLowerCase().includes(search.toLowerCase()))
  );

  const flagTransaction = (id: string) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: "Flagged" } : tx));
    setSelected(null);
  };

  const approveTransaction = (id: string) => {
    setTransactions(prev => prev.map(tx => tx.id === id ? { ...tx, status: "Completed" } : tx));
    setSelected(null);
  };

  return (
    <AdminLayout title="Transaction Monitoring">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0A1628" }}>Transaction Monitoring</h1>
          <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>{transactions.length} total transactions · {transactions.filter(t => t.status === "Flagged").length} flagged</p>
        </div>
        <div style={{ background: "#1A73E8", color: "#fff", borderRadius: "10px", padding: "10px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
          📥 Export CSV
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: "14px", padding: "16px 20px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by user or TX ID..."
            style={{ width: "100%", padding: "10px 14px 10px 36px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", outline: "none", color: "#374151" }}>
          {["All", "Transfer", "Deposit", "Withdrawal", "Adjustment"].map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", outline: "none", color: "#374151" }}>
          {["All", "Completed", "Pending", "Flagged", "Failed", "Reversed"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
          <thead style={{ background: "#F8FAFC" }}>
            <tr>
              {["TX ID", "User", "Type", "Amount", "Currency", "Status", "Date", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((tx, i) => (
              <tr key={tx.id} style={{ borderTop: "1px solid #F3F4F6", background: tx.status === "Flagged" ? "#FFF9F9" : i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 600, color: "#1A73E8", fontFamily: "monospace" }}>{tx.id}</td>
                <td style={{ padding: "12px 16px", fontSize: "13px", color: "#374151" }}>{tx.user}</td>
                <td style={{ padding: "12px 16px" }}><Badge label={tx.type} map={typeBadge} /></td>
                <td style={{ padding: "12px 16px", fontSize: "14px", fontWeight: 700, color: "#0A1628" }}>{tx.amount}</td>
                <td style={{ padding: "12px 16px", fontSize: "12px", color: "#9CA3AF" }}>{tx.currency}</td>
                <td style={{ padding: "12px 16px" }}><Badge label={tx.status} map={statusBadge} /></td>
                <td style={{ padding: "12px 16px", fontSize: "12px", color: "#9CA3AF" }}>{tx.date}</td>
                <td style={{ padding: "12px 16px" }}>
                  <button onClick={() => setSelected(tx)}
                    style={{ background: "#EEF4FF", color: "#1A73E8", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Detail Modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0A1628" }}>Transaction Details</h2>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9CA3AF" }}>✕</button>
            </div>
            <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
              <div style={{ fontSize: "24px", fontWeight: 800, color: "#0A1628", marginBottom: "4px" }}>{selected.amount}</div>
              <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                <Badge label={selected.type} map={typeBadge} />
                <Badge label={selected.status} map={statusBadge} />
              </div>
              {[
                { label: "Reference", value: selected.ref },
                { label: "User", value: selected.user },
                { label: "Description", value: selected.desc },
                { label: "Date & Time", value: selected.date },
                { label: "Currency", value: selected.currency },
              ].map(f => (
                <div key={f.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #E5E7EB" }}>
                  <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{f.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#0A1628" }}>{f.value}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {selected.status !== "Flagged" && (
                <button onClick={() => flagTransaction(selected.id)}
                  style={{ flex: 1, padding: "10px", background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  🚩 Flag
                </button>
              )}
              {(selected.status === "Pending" || selected.status === "Flagged") && (
                <button onClick={() => approveTransaction(selected.id)}
                  style={{ flex: 1, padding: "10px", background: "#ECFDF5", color: "#059669", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  ✅ Approve
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
