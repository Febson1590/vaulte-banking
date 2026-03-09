"use client";
import { useState } from "react";
import Link from "next/link";

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "", confirmPassword: "" });
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (f: string, v: string) => { setForm(p => ({ ...p, [f]: v })); setErrors(p => ({ ...p, [f]: "" })); };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.fullName) errs.fullName = "Full name is required";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Valid email required";
    if (!form.password || form.password.length < 8) errs.password = "Min. 8 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%", padding: "12px 14px", borderRadius: 10,
    border: `1.5px solid ${errors[field] ? "#EF4444" : "#E2E8F0"}`,
    fontSize: 14, color: "#111827", background: "#F8FAFC",
    outline: "none", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s", fontFamily: "inherit",
  });

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg,#BFDBFE 0%,#C7D9FD 25%,#DBEAFE 55%,#EFF6FF 80%,#DBEAFE 100%)",
      padding: "24px", position: "relative", overflow: "hidden",
    }}>
      {/* Clean background — no floating icons per spec */}
      <div style={{ position: "absolute", top: "8%", left: "8%", width: 220, height: 220, background: "rgba(26,115,232,0.07)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "8%", right: "8%", width: 280, height: 280, background: "rgba(26,115,232,0.06)", borderRadius: "50%", filter: "blur(70px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 400, height: 400, background: "rgba(255,255,255,0.2)", borderRadius: "50%", filter: "blur(80px)", pointerEvents: "none" }} />

      {/* Card */}
      <div style={{
        width: "100%", maxWidth: 420, background: "#fff", borderRadius: 20,
        boxShadow: "0 20px 60px rgba(26,115,232,0.14), 0 4px 20px rgba(0,0,0,0.06)",
        overflow: "hidden", position: "relative", zIndex: 1,
      }}>
        {/* Blue header */}
        <div style={{ background: "linear-gradient(135deg,#1A73E8 0%,#1d4ed8 100%)", padding: "26px 32px 32px", textAlign: "center", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 90, height: 90, background: "rgba(255,255,255,0.07)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: -14, left: -14, width: 70, height: 70, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, position: "relative" }}>
            <div style={{ width: 32, height: 32, background: "rgba(255,255,255,0.2)", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <svg width="17" height="17" viewBox="0 0 20 20" fill="none"><path d="M3 4h14l-5 6v5l-4-2V10L3 4z" fill="white" /></svg>
            </div>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.4px" }}>Vaulte</span>
          </div>
        </div>

        {/* Form */}
        <div style={{ padding: "28px 32px 28px" }}>
          <h1 style={{ fontSize: 21, fontWeight: 800, color: "#0F172A", textAlign: "center", marginBottom: 24, letterSpacing: "-0.4px" }}>Create Your Account</h1>

          <form onSubmit={handleSubmit}>
            {/* Full Name */}
            <div style={{ marginBottom: 15 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Full Name</label>
              <input type="text" value={form.fullName} onChange={e => update("fullName", e.target.value)} placeholder="John Doe"
                style={inputStyle("fullName")}
                onFocus={e => { e.target.style.borderColor = "#1A73E8"; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = errors.fullName ? "#EF4444" : "#E2E8F0"; e.target.style.boxShadow = "none"; }}
              />
              {errors.fullName && <p style={{ fontSize: 11.5, color: "#EF4444", marginTop: 4 }}>{errors.fullName}</p>}
            </div>

            {/* Email */}
            <div style={{ marginBottom: 15 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Email</label>
              <input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="user@example.com"
                style={inputStyle("email")}
                onFocus={e => { e.target.style.borderColor = "#1A73E8"; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.1)"; }}
                onBlur={e => { e.target.style.borderColor = errors.email ? "#EF4444" : "#E2E8F0"; e.target.style.boxShadow = "none"; }}
              />
              {errors.email && <p style={{ fontSize: 11.5, color: "#EF4444", marginTop: 4 }}>{errors.email}</p>}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 15 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} value={form.password} onChange={e => update("password", e.target.value)} placeholder="••••••••••"
                  style={{ ...inputStyle("password"), paddingRight: 42 }}
                  onFocus={e => { e.target.style.borderColor = "#1A73E8"; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = errors.password ? "#EF4444" : "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9CA3AF" }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: 11.5, color: "#EF4444", marginTop: 4 }}>{errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 22 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} placeholder="••••••••••"
                  style={{ ...inputStyle("confirmPassword"), paddingRight: 42 }}
                  onFocus={e => { e.target.style.borderColor = "#1A73E8"; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = errors.confirmPassword ? "#EF4444" : "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9CA3AF" }}>
                  {showConfirm ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.confirmPassword && <p style={{ fontSize: 11.5, color: "#EF4444", marginTop: 4 }}>{errors.confirmPassword}</p>}
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px", borderRadius: 10, border: "none",
              background: loading ? "#93C5FD" : "#1A73E8", color: "#fff",
              fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 4px 14px rgba(26,115,232,0.4)",
              marginBottom: 16, transition: "all 0.2s", fontFamily: "inherit",
            }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#1557b0"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = "#1A73E8"; e.currentTarget.style.transform = "translateY(0)"; } }}
            >{loading ? "Creating Account..." : "Register"}</button>

            <p style={{ textAlign: "center", fontSize: 14, color: "#6B7280", marginBottom: 20 }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#1A73E8", fontWeight: 700, textDecoration: "none" }}>Login</Link>
            </p>

            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
              <span style={{ fontSize: 13, color: "#9CA3AF", fontWeight: 500 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
            </div>

            <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
              {[
                <svg key="g" width="22" height="22" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>,
                <svg key="a" width="20" height="20" viewBox="0 0 24 24" fill="#000"><path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/></svg>
              ].map((icon, i) => (
                <button key={i} type="button" style={{
                  width: 52, height: 52, borderRadius: 12, border: "1.5px solid #E5E7EB",
                  background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 1px 6px rgba(0,0,0,0.06)", transition: "all 0.2s",
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = "#1A73E8"; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E5E7EB"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
                >{icon}</button>
              ))}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
