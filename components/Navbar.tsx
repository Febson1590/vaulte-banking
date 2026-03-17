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
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 999, height: 88,
      background: scrolled ? "rgba(10,18,38,0.97)" : "transparent",
      backdropFilter: scrolled ? "blur(14px)" : "none",
      boxShadow: scrolled ? "0 1px 0 rgba(255,255,255,0.06)" : "none",
      transition: "all 0.25s",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 32px", height: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
          <img src="/assets/logo-vaulte.png" alt="Vaulte" style={{ height: 240, objectFit: "contain", mixBlendMode: "screen", overflow: "visible" }} />
        </Link>
        <div style={{ display: "flex", gap: 32 }} className="nav-links">
          {["Features", "How It Works", "Security", "Help"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`}
              style={{ fontSize: 15, fontWeight: 500, color: "rgba(255,255,255,0.88)", textDecoration: "none", transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#fff")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.88)")}
            >{l}</a>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }} className="nav-links">
          <LanguageSelector variant="dark" />
          <Link href="/login" style={{ fontSize: 15, fontWeight: 600, color: "rgba(255,255,255,0.9)", textDecoration: "none", padding: "8px 16px", borderRadius: 8, transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}
          >Login</Link>
          <Link href="/register" style={{ fontSize: 15, fontWeight: 700, color: "#fff", textDecoration: "none", padding: "9px 22px", borderRadius: 8, background: "#1A73E8", boxShadow: "0 2px 10px rgba(26,115,232,0.4)", transition: "all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.background = "#1557b0"; e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "#1A73E8"; e.currentTarget.style.transform = "translateY(0)"; }}
          >Open Account</Link>
        </div>
        <button onClick={() => setMenuOpen(!menuOpen)} className="hamburger-btn"
          style={{ display: "none", background: "none", border: "none", cursor: "pointer", flexDirection: "column", gap: 5, padding: 4 }}>
          {[0,1,2].map(i => <div key={i} style={{ width: 22, height: 2, background: "#fff", borderRadius: 2 }} />)}
        </button>
      </div>
      {menuOpen && (
        <div style={{ background: "#0a1226", padding: "16px 24px", display: "flex", flexDirection: "column", gap: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.4)" }}>
          <div style={{ paddingBottom: 16, marginBottom: 8, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
            <img src="/assets/logo-vaulte.png" alt="Vaulte" style={{ height: 36, objectFit: "contain", mixBlendMode: "screen" }} />
          </div>
          {["Features", "How It Works", "Security", "Help"].map(l => (
            <a key={l} href={`#${l.toLowerCase().replace(/ /g, "-")}`} onClick={() => setMenuOpen(false)}
              style={{ padding: "10px 0", fontSize: 15, color: "rgba(255,255,255,0.8)", textDecoration: "none", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>{l}</a>
          ))}
          <div style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <LanguageSelector variant="dark" />
          </div>
          <Link href="/login" onClick={() => setMenuOpen(false)} style={{ padding: "10px 0", fontSize: 15, color: "#60a5fa", fontWeight: 600, textDecoration: "none" }}>Login</Link>
          <Link href="/register" onClick={() => setMenuOpen(false)} style={{ marginTop: 8, padding: "12px", textAlign: "center", fontSize: 15, fontWeight: 700, color: "#fff", textDecoration: "none", background: "#1A73E8", borderRadius: 8 }}>Open Account</Link>
        </div>
      )}
      <style>{`@media (max-width: 768px) { .nav-links { display: none !important; } .hamburger-btn { display: flex !important; } }`}</style>
    </nav>
  );
}
