"use client";
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";

const logs = [
  { id: "LOG001", admin: "Super Admin", adminEmail: "admin@vaulte.com", action: "Approved KYC", target: "Maria Kowalski", targetType: "User", description: "KYC submission approved — Passport verified", time: "Mar 10, 2025 · 14:32", category: "KYC" },
  { id: "LOG002", admin: "Admin1", adminEmail: "admin1@vaulte.com", action: "Froze Account", target: "John Doe", targetType: "Account", description: "Account ACC004 frozen — suspicious activity detected", time: "Mar 10, 2025 · 15:10", category: "Account" },
  { id: "LOG003", admin: "Super Admin", adminEmail: "admin@vaulte.com", action: "Manual Credit +$500", target: "Samson Febaide", targetType: "Account", description: "Manual credit applied — error correction (REF: ADJ-001)", time: "Mar 10, 2025 · 15:45", category: "Adjustment" },
  { id: "LOG004", admin: "Super Admin", adminEmail: "admin@vaulte.com", action: "Changed Transfer Limit", target: "System", targetType: "System", description: "Daily transfer limit changed from $8,000 to $10,000", time: "Mar 10, 2025 · 16:00", category: "Settings" },
  { id: "LOG005", admin: "Admin1", adminEmail: "admin1@vaulte.com", action: "Rejected KYC", target: "Carlos Mendez", targetType: "User", description: "KYC rejected — document expired. User notified.", time: "Mar 9, 2025 · 11:20", category: "KYC" },
  { id: "LOG006", admin: "Super Admin", adminEmail: "admin@vaulte.com", action: "Approved Withdrawal", target: "Carlos Mendez", targetType: "Transaction", description: "Withdrawal request REQ005 approved — $4,800 USD", time: "Mar 8, 2025 · 16:30", category: "Approval" },
  { id: "LOG007", admin: "Admin1", adminEmail: "admin1@vaulte.com", action: "Flagged Transaction", target: "TX1048", targetType: "Transaction", description: "Transaction flagged — unusual transfer to unknown external account", time: "Mar 8, 2025 · 14:00", category: "Transaction" },
  { id: "LOG008", admin: "Super Admin", adminEmail: "admin@vaulte.com", action: "Suspended User", target: "Carlos Mendez", targetType: "User", description: "User account suspended — multiple policy violations", time: "Mar 7, 2025 · 09:15", category: "Account" },
  { id: "LOG009", admin: "Admin1", adminEmail: "admin1@vaulte.com", action: "Sent Notification", target: "All Users", targetType: "System", description: "Broadcast: System maintenance scheduled for Mar 10 1AM–3AM", time: "Mar 6, 2025 · 17:00", category: "Notification" },
  { id: "LOG010", admin: "Super Admin", adminEmail: "admin@vaulte.com", action: "Admin Login", target: "Admin Panel", targetType: "System", description: "Successful admin login from IP 197.210.x.x", time: "Mar 6, 2025 · 08:00", category: "Auth" },
];

const categoryColors: Record<string, { bg: string; color: string; icon: string }> = {
  KYC: { bg: "#EEF4FF", color: "#1A73E8", icon: "🪪" },
  Account: { bg: "#EFF6FF", color: "#2563EB", icon: "🏦" },
  Adjustment: { bg: "#F5F3FF", color: "#7C3AED", icon: "🔧" },
  Settings: { bg: "#FFFBEB", color: "#D97706", icon: "⚙️" },
  Approval: { bg: "#ECFDF5", color: "#059669", icon: "✅" },
  Transaction: { bg: "#FEF2F2", color: "#DC2626", icon: "💸" },
  Notification: { bg: "#F0FDF4", color: "#16A34A", icon: "📢" },
  Auth: { bg: "#F3F4F6", color: "#6B7280", icon: "🔐" },
};

export default function AdminAuditLogs() {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");

  const filtered = logs.filter(log =>
    (categoryFilter === "All" || log.category === categoryFilter) &&
    (log.admin.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.target.toLowerCase().includes(search.toLowerCase()))
  );

  const categories = ["All", ...Array.from(new Set(logs.map(l => l.category)))];

  return (
    <AdminLayout title="Audit Logs">
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0A1628" }}>Audit Logs</h1>
        <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>
          Complete read-only activity trail · {logs.length} total entries · Logs cannot be deleted
        </p>
      </div>

      {/* Notice */}
      <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
        <span style={{ fontSize: "18px" }}>⚠️</span>
        <div style={{ fontSize: "13px", color: "#92400E" }}>
          <strong>Read-only:</strong> Audit logs are immutable. Every admin action is permanently recorded for compliance and accountability purposes.
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: "14px", padding: "16px 20px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by admin, action or target..."
            style={{ width: "100%", padding: "10px 14px 10px 36px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          style={{ padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", outline: "none", color: "#374151" }}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {/* Log list */}
      <div style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {filtered.map((log, i) => {
          const cat = categoryColors[log.category] || { bg: "#F3F4F6", color: "#6B7280", icon: "📌" };
          return (
            <div key={log.id} style={{ display: "flex", gap: "16px", padding: "16px 20px", borderBottom: i < filtered.length - 1 ? "1px solid #F3F4F6" : "none", alignItems: "flex-start" }}>
              {/* Icon */}
              <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: cat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", flexShrink: 0 }}>
                {cat.icon}
              </div>
              {/* Content */}
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "14px", fontWeight: 700, color: "#0A1628" }}>{log.action}</span>
                  <span style={{ background: cat.bg, color: cat.color, borderRadius: "20px", padding: "2px 8px", fontSize: "11px", fontWeight: 600 }}>{log.category}</span>
                </div>
                <div style={{ fontSize: "13px", color: "#374151", marginBottom: "4px" }}>{log.description}</div>
                <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>👤 <strong>{log.admin}</strong> ({log.adminEmail})</span>
                  <span style={{ fontSize: "12px", color: "#6B7280" }}>🎯 Target: <strong>{log.target}</strong> ({log.targetType})</span>
                  <span style={{ fontSize: "12px", color: "#9CA3AF" }}>🕐 {log.time}</span>
                </div>
              </div>
              {/* Log ID */}
              <div style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace", flexShrink: 0 }}>{log.id}</div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF" }}>No log entries match your search.</div>
        )}
      </div>
    </AdminLayout>
  );
}
