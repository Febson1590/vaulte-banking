"use client";
import Link from "next/link";

const stats = [
  { value: "190+",  label: "Countries Supported" },
  { value: "$2B+",  label: "Transactions Processed" },
  { value: "500K+", label: "Happy Customers" },
];

function PhoneMockup() {
  return (
    <div className="vaulte-phone" style={{ width: 188, height: 380, background: "#0F172A", borderRadius: 34, border: "8px solid #0F172A", boxShadow: "0 30px 60px rgba(0,0,0,0.55)", position: "relative", overflow: "hidden", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 56, height: 10, background: "#0F172A", borderRadius: "0 0 10px 10px", zIndex: 10 }} />
      <div style={{ background: "linear-gradient(160deg,#1A73E8 0%,#0F3D91 100%)", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "18px 13px 9px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div style={{ width: 14, height: 14, background: "rgba(255,255,255,0.25)", borderRadius: 4 }} />
            <span style={{ fontSize: 10, fontWeight: 800, color: "#fff" }}>Vaulte</span>
          </div>
          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.6)" }}>⚙</span>
        </div>
        <div style={{ padding: "2px 13px 12px" }}>
          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.55)", marginBottom: 2 }}>Total Balance</p>
          <p style={{ fontSize: 20, fontWeight: 900, color: "#fff", marginBottom: 10 }}>$12,540.75</p>
          <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
            {["$8,976 •1","Peter Scanth"].map((b,i) => (
              <div key={i} style={{ flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 6, padding: "5px 6px", fontSize: 7.5, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{b}</div>
            ))}
          </div>
          <p style={{ fontSize: 8, fontWeight: 700, color: "rgba(255,255,255,0.45)", marginBottom: 7, letterSpacing: "0.06em" }}>BALANCES</p>
          {[
            { amount: "$5,240.00", change: "+$5,200", pos: true, symbol: "$", bg: "#3B82F6" },
            { amount: "€3,230.00", change: "-320",    pos: false, symbol: "€", bg: "#1A73E8" },
            { amount: "£2,150.00", change: "+84.00",  pos: true, symbol: "£", bg: "#EF4444" },
            { amount: "0.184 BTC", change: "+$1,215", pos: true, symbol: "₿", bg: "#F59E0B" },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: i<3?"1px solid rgba(255,255,255,0.07)":"none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 15, height: 15, borderRadius: "50%", background: r.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7.5, color: "#fff", fontWeight: 700 }}>{r.symbol}</div>
                <span style={{ fontSize: 8.5, color: "#fff", fontWeight: 500 }}>{r.amount}</span>
              </div>
              <span style={{ fontSize: 8.5, fontWeight: 700, color: r.pos ? "#4ADE80" : "#F87171" }}>{r.change}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-around", padding: "8px 0" }}>
          {["🏠","💼","⇄","🛡️"].map((icon, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 12 }}>{icon}</span>
              {i===0 && <div style={{ width: 16, height: 2, background: "#fff", borderRadius: 1 }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LaptopMockup() {
  return (
    <div className="vaulte-laptop" style={{ position: "relative", flexShrink: 0, width: 420 }}>
      <div style={{ background: "#1e293b", borderRadius: "12px 12px 0 0", padding: "6px 6px 0", boxShadow: "0 -8px 32px rgba(0,0,0,0.4)" }}>
        <div style={{ width: "100%", aspectRatio: "16 / 10", background: "#EEF4FF", borderRadius: "7px 7px 0 0", overflow: "hidden", position: "relative" }}>
          {/* Top bar */}
          <div style={{ background: "#fff", height: 30, display: "flex", alignItems: "center", padding: "0 12px", gap: 8, borderBottom: "1px solid #E5E7EB" }}>
            <div style={{ flex: 1, background: "#F3F4F6", borderRadius: 10, height: 16, display: "flex", alignItems: "center", paddingLeft: 9 }}>
              <span style={{ fontSize: 8, color: "#9CA3AF" }}>🔍 Search Markets...</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
              <span style={{ fontSize: 10 }}>🔔</span>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 20, height: 20, borderRadius: "50%", background: "#1A73E8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 8, color: "#fff", fontWeight: 700 }}>JD</div>
                <div>
                  <p style={{ fontSize: 8, fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>John Doe</p>
                  <p style={{ fontSize: 7, color: "#22C55E" }}>✓ Verified</p>
                </div>
              </div>
            </div>
          </div>
          {/* Tab bar */}
          <div style={{ background: "#fff", height: 24, display: "flex", alignItems: "flex-end", padding: "0 12px", gap: 3, borderBottom: "1px solid #E5E7EB" }}>
            {["Dashboard","Accounts","Transfers","Cards","Help"].map(t => (
              <span key={t} style={{ fontSize: 8, padding: "0 7px 4px", fontWeight: t==="Dashboard"?700:400, color: t==="Dashboard"?"#1A73E8":"#6B7280", borderBottom: t==="Dashboard"?"2px solid #1A73E8":"2px solid transparent" }}>{t}</span>
            ))}
          </div>
          {/* Content */}
          <div style={{ display: "flex", height: "calc(100% - 54px)" }}>
            {/* Sidebar */}
            <div style={{ width: 96, background: "#1A73E8", padding: "9px 7px", display: "flex", flexDirection: "column", gap: 2, flexShrink: 0 }}>
              {["Dashboard","Accounts","Transfers","Cards","Settings"].map((item, i) => (
                <div key={item} style={{ padding: "5px 7px", borderRadius: 4, background: i===0?"rgba(255,255,255,0.2)":"transparent", fontSize: 8, color: "#fff", fontWeight: i===0?700:400 }}>{item}</div>
              ))}
              <div style={{ marginTop: "auto", background: "rgba(0,0,0,0.18)", borderRadius: 6, padding: "7px" }}>
                <p style={{ fontSize: 7, color: "rgba(255,255,255,0.6)", marginBottom: 1 }}>Your Balance</p>
                <p style={{ fontSize: 12, fontWeight: 800, color: "#fff" }}>$12,540.75</p>
                <p style={{ fontSize: 7, color: "#4ADE80", marginBottom: 5 }}>▲ +$256.00</p>
                {["USD $5,240","EUR €3,200","GBP £2,150"].map(c => (
                  <div key={c} style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: 7, color: "rgba(255,255,255,0.7)" }}>{c.split(" ")[0]}</span>
                    <span style={{ fontSize: 7, color: "#fff", fontWeight: 600 }}>{c.split(" ")[1]}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Main */}
            <div style={{ flex: 1, padding: "9px", overflowY: "hidden" }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#0F172A", marginBottom: 6 }}>Welcome back, John Doe 👋</p>
              <div style={{ background: "#fff", borderRadius: 6, padding: "8px", marginBottom: 6, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <p style={{ fontSize: 7, color: "#9CA3AF", marginBottom: 1 }}>Total Balance</p>
                <p style={{ fontSize: 14, fontWeight: 900, color: "#0F172A", marginBottom: 1 }}>$12,540.75</p>
                <p style={{ fontSize: 7, color: "#22C55E", fontWeight: 600, marginBottom: 6 }}>▲ +$26.00 Today</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
                  {["Send Money","Request Money","Exchange","Add Funds"].map(a => (
                    <div key={a} style={{ padding: "3px 5px", border: "1px solid #E5E7EB", borderRadius: 4, fontSize: 7, color: "#1A73E8", fontWeight: 600, textAlign: "center" }}>{a}</div>
                  ))}
                </div>
              </div>
              <div style={{ background: "#fff", borderRadius: 6, padding: "8px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <p style={{ fontSize: 8, fontWeight: 700, color: "#0F172A", marginBottom: 5 }}>Recent Transactions</p>
                {[["Bitcoin Purchase","-$500.00","#EF4444"],["ATM Withdrawal","-$200.00","#EF4444"],["Transfer Received","+$1,000.00","#22C55E"]].map(([name,amt,color],i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0", borderBottom: i<2?"1px solid #F3F4F6":"none" }}>
                    <span style={{ fontSize: 7.5, color: "#374151" }}>{name}</span>
                    <span style={{ fontSize: 7.5, fontWeight: 700, color }}>{amt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ background: "#94a3b8", height: 14, borderRadius: "0 0 3px 3px", width: "100%" }} />
      <div style={{ background: "#64748b", height: 6, borderRadius: "0 0 6px 6px", width: "120%", marginLeft: "-10%" }} />
    </div>
  );
}

export default function Hero() {
  return (
    <section className="hero-section" style={{
      background:    "linear-gradient(145deg,#06091A 0%,#0B1836 50%,#0D2060 100%)",
      position:      "relative",
      overflow:      "hidden",
      paddingTop:    "calc(96px + env(safe-area-inset-top,0px))",
      paddingBottom: 80,
    }}>
      {/* Subtle grid texture */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, opacity: 0.025, backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "48px 48px", pointerEvents: "none" }} />
      {/* Glow blobs */}
      <div aria-hidden="true" style={{ position: "absolute", top: "10%",    right: "5%", width: 560, height: 560, borderRadius: "50%", background: "rgba(37,99,235,0.14)",  filter: "blur(100px)", pointerEvents: "none" }} />
      <div aria-hidden="true" style={{ position: "absolute", bottom: "10%", left:  "0%", width: 400, height: 400, borderRadius: "50%", background: "rgba(167,139,250,0.08)", filter: "blur(90px)",  pointerEvents: "none" }} />

      <div className="hero-container" style={{ position: "relative", maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div className="hero-grid" style={{
          display:             "grid",
          gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)",
          gap:                 56,
          alignItems:          "center",
        }}>
          {/* LEFT */}
          <div className="hero-left" style={{ minWidth: 0 }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 999, padding: "6px 14px", marginBottom: 20 }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
              <span style={{ fontSize: 12, color: "#22C55E", fontWeight: 600, letterSpacing: "0.04em" }}>Now live in 190+ countries</span>
            </div>
            <h1 className="hero-heading" style={{ fontSize: "clamp(34px, 6vw, 64px)", fontWeight: 900, color: "#fff", lineHeight: 1.05, letterSpacing: "-0.02em", marginBottom: 16 }}>
              Global Digital<br />Banking
            </h1>
            <p className="hero-desc" style={{ fontSize: "clamp(15px, 1.6vw, 17px)", color: "rgba(255,255,255,0.72)", lineHeight: 1.65, marginBottom: 28, maxWidth: 520 }}>
              Borderless banking for everyone. Send, save, and manage money worldwide with bank-level security.
            </p>
            <div className="hero-cta" style={{ display: "flex", gap: 12, marginBottom: 36, flexWrap: "wrap" }}>
              <Link href="/register" className="hero-btn-primary"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "14px 26px", background: "linear-gradient(135deg,#2563EB,#1D4ED8)", color: "#fff", borderRadius: 12, fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 4px 24px rgba(37,99,235,0.5)", transition: "all 0.2s", letterSpacing: "0.01em" }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(37,99,235,0.65)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(37,99,235,0.5)"; }}
              >
                Open Free Account
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="#how-it-works" className="hero-btn-secondary"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "14px 24px", border: "1px solid rgba(255,255,255,0.22)", color: "#fff", borderRadius: 12, fontWeight: 600, fontSize: 15, textDecoration: "none", background: "rgba(255,255,255,0.05)", transition: "all 0.2s" }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
              >Watch How It Works</Link>
            </div>
            <ul className="hero-stats" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 12, padding: 0, margin: 0, listStyle: "none" }}>
              {stats.map((s, i) => (
                <li key={i} className="hero-stat" style={{ minWidth: 0, paddingLeft: i > 0 ? 16 : 0, borderLeft: i > 0 ? "1px solid rgba(255,255,255,0.12)" : "none" }}>
                  <div className="hero-stat-val" style={{ fontSize: "clamp(18px, 2.2vw, 26px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px", lineHeight: 1.1 }}>{s.value}</div>
                  <div className="hero-stat-label" style={{ fontSize: "clamp(11px, 1.1vw, 12px)", color: "rgba(255,255,255,0.5)", marginTop: 4, lineHeight: 1.3 }}>{s.label}</div>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT — mockups */}
          <div className="hero-right" style={{ minWidth: 0, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 18, position: "relative" }}>
            <div className="hero-mockups" style={{ display: "flex", alignItems: "flex-end", gap: 18 }}>
              <div style={{ marginBottom: 28, position: "relative", zIndex: 2 }}><PhoneMockup /></div>
              <div style={{ position: "relative", zIndex: 1 }}><LaptopMockup /></div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        /* ── Tablet (≤ 1024) — shrink mockups ────────────────────────────── */
        @media (max-width: 1024px) {
          .hero-section .hero-mockups { transform: scale(0.82); transform-origin: center right; }
        }

        /* ── ≤ 900 — stack columns, visuals below text ───────────────────── */
        @media (max-width: 900px) {
          .hero-section { padding-bottom: 64px !important; }
          .hero-grid { grid-template-columns: 1fr !important; gap: 40px !important; }
          .hero-right { justify-content: center !important; }
          .hero-mockups { transform: scale(0.8) !important; transform-origin: center !important; }
        }

        /* ── ≤ 640 — tighter type + stacked mockups ──────────────────────── */
        @media (max-width: 640px) {
          .hero-section { padding-top: calc(88px + env(safe-area-inset-top, 0px)) !important; padding-bottom: 56px !important; }
          .hero-container { padding: 0 20px !important; }
          .hero-desc { font-size: 15px !important; line-height: 1.6 !important; margin-bottom: 24px !important; }
          .hero-cta { flex-direction: column !important; gap: 10px !important; align-items: stretch !important; margin-bottom: 32px !important; }
          .hero-cta a { width: 100% !important; }
          .hero-mockups {
            transform: scale(0.68) !important;
            transform-origin: top center !important;
            margin-top: 8px;
            margin-bottom: -120px; /* reclaim space the scale leaves */
          }
          .hero-stat { padding-left: 10px !important; }
        }

        /* ── ≤ 400 — stack mockups vertically ─────────────────────────────── */
        @media (max-width: 400px) {
          .hero-mockups {
            flex-direction: column !important;
            align-items: center !important;
            gap: 22px !important;
            transform: none !important;
            margin-bottom: 0 !important;
          }
          .hero-mockups > div { margin-bottom: 0 !important; }
          .vaulte-laptop { width: 320px !important; }
          .vaulte-phone { width: 160px !important; height: 325px !important; }
        }
      `}</style>
    </section>
  );
}
