"use client";

const features = [
  {
    icon: "🌍",
    title: "Global Transfers",
    description: "Send money to anyone, anywhere in the world instantly with zero hidden fees and real exchange rates.",
    color: "#60A5FA",
    glow: "rgba(96,165,250,0.15)",
    border: "rgba(96,165,250,0.2)",
  },
  {
    icon: "💱",
    title: "Multi-Currency Accounts",
    description: "Hold USD, EUR, GBP and 50+ more currencies. Switch between them instantly at interbank rates.",
    color: "#A78BFA",
    glow: "rgba(167,139,250,0.15)",
    border: "rgba(167,139,250,0.2)",
  },
  {
    icon: "🔒",
    title: "Bank-Level Security",
    description: "AES-256 military-grade encryption, biometric auth, and 24/7 fraud monitoring protect every transaction.",
    color: "#34D399",
    glow: "rgba(52,211,153,0.15)",
    border: "rgba(52,211,153,0.2)",
  },
  {
    icon: "⚡",
    title: "Instant Notifications",
    description: "Real-time alerts for every transaction. Stay in control of your money the moment anything happens.",
    color: "#FBBF24",
    glow: "rgba(251,191,36,0.15)",
    border: "rgba(251,191,36,0.2)",
  },
];

export default function Features() {
  return (
    <section id="features" style={{ padding: "100px 5%", background: "#06091A", position: "relative", overflow: "hidden" }}>
      {/* Background glow */}
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 600, height: 400, background: "rgba(37,99,235,0.06)", borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <span style={{ display: "inline-block", background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.25)", color: "#60A5FA", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", padding: "5px 16px", borderRadius: 999, textTransform: "uppercase", marginBottom: 20 }}>Platform Features</span>
          <h2 style={{ fontSize: "clamp(28px,3.8vw,46px)", fontWeight: 900, color: "#fff", letterSpacing: "-1px", marginBottom: 16, lineHeight: 1.1 }}>
            Everything you need to<br />
            <span style={{ background: "linear-gradient(135deg,#60A5FA,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>bank without limits</span>
          </h2>
          <p style={{ fontSize: 17, color: "rgba(255,255,255,0.5)", maxWidth: 500, margin: "0 auto", lineHeight: 1.8 }}>
            Powerful financial tools built for the modern world. Send, save, and manage money from anywhere.
          </p>
        </div>

        {/* Cards */}
        <div className="features-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
          {features.map((f, i) => (
            <div key={i}
              style={{ padding: "32px 24px", borderRadius: 20, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", backdropFilter: "blur(10px)", transition: "all 0.3s ease", cursor: "default", position: "relative", overflow: "hidden" }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = f.glow;
                el.style.borderColor = f.border;
                el.style.transform = "translateY(-6px)";
                el.style.boxShadow = `0 20px 50px ${f.glow}`;
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(255,255,255,0.03)";
                el.style.borderColor = "rgba(255,255,255,0.07)";
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
              }}
            >
              <div style={{ width: 54, height: 54, borderRadius: 14, background: `${f.glow}`, border: `1px solid ${f.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, marginBottom: 20 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 10, letterSpacing: "-0.2px" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.75 }}>{f.description}</p>
              {/* Corner accent */}
              <div style={{ position: "absolute", bottom: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle at bottom right, ${f.glow}, transparent)`, pointerEvents: "none" }} />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media(max-width:900px){ .features-grid { grid-template-columns: 1fr 1fr !important; } }
        @media(max-width:560px){ .features-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </section>
  );
}
