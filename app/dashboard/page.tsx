"use client";
import { useState } from "react";
import Link from "next/link";

const transactions = [
  { id: 1, name: "Bitcoin Purchase", sub: "Crypto.com", amount: -500, type: "debit", icon: "₿", iconBg: "#F59E0B", iconColor: "#fff" },
  { id: 2, name: "ATM Withdrawal", sub: "Chase Bank", amount: -200, type: "debit", icon: "🏧", iconBg: "#EFF6FF", iconColor: "#1A73E8" },
  { id: 3, name: "Transfer Received", sub: "From Sarah L.", amount: 1000, type: "credit", icon: "↗", iconBg: "#F0FDF4", iconColor: "#22C55E" },
];

const currencies = [
  { flag: "🇺🇸", code: "USD", balance: "$5,240.00" },
  { flag: "🇪🇺", code: "EUR", balance: "€3,200.00" },
  { flag: "🇬🇧", code: "GBP", balance: "£2,150.00" },
  { flag: "₿", code: "BTC", balance: "0.184 BTC", sub: "($1,215.75)" },
];

const navItems = [
  { icon: "🏠", label: "Dashboard", href: "/dashboard", active: true },
  { icon: "💼", label: "Accounts", href: "/dashboard/accounts" },
  { icon: "⇄", label: "Transfers", href: "/dashboard/transfer" },
  { icon: "💳", label: "Cards", href: "/dashboard/cards" },
  { icon: "⚙️", label: "Settings", href: "/dashboard/settings", hasArrow: true },
];

const quickContacts = [
  { name: "Sarah", initials: "SL", color: "#1A73E8" },
  { name: "Alex", initials: "AM", color: "#0F172A" },
  { name: "Emma", initials: "EW", color: "#6B7280" },
];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const tabs = ["Dashboard", "Accounts", "Transfers", "Cards", "Help"];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#EEF4FF", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside style={{
        width: 220, background: "#1A73E8", display: "flex", flexDirection: "column",
        position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100, flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: "24px 20px 20px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
            <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.2)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none"><path d="M3 4h14l-5 6v5l-4-2V10L3 4z" fill="white" /></svg>
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Vaulte</span>
          </Link>
        </div>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: "8px 12px" }}>
          {navItems.map((item) => (
            <Link key={item.label} href={item.href} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "11px 12px", borderRadius: 10, marginBottom: 2,
              textDecoration: "none",
              background: item.active ? "rgba(255,255,255,0.2)" : "transparent",
              color: "#fff",
              transition: "background 0.2s",
            }}
              onMouseEnter={(e) => { if (!item.active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={(e) => { if (!item.active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 16 }}>{item.icon}</span>
                <span style={{ fontSize: 14, fontWeight: item.active ? 700 : 500 }}>{item.label}</span>
              </div>
              {item.hasArrow && <span style={{ fontSize: 12, opacity: 0.7 }}>›</span>}
            </Link>
          ))}
        </nav>

        {/* Balance section */}
        <div style={{ margin: "0 12px 12px", background: "rgba(255,255,255,0.15)", borderRadius: 14, padding: "16px" }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>Your Balance</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 2 }}>$12,540.75</p>
          <p style={{ fontSize: 12, color: "#4ADE80", marginBottom: 14 }}>▲ +$256.00 Today</p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {currencies.map((c) => (
              <div key={c.code} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ fontSize: 14 }}>{c.flag}</span>
                  <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{c.code}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{c.balance}</p>
                  {c.sub && <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{c.sub}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <div style={{ padding: "0 12px 20px" }}>
          <button style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%",
            padding: "10px 12px", borderRadius: 10, background: "transparent",
            border: "none", color: "rgba(255,255,255,0.7)", fontSize: 14, cursor: "pointer",
            transition: "background 0.2s",
          }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)")}
            onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "transparent")}
          >
            <span style={{ fontSize: 16 }}>💬</span> Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div style={{ flex: 1, marginLeft: 220, display: "flex", flexDirection: "column" }}>

        {/* Top Bar */}
        <header style={{
          background: "#fff", borderBottom: "1px solid #E5E7EB",
          padding: "0 28px", height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          {/* Search */}
          <div style={{ position: "relative", width: 320 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", fontSize: 16 }}>🔍</span>
            <input placeholder="Search Markets..." style={{
              width: "100%", padding: "10px 14px 10px 40px", borderRadius: 20,
              border: "1.5px solid #E5E7EB", fontSize: 14, color: "#111827",
              background: "#F9FAFB", outline: "none", boxSizing: "border-box",
            }}
              onFocus={(e) => (e.target.style.borderColor = "#1A73E8")}
              onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
            />
          </div>

          {/* Right: bell, gear, user */}
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#6B7280", position: "relative" }}>
              🔔
              <span style={{ position: "absolute", top: 0, right: 0, width: 8, height: 8, background: "#EF4444", borderRadius: "50%", border: "2px solid #fff" }} />
            </button>
            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 20, color: "#6B7280" }}>⚙️</button>
            <div style={{ display: "flex", alignItems: "center", gap: 10, borderLeft: "1px solid #E5E7EB", paddingLeft: 16 }}>
              <div style={{ width: 38, height: 38, borderRadius: "50%", background: "#1A73E8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff" }}>JD</div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>John Doe</p>
                <p style={{ fontSize: 12, color: "#22C55E", fontWeight: 600 }}>✓ Verified</p>
              </div>
              <button style={{ background: "#F3F4F6", border: "none", borderRadius: 8, width: 28, height: 28, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, color: "#6B7280" }}>▾</button>
            </div>
          </div>
        </header>

        {/* Tab Nav */}
        <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "0 28px", display: "flex", gap: 4 }}>
          {tabs.map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "14px 16px", background: "none", border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: activeTab === tab ? 700 : 500,
              color: activeTab === tab ? "#1A73E8" : "#6B7280",
              borderBottom: activeTab === tab ? "2px solid #1A73E8" : "2px solid transparent",
              transition: "all 0.2s",
            }}>
              {tab}
            </button>
          ))}
        </div>

        {/* Content */}
        <main style={{ flex: 1, padding: "28px 28px" }}>

          {/* Welcome */}
          <div style={{
            background: "linear-gradient(135deg, #EBF5FF 0%, #F0F7FF 60%, #EEF4FF 100%)",
            borderRadius: 16, padding: "28px 32px", marginBottom: 24,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            position: "relative", overflow: "hidden",
          }}>
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "50%", backgroundImage: "radial-gradient(circle at 80% 50%, rgba(26,115,232,0.06) 0%, transparent 60%)", pointerEvents: "none" }} />
            <div>
              <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", marginBottom: 6 }}>
                Welcome back, John Doe 👋
              </h1>
              <p style={{ fontSize: 15, color: "#6B7280" }}>Here&apos;s an overview of your account.</p>
            </div>
            {/* Phone mockup */}
            <div style={{
              width: 130, height: 200, background: "linear-gradient(160deg, #1A73E8, #0F172A)",
              borderRadius: 20, border: "4px solid #0F172A", position: "relative",
              boxShadow: "0 20px 40px rgba(26,115,232,0.25), 0 4px 12px rgba(0,0,0,0.15)",
              flexShrink: 0,
            }}>
              <div style={{ padding: "14px 10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <div style={{ width: 14, height: 14, background: "rgba(255,255,255,0.2)", borderRadius: 3 }} />
                    <span style={{ fontSize: 9, color: "#fff", fontWeight: 700 }}>Vaulte</span>
                  </div>
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.6)" }}>⚙</span>
                </div>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.6)", marginBottom: 2 }}>Balance</p>
                <p style={{ fontSize: 14, fontWeight: 800, color: "#fff", marginBottom: 10 }}>$12,540.75</p>
                {[
                  { label: "$5,240.00", change: "+$200", pos: true },
                  { label: "€3,230.00", change: "-320", pos: false },
                  { label: "£2,150.00", change: "+84.00", pos: true },
                ].map((r, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 8, color: "rgba(255,255,255,0.7)" }}>{r.label}</span>
                    <span style={{ fontSize: 8, color: r.pos ? "#4ADE80" : "#F87171", fontWeight: 600 }}>{r.change}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Two column grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20 }}>

            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Total Balance card */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "24px", border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 6 }}>Total Balance</p>
                <p style={{ fontSize: 36, fontWeight: 900, color: "#0F172A", letterSpacing: "-1px", marginBottom: 4 }}>$12,540.75</p>
                <p style={{ fontSize: 14, color: "#22C55E", fontWeight: 600, marginBottom: 20 }}>▲ +$26.00 Today</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  {/* Action buttons */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button style={{
                        flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #E5E7EB",
                        background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        fontSize: 13, fontWeight: 600, color: "#1A73E8", transition: "all 0.2s",
                      }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EFF6FF"; (e.currentTarget as HTMLElement).style.borderColor = "#1A73E8"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; }}
                      >
                        <span style={{ fontSize: 16 }}>✈️</span> Send Money
                      </button>
                      <button style={{
                        flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #E5E7EB",
                        background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        fontSize: 13, fontWeight: 600, color: "#1A73E8", transition: "all 0.2s",
                      }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EFF6FF"; (e.currentTarget as HTMLElement).style.borderColor = "#1A73E8"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; }}
                      >
                        <span style={{ fontSize: 16 }}>👥</span> Request Money
                      </button>
                    </div>
                    <div style={{ display: "flex", gap: 10 }}>
                      <button style={{
                        flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #E5E7EB",
                        background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        fontSize: 13, fontWeight: 600, color: "#1A73E8", transition: "all 0.2s",
                      }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EFF6FF"; (e.currentTarget as HTMLElement).style.borderColor = "#1A73E8"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; }}
                      >
                        <span style={{ fontSize: 16 }}>⇄</span> Exchange
                      </button>
                      <button style={{
                        flex: 1, padding: "12px", borderRadius: 12, border: "1.5px solid #E5E7EB",
                        background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        fontSize: 13, fontWeight: 600, color: "#1A73E8", transition: "all 0.2s",
                      }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "#EFF6FF"; (e.currentTarget as HTMLElement).style.borderColor = "#1A73E8"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; }}
                      >
                        <span style={{ fontSize: 16 }}>⊕</span> Add Funds
                      </button>
                    </div>
                  </div>

                  {/* Currency breakdown */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {currencies.map((c) => (
                      <div key={c.code} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 18 }}>{c.flag}</span>
                          <span style={{ fontSize: 14, color: "#374151", fontWeight: 500 }}>{c.code}</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{c.balance}</p>
                          {c.sub && <p style={{ fontSize: 11, color: "#9CA3AF" }}>{c.sub}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "22px", border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Recent Transactions</p>
                  <Link href="/dashboard/transactions" style={{ fontSize: 18, color: "#9CA3AF", textDecoration: "none" }}>»</Link>
                </div>
                {transactions.map((tx, i) => (
                  <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: i < transactions.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{
                        width: 42, height: 42, borderRadius: 12, background: tx.iconBg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, fontWeight: 700, color: tx.iconColor, flexShrink: 0,
                      }}>{tx.icon}</div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{tx.name}</p>
                        <p style={{ fontSize: 12, color: "#9CA3AF" }}>{tx.sub}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: tx.type === "credit" ? "#22C55E" : "#EF4444" }}>
                      {tx.type === "credit" ? "+" : "-"}${Math.abs(tx.amount).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Quick Transfers */}
              <div style={{ background: "#fff", borderRadius: 16, padding: "22px", border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 18 }}>Quick Transfers</p>
                <div style={{ display: "flex", gap: 16, marginBottom: 20, justifyContent: "center" }}>
                  {quickContacts.map((c) => (
                    <div key={c.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}>
                      <div style={{
                        width: 54, height: 54, borderRadius: "50%", background: c.color,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 16, fontWeight: 700, color: "#fff",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                        transition: "transform 0.2s",
                      }}
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1.08)")}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.transform = "scale(1)")}
                      >{c.initials}</div>
                      <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{c.name}</span>
                    </div>
                  ))}
                </div>
                <button style={{
                  width: "100%", padding: "14px", borderRadius: 12, border: "none",
                  background: "#1A73E8", color: "#fff", fontSize: 15, fontWeight: 700,
                  cursor: "pointer", transition: "background 0.2s", boxShadow: "0 4px 14px rgba(26,115,232,0.35)",
                }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = "#1557b0")}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = "#1A73E8")}
                >Make a Transfer</button>
              </div>

              {/* My Card */}
              <div style={{
                background: "linear-gradient(135deg, #1A73E8 0%, #0F172A 100%)",
                borderRadius: 16, padding: "22px",
                boxShadow: "0 8px 24px rgba(26,115,232,0.3)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)" }}>Virtual Card</p>
                  <div style={{ display: "flex", gap: -4 }}>
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#EF4444", opacity: 0.9 }} />
                    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#F59E0B", opacity: 0.9, marginLeft: -8 }} />
                  </div>
                </div>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 4, letterSpacing: "0.15em" }}>4532 •••• •••• 4410</p>
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
                  <div>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Card Holder</p>
                    <p style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>John Doe</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Expires</p>
                    <p style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>08/28</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          aside { display: none; }
          .main-wrapper { margin-left: 0 !important; }
          main > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
