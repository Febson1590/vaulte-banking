"use client";
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";

const initialAccounts = [
  { id: "ACC001", owner: "Samson Febaide", number: "1004567800", type: "Checking", currency: "USD", balance: "$5,240.00", status: "Active", limit: "$10,000/day", created: "Jan 12, 2025" },
  { id: "ACC002", owner: "Samson Febaide", number: "1004567801", type: "Savings", currency: "USD", balance: "$2,100.00", status: "Active", limit: "$5,000/day", created: "Jan 12, 2025" },
  { id: "ACC003", owner: "Maria Kowalski", number: "1004567802", type: "Checking", currency: "EUR", balance: "€8,400.00", status: "Active", limit: "€10,000/day", created: "Feb 3, 2025" },
  { id: "ACC004", owner: "John Doe", number: "1004567803", type: "Checking", currency: "USD", balance: "$3,100.00", status: "Frozen", limit: "$10,000/day", created: "Dec 5, 2024" },
  { id: "ACC005", owner: "Aisha Bello", number: "1004567804", type: "Checking", currency: "USD", balance: "$750.00", status: "Active", limit: "$5,000/day", created: "Mar 1, 2025" },
  { id: "ACC006", owner: "Carlos Mendez", number: "1004567805", type: "Checking", currency: "USD", balance: "$0.00", status: "Closed", limit: "$0/day", created: "Nov 20, 2024" },
  { id: "ACC007", owner: "Li Wei", number: "1004567806", type: "Multi-Currency", currency: "GBP", balance: "£12,000.00", status: "Active", limit: "£20,000/day", created: "Jan 28, 2025" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Active: { bg: "#ECFDF5", color: "#059669" },
    Frozen: { bg: "#EFF6FF", color: "#2563EB" },
    Closed: { bg: "#F3F4F6", color: "#6B7280" },
  };
  const s = map[status] || { bg: "#F3F4F6", color: "#6B7280" };
  return <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: 600 }}>{status}</span>;
}

export default function AdminAccounts() {
  const [accounts, setAccounts] = useState(initialAccounts);
  const [selected, setSelected] = useState<typeof initialAccounts[0] | null>(null);
  const [adjustMode, setAdjustMode] = useState(false);
  const [adjustType, setAdjustType] = useState<"credit" | "debit">("credit");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReason, setAdjustReason] = useState("");
  const [adjustSuccess, setAdjustSuccess] = useState(false);

  const toggleFreeze = (id: string) => {
    setAccounts(prev => prev.map(a => a.id === id ? { ...a, status: a.status === "Frozen" ? "Active" : "Frozen" } : a));
    setSelected(null);
  };

  const handleAdjust = () => {
    if (!adjustAmount || !adjustReason) return;
    setAccounts(prev => prev.map(a => a.id === selected!.id ? { ...a } : a));
    setAdjustSuccess(true);
    setTimeout(() => { setAdjustSuccess(false); setAdjustMode(false); setAdjustAmount(""); setAdjustReason(""); setSelected(null); }, 1500);
  };

  return (
    <AdminLayout title="Account Control">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0A1628" }}>Account Control</h1>
          <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>{accounts.length} accounts · {accounts.filter(a => a.status === "Active").length} active · {accounts.filter(a => a.status === "Frozen").length} frozen</p>
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
          <thead style={{ background: "#F8FAFC" }}>
            <tr>
              {["Account No", "Owner", "Type", "Currency", "Balance", "Daily Limit", "Status", "Created", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {accounts.map((acc, i) => (
              <tr key={acc.id} style={{ borderTop: "1px solid #F3F4F6", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                <td style={{ padding: "14px 16px", fontSize: "13px", fontFamily: "monospace", fontWeight: 600, color: "#1A73E8" }}>{acc.number}</td>
                <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 600, color: "#0A1628" }}>{acc.owner}</td>
                <td style={{ padding: "14px 16px", fontSize: "13px", color: "#374151" }}>{acc.type}</td>
                <td style={{ padding: "14px 16px", fontSize: "13px", color: "#374151" }}>{acc.currency}</td>
                <td style={{ padding: "14px 16px", fontSize: "14px", fontWeight: 700, color: "#0A1628" }}>{acc.balance}</td>
                <td style={{ padding: "14px 16px", fontSize: "12px", color: "#9CA3AF" }}>{acc.limit}</td>
                <td style={{ padding: "14px 16px" }}><StatusBadge status={acc.status} /></td>
                <td style={{ padding: "14px 16px", fontSize: "12px", color: "#9CA3AF" }}>{acc.created}</td>
                <td style={{ padding: "14px 16px" }}>
                  <button onClick={() => { setSelected(acc); setAdjustMode(false); setAdjustSuccess(false); }}
                    style={{ background: "#EEF4FF", color: "#1A73E8", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0A1628" }}>{adjustMode ? "Manual Adjustment" : "Account Details"}</h2>
              <button onClick={() => { setSelected(null); setAdjustMode(false); }} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9CA3AF" }}>✕</button>
            </div>

            {adjustSuccess ? (
              <div style={{ textAlign: "center", padding: "32px" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#059669" }}>Adjustment Applied</div>
              </div>
            ) : adjustMode ? (
              <div>
                <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "14px", marginBottom: "20px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "#0A1628" }}>{selected.owner}</div>
                  <div style={{ fontSize: "12px", color: "#9CA3AF" }}>{selected.number} · {selected.type} · {selected.currency}</div>
                  <div style={{ fontSize: "20px", fontWeight: 800, color: "#0A1628", marginTop: "8px" }}>{selected.balance}</div>
                </div>
                <div style={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
                  {(["credit", "debit"] as const).map(t => (
                    <button key={t} onClick={() => setAdjustType(t)}
                      style={{ flex: 1, padding: "10px", background: adjustType === t ? (t === "credit" ? "#ECFDF5" : "#FEF2F2") : "#F3F4F6", color: adjustType === t ? (t === "credit" ? "#059669" : "#DC2626") : "#6B7280", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                      {t === "credit" ? "➕ Credit" : "➖ Debit"}
                    </button>
                  ))}
                </div>
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Amount</label>
                  <input type="number" value={adjustAmount} onChange={e => setAdjustAmount(e.target.value)} placeholder="0.00"
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "6px" }}>Reason (required)</label>
                  <input type="text" value={adjustReason} onChange={e => setAdjustReason(e.target.value)} placeholder="e.g. Error correction, refund, penalty..."
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ display: "flex", gap: "8px" }}>
                  <button onClick={handleAdjust} disabled={!adjustAmount || !adjustReason}
                    style={{ flex: 1, padding: "10px", background: (!adjustAmount || !adjustReason) ? "#9CA3AF" : "#1A73E8", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: (!adjustAmount || !adjustReason) ? "not-allowed" : "pointer" }}>
                    Apply Adjustment
                  </button>
                  <button onClick={() => setAdjustMode(false)}
                    style={{ flex: 1, padding: "10px", background: "#F3F4F6", color: "#6B7280", border: "none", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
                  <div style={{ fontSize: "24px", fontWeight: 800, color: "#0A1628", marginBottom: "4px" }}>{selected.balance}</div>
                  <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "12px" }}>{selected.type} · {selected.currency}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    {[
                      { label: "Account No", value: selected.number },
                      { label: "Owner", value: selected.owner },
                      { label: "Daily Limit", value: selected.limit },
                      { label: "Status", value: selected.status },
                      { label: "Account ID", value: selected.id },
                      { label: "Created", value: selected.created },
                    ].map(f => (
                      <div key={f.label}>
                        <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{f.label}</div>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#0A1628" }}>{f.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  <button onClick={() => toggleFreeze(selected.id)}
                    style={{ flex: 1, padding: "10px", background: selected.status === "Frozen" ? "#ECFDF5" : "#EFF6FF", color: selected.status === "Frozen" ? "#059669" : "#2563EB", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                    {selected.status === "Frozen" ? "✅ Unfreeze" : "❄️ Freeze"}
                  </button>
                  <button onClick={() => setAdjustMode(true)}
                    style={{ flex: 1, padding: "10px", background: "#F5F3FF", color: "#7C3AED", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                    🔧 Adjust Balance
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
