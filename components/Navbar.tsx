"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const navLinks = ["Features", "How It Works", "Security", "Help"];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: scrolled ? "rgba(255,255,255,0.97)" : "transparent",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      boxShadow: scrolled ? "0 1px 20px rgba(0,0,0,0.08)" : "none",
      transition: "all 0.3s ease",
      padding: "0 5%",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 70 }}>
        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{
            width: 36, height: 36, background: "#1A73E8", borderRadius: 10,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 4h14l-5 6v5l-4-2V10L3 4z" fill="white" strokeLinejoin="round" />
            </svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px" }}>
            Vaulte
          </span>
        </Link>

        {/* Desktop Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 36 }} className="desktop-nav">
          {navLinks.map((link) => (
            <a key={link} href={`#${link.toLowerCase().replace(/ /g, "-")}`}
              style={{ fontSize: 15, color: "#374151", fontWeight: 500, textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#1A73E8")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#374151")}
            >{link}</a>
          ))}
        </div>

        {/* Auth Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: 12 }} className="desktop-nav">
          <Link href="/login" style={{
            fontSize: 15, fontWeight: 600, color: "#1A73E8", textDecoration: "none",
            padding: "8px 20px", borderRadius: 8,
            transition: "background 0.2s",
          }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "#EFF6FF")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >Login</Link>
          <Link href="/register" style={{
            fontSize: 15, fontWeight: 600, color: "#fff", textDecoration: "none",
            padding: "9px 22px", borderRadius: 8, background: "#1A73E8",
            boxShadow: "0 2px 12px rgba(26,115,232,0.35)",
            transition: "background 0.2s, transform 0.15s",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "#1557b0"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "#1A73E8"; e.currentTarget.style.transform = "translateY(0)"; }}
          >Open Account</Link>
        </div>

        {/* Mobile Hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} style={{
          display: "none", background: "none", border: "none", cursor: "pointer", padding: 4
        }} className="mobile-menu-btn">
          <div style={{ width: 24, height: 2, background: "#0F172A", marginBottom: 5, borderRadius: 2 }} />
          <div style={{ width: 24, height: 2, background: "#0F172A", marginBottom: 5, borderRadius: 2 }} />
          <div style={{ width: 24, height: 2, background: "#0F172A", borderRadius: 2 }} />
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={{
          background: "#fff", borderTop: "1px solid #E5E7EB",
          padding: "16px 5%", display: "flex", flexDirection: "column", gap: 12
        }}>
          {navLinks.map((link) => (
            <a key={link} href={`#${link.toLowerCase().replace(/ /g, "-")}`}
              onClick={() => setMenuOpen(false)}
              style={{ fontSize: 15, color: "#374151", fontWeight: 500, textDecoration: "none", padding: "8px 0" }}
            >{link}</a>
          ))}
          <Link href="/login" onClick={() => setMenuOpen(false)} style={{ fontSize: 15, color: "#1A73E8", fontWeight: 600, textDecoration: "none", padding: "8px 0" }}>Login</Link>
          <Link href="/register" onClick={() => setMenuOpen(false)} style={{
            fontSize: 15, fontWeight: 600, color: "#fff", textDecoration: "none",
            padding: "11px 0", textAlign: "center", borderRadius: 8, background: "#1A73E8"
          }}>Open Account</Link>
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: block !important; }
        }
      `}</style>
    </nav>
  );
}
