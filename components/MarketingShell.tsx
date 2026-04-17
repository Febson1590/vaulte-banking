"use client";
import Link from "next/link";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

/**
 * MarketingShell
 * ──────────────
 * Shared layout for secondary marketing pages (About, Careers, Blog, Press,
 * Pricing, Changelog).  Gives each page the same navbar, the same dark hero
 * band with a title + subtitle, the same content container, and the same
 * footer so we never drift visually.
 *
 * Pages only need to provide: badge, title, subtitle, and children.
 */
export default function MarketingShell({
  badge,
  badgeColor = "#60A5FA",
  title,
  subtitle,
  children,
}: {
  badge?:      string;
  badgeColor?: string;
  title:       string;
  subtitle?:   string;
  children:    React.ReactNode;
}) {
  return (
    <div style={{ minHeight: "100vh", background: "#06091A", fontFamily: "'Inter', sans-serif" }}>
      <Navbar />

      {/* Page hero */}
      <section style={{ background: "linear-gradient(160deg,#06091A 0%,#0B1836 60%,#0D2060 100%)", padding: "130px 5% 70px", position: "relative", overflow: "hidden" }}>
        <div aria-hidden="true" style={{ position: "absolute", top: -100, right: -60, width: 420, height: 420, borderRadius: "50%", background: "rgba(37,99,235,0.12)", filter: "blur(100px)", pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", bottom: -120, left: -60, width: 360, height: 360, borderRadius: "50%", background: "rgba(167,139,250,0.08)", filter: "blur(90px)", pointerEvents: "none" }} />

        <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center", position: "relative" }}>
          {badge && (
            <span style={{
              display:       "inline-block",
              background:    `${badgeColor}1a`,
              border:        `1px solid ${badgeColor}40`,
              color:         badgeColor,
              fontSize:      11,
              fontWeight:    700,
              letterSpacing: "0.14em",
              padding:       "5px 16px",
              borderRadius:  999,
              textTransform: "uppercase",
              marginBottom:  20,
            }}>{badge}</span>
          )}
          <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 900, color: "#fff", letterSpacing: "-0.02em", lineHeight: 1.1, marginBottom: subtitle ? 16 : 0 }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{ fontSize: "clamp(15px, 1.5vw, 18px)", color: "rgba(255,255,255,0.6)", lineHeight: 1.7, maxWidth: 640, margin: "0 auto" }}>
              {subtitle}
            </p>
          )}
        </div>
      </section>

      {/* Page content */}
      <section style={{ padding: "70px 5% 100px", background: "#06091A" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {children}
        </div>
      </section>

      <Footer />
    </div>
  );
}

/** A reusable section card (title + body) used by the info pages. */
export function InfoCard({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <div style={{
      background:    "rgba(255,255,255,0.03)",
      border:        "1px solid rgba(255,255,255,0.07)",
      borderRadius:  20,
      padding:       "32px",
      marginBottom:  20,
    }}>
      {title && (
        <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", marginBottom: 14 }}>{title}</h2>
      )}
      <div style={{ color: "rgba(255,255,255,0.72)", fontSize: 15, lineHeight: 1.75 }}>
        {children}
      </div>
    </div>
  );
}

/** A "back to home" CTA typically used at the bottom of info pages. */
export function BackToHome() {
  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <Link href="/" style={{
        display:        "inline-flex",
        alignItems:     "center",
        gap:            8,
        padding:        "13px 26px",
        borderRadius:   12,
        background:     "linear-gradient(135deg,#2563EB,#1D4ED8)",
        color:          "#fff",
        fontSize:       15,
        fontWeight:     700,
        textDecoration: "none",
        boxShadow:      "0 4px 20px rgba(37,99,235,0.4)",
      }}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
        Back to home
      </Link>
    </div>
  );
}
