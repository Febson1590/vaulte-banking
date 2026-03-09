"use client";
import Link from "next/link";

export default function CTA() {
  return (
    <section style={{ padding: "100px 5%", background: "#fff" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
        <div style={{
          background: "linear-gradient(135deg, #0F172A, #1e3a6e)",
          borderRadius: 24, padding: "64px 48px",
          position: "relative", overflow: "hidden",
        }}>
          {/* Glow */}
          <div style={{ position: "absolute", top: -40, right: -40, width: 200, height: 200, background: "rgba(26,115,232,0.2)", borderRadius: "50%", filter: "blur(50px)" }} />
          <div style={{ position: "absolute", bottom: -40, left: -40, width: 200, height: 200, background: "rgba(34,197,94,0.1)", borderRadius: "50%", filter: "blur(50px)" }} />

          <div style={{ position: "relative" }}>
            <span style={{
              display: "inline-block", background: "rgba(34,197,94,0.15)", color: "#22C55E",
              fontSize: 13, fontWeight: 700, letterSpacing: "0.1em",
              padding: "6px 16px", borderRadius: 999, marginBottom: 24,
            }}>GET STARTED TODAY</span>

            <h2 style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 900, color: "#fff", letterSpacing: "-1px", marginBottom: 16 }}>
              Ready to bank without borders?
            </h2>
            <p style={{ fontSize: 17, color: "rgba(255,255,255,0.6)", lineHeight: 1.75, marginBottom: 36, maxWidth: 480, margin: "0 auto 36px" }}>
              Join thousands of customers already banking smarter with Vaulte. Open your free account in minutes.
            </p>

            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
              <Link href="/register" style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "14px 30px", background: "#1A73E8", color: "#fff",
                borderRadius: 10, fontWeight: 700, fontSize: 16, textDecoration: "none",
                boxShadow: "0 4px 20px rgba(26,115,232,0.5)",
                transition: "all 0.2s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.background = "#1557b0"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = "#1A73E8"; e.currentTarget.style.transform = "translateY(0)"; }}
              >Open Free Account</Link>
              <Link href="/login" style={{
                display: "inline-flex", alignItems: "center",
                padding: "14px 28px", border: "2px solid rgba(255,255,255,0.25)", color: "#fff",
                borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: "none",
                transition: "all 0.2s",
              }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.5)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.25)"; }}
              >Login to Account</Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
