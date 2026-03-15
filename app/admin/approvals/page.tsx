"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { getUsers, getUserState, saveUserState } from "@/lib/vaulteState";
import type { Transaction } from "@/lib/vaulteState";

// ─── Enriched approval item ───────────────────────────────
interface ApprovalItem {
  id: string;
  reqId: string;
  user: string;
  email: string;
  userId: string;
  type: string;
  amount: string;
  note: string;
  submitted: string;
  status: string;
  risk: "Low" | "Medium" | "High";
}

function getRisk(amount: number): "Low" | "Medium" | "High" {
  if (amount >= 5000) return "High";
  if (amount >= 1000) return "Medium";
  return "Low";
}

const riskColor: Record<string, { bg: string; color: string }> = {
  Low:    { bg: "#ECFDF5", color: "#059669" },
  Medium: { bg: "#FFFBEB", color: "#D97706" },
  High:   { bg: "#FEF2F2", color: "#DC2626" },
};

const statusColor: Record<string, { bg: string; color: string }> = {
  Pending:  { bg: "#FFFBEB", color: "#D97706" },
  Approved: { bg: "#ECFDF5", color: "#059669" },
  Rejected: { bg: "#FEF2F2", color: "#DC2626" },
};

function Badge({ label, map }: { label: string; map: Record<string, { bg: string; color: string }> }) {
  const s = map[label] || { bg: "#F3F4F6", color: "#6B7280" };
  return <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: 600 }}>{label}</span>;
}

export default function AdminApprovals() {
  const [requests,  setRequests]  = useState<ApprovalItem[]>([]);
  const [filter,    setFilter]    = useState("Pending");
  const [selected,  setSelected]  = useState<ApprovalItem | null>(null);
  const [showReject, setShowReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [loaded, setLoaded] = useState(false);

  // ─── Load pending transactions from all users ────────────
  const loadApprovals = () => {
    const users = getUsers();
    const items: ApprovalItem[] = [];

    users.forEach(u => {
      const state = getUserState(u.id);
      state.transactions.forEach(tx => {
        if (tx.status === "pending" || tx.category === "Adjustment") {
          items.push({
            id:        tx.id,
            reqId:     `REQ-${tx.id.slice(-6).toUpperCase()}`,
            user:      `${u.firstName} ${u.lastName}`,
            email:     u.email,
            userId:    u.id,
            type:      tx.type === "credit" ? "Credit" : tx.category === "Transfer" ? "Transfer" : "Debit",
            amount:    `${tx.currency === "BTC" ? "₿" : "$"}${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            note:      tx.sub,
            submitted: new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
            status:    tx.status === "pending" ? "Pending" : tx.status === "completed" ? "Approved" : "Rejected",
            risk:      getRisk(tx.amount),
          });
        }
      });
    });

    setRequests(items);
    setLoaded(true);
  };

  useEffect(() => { loadApprovals(); }, []);

  const filtered = requests.filter(r => filter === "All" || r.status === filter);

  const updateStatus = (item: ApprovalItem, newStatus: string) => {
    // Update the transaction in the user's state
    const state  = getUserState(item.userId);
    const txStatus = newStatus === "Approved" ? "completed" : newStatus === "Rejected" ? "failed" : "pending";
    const txns   = state.transactions.map(t => t.id === item.id ? { ...t, status: txStatus as Transaction["status"] } : t);
    saveUserState(item.userId, { ...state, transactions: txns });

    // Update local state
    setRequests(prev => prev.map(r => r.id === item.id && r.userId === item.userId ? { ...r, status: newStatus } : r));
    setSelected(null);
    setShowReject(false);
    setRejectReason("");
  };

  const pending  = requests.filter(r => r.status === "Pending").length;
  const approved = requests.filter(r => r.status === "Approved").length;
  const rejected = requests.filter(r => r.status === "Rejected").length;

  return (
    <AdminLayout title="Approvals">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0A1628" }}>Transaction Approvals</h1>
          <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>
            {loaded ? `${pending} pending request${pending !== 1 ? "s" : ""} require your attention` : "Loading..."}
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="admin-approvals-cards-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Pending",         count: pending,  color: "#D97706", bg: "#FFFBEB", icon: "⏳" },
          { label: "Approved",        count: approved, color: "#059669", bg: "#ECFDF5", icon: "✅" },
          { label: "Rejected",        count: rejected, color: "#DC2626", bg: "#FEF2F2", icon: "❌" },
        ].map(c => (
          <div key={c.label} style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "48px", height: "48px", borderRadius: "12px", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px" }}>{c.icon}</div>
            <div>
              <div style={{ fontSize: "28px", fontWeight: 800, color: c.color }}>{c.count}</div>
              <div style={{ fontSize: "13px", color: "#6B7280" }}>{c.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ background: "#fff", borderRadius: "14px", padding: "12px 16px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {["All", "Pending", "Approved", "Rejected"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: filter === f ? "#1A73E8" : "#F3F4F6", color: filter === f ? "#fff" : "#6B7280", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
            {f}
          </button>
        ))}
      </div>

      {/* Table / Empty */}
      <div className="admin-table-scroll" style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {!loaded ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#9CA3AF" }}>Loading approvals...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <p style={{ fontSize: "36px", marginBottom: "12px" }}>✅</p>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>
              {requests.length === 0 ? "No pending transactions yet" : "No items match this filter"}
            </p>
            <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
              {requests.length === 0 ? "Pending transactions from registered users will appear here for review." : "Try selecting a different filter."}
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#F8FAFC" }}>
              <tr>
                {["User", "Type", "Amount", "Note", "Risk", "Submitted", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((req, i) => (
                <tr key={`${req.id}-${req.userId}`} style={{ borderTop: "1px solid #F3F4F6", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#0A1628" }}>{req.user}</div>
                    <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{req.email}</div>
                  </td>
                  <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>{req.type}</td>
                  <td style={{ padding: "14px 16px", fontSize: "14px", fontWeight: 700, color: "#0A1628" }}>{req.amount}</td>
                  <td style={{ padding: "14px 16px", fontSize: "12px", color: "#6B7280", maxWidth: "160px" }}>{req.note}</td>
                  <td style={{ padding: "14px 16px" }}><Badge label={req.risk} map={riskColor} /></td>
                  <td style={{ padding: "14px 16px", fontSize: "12px", color: "#9CA3AF" }}>{req.submitted}</td>
                  <td style={{ padding: "14px 16px" }}><Badge label={req.status} map={statusColor} /></td>
                  <td style={{ padding: "14px 16px" }}>
                    {req.status === "Pending" ? (
                      <div style={{ display: "flex", gap: "6px" }}>
                        <button onClick={() => updateStatus(req, "Approved")}
                          style={{ background: "#ECFDF5", color: "#059669", border: "none", borderRadius: "6px", padding: "5px 10px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>✅</button>
                        <button onClick={() => { setSelected(req); setShowReject(true); }}
                          style={{ background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: "6px", padding: "5px 10px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>❌</button>
                        <button onClick={() => { setSelected(req); setShowReject(false); }}
                          style={{ background: "#EEF4FF", color: "#1A73E8", border: "none", borderRadius: "6px", padding: "5px 10px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>👁</button>
                      </div>
                    ) : (
                      <button onClick={() => { setSelected(req); setShowReject(false); }}
                        style={{ background: "#EEF4FF", color: "#1A73E8", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>View</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0A1628" }}>Request Details</h2>
              <button onClick={() => { setSelected(null); setShowReject(false); }} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9CA3AF" }}>✕</button>
            </div>
            <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
              {[
                { label: "User",         value: `${selected.user} (${selected.email})` },
                { label: "Request Type", value: selected.type },
                { label: "Amount",       value: selected.amount },
                { label: "Note",         value: selected.note },
                { label: "Submitted",    value: selected.submitted },
                { label: "Risk Level",   value: selected.risk },
              ].map(f => (
                <div key={f.label} style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "8px 0", borderBottom: "1px solid #E5E7EB" }}>
                  <span style={{ fontSize: "12px", color: "#9CA3AF", flexShrink: 0 }}>{f.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#0A1628", textAlign: "right" }}>{f.value}</span>
                </div>
              ))}
            </div>
            {showReject ? (
              <>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "8px" }}>Rejection Reason</label>
                <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Enter reason for rejection..."
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", minHeight: "80px", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "12px" }} />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => updateStatus(selected, "Rejected")}
                    style={{ flex: 1, padding: "10px", background: "#DC2626", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                    Confirm Rejection
                  </button>
                  <button onClick={() => setShowReject(false)}
                    style={{ flex: 1, padding: "10px", background: "#F3F4F6", color: "#6B7280", border: "none", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </>
            ) : selected.status === "Pending" ? (
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => updateStatus(selected, "Approved")}
                  style={{ flex: 1, padding: "10px", background: "#059669", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  ✅ Approve
                </button>
                <button onClick={() => setShowReject(true)}
                  style={{ flex: 1, padding: "10px", background: "#DC2626", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  ❌ Reject
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
