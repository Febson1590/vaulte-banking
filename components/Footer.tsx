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
    <footer style={{ background: "#06091A", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "72px 5% 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Top gradient line */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(96,165,250,0.3), rgba(167,139,250,0.3), transparent)", marginBottom: 64 }} />

        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr repeat(4, 1fr)", gap: 48, marginBottom: 64 }}>

          {/* Brand */}
          <div>
            <div style={{ marginBottom: 4, height: 56, overflow: "visible" }}>
              <img src="/assets/logo-vaulte.png" alt="Vaulte" style={{ height: 110, width: "auto", objectFit: "contain", mixBlendMode: "screen" }} />
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, maxWidth: 240, marginBottom: 28 }}>
              Global Digital Banking — borderless banking for everyone, everywhere.
            </p>
            {/* Social icons */}
            <div style={{ display: "flex", gap: 10 }}>
              {["𝕏", "in", "f", "▶"].map((s, i) => (
                <div key={i} style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "rgba(255,255,255,0.45)", fontSize: 14, cursor: "pointer",
                  transition: "all 0.2s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.2)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(96,165,250,0.3)"; (e.currentTarget as HTMLElement).style.color = "#60A5FA"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.45)"; }}
                >{s}</div>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.5)", letterSpacing: "0.12em", marginBottom: 20, textTransform: "uppercase" }}>{category}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {links.map(({ label, href }) => (
                  <Link key={`${category}-${label}`} href={href}
                    style={{ fontSize: 14, color: "rgba(255,255,255,0.45)", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={e => ((e.target as HTMLElement).style.color = "#fff")}
                    onMouseLeave={e => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.45)")}
                  >{label}</Link>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>
            © 2026 Vaulte — Global Digital Banking. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#34D399", display: "inline-block", boxShadow: "0 0 6px rgba(52,211,153,0.6)" }} />
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>All systems operational</span>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) { .footer-grid { grid-template-columns: 1fr 1fr !important; } }
        @media (max-width: 500px) { .footer-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </footer>
  );
}
