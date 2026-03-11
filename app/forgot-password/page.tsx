"use client";
import { useState } from "react";
import Link from "next/link";

const BG  = "linear-gradient(160deg,#BFDBFE 0%,#C7D9FD 25%,#DBEAFE 55%,#EFF6FF 80%,#DBEAFE 100%)";
const BLUE = "#1A73E8";
const NAVY = "#0F172A";

export default function ForgotPasswordPage() {
  const [email,    setEmail]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [sent,     setSent]     = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      // Always show neutral message regardless of response
      await res.json();
      setSent(true);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BG, padding: "24px", position: "relative", overflow: "hidden" }}>
      {/* BG orbs */}
      <div style={{ position: "absolute", top: "8%", left: "6%", width: 200, height: 200, background: "rgba(26,115,232,0.08)", borderRadius: "50%", filter: "blur(50px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "8%", right: "6%", width: 250, height: 250, background: "rgba(26,115,232,0.07)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
      {/* Floating icons */}
      <div style={{ position: "absolute", top: "12%", right: "16%", fontSize: 38, filter: "drop-shadow(0 10px 18px rgba(26,115,232,0.3))", transform: "rotate(10deg)", pointerEvents: "none" }}>🔑</div>
      <div style={{ position: "absolute", bottom: "20%", left: "8%", fontSize: 32, filter: "drop-shadow(0 8px 14px rgba(26,115,232,0.25))", transform: "rotate(-12deg)", pointerEvents: "none" }}>🛡️</div>

      <div style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(26,115,232,0.14), 0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden", position: "relative", zIndex: 1 }}>

        {/* Blue header */}
        <div style={{ background: "linear-gradient(135deg,#1A73E8 0%,#1d4ed8 100%)", height: 160, padding: "0 32px", textAlign: "center", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 90, height: 90, background: "rgba(255,255,255,0.07)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: -14, left: -14, width: 70, height: 70, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />
          <img src="/assets/logo-vaulte.png" alt="Vaulte" style={{ height: 200, objectFit: "contain", mixBlendMode: "screen", display: "block", margin: "0 auto" }} />
        </div>

        <div style={{ padding: "32px 32px 28px" }}>
          {sent ? (
            /* ── Sent state ───────────────────────────────────── */
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 72, height: 72, background: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }}>
                📬
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: NAVY, marginBottom: 10 }}>Check Your Inbox</h2>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7, marginBottom: 28 }}>
                If an account exists for <strong style={{ color: NAVY }}>{email}</strong>, a secure password reset link has been sent. Check your inbox and spam folder.
              </p>
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "14px 18px", marginBottom: 28 }}>
                <p style={{ margin: 0, fontSize: 12.5, color: "#7F1D1D", lineHeight: 1.6 }}>
                  🔒 The reset link expires in <strong>15 minutes</strong>. Do not share it with anyone.
                </p>
              </div>
              <p style={{ fontSize: 13.5, color: "#64748B", marginBottom: 6 }}>
                Didn&apos;t receive it? Check your spam, or{" "}
                <button
                  onClick={() => { setSent(false); setEmail(""); }}
                  style={{ background: "none", border: "none", color: BLUE, fontWeight: 700, cursor: "pointer", fontSize: 13.5, fontFamily: "inherit", padding: 0 }}
                >
                  try again
                </button>
              </p>
              <Link href="/login" style={{ display: "inline-block", marginTop: 8, fontSize: 13.5, color: "#64748B", textDecoration: "none" }}>
                ← Back to Sign In
              </Link>
            </div>
          ) : (
            /* ── Form state ───────────────────────────────────── */
            <>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: NAVY, textAlign: "center", marginBottom: 6, letterSpacing: "-0.4px" }}>Forgot Password?</h1>
              <p style={{ fontSize: 13.5, color: "#94A3B8", textAlign: "center", marginBottom: 28, lineHeight: 1.6 }}>
                Enter your registered email address and we&apos;ll send you a secure link to reset your password.
              </p>

              {error && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#DC2626" }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 22 }}>
                  <label style={{ fontSize: 13.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 7 }}>
                    Email Address
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#9CA3AF" }}>✉️</span>
                    <input
                      type="email"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(""); }}
                      placeholder="you@example.com"
                      style={{
                        width: "100%", padding: "12px 14px 12px 38px", borderRadius: 10,
                        border: `1.5px solid ${error ? "#EF4444" : "#E2E8F0"}`, fontSize: 14,
                        color: "#111827", background: "#F8FAFC", outline: "none",
                        boxSizing: "border-box", transition: "all 0.2s", fontFamily: "inherit",
                      }}
                      onFocus={e => { e.target.style.borderColor = BLUE; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.1)"; }}
                      onBlur={e => { e.target.style.borderColor = error ? "#EF4444" : "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: "100%", padding: "13px", borderRadius: 10, border: "none",
                    background: loading ? "#93C5FD" : BLUE, color: "#fff",
                    fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                    boxShadow: loading ? "none" : "0 4px 14px rgba(26,115,232,0.4)",
                    marginBottom: 16, transition: "all 0.2s", fontFamily: "inherit",
                  }}
                  onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#1557b0"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                  onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = BLUE; e.currentTarget.style.transform = "translateY(0)"; } }}
                >
                  {loading ? "Sending Reset Link…" : "Send Reset Link"}
                </button>

                {/* Security note */}
                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: "12px 14px", marginBottom: 20 }}>
                  <p style={{ margin: 0, fontSize: 12, color: "#94A3B8", textAlign: "center", lineHeight: 1.6 }}>
                    🔒 For security, we won&apos;t confirm whether an account exists for this email.
                  </p>
                </div>

                <p style={{ textAlign: "center", fontSize: 14, color: "#6B7280" }}>
                  Remember your password?{" "}
                  <Link href="/login" style={{ color: BLUE, fontWeight: 700, textDecoration: "none" }}>Sign in</Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
