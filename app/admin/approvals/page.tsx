"use client";
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";

const initialRequests = [
  { id: "REQ001", user: "John Doe", email: "john@mail.com", type: "Withdrawal", amount: "$2,000.00", currency: "USD", submitted: "Mar 10, 2025 · 13:55", note: "Personal expense", status: "Pending", risk: "Low" },
  { id: "REQ002", user: "Samson Febaide", email: "sam@gmail.com", type: "Large Transfer", amount: "$8,500.00", currency: "USD", submitted: "Mar 10, 2025 · 11:20", note: "Business payment — supplier invoice", status: "Pending", risk: "Medium" },
  { id: "REQ003", user: "Maria Kowalski", email: "maria@mail.com", type: "Loan Request", amount: "€5,000.00", currency: "EUR", submitted: "Mar 9, 2025 · 09:40", note: "Home renovation", status: "Pending", risk: "Low" },
  { id: "REQ004", user: "Aisha Bello", email: "aisha@mail.com", type: "Account Change", amount: "—", currency: "—", submitted: "Mar 9, 2025 · 08:15", note: "Request to update account limit from $5K to $15K/day", status: "Pending", risk: "Medium" },
  { id: "REQ005", user: "Carlos Mendez", email: "carlos@mail.com", type: "Withdrawal", amount: "$4,800.00", currency: "USD", submitted: "Mar 8, 2025 · 16:00", note: "Urgent withdrawal — travel", status: "Approved", risk: "High" },
  { id: "REQ006", user: "Priya Sharma", email: "priya@mail.com", type: "Large Transfer", amount: "£3,200.00", currency: "GBP", submitted: "Mar 8, 2025 · 14:30", note: "Tuition payment — London university", status: "Rejected", risk: "Low" },
];

const riskColor: Record<string, { bg: string; color: string }> = {
  Low: { bg: "#ECFDF5", color: "#059669" },
  Medium: { bg: "#FFFBEB", color: "#D97706" },
  High: { bg: "#FEF2F2", color: "#DC2626" },
};

const statusColor: Record<string, { bg: string; color: string }> = {
  Pending: { bg: "#FFFBEB", color: "#D97706" },
  Approved: { bg: "#ECFDF5", color: "#059669" },
  Rejected: { bg: "#FEF2F2", color: "#DC2626" },
};

function Badge({ label, map }: { label: string; map: Record<string, { bg: string; color: string }> }) {
  const s = map[label] || { bg: "#F3F4F6", color: "#6B7280" };
  return <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: 600 }}>{label}</span>;
}

export default function AdminApprovals() {
  const [requests, setRequests] = useState(initialRequests);
  const [filter, setFilter] = useState("Pending");
  const [selected, setSelected] = useState<typeof initialRequests[0] | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject] = useState(false);

  const filtered = requests.filter(r => filter === "All" || r.status === filter);

  const updateStatus = (id: string, status: string) => {
    setRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    setSelected(null);
    setShowReject(false);
    setRejectReason("");
  };

  return (
    <AdminLayout title="Approvals">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0A1628" }}>Withdrawal & Transfer Approvals</h1>
          <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>{requests.filter(r => r.status === "Pending").length} pending requests require your attention</p>
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "24px" }}>
        {[
          { label: "Pending", count: requests.filter(r => r.status === "Pending").length, color: "#D97706", bg: "#FFFBEB", icon: "⏳" },
          { label: "Approved Today", count: requests.filter(r => r.status === "Approved").length, color: "#059669", bg: "#ECFDF5", icon: "✅" },
          { label: "Rejected Today", count: requests.filter(r => r.status === "Rejected").length, color: "#DC2626", bg: "#FEF2F2", icon: "❌" },
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
      <div style={{ background: "#fff", borderRadius: "14px", padding: "12px 16px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", gap: "8px" }}>
        {["All", "Pending", "Approved", "Rejected"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: filter === f ? "#1A73E8" : "#F3F4F6", color: filter === f ? "#fff" : "#6B7280", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#F8FAFC" }}>
            <tr>
              {["User", "Request Type", "Amount", "Note", "Risk", "Submitted", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((req, i) => (
              <tr key={req.id} style={{ borderTop: "1px solid #F3F4F6", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0A1628" }}>{req.user}</div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{req.email}</div>
                </td>
                <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 600, color: "#374151" }}>{req.type}</td>
                <td style={{ padding: "14px 16px", fontSize: "14px", fontWeight: 700, color: "#0A1628" }}>{req.amount}</td>
                <td style={{ padding: "14px 16px", fontSize: "12px", color: "#6B7280", maxWidth: "180px" }}>{req.note}</td>
                <td style={{ padding: "14px 16px" }}><Badge label={req.risk} map={riskColor} /></td>
                <td style={{ padding: "14px 16px", fontSize: "12px", color: "#9CA3AF" }}>{req.submitted}</td>
                <td style={{ padding: "14px 16px" }}><Badge label={req.status} map={statusColor} /></td>
                <td style={{ padding: "14px 16px" }}>
                  {req.status === "Pending" ? (
                    <div style={{ display: "flex", gap: "6px" }}>
                      <button onClick={() => updateStatus(req.id, "Approved")}
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
      </div>

      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "460px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0A1628" }}>Request Details</h2>
              <button onClick={() => { setSelected(null); setShowReject(false); }} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9CA3AF" }}>✕</button>
            </div>
            <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
              {[
                { label: "User", value: selected.user },
                { label: "Request Type", value: selected.type },
                { label: "Amount", value: selected.amount },
                { label: "Note", value: selected.note },
                { label: "Submitted", value: selected.submitted },
                { label: "Risk Level", value: selected.risk },
              ].map(f => (
                <div key={f.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid #E5E7EB" }}>
                  <span style={{ fontSize: "12px", color: "#9CA3AF" }}>{f.label}</span>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: "#0A1628" }}>{f.value}</span>
                </div>
              ))}
            </div>
            {showReject ? (
              <>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "8px" }}>Rejection Reason</label>
                <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="Enter reason for rejection..."
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", minHeight: "80px", resize: "vertical", outline: "none", boxSizing: "border-box", marginBottom: "12px" }} />
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={() => updateStatus(selected.id, "Rejected")}
                    style={{ flex: 1, padding: "10px", background: "#DC2626", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>Confirm Rejection</button>
                  <button onClick={() => setShowReject(false)}
                    style={{ flex: 1, padding: "10px", background: "#F3F4F6", color: "#6B7280", border: "none", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
                </div>
              </>
            ) : selected.status === "Pending" && (
              <div style={{ display: "flex", gap: "8px" }}>
                <button onClick={() => updateStatus(selected.id, "Approved")}
                  style={{ flex: 1, padding: "10px", background: "#059669", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>✅ Approve</button>
                <button onClick={() => setShowReject(true)}
                  style={{ flex: 1, padding: "10px", background: "#DC2626", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>❌ Reject</button>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
