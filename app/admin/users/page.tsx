"use client";
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";

const allUsers = [
  { id: "U001", name: "Samson Febaide", email: "sam@gmail.com", phone: "+234 801 234 5678", country: "Nigeria", status: "Active", kyc: "Approved", joined: "Jan 12, 2025", balance: "$5,240.00" },
  { id: "U002", name: "Maria Kowalski", email: "maria@mail.com", phone: "+48 600 123 456", country: "Poland", status: "Active", kyc: "Approved", joined: "Feb 3, 2025", balance: "$12,800.00" },
  { id: "U003", name: "John Doe", email: "john@mail.com", phone: "+1 555 012 3456", country: "USA", status: "Frozen", kyc: "Approved", joined: "Dec 5, 2024", balance: "$3,100.00" },
  { id: "U004", name: "Aisha Bello", email: "aisha@mail.com", phone: "+234 802 987 6543", country: "Nigeria", status: "Active", kyc: "Pending", joined: "Mar 1, 2025", balance: "$750.00" },
  { id: "U005", name: "Carlos Mendez", email: "carlos@mail.com", phone: "+52 55 1234 5678", country: "Mexico", status: "Suspended", kyc: "Rejected", joined: "Nov 20, 2024", balance: "$0.00" },
  { id: "U006", name: "Priya Sharma", email: "priya@mail.com", phone: "+91 98765 43210", country: "India", status: "Active", kyc: "Pending", joined: "Mar 5, 2025", balance: "$2,340.00" },
  { id: "U007", name: "Li Wei", email: "liwei@mail.com", phone: "+86 138 0013 8000", country: "China", status: "Active", kyc: "Approved", joined: "Jan 28, 2025", balance: "$18,400.00" },
  { id: "U008", name: "Oluwaseun Adeyemi", email: "seun@mail.com", phone: "+234 703 456 7890", country: "Nigeria", status: "Active", kyc: "Not Submitted", joined: "Mar 8, 2025", balance: "$120.00" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Active: { bg: "#ECFDF5", color: "#059669" },
    Frozen: { bg: "#EFF6FF", color: "#2563EB" },
    Suspended: { bg: "#FEF2F2", color: "#DC2626" },
    Approved: { bg: "#ECFDF5", color: "#059669" },
    Pending: { bg: "#FFFBEB", color: "#D97706" },
    Rejected: { bg: "#FEF2F2", color: "#DC2626" },
    "Not Submitted": { bg: "#F3F4F6", color: "#6B7280" },
  };
  const s = map[status] || { bg: "#F3F4F6", color: "#6B7280" };
  return <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: 600 }}>{status}</span>;
}

export default function AdminUsers() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [selectedUser, setSelectedUser] = useState<typeof allUsers[0] | null>(null);
  const [users, setUsers] = useState(allUsers);

  const filtered = users.filter(u =>
    (statusFilter === "All" || u.status === statusFilter) &&
    (u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleStatus = (id: string, action: "Freeze" | "Activate" | "Suspend") => {
    const map = { Freeze: "Frozen", Activate: "Active", Suspend: "Suspended" };
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: map[action] } : u));
    setSelectedUser(null);
  };

  return (
    <AdminLayout title="User Management">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0A1628" }}>User Management</h1>
          <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>{users.length} total registered users</p>
        </div>
        <div style={{ background: "#1A73E8", color: "#fff", borderRadius: "10px", padding: "10px 20px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
          + Export Users
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: "14px", padding: "16px 20px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
            style={{ width: "100%", padding: "10px 14px 10px 36px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
        </div>
        {["All", "Active", "Frozen", "Suspended"].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding: "8px 16px", borderRadius: "8px", border: "1.5px solid", borderColor: statusFilter === s ? "#1A73E8" : "#E5E7EB", background: statusFilter === s ? "#EEF4FF" : "#fff", color: statusFilter === s ? "#1A73E8" : "#6B7280", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>
            {s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#F8FAFC" }}>
            <tr>
              {["User", "Email", "Country", "Balance", "KYC", "Status", "Joined", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, i) => (
              <tr key={user.id} style={{ borderTop: "1px solid #F3F4F6", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#EEF4FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#1A73E8", fontSize: "14px", flexShrink: 0 }}>
                      {user.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 600, color: "#0A1628" }}>{user.name}</div>
                      <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{user.id}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 16px", fontSize: "13px", color: "#374151" }}>{user.email}</td>
                <td style={{ padding: "14px 16px", fontSize: "13px", color: "#374151" }}>{user.country}</td>
                <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 700, color: "#0A1628" }}>{user.balance}</td>
                <td style={{ padding: "14px 16px" }}><StatusBadge status={user.kyc} /></td>
                <td style={{ padding: "14px 16px" }}><StatusBadge status={user.status} /></td>
                <td style={{ padding: "14px 16px", fontSize: "12px", color: "#9CA3AF" }}>{user.joined}</td>
                <td style={{ padding: "14px 16px" }}>
                  <button onClick={() => setSelectedUser(user)}
                    style={{ background: "#EEF4FF", color: "#1A73E8", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: "40px", textAlign: "center", color: "#9CA3AF" }}>No users found matching your search.</div>
        )}
      </div>

      {/* User Detail Modal */}
      {selectedUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "480px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0A1628" }}>User Profile</h2>
              <button onClick={() => setSelectedUser(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9CA3AF" }}>✕</button>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "24px", padding: "16px", background: "#F8FAFC", borderRadius: "12px" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#EEF4FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#1A73E8", fontSize: "20px" }}>
                {selectedUser.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
              </div>
              <div>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "#0A1628" }}>{selectedUser.name}</div>
                <div style={{ fontSize: "13px", color: "#6B7280" }}>{selectedUser.email}</div>
                <div style={{ marginTop: "4px" }}><StatusBadge status={selectedUser.status} /></div>
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "24px" }}>
              {[
                { label: "User ID", value: selectedUser.id },
                { label: "Phone", value: selectedUser.phone },
                { label: "Country", value: selectedUser.country },
                { label: "Balance", value: selectedUser.balance },
                { label: "KYC Status", value: selectedUser.kyc },
                { label: "Joined", value: selectedUser.joined },
              ].map(f => (
                <div key={f.label} style={{ background: "#F8FAFC", borderRadius: "8px", padding: "10px 14px" }}>
                  <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "4px" }}>{f.label}</div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0A1628" }}>{f.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {selectedUser.status !== "Frozen" && (
                <button onClick={() => toggleStatus(selectedUser.id, "Freeze")}
                  style={{ flex: 1, padding: "10px", background: "#EFF6FF", color: "#2563EB", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  ❄️ Freeze
                </button>
              )}
              {selectedUser.status !== "Active" && (
                <button onClick={() => toggleStatus(selectedUser.id, "Activate")}
                  style={{ flex: 1, padding: "10px", background: "#ECFDF5", color: "#059669", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  ✅ Activate
                </button>
              )}
              {selectedUser.status !== "Suspended" && (
                <button onClick={() => toggleStatus(selectedUser.id, "Suspend")}
                  style={{ flex: 1, padding: "10px", background: "#FEF2F2", color: "#DC2626", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  🚫 Suspend
                </button>
              )}
              <button style={{ flex: 1, padding: "10px", background: "#FFFBEB", color: "#D97706", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                🔑 Reset Password
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
