const steps = [
  { num: "1", title: "Create Account", desc: "Sign up in minutes.", icon: "👤", color: "#1A73E8", bg: "#EFF6FF" },
  { num: "2", title: "Verify Identity", desc: "Complete KYC verification.", icon: "🪪", color: "#8B5CF6", bg: "#F5F3FF" },
  { num: "3", title: "Start Banking", desc: "Send and receive money globally.", icon: "💳", color: "#22C55E", bg: "#F0FDF4" },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: "88px 5%", background: "#F8FAFC" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 14 }}>
          <span style={{ display: "inline-block", background: "#EFF6FF", color: "#1A73E8", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", padding: "5px 14px", borderRadius: 999, textTransform: "uppercase" }}>How It Works</span>
        </div>
        <h2 style={{ fontSize: "clamp(26px,3.5vw,40px)", fontWeight: 900, textAlign: "center", color: "#0F172A", letterSpacing: "-0.8px", marginBottom: 12 }}>How It Works</h2>
        <p style={{ fontSize: 16, color: "#6B7280", textAlign: "center", maxWidth: 440, margin: "0 auto 56px", lineHeight: 1.75 }}>
          Get started with Vaulte in three simple steps.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr auto 1fr", gap: 0, alignItems: "center" }}>
          {steps.map((step, i) => (
            <>
              <div key={step.num} style={{ background: "#fff", borderRadius: 16, padding: "32px 24px", border: "1.5px solid #E5E7EB", boxShadow: "0 2px 10px rgba(0,0,0,0.04)", textAlign: "center" }}>
                <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 56, height: 56, borderRadius: 14, background: step.bg, fontSize: 26, marginBottom: 16 }}>{step.icon}</div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 22, fontWeight: 900, color: step.color }}>{step.num}.</span>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: "#0F172A" }}>{step.title}</h3>
                </div>
                <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.6 }}>{step.desc}</p>
              </div>
              {i < steps.length - 1 && (
                <div key={`arrow-${i}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 16px" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M12 5l7 7-7 7" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>
              )}
            </>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:768px){section>div>div:last-child{grid-template-columns:1fr!important;}}`}</style>
    </section>
  );
}
