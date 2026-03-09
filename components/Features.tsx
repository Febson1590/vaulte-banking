"use client";

const features = [
  { icon: "🌍", title: "Global Transfers", description: "Send money to anyone, anywhere in the world instantly with no hidden fees.", color: "#1A73E8", bg: "#EFF6FF" },
  { icon: "💱", title: "Multi-Currency Accounts", description: "Hold USD, EUR, GBP and more. Always get the real exchange rate.", color: "#8B5CF6", bg: "#F5F3FF" },
  { icon: "🔒", title: "Secure Banking", description: "Advanced encryption & 24/7 protection keep your money and data safe.", color: "#0F172A", bg: "#F1F5F9" },
  { icon: "⚡", title: "Instant Notifications", description: "Real-time alerts on your phone for every transaction and account activity.", color: "#22C55E", bg: "#F0FDF4" },
];

export default function Features() {
  return (
    <section id="features" style={{ padding: "88px 5%", background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <span style={{ display: "inline-block", background: "#EFF6FF", color: "#1A73E8", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", padding: "5px 14px", borderRadius: 999, textTransform: "uppercase" }}>Features</span>
        </div>
        <h2 style={{ fontSize: "clamp(26px,3.5vw,40px)", fontWeight: 900, textAlign: "center", color: "#0F172A", letterSpacing: "-0.8px", marginBottom: 12 }}>Our Features</h2>
        <p style={{ fontSize: 16, color: "#6B7280", textAlign: "center", maxWidth: 500, margin: "0 auto 56px", lineHeight: 1.75 }}>
          Powerful financial tools to send, save, and manage money from anywhere in the world.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 20 }}>
          {features.map((f, i) => (
            <div key={i} style={{ padding: "28px 22px", borderRadius: 14, border: "1.5px solid #F1F5F9", background: "#fff", transition: "all 0.22s", cursor: "default" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#1A73E8"; el.style.transform = "translateY(-4px)"; el.style.boxShadow = "0 10px 30px rgba(26,115,232,0.1)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#F1F5F9"; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}
            >
              <div style={{ width: 50, height: 50, borderRadius: 12, background: f.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 16 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A", marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.7 }}>{f.description}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:900px){section>div>div:last-child{grid-template-columns:1fr 1fr!important;}}@media(max-width:560px){section>div>div:last-child{grid-template-columns:1fr!important;}}`}</style>
    </section>
  );
}
