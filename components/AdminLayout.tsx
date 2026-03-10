"use client";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

const navItems = [
  { icon: "🏠", label: "Dashboard", href: "/admin/dashboard" },
  { icon: "👥", label: "Users", href: "/admin/users" },
  { icon: "🪪", label: "KYC", href: "/admin/kyc" },
  { icon: "💸", label: "Transactions", href: "/admin/transactions" },
  { icon: "🏦", label: "Accounts", href: "/admin/accounts" },
  { icon: "✅", label: "Approvals", href: "/admin/approvals" },
  { icon: "📊", label: "Reports", href: "/admin/reports" },
  { icon: "⚙️", label: "Settings", href: "/admin/settings" },
  { icon: "📋", label: "Audit Logs", href: "/admin/audit-logs" },
  { icon: "🔧", label: "TX Generator", href: "/admin/transaction-generator" },
];

export default function AdminLayout({ children, title }: { children: React.ReactNode; title: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("vaulte_admin");
    router.push("/admin/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", fontFamily: "Inter, sans-serif", background: "#F1F5F9" }}>
      {/* Sidebar */}
      <aside style={{
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
        overflowX: "hidden",
      }}>
        <div style={{ padding: "20px 16px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ background: "rgba(255,255,255,0.1)", borderRadius: "8px", padding: "6px 10px", flexShrink: 0 }}>
            <Image src="/logo.png" alt="Vaulte" width={70} height={20} style={{ objectFit: "contain" }} />
          </div>
          {sidebarOpen && <div style={{ fontSize: "10px", color: "#FFC107", fontWeight: 700, letterSpacing: "1px", whiteSpace: "nowrap" }}>ADMIN PANEL</div>}
        </div>

        <nav style={{ flex: 1, padding: "16px 8px" }}>
          {navItems.map(item => {
            const active = pathname === item.href;
            return (
              <Link key={item.href} href={item.href}
                style={{
                  display: "flex", alignItems: "center", gap: "12px",
                  padding: "10px 12px", borderRadius: "10px", marginBottom: "4px",
                  background: active ? "rgba(26,115,232,0.2)" : "transparent",
                  borderLeft: active ? "3px solid #1A73E8" : "3px solid transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.6)",
                  textDecoration: "none", fontSize: "14px", fontWeight: active ? 600 : 400,
                  whiteSpace: "nowrap", overflow: "hidden",
                }}>
                <span style={{ fontSize: "18px", flexShrink: 0 }}>{item.icon}</span>
                {sidebarOpen && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: "16px 8px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
          <button onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", borderRadius: "10px", background: "none", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", width: "100%", fontSize: "14px", whiteSpace: "nowrap" }}>
            <span style={{ fontSize: "18px", flexShrink: 0 }}>🚪</span>
            {sidebarOpen && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <header style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "0 24px", height: "64px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <button onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px", color: "#6B7280" }}>☰</button>
            <span style={{ fontSize: "18px", fontWeight: 700, color: "#0A1628" }}>{title}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ background: "#FEF2F2", color: "#DC2626", borderRadius: "20px", padding: "4px 12px", fontSize: "12px", fontWeight: 600 }}>🔴 3 Alerts</div>
            <div style={{ background: "#EEF4FF", borderRadius: "8px", padding: "6px 12px", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#1A73E8", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "12px", fontWeight: 700 }}>SA</div>
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#0A1628" }}>Super Admin</div>
                <div style={{ fontSize: "11px", color: "#6B7280" }}>admin@vaulte.com</div>
              </div>
            </div>
          </div>
        </header>

        <main style={{ flex: 1, padding: "28px 24px", overflowY: "auto" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
