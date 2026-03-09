const steps = [
  {
    number: "01",
    title: "Create Your Account",
    description: "Sign up in minutes with just your email and basic personal information. No paperwork required.",
    icon: "👤",
    color: "#1A73E8",
  },
  {
    number: "02",
    title: "Verify Your Identity",
    description: "Complete our fast KYC verification by uploading a valid government-issued ID. Usually approved within minutes.",
    icon: "🪪",
    color: "#8B5CF6",
  },
  {
    number: "03",
    title: "Fund Your Account",
    description: "Add money to your Vaulte account and start banking instantly. Receive transfers from anyone worldwide.",
    icon: "💰",
    color: "#22C55E",
  },
  {
    number: "04",
    title: "Start Banking Globally",
    description: "Send, receive, and manage money across the world with zero borders and complete peace of mind.",
    icon: "🌍",
    color: "#F59E0B",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: "100px 5%", background: "#F8FAFC" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <span style={{
            display: "inline-block", background: "#EFF6FF", color: "#1A73E8",
            fontSize: 13, fontWeight: 700, letterSpacing: "0.1em",
            padding: "6px 16px", borderRadius: 999, textTransform: "uppercase",
          }}>How It Works</span>
        </div>

        <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, textAlign: "center", color: "#0F172A", letterSpacing: "-1px", marginBottom: 16 }}>
          Get started in 4 simple steps
        </h2>
        <p style={{ fontSize: 17, color: "#6B7280", textAlign: "center", maxWidth: 520, margin: "0 auto 64px", lineHeight: 1.75 }}>
          Opening a Vaulte account takes less than 5 minutes. Here is how it works.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, position: "relative" }}>
          {steps.map((step, i) => (
            <div key={i} style={{ position: "relative" }}>
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div style={{
                  position: "absolute", top: 36, right: -12, width: 24, height: 2,
                  background: "linear-gradient(90deg, #E2E8F0, transparent)",
                  zIndex: 1,
                }} className="connector-line" />
              )}

              <div style={{
                background: "#fff", borderRadius: 16, padding: "28px 24px",
                border: "1.5px solid #E2E8F0", height: "100%",
                boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 14,
                    background: `${step.color}15`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 24,
                  }}>{step.icon}</div>
                  <span style={{
                    fontSize: 13, fontWeight: 800, color: step.color,
                    letterSpacing: "0.05em",
                  }}>STEP {step.number}</span>
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginBottom: 10 }}>{step.title}</h3>
                <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.75 }}>{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
