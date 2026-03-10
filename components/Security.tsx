"use client";

const items = [
  { icon: "🛡️", title: "End-to-End Encryption", desc: "Your data and transactions are protected with AES-256 military-grade encryption.", color: "#1A73E8", bg: "#EFF6FF" },
  { icon: "📱", title: "Two-Factor Authentication", desc: "Every login requires a one-time code sent to your email, preventing unauthorized access.", color: "#22C55E", bg: "#F0FDF4" },
  { icon: "🔍", title: "24/7 Fraud Monitoring", desc: "Our systems monitor every transaction in real-time and flag suspicious activity instantly.", color: "#8B5CF6", bg: "#F5F3FF" },
];

export default function Security() {
  return (
    <section id="security" style={{ padding: "24px 5%", background: "#fff" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <span style={{ display: "inline-block", background: "#EFF6FF", color: "#1A73E8", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", padding: "5px 14px", borderRadius: 999, textTransform: "uppercase" }}>Security</span>
        </div>
        <h2 style={{ fontSize: "clamp(26px,3.5vw,40px)", fontWeight: 900, textAlign: "center", color: "#0F172A", letterSpacing: "-0.8px", marginBottom: 10 }}>Bank-Level Security</h2>
        <p style={{ fontSize: 16, color: "#6B7280", textAlign: "center", marginBottom: 52 }}>Your money, safe and secure.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 24 }}>
          {items.map((item, i) => (
            <div key={i} style={{ padding: "36px 28px", borderRadius: 16, border: "1.5px solid #F1F5F9", background: "#fff", textAlign: "center", transition: "all 0.22s" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#1A73E8"; el.style.transform = "translateY(-4px)"; el.style.boxShadow = "0 10px 30px rgba(26,115,232,0.1)"; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.borderColor = "#F1F5F9"; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}
            >
              <div style={{ width: 64, height: 64, borderRadius: 16, background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 20px" }}>{item.icon}</div>
              <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A", marginBottom: 10 }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.7 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:768px){section>div>div:last-child{grid-template-columns:1fr!important;}}`}</style>
    </section>
  );
}
