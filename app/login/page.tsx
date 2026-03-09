"use client";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setLoading(true);
    // Auth logic will be wired here
    setTimeout(() => { setLoading(false); }, 1500);
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#F8FAFC" }}>

      {/* Left Panel */}
      <div style={{
        flex: 1, background: "linear-gradient(135deg, #0F172A 0%, #1e3a6e 60%, #1A73E8 100%)",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "48px", position: "relative", overflow: "hidden",
      }} className="left-panel">
        {/* Glow */}
        <div style={{ position: "absolute", top: "20%", right: "-10%", width: 300, height: 300, background: "rgba(26,115,232,0.2)", borderRadius: "50%", filter: "blur(60px)" }} />
        <div style={{ position: "absolute", bottom: "10%", left: "10%", width: 200, height: 200, background: "rgba(34,197,94,0.1)", borderRadius: "50%", filter: "blur(50px)" }} />

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", position: "relative" }}>
          <div style={{ width: 36, height: 36, background: "#1A73E8", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 4h14l-5 6v5l-4-2V10L3 4z" fill="white" />
            </svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Vaulte</span>
        </Link>

        {/* Middle content */}
        <div style={{ position: "relative" }}>
          <h2 style={{ fontSize: 36, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 16, letterSpacing: "-1px" }}>
            Welcome back to<br />
            <span style={{ color: "#60A5FA" }}>Global Banking</span>
          </h2>
          <p style={{ fontSize: 16, color: "rgba(255,255,255,0.6)", lineHeight: 1.75, maxWidth: 340 }}>
            Access your accounts, send money worldwide, and manage your finances — all in one place.
          </p>

          {/* Feature pills */}
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { icon: "🌍", text: "Send money to 190+ countries" },
              { icon: "🔒", text: "Protected with 2FA security" },
              { icon: "⚡", text: "Instant transaction notifications" },
            ].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, background: "rgba(255,255,255,0.06)", borderRadius: 10, padding: "12px 16px", backdropFilter: "blur(8px)", border: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ fontSize: 18 }}>{f.icon}</span>
                <span style={{ fontSize: 14, color: "rgba(255,255,255,0.8)", fontWeight: 500 }}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", position: "relative" }}>
          © 2026 Vaulte — Global Digital Banking
        </p>
      </div>

      {/* Right Panel — Form */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 5%" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <div style={{ marginBottom: 36 }}>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px", marginBottom: 8 }}>
              Sign in to your account
            </h1>
            <p style={{ fontSize: 15, color: "#6B7280" }}>
              Don't have an account?{" "}
              <Link href="/register" style={{ color: "#1A73E8", fontWeight: 600, textDecoration: "none" }}>
                Open one for free
              </Link>
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Error */}
            {error && (
              <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 16 }}>⚠️</span>
                <span style={{ fontSize: 14, color: "#EF4444", fontWeight: 500 }}>{error}</span>
              </div>
            )}

            {/* Email */}
            <div style={{ marginBottom: 20 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                style={{
                  width: "100%", padding: "13px 16px", borderRadius: 10,
                  border: "1.5px solid #E5E7EB", fontSize: 15, color: "#111827",
                  background: "#fff", outline: "none", transition: "border-color 0.2s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#1A73E8")}
                onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
              />
            </div>

            {/* Password */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 14, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  style={{
                    width: "100%", padding: "13px 48px 13px 16px", borderRadius: 10,
                    border: "1.5px solid #E5E7EB", fontSize: 15, color: "#111827",
                    background: "#fff", outline: "none", transition: "border-color 0.2s",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#1A73E8")}
                  onBlur={(e) => (e.target.style.borderColor = "#E5E7EB")}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{
                  position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)",
                  background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 18,
                }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            {/* Forgot */}
            <div style={{ textAlign: "right", marginBottom: 24 }}>
              <a href="#" style={{ fontSize: 14, color: "#1A73E8", fontWeight: 500, textDecoration: "none" }}>
                Forgot password?
              </a>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "14px", borderRadius: 10, border: "none",
              background: loading ? "#93C5FD" : "#1A73E8", color: "#fff",
              fontSize: 16, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s", boxShadow: "0 4px 16px rgba(26,115,232,0.35)",
            }}
              onMouseEnter={(e) => { if (!loading) (e.currentTarget.style.background = "#1557b0"); }}
              onMouseLeave={(e) => { if (!loading) (e.currentTarget.style.background = "#1A73E8"); }}
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "24px 0" }}>
              <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
              <span style={{ fontSize: 13, color: "#9CA3AF" }}>Secure login</span>
              <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#F0FDF4", borderRadius: 10, padding: "12px", border: "1px solid #BBF7D0" }}>
              <span style={{ fontSize: 16 }}>🔒</span>
              <span style={{ fontSize: 13, color: "#166534", fontWeight: 500 }}>256-bit SSL encrypted. Your data is safe.</span>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .left-panel { display: none !important; } }
      `}</style>
    </div>
  );
}
