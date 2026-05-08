"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getCurrentUser } from "@/lib/vaulteState";

const C = {
  bg: "#F3F5FA", card: "#ffffff", navy: "#0F172A", blue: "#1A73E8",
  border: "rgba(15,23,42,0.07)", muted: "#94A3B8", text: "#0F172A", sub: "#64748B",
  shadow: "0 1px 3px rgba(15,23,42,0.05), 0 6px 20px rgba(15,23,42,0.07)",
  green: "#059669",
} as const;

const SUPPORT_EMAIL = "support@vaulteapp.com";

const RESPONSE_INFO = [
  { icon: "⏱", title: "Response Time",  body: "We respond to all support emails within 24–48 business hours." },
  { icon: "🔒", title: "Data Security", body: "Never share passwords or OTP codes — even with support staff." },
];

export default function ContactPage() {
  const [mounted,    setMounted]    = useState(false);
  const [firstName,  setFirstName]  = useState("");
  const [email,      setEmail]      = useState("");

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setFirstName(user.firstName ?? "");
      setEmail(user.email        ?? "");
    }
    setMounted(true);
  }, []);

  // Pre-filled mailto so the user lands in their mail app with context already filled.
  const mailtoHref = (() => {
    const subject = encodeURIComponent("Support Request — Vaulte");
    const lines = [
      `Hi Vaulte Support team,`,
      ``,
      `Please describe your issue below:`,
      ``,
      ``,
      `— — — — — — — — — — — — — — —`,
      `Account email: ${mounted ? (email || "—") : "—"}`,
      `Account name:  ${mounted ? (firstName || "—") : "—"}`,
    ];
    const body = encodeURIComponent(lines.join("\n"));
    return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  })();

  return (
    <DashboardLayout title="Contact Support" subtitle="Reach our team by email — we typically reply within a few hours">
      <div className="contact-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>

        {/* ═══ LEFT — Support Card ═══ */}
        <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, overflow: "hidden" }}>

          {/* Header */}
          <div style={{ background: `linear-gradient(135deg,${C.navy} 0%,#1e293b 100%)`, padding: "28px 32px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "rgba(26,115,232,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>✉</div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", letterSpacing: "-0.2px" }}>Need help? Email us</p>
                <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", marginTop: 3 }}>Click the button below to open your default mail app</p>
              </div>
            </div>
          </div>

          {/* Body */}
          <div style={{ padding: "36px 32px 36px", textAlign: "center" }}>

            {/* Big icon */}
            <div style={{
              width: 88, height: 88, borderRadius: "50%",
              background: `linear-gradient(135deg,${C.blue},#1557b0)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 22px", fontSize: 38, color: "#fff",
              boxShadow: "0 12px 36px rgba(26,115,232,0.32)",
            }}>📩</div>

            {/* Headline */}
            <p style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 8, letterSpacing: "-0.3px" }}>
              Contact our Support Team
            </p>
            <p style={{ fontSize: 14, color: C.sub, lineHeight: 1.6, marginBottom: 28, maxWidth: 460, marginLeft: "auto", marginRight: "auto" }}>
              For all account, transfer, card or security questions, send us an email and a real person from our support team will reply.
            </p>

            {/* Email pill */}
            <a
              href={`mailto:${SUPPORT_EMAIL}`}
              style={{
                display: "inline-flex", alignItems: "center", gap: 10,
                padding: "12px 20px", borderRadius: 999,
                background: "#EFF6FF", border: "1.5px solid #BFDBFE",
                textDecoration: "none", marginBottom: 28,
                transition: "all 0.18s",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#DBEAFE"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#EFF6FF"; }}
            >
              <span style={{ fontSize: 16 }}>✉</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: C.blue, letterSpacing: "-0.1px" }}>{SUPPORT_EMAIL}</span>
            </a>

            {/* CTA */}
            <a
              href={mailtoHref}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                width: "100%", padding: "15px", borderRadius: 14,
                background: `linear-gradient(135deg,${C.blue},#1557b0)`,
                color: "#fff", fontSize: 14.5, fontWeight: 700,
                textDecoration: "none", fontFamily: "inherit",
                boxShadow: "0 6px 20px rgba(26,115,232,0.32)",
                transition: "all 0.2s", maxWidth: 380, marginLeft: "auto", marginRight: "auto",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 28px rgba(26,115,232,0.42)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(26,115,232,0.32)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
            >
              ✉ Contact Support
            </a>

            {/* Sub note */}
            <p style={{ fontSize: 12, color: C.muted, marginTop: 18, lineHeight: 1.6 }}>
              Opens your default email app with a pre-filled message.
              <br />Or copy the address above and email us from any client.
            </p>
          </div>
        </div>

        {/* ═══ RIGHT — Info panel ═══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Response time & security cards */}
          {RESPONSE_INFO.map(info => (
            <div key={info.title} style={{ background: C.card, borderRadius: 18, padding: "20px 22px", border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${C.blue}14`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{info.icon}</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 5 }}>{info.title}</p>
                  <p style={{ fontSize: 13, color: C.sub, lineHeight: 1.6 }}>{info.body}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Live chat */}
          <div style={{ background: C.card, borderRadius: 18, padding: "20px 22px", border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>💬 Live Chat</p>
            <p style={{ fontSize: 12.5, color: C.sub, marginBottom: 14, lineHeight: 1.6 }}>
              Use the chat button in the bottom corner for instant support during business hours.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 0 3px rgba(34,197,94,0.18)" }} />
              <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>Available now</span>
            </div>
          </div>

          {/* Tips card */}
          <div style={{ background: `linear-gradient(135deg,${C.navy} 0%,#1e293b 100%)`, borderRadius: 18, padding: "20px 22px", border: `1px solid rgba(255,255,255,0.06)` }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 14 }}>💡 What to include</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Your registered account email",
                "Transaction ID for transfer issues",
                "Screenshots if you saw an error",
                "Steps you have already tried",
              ].map((tip, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                  <span style={{ fontSize: 12, color: C.blue, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>→</span>
                  <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @media (max-width: 900px) {
          .contact-main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}
