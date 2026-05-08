"use client";
import Link from "next/link";
import AutoLinkEmails from "@/components/AutoLinkEmails";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const SUPPORT_EMAIL = "support@vaulteapp.com";

export default function ContactPage() {
  // Pre-filled mailto with a friendly default subject and body
  const mailtoHref = (() => {
    const subject = encodeURIComponent("Support Request — Vaulte");
    const body    = encodeURIComponent(
      "Hi Vaulte Support team,\n\nPlease describe your issue below:\n\n\n— Sent from vaulteapp.com/contact"
    );
    return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
  })();

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter',sans-serif" }}>

      {/* Navbar */}
      <nav style={{ background: "#0F172A", padding: "0 5%", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <img src="/assets/logo-vaulte.png" alt="Vaulte"
               width={400} height={266}
               loading="eager" decoding="async"
               style={{ height: 150, objectFit: "contain", mixBlendMode: "screen" }} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LanguageSwitcher variant="dark" />
          <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.8)", textDecoration: "none", padding: "8px 16px", borderRadius: 8 }}>Login</Link>
          <Link href="/register" style={{ fontSize: 14, fontWeight: 700, color: "#fff", textDecoration: "none", padding: "9px 20px", borderRadius: 8, background: "#1A73E8" }}>Open Account</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#0F172A 0%,#1a3a7a 100%)", padding: "48px 5%", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 900, color: "#fff", marginBottom: 10, letterSpacing: "-1px" }}>Contact Us</h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)" }}>We&apos;re here to help — 24 hours a day, 7 days a week.</p>
      </div>

      <div className="contact-main-grid" style={{ maxWidth: 1000, margin: "40px auto 60px", padding: "0 5%", display: "grid", gridTemplateColumns: "1fr 380px", gap: 28, alignItems: "start" }}>

        {/* ═══ Support Card (replaces the form) ═══ */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "44px 36px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #E5E7EB", textAlign: "center" }}>

          {/* Big icon */}
          <div style={{
            width: 92, height: 92, borderRadius: "50%",
            background: "linear-gradient(135deg,#1A73E8,#1557b0)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 22px", fontSize: 40, color: "#fff",
            boxShadow: "0 12px 36px rgba(26,115,232,0.32)",
          }}>📩</div>

          <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0F172A", marginBottom: 10, letterSpacing: "-0.4px" }}>
            Email our Support Team
          </h2>
          <p style={{ fontSize: 15, color: "#6B7280", lineHeight: 1.7, marginBottom: 28, maxWidth: 480, margin: "0 auto 28px" }}>
            For all account, transfer, card or security questions, send us an email and a real person from our support team will reply within 24 hours.
          </p>

          {/* Email pill */}
          <a
            href={`mailto:${SUPPORT_EMAIL}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              padding: "12px 22px", borderRadius: 999,
              background: "#EFF6FF", border: "1.5px solid #BFDBFE",
              textDecoration: "none", marginBottom: 28,
              transition: "all 0.18s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#DBEAFE"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#EFF6FF"; }}
          >
            <span style={{ fontSize: 18 }}>✉</span>
            <span style={{ fontSize: 14.5, fontWeight: 700, color: "#1A73E8", letterSpacing: "-0.1px" }}>{SUPPORT_EMAIL}</span>
          </a>

          {/* CTA */}
          <a
            href={mailtoHref}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              width: "100%", padding: "15px", borderRadius: 14,
              background: "linear-gradient(135deg,#1A73E8,#1557b0)",
              color: "#fff", fontSize: 15, fontWeight: 700,
              textDecoration: "none", fontFamily: "inherit",
              boxShadow: "0 6px 20px rgba(26,115,232,0.32)",
              transition: "all 0.2s", maxWidth: 420, marginLeft: "auto", marginRight: "auto",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 10px 28px rgba(26,115,232,0.42)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 20px rgba(26,115,232,0.32)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
          >
            ✉ Contact Support
          </a>

          <p style={{ fontSize: 12.5, color: "#94A3B8", marginTop: 18, lineHeight: 1.6 }}>
            Opens your default email app with a pre-filled message.
            <br />Or copy the address above and email us from any client.
          </p>
        </div>

        {/* ═══ Contact info ═══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { icon: "💬", title: "Live Chat",     desc: "Chat with our support team in real time.",                action: "Start Chat", href: "#" },
            { icon: "📞", title: "Phone Support", desc: "+1 (800) 123-4567\nMon–Fri, 9am–6pm EST",                  action: null,         href: null },
            { icon: "✉️", title: "Email",         desc: "support@vaulteapp.com\nWe reply within 24 hours.",        action: null,         href: null },
            { icon: "🏢", title: "Office",        desc: "123 Finance Street\nSan Francisco, CA 94103",              action: null,         href: null },
          ].map(item => (
            <div key={item.title} style={{ background: "#fff", borderRadius: 14, padding: "22px", border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{item.title}</p>
                  <AutoLinkEmails text={item.desc} style={{ display: "block", fontSize: 13.5, color: "#6B7280", lineHeight: 1.7 }} />
                  {item.action && (
                    <Link href={item.href!} style={{ display: "inline-block", marginTop: 10, fontSize: 13.5, fontWeight: 700, color: "#1A73E8", textDecoration: "none" }}>{item.action} →</Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@media (max-width: 768px) { div[style*="grid-template-columns: 1fr 380px"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
