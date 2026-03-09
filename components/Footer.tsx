"use client";
import Link from "next/link";

const footerLinks = {
  Product: ["Features", "Security", "Pricing", "Changelog"],
  Company: ["About Us", "Careers", "Blog", "Press"],
  Support: ["Help Center", "Contact Us", "Privacy Policy", "Terms of Service"],
  Banking: ["Open Account", "Login", "Transfer Money", "Virtual Cards"],
};

export default function Footer() {
  return (
    <footer style={{ background: "#0F172A", padding: "72px 5% 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr repeat(4, 1fr)", gap: 48, marginBottom: 56 }}>

          {/* Brand */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
              <div style={{ width: 36, height: 36, background: "#1A73E8", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M3 4h14l-5 6v5l-4-2V10L3 4z" fill="white" />
                </svg>
              </div>
              <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Vaulte</span>
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
                {links.map((link) => (
                  <a key={link} href="#" style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s" }}
                    onMouseEnter={(e) => ((e.target as HTMLElement).style.color = "#fff")}
                    onMouseLeave={(e) => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.5)")}
                  >{link}</a>
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
