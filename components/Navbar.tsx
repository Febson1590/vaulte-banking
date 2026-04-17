"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 999, height: 80,
      background: scrolled ? "rgba(6,9,26,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
      transition: "all 0.3s ease",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img src="/assets/logo-vaulte.png" alt="Vaulte" style={{ height: 200, objectFit: "contain", mixBlendMode: "screen" }} />
        </Link>

        {/* Desktop nav links */}
        <div style={{ display: "flex", gap: 36 }} className="nav-links">
          {["Features", "How It Works", "Security", "Help"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              style={{ fontSize: 14, fontWeight: 500, color: "rgba(255,255,255,0.7)", textDecoration: "none", letterSpacing: "0.01em", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.7)")}
            >{l}</a>
          ))}
        </div>

        {/* Desktop right */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="nav-links">
          <LanguageSelector variant="dark" />
          <Link href="/login"
            style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.85)", textDecoration: "none", padding: "8px 18px", borderRadius: 8, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.07)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >Login</Link>
          <Link href="/register"
            style={{ fontSize: 14, fontWeight: 700, color: "#fff", textDecoration: "none", padding: "9px 22px", borderRadius: 8, background: "linear-gradient(135deg,#2563EB,#1D4ED8)", boxShadow: "0 2px 16px rgba(37,99,235,0.4)", transition: "all 0.2s", letterSpacing: "0.01em" }}
            onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 4px 24px rgba(37,99,235,0.55)"; }}
            onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 16px rgba(37,99,235,0.4)"; }}
          >Open Account</Link>
        </div>

        {/* Mobile right */}
        <div className="nav-mobile-right" style={{ display: "none", alignItems: "center", gap: 10 }}>
          <LanguageSelector variant="dark" />
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", gap: 5, padding: 4 }}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
          >
            {[0, 1, 2].map(i => <div key={i} style={{ width: 22, height: 2, background: "#fff", borderRadius: 2 }} />)}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div style={{ background: "#06091A", borderTop: "1px solid rgba(255,255,255,0.07)", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 4 }}>
          <div style={{ paddingBottom: 16, marginBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
            <img src="/assets/logo-vaulte.png" alt="Vaulte" style={{ height: 100, objectFit: "contain", mixBlendMode: "screen" }} />
          </div>
          {["Features", "How It Works", "Security", "Help"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} onClick={() => setMenuOpen(false)}
              style={{ padding: "11px 0", fontSize: 15, color: "rgba(255,255,255,0.75)", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
            >{l}</a>
          ))}
          <Link href="/login" onClick={() => setMenuOpen(false)}
            style={{ padding: "11px 0", fontSize: 15, color: "#60A5FA", fontWeight: 600, textDecoration: "none" }}
          >Login</Link>
          <Link href="/register" onClick={() => setMenuOpen(false)}
            style={{ marginTop: 8, padding: "13px", textAlign: "center", fontSize: 15, fontWeight: 700, color: "#fff", textDecoration: "none", background: "linear-gradient(135deg,#2563EB,#1D4ED8)", borderRadius: 10 }}
          >Open Account</Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .nav-links { display: none !important; }
          .nav-mobile-right { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile-right { display: none !important; }
        }
        @media (max-width: 768px) { .vaulte-lang-name { display: none !important; } }
        @media (min-width: 769px) { .vaulte-lang-code { display: none !important; } }
      `}</style>
    </nav>
  );
}
