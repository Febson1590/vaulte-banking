"use client";

const features = [
  {
    icon: "🌍",
    title: "Global Transfers",
    description: "Send money to anyone, anywhere in the world instantly. No borders, no delays, no hidden fees.",
    color: "#1A73E8",
    bg: "#EFF6FF",
  },
  {
    icon: "💱",
    title: "Multi-Currency Accounts",
    description: "Hold, send, and receive in USD, EUR, GBP, and more. Always get the real exchange rate.",
    color: "#8B5CF6",
    bg: "#F5F3FF",
  },
  {
    icon: "🔒",
    title: "Secure Banking",
    description: "Advanced 256-bit encryption, 2FA authentication, and 24/7 fraud monitoring keep you protected.",
    color: "#0F172A",
    bg: "#F1F5F9",
  },
  {
    icon: "⚡",
    title: "Instant Notifications",
    description: "Real-time alerts for every transaction. Always know what's happening with your money.",
    color: "#22C55E",
    bg: "#F0FDF4",
  },
  {
    icon: "📊",
    title: "Smart Analytics",
    description: "Track your spending habits with beautiful charts and get insights to manage money better.",
    color: "#F59E0B",
    bg: "#FFFBEB",
  },
  {
    icon: "💳",
    title: "Virtual Cards",
    description: "Generate virtual debit cards instantly for secure online shopping from any device.",
    color: "#EF4444",
    bg: "#FEF2F2",
  },
];

export default function Features() {
  return (
    <section id="features" style={{ padding: "100px 5%", background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        {/* Label */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <span style={{
            display: "inline-block", background: "#EFF6FF", color: "#1A73E8",
            fontSize: 13, fontWeight: 700, letterSpacing: "0.1em",
            padding: "6px 16px", borderRadius: 999, textTransform: "uppercase",
          }}>Features</span>
        </div>

        <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, textAlign: "center", color: "#0F172A", letterSpacing: "-1px", marginBottom: 16 }}>
          Everything you need to bank globally
        </h2>
        <p style={{ fontSize: 17, color: "#6B7280", textAlign: "center", maxWidth: 560, margin: "0 auto 64px", lineHeight: 1.75 }}>
          Vaulte brings together powerful financial tools so you can send, save, and manage money from anywhere in the world.
        </p>

        {/* Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {features.map((f, i) => (
            <div key={i}
              style={{
                padding: 28, borderRadius: 16, border: "1.5px solid #F1F5F9",
                background: "#fff", transition: "all 0.25s ease", cursor: "default",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "#1A73E8";
                el.style.transform = "translateY(-4px)";
                el.style.boxShadow = "0 12px 32px rgba(26,115,232,0.12)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLElement;
                el.style.borderColor = "#F1F5F9";
                el.style.transform = "translateY(0)";
                el.style.boxShadow = "none";
              }}
            >
              <div style={{
                width: 52, height: 52, borderRadius: 14, background: f.bg,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 24, marginBottom: 18,
              }}>{f.icon}</div>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: "#0F172A", marginBottom: 10 }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.75 }}>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
