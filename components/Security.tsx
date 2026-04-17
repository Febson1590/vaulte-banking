"use client";

const items = [
  {
    icon: "🛡️",
    title: "End-to-End Encryption",
    desc: "All data and transactions are protected with AES-256 military-grade encryption — the same standard used by governments worldwide.",
    color: "#60A5FA",
    glow: "rgba(96,165,250,0.15)",
    border: "rgba(96,165,250,0.2)",
  },
  {
    icon: "📱",
    title: "Two-Factor Authentication",
    desc: "Every login is secured with a one-time verification code. Unauthorised access is blocked before it can happen.",
    color: "#34D399",
    glow: "rgba(52,211,153,0.15)",
    border: "rgba(52,211,153,0.2)",
  },
  {
    icon: "🔍",
    title: "24/7 Fraud Monitoring",
    desc: "AI-powered systems scan every transaction in real time, flagging and blocking suspicious activity the moment it occurs.",
    color: "#A78BFA",
    glow: "rgba(167,139,250,0.15)",
    border: "rgba(167,139,250,0.2)",
  },
];

const badges = [
  { label: "AES-256", sub: "Encryption" },
  { label: "SOC 2", sub: "Certified" },
  { label: "PCI DSS", sub: "Compliant" },
  { label: "ISO 27001", sub: "Certified" },
  { label: "GDPR", sub: "Compliant" },
];

export default function Security() {
  return (
    <section id="security" style={{ padding: "100px 5%", background: "#06091A", position: "relative", overflow: "hidden" }}>
      {/* Glow blob */}
      <div style={{ position: "absolute", top: "40%", right: "5%", width: 400, height: 400, background: "rgba(96,165,250,0.06)", borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={{ display: "inline-block", background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", color: "#34D399", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", padding: "5px 16px", borderRadius: 999, textTransform: "uppercase", marginBottom: 20 }}>Enterprise Security</span>
          <h2 style={{ fontSize: "clamp(28px,3.8vw,46px)", fontWeight: 900, color: "#fff", letterSpacing: "-1px", marginBottom: 16, lineHeight: 1.1 }}>
            Your money is protected<br />
            <span style={{ background: "linear-gradient(135deg,#34D399,#60A5FA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>at every level</span>
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", maxWidth: 480, margin: "0 auto", lineHeight: 1.8 }}>
            Bank-grade security infrastructure protecting your funds and data around the clock.
          </p>
        </div>

        {/* Cards */}
        <div className="security-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24, marginBottom: 48 }}>
          {items.map((item, i) => (
            <div key={i}
              style={{ padding: "40px 32px", borderRadius: 24, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", textAlign: "center", transition: "all 0.3s ease", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = item.glow;
                el.style.borderColor = item.border;
                el.style.transform = "translateY(-6px)";
                el.style.boxShadow = `0 24px 60px ${item.glow}`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(255,255,255,0.03)";
                el.style.borderColor = "rgba(255,255,255,0.07)";
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
              }}
            >
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, transparent, ${item.color}, transparent)`, opacity: 0.4 }} />
              <div style={{ width: 70, height: 70, borderRadius: 20, background: item.glow, border: `1px solid ${item.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 24px" }}>{item.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", marginBottom: 12, letterSpacing: "-0.3px" }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.8 }}>{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 12 }}>
          {badges.map((b, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 12, padding: "10px 20px" }}>
              <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#34D399", boxShadow: "0 0 8px rgba(52,211,153,0.6)" }} />
              <div>
                <div style={{ fontSize: 13, fontWeight: 800, color: "#fff", lineHeight: 1.2 }}>{b.label}</div>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{b.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@media(max-width:768px){ .security-grid { grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}
