const securityItems = [
  {
    icon: "🔐",
    title: "End-to-End Encryption",
    description: "All your data and transactions are protected with AES-256 military-grade encryption.",
    color: "#1A73E8",
  },
  {
    icon: "📱",
    title: "Two-Factor Authentication",
    description: "Every login is secured with a one-time code sent to your email, preventing unauthorized access.",
    color: "#22C55E",
  },
  {
    icon: "🛡️",
    title: "24/7 Fraud Monitoring",
    description: "Our automated systems monitor every transaction in real-time and flag suspicious activity instantly.",
    color: "#8B5CF6",
  },
  {
    icon: "🔑",
    title: "KYC Verification",
    description: "Every account is identity-verified before activation, ensuring a safe environment for all users.",
    color: "#F59E0B",
  },
  {
    icon: "🕵️",
    title: "Audit Logs",
    description: "Full audit trails of every action taken on your account. Nothing goes unrecorded.",
    color: "#EF4444",
  },
  {
    icon: "🌐",
    title: "Secure Infrastructure",
    description: "Hosted on enterprise-grade cloud infrastructure with 99.9% uptime and automatic failover.",
    color: "#0EA5E9",
  },
];

export default function Security() {
  return (
    <section id="security" style={{ padding: "100px 5%", background: "#0F172A", position: "relative", overflow: "hidden" }}>
      {/* Background glow */}
      <div style={{ position: "absolute", top: "20%", left: "50%", transform: "translateX(-50%)", width: 600, height: 300, background: "rgba(26,115,232,0.08)", filter: "blur(80px)", borderRadius: "50%", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <span style={{
            display: "inline-block", background: "rgba(26,115,232,0.15)", color: "#60A5FA",
            fontSize: 13, fontWeight: 700, letterSpacing: "0.1em",
            padding: "6px 16px", borderRadius: 999, textTransform: "uppercase",
          }}>Security</span>
        </div>

        <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, textAlign: "center", color: "#fff", letterSpacing: "-1px", marginBottom: 16 }}>
          Bank-Level Security
        </h2>
        <p style={{ fontSize: 17, color: "rgba(255,255,255,0.55)", textAlign: "center", maxWidth: 520, margin: "0 auto 64px", lineHeight: 1.75 }}>
          Your money and data are protected by the same standards used by the world's largest financial institutions.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {securityItems.map((item, i) => (
            <div key={i} style={{
              background: "rgba(255,255,255,0.04)", backdropFilter: "blur(10px)",
              border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16,
              padding: "28px 24px", transition: "all 0.25s",
            }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(255,255,255,0.07)";
                el.style.borderColor = "rgba(26,115,232,0.4)";
                el.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.background = "rgba(255,255,255,0.04)";
                el.style.borderColor = "rgba(255,255,255,0.08)";
                el.style.transform = "translateY(0)";
              }}
            >
              <div style={{
                width: 50, height: 50, borderRadius: 12,
                background: `${item.color}20`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 22, marginBottom: 16,
              }}>{item.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.75 }}>{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
