"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

// ── Nav items ────────────────────────────────────────────────
const navItems = [
  { icon: "🏠", label: "Dashboard",        href: "/admin/dashboard",            active: true  },
  { icon: "👥", label: "Users",             href: "/admin/users"                               },
  { icon: "🪪", label: "KYC",               href: "/admin/kyc"                                 },
  { icon: "💸", label: "Transactions",      href: "/admin/transactions"                        },
  { icon: "🏦", label: "Accounts",          href: "/admin/accounts"                            },
  { icon: "✅", label: "Approvals",          href: "/admin/approvals"                           },
  { icon: "📊", label: "Reports",           href: "/admin/reports"                             },
  { icon: "⚙️", label: "Settings",          href: "/admin/settings"                            },
  { icon: "📋", label: "Audit Logs",        href: "/admin/audit-logs"                          },
  { icon: "🔧", label: "TX Generator",      href: "/admin/transaction-generator"               },
];

// Hardcoded placeholder audit log (not stored in Redis yet)
const auditLog = [
  { admin: "Admin1",      action: "Approved KYC",           target: "Registered user", time: "14:32" },
  { admin: "Admin2",      action: "Froze Account",           target: "Registered user", time: "15:10" },
  { admin: "Admin1",      action: "Manual Credit +$500",     target: "Registered user", time: "15:45" },
  { admin: "Super Admin", action: "Changed Transfer Limit",  target: "System",          time: "16:00" },
];

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Completed: { bg: "#ECFDF5", color: "#059669" },
    Pending:   { bg: "#FFFBEB", color: "#D97706" },
    Flagged:   { bg: "#FEF2F2", color: "#DC2626" },
    Active:    { bg: "#ECFDF5", color: "#059669" },
    Frozen:    { bg: "#EFF6FF", color: "#2563EB" },
    Failed:    { bg: "#FEF2F2", color: "#DC2626" },
  };
  const s = map[status] || { bg: "#F3F4F6", color: "#6B7280" };
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: 600 }}>
      {status}
    </span>
  );
}

// ── Types for stats API response ─────────────────────────────
interface LiveStats {
  totalUsers:       number;
  totalAccounts:    number;
  totalAUM:         number;
  pendingKYC:       number;
  totalTransactions: number;
  unverifiedUsers:  number;
}
interface RecentTx       { ref: string; user: string; type: string; amount: string; status: string; time: string; }
interface RecentKYCItem  { user: string; doc: string; submitted: string; status: string; }

// ── Page ─────────────────────────────────────────────────────
export default function AdminDashboard() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [loading,     setLoading]     = useState(true);
  const [liveStats,   setLiveStats]   = useState<LiveStats>({
    totalUsers: 0, totalAccounts: 0, totalAUM: 0,
    pendingKYC: 0, totalTransactions: 0, unverifiedUsers: 0,
  });
  const [recentTransactions, setRecentTx]  = useState<RecentTx[]>([]);
  const [recentKYC,          setRecentKYC] = useState<RecentKYCItem[]>([]);

  // Fetch all stats from Redis — no localStorage touches at all
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const res  = await fetch("/api/admin/stats");
        const data = await res.json();
        if (data.success) {
          setLiveStats({
            totalUsers:        data.totalUsers        ?? 0,
            totalAccounts:     data.totalAccounts     ?? 0,
            totalAUM:          data.totalAUM          ?? 0,
            pendingKYC:        data.pendingKYC        ?? 0,
            totalTransactions: data.totalTransactions ?? 0,
            unverifiedUsers:   data.unverifiedUsers   ?? 0,
          });
          setRecentTx(data.recentTransactions  ?? []);
          setRecentKYC(data.recentKYC           ?? []);
        }
      } catch (e) {
        console.error("[AdminDashboard] Failed to fetch stats:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const stats = [
    { label: "Registered Users",   value: liveStats.totalUsers.toString(),       change: "Real accounts",    icon: "👥", color: "#1A73E8", bg: "#EEF4FF" },
    { label: "Total Accounts",     value: liveStats.totalAccounts.toString(),     change: "Across all users", icon: "🏦", color: "#059669", bg: "#ECFDF5" },
    { label: "Total Transactions", value: liveStats.totalTransactions.toString(), change: "All time",         icon: "💸", color: "#7C3AED", bg: "#F5F3FF" },
    {
      label: "Total AUM",
      value: `$${liveStats.totalAUM.toLocaleString("en-US", { maximumFractionDigits: 0 })}`,
      change: "Across accounts", icon: "💰", color: "#D97706", bg: "#FFFBEB",
    },
    {
      label: "Pending KYC",
      value: liveStats.pendingKYC.toString(),
      change: liveStats.pendingKYC > 0 ? "Needs review" : "All clear",
      icon: "🪪", color: "#DC2626", bg: "#FEF2F2",
    },
    {
      label: "Unverified Users",
      value: liveStats.unverifiedUsers.toString(),
      change: "Not submitted", icon: "⏳", color: "#EA580C", bg: "#FFF7ED",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("vaulte_admin");
    router.push("/admin/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Inter, sans-serif", background: "#F1F5F9" }}>
      {/* Mobile sidebar backdrop */}
      <div className={`admin-sidebar-backdrop${sidebarOpen ? " open" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`} style={{
        width: sidebarOpen ? "240px" : "64px",
        background: "#0A1628",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s",
        flexShrink: 0,
        position: "sticky",
        top: 0,
        height: "100vh",
        overflowY: "auto",
      }}>
        {/* Logo */}
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px 10px", flexShrink: 0 }}>
            <Image src="/logo.png" alt="Vaulte" width={70} height={20} style={{ objectFit: "contain" }} />
          </div>
          {sidebarOpen && (
            <div>
              <div style={{ fontSize: "10px", color: "#FFC107", fontWeight: 700, letterSpacing: "1px" }}>ADMIN PANEL</div>
            </div>
          )}
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 8px" }}>
          {navItems.map(item => (
            <Link key={item.href} href={item.href}
              style={{
                display: "flex", alignItems: "center", gap: "12px",
                padding: "10px 12px", borderRadius: "10px", marginBottom: "4px",
                background: item.active ? "rgba(26,115,232,0.2)" : "transparent",
                borderLeft: item.active ? "3px solid #1A73E8" : "3px solid transparent",
                color: item.active ? "#fff" : "rgba(255,255,255,0.6)",
                textDecoration: "none", fontSize: "14px", fontWeight: item.active ? 600 : 400,
                transition: "all 0.2s",
              }}>
              <span style={{ fontSize: "18px", flexShrink: 0 }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div style={{ padding: "16px 8px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "10px", background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", width: "100%", fontSize: "14px" }}>
            <span style={{ fontSize: "18px" }}>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Top bar */}
        <header className="admin-header" style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#6B7280" }}>☰</button>
            <div>
              <span style={{ fontSize: "18px", fontWeight: 700, color: "#0A1628" }}>Dashboard</span>
              <span style={{ fontSize: "13px", color: "#9CA3AF", marginLeft: "12px" }}>Welcome back, Super Admin</span>
            </div>
          </div>
          <div className="admin-header-right" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "#FEF2F2", color: "#DC2626", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: 600 }}>
              🔴 3 Alerts
            </div>
            <div className="admin-header-user" style={{ background: "#EEF4FF", borderRadius: "8px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#1A73E8", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: 700 }}>SA</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#0A1628" }}>Super Admin</div>
                <div style={{ fontSize: "11px", color: "#6B7280" }}>admin@vaulte.com</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="admin-content" style={{ flex: 1, padding: "28px 24px", overflowY: "auto" }}>

          {/* Loading spinner */}
          {loading && (
            <div style={{ textAlign: "center", padding: "60px", color: "#6B7280" }}>
              <div style={{ width: 40, height: 40, border: "3px solid #1A73E8", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
              <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
              <p style={{ fontSize: "14px" }}>Loading live stats from server…</p>
            </div>
          )}

          {!loading && (
            <>
              {/* Stats Grid */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px", marginBottom: "28px" }}>
                {stats.map(stat => (
                  <div key={stat.label} style={{
                    background: "#fff", borderRadius: "16px", padding: "20px 22px",
                    boxShadow: "0 1px 3px rgba(10,22,40,0.06), 0 4px 16px rgba(10,22,40,0.06)",
                    border: "1px solid rgba(10,22,40,0.06)",
                    borderLeft: `4px solid ${stat.color}`,
                    transition: "transform 0.18s, box-shadow 0.18s",
                    cursor: "default",
                  }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 8px rgba(10,22,40,0.08), 0 12px 28px rgba(10,22,40,0.10)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 1px 3px rgba(10,22,40,0.06), 0 4px 16px rgba(10,22,40,0.06)"; }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "14px" }}>
                      <div style={{ width: "44px", height: "44px", borderRadius: "12px", background: stat.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", boxShadow: `0 2px 8px ${stat.color}22` }}>{stat.icon}</div>
                      <div style={{ display: "flex", alignItems: "center", gap: 5, background: stat.bg, border: `1px solid ${stat.color}33`, borderRadius: "20px", padding: "3px 10px" }}>
                        <div style={{ width: 6, height: 6, borderRadius: "50%", background: stat.color, animation: "livePulse 2s ease-in-out infinite" }} />
                        <span style={{ fontSize: "10.5px", color: stat.color, fontWeight: 700, letterSpacing: "0.04em" }}>LIVE</span>
                      </div>
                    </div>
                    <div style={{ fontSize: "28px", fontWeight: 800, color: "#0A1628", marginBottom: "2px", letterSpacing: "-0.5px", lineHeight: 1 }}>{loading ? "—" : stat.value}</div>
                    <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#374151", marginTop: "6px" }}>{stat.label}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: "6px" }}>
                      <span style={{ fontSize: "11px", color: stat.color, fontWeight: 600, background: stat.bg, borderRadius: 6, padding: "2px 7px" }}>{stat.change}</span>
                    </div>
                  </div>
                ))}
              </div>
              <style>{`@keyframes livePulse { 0%,100%{opacity:1;} 50%{opacity:0.4;} }`}</style>

              {/* Two column layout */}
              <div className="admin-dash-two-col" style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: "20px", marginBottom: "20px" }}>
                {/* Recent Transactions */}
                <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "18px" }}>
                    <h2 style={{ margin: 0, fontSize: "16px", fontWeight: 700, color: "#0A1628" }}>Recent Transactions</h2>
                    <Link href="/admin/transactions" style={{ fontSize: "13px", color: "#1A73E8", textDecoration: "none", fontWeight: 600 }}>View All →</Link>
                  </div>
                  <div className="admin-table-scroll"><table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid #F3F4F6" }}>
                        {["Ref ID", "User", "Type", "Amount", "Status", "Time"].map(h => (
                          <th key={h} style={{ padding: "8px 12px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase" }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentTransactions.length === 0 ? (
                        <tr><td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "#9CA3AF", fontSize: "13px" }}>No transactions yet — they will appear here once users start transacting.</td></tr>
                      ) : recentTransactions.map(tx => (
                        <tr key={tx.ref} style={{ borderBottom: "1px solid #F9FAFB" }}>
                          <td style={{ padding: "12px", fontSize: "13px", fontWeight: 600, color: "#1A73E8" }}>{tx.ref}</td>
                          <td style={{ padding: "12px", fontSize: "13px", color: "#374151" }}>{tx.user}</td>
                          <td style={{ padding: "12px", fontSize: "13px", color: "#6B7280" }}>{tx.type}</td>
                          <td style={{ padding: "12px", fontSize: "13px", fontWeight: 600, color: "#0A1628" }}>{tx.amount}</td>
                          <td style={{ padding: "12px" }}><StatusBadge status={tx.status} /></td>
                          <td style={{ padding: "12px", fontSize: "12px", color: "#9CA3AF" }}>{tx.time}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table></div>
                </div>

                {/* Right column */}
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  {/* Pending Overview */}
                  <div style={{ background: "#fff", borderRadius: "16px", padding: "0", boxShadow: "0 1px 3px rgba(10,22,40,0.06), 0 4px 16px rgba(10,22,40,0.06)", border: "1px solid rgba(10,22,40,0.06)", overflow: "hidden" }}>
                    {/* Header */}
                    <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #F3F4F6" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 10, background: "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🪪</div>
                          <div>
                            <h2 style={{ margin: 0, fontSize: "14px", fontWeight: 700, color: "#0A1628", lineHeight: 1.2 }}>Pending Overview</h2>
                            <p style={{ margin: 0, fontSize: "11px", color: "#9CA3AF", marginTop: 2 }}>KYC verification queue</p>
                          </div>
                        </div>
                        <Link href="/admin/kyc" style={{ fontSize: "12px", color: "#1A73E8", textDecoration: "none", fontWeight: 600, background: "#EEF4FF", padding: "4px 10px", borderRadius: 8 }}>View All →</Link>
                      </div>
                      {/* KYC status breakdown */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {[
                          { label: "Pending Review", value: liveStats.pendingKYC, color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", icon: "⏳" },
                          { label: "Unverified",     value: liveStats.unverifiedUsers, color: "#EA580C", bg: "#FFF7ED", border: "#FED7AA", icon: "◎" },
                          { label: "Total Users",    value: liveStats.totalUsers,   color: "#1A73E8", bg: "#EEF4FF", border: "#BFDBFE", icon: "👥" },
                          { label: "Verified",       value: Math.max(0, liveStats.totalUsers - liveStats.pendingKYC - liveStats.unverifiedUsers), color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", icon: "✓" },
                        ].map(item => (
                          <div key={item.label} style={{ background: item.bg, border: `1px solid ${item.border}`, borderRadius: 10, padding: "10px 12px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                              <span style={{ fontSize: 12 }}>{item.icon}</span>
                              <span style={{ fontSize: 10.5, color: item.color, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{item.label}</span>
                            </div>
                            <div style={{ fontSize: "22px", fontWeight: 800, color: "#0A1628", letterSpacing: "-0.5px", lineHeight: 1 }}>{loading ? "—" : item.value}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Recent KYC submissions */}
                    <div style={{ padding: "14px 20px 16px" }}>
                      <p style={{ fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 10 }}>Recent Submissions</p>
                      {recentKYC.length === 0 ? (
                        <div style={{ padding: "16px", textAlign: "center", background: "#F8FAFC", borderRadius: 10, border: "1px dashed #E2E8F0" }}>
                          <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: 3 }}>All clear</div>
                          <div style={{ fontSize: "11.5px", color: "#9CA3AF" }}>No pending KYC submissions</div>
                        </div>
                      ) : recentKYC.map((k, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: i < recentKYC.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                          <div style={{ width: 30, height: 30, borderRadius: 8, background: "#EEF4FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>🪪</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: "13px", fontWeight: 600, color: "#0A1628", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{k.user}</div>
                            <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: 1 }}>{k.doc} · {k.submitted}</div>
                          </div>
                          <StatusBadge status={k.status} />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Audit Log */}
                  <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                      <h2 style={{ margin: 0, fontSize: "15px", fontWeight: 700, color: "#0A1628" }}>📋 Audit Log</h2>
                      <Link href="/admin/audit-logs" style={{ fontSize: "12px", color: "#1A73E8", textDecoration: "none" }}>View All</Link>
                    </div>
                    {auditLog.map((log, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "8px 0", borderBottom: i < auditLog.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                        <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#EEF4FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: 700, color: "#1A73E8", flexShrink: 0 }}>
                          {log.admin[0]}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: "12px", fontWeight: 600, color: "#0A1628" }}>{log.action}</div>
                          <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{log.admin} → {log.target}</div>
                        </div>
                        <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{log.time}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <h2 style={{ margin: "0 0 16px", fontSize: "16px", fontWeight: 700, color: "#0A1628" }}>Quick Actions</h2>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
                  {[
                    { label: "Review KYC",          href: "/admin/kyc",                    icon: "🪪", color: "#1A73E8" },
                    { label: "Approve Withdrawals", href: "/admin/approvals",               icon: "✅", color: "#059669" },
                    { label: "Flag Transaction",    href: "/admin/transactions",            icon: "🚩", color: "#DC2626" },
                    { label: "Freeze Account",      href: "/admin/users",                  icon: "❄️", color: "#2563EB" },
                    { label: "Generate TX History", href: "/admin/transaction-generator",  icon: "🔧", color: "#7C3AED" },
                    { label: "View Reports",        href: "/admin/reports",                icon: "📊", color: "#D97706" },
                  ].map(action => (
                    <Link key={action.href} href={action.href}
                      style={{ display: "flex", alignItems: "center", gap: "8px", padding: "10px 16px", background: "#F8FAFC", border: "1.5px solid #E5E7EB", borderRadius: "10px", textDecoration: "none", color: "#374151", fontSize: "13px", fontWeight: 600, transition: "all 0.2s" }}>
                      <span>{action.icon}</span> {action.label}
                    </Link>
                  ))}
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
