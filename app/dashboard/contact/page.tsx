"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getCurrentUser } from "@/lib/vaulteState";

const C = {
  bg: "#F3F5FA", card: "#ffffff", navy: "#0F172A", blue: "#1A73E8",
  border: "rgba(15,23,42,0.07)", muted: "#94A3B8", text: "#0F172A", sub: "#64748B",
  shadow: "0 1px 3px rgba(15,23,42,0.05), 0 6px 20px rgba(15,23,42,0.07)",
  green: "#059669",
} as const;

const CATEGORIES = [
  { value: "General Inquiry",             icon: "💬" },
  { value: "Account Issue",               icon: "🏦" },
  { value: "Transaction Problem",         icon: "💳" },
  { value: "KYC / Identity Verification", icon: "🪪" },
  { value: "Security Concern",            icon: "🛡" },
  { value: "Card Issue",                  icon: "💳" },
  { value: "Technical Problem",           icon: "⚙️" },
  { value: "Billing & Fees",             icon: "💰" },
  { value: "Feedback & Suggestions",      icon: "⭐" },
];

const RESPONSE_INFO = [
  { icon: "⏱", title: "Response Time",  body: "We respond to all tickets within 24–48 business hours." },
  { icon: "🔒", title: "Data Security", body: "Never share passwords or OTP codes — even with support staff." },
];

export default function ContactPage() {
  const [mounted,    setMounted]    = useState(false);
  const [firstName,  setFirstName]  = useState("");
  const [lastName,   setLastName]   = useState("");
  const [email,      setEmail]      = useState("");

  // Form state
  const [category, setCategory] = useState("General Inquiry");
  const [priority, setPriority] = useState("Normal");
  const [subject,  setSubject]  = useState("");
  const [message,  setMessage]  = useState("");
  const [charCount, setCharCount] = useState(0);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [error,      setError]      = useState("");
  const [success,    setSuccess]    = useState<{ ticketRef: string } | null>(null);

  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      setFirstName(user.firstName ?? "");
      setLastName(user.lastName  ?? "");
      setEmail(user.email        ?? "");
    }
    setMounted(true);
  }, []);

  const handleMessageChange = (v: string) => {
    setMessage(v);
    setCharCount(v.length);
    if (error) setError("");
  };

  const handleSubmit = async () => {
    if (!subject.trim() || subject.trim().length < 5) {
      setError("Please enter a subject — at least 5 characters.");
      return;
    }
    if (!message.trim() || message.trim().length < 20) {
      setError("Please describe your issue in at least 20 characters.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/support", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ firstName, lastName, email, category, priority, subject: subject.trim(), message: message.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit. Please try again.");
        setSubmitting(false);
        return;
      }
      setSuccess({ ticketRef: data.ticketRef });
    } catch {
      setError("Network error. Please check your connection and try again.");
    }
    setSubmitting(false);
  };

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "11px 14px", borderRadius: 12,
    border: `1.5px solid ${C.border}`, fontSize: 13.5, color: C.text,
    background: C.bg, outline: "none", fontFamily: "inherit",
    boxSizing: "border-box", transition: "border-color 0.18s, box-shadow 0.18s, background 0.18s",
  };

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: C.sub,
    display: "block", marginBottom: 7, letterSpacing: "0.02em",
  };

  // ── Success state ──────────────────────────────────────────
  if (success) {
    return (
      <DashboardLayout title="Contact Support" subtitle="Support request submitted">
        <div style={{ maxWidth: 560, margin: "40px auto 0" }}>
          <div style={{ background: C.card, borderRadius: 24, padding: "48px 40px", border: `1px solid ${C.border}`, boxShadow: C.shadow, textAlign: "center" }}>
            {/* Success icon */}
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: "linear-gradient(135deg,#22C55E,#16A34A)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 8px 28px rgba(34,197,94,0.30)", fontSize: 36, color: "#fff" }}>✓</div>

            <p style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 8, letterSpacing: "-0.3px" }}>Request Submitted!</p>
            <p style={{ fontSize: 14, color: C.sub, marginBottom: 28, lineHeight: 1.6 }}>
              Your support ticket has been received. We&apos;ve sent a confirmation to <strong style={{ color: C.text }}>{email}</strong> with your reference number.
            </p>

            {/* Ticket ref badge */}
            <div style={{ background: "#EFF6FF", border: "1.5px solid #BFDBFE", borderRadius: 14, padding: "18px 24px", marginBottom: 28, display: "inline-block", minWidth: 280 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: C.blue, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 6 }}>Ticket Reference</p>
              <p style={{ fontSize: 22, fontWeight: 900, color: C.navy, letterSpacing: "0.04em", fontFamily: "monospace" }}>{success.ticketRef}</p>
            </div>

            {/* Meta */}
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {[
                { icon: "📧", text: `Confirmation sent to ${email}` },
                { icon: "⏱", text: "We'll respond within 24–48 business hours" },
                { icon: "📋", text: "Quote your reference in any follow-up replies" },
              ].map(item => (
                <div key={item.icon} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: C.sub, textAlign: "left" }}>
                  <span style={{ fontSize: 16, flexShrink: 0 }}>{item.icon}</span>
                  {item.text}
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <button onClick={() => { setSuccess(null); setSubject(""); setMessage(""); setCategory("General Inquiry"); setPriority("Normal"); setCharCount(0); }}
                style={{ padding: "12px 24px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: "transparent", color: C.sub, fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                Submit Another
              </button>
              <button onClick={() => window.location.href = "/dashboard"}
                style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: `linear-gradient(135deg,${C.blue},#1557b0)`, color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(26,115,232,0.28)" }}>
                Back to Dashboard →
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Main form ──────────────────────────────────────────────
  return (
    <DashboardLayout title="Contact Support" subtitle="Get help from our team · support@vaulteapp.com">
      <div className="contact-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>

        {/* ═══ LEFT — Contact Form ═══ */}
        <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, overflow: "hidden" }}>

          {/* Form header */}
          <div style={{ background: `linear-gradient(135deg,${C.navy} 0%,#1e293b 100%)`, padding: "24px 28px 20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 13, background: "rgba(26,115,232,0.20)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>✉</div>
              <div>
                <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", letterSpacing: "-0.2px" }}>Send a Message</p>
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>Fill in the details below and we&apos;ll get back to you</p>
              </div>
            </div>
          </div>

          <div style={{ padding: "28px 28px 32px" }}>

            {/* ── Category & Priority row ── */}
            <div className="contact-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 18 }}>
              <div>
                <label style={labelStyle}>Category</label>
                <div style={{ position: "relative" }}>
                  <select value={category} onChange={e => setCategory(e.target.value)} style={{ ...inputStyle, appearance: "none", cursor: "pointer", paddingRight: 36 }}>
                    {CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.icon} {c.value}</option>
                    ))}
                  </select>
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: C.muted, pointerEvents: "none" }}>▾</span>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Priority</label>
                <div style={{ position: "relative" }}>
                  <select value={priority} onChange={e => setPriority(e.target.value)} style={{
                    ...inputStyle, appearance: "none", cursor: "pointer", paddingRight: 36,
                    borderColor: priority === "Urgent" ? "#EF4444" : C.border,
                    background:  priority === "Urgent" ? "#FFF5F5" : C.bg,
                    color:       priority === "Urgent" ? "#DC2626"  : C.text,
                    fontWeight:  priority === "Urgent" ? 600 : 400,
                  }}>
                    <option value="Normal">Normal</option>
                    <option value="Urgent">🚨 Urgent</option>
                  </select>
                  <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 10, color: C.muted, pointerEvents: "none" }}>▾</span>
                </div>
              </div>
            </div>

            {/* ── Subject ── */}
            <div style={{ marginBottom: 18 }}>
              <label style={labelStyle}>Subject</label>
              <input
                type="text"
                placeholder="Brief description of your issue…"
                value={subject}
                maxLength={120}
                onChange={e => { setSubject(e.target.value); if (error) setError(""); }}
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.08)"; e.target.style.background = "#fff"; }}
                onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; e.target.style.background = C.bg; }}
              />
            </div>

            {/* ── Message ── */}
            <div style={{ marginBottom: 22 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
                <label style={{ ...labelStyle, marginBottom: 0 }}>Message</label>
                <span style={{ fontSize: 11, color: charCount > 3800 ? "#EF4444" : C.muted }}>{charCount} / 4000</span>
              </div>
              <textarea
                placeholder="Please describe your issue in detail. Include any relevant account information, error messages, or steps you've already tried…"
                value={message}
                rows={7}
                maxLength={4000}
                onChange={e => handleMessageChange(e.target.value)}
                style={{ ...inputStyle, resize: "vertical", minHeight: 160, lineHeight: 1.65 }}
                onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.08)"; e.target.style.background = "#fff"; }}
                onBlur={e  => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; e.target.style.background = C.bg; }}
              />
            </div>

            {/* ── Divider ── */}
            <div style={{ height: 1, background: C.border, marginBottom: 20 }} />

            {/* ── User info (read-only) ── */}
            <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Your Information</p>
            <div className="contact-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 22 }}>
              <div>
                <label style={labelStyle}>Full Name</label>
                <div style={{ ...inputStyle, background: "#F8FAFC", color: C.sub, cursor: "default" }}>
                  {mounted ? `${firstName} ${lastName}`.trim() || "—" : "—"}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Email Address</label>
                <div style={{ ...inputStyle, background: "#F8FAFC", color: C.sub, cursor: "default", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {mounted ? email || "—" : "—"}
                </div>
              </div>
            </div>

            {/* ── Error ── */}
            {error && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "11px 14px", marginBottom: 18, display: "flex", alignItems: "center", gap: 9 }}>
                <span style={{ fontSize: 14, color: "#EF4444", flexShrink: 0 }}>⚠</span>
                <p style={{ fontSize: 13, color: "#B91C1C", fontWeight: 500 }}>{error}</p>
              </div>
            )}

            {/* ── Submit ── */}
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                width: "100%", padding: "14px", borderRadius: 14, border: "none",
                background: submitting ? "#94A3B8" : `linear-gradient(135deg,${C.blue},#1557b0)`,
                color: "#fff", fontSize: 14.5, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer",
                fontFamily: "inherit", boxShadow: submitting ? "none" : "0 4px 16px rgba(26,115,232,0.28)",
                transition: "all 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 9,
              }}
              onMouseEnter={e => { if (!submitting) { (e.currentTarget).style.boxShadow = "0 8px 24px rgba(26,115,232,0.38)"; (e.currentTarget).style.transform = "translateY(-1px)"; } }}
              onMouseLeave={e => { (e.currentTarget).style.boxShadow = submitting ? "none" : "0 4px 16px rgba(26,115,232,0.28)"; (e.currentTarget).style.transform = "translateY(0)"; }}
            >
              {submitting ? (
                <>
                  <div style={{ width: 16, height: 16, border: "2.5px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.7s linear infinite" }} />
                  Sending…
                </>
              ) : (
                <>✉ Send Message</>
              )}
            </button>
          </div>
        </div>

        {/* ═══ RIGHT — Info panel ═══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Response time & security cards */}
          {RESPONSE_INFO.map(info => (
            <div key={info.title} style={{ background: C.card, borderRadius: 18, padding: "20px 22px", border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${C.blue}14`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, flexShrink: 0 }}>{info.icon}</div>
                <div>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 5 }}>{info.title}</p>
                  <p style={{ fontSize: 13, color: C.sub, lineHeight: 1.6 }}>{info.body}</p>
                </div>
              </div>
            </div>
          ))}

          {/* Email direct */}
          <div style={{ background: C.card, borderRadius: 18, padding: "20px 22px", border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 12 }}>📧 Direct Email</p>
            <a href="mailto:support@vaulteapp.com"
              style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", borderRadius: 11, background: "#EFF6FF", border: "1px solid #BFDBFE", textDecoration: "none", transition: "all 0.15s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#DBEAFE"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#EFF6FF"}
            >
              <span style={{ fontSize: 18, flexShrink: 0 }}>✉</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: C.blue }}>support@vaulteapp.com</span>
            </a>
          </div>

          {/* Live chat */}
          <div style={{ background: C.card, borderRadius: 18, padding: "20px 22px", border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: C.text, marginBottom: 4 }}>💬 Live Chat</p>
            <p style={{ fontSize: 12.5, color: C.sub, marginBottom: 14, lineHeight: 1.6 }}>
              Use the chat button in the bottom corner for instant support during business hours.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 0 3px rgba(34,197,94,0.18)" }} />
              <span style={{ fontSize: 12, color: C.green, fontWeight: 600 }}>Available now</span>
            </div>
          </div>

          {/* Tips card */}
          <div style={{ background: `linear-gradient(135deg,${C.navy} 0%,#1e293b 100%)`, borderRadius: 18, padding: "20px 22px", border: `1px solid rgba(255,255,255,0.06)` }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 14 }}>💡 Helpful Tips</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {[
                "Include your account email in the message",
                "Attach transaction IDs for faster resolution",
                "Mark as Urgent only for security issues",
                "Check your spam folder for our reply",
              ].map((tip, i) => (
                <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 9 }}>
                  <span style={{ fontSize: 12, color: C.blue, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>→</span>
                  <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.55 }}>{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select:focus { border-color: ${C.blue} !important; box-shadow: 0 0 0 3px rgba(26,115,232,0.08) !important; background: #fff !important; outline: none; }
        @media (max-width: 900px) {
          .contact-main-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}
