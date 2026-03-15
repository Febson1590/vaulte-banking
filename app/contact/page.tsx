"use client";
import Link from "next/link";
import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (f: string, v: string) => { setForm(p => ({ ...p, [f]: v })); setErrors(p => ({ ...p, [f]: "" })); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name) errs.name = "Name is required";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Valid email required";
    if (!form.subject) errs.subject = "Subject is required";
    if (!form.message || form.message.length < 10) errs.message = "Message must be at least 10 characters";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => { setLoading(false); setSent(true); }, 1500);
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%", padding: "12px 14px", borderRadius: 10,
    border: `1.5px solid ${errors[field] ? "#EF4444" : "#E2E8F0"}`,
    fontSize: 14, color: "#111827", background: "#F8FAFC",
    outline: "none", boxSizing: "border-box", fontFamily: "inherit", transition: "border-color 0.2s",
  });

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter',sans-serif" }}>

      {/* Navbar */}
      <nav style={{ background: "#0F172A", padding: "0 5%", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <img src="/assets/logo-vaulte.png" alt="Vaulte" style={{ height: 120, objectFit: "contain", mixBlendMode: "screen" }} />
        </Link>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.8)", textDecoration: "none", padding: "8px 16px", borderRadius: 8 }}>Login</Link>
          <Link href="/register" style={{ fontSize: 14, fontWeight: 700, color: "#fff", textDecoration: "none", padding: "9px 20px", borderRadius: 8, background: "#1A73E8" }}>Open Account</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#0F172A 0%,#1a3a7a 100%)", padding: "48px 5%", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 900, color: "#fff", marginBottom: 10, letterSpacing: "-1px" }}>Contact Us</h1>
        <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)" }}>We&apos;re here to help — 24 hours a day, 7 days a week.</p>
      </div>

      <div className="contact-main-grid" style={{ maxWidth: 1000, margin: "40px auto 60px", padding: "0 5%", display: "grid", gridTemplateColumns: "1fr 380px", gap: 28, alignItems: "start" }}>

        {/* Form */}
        <div style={{ background: "#fff", borderRadius: 16, padding: "36px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)", border: "1px solid #E5E7EB" }}>
          {sent ? (
            <div style={{ textAlign: "center", padding: "40px 0" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>✅</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", marginBottom: 8 }}>Message Sent!</h2>
              <p style={{ fontSize: 15, color: "#6B7280", marginBottom: 28, lineHeight: 1.7 }}>Thanks for reaching out. Our team will get back to you within 24 hours.</p>
              <button onClick={() => { setSent(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                style={{ padding: "12px 24px", background: "#1A73E8", color: "#fff", borderRadius: 10, border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                Send Another Message
              </button>
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: "#0F172A", marginBottom: 24, letterSpacing: "-0.3px" }}>Send us a message</h2>
              <form onSubmit={handleSubmit}>
                <div className="contact-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                  <div>
                    <label style={{ fontSize: 13.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Full Name</label>
                    <input value={form.name} onChange={e => update("name", e.target.value)} placeholder="John Doe" style={inputStyle("name")}
                      onFocus={e => { e.target.style.borderColor = "#1A73E8"; }} onBlur={e => { e.target.style.borderColor = errors.name ? "#EF4444" : "#E2E8F0"; }} />
                    {errors.name && <p style={{ fontSize: 11.5, color: "#EF4444", marginTop: 4 }}>{errors.name}</p>}
                  </div>
                  <div>
                    <label style={{ fontSize: 13.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Email</label>
                    <input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="you@example.com" style={inputStyle("email")}
                      onFocus={e => { e.target.style.borderColor = "#1A73E8"; }} onBlur={e => { e.target.style.borderColor = errors.email ? "#EF4444" : "#E2E8F0"; }} />
                    {errors.email && <p style={{ fontSize: 11.5, color: "#EF4444", marginTop: 4 }}>{errors.email}</p>}
                  </div>
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Subject</label>
                  <select value={form.subject} onChange={e => update("subject", e.target.value)} style={{ ...inputStyle("subject"), appearance: "none" }}>
                    <option value="">Select a topic...</option>
                    <option>Account & Registration</option>
                    <option>Transfers & Payments</option>
                    <option>Cards & Virtual Cards</option>
                    <option>Security & Fraud</option>
                    <option>Technical Issue</option>
                    <option>Other</option>
                  </select>
                  {errors.subject && <p style={{ fontSize: 11.5, color: "#EF4444", marginTop: 4 }}>{errors.subject}</p>}
                </div>
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 13.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Message</label>
                  <textarea value={form.message} onChange={e => update("message", e.target.value)} placeholder="Describe your issue or question in detail..."
                    rows={5} style={{ ...inputStyle("message"), resize: "vertical" }}
                    onFocus={e => { e.target.style.borderColor = "#1A73E8"; }} onBlur={e => { e.target.style.borderColor = errors.message ? "#EF4444" : "#E2E8F0"; }} />
                  {errors.message && <p style={{ fontSize: 11.5, color: "#EF4444", marginTop: 4 }}>{errors.message}</p>}
                </div>
                <button type="submit" disabled={loading} style={{
                  width: "100%", padding: "13px", borderRadius: 10, border: "none",
                  background: loading ? "#93C5FD" : "#1A73E8", color: "#fff",
                  fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: loading ? "none" : "0 4px 14px rgba(26,115,232,0.4)", fontFamily: "inherit",
                }}>
                  {loading ? "Sending..." : "Send Message"}
                </button>
              </form>
            </>
          )}
        </div>

        {/* Contact info */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {[
            { icon: "💬", title: "Live Chat", desc: "Chat with our support team in real time.", action: "Start Chat", href: "#" },
            { icon: "📞", title: "Phone Support", desc: "+1 (800) 123-4567\nMon–Fri, 9am–6pm EST", action: null, href: null },
            { icon: "✉️", title: "Email", desc: "support@vaulte.com\nWe reply within 24 hours.", action: null, href: null },
            { icon: "🏢", title: "Office", desc: "123 Finance Street\nSan Francisco, CA 94103", action: null, href: null },
          ].map(item => (
            <div key={item.title} style={{ background: "#fff", borderRadius: 14, padding: "22px", border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>{item.icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>{item.title}</p>
                  <p style={{ fontSize: 13.5, color: "#6B7280", lineHeight: 1.7, whiteSpace: "pre-line" }}>{item.desc}</p>
                  {item.action && (
                    <Link href={item.href!} style={{ display: "inline-block", marginTop: 10, fontSize: 13.5, fontWeight: 700, color: "#1A73E8", textDecoration: "none" }}>{item.action} →</Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@media (max-width: 768px) { div[style*="grid-template-columns: 1fr 380px"] { grid-template-columns: 1fr !important; } div[style*="grid-template-columns: 1fr 1fr"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  );
}
