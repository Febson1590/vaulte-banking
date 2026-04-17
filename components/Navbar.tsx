"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    fn();
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const navLinks = [
    { label: "Features",     href: "#features" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Security",     href: "#security" },
    { label: "Help",         href: "/help" },
  ];

  return (
    <nav
      className="vaulte-nav"
      style={{
        position:       "fixed",
        top:            0,
        left:           0,
        right:          0,
        zIndex:         999,
        background:     (scrolled || menuOpen) ? "rgba(6,9,26,0.95)" : "transparent",
        backdropFilter: (scrolled || menuOpen) ? "blur(20px)"        : "none",
        borderBottom:   (scrolled || menuOpen) ? "1px solid rgba(255,255,255,0.06)" : "none",
        transition:     "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div className="nav-inner" style={{
        maxWidth:       1200,
        margin:         "0 auto",
        padding:        "0 24px",
        height:         72,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "space-between",
        gap:            16,
      }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none", flexShrink: 0 }}>
          <img className="nav-logo" src="/assets/logo-vaulte.png" alt="Vaulte" style={{ height: 86, width: "auto", objectFit: "contain", mixBlendMode: "screen", display: "block" }} />
        </Link>

        {/* Desktop nav links */}
        <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: 32 }}>
          {navLinks.map(l => (
            <a key={l.label} href={l.href}
              style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.75)", textDecoration: "none", letterSpacing: "0.01em", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.75)")}
            >{l.label}</a>
          ))}
        </div>

        {/* Desktop right (Login + CTA) */}
        <div className="nav-cta-group" style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/login"
            className="nav-login"
            style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)", textDecoration: "none", padding: "8px 14px", borderRadius: 8, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >Login</Link>
          <Link href="/register"
            className="nav-cta"
            style={{ fontSize: 14, fontWeight: 700, color: "#fff", textDecoration: "none", padding: "9px 18px", borderRadius: 10, background: "linear-gradient(135deg,#2563EB,#1D4ED8)", boxShadow: "0 2px 16px rgba(37,99,235,0.4)", transition: "all 0.2s", letterSpacing: "0.01em", whiteSpace: "nowrap" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(37,99,235,0.55)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(37,99,235,0.4)"; }}
          >Open Account</Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="nav-hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background:     "none",
            border:         "1px solid rgba(255,255,255,0.15)",
            borderRadius:   10,
            cursor:         "pointer",
            padding:        "9px 10px",
            display:        "none",
            flexDirection:  "column",
            alignItems:     "center",
            justifyContent: "center",
            gap:            5,
            width:          42,
            height:         42,
          }}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
        >
          <span style={{ width: 20, height: 2, background: "#fff", borderRadius: 2, transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none", transition: "transform 0.2s" }} />
          <span style={{ width: 20, height: 2, background: "#fff", borderRadius: 2, opacity: menuOpen ? 0 : 1, transition: "opacity 0.15s" }} />
          <span style={{ width: 20, height: 2, background: "#fff", borderRadius: 2, transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none", transition: "transform 0.2s" }} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="nav-mobile-sheet"
          style={{
            background:    "#06091A",
            borderTop:     "1px solid rgba(255,255,255,0.07)",
            padding:       "18px 24px 26px",
            display:       "flex",
            flexDirection: "column",
            gap:           2,
            maxHeight:     "calc(100vh - 72px)",
            overflowY:     "auto",
          }}
        >
          {navLinks.map(l => (
            <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)}
              style={{ padding: "14px 0", fontSize: 16, fontWeight: 500, color: "rgba(255,255,255,0.82)", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >{l.label}</a>
          ))}
          <Link href="/login" onClick={() => setMenuOpen(false)}
            style={{ padding: "14px 0", fontSize: 16, color: "#60A5FA", fontWeight: 600, textDecoration: "none" }}
          >Login</Link>
          <Link href="/register" onClick={() => setMenuOpen(false)}
            style={{ marginTop: 14, padding: "14px", textAlign: "center", fontSize: 15, fontWeight: 700, color: "#fff", textDecoration: "none", background: "linear-gradient(135deg,#2563EB,#1D4ED8)", borderRadius: 12, boxShadow: "0 4px 20px rgba(37,99,235,0.4)", letterSpacing: "0.01em" }}
          >Open Free Account</Link>
        </div>
      )}

      <style>{`
        /* Tablet: tighten spacing */
        @media (max-width: 960px) {
          .vaulte-nav .nav-links { gap: 22px !important; }
          .vaulte-nav .nav-login { padding: 8px 10px !important; }
        }
        /* Mobile: hide desktop nav + CTA group, show hamburger */
        @media (max-width: 768px) {
          .vaulte-nav .nav-links,
          .vaulte-nav .nav-cta-group { display: none !important; }
          .vaulte-nav .nav-hamburger { display: flex !important; }
          .vaulte-nav .nav-inner { padding: 0 16px !important; height: 64px !important; }
          .vaulte-nav .nav-logo { height: 74px !important; }
        }
        @media (max-width: 360px) {
          .vaulte-nav .nav-inner { padding: 0 12px !important; }
          .vaulte-nav .nav-logo { height: 66px !important; }
        }
      `}</style>
    </nav>
  );
}
