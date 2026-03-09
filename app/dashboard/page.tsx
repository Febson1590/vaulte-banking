"use client";
import { useState } from "react";
import Link from "next/link";

const transactions = [
  { id: "TX1001", name: "Salary Payment", amount: +5200, type: "credit", date: "Mar 9, 2026", status: "completed", icon: "💰" },
  { id: "TX1002", name: "Netflix Subscription", amount: -15.99, type: "debit", date: "Mar 9, 2026", status: "completed", icon: "🎬" },
  { id: "TX1003", name: "Amazon Purchase", amount: -89.50, type: "debit", date: "Mar 8, 2026", status: "completed", icon: "🛒" },
  { id: "TX1004", name: "International Transfer", amount: -500, type: "debit", date: "Mar 7, 2026", status: "completed", icon: "🌍" },
  { id: "TX1005", name: "Cash Deposit", amount: +1000, type: "credit", date: "Mar 6, 2026", status: "completed", icon: "🏦" },
  { id: "TX1006", name: "Utility Bill", amount: -120, type: "debit", date: "Mar 5, 2026", status: "completed", icon: "💡" },
];

const navItems = [
  { icon: "⊞", label: "Dashboard", href: "/dashboard", active: true },
  { icon: "🏦", label: "Accounts", href: "/dashboard/accounts", active: false },
  { icon: "⇄", label: "Transfer", href: "/dashboard/transfer", active: false },
  { icon: "📋", label: "Transactions", href: "/dashboard/transactions", active: false },
  { icon: "💳", label: "Cards", href: "/dashboard/cards", active: false },
  { icon: "🎯", label: "Savings Goals", href: "/dashboard/savings", active: false },
  { icon: "📑", label: "Loan", href: "/dashboard/loan", active: false },
  { icon: "⚙️", label: "Settings", href: "/dashboard/settings", active: false },
];

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F8FAFC" }}>

      {/* Sidebar */}
      <aside style={{
        width: 240, background: "#0F172A", display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: sidebarOpen ? 0 : "-240px", height: "100vh",
        transition: "left 0.3s ease", zIndex: 100, flexShrink: 0,
      }} className="sidebar">
        {/* Logo */}
        <div style={{ padding: "24px 20px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 34, height: 34, background: "#1A73E8", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 4h14l-5 6v5l-4-2V10L3 4z" fill="white" /></svg>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>Vaulte</span>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", overflowY: "auto" }}>
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 12,
              padding: "11px 12px", borderRadius: 10, marginBottom: 4,
              textDecoration: "none",
              background: item.active ? "rgba(26,115,232,0.15)" : "transparent",
              color: item.active ? "#60A5FA" : "rgba(255,255,255,0.55)",
              fontWeight: item.active ? 600 : 400, fontSize: 14,
              transition: "all 0.2s",
              borderLeft: item.active ? "3px solid #1A73E8" : "3px solid transparent",
            }}
              onMouseEnter={(e) => { if (!item.active) { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "#fff"; } }}
              onMouseLeave={(e) => { if (!item.active) { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; } }}
            >
              <span style={{ fontSize: 16 }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User */}
        <div style={{ padding: "16px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 10, background: "rgba(255,255,255,0.04)" }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1A73E8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>SF</div>
            <div style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Samson Febaide</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Personal Account</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, marginLeft: 240, display: "flex", flexDirection: "column", minHeight: "100vh" }} className="main-content">

        {/* Top Bar */}
        <header style={{
          background: "#fff", borderBottom: "1px solid #E5E7EB",
          padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hamburger" style={{ display: "none", background: "none", border: "none", cursor: "pointer", padding: 4 }}>
              <div style={{ width: 22, height: 2, background: "#0F172A", marginBottom: 4, borderRadius: 2 }} />
              <div style={{ width: 22, height: 2, background: "#0F172A", marginBottom: 4, borderRadius: 2 }} />
              <div style={{ width: 22, height: 2, background: "#0F172A", borderRadius: 2 }} />
            </button>
            <div>
              <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A" }}>Good evening, Samson 👋</h1>
              <p style={{ fontSize: 13, color: "#9CA3AF" }}>Monday, March 9, 2026</p>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button style={{ position: "relative", background: "#F8FAFC", border: "1px solid #E5E7EB", borderRadius: 10, width: 40, height: 40, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
              🔔
              <span style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, background: "#EF4444", borderRadius: "50%", border: "2px solid #fff" }} />
            </button>
            <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#1A73E8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer" }}>SF</div>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: "28px" }}>

          {/* Balance Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 28 }}>

            {/* Total Balance */}
            <div style={{
              background: "linear-gradient(135deg, #0F172A, #1e3a6e)",
              borderRadius: 16, padding: "24px", gridColumn: "span 2", position: "relative", overflow: "hidden",
            }}>
              <div style={{ position: "absolute", top: -20, right: -20, width: 120, height: 120, background: "rgba(26,115,232,0.2)", borderRadius: "50%", filter: "blur(30px)" }} />
              <div style={{ position: "relative" }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 6 }}>Total Balance</p>
                <p style={{ fontSize: 38, fontWeight: 900, color: "#fff", letterSpacing: "-1px", marginBottom: 12 }}>$24,580.00</p>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E", padding: "3px 10px", borderRadius: 999, fontSize: 12, fontWeight: 600 }}>↑ +12.5% this month</span>
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>Account: 1004 5678 9012</span>
                </div>
              </div>
            </div>

            {/* Checking */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "22px", border: "1.5px solid #E5E7EB" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, background: "#EFF6FF", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>🏦</div>
                <span style={{ fontSize: 12, color: "#22C55E", fontWeight: 600, background: "#F0FDF4", padding: "3px 10px", borderRadius: 999 }}>Active</span>
              </div>
              <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 4 }}>Checking Account</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: "#0F172A" }}>$18,340.00</p>
            </div>

            {/* Savings */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "22px", border: "1.5px solid #E5E7EB" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div style={{ width: 40, height: 40, background: "#F0FDF4", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>💰</div>
                <span style={{ fontSize: 12, color: "#22C55E", fontWeight: 600, background: "#F0FDF4", padding: "3px 10px", borderRadius: 999 }}>Active</span>
              </div>
              <p style={{ fontSize: 12, color: "#9CA3AF", marginBottom: 4 }}>Savings Account</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: "#0F172A" }}>$6,240.00</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div style={{ background: "#fff", borderRadius: 16, padding: "22px", border: "1.5px solid #E5E7EB", marginBottom: 24 }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 16 }}>Quick Actions</p>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {[
                { icon: "↑", label: "Send Money", color: "#1A73E8", bg: "#EFF6FF" },
                { icon: "↓", label: "Receive", color: "#22C55E", bg: "#F0FDF4" },
                { icon: "💳", label: "My Card", color: "#8B5CF6", bg: "#F5F3FF" },
                { icon: "📋", label: "Statement", color: "#F59E0B", bg: "#FFFBEB" },
                { icon: "🎯", label: "Save Goal", color: "#0EA5E9", bg: "#F0F9FF" },
                { icon: "📑", label: "Get Loan", color: "#EF4444", bg: "#FEF2F2" },
              ].map((a) => (
                <button key={a.label} style={{
                  display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                  padding: "14px 20px", borderRadius: 12, background: a.bg,
                  border: "none", cursor: "pointer", transition: "transform 0.2s",
                  minWidth: 80,
                }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "translateY(-2px)")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "translateY(0)")}
                >
                  <span style={{ fontSize: 20, color: a.color }}>{a.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#374151", whiteSpace: "nowrap" }}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Bottom Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 20 }}>

            {/* Recent Transactions */}
            <div style={{ background: "#fff", borderRadius: 16, padding: "22px", border: "1.5px solid #E5E7EB" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Recent Transactions</p>
                <Link href="/dashboard/transactions" style={{ fontSize: 13, color: "#1A73E8", fontWeight: 600, textDecoration: "none" }}>View all →</Link>
              </div>
              <div>
                {transactions.map((tx, i) => (
                  <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: i < transactions.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                        background: tx.type === "credit" ? "#F0FDF4" : "#FEF2F2",
                        display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
                      }}>{tx.icon}</div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 500, color: "#111827" }}>{tx.name}</p>
                        <p style={{ fontSize: 12, color: "#9CA3AF" }}>{tx.date} · {tx.id}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 14, fontWeight: 700, color: tx.type === "credit" ? "#22C55E" : "#EF4444" }}>
                        {tx.type === "credit" ? "+" : ""}${Math.abs(tx.amount).toFixed(2)}
                      </p>
                      <span style={{ fontSize: 11, color: "#22C55E", background: "#F0FDF4", padding: "2px 8px", borderRadius: 999 }}>✓ {tx.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Spending summary */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "22px", border: "1.5px solid #E5E7EB" }}>
                <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 16 }}>Spending This Month</p>
                {[
                  { label: "Shopping", amount: 345, max: 500, color: "#1A73E8" },
                  { label: "Bills", amount: 220, max: 300, color: "#8B5CF6" },
                  { label: "Food", amount: 180, max: 250, color: "#22C55E" },
                  { label: "Transport", amount: 95, max: 150, color: "#F59E0B" },
                ].map((item) => (
                  <div key={item.label} style={{ marginBottom: 14 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{item.label}</span>
                      <span style={{ fontSize: 13, color: "#6B7280" }}>${item.amount} / ${item.max}</span>
                    </div>
                    <div style={{ height: 6, background: "#F3F4F6", borderRadius: 3 }}>
                      <div style={{ height: "100%", width: `${(item.amount / item.max) * 100}%`, background: item.color, borderRadius: 3, transition: "width 0.5s" }} />
                    </div>
                  </div>
                ))}
              </div>

              {/* Savings Goal */}
              <div style={{ background: "linear-gradient(135deg, #1A73E8, #0F172A)", borderRadius: 16, padding: "22px" }}>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>Savings Goal</p>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 12 }}>🚗 Buy a Car</p>
                <p style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 4 }}>$2,300 <span style={{ fontSize: 14, fontWeight: 400, color: "rgba(255,255,255,0.5)" }}>/ $10,000</span></p>
                <div style={{ height: 8, background: "rgba(255,255,255,0.15)", borderRadius: 4, marginBottom: 8 }}>
                  <div style={{ height: "100%", width: "23%", background: "#22C55E", borderRadius: 4 }} />
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>23% complete</p>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @media (min-width: 769px) {
          .sidebar { left: 0 !important; }
        }
        @media (max-width: 768px) {
          .main-content { margin-left: 0 !important; }
          .hamburger { display: flex !important; flex-direction: column; }
        }
        @media (max-width: 640px) {
          main > div:last-child { grid-template-columns: 1fr !important; }
          main > div:first-child > div:first-child { grid-column: span 1 !important; }
        }
      `}</style>
    </div>
  );
}
