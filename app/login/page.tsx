"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { loginUser, saveCurrentUser } from "@/lib/vaulteState";

export default function LoginPage() {
  const router = useRouter();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (password.length < 8) { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    setTimeout(() => {
      const user = loginUser(email, password);
      if (!user) {
        setError("Incorrect email or password. Please try again.");
        setLoading(false);
        return;
      }
      saveCurrentUser(user);
      router.push("/dashboard");
    }, 1200);
  };

  const handleDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const user = loginUser("demo@vaulte.com", "Demo@12345");
      if (user) { saveCurrentUser(user); router.push("/dashboard"); }
    }, 800);
  };

  const inputBase: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: 10,
    border: "1.5px solid #E2E8F0", fontSize: 14, color: "#111827",
    background: "#F8FAFC", outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s", fontFamily: "inherit",
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg,#BFDBFE 0%,#C7D9FD 25%,#DBEAFE 55%,#EFF6FF 80%,#DBEAFE 100%)",
      padding: "24px", position: "relative", overflow: "hidden",
    }}>
      <div style={{ position: "absolute", top: "8%", left: "6%", width: 200, height: 200, background: "rgba(26,115,232,0.08)", borderRadius: "50%", filter: "blur(50px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "8%", right: "6%", width: 250, height: 250, background: "rgba(26,115,232,0.07)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />

      {/* Floating fintech elements */}
      <div style={{ position: "absolute", top: "12%", right: "18%", fontSize: 38, filter: "drop-shadow(0 12px 20px rgba(26,115,232,0.35))", transform: "rotate(12deg)", pointerEvents: "none", userSelect: "none" }}>🪙</div>
      <div style={{ position: "absolute", bottom: "22%", right: "5%", fontSize: 34, filter: "drop-shadow(0 10px 18px rgba(26,115,232,0.3))", transform: "rotate(6deg)", pointerEvents: "none", userSelect: "none" }}>📱</div>
      <div style={{ position: "absolute", bottom: "10%", right: "16%", fontSize: 30, filter: "drop-shadow(0 8px 14px rgba(26,115,232,0.25))", transform: "rotate(-14deg)", pointerEvents: "none", userSelect: "none" }}>💳</div>
      <div style={{ position: "absolute", top: "18%", left: "7%", fontSize: 32, filter: "drop-shadow(0 8px 14px rgba(26,115,232,0.22))", transform: "rotate(4deg)", pointerEvents: "none", userSelect: "none" }}>🛡️</div>

      <div style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(26,115,232,0.14), 0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden", position: "relative", zIndex: 1 }}>
        {/* Blue header */}
        <div style={{ background: "linear-gradient(135deg,#1A73E8 0%,#1d4ed8 100%)", height: 160, padding: "0 32px", textAlign: "center", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", top: -24, right: -24, width: 100, height: 100, background: "rgba(255,255,255,0.07)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: -16, left: -16, width: 80, height: 80, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />
          <img src="/assets/logo-vaulte.png" alt="Vaulte" style={{ height: 200, objectFit: "contain", mixBlendMode: "screen", display: "block", margin: "0 auto" }} />
        </div>

        <div style={{ padding: "32px 32px 28px" }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: "#0F172A", textAlign: "center", marginBottom: 6, letterSpacing: "-0.4px" }}>Welcome Back</h1>
          <p style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", marginBottom: 28 }}>Sign in to access your Vaulte account</p>

          {error && (
            <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#DC2626" }}>
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Email */}
            <div style={{ marginBottom: 18 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 7 }}>
                <label style={{ fontSize: 13.5, fontWeight: 600, color: "#374151" }}>Email Address</label>
              </div>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 15, color: "#9CA3AF" }}>✉️</span>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  style={{ ...inputBase, paddingLeft: 38 }}
                  onFocus={e => { e.target.style.borderColor = "#1A73E8"; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: 24 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 7 }}>Password</label>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••"
                  style={{ ...inputBase, paddingRight: 42 }}
                  onFocus={e => { e.target.style.borderColor = "#1A73E8"; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9CA3AF" }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} style={{
              width: "100%", padding: "13px", borderRadius: 10, border: "none",
              background: loading ? "#93C5FD" : "#1A73E8", color: "#fff",
              fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              boxShadow: loading ? "none" : "0 4px 14px rgba(26,115,232,0.4)",
              marginBottom: 14, transition: "all 0.2s", fontFamily: "inherit",
            }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = "#1557b0"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
              onMouseLeave={e => { if (!loading) { e.currentTarget.style.background = "#1A73E8"; e.currentTarget.style.transform = "translateY(0)"; } }}
            >{loading ? "Signing in…" : "Sign In"}</button>

            <p style={{ textAlign: "center", fontSize: 14, color: "#6B7280", marginBottom: 20 }}>
              Don&apos;t have an account?{" "}
              <Link href="/register" style={{ color: "#1A73E8", fontWeight: 700, textDecoration: "none" }}>Create one free</Link>
            </p>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
              <span style={{ fontSize: 12.5, color: "#9CA3AF", fontWeight: 500 }}>Or try the demo</span>
              <div style={{ flex: 1, height: 1, background: "#E5E7EB" }} />
            </div>

            {/* Demo login */}
            <button type="button" onClick={handleDemoLogin} disabled={loading} style={{
              width: "100%", padding: "12px", borderRadius: 10, border: "1.5px solid #E2E8F0",
              background: "#F8FAFC", color: "#374151", fontSize: 14, fontWeight: 600,
              cursor: loading ? "not-allowed" : "pointer", fontFamily: "inherit",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
              transition: "all 0.18s",
            }}
              onMouseEnter={e => { if (!loading) { (e.currentTarget as HTMLElement).style.borderColor = "#1A73E8"; (e.currentTarget as HTMLElement).style.background = "#EEF4FF"; } }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLElement).style.background = "#F8FAFC"; }}
            >
              <span style={{ fontSize: 18 }}>🎮</span>
              <div style={{ textAlign: "left" }}>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: "#0F172A", lineHeight: 1.2 }}>Demo Account</p>
                <p style={{ fontSize: 11.5, color: "#94A3B8", marginTop: 2 }}>Pre-loaded with data · demo@vaulte.com</p>
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
