"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const currencies = [
  { flag: "🇺🇸", code: "USD", balance: "$5,240.00" },
  { flag: "🇪🇺", code: "EUR", balance: "€3,200.00" },
  { flag: "🇬🇧", code: "GBP", balance: "£2,150.00" },
  { flag: "₿",   code: "BTC", balance: "0.184 BTC", sub: "≈ $1,215.75" },
];

const transactions = [
  { icon: "₿", iconBg: "linear-gradient(135deg,#F59E0B,#D97706)", iconColor: "#fff", name: "Bitcoin Purchase", sub: "Crypto.com · Today 2:14 PM", amount: "−$500.00", color: "#EF4444" },
  { icon: "🏧", iconBg: "linear-gradient(135deg,#EFF6FF,#DBEAFE)", iconColor: "#1A73E8", name: "ATM Withdrawal", sub: "Chase Bank · Today 10:30 AM", amount: "−$200.00", color: "#EF4444" },
  { icon: "↗",  iconBg: "linear-gradient(135deg,#F0FDF4,#DCFCE7)", iconColor: "#16A34A", name: "Transfer Received", sub: "From Sarah L. · Yesterday", amount: "+$1,000.00", color: "#16A34A" },
];

const contacts = [
  { name: "Sarah", initials: "S", bg: "linear-gradient(135deg,#1A73E8,#1d4ed8)" },
  { name: "Alex",  initials: "A", bg: "linear-gradient(135deg,#374151,#1f2937)" },
  { name: "Emma",  initials: "E", bg: "linear-gradient(135deg,#7C3AED,#6d28d9)" },
];

const navItems = [
  { icon: "⊞",  label: "Dashboard", href: "/dashboard", active: true },
  { icon: "◫",  label: "Accounts",  href: "/dashboard/accounts" },
  { icon: "⇄",  label: "Transfers", href: "/dashboard/transfer" },
  { icon: "▭",  label: "Cards",     href: "/dashboard/cards" },
  { icon: "◎",  label: "Settings",  href: "/dashboard/settings", arrow: true },
];

const tabs = ["Dashboard", "Accounts", "Transfers", "Cards", "Help"];

// Spending data for the analytics chart (last 7 days)
const spendingData = [
  { day: "Mon", amount: 120, income: 0 },
  { day: "Tue", amount: 340, income: 1000 },
  { day: "Wed", amount: 85,  income: 0 },
  { day: "Thu", amount: 200, income: 0 },
  { day: "Fri", amount: 500, income: 0 },
  { day: "Sat", amount: 65,  income: 0 },
  { day: "Sun", amount: 200, income: 0 },
];
const maxSpend = Math.max(...spendingData.map(d => Math.max(d.amount, d.income)));

// Card styles shared
const card = {
  background: "#fff",
  borderRadius: 20,
  boxShadow: "0 1px 3px rgba(15,23,42,0.04), 0 8px 24px rgba(15,23,42,0.05)",
  border: "1px solid rgba(15,23,42,0.05)",
  transition: "box-shadow 0.25s ease, transform 0.25s ease",
} as const;

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Dashboard");

  const handleLogout = () => {
    localStorage.removeItem("vaulte_user");
    router.push("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#F4F6FB", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* ─────────────── SIDEBAR ─────────────── */}
      <aside style={{
        width: 230,
        background: "#0F172A",
        position: "fixed", top: 0, left: 0,
        height: "100vh",
        display: "flex", flexDirection: "column",
        zIndex: 100, flexShrink: 0,
        borderRight: "1px solid rgba(255,255,255,0.04)",
      }}>

        {/* Logo */}
        <div style={{ padding: "22px 20px 18px", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", gap: 10 }}>
            <img
              src="/assets/logo-vaulte.png"
              alt="Vaulte"
              style={{ height: 26, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.92 }}
            />
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ padding: "16px 12px 8px", flex: "0 0 auto" }}>
          {navItems.map(item => (
            <Link key={item.label} href={item.href} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "11px 12px",
              borderRadius: 12,
              marginBottom: 3,
              textDecoration: "none",
              background: item.active ? "rgba(26,115,232,0.14)" : "transparent",
              borderLeft: item.active ? "2.5px solid #1A73E8" : "2.5px solid transparent",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { if (!item.active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { if (!item.active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <span style={{ fontSize: 14, opacity: item.active ? 1 : 0.5, color: "#fff" }}>{item.icon}</span>
                <span style={{
                  fontSize: 13.5,
                  fontWeight: item.active ? 600 : 400,
                  color: item.active ? "#fff" : "rgba(255,255,255,0.5)",
                  letterSpacing: "0.01em",
                }}>{item.label}</span>
              </div>
              {item.arrow && <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)" }}>›</span>}
            </Link>
          ))}
        </nav>

        {/* Balance card */}
        <div style={{
          margin: "auto 14px 0",
          background: "linear-gradient(145deg, rgba(26,115,232,0.16) 0%, rgba(26,115,232,0.06) 100%)",
          border: "1px solid rgba(26,115,232,0.18)",
          borderRadius: 16,
          padding: "18px 16px",
        }}>
          <p style={{ fontSize: 10.5, color: "rgba(255,255,255,0.4)", marginBottom: 7, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em" }}>Total Balance</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.6px", marginBottom: 3 }}>$12,540.75</p>
          <p style={{ fontSize: 11.5, color: "#4ADE80", fontWeight: 600, marginBottom: 18, display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ fontSize: 10 }}>▲</span> +$256.00 today
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {currencies.map((c, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
                  <span style={{ fontSize: 12, lineHeight: 1 }}>{c.flag}</span>
                  <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.45)", fontWeight: 500 }}>{c.code}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.82)", fontWeight: 600 }}>{c.balance}</p>
                  {c.sub && <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 1 }}>{c.sub}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <div style={{ padding: "14px 12px 20px" }}>
          <button onClick={handleLogout} style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            padding: "10px 12px", borderRadius: 12, background: "transparent",
            border: "none", color: "rgba(255,255,255,0.35)", fontSize: 13,
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.35)"; }}
          >
            <span style={{ fontSize: 14 }}>→</span>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ─────────────── MAIN ─────────────── */}
      <div style={{ flex: 1, marginLeft: 230, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Topbar */}
        <header style={{
          background: "#ffffff",
          borderBottom: "1px solid rgba(15,23,42,0.06)",
          padding: "0 28px",
          height: 64,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 50,
          boxShadow: "0 1px 0 rgba(15,23,42,0.04)",
        }}>
          {/* Search */}
          <div style={{ position: "relative", width: 290 }}>
            <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 13, color: "#94A3B8", lineHeight: 1 }}>🔍</span>
            <input placeholder="Search markets, accounts..." style={{
              width: "100%", padding: "10px 16px 10px 40px", borderRadius: 24,
              border: "1.5px solid rgba(15,23,42,0.08)", fontSize: 13, color: "#0F172A",
              background: "#F8FAFC", outline: "none", boxSizing: "border-box",
              fontFamily: "inherit", transition: "all 0.2s",
            }}
              onFocus={e => { e.target.style.borderColor = "#1A73E8"; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.07)"; }}
              onBlur={e => { e.target.style.borderColor = "rgba(15,23,42,0.08)"; e.target.style.background = "#F8FAFC"; e.target.style.boxShadow = "none"; }}
            />
          </div>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            {/* Notification */}
            <button style={{
              width: 38, height: 38, borderRadius: 10,
              background: "transparent", border: "1px solid rgba(15,23,42,0.08)",
              cursor: "pointer", fontSize: 15, color: "#64748B",
              display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F8FAFC"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(15,23,42,0.13)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(15,23,42,0.08)"; }}
            >
              🔔
              <span style={{ position: "absolute", top: 9, right: 9, width: 6, height: 6, background: "#EF4444", borderRadius: "50%", border: "1.5px solid #fff" }} />
            </button>
            {/* Settings */}
            <button style={{
              width: 38, height: 38, borderRadius: 10,
              background: "transparent", border: "1px solid rgba(15,23,42,0.08)",
              cursor: "pointer", fontSize: 15, color: "#64748B",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#F8FAFC"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >⚙️</button>

            <div style={{ width: 1, height: 28, background: "rgba(15,23,42,0.07)", margin: "0 6px" }} />

            {/* Profile */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "5px 10px 5px 5px", borderRadius: 12, cursor: "pointer",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F8FAFC"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: "linear-gradient(135deg, #1A73E8, #1d4ed8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, fontWeight: 700, color: "#fff",
                boxShadow: "0 0 0 2.5px rgba(26,115,232,0.18)",
              }}>JD</div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", lineHeight: 1.3 }}>John Doe</p>
                <p style={{ fontSize: 11, color: "#22C55E", fontWeight: 600 }}>✓ Verified</p>
              </div>
              <span style={{ fontSize: 10, color: "#94A3B8", marginLeft: 2 }}>▾</span>
            </div>
          </div>
        </header>

        {/* Tab nav */}
        <div style={{ background: "#ffffff", borderBottom: "1px solid rgba(15,23,42,0.06)", padding: "0 28px", display: "flex" }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "14px 18px", background: "none", border: "none", cursor: "pointer",
              fontSize: 13.5, fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? "#1A73E8" : "#94A3B8",
              borderBottom: activeTab === tab ? "2px solid #1A73E8" : "2px solid transparent",
              transition: "all 0.18s", fontFamily: "inherit", marginBottom: "-1px",
            }}>{tab}</button>
          ))}
        </div>

        {/* ─────────────── CONTENT ─────────────── */}
        <main style={{ flex: 1, padding: "28px 28px 40px", overflowY: "auto" }}>

          {/* Welcome banner */}
          <div style={{
            background: "linear-gradient(135deg, #EBF4FF 0%, #EEF6FF 55%, #EEF4FF 100%)",
            borderRadius: 22,
            padding: "24px 32px",
            marginBottom: 24,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            position: "relative", overflow: "hidden",
            border: "1px solid rgba(219,234,254,0.9)",
            boxShadow: "0 2px 16px rgba(26,115,232,0.06), 0 0 0 1px rgba(26,115,232,0.04)",
          }}>
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "50%", background: "radial-gradient(ellipse at 80% 50%, rgba(26,115,232,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <h1 style={{ fontSize: 21, fontWeight: 800, color: "#0F172A", marginBottom: 6, letterSpacing: "-0.4px" }}>
                Welcome back, John Doe 👋
              </h1>
              <p style={{ fontSize: 13.5, color: "#64748B" }}>Here&apos;s an overview of your account.</p>
            </div>
            {/* Phone mockup */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: -14, right: 124, fontSize: 26, filter: "drop-shadow(0 6px 12px rgba(245,158,11,0.35))", transform: "rotate(8deg)", pointerEvents: "none" }}>🪙</div>
              <div style={{ position: "absolute", top: -4, right: 82, fontSize: 18, filter: "drop-shadow(0 4px 8px rgba(245,158,11,0.28))", transform: "rotate(-5deg)", pointerEvents: "none" }}>🪙</div>
              <div style={{ position: "absolute", bottom: -10, left: -38, width: 76, height: 48, background: "linear-gradient(135deg, #1A73E8, #0F172A)", borderRadius: 9, transform: "rotate(-6deg)", boxShadow: "0 6px 16px rgba(26,115,232,0.28)", zIndex: 0 }} />
              <div style={{
                width: 108, height: 196, background: "#0F172A", borderRadius: 24, border: "5px solid #0F172A",
                boxShadow: "0 22px 44px rgba(15,23,42,0.28)", position: "relative", overflow: "hidden", zIndex: 1,
              }}>
                <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 34, height: 7, background: "#0F172A", borderRadius: "0 0 6px 6px", zIndex: 5 }} />
                <div style={{ background: "linear-gradient(160deg, #1A73E8 0%, #0c2d7a 100%)", height: "100%", padding: "14px 8px 8px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ width: 11, height: 11, background: "rgba(255,255,255,0.22)", borderRadius: 3 }} />
                    <span style={{ fontSize: 7, fontWeight: 800, color: "#fff" }}>Vaulte</span>
                    <span style={{ fontSize: 7, color: "rgba(255,255,255,0.45)" }}>⚙</span>
                  </div>
                  <p style={{ fontSize: 7, color: "rgba(255,255,255,0.55)", marginBottom: 1 }}>Balance</p>
                  <p style={{ fontSize: 13, fontWeight: 900, color: "#fff", marginBottom: 8 }}>$12,540.75</p>
                  {[["$5,240", "+$5,200", true], ["€3,230", "-€320", false], ["£2,150", "+£84", true], ["₿0.184", "$1,215", true]].map(([a, b, pos], i) => (
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 7, color: "rgba(255,255,255,0.72)" }}>{a}</span>
                      <span style={{ fontSize: 7, fontWeight: 700, color: pos ? "#4ADE80" : "#F87171" }}>{b}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 6, display: "flex", justifyContent: "space-around" }}>
                    {["⊞", "◫", "⇄", "🛡️"].map((ic, i) => <span key={i} style={{ fontSize: 9, opacity: 0.7 }}>{ic}</span>)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Two-column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, alignItems: "start" }}>

            {/* ─── LEFT column ─── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Total Balance + Actions */}
              <div style={{ ...card, padding: "26px 28px" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(15,23,42,0.08)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = card.boxShadow; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
              >
                <p style={{ fontSize: 12, color: "#94A3B8", marginBottom: 6, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.08em" }}>Total Balance</p>
                <p style={{ fontSize: 38, fontWeight: 800, color: "#0F172A", letterSpacing: "-1.5px", marginBottom: 4, lineHeight: 1 }}>$12,540.75</p>
                <p style={{ fontSize: 13, color: "#22C55E", fontWeight: 600, marginBottom: 26, display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ background: "#DCFCE7", borderRadius: 6, padding: "2px 7px", fontSize: 12 }}>▲ +$26.00 today</span>
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  {/* Action buttons */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                    {[
                      { icon: "↗", label: "Send Money",    color: "#1A73E8", bg: "#EEF4FF" },
                      { icon: "↙", label: "Request",       color: "#7C3AED", bg: "#F5F3FF" },
                      { icon: "⇄", label: "Exchange",      color: "#059669", bg: "#ECFDF5" },
                      { icon: "＋", label: "Add Funds",     color: "#D97706", bg: "#FFFBEB" },
                    ].map(a => (
                      <button key={a.label} style={{
                        padding: "14px 8px",
                        borderRadius: 14,
                        border: "1px solid rgba(15,23,42,0.06)",
                        background: "#FAFBFC",
                        cursor: "pointer",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                        transition: "all 0.2s ease",
                        fontFamily: "inherit",
                      }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = a.bg;
                          (e.currentTarget as HTMLElement).style.borderColor = "transparent";
                          (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                          (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(15,23,42,0.08)";
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = "#FAFBFC";
                          (e.currentTarget as HTMLElement).style.borderColor = "rgba(15,23,42,0.06)";
                          (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                          (e.currentTarget as HTMLElement).style.boxShadow = "none";
                        }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: a.color, fontWeight: 700 }}>
                          {a.icon}
                        </div>
                        <span style={{ fontSize: 11.5, fontWeight: 600, color: "#374151", textAlign: "center", lineHeight: 1.3 }}>{a.label}</span>
                      </button>
                    ))}
                  </div>

                  {/* Currency breakdown */}
                  <div style={{ borderLeft: "1px solid rgba(15,23,42,0.06)", paddingLeft: 24 }}>
                    <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 14 }}>Holdings</p>
                    {[
                      { flag: "🇺🇸", code: "USD", balance: "$5,240.00" },
                      { flag: "🇪🇺", code: "EUR", balance: "€3,200.00" },
                      { flag: "🇬🇧", code: "GBP", balance: "£2,150.00" },
                      { flag: "₿",   code: "BTC", balance: "0.184 BTC", sub: "≈ $1,215" },
                    ].map((c, i) => (
                      <div key={i} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "9px 0",
                        borderBottom: i < 3 ? "1px solid rgba(15,23,42,0.04)" : "none",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
                          <span style={{ fontSize: 17, lineHeight: 1 }}>{c.flag}</span>
                          <span style={{ fontSize: 13, color: "#475569", fontWeight: 500 }}>{c.code}</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A" }}>{c.balance}</p>
                          {c.sub && <p style={{ fontSize: 11, color: "#94A3B8", marginTop: 1 }}>{c.sub}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Analytics / Spending Chart ── */}
              <div style={{ ...card, padding: "26px 28px" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(15,23,42,0.08)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = card.boxShadow; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
                  <div>
                    <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 3 }}>Spending Overview</p>
                    <p style={{ fontSize: 12.5, color: "#94A3B8" }}>Last 7 days · March 2025</p>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    {["7D", "1M", "3M"].map((t, i) => (
                      <button key={t} style={{
                        padding: "5px 12px", borderRadius: 8,
                        border: i === 0 ? "none" : "1px solid rgba(15,23,42,0.08)",
                        background: i === 0 ? "#0F172A" : "transparent",
                        color: i === 0 ? "#fff" : "#94A3B8",
                        fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit",
                        transition: "all 0.15s",
                      }}>{t}</button>
                    ))}
                  </div>
                </div>

                {/* Summary metrics */}
                <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
                  {[
                    { label: "Total Spent", value: "$1,510.00", color: "#EF4444", bg: "#FEF2F2" },
                    { label: "Total Income", value: "$1,000.00", color: "#16A34A", bg: "#F0FDF4" },
                    { label: "Net Change", value: "−$510.00", color: "#D97706", bg: "#FFFBEB" },
                  ].map(m => (
                    <div key={m.label} style={{ flex: 1, background: m.bg, borderRadius: 12, padding: "12px 16px" }}>
                      <p style={{ fontSize: 11, color: "#94A3B8", fontWeight: 500, marginBottom: 4 }}>{m.label}</p>
                      <p style={{ fontSize: 17, fontWeight: 800, color: m.color, letterSpacing: "-0.5px" }}>{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Bar chart */}
                <div style={{ display: "flex", alignItems: "flex-end", gap: 10, height: 120, paddingBottom: 28, position: "relative" }}>
                  {/* Horizontal guide lines */}
                  {[0, 33, 66, 100].map(pct => (
                    <div key={pct} style={{
                      position: "absolute", left: 0, right: 0,
                      bottom: `${28 + (pct / 100) * 92}px`,
                      borderTop: pct === 0 ? "none" : "1px dashed rgba(15,23,42,0.06)",
                    }} />
                  ))}
                  {spendingData.map((d, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative" }}>
                      {/* Income bar (green, behind) */}
                      {d.income > 0 && (
                        <div style={{
                          position: "absolute", bottom: 20, width: "62%",
                          height: `${(d.income / maxSpend) * 88}px`,
                          background: "linear-gradient(180deg, #4ADE80 0%, #22C55E 100%)",
                          borderRadius: "6px 6px 0 0", opacity: 0.25,
                        }} />
                      )}
                      {/* Spend bar */}
                      <div style={{
                        position: "absolute", bottom: 20, width: "45%",
                        height: `${(d.amount / maxSpend) * 88}px`,
                        background: i === 4
                          ? "linear-gradient(180deg, #1A73E8 0%, #1d4ed8 100%)"
                          : "linear-gradient(180deg, #BFDBFE 0%, #93C5FD 100%)",
                        borderRadius: "6px 6px 0 0",
                        transition: "all 0.2s",
                        cursor: "pointer",
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.8"; (e.currentTarget as HTMLElement).style.transform = "scaleY(1.03)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.transform = "scaleY(1)"; }}
                      />
                      <span style={{ position: "absolute", bottom: 4, fontSize: 11, color: "#94A3B8", fontWeight: 500 }}>{d.day}</span>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div style={{ display: "flex", gap: 20, paddingTop: 4 }}>
                  {[
                    { color: "#1A73E8", label: "Spending" },
                    { color: "#22C55E", label: "Income" },
                  ].map(l => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color }} />
                      <span style={{ fontSize: 12, color: "#94A3B8" }}>{l.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Transactions */}
              <div style={{ ...card, padding: "26px 28px" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(15,23,42,0.08)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = card.boxShadow; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A" }}>Recent Transactions</p>
                  <Link href="/dashboard/transactions" style={{
                    fontSize: 13, color: "#1A73E8", textDecoration: "none", fontWeight: 600,
                    display: "flex", alignItems: "center", gap: 4,
                    padding: "5px 12px", borderRadius: 8, background: "#EEF4FF",
                    transition: "background 0.15s",
                  }}>View all →</Link>
                </div>
                {transactions.map((tx, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "14px 0",
                    borderBottom: i < transactions.length - 1 ? "1px solid rgba(15,23,42,0.05)" : "none",
                    transition: "background 0.15s", borderRadius: 10, cursor: "pointer",
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#FAFBFC"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{
                        width: 44, height: 44, borderRadius: 14,
                        background: tx.iconBg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, fontWeight: 700, color: tx.iconColor, flexShrink: 0,
                        boxShadow: "0 2px 8px rgba(15,23,42,0.08)",
                      }}>{tx.icon}</div>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", marginBottom: 3 }}>{tx.name}</p>
                        <p style={{ fontSize: 12, color: "#94A3B8", fontWeight: 400 }}>{tx.sub}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 15, fontWeight: 700, color: tx.color }}>{tx.amount}</p>
                      <p style={{ fontSize: 11, color: "#CBD5E1", marginTop: 2 }}>Completed</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── RIGHT column ─── */}
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

              {/* Quick Transfers */}
              <div style={{ ...card, padding: "22px 20px" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 24px rgba(15,23,42,0.08)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = card.boxShadow; }}
              >
                <p style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", marginBottom: 18 }}>Quick Transfers</p>
                <div style={{ display: "flex", gap: 12, marginBottom: 20, justifyContent: "center" }}>
                  {contacts.map(c => (
                    <div key={c.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <div style={{
                        width: 52, height: 52, borderRadius: 16,
                        background: c.bg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 17, fontWeight: 700, color: "#fff",
                        boxShadow: "0 4px 12px rgba(15,23,42,0.12)",
                        transition: "all 0.2s ease",
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 20px rgba(15,23,42,0.18)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 12px rgba(15,23,42,0.12)"; }}
                      >{c.initials}</div>
                      <span style={{ fontSize: 12, color: "#475569", fontWeight: 500 }}>{c.name}</span>
                    </div>
                  ))}
                </div>
                <button style={{
                  width: "100%", padding: "13px", borderRadius: 12, border: "none",
                  background: "#0F172A", color: "#fff", fontSize: 13.5, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.2s ease", fontFamily: "inherit",
                  boxShadow: "0 4px 14px rgba(15,23,42,0.18)",
                  letterSpacing: "0.01em",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#1e293b"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(15,23,42,0.24)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#0F172A"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(15,23,42,0.18)"; }}
                >Make a Transfer</button>
              </div>

              {/* Virtual Card — Premium */}
              <div style={{
                background: "linear-gradient(135deg, #2563EB 0%, #1e40af 55%, #0F172A 100%)",
                borderRadius: 22,
                padding: "22px 20px",
                boxShadow: "0 8px 32px rgba(37,99,235,0.28), 0 0 0 1px rgba(255,255,255,0.06)",
                position: "relative",
                overflow: "hidden",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-3px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 16px 44px rgba(37,99,235,0.35), 0 0 0 1px rgba(255,255,255,0.08)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 32px rgba(37,99,235,0.28), 0 0 0 1px rgba(255,255,255,0.06)"; }}
              >
                {/* Card texture circles */}
                <div style={{ position: "absolute", top: -40, right: -40, width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -60, left: -30, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

                {/* Top row: label + network */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20, position: "relative" }}>
                  <div>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 3 }}>Vaulte</p>
                    <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>Premium Card</p>
                  </div>
                  {/* Mastercard circles */}
                  <div style={{ display: "flex" }}>
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#EF4444", opacity: 0.88 }} />
                    <div style={{ width: 26, height: 26, borderRadius: "50%", background: "#F59E0B", opacity: 0.88, marginLeft: -10 }} />
                  </div>
                </div>

                {/* Chip */}
                <div style={{
                  width: 36, height: 26, borderRadius: 5, marginBottom: 16,
                  background: "linear-gradient(135deg, #D97706, #F59E0B, #D97706)",
                  boxShadow: "inset 0 1px 2px rgba(255,255,255,0.3)",
                  position: "relative",
                }}>
                  <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(120,60,0,0.3)", transform: "translateX(-50%)" }} />
                  <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(120,60,0,0.3)", transform: "translateY(-50%)" }} />
                </div>

                {/* Card number */}
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", letterSpacing: "0.22em", marginBottom: 20, fontFamily: "monospace", fontWeight: 500 }}>4532 •••• •••• 4410</p>

                {/* Cardholder + expiry */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.38)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Card Holder</p>
                    <p style={{ fontSize: 13.5, color: "#fff", fontWeight: 600, letterSpacing: "0.03em" }}>John Doe</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.38)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Expires</p>
                    <p style={{ fontSize: 13.5, color: "#fff", fontWeight: 600 }}>08/28</p>
                  </div>
                </div>
              </div>

              {/* Account Status widget */}
              <div style={{ ...card, padding: "20px 20px" }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A", marginBottom: 16 }}>Account Status</p>
                {[
                  { label: "KYC Verification", status: "Verified", color: "#16A34A", bg: "#F0FDF4", icon: "✓" },
                  { label: "2FA Security", status: "Enabled", color: "#1A73E8", bg: "#EEF4FF", icon: "🔐" },
                  { label: "Card Status", status: "Active", color: "#059669", bg: "#ECFDF5", icon: "✓" },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "10px 0",
                    borderBottom: i < 2 ? "1px solid rgba(15,23,42,0.05)" : "none",
                  }}>
                    <span style={{ fontSize: 13, color: "#475569", fontWeight: 400 }}>{item.label}</span>
                    <span style={{
                      fontSize: 11.5, fontWeight: 600, color: item.color,
                      background: item.bg, borderRadius: 20, padding: "3px 10px",
                    }}>{item.icon} {item.status}</span>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </main>
      </div>

      <style>{`
        * { box-sizing: border-box; }
        @media (max-width: 1024px) {
          aside { display: none !important; }
          div[style*="margin-left: 230px"] { margin-left: 0 !important; }
        }
        @media (max-width: 820px) {
          main > div:nth-child(2) { grid-template-columns: 1fr !important; }
        }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(15,23,42,0.1); border-radius: 99px; }
      `}</style>
    </div>
  );
}
