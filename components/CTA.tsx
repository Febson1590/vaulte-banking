"use client";
import Link from "next/link";

export default function CTA() {
  return (
    <section className="cta-section" style={{ padding: "80px 5%", background: "#080D20" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <div className="cta-card" style={{
          background:   "linear-gradient(135deg, #0B1527 0%, #0F1E3D 50%, #0B1527 100%)",
          borderRadius: 28,
          padding:      "72px 56px",
          position:     "relative",
          overflow:     "hidden",
          border:       "1px solid rgba(96,165,250,0.12)",
          textAlign:    "center",
        }}>
          {/* Glows */}
          <div aria-hidden="true" style={{ position: "absolute", top: -60, left: "50%", transform: "translateX(-50%)", width: 400, height: 200, background: "rgba(37,99,235,0.2)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
          <div aria-hidden="true" style={{ position: "absolute", bottom: -60, right: -40, width: 300, height: 200, background: "rgba(167,139,250,0.1)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
          <div aria-hidden="true" style={{ position: "absolute", bottom: -60, left:  -40, width: 300, height: 200, background: "rgba(52,211,153,0.07)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
          {/* Top gradient line */}
          <div aria-hidden="true" style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg, transparent, rgba(96,165,250,0.5), rgba(167,139,250,0.5), transparent)" }} />

          <div style={{ position: "relative" }}>
            <span style={{
              display:        "inline-block",
              background:     "rgba(96,165,250,0.1)",
              border:         "1px solid rgba(96,165,250,0.25)",
              color:          "#60A5FA",
              fontSize:       11,
              fontWeight:     700,
              letterSpacing:  "0.14em",
              padding:        "5px 16px",
              borderRadius:   999,
              marginBottom:   24,
              textTransform:  "uppercase",
            }}>Get Started Today</span>

            <h2 className="cta-heading" style={{ fontSize: "clamp(28px, 4.5vw, 52px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: 20, lineHeight: 1.1 }}>
              Ready to bank<br />
              <span style={{ background: "linear-gradient(135deg,#60A5FA,#A78BFA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>without borders?</span>
            </h2>
            <p className="cta-desc" style={{ fontSize: "clamp(15px, 1.5vw, 17px)", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, marginBottom: 36, maxWidth: 500, margin: "0 auto 36px" }}>
              Join 500,000+ customers already banking smarter with Vaulte. Open your free account in under 3 minutes.
            </p>

            <div className="cta-buttons" style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/register" style={{
                display:        "inline-flex",
                alignItems:     "center",
                justifyContent: "center",
                gap:            8,
                padding:        "15px 32px",
                background:     "linear-gradient(135deg,#2563EB,#1D4ED8)",
                color:          "#fff",
                borderRadius:   12,
                fontWeight:     700,
                fontSize:       16,
                textDecoration: "none",
                boxShadow:      "0 4px 24px rgba(37,99,235,0.5)",
                transition:     "all 0.2s",
                letterSpacing:  "0.01em",
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 32px rgba(37,99,235,0.65)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(37,99,235,0.5)"; }}
              >
                Open Free Account
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
              <Link href="/login" style={{
                display:        "inline-flex",
                alignItems:     "center",
                justifyContent: "center",
                gap:            8,
                padding:        "15px 30px",
                border:         "1px solid rgba(255,255,255,0.18)",
                color:          "rgba(255,255,255,0.88)",
                borderRadius:   12,
                fontWeight:     600,
                fontSize:       16,
                textDecoration: "none",
                background:     "rgba(255,255,255,0.04)",
                transition:     "all 0.2s",
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)"; e.currentTarget.style.background = "rgba(255,255,255,0.09)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.18)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}
              >Login to Account</Link>
            </div>

            {/* Trust note */}
            <ul className="cta-trust" style={{ marginTop: 32, padding: 0, listStyle: "none", display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 18px", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
              <li style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><span style={{ color: "#34D399" }}>✓</span> No credit card required</li>
              <li style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><span style={{ color: "#34D399" }}>✓</span> Free forever plan</li>
              <li style={{ display: "inline-flex", alignItems: "center", gap: 7 }}><span style={{ color: "#34D399" }}>✓</span> Cancel anytime</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 640px) {
          .cta-section { padding: 64px 5% !important; }
          .cta-card { padding: 48px 24px !important; border-radius: 22px !important; }
          .cta-buttons { flex-direction: column !important; gap: 10px !important; }
          .cta-buttons a { width: 100%; }
          .cta-trust { font-size: 12.5px !important; gap: 6px 14px !important; margin-top: 26px !important; }
        }
      `}</style>
    </section>
  );
}
