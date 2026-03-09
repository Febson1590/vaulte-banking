"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const stats = [
  { value: "190+", label: "Countries Supported" },
  { value: "$2B+", label: "Transactions Processed" },
  { value: "500K+", label: "Happy Customers" },
];

function PhoneMockup() {
  return (
    <div style={{ width: 160, height: 318, background: "#0F172A", borderRadius: 30, border: "7px solid #0F172A", boxShadow: "0 28px 56px rgba(0,0,0,0.5)", position: "relative", overflow: "hidden", flexShrink: 0 }}>
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 48, height: 9, background: "#0F172A", borderRadius: "0 0 8px 8px", zIndex: 10 }} />
      <div style={{ background: "linear-gradient(160deg,#1A73E8 0%,#0F3D91 100%)", height: "100%", display: "flex", flexDirection: "column" }}>
        <div style={{ padding: "16px 11px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 13, height: 13, background: "rgba(255,255,255,0.25)", borderRadius: 4 }} />
            <span style={{ fontSize: 9, fontWeight: 800, color: "#fff" }}>Vaulte</span>
          </div>
          <span style={{ fontSize: 9, color: "rgba(255,255,255,0.6)" }}>⚙</span>
        </div>
        <div style={{ padding: "2px 11px 10px" }}>
          <p style={{ fontSize: 8, color: "rgba(255,255,255,0.55)", marginBottom: 1 }}>Total Balance</p>
          <p style={{ fontSize: 17, fontWeight: 900, color: "#fff", marginBottom: 8 }}>$12,540.75</p>
          <div style={{ display: "flex", gap: 5, marginBottom: 12 }}>
            {["$8,976 •1","Peter Scanth"].map((b,i) => (
              <div key={i} style={{ flex: 1, background: "rgba(255,255,255,0.12)", borderRadius: 5, padding: "4px 5px", fontSize: 6.5, color: "rgba(255,255,255,0.8)", fontWeight: 600 }}>{b}</div>
            ))}
          </div>
          <p style={{ fontSize: 7, fontWeight: 700, color: "rgba(255,255,255,0.45)", marginBottom: 6, letterSpacing: "0.06em" }}>BALANCES</p>
          {[
            { amount: "$5,240.00", change: "+$5,200", pos: true, symbol: "$", bg: "#3B82F6" },
            { amount: "€3,230.00", change: "-320", pos: false, symbol: "€", bg: "#1A73E8" },
            { amount: "£2,150.00", change: "+84.00", pos: true, symbol: "£", bg: "#EF4444" },
            { amount: "0.184 BTC", change: "$1,215.75", pos: true, symbol: "₿", bg: "#F59E0B" },
          ].map((r, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "3.5px 0", borderBottom: i<3?"1px solid rgba(255,255,255,0.07)":"none" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <div style={{ width: 13, height: 13, borderRadius: "50%", background: r.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 6.5, color: "#fff", fontWeight: 700 }}>{r.symbol}</div>
                <span style={{ fontSize: 7.5, color: "#fff", fontWeight: 500 }}>{r.amount}</span>
              </div>
              <span style={{ fontSize: 7.5, fontWeight: 700, color: r.pos ? "#4ADE80" : "#F87171" }}>{r.change}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.1)", display: "flex", justifyContent: "space-around", padding: "7px 0" }}>
          {["🏠","💼","⇄","🛡️"].map((icon, i) => (
            <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
              <span style={{ fontSize: 11 }}>{icon}</span>
              {i===0 && <div style={{ width: 14, height: 2, background: "#fff", borderRadius: 1 }} />}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function LaptopMockup() {
  return (
    <div style={{ position: "relative", flexShrink: 0 }}>
      <div style={{ background: "#1e293b", borderRadius: "10px 10px 0 0", padding: "5px 5px 0", boxShadow: "0 -6px 28px rgba(0,0,0,0.35)" }}>
        <div style={{ width: 370, height: 234, background: "#EEF4FF", borderRadius: "6px 6px 0 0", overflow: "hidden" }}>
          {/* Top bar */}
          <div style={{ background: "#fff", height: 28, display: "flex", alignItems: "center", padding: "0 10px", gap: 8, borderBottom: "1px solid #E5E7EB" }}>
            <div style={{ flex: 1, background: "#F3F4F6", borderRadius: 10, height: 14, display: "flex", alignItems: "center", paddingLeft: 8 }}>
              <span style={{ fontSize: 7, color: "#9CA3AF" }}>🔍 Search Markets...</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 9 }}>🔔</span>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#1A73E8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 7, color: "#fff", fontWeight: 700 }}>JD</div>
                <div>
                  <p style={{ fontSize: 7, fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>John Doe</p>
                  <p style={{ fontSize: 6, color: "#22C55E" }}>✓ Verified</p>
                </div>
              </div>
            </div>
          </div>
          {/* Tab bar */}
          <div style={{ background: "#fff", height: 22, display: "flex", alignItems: "flex-end", padding: "0 10px", gap: 2, borderBottom: "1px solid #E5E7EB" }}>
            {["Dashboard","Accounts","Transfers","Cards","Help"].map(t => (
              <span key={t} style={{ fontSize: 7, padding: "0 6px 4px", fontWeight: t==="Dashboard"?700:400, color: t==="Dashboard"?"#1A73E8":"#6B7280", borderBottom: t==="Dashboard"?"2px solid #1A73E8":"2px solid transparent" }}>{t}</span>
            ))}
          </div>
          {/* Content */}
          <div style={{ display: "flex", height: "calc(100% - 50px)" }}>
            {/* Sidebar */}
            <div style={{ width: 90, background: "#1A73E8", padding: "8px 6px", display: "flex", flexDirection: "column", gap: 1, flexShrink: 0 }}>
              {["Dashboard","Accounts","Transfers","Cards","Settings"].map((item, i) => (
                <div key={item} style={{ padding: "4px 6px", borderRadius: 4, background: i===0?"rgba(255,255,255,0.2)":"transparent", fontSize: 7, color: "#fff", fontWeight: i===0?700:400 }}>{item}</div>
              ))}
              <div style={{ marginTop: "auto", background: "rgba(0,0,0,0.18)", borderRadius: 6, padding: "6px" }}>
                <p style={{ fontSize: 6, color: "rgba(255,255,255,0.6)", marginBottom: 1 }}>Your Balance</p>
                <p style={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>$12,540.75</p>
                <p style={{ fontSize: 6.5, color: "#4ADE80", marginBottom: 5 }}>▲ +$256.00</p>
                {["USD $5,240","EUR €3,200","GBP £2,150"].map(c => (
                  <div key={c} style={{ display: "flex", justifyContent: "space-between", marginBottom: 2 }}>
                    <span style={{ fontSize: 6, color: "rgba(255,255,255,0.7)" }}>{c.split(" ")[0]}</span>
                    <span style={{ fontSize: 6, color: "#fff", fontWeight: 600 }}>{c.split(" ")[1]}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* Main */}
            <div style={{ flex: 1, padding: "8px", overflowY: "hidden" }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: "#0F172A", marginBottom: 5 }}>Welcome back, John Doe 👋</p>
              <div style={{ background: "#fff", borderRadius: 6, padding: "7px", marginBottom: 5, boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <p style={{ fontSize: 6.5, color: "#9CA3AF", marginBottom: 1 }}>Total Balance</p>
                <p style={{ fontSize: 13, fontWeight: 900, color: "#0F172A", marginBottom: 1 }}>$12,540.75</p>
                <p style={{ fontSize: 6.5, color: "#22C55E", fontWeight: 600, marginBottom: 5 }}>▲ +$26.00 Today</p>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
                  {["Send Money","Request Money","Exchange","Add Funds"].map(a => (
                    <div key={a} style={{ padding: "3px 5px", border: "1px solid #E5E7EB", borderRadius: 4, fontSize: 6, color: "#1A73E8", fontWeight: 600, textAlign: "center" }}>{a}</div>
                  ))}
                </div>
              </div>
              <div style={{ background: "#fff", borderRadius: 6, padding: "7px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
                <p style={{ fontSize: 7, fontWeight: 700, color: "#0F172A", marginBottom: 5 }}>Recent Transactions</p>
                {[["Bitcoin Purchase","-$500.00","#EF4444"],["ATM Withdrawal","-$200.00","#EF4444"],["Transfer Received","+$1,000.00","#22C55E"]].map(([name,amt,color],i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "2.5px 0", borderBottom: i<2?"1px solid #F3F4F6":"none" }}>
                    <span style={{ fontSize: 6.5, color: "#374151" }}>{name}</span>
                    <span style={{ fontSize: 6.5, fontWeight: 700, color }}>{amt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ background: "#94a3b8", height: 12, borderRadius: "0 0 3px 3px", width: "100%" }} />
      <div style={{ background: "#64748b", height: 5, borderRadius: "0 0 6px 6px", width: "120%", marginLeft: "-10%" }} />
    </div>
  );
}

export default function Hero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 80); }, []);

  return (
    <section style={{
      background: "linear-gradient(145deg,#0F172A 0%,#1a3a7a 45%,#1A73E8 100%)",
      minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "center",
      padding: "100px 5% 60px", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", inset: 0, opacity: 0.03, backgroundImage: "linear-gradient(rgba(255,255,255,1) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,1) 1px,transparent 1px)", backgroundSize: "44px 44px" }} />
      <div style={{ position: "absolute", top: "10%", right: "5%", width: 480, height: 480, borderRadius: "50%", background: "rgba(26,115,232,0.12)", filter: "blur(80px)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48, alignItems: "center" }}>
        {/* LEFT */}
        <div style={{ opacity: visible?1:0, transform: visible?"translateY(0)":"translateY(24px)", transition: "all 0.7s ease" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: 999, padding: "5px 14px", marginBottom: 24 }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
            <span style={{ fontSize: 12, color: "#22C55E", fontWeight: 600, letterSpacing: "0.04em" }}>Now live in 190+ countries</span>
          </div>
          <h1 style={{ fontSize: "clamp(38px,5.5vw,66px)", fontWeight: 900, color: "#fff", lineHeight: 1.08, letterSpacing: "-2px", marginBottom: 20 }}>
            Global Digital<br />Banking
          </h1>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.72)", lineHeight: 1.75, marginBottom: 36, maxWidth: 460 }}>
            Borderless banking for everyone. Send, save, and manage money worldwide with bank-level security.
          </p>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 52 }}>
            <Link href="/register" style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "13px 26px", background: "#1A73E8", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 4px 18px rgba(26,115,232,0.55)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "#1557b0"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "#1A73E8"; e.currentTarget.style.transform = "translateY(0)"; }}
            >Open Free Account <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg></Link>
            <Link href="#how-it-works" style={{ display: "inline-flex", alignItems: "center", padding: "13px 24px", border: "2px solid rgba(255,255,255,0.28)", color: "#fff", borderRadius: 10, fontWeight: 600, fontSize: 15, textDecoration: "none", background: "rgba(255,255,255,0.06)", transition: "all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.13)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            >Watch How It Works</Link>
          </div>
          <div style={{ display: "flex", gap: 0, flexWrap: "wrap" }}>
            {stats.map((s, i) => (
              <div key={i} style={{ paddingRight: 40, paddingLeft: i>0?40:0, borderLeft: i>0?"1px solid rgba(255,255,255,0.15)":"none" }}>
                <div style={{ fontSize: 26, fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>{s.value}</div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ opacity: visible?1:0, transform: visible?"translateY(0)":"translateY(32px)", transition: "all 0.9s ease 0.15s", display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 16, position: "relative" }}>
          <div style={{ marginBottom: 28, position: "relative", zIndex: 2 }}><PhoneMockup /></div>
          <div style={{ position: "relative", zIndex: 1 }}><LaptopMockup /></div>
        </div>
      </div>
      <style>{`@media (max-width: 900px){section>div{grid-template-columns:1fr!important;}section>div>div:last-child{display:none!important;}}`}</style>
    </section>
  );
}
