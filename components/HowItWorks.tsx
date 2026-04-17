"use client";
import React from "react";

const steps = [
  {
    num:   "01",
    title: "Create Account",
    desc:  "Sign up in minutes with just your email. No paperwork, no branch visits, no waiting.",
    icon:  "👤",
    color: "#60A5FA",
    glow:  "rgba(96,165,250,0.2)",
  },
  {
    num:   "02",
    title: "Verify Identity",
    desc:  "Complete a quick KYC verification to unlock full access to all global banking features.",
    icon:  "🪪",
    color: "#A78BFA",
    glow:  "rgba(167,139,250,0.2)",
  },
  {
    num:   "03",
    title: "Start Banking",
    desc:  "Send, receive, exchange and manage money worldwide — instantly, from any device.",
    icon:  "💳",
    color: "#34D399",
    glow:  "rgba(52,211,153,0.2)",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="how-it-works" style={{ padding: "100px 5%", background: "#080D20", position: "relative", overflow: "hidden" }}>
      {/* Decorative glows */}
      <div aria-hidden="true" style={{ position: "absolute", top: 0, left: "20%", width: 500, height: 300, background: "rgba(96,165,250,0.05)", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />
      <div aria-hidden="true" style={{ position: "absolute", bottom: 0, right: "10%", width: 400, height: 300, background: "rgba(167,139,250,0.05)", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative" }}>
        {/* Header */}
        <div className="section-head" style={{ textAlign: "center", marginBottom: 72 }}>
          <span style={{ display: "inline-block", background: "rgba(167,139,250,0.1)", border: "1px solid rgba(167,139,250,0.25)", color: "#A78BFA", fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", padding: "5px 16px", borderRadius: 999, textTransform: "uppercase", marginBottom: 20 }}>Simple Process</span>
          <h2 style={{ fontSize: "clamp(28px, 3.8vw, 46px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", marginBottom: 16, lineHeight: 1.1 }}>
            Up and running in<br />
            <span style={{ background: "linear-gradient(135deg,#A78BFA,#60A5FA)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>three simple steps</span>
          </h2>
          <p style={{ fontSize: "clamp(14px, 1.4vw, 17px)", color: "rgba(255,255,255,0.5)", maxWidth: 440, margin: "0 auto", lineHeight: 1.75 }}>
            Get started with Vaulte in minutes. No long queues, no complex forms.
          </p>
        </div>

        {/* Steps */}
        <div className="steps-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) auto minmax(0,1fr) auto minmax(0,1fr)", gap: 0, alignItems: "stretch" }}>
          {steps.map((step, i) => (
            <React.Fragment key={step.num}>
              <div className="step-card" style={{
                background:    "rgba(255,255,255,0.03)",
                border:        "1px solid rgba(255,255,255,0.08)",
                borderRadius:  24,
                padding:       "40px 32px",
                position:      "relative",
                overflow:      "hidden",
                transition:    "all 0.3s ease",
                display:       "flex",
                flexDirection: "column",
              }}
                onMouseEnter={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background   = step.glow.replace("0.2", "0.07");
                  el.style.borderColor  = step.glow.replace("0.2", "0.3");
                  el.style.transform    = "translateY(-4px)";
                }}
                onMouseLeave={e => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background   = "rgba(255,255,255,0.03)";
                  el.style.borderColor  = "rgba(255,255,255,0.08)";
                  el.style.transform    = "translateY(0)";
                }}
              >
                {/* Number + icon header — one clear step indicator */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 22 }}>
                  <div style={{
                    display:        "inline-flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    width:          56,
                    height:         56,
                    borderRadius:   16,
                    background:     step.glow,
                    border:         `1px solid ${step.glow.replace("0.2", "0.3")}`,
                    fontSize:       26,
                  }}>{step.icon}</div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: "rgba(255,255,255,0.45)", textTransform: "uppercase" }}>Step</div>
                    <div style={{ fontSize: 22, fontWeight: 900, color: step.color, lineHeight: 1, letterSpacing: "-0.02em" }}>{step.num}</div>
                  </div>
                </div>

                <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", marginBottom: 10, letterSpacing: "-0.3px" }}>{step.title}</h3>
                <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: 0 }}>{step.desc}</p>
              </div>

              {i < steps.length - 1 && (
                <div className="step-arrow" aria-hidden="true" style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "0 20px" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 40, height: 1, background: "linear-gradient(90deg, rgba(96,165,250,0.3), rgba(167,139,250,0.3))" }} />
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M12 5l7 7-7 7" stroke="rgba(167,139,250,0.5)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .how-it-works .steps-grid { grid-template-columns: 1fr !important; gap: 16px !important; }
          .how-it-works .step-arrow { display: none !important; }
        }
        @media (max-width: 640px) {
          .how-it-works { padding: 72px 5% !important; }
          .how-it-works .section-head { margin-bottom: 44px !important; }
          .how-it-works .step-card { padding: 28px 22px !important; border-radius: 20px !important; }
        }
      `}</style>
    </section>
  );
}
