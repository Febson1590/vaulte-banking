"use client";
import Link from "next/link";

const footerLinks: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: "Features", href: "/#features" },
    { label: "Security", href: "/#security" },
    { label: "Pricing", href: "/#features" },
    { label: "Changelog", href: "/" },
  ],
  Company: [
    { label: "About Us", href: "/" },
    { label: "Careers", href: "/" },
    { label: "Blog", href: "/" },
    { label: "Press", href: "/" },
  ],
  Support: [
    { label: "Help Center", href: "/help" },
    { label: "Contact Us", href: "/contact" },
    { label: "Privacy Policy", href: "/privacy-policy" },
    { label: "Terms of Service", href: "/terms" },
  ],
  Banking: [
    { label: "Open Account", href: "/register" },
    { label: "Login", href: "/login" },
    { label: "Transfer Money", href: "/dashboard" },
    { label: "Virtual Cards", href: "/dashboard" },
  ],
};

export default function Footer() {
  return (
    <footer style={{ background: "#0F172A", padding: "24px 5% 12px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr repeat(4, 1fr)", gap: 48, marginBottom: 56 }}>

          {/* Brand */}
          <div>
            <div style={{ marginBottom: -28, height: 60, overflow: "visible", display: "flex", alignItems: "flex-end" }}>
              <img src="/assets/logo-vaulte.png" alt="Vaulte" style={{ height: 120, width: "auto", objectFit: "contain", mixBlendMode: "screen", display: "block" }} />
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.8, maxWidth: 260, marginBottom: 24 }}>
              Global Digital Banking — Borderless banking for everyone, everywhere.
            </p>
            <div style={{ display: "flex", gap: 12 }}>
              {["𝕏", "in", "f", "▶"].map((s, i) => (
                <div key={i} style={{
                  width: 36, height: 36, borderRadius: 8, background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)", display: "flex", alignItems: "center",
                  justifyContent: "center", color: "rgba(255,255,255,0.5)", fontSize: 14, cursor: "pointer",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(26,115,232,0.2)"; (e.currentTarget as HTMLElement).style.color = "#60A5FA"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.5)"; }}
                >{s}</div>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "0.08em", marginBottom: 20, textTransform: "uppercase" }}>{category}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {links.map(({ label, href }) => (
                  <Link key={`${category}-${label}`} href={href} style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#fff")}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.5)")}
                  >{label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 24, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>
            © 2026 Vaulte — Global Digital Banking. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#22C55E", display: "inline-block" }} />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>All systems operational</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          footer > div > div:first-child { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 500px) {
          footer > div > div:first-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
