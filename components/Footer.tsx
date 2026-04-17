"use client";
import Link from "next/link";

const footerLinks: Record<string, { label: string; href: string }[]> = {
  Product: [
    { label: "Features",     href: "/#features" },
    { label: "Security",     href: "/#security" },
    { label: "How It Works", href: "/#how-it-works" },
    { label: "Pricing",      href: "/pricing" },
    { label: "Changelog",    href: "/changelog" },
  ],
  Company: [
    { label: "About Us", href: "/about" },
    { label: "Careers",  href: "/careers" },
    { label: "Blog",     href: "/blog" },
    { label: "Press",    href: "/press" },
  ],
  Support: [
    { label: "Help Center",     href: "/help" },
    { label: "Contact Us",      href: "/contact" },
    { label: "Privacy Policy",  href: "/privacy-policy" },
    { label: "Terms of Service",href: "/terms" },
  ],
  Banking: [
    { label: "Open Account",   href: "/register" },
    { label: "Login",          href: "/login" },
    { label: "Transfer Money", href: "/#features" },
    { label: "Virtual Cards",  href: "/#features" },
  ],
};

const SOCIALS: { label: string; href: string; svg: React.ReactNode }[] = [
  {
    label: "Vaulte on X",
    href:  "https://twitter.com/vaulteapp",
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: "Vaulte on LinkedIn",
    href:  "https://www.linkedin.com/company/vaulteapp",
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.024-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
      </svg>
    ),
  },
  {
    label: "Vaulte on Facebook",
    href:  "https://www.facebook.com/vaulteapp",
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    label: "Vaulte on YouTube",
    href:  "https://www.youtube.com/@vaulteapp",
    svg: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="vaulte-footer" style={{ background: "#06091A", borderTop: "1px solid rgba(255,255,255,0.06)", padding: "72px 5% 32px" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Top gradient line */}
        <div aria-hidden="true" style={{ height: 1, background: "linear-gradient(90deg, transparent, rgba(96,165,250,0.3), rgba(167,139,250,0.3), transparent)", marginBottom: 56 }} />

        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "2fr repeat(4, minmax(0,1fr))", gap: 48, marginBottom: 56 }}>

          {/* Brand */}
          <div className="footer-brand" style={{ minWidth: 0 }}>
            <div style={{ marginBottom: 16 }}>
              <Link href="/" style={{ display: "inline-block" }}>
                <img src="/assets/logo-vaulte.png" alt="Vaulte" style={{ height: 100, width: "auto", objectFit: "contain", mixBlendMode: "screen" }} />
              </Link>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.75, maxWidth: 260, marginBottom: 24 }}>
              Global Digital Banking — borderless banking for everyone, everywhere.
            </p>
            {/* Social icons */}
            <div style={{ display: "flex", gap: 10 }}>
              {SOCIALS.map(s => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  style={{
                    width:          40,
                    height:         40,
                    borderRadius:   10,
                    background:     "rgba(255,255,255,0.04)",
                    border:         "1px solid rgba(255,255,255,0.08)",
                    display:        "inline-flex",
                    alignItems:     "center",
                    justifyContent: "center",
                    color:          "rgba(255,255,255,0.55)",
                    textDecoration: "none",
                    transition:     "all 0.2s",
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(37,99,235,0.18)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(96,165,250,0.35)"; (e.currentTarget as HTMLElement).style.color = "#60A5FA"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(255,255,255,0.08)"; (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.55)"; }}
                >
                  {s.svg}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(255,255,255,0.55)", letterSpacing: "0.14em", marginBottom: 18, textTransform: "uppercase" }}>{category}</div>
              <ul style={{ display: "flex", flexDirection: "column", gap: 11, padding: 0, margin: 0, listStyle: "none" }}>
                {links.map(({ label, href }) => (
                  <li key={`${category}-${label}`}>
                    <Link href={href}
                      style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textDecoration: "none", transition: "color 0.2s" }}
                      onMouseEnter={e => ((e.target as HTMLElement).style.color = "#fff")}
                      onMouseLeave={e => ((e.target as HTMLElement).style.color = "rgba(255,255,255,0.5)")}
                    >{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: 28, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", margin: 0 }}>
            © {year} Vaulte — Global Digital Banking. All rights reserved.
          </p>
          <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
            <Link href="/privacy-policy" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>Privacy</Link>
            <Link href="/terms" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>Terms</Link>
            <Link href="/contact" style={{ fontSize: 13, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>Contact</Link>
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 1024px) {
          .vaulte-footer .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 40px !important; }
          .vaulte-footer .footer-brand { grid-column: 1 / -1 !important; }
        }
        @media (max-width: 560px) {
          .vaulte-footer { padding: 56px 6% 24px !important; }
          .vaulte-footer .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 32px !important; margin-bottom: 40px !important; }
          .vaulte-footer .footer-brand { grid-column: 1 / -1 !important; }
          .vaulte-footer .footer-bottom { justify-content: center !important; text-align: center !important; }
        }
        @media (max-width: 380px) {
          .vaulte-footer .footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}
