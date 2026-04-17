"use client";
import AdminLayout from "@/components/AdminLayout";

const reportCards = [
  { title: "Total Users", value: "1,284", change: "+12 this week", icon: "👥", color: "#1A73E8", bg: "#EEF4FF" },
  { title: "Total Deposits", value: "$4,512,300", change: "+$32,000 today", icon: "💰", color: "#059669", bg: "#ECFDF5" },
  { title: "Total Transfers", value: "$1,840,000", change: "+$18,200 today", icon: "💸", color: "#7C3AED", bg: "#F5F3FF" },
  { title: "Total Withdrawals", value: "$620,400", change: "+$8,400 today", icon: "🏧", color: "#EA580C", bg: "#FFF7ED" },
  { title: "Transactions Today", value: "340", change: "$284,500 total volume", icon: "📊", color: "#D97706", bg: "#FFFBEB" },
  { title: "Suspicious Activities", value: "7", change: "3 pending review", icon: "🚩", color: "#DC2626", bg: "#FEF2F2" },
];

const dailyData = [
  { day: "Mon", tx: 280, deposits: 95000, withdrawals: 28000 },
  { day: "Tue", tx: 310, deposits: 112000, withdrawals: 34000 },
  { day: "Wed", tx: 295, deposits: 88000, withdrawals: 22000 },
  { day: "Thu", tx: 340, deposits: 130000, withdrawals: 41000 },
  { day: "Fri", tx: 390, deposits: 145000, withdrawals: 50000 },
  { day: "Sat", tx: 220, deposits: 64000, withdrawals: 18000 },
  { day: "Sun", tx: 180, deposits: 52000, withdrawals: 14000 },
];

const maxTx = Math.max(...dailyData.map(d => d.tx));

const topUsers = [
  { name: "Li Wei", transactions: 48, volume: "$84,200" },
  { name: "Maria Kowalski", transactions: 36, volume: "$62,400" },
  { name: "Samson Febaide", transactions: 29, volume: "$41,000" },
  { name: "Priya Sharma", transactions: 22, volume: "$28,600" },
  { name: "John Doe", transactions: 17, volume: "$18,300" },
];

const fraudReport = [
  { date: "Mar 10", user: "Aisha Bello", type: "Flagged Transfer", amount: "$340", action: "Under Review" },
  { date: "Mar 8", user: "Carlos Mendez", type: "Multiple Failed Logins", amount: "—", action: "Account Suspended" },
  { date: "Mar 5", user: "Unknown", type: "Unusual Large Deposit", amount: "$12,000", action: "Flagged" },
];

export default function AdminReports() {
  return (
    <AdminLayout title="Reports">
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0A1628" }}>Reports & Analytics</h1>
        <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>System-wide performance and activity overview · March 2025</p>
      </div>

      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {reportCards.map(c => (
          <div key={c.title} style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", borderTop: `3px solid ${c.color}` }}>
            <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", marginBottom: "12px" }}>{c.icon}</div>
            <div style={{ fontSize: "22px", fontWeight: 800, color: "#0A1628" }}>{c.value}</div>
            <div style={{ fontSize: "12px", color: "#6B7280" }}>{c.title}</div>
            <div style={{ fontSize: "11px", color: c.color, fontWeight: 600, marginTop: "4px" }}>{c.change}</div>
          </div>
        ))}
      </div>

      <div className="admin-reports-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px", marginBottom: "20px" }}>
        {/* Bar Chart — Daily Transactions */}
        <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
            <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0A1628" }}>Daily Transactions (This Week)</h2>
            <div style={{ background: "#EEF4FF", color: "#1A73E8", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 600 }}>📥 Export PDF</div>
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: "16px", height: "180px", paddingBottom: "8px" }}>
            {dailyData.map(d => (
              <div key={d.day} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "#1A73E8" }}>{d.tx}</div>
                <div style={{ width: "100%", background: "#1A73E8", borderRadius: "6px 6px 0 0", height: `${(d.tx / maxTx) * 140}px`, transition: "height 0.3s" }} />
                <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{d.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Users */}
        <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700, color: "#0A1628" }}>Top Users by Volume</h2>
          {topUsers.map((u, i) => (
            <div key={u.name} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "14px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: ["#1A73E8", "#059669", "#7C3AED", "#D97706", "#EA580C"][i], display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: "12px", flexShrink: 0 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#0A1628" }}>{u.name}</div>
                <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{u.transactions} transactions</div>
              </div>
              <div style={{ fontSize: "13px", fontWeight: 700, color: "#0A1628" }}>{u.volume}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Fraud Report */}
      <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", marginBottom: "20px" }}>
        <h2 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#0A1628" }}>🚩 Fraud & Suspicious Activity Report</h2>
        <div className="admin-table-scroll"><table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#FEF2F2" }}>
              {["Date", "User", "Activity Type", "Amount", "Action Taken"].map(h => (
                <th key={h} style={{ padding: "10px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#DC2626", textTransform: "uppercase" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fraudReport.map((f, i) => (
              <tr key={i} style={{ borderBottom: "1px solid #FEF2F2" }}>
                <td style={{ padding: "12px 16px", fontSize: "13px", color: "#374151" }}>{f.date}</td>
                <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 600, color: "#0A1628" }}>{f.user}</td>
                <td style={{ padding: "12px 16px", fontSize: "13px", color: "#374151" }}>{f.type}</td>
                <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 700, color: "#0A1628" }}>{f.amount}</td>
                <td style={{ padding: "12px 16px" }}>
                  <span style={{ background: "#FEF2F2", color: "#DC2626", borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: 600 }}>{f.action}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table></div>
      </div>

      {/* Export options */}
      <div className="admin-export-section" style={{ background: "#0A1628", borderRadius: "14px", padding: "24px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Export Full Report</div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)" }}>Download all reports in PDF or CSV format</div>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button style={{ padding: "10px 20px", background: "#1A73E8", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>📄 PDF Report</button>
          <button style={{ padding: "10px 20px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>📊 CSV Export</button>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-reports-two-col { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AdminLayout>
  );
}
