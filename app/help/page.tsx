"use client";
import Link from "next/link";
import { useState } from "react";

const faqs = [
  {
    category: "Getting Started",
    items: [
      { q: "How do I open a Vaulte account?", a: "Click 'Open Account' on the homepage, fill in your details, verify your identity, and you're ready to go. The process takes less than 5 minutes." },
      { q: "What documents do I need to register?", a: "You'll need a valid government-issued ID (passport or driver's license) and proof of address (utility bill or bank statement from the last 3 months)." },
      { q: "Is Vaulte available in my country?", a: "Vaulte is available in 190+ countries. You can check availability during the registration process by entering your country of residence." },
    ],
  },
  {
    category: "Transfers & Payments",
    items: [
      { q: "How do I send money internationally?", a: "Go to your dashboard, click 'Send Money', enter the recipient's details and amount. International transfers typically arrive within 1–2 business days." },
      { q: "What are the transfer limits?", a: "Standard accounts can send up to $10,000 per day. Verified accounts have higher limits. Contact support to request a limit increase." },
      { q: "Are there fees for transfers?", a: "Vaulte offers free transfers between Vaulte accounts. International bank transfers may incur a small fee depending on the destination country and currency." },
    ],
  },
  {
    category: "Security",
    items: [
      { q: "How does Vaulte keep my money safe?", a: "We use AES-256 encryption, two-factor authentication, and 24/7 fraud monitoring. Your funds are also protected by our banking partners' insurance schemes." },
      { q: "What should I do if I suspect fraud?", a: "Immediately lock your card from the dashboard, then contact our support team 24/7 via live chat or call our fraud hotline. We'll investigate and resolve within 24 hours." },
      { q: "Can I use Vaulte on multiple devices?", a: "Yes. Your account is accessible from any device. We'll notify you of any new device logins for your security." },
    ],
  },
  {
    category: "Cards & Accounts",
    items: [
      { q: "How do I get a virtual card?", a: "Virtual cards are issued instantly from your dashboard under the 'Cards' section. Physical cards are dispatched within 5–7 business days." },
      { q: "Can I hold multiple currencies?", a: "Yes. Vaulte supports USD, EUR, GBP, and many more. You can hold, exchange, and spend in multiple currencies with real exchange rates." },
      { q: "How do I freeze or unfreeze my card?", a: "Go to Dashboard → Cards, select the card, and toggle the freeze switch. Freezing takes effect immediately and can be reversed at any time." },
    ],
  },
];

export default function HelpPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const toggle = (key: string) => setOpenIndex(openIndex === key ? null : key);

  const filtered = search.trim()
    ? faqs.map(cat => ({
        ...cat,
        items: cat.items.filter(
          item => item.q.toLowerCase().includes(search.toLowerCase()) || item.a.toLowerCase().includes(search.toLowerCase())
        ),
      })).filter(cat => cat.items.length > 0)
    : faqs;

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter',sans-serif" }}>

      {/* Navbar */}
      <nav style={{ background: "#0F172A", padding: "0 5%", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <img src="/assets/logo-vaulte.png" alt="Vaulte" style={{ height: 120, objectFit: "contain", mixBlendMode: "screen" }} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.8)", textDecoration: "none", padding: "8px 16px", borderRadius: 8 }}>Login</Link>
          <Link href="/register" style={{ fontSize: 14, fontWeight: 700, color: "#fff", textDecoration: "none", padding: "9px 20px", borderRadius: 8, background: "#1A73E8" }}>Open Account</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#0F172A 0%,#1a3a7a 100%)", padding: "56px 5%", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(26,115,232,0.2)", border: "1px solid rgba(26,115,232,0.4)", borderRadius: 999, padding: "5px 14px", marginBottom: 20 }}>
          <span style={{ fontSize: 12, color: "#60A5FA", fontWeight: 600 }}>Help Center</span>
        </div>
        <h1 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 900, color: "#fff", marginBottom: 14, letterSpacing: "-1px" }}>How can we help you?</h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", marginBottom: 32 }}>Search our knowledge base or browse the FAQs below.</p>
        <div style={{ maxWidth: 520, margin: "0 auto", position: "relative" }}>
          <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 16, color: "#9CA3AF" }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search for answers..."
            style={{ width: "100%", padding: "14px 18px 14px 44px", borderRadius: 12, border: "none", fontSize: 15, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
          />
        </div>
      </div>

      {/* Quick links */}
      <div style={{ maxWidth: 900, margin: "40px auto 0", padding: "0 5%", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
        {[
          { icon: "💳", label: "Cards & Payments", href: "#" },
          { icon: "🔐", label: "Security", href: "#" },
          { icon: "🌍", label: "International Transfers", href: "#" },
          { icon: "📞", label: "Contact Support", href: "/contact" },
        ].map(item => (
          <Link key={item.label} href={item.href} style={{
            display: "flex", flexDirection: "column", alignItems: "center", gap: 10,
            background: "#fff", borderRadius: 14, padding: "24px 16px", textDecoration: "none",
            border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.04)", transition: "all 0.2s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#1A73E8"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
          >
            <span style={{ fontSize: 28 }}>{item.icon}</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#0F172A", textAlign: "center" }}>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* FAQs */}
      <div style={{ maxWidth: 900, margin: "40px auto 60px", padding: "0 5%" }}>
        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "48px 0", color: "#6B7280" }}>
            <p style={{ fontSize: 32, marginBottom: 12 }}>🔍</p>
            <p style={{ fontSize: 16, fontWeight: 600 }}>No results found for "{search}"</p>
            <p style={{ fontSize: 14, marginTop: 6 }}>Try a different search term or <Link href="/contact" style={{ color: "#1A73E8" }}>contact support</Link>.</p>
          </div>
        )}
        {filtered.map(cat => (
          <div key={cat.category} style={{ marginBottom: 36 }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", marginBottom: 14, letterSpacing: "-0.3px" }}>{cat.category}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {cat.items.map((item, i) => {
                const key = `${cat.category}-${i}`;
                const isOpen = openIndex === key;
                return (
                  <div key={key} style={{ background: "#fff", borderRadius: 12, border: `1.5px solid ${isOpen ? "#1A73E8" : "#E5E7EB"}`, overflow: "hidden", transition: "border-color 0.2s" }}>
                    <button onClick={() => toggle(key)} style={{
                      width: "100%", padding: "18px 20px", display: "flex", justifyContent: "space-between", alignItems: "center",
                      background: "none", border: "none", cursor: "pointer", textAlign: "left", fontFamily: "inherit",
                    }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: "#0F172A" }}>{item.q}</span>
                      <span style={{ fontSize: 18, color: "#1A73E8", flexShrink: 0, marginLeft: 12, transform: isOpen ? "rotate(45deg)" : "rotate(0)", transition: "transform 0.2s" }}>+</span>
                    </button>
                    {isOpen && (
                      <div style={{ padding: "0 20px 18px", fontSize: 14, color: "#6B7280", lineHeight: 1.8 }}>{item.a}</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Still need help */}
        <div style={{ background: "linear-gradient(135deg,#0F172A,#1e3a6e)", borderRadius: 16, padding: "36px", textAlign: "center", marginTop: 20 }}>
          <p style={{ fontSize: 22, fontWeight: 800, color: "#fff", marginBottom: 8 }}>Still need help?</p>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", marginBottom: 24 }}>Our support team is available 24/7 to assist you.</p>
          <Link href="/contact" style={{ display: "inline-block", padding: "12px 28px", background: "#1A73E8", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 4px 14px rgba(26,115,232,0.4)" }}>
            Contact Support
          </Link>
        </div>
      </div>
    </div>
  );
}
