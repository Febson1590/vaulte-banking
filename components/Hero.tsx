"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

const stats = [
  { value: "190+", label: "Countries Supported" },
  { value: "$2B+", label: "Transactions Processed" },
  { value: "500K+", label: "Happy Customers" },
];

export default function Hero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setTimeout(() => setVisible(true), 100); }, []);

  return (
    <section style={{
      background: "linear-gradient(135deg, #0F172A 0%, #1e3a6e 50%, #1A73E8 100%)",
      minHeight: "100vh", display: "flex", alignItems: "center",
      padding: "120px 5% 80px", position: "relative", overflow: "hidden",
    }}>
      {/* Background grid */}
      <div style={{
        position: "absolute", inset: 0, opacity: 0.04,
        backgroundImage: "linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)",
        backgroundSize: "40px 40px",
      }} />

      {/* Glow circles */}
      <div style={{ position: "absolute", top: "10%", right: "5%", width: 400, height: 400, borderRadius: "50%", background: "rgba(26,115,232,0.15)", filter: "blur(80px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", left: "10%", width: 300, height: 300, borderRadius: "50%", background: "rgba(34,197,94,0.1)", filter: "blur(60px)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>

        {/* Left — Text */}
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(30px)", transition: "all 0.7s ease" }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)",
            borderRadius: 999, padding: "6px 16px", marginBottom: 24,
          }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
            <span style={{ fontSize: 13, color: "#22C55E", fontWeight: 600, letterSpacing: "0.05em" }}>Now live in 190+ countries</span>
          </div>

          <h1 style={{ fontSize: "clamp(36px, 5vw, 62px)", fontWeight: 900, color: "#fff", lineHeight: 1.1, letterSpacing: "-1.5px", marginBottom: 20 }}>
            Global Digital<br />
            <span style={{ color: "#1A73E8", textShadow: "0 0 40px rgba(26,115,232,0.5)" }}>Banking</span>
          </h1>

          <p style={{ fontSize: 18, color: "rgba(255,255,255,0.75)", lineHeight: 1.75, marginBottom: 36, maxWidth: 480 }}>
            Borderless banking for everyone. Send, save, and manage money worldwide with bank-level security and zero hidden fees.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 52 }}>
            <Link href="/register" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 30px", background: "#1A73E8", color: "#fff",
              borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: "none",
              boxShadow: "0 4px 20px rgba(26,115,232,0.5)",
              transition: "all 0.2s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "#1557b0"; e.currentTarget.style.transform = "translateY(-2px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "#1A73E8"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              Open Free Account
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
            </Link>
            <Link href="#how-it-works" style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "14px 28px", border: "2px solid rgba(255,255,255,0.3)", color: "#fff",
              borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: "none",
              backdropFilter: "blur(8px)", background: "rgba(255,255,255,0.05)",
              transition: "all 0.2s",
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.12)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            >Watch How It Works</Link>
          </div>

          {/* Stats row */}
          <div style={{ display: "flex", gap: 36, flexWrap: "wrap" }}>
            {stats.map((s, i) => (
              <div key={i}>
                <div style={{ fontSize: 26, fontWeight: 800, color: "#fff" }}>{s.value}</div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — Dashboard Mockup */}
        <div style={{ opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(40px)", transition: "all 0.9s ease 0.2s" }}>
          <div style={{
            background: "rgba(255,255,255,0.06)", backdropFilter: "blur(20px)",
            border: "1px solid rgba(255,255,255,0.12)", borderRadius: 20,
            padding: 24, boxShadow: "0 25px 60px rgba(0,0,0,0.35)",
          }}>
            {/* Mockup Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 4 }}>Total Balance</div>
                <div style={{ fontSize: 32, fontWeight: 800, color: "#fff" }}>$24,580.00</div>
              </div>
              <div style={{
                background: "#1A73E8", borderRadius: 12, padding: "8px 16px",
                fontSize: 13, color: "#fff", fontWeight: 600,
              }}>+12.5% ↑</div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 20 }}>
              {[
                { icon: "↑", label: "Send", color: "#1A73E8" },
                { icon: "↓", label: "Receive", color: "#22C55E" },
                { icon: "⇄", label: "Exchange", color: "#8B5CF6" },
                { icon: "⊕", label: "Top Up", color: "#F59E0B" },
              ].map((action) => (
                <div key={action.label} style={{ textAlign: "center" }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, margin: "0 auto 6px",
                    background: `${action.color}20`, display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 18, color: action.color, fontWeight: 700,
                  }}>{action.icon}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.6)" }}>{action.label}</div>
                </div>
              ))}
            </div>

            {/* Recent Transactions */}
            <div style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: 16 }}>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginBottom: 12, fontWeight: 600, letterSpacing: "0.08em" }}>RECENT TRANSACTIONS</div>
              {[
                { name: "Netflix Subscription", amount: "-$15.99", type: "debit", time: "Today, 9:41 AM" },
                { name: "Salary Payment", amount: "+$5,200.00", type: "credit", time: "Yesterday" },
                { name: "Amazon Purchase", amount: "-$89.50", type: "debit", time: "Mar 7" },
              ].map((tx, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < 2 ? "1px solid rgba(255,255,255,0.06)" : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 36, height: 36, borderRadius: 10,
                      background: tx.type === "credit" ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 16,
                    }}>{tx.type === "credit" ? "💰" : "🛒"}</div>
                    <div>
                      <div style={{ fontSize: 13, color: "#fff", fontWeight: 500 }}>{tx.name}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{tx.time}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: tx.type === "credit" ? "#22C55E" : "#F87171" }}>{tx.amount}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          section > div > div { grid-template-columns: 1fr !important; }
          section > div > div > div:last-child { display: none; }
        }
      `}</style>
    </section>
  );
}
