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
  { icon: "₿",  iconBg: "linear-gradient(135deg,#F59E0B,#D97706)", iconColor: "#fff", name: "Bitcoin Purchase",   sub: "Crypto.com",    date: "Today, 2:14 PM",  amount: "−$500.00",   color: "#EF4444", badge: "Crypto",    badgeBg: "#FFFBEB", badgeColor: "#D97706" },
  { icon: "🏧", iconBg: "linear-gradient(135deg,#E0EAFF,#C7D7F9)", iconColor: "#3B5BDB", name: "ATM Withdrawal",  sub: "Chase Bank",    date: "Today, 10:30 AM", amount: "−$200.00",   color: "#EF4444", badge: "Cash",      badgeBg: "#EFF6FF", badgeColor: "#2563EB" },
  { icon: "↗",  iconBg: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", iconColor: "#059669", name: "Transfer Received", sub: "From Sarah L.", date: "Yesterday",       amount: "+$1,000.00", color: "#059669", badge: "Incoming",  badgeBg: "#F0FDF4", badgeColor: "#16A34A" },
];

const contacts = [
  { name: "Sarah", initials: "S", bg: "linear-gradient(145deg,#2563EB,#1d4ed8)" },
  { name: "Alex",  initials: "A", bg: "linear-gradient(145deg,#374151,#1f2937)" },
  { name: "Emma",  initials: "E", bg: "linear-gradient(145deg,#7C3AED,#6d28d9)" },
];

const navItems = [
  { icon: "⊞", label: "Dashboard", href: "/dashboard",          active: true },
  { icon: "◫", label: "Accounts",  href: "/dashboard/accounts"               },
  { icon: "⇄", label: "Transfers", href: "/dashboard/transfer"               },
  { icon: "▭", label: "Cards",     href: "/dashboard/cards"                  },
  { icon: "◎", label: "Settings",  href: "/dashboard/settings", arrow: true  },
];

const tabs = ["Dashboard", "Accounts", "Transfers", "Cards", "Help"];

const spendingData = [
  { day: "Mon", amount: 120,  income: 0    },
  { day: "Tue", amount: 340,  income: 1000 },
  { day: "Wed", amount: 85,   income: 0    },
  { day: "Thu", amount: 200,  income: 0    },
  { day: "Fri", amount: 500,  income: 0    },
  { day: "Sat", amount: 65,   income: 0    },
  { day: "Sun", amount: 200,  income: 0    },
];
const maxSpend = Math.max(...spendingData.map(d => Math.max(d.amount, d.income)));

const C = {
  bg:       "#F3F5FA",
  card:     "#ffffff",
  navy:     "#0F172A",
  blue:     "#1A73E8",
  border:   "rgba(15,23,42,0.055)",
  muted:    "#94A3B8",
  text:     "#0F172A",
  sub:      "#64748B",
  shadow:   "0 1px 2px rgba(15,23,42,0.04), 0 6px 20px rgba(15,23,42,0.06)",
  shadowHv: "0 4px 6px rgba(15,23,42,0.05), 0 16px 40px rgba(15,23,42,0.09)",
} as const;

export default function Dashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("Dashboard");

  const handleLogout = () => {
    localStorage.removeItem("vaulte_user");
    router.push("/login");
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* ══════════════ SIDEBAR ══════════════ */}
      <aside style={{
        width: 236,
        background: C.navy,
        position: "fixed", top: 0, left: 0,
        height: "100vh",
        display: "flex", flexDirection: "column",
        zIndex: 100,
        boxShadow: "2px 0 24px rgba(15,23,42,0.18)",
      }}>

        {/* ── Logo ── centered, bigger, visible */}
        <div style={{
          height: 68,
          display: "flex", alignItems: "center", justifyContent: "center",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          padding: "0 20px",
          flexShrink: 0,
        }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
            <img
              src="/assets/logo-vaulte.png"
              alt="Vaulte"
              style={{
                height: 36,
                width: "auto",
                objectFit: "contain",
                filter: "brightness(0) invert(1)",
                opacity: 0.95,
                display: "block",
              }}
            />
          </Link>
        </div>

        {/* ── Nav label ── */}
        <div style={{ padding: "20px 20px 8px" }}>
          <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.2)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Menu</span>
        </div>

        {/* ── Nav items ── */}
        <nav style={{ padding: "0 12px", flex: "0 0 auto" }}>
          {navItems.map(item => (
            <Link key={item.label} href={item.href} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "11px 14px",
              borderRadius: 12,
              marginBottom: 2,
              textDecoration: "none",
              background: item.active ? "rgba(26,115,232,0.16)" : "transparent",
              borderLeft: item.active ? "2.5px solid #1A73E8" : "2.5px solid transparent",
              transition: "all 0.18s",
            }}
              onMouseEnter={e => { if (!item.active) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { if (!item.active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 14, color: item.active ? "#fff" : "rgba(255,255,255,0.4)", lineHeight: 1 }}>{item.icon}</span>
                <span style={{
                  fontSize: 13.5, fontWeight: item.active ? 600 : 400,
                  color: item.active ? "#fff" : "rgba(255,255,255,0.48)",
                  letterSpacing: "0.01em",
                }}>{item.label}</span>
              </div>
              {item.arrow && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>›</span>}
            </Link>
          ))}
        </nav>

        {/* ── Divider ── */}
        <div style={{ margin: "16px 20px", height: 1, background: "rgba(255,255,255,0.05)", flexShrink: 0 }} />

        {/* ── Sidebar balance card ── */}
        <div style={{
          margin: "0 12px",
          background: "linear-gradient(150deg, rgba(26,115,232,0.18) 0%, rgba(15,23,42,0.4) 100%)",
          border: "1px solid rgba(26,115,232,0.2)",
          borderRadius: 16,
          padding: "18px 16px",
          flex: "1 1 auto",
          overflow: "hidden",
          minHeight: 0,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
            <div>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Total Balance</p>
              <p style={{ fontSize: 21, fontWeight: 800, color: "#fff", letterSpacing: "-0.6px", lineHeight: 1 }}>$12,540.75</p>
            </div>
            <div style={{ background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.2)", borderRadius: 8, padding: "4px 8px" }}>
              <span style={{ fontSize: 11, color: "#4ADE80", fontWeight: 700 }}>+2.1%</span>
            </div>
          </div>
          <p style={{ fontSize: 11.5, color: "#4ADE80", fontWeight: 600, marginBottom: 16, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 9 }}>▲</span> +$256.00 today
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {currencies.map((c, i) => (
              <div key={i} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                paddingBottom: i < currencies.length - 1 ? 10 : 0,
                borderBottom: i < currencies.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 13, lineHeight: 1 }}>{c.flag}</span>
                  <span style={{ fontSize: 11.5, color: "rgba(255,255,255,0.4)", fontWeight: 500 }}>{c.code}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 600 }}>{c.balance}</p>
                  {c.sub && <p style={{ fontSize: 10, color: "rgba(255,255,255,0.28)", marginTop: 1 }}>{c.sub}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Logout ── */}
        <div style={{ padding: "12px 12px 18px", flexShrink: 0 }}>
          <button onClick={handleLogout} style={{
            display: "flex", alignItems: "center", gap: 10, width: "100%",
            padding: "10px 14px", borderRadius: 12, background: "transparent",
            border: "1px solid rgba(255,255,255,0.07)",
            color: "rgba(255,255,255,0.32)", fontSize: 13,
            cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s",
          }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)";
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.65)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.12)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLElement).style.background = "transparent";
              (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.32)";
              (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.07)";
            }}
          >
            <span style={{ fontSize: 13, opacity: 0.6 }}>⎋</span>
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* ══════════════ MAIN ══════════════ */}
      <div style={{ flex: 1, marginLeft: 236, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* ── Topbar ── */}
        <header style={{
          background: "#ffffff",
          borderBottom: `1px solid ${C.border}`,
          padding: "0 32px",
          height: 68,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 50,
          boxShadow: "0 1px 3px rgba(15,23,42,0.05)",
        }}>
          {/* Page title + search */}
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: C.text, lineHeight: 1.2 }}>Dashboard</p>
              <p style={{ fontSize: 11.5, color: C.muted, fontWeight: 400 }}>Monday, March 10, 2025</p>
            </div>
            <div style={{ width: 1, height: 28, background: C.border }} />
            <div style={{ position: "relative", width: 260 }}>
              <span style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)", fontSize: 12.5, color: C.muted, lineHeight: 1, pointerEvents: "none" }}>⌕</span>
              <input placeholder="Search transactions, accounts…" style={{
                width: "100%", padding: "9px 16px 9px 36px", borderRadius: 20,
                border: `1.5px solid ${C.border}`, fontSize: 12.5, color: C.text,
                background: C.bg, outline: "none", boxSizing: "border-box",
                fontFamily: "inherit", transition: "all 0.2s",
              }}
                onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.07)"; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.background = C.bg; e.target.style.boxShadow = "none"; }}
              />
            </div>
          </div>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Notification bell */}
            <button style={{
              width: 38, height: 38, borderRadius: 11,
              background: "transparent", border: `1px solid ${C.border}`,
              cursor: "pointer", fontSize: 15, color: C.sub,
              display: "flex", alignItems: "center", justifyContent: "center", position: "relative",
              transition: "all 0.18s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg; (e.currentTarget as HTMLElement).style.borderColor = "rgba(15,23,42,0.12)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = C.border; }}
            >
              🔔
              <span style={{ position: "absolute", top: 8, right: 8, width: 7, height: 7, background: "#EF4444", borderRadius: "50%", border: "2px solid #fff" }} />
            </button>

            {/* Settings */}
            <button style={{
              width: 38, height: 38, borderRadius: 11,
              background: "transparent", border: `1px solid ${C.border}`,
              cursor: "pointer", fontSize: 15, color: C.sub,
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "all 0.18s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >⚙️</button>

            <div style={{ width: 1, height: 30, background: C.border, margin: "0 4px" }} />

            {/* Profile pill */}
            <div style={{
              display: "flex", alignItems: "center", gap: 10,
              padding: "6px 12px 6px 6px",
              borderRadius: 40,
              border: `1px solid ${C.border}`,
              cursor: "pointer",
              transition: "all 0.18s",
              background: "transparent",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg; (e.currentTarget as HTMLElement).style.borderColor = "rgba(15,23,42,0.1)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = C.border; }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #1A73E8, #1d4ed8)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 11.5, fontWeight: 700, color: "#fff",
                boxShadow: "0 0 0 2px rgba(26,115,232,0.2)",
              }}>JD</div>
              <div style={{ lineHeight: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>John Doe</p>
                <p style={{ fontSize: 11, color: "#22C55E", fontWeight: 600, marginTop: 2 }}>✓ Verified</p>
              </div>
              <span style={{ fontSize: 10, color: C.muted }}>▾</span>
            </div>
          </div>
        </header>

        {/* ── Tab nav ── */}
        <div style={{ background: "#ffffff", borderBottom: `1px solid ${C.border}`, padding: "0 32px", display: "flex" }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: "14px 20px", background: "none", border: "none", cursor: "pointer",
              fontSize: 13.5, fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? C.blue : C.muted,
              borderBottom: activeTab === tab ? `2px solid ${C.blue}` : "2px solid transparent",
              transition: "all 0.18s", fontFamily: "inherit", marginBottom: "-1px",
            }}>{tab}</button>
          ))}
        </div>

        {/* ══════════════ CONTENT ══════════════ */}
        <main style={{ flex: 1, padding: "30px 32px 48px", overflowY: "auto" }}>

          {/* Welcome banner */}
          <div style={{
            background: "linear-gradient(135deg, #EBF3FF 0%, #EEF6FF 60%, #ECF2FF 100%)",
            borderRadius: 22,
            padding: "26px 34px",
            marginBottom: 26,
            display: "flex", justifyContent: "space-between", alignItems: "center",
            position: "relative", overflow: "hidden",
            border: "1px solid rgba(219,234,254,0.8)",
            boxShadow: "0 4px 20px rgba(26,115,232,0.07), 0 1px 3px rgba(26,115,232,0.05)",
          }}>
            {/* Subtle radial glow */}
            <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "55%", background: "radial-gradient(ellipse at 75% 50%, rgba(26,115,232,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
            <div style={{ position: "relative" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 0 3px rgba(34,197,94,0.2)" }} />
                <span style={{ fontSize: 12, color: C.sub, fontWeight: 500 }}>Account Active</span>
              </div>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6, letterSpacing: "-0.5px" }}>
                Welcome back, John Doe 👋
              </h1>
              <p style={{ fontSize: 13.5, color: C.sub }}>Here&apos;s an overview of your account.</p>
            </div>
            {/* Phone mockup */}
            <div style={{ position: "relative", flexShrink: 0 }}>
              <div style={{ position: "absolute", top: -14, right: 124, fontSize: 26, filter: "drop-shadow(0 6px 12px rgba(245,158,11,0.35))", transform: "rotate(8deg)", pointerEvents: "none" }}>🪙</div>
              <div style={{ position: "absolute", top: -4,  right: 82,  fontSize: 18, filter: "drop-shadow(0 4px 8px rgba(245,158,11,0.28))",  transform: "rotate(-5deg)", pointerEvents: "none" }}>🪙</div>
              <div style={{ position: "absolute", bottom: -10, left: -38, width: 76, height: 48, background: "linear-gradient(135deg, #1A73E8, #0F172A)", borderRadius: 9, transform: "rotate(-6deg)", boxShadow: "0 6px 16px rgba(26,115,232,0.28)", zIndex: 0 }} />
              <div style={{
                width: 110, height: 198, background: "#0F172A", borderRadius: 24, border: "5px solid #0F172A",
                boxShadow: "0 24px 48px rgba(15,23,42,0.3)", position: "relative", overflow: "hidden", zIndex: 1,
              }}>
                <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 34, height: 7, background: "#0F172A", borderRadius: "0 0 6px 6px", zIndex: 5 }} />
                <div style={{ background: "linear-gradient(160deg, #1A73E8 0%, #0c2d7a 100%)", height: "100%", padding: "14px 9px 9px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <div style={{ width: 11, height: 11, background: "rgba(255,255,255,0.22)", borderRadius: 3 }} />
                    <span style={{ fontSize: 7, fontWeight: 800, color: "#fff" }}>Vaulte</span>
                    <span style={{ fontSize: 7, color: "rgba(255,255,255,0.4)" }}>⚙</span>
                  </div>
                  <p style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", marginBottom: 1 }}>Balance</p>
                  <p style={{ fontSize: 13, fontWeight: 900, color: "#fff", marginBottom: 9 }}>$12,540.75</p>
                  {[["$5,240","+$5,200",true],["€3,230","-€320",false],["£2,150","+£84",true],["₿0.184","$1,215",true]].map(([a,b,pos],i)=>(
                    <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                      <span style={{ fontSize: 7, color: "rgba(255,255,255,0.7)" }}>{a}</span>
                      <span style={{ fontSize: 7, fontWeight: 700, color: pos?"#4ADE80":"#F87171" }}>{b}</span>
                    </div>
                  ))}
                  <div style={{ marginTop: 4, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 6, display: "flex", justifyContent: "space-around" }}>
                    {["⊞","◫","⇄","🛡️"].map((ic,i)=><span key={i} style={{ fontSize: 9, opacity: 0.6 }}>{ic}</span>)}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Two-column layout ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 296px", gap: 22, alignItems: "start" }}>

            {/* ════ LEFT column ════ */}
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

              {/* Balance + Actions card */}
              <div style={{
                background: C.card, borderRadius: 22, padding: "28px 30px",
                boxShadow: C.shadow, border: `1px solid ${C.border}`,
                transition: "box-shadow 0.25s ease, transform 0.25s ease",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = C.shadowHv; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = C.shadow; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
              >
                <p style={{ fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Total Balance</p>
                <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 20 }}>
                  <p style={{ fontSize: 42, fontWeight: 800, color: C.text, letterSpacing: "-2px", lineHeight: 1 }}>$12,540.75</p>
                  <span style={{
                    fontSize: 12.5, fontWeight: 700, color: "#059669",
                    background: "#ECFDF5", border: "1px solid #A7F3D0",
                    borderRadius: 8, padding: "4px 10px", letterSpacing: "0.01em",
                  }}>▲ +$26.00 today</span>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
                  {/* Action tiles */}
                  <div>
                    <p style={{ fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 12 }}>Quick Actions</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {[
                        { icon: "↗", label: "Send",     color: "#1A73E8", bg: "#EEF4FF", shadowC: "rgba(26,115,232,0.18)" },
                        { icon: "↙", label: "Request",  color: "#7C3AED", bg: "#F5F3FF", shadowC: "rgba(124,58,237,0.18)" },
                        { icon: "⇄", label: "Exchange", color: "#059669", bg: "#ECFDF5", shadowC: "rgba(5,150,105,0.18)"  },
                        { icon: "＋", label: "Add",      color: "#D97706", bg: "#FFFBEB", shadowC: "rgba(217,119,6,0.18)"  },
                      ].map(a => (
                        <button key={a.label} style={{
                          padding: "16px 10px",
                          borderRadius: 16,
                          border: `1px solid ${C.border}`,
                          background: "#FAFBFC",
                          cursor: "pointer",
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
                          transition: "all 0.22s ease",
                          fontFamily: "inherit",
                        }}
                          onMouseEnter={e => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.background = a.bg;
                            el.style.borderColor = "transparent";
                            el.style.transform = "translateY(-3px)";
                            el.style.boxShadow = `0 6px 18px ${a.shadowC}`;
                          }}
                          onMouseLeave={e => {
                            const el = e.currentTarget as HTMLElement;
                            el.style.background = "#FAFBFC";
                            el.style.borderColor = C.border;
                            el.style.transform = "translateY(0)";
                            el.style.boxShadow = "none";
                          }}
                        >
                          <div style={{
                            width: 42, height: 42, borderRadius: 14,
                            background: a.bg, border: `1.5px solid ${a.bg}`,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 17, color: a.color, fontWeight: 700,
                            boxShadow: `0 2px 8px ${a.shadowC}`,
                            transition: "transform 0.22s",
                          }}>{a.icon}</div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.sub, letterSpacing: "0.01em" }}>{a.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Currency holdings */}
                  <div style={{ borderLeft: `1px solid ${C.border}`, paddingLeft: 28 }}>
                    <p style={{ fontSize: 11, color: C.muted, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.09em", marginBottom: 12 }}>Holdings</p>
                    {[
                      { flag: "🇺🇸", code: "USD", balance: "$5,240.00", change: "+2.1%", up: true  },
                      { flag: "🇪🇺", code: "EUR", balance: "€3,200.00",  change: "+0.8%", up: true  },
                      { flag: "🇬🇧", code: "GBP", balance: "£2,150.00",  change: "−0.3%", up: false },
                      { flag: "₿",   code: "BTC", balance: "0.184 BTC",  change: "+4.2%", up: true, sub: "≈ $1,215" },
                    ].map((c, i) => (
                      <div key={i} style={{
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        padding: "9px 0",
                        borderBottom: i < 3 ? `1px solid ${C.border}` : "none",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 18, lineHeight: 1 }}>{c.flag}</span>
                          <div>
                            <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text, lineHeight: 1.2 }}>{c.balance}</p>
                            {c.sub && <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{c.sub}</p>}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: 12, color: "#64748B", fontWeight: 500, marginBottom: 2 }}>{c.code}</p>
                          <span style={{
                            fontSize: 11, fontWeight: 700,
                            color: c.up ? "#059669" : "#EF4444",
                            background: c.up ? "#ECFDF5" : "#FEF2F2",
                            borderRadius: 6, padding: "1px 6px",
                          }}>{c.change}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* ── Spending Overview / Chart ── */}
              <div style={{
                background: C.card, borderRadius: 22, padding: "28px 30px",
                boxShadow: C.shadow, border: `1px solid ${C.border}`,
                transition: "box-shadow 0.25s ease, transform 0.25s ease",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = C.shadowHv; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = C.shadow; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
                  <div>
                    <p style={{ fontSize: 15.5, fontWeight: 700, color: C.text, marginBottom: 4 }}>Spending Overview</p>
                    <p style={{ fontSize: 12.5, color: C.muted }}>Last 7 days · March 2025</p>
                  </div>
                  <div style={{ display: "flex", gap: 4, background: C.bg, borderRadius: 10, padding: 3 }}>
                    {["7D", "1M", "3M"].map((t, i) => (
                      <button key={t} style={{
                        padding: "5px 14px", borderRadius: 8,
                        border: "none",
                        background: i === 0 ? "#fff" : "transparent",
                        color: i === 0 ? C.text : C.muted,
                        fontSize: 12.5, fontWeight: i === 0 ? 700 : 500,
                        cursor: "pointer", fontFamily: "inherit",
                        boxShadow: i === 0 ? "0 1px 4px rgba(15,23,42,0.08)" : "none",
                        transition: "all 0.15s",
                      }}>{t}</button>
                    ))}
                  </div>
                </div>

                {/* Metric pills */}
                <div style={{ display: "flex", gap: 14, marginBottom: 28 }}>
                  {[
                    { label: "Total Spent",  value: "$1,510",   color: "#EF4444", bg: "#FEF2F2", border: "#FECACA" },
                    { label: "Total Income", value: "+$1,000",  color: "#059669", bg: "#ECFDF5", border: "#A7F3D0" },
                    { label: "Net Change",   value: "−$510",    color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
                  ].map(m => (
                    <div key={m.label} style={{
                      flex: 1, background: m.bg,
                      border: `1px solid ${m.border}`,
                      borderRadius: 14, padding: "14px 18px",
                    }}>
                      <p style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{m.label}</p>
                      <p style={{ fontSize: 20, fontWeight: 800, color: m.color, letterSpacing: "-0.5px" }}>{m.value}</p>
                    </div>
                  ))}
                </div>

                {/* Bar chart — taller and richer */}
                <div style={{ position: "relative", height: 160, paddingLeft: 36 }}>
                  {/* Y-axis labels */}
                  {[0, 250, 500, 750, 1000].map((v, i) => (
                    <div key={v} style={{
                      position: "absolute", left: 0,
                      bottom: `${(v / maxSpend) * 130}px`,
                      fontSize: 10, color: C.muted, fontWeight: 500,
                      lineHeight: 1, width: 30, textAlign: "right",
                    }}>{v === 0 ? "" : v >= 1000 ? "1k" : v}</div>
                  ))}
                  {/* Grid lines */}
                  {[250, 500, 750, 1000].map(v => (
                    <div key={v} style={{
                      position: "absolute", left: 36, right: 0,
                      bottom: `${(v / maxSpend) * 130}px`,
                      borderTop: "1px dashed rgba(15,23,42,0.06)",
                    }} />
                  ))}
                  {/* Bars */}
                  <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: "100%", paddingBottom: 24 }}>
                    {spendingData.map((d, i) => {
                      const isToday = i === 4;
                      const barH = Math.max((d.amount / maxSpend) * 130, 4);
                      const incomeH = d.income > 0 ? (d.income / maxSpend) * 130 : 0;
                      return (
                        <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, position: "relative", height: "100%" }}>
                          {/* Income bar */}
                          {incomeH > 0 && (
                            <div style={{
                              position: "absolute", bottom: 24,
                              width: "55%",
                              height: incomeH,
                              background: "linear-gradient(180deg, #34D399 0%, #10B981 100%)",
                              borderRadius: "5px 5px 0 0",
                              opacity: 0.3,
                            }} />
                          )}
                          {/* Spend bar */}
                          <div style={{
                            position: "absolute", bottom: 24,
                            width: "42%",
                            height: barH,
                            background: isToday
                              ? "linear-gradient(180deg, #3B82F6 0%, #1A73E8 100%)"
                              : "linear-gradient(180deg, #BFDBFE 0%, #93C5FD 100%)",
                            borderRadius: "5px 5px 0 0",
                            transition: "opacity 0.2s, transform 0.2s",
                            cursor: "pointer",
                            boxShadow: isToday ? "0 4px 12px rgba(26,115,232,0.3)" : "none",
                          }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.78"; (e.currentTarget as HTMLElement).style.transform = "scaleX(1.15)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; (e.currentTarget as HTMLElement).style.transform = "scaleX(1)"; }}
                          />
                          {/* Day label */}
                          <span style={{
                            position: "absolute", bottom: 4,
                            fontSize: 10.5, fontWeight: isToday ? 700 : 500,
                            color: isToday ? C.blue : C.muted,
                          }}>{d.day}</span>
                          {/* Today dot */}
                          {isToday && <div style={{ position: "absolute", bottom: 17, width: 4, height: 4, borderRadius: "50%", background: C.blue }} />}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div style={{ display: "flex", gap: 20, marginTop: 10, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                  {[
                    { color: "#1A73E8", label: "Spending" },
                    { color: "#10B981", label: "Income" },
                  ].map(l => (
                    <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: l.color, opacity: l.color === "#10B981" ? 0.5 : 1 }} />
                      <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{l.label}</span>
                    </div>
                  ))}
                  <div style={{ marginLeft: "auto", fontSize: 12, color: C.muted, display: "flex", alignItems: "center", gap: 5 }}>
                    <div style={{ width: 4, height: 4, borderRadius: "50%", background: C.blue }} />
                    Today: Fri Mar 7
                  </div>
                </div>
              </div>

              {/* ── Recent Transactions ── */}
              <div style={{
                background: C.card, borderRadius: 22, padding: "28px 30px",
                boxShadow: C.shadow, border: `1px solid ${C.border}`,
                transition: "box-shadow 0.25s ease, transform 0.25s ease",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = C.shadowHv; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = C.shadow; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
                  <div>
                    <p style={{ fontSize: 15.5, fontWeight: 700, color: C.text, marginBottom: 3 }}>Recent Transactions</p>
                    <p style={{ fontSize: 12, color: C.muted }}>3 transactions this week</p>
                  </div>
                  <Link href="/dashboard/transactions" style={{
                    fontSize: 13, color: C.blue, textDecoration: "none", fontWeight: 600,
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "7px 14px", borderRadius: 10,
                    background: "#EEF4FF", border: "1px solid rgba(26,115,232,0.15)",
                    transition: "all 0.15s",
                  }}>View all →</Link>
                </div>
                {transactions.map((tx, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "15px 12px", margin: "0 -12px",
                    borderBottom: i < transactions.length - 1 ? `1px solid ${C.border}` : "none",
                    borderRadius: 14, cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.bg}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      {/* Icon */}
                      <div style={{
                        width: 46, height: 46, borderRadius: 15,
                        background: tx.iconBg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 19, color: tx.iconColor, flexShrink: 0,
                        boxShadow: "0 3px 10px rgba(15,23,42,0.1)",
                      }}>{tx.icon}</div>
                      {/* Info */}
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{tx.name}</p>
                          <span style={{
                            fontSize: 10.5, fontWeight: 600,
                            color: tx.badgeColor, background: tx.badgeBg,
                            borderRadius: 6, padding: "2px 7px",
                          }}>{tx.badge}</span>
                        </div>
                        <p style={{ fontSize: 12, color: C.muted }}>
                          {tx.sub} <span style={{ color: C.border }}>·</span> {tx.date}
                        </p>
                      </div>
                    </div>
                    {/* Amount */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ fontSize: 15.5, fontWeight: 700, color: tx.color, letterSpacing: "-0.3px" }}>{tx.amount}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 3 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22C55E" }} />
                        <p style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>Completed</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ════ RIGHT column ════ */}
            <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>

              {/* Quick Transfers */}
              <div style={{
                background: C.card, borderRadius: 22, padding: "24px 22px",
                boxShadow: C.shadow, border: `1px solid ${C.border}`,
                transition: "box-shadow 0.25s ease",
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = C.shadowHv}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = C.shadow}
              >
                <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 18 }}>Quick Transfer</p>
                <div style={{ display: "flex", gap: 10, marginBottom: 22, justifyContent: "center" }}>
                  {contacts.map(c => (
                    <div key={c.name} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, cursor: "pointer" }}>
                      <div style={{
                        width: 54, height: 54, borderRadius: 18,
                        background: c.bg,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 18, fontWeight: 700, color: "#fff",
                        boxShadow: "0 4px 14px rgba(15,23,42,0.14)",
                        transition: "all 0.22s ease",
                      }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 24px rgba(15,23,42,0.2)"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(15,23,42,0.14)"; }}
                      >{c.initials}</div>
                      <span style={{ fontSize: 12, color: C.sub, fontWeight: 500 }}>{c.name}</span>
                    </div>
                  ))}
                </div>
                {/* Amount input */}
                <div style={{ background: C.bg, borderRadius: 14, padding: "12px 16px", marginBottom: 14, border: `1px solid ${C.border}` }}>
                  <p style={{ fontSize: 10.5, color: C.muted, fontWeight: 600, marginBottom: 5, textTransform: "uppercase", letterSpacing: "0.07em" }}>Amount</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 18, fontWeight: 700, color: C.muted }}>$</span>
                    <input defaultValue="100.00" style={{
                      flex: 1, background: "transparent", border: "none", outline: "none",
                      fontSize: 22, fontWeight: 800, color: C.text, fontFamily: "inherit",
                      letterSpacing: "-0.5px",
                    }} />
                  </div>
                </div>
                <button style={{
                  width: "100%", padding: "14px", borderRadius: 14, border: "none",
                  background: C.navy, color: "#fff", fontSize: 14, fontWeight: 600,
                  cursor: "pointer", transition: "all 0.22s ease", fontFamily: "inherit",
                  boxShadow: "0 4px 16px rgba(15,23,42,0.2)",
                  letterSpacing: "0.01em",
                }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = "#1e293b";
                    (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(15,23,42,0.28)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = C.navy;
                    (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                    (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(15,23,42,0.2)";
                  }}
                >Send Money</button>
              </div>

              {/* Virtual Card */}
              <div style={{
                background: "linear-gradient(135deg, #2563EB 0%, #1e40af 50%, #0F172A 100%)",
                borderRadius: 22,
                padding: "22px 22px",
                boxShadow: "0 10px 36px rgba(37,99,235,0.3), 0 0 0 1px rgba(255,255,255,0.06)",
                position: "relative", overflow: "hidden",
                transition: "transform 0.25s ease, box-shadow 0.25s ease",
              }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 20px 50px rgba(37,99,235,0.38), 0 0 0 1px rgba(255,255,255,0.1)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                  (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 36px rgba(37,99,235,0.3), 0 0 0 1px rgba(255,255,255,0.06)";
                }}
              >
                {/* Texture */}
                <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.04)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -70, left: -40, width: 220, height: 220, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", top: 20, right: 20, width: 60, height: 60, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />

                {/* Top row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22, position: "relative" }}>
                  <div>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 4 }}>Vaulte</p>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.85)", fontWeight: 500 }}>Premium Card</p>
                  </div>
                  <div style={{ display: "flex" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#EF4444", opacity: 0.85 }} />
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#F59E0B", opacity: 0.85, marginLeft: -11 }} />
                  </div>
                </div>

                {/* Chip */}
                <div style={{
                  width: 38, height: 28, borderRadius: 5, marginBottom: 18,
                  background: "linear-gradient(135deg, #CA8A04, #FBBF24, #CA8A04)",
                  boxShadow: "inset 0 1px 3px rgba(255,255,255,0.35), 0 2px 6px rgba(0,0,0,0.3)",
                  position: "relative",
                }}>
                  <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(100,50,0,0.25)", transform: "translateX(-50%)" }} />
                  <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(100,50,0,0.25)", transform: "translateY(-50%)" }} />
                  <div style={{ position: "absolute", top: "25%", left: "25%", right: "25%", bottom: "25%", border: "0.5px solid rgba(100,50,0,0.2)", borderRadius: 2 }} />
                </div>

                {/* Card number */}
                <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.65)", letterSpacing: "0.2em", marginBottom: 22, fontFamily: "monospace" }}>4532 •••• •••• 4410</p>

                {/* Bottom row */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 5 }}>Card Holder</p>
                    <p style={{ fontSize: 14, color: "#fff", fontWeight: 600, letterSpacing: "0.04em" }}>John Doe</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 5 }}>Expires</p>
                    <p style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>08/28</p>
                  </div>
                </div>
              </div>

              {/* Account Status */}
              <div style={{
                background: C.card, borderRadius: 22, padding: "22px 22px",
                boxShadow: C.shadow, border: `1px solid ${C.border}`,
                transition: "box-shadow 0.25s ease",
              }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = C.shadowHv}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = C.shadow}
              >
                <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 18 }}>Account Status</p>
                {[
                  { label: "KYC Verification", status: "Verified",  color: "#059669", bg: "#ECFDF5", dot: "#22C55E" },
                  { label: "2FA Security",      status: "Enabled",   color: "#1A73E8", bg: "#EEF4FF", dot: "#60A5FA" },
                  { label: "Card Status",        status: "Active",    color: "#059669", bg: "#ECFDF5", dot: "#22C55E" },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "11px 0",
                    borderBottom: i < 2 ? `1px solid ${C.border}` : "none",
                  }}>
                    <span style={{ fontSize: 13, color: C.sub, fontWeight: 400 }}>{item.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, background: item.bg, borderRadius: 20, padding: "4px 11px" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: item.dot, boxShadow: `0 0 0 2px ${item.bg}` }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: item.color }}>{item.status}</span>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          </div>
        </main>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        @media (max-width: 1100px) {
          aside { display: none !important; }
          div[style*="margin-left: 236px"] { margin-left: 0 !important; }
        }
        @media (max-width: 860px) {
          main > div:last-child { grid-template-columns: 1fr !important; }
        }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(15,23,42,0.1); border-radius: 99px; }
        ::-webkit-scrollbar-thumb:hover { background: rgba(15,23,42,0.18); }
      `}</style>
    </div>
  );
}
