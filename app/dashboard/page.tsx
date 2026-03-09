"use client";
import { useState } from "react";
import Link from "next/link";

const currencies = [
  { flag: "🇺🇸", code: "USD", balance: "$5,240.00" },
  { flag: "🇪🇺", code: "EUR", balance: "€3,200.00" },
  { flag: "🇬🇧", code: "GBP", balance: "£2,150.00" },
  { flag: "₿",   code: "BTC", balance: "0,184,75", sub: "($1,215.75)" },
];

const transactions = [
  { icon: "₿", iconBg: "#F59E0B", name: "Bitcoin Purchase", sub: "Crypto.com", amount: "-$500.00", color: "#EF4444" },
  { icon: "🏧", iconBg: "#EFF6FF", name: "ATM Withdrawal", sub: "Chase Bank", amount: "-$200.00", color: "#EF4444" },
  { icon: "↗", iconBg: "#F0FDF4", name: "Transfer Received", sub: "From Sarah L.", amount: "+$1,000.00", color: "#22C55E" },
];

const contacts = [
  { name: "Sarah", initials: "S", bg: "#1A73E8" },
  { name: "Alex",  initials: "A", bg: "#374151" },
  { name: "Emma",  initials: "E", bg: "#6B7280" },
];

const navItems = [
  { icon: "🏠", label: "Dashboard", href: "/dashboard", active: true },
  { icon: "💼", label: "Accounts",  href: "/dashboard/accounts" },
  { icon: "⇄",  label: "Transfers", href: "/dashboard/transfer" },
  { icon: "💳", label: "Cards",     href: "/dashboard/cards" },
  { icon: "⚙️", label: "Settings",  href: "/dashboard/settings", arrow: true },
];

const tabs = ["Dashboard","Accounts","Transfers","Cards","Help"];

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#EEF4FF", fontFamily: "'Inter',sans-serif" }}>

      {/* ── SIDEBAR ── */}
      <aside style={{
        width: 220, background: "#1A73E8", position: "fixed", top: 0, left: 0,
        height: "100vh", display: "flex", flexDirection: "column", zIndex: 100, flexShrink: 0,
      }}>
        {/* Logo */}
        <div style={{ padding: "22px 18px 16px" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 7, textDecoration: "none" }}>
            <div style={{ width: 30, height: 30, background: "rgba(255,255,255,0.22)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none"><path d="M3 4h14l-5 6v5l-4-2V10L3 4z" fill="white" /></svg>
            </div>
            <span style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>Vaulte</span>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ padding: "6px 10px", flex: "0 0 auto" }}>
          {navItems.map(item => (
            <Link key={item.label} href={item.href} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 10px", borderRadius: 8, marginBottom: 2, textDecoration: "none",
              background: item.active ? "rgba(255,255,255,0.22)" : "transparent",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => { if (!item.active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={e => { if (!item.active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ fontSize: 15 }}>{item.icon}</span>
                <span style={{ fontSize: 13.5, fontWeight: item.active ? 700 : 500, color: "#fff" }}>{item.label}</span>
              </div>
              {item.arrow && <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)" }}>›</span>}
            </Link>
          ))}
        </nav>

        {/* Balance section */}
        <div style={{ margin: "auto 10px 0", background: "rgba(0,0,0,0.2)", borderRadius: 12, padding: "16px 12px" }}>
          <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.65)", marginBottom: 4, fontWeight: 500 }}>Your Balance</p>
          <p style={{ fontSize: 20, fontWeight: 900, color: "#fff", letterSpacing: "-0.4px", marginBottom: 2 }}>$12,540.75</p>
          <p style={{ fontSize: 12, color: "#4ADE80", fontWeight: 600, marginBottom: 14 }}>▲ +$256.00 Today</p>
          {currencies.map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: i < currencies.length-1 ? 9 : 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 13 }}>{c.flag}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{c.code}</span>
              </div>
              <div style={{ textAlign: "right" }}>
                <p style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{c.balance}</p>
                {c.sub && <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)" }}>{c.sub}</p>}
              </div>
            </div>
          ))}
        </div>

        {/* Logout */}
        <div style={{ padding: "12px 10px" }}>
          <button style={{
            display: "flex", alignItems: "center", gap: 8, width: "100%",
            padding: "9px 10px", borderRadius: 8, background: "transparent",
            border: "none", color: "rgba(255,255,255,0.7)", fontSize: 13.5, cursor: "pointer", fontFamily: "inherit",
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.1)"}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
          >
            <span style={{ fontSize: 15 }}>💬</span> Logout
          </button>
        </div>
      </aside>

      {/* ── MAIN ── */}
      <div style={{ flex: 1, marginLeft: 220, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Top bar */}
        <header style={{
          background: "#fff", borderBottom: "1px solid #E5E7EB",
          padding: "0 24px", height: 60,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 50,
        }}>
          {/* Search */}
          <div style={{ position: "relative", width: 300 }}>
            <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#9CA3AF" }}>🔍</span>
            <input placeholder="Search Markets..." style={{
              width: "100%", padding: "9px 14px 9px 36px", borderRadius: 20,
              border: "1.5px solid #E5E7EB", fontSize: 13.5, color: "#111827",
              background: "#F9FAFB", outline: "none", boxSizing: "border-box", fontFamily: "inherit",
            }}
              onFocus={e => { e.target.style.borderColor = "#1A73E8"; e.target.style.background = "#fff"; }}
              onBlur={e => { e.target.style.borderColor = "#E5E7EB"; e.target.style.background = "#F9FAFB"; }}
            />
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 19, color: "#6B7280", position: "relative", lineHeight: 1, padding: 4 }}>
              🔔
              <span style={{ position: "absolute", top: 2, right: 2, width: 7, height: 7, background: "#EF4444", borderRadius: "50%", border: "1.5px solid #fff" }} />
            </button>
            <button style={{ background: "none", border: "none", cursor: "pointer", fontSize: 19, color: "#6B7280", padding: 4 }}>⚙️</button>
            <div style={{ width: 1, height: 32, background: "#E5E7EB" }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", overflow: "hidden", background: "#E2E8F0", flexShrink: 0 }}>
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(135deg,#1A73E8,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>JD</div>
              </div>
              <div>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>John Doe</p>
                <p style={{ fontSize: 11.5, color: "#22C55E", fontWeight: 600 }}>✓ Verified</p>
              </div>
              <button style={{ width: 24, height: 24, background: "#F3F4F6", border: "1px solid #E5E7EB", borderRadius: 6, cursor: "pointer", fontSize: 10, color: "#6B7280", display: "flex", alignItems: "center", justifyContent: "center" }}>▾</button>
            </div>
          </div>
        </header>

        {/* Tab nav */}
        <div style={{ background: "#fff", borderBottom: "1px solid #E5E7EB", padding: "0 24px", display: "flex" }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "13px 14px", background: "none", border: "none", cursor: "pointer",
              fontSize: 14, fontWeight: activeTab===tab ? 700 : 500,
              color: activeTab===tab ? "#1A73E8" : "#6B7280",
              borderBottom: activeTab===tab ? "2.5px solid #1A73E8" : "2.5px solid transparent",
              transition: "all 0.18s", fontFamily: "inherit",
            }}>{tab}</button>
          ))}
        </div>

        {/* ── CONTENT ── */}
        <main style={{ flex: 1, padding: "22px 24px", overflowY: "auto" }}>

          {/* Welcome banner */}
          <div style={{
            background: "linear-gradient(135deg,#EBF4FF 0%,#F0F6FF 60%,#EEF4FF 100%)",
            borderRadius: 14, padding: "22px 28px", marginBottom: 20,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            position: "relative", overflow: "hidden", border: "1px solid #DBEAFE",
          }}>
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "55%", background: "radial-gradient(ellipse at 80% 50%,rgba(26,115,232,0.06) 0%,transparent 65%)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginBottom: 5, letterSpacing: "-0.4px" }}>
                Welcome back, John Doe 👋
              </h1>
              <p style={{ fontSize: 14, color: "#6B7280" }}>Here&apos;s an overview of your account.</p>
            </div>
            {/* Phone mockup */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              {/* Coin decorations */}
              <div style={{ position: "absolute", top: -14, right: 120, fontSize: 28, filter: "drop-shadow(0 6px 12px rgba(245,158,11,0.4))", transform: "rotate(8deg)", pointerEvents: "none" }}>🪙</div>
              <div style={{ position: "absolute", top: -6, right: 80, fontSize: 20, filter: "drop-shadow(0 4px 8px rgba(245,158,11,0.3))", transform: "rotate(-5deg)", pointerEvents: "none" }}>🪙</div>
              {/* Card decoration */}
              <div style={{ position: "absolute", bottom: -8, left: -40, width: 80, height: 50, background: "linear-gradient(135deg,#1A73E8,#0F172A)", borderRadius: 8, transform: "rotate(-6deg)", boxShadow: "0 4px 12px rgba(26,115,232,0.3)", zIndex: 0 }} />
              {/* Phone */}
              <div style={{
                width: 110, height: 200, background: "#0F172A", borderRadius: 22, border: "5px solid #0F172A",
                boxShadow: "0 20px 40px rgba(15,23,42,0.3)", position: "relative", overflow: "hidden", zIndex: 1,
              }}>
                <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 36, height: 7, background: "#0F172A", borderRadius: "0 0 6px 6px", zIndex: 5 }} />
                <div style={{ background: "linear-gradient(160deg,#1A73E8 0%,#0c2d7a 100%)", height: "100%", padding: "14px 8px 8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ width: 12, height: 12, background: "rgba(255,255,255,0.25)", borderRadius: 3 }} />
                    <span style={{ fontSize: 7, fontWeight: 800, color: "#fff" }}>Vaulte</span>
                    <span style={{ fontSize: 7, color: "rgba(255,255,255,0.5)" }}>⚙</span>
                  </div>
                  <p style={{ fontSize: 7, color: "rgba(255,255,255,0.6)", marginBottom: 1 }}>Balance</p>
                  <p style={{ fontSize: 13, fontWeight: 900, color: "#fff", marginBottom: 8 }}>$12,540.75</p>
                  {[["$5,240","+$5,200",true],["€3,230","-320",false],["£2,150","+84",true],["₿0.184","$1,215",true]].map(([a,b,pos],i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 7, color: "rgba(255,255,255,0.75)" }}>{a}</span>
                      <span style={{ fontSize: 7, fontWeight: 700, color: pos?"#4ADE80":"#F87171" }}>{b}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 6, display: "flex", justifyContent: "space-around" }}>
                    {["🏠","💼","⇄","🛡️"].map((ic,i) => <span key={i} style={{ fontSize: 9 }}>{ic}</span>)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two-column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 18 }}>

            {/* LEFT column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Total Balance card */}
              <div style={{ background: "#fff", borderRadius: 14, padding: "22px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid #E5E7EB" }}>
                <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 5 }}>Total Balance</p>
                <p style={{ fontSize: 34, fontWeight: 900, color: "#0F172A", letterSpacing: "-1px", marginBottom: 4 }}>$12,540.75</p>
                <p style={{ fontSize: 13.5, color: "#22C55E", fontWeight: 700, marginBottom: 20 }}>▲ +$26.00 Today</p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  {/* Action buttons */}
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 9 }}>
                      {[
                        { icon: "✈️", label: "Send\nMoney" },
                        { icon: "👥", label: "Request\nMoney" },
                        { icon: "⇄", label: "Exchange" },
                        { icon: "⊕", label: "Add Funds" },
                      ].map(a => (
                        <button key={a.label} style={{
                          padding: "12px 8px", borderRadius: 10, border: "1.5px solid #E5E7EB",
                          background: "#fff", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
                          fontSize: 12, fontWeight: 600, color: "#1A73E8", transition: "all 0.18s", fontFamily: "inherit",
                          whiteSpace: "pre-line", textAlign: "center",
                        }}
                          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#EFF6FF"; (e.currentTarget as HTMLElement).style.borderColor = "#1A73E8"; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; }}
                        >
                          <span style={{ fontSize: 18 }}>{a.icon}</span>
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Currency breakdown */}
                  <div style={{ borderLeft: "1px solid #F3F4F6", paddingLeft: 20 }}>
                    {[
                      { flag:"🇺🇸", code:"USD", balance:"$5,240.00" },
                      { flag:"🇪🇺", code:"EUR", balance:"€3,200.00" },
                      { flag:"🇬🇧", code:"GBP", balance:"£2,150.00" },
                      { flag:"₿",   code:"BTC", balance:"0.184 BTC", sub:"($1,215.75)" },
                    ].map((c,i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: i<3?"1px solid #F8FAFC":"none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 18 }}>{c.flag}</span>
                          <span style={{ fontSize: 14, color: "#374151", fontWeight: 600 }}>{c.code}</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#0F172A" }}>{c.balance}</p>
                          {c.sub && <p style={{ fontSize: 11, color: "#9CA3AF" }}>{c.sub}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Transactions */}
              <div style={{ background: "#fff", borderRadius: 14, padding: "20px 24px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid #E5E7EB" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <p style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Recent Transactions</p>
                  <Link href="/dashboard/transactions" style={{ fontSize: 17, color: "#9CA3AF", textDecoration: "none", fontWeight: 600 }}>»</Link>
                </div>
                {transactions.map((tx, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: i<transactions.length-1?"1px solid #F8FAFC":"none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 42, height: 42, borderRadius: 12, background: tx.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, fontWeight: 700, flexShrink: 0 }}>{tx.icon}</div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{tx.name}</p>
                        <p style={{ fontSize: 12, color: "#9CA3AF" }}>{tx.sub}</p>
                      </div>
                    </div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: tx.color }}>{tx.amount}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>

              {/* Quick Transfers */}
              <div style={{ background: "#fff", borderRadius: 14, padding: "20px 20px", boxShadow: "0 2px 8px rgba(0,0,0,0.05)", border: "1px solid #E5E7EB" }}>
                <p style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 18 }}>Quick Transfers</p>
                <div style={{ display: "flex", gap: 16, marginBottom: 20, justifyContent: "center" }}>
                  {contacts.map(c => (
                    <div key={c.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}>
                      <div style={{
                        width: 54, height: 54, borderRadius: "50%", background: c.bg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, fontWeight: 700, color: "#fff",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.14)", transition: "transform 0.18s",
                      }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.transform = "scale(1.08)"}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.transform = "scale(1)"}
                      >{c.initials}</div>
                      <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>{c.name}</span>
                    </div>
                  ))}
                </div>
                <button style={{
                  width: "100%", padding: "13px", borderRadius: 10, border: "none",
                  background: "#1A73E8", color: "#fff", fontSize: 14.5, fontWeight: 700,
                  cursor: "pointer", transition: "background 0.18s", boxShadow: "0 4px 14px rgba(26,115,232,0.35)",
                  fontFamily: "inherit",
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#1557b0"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#1A73E8"}
                >Make a Transfer</button>
              </div>

              {/* Virtual Card */}
              <div style={{
                background: "linear-gradient(135deg,#1A73E8 0%,#0F172A 100%)",
                borderRadius: 14, padding: "20px", boxShadow: "0 8px 24px rgba(26,115,232,0.3)",
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.65)", fontWeight: 500 }}>Vaulte Card</p>
                  <div style={{ display: "flex" }}>
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#EF4444", opacity: 0.85 }} />
                    <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#F59E0B", opacity: 0.85, marginLeft: -8 }} />
                  </div>
                </div>
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", letterSpacing: "0.18em", marginBottom: 18 }}>4532 •••• •••• 4410</p>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <div>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginBottom: 2 }}>CARD HOLDER</p>
                    <p style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>John Doe</p>
                  </div>
                  <div>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", marginBottom: 2 }}>EXPIRES</p>
                    <p style={{ fontSize: 13, color: "#fff", fontWeight: 600 }}>08/28</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <style>{`
        @media (max-width: 1024px) { aside { display: none !important; } div[style*="margin-left: 220px"] { margin-left: 0 !important; } }
        @media (max-width: 768px) { main > div:last-child { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}
