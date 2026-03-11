"use client";
import { Suspense } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { loginUser, saveCurrentUser } from "@/lib/vaulteState";

function LoginPageInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [resetSuccess, setResetSuccess] = useState(false);

  useEffect(() => {
    if (searchParams.get("reset") === "1") setResetSuccess(true);
  }, [searchParams]);

  const inputBase: React.CSSProperties = {
    width: "100%", padding: "12px 14px", borderRadius: 10,
    border: "1.5px solid #E2E8F0", fontSize: 14, color: "#111827",
    background: "#F8FAFC", outline: "none", boxSizing: "border-box",
    transition: "border-color 0.2s, box-shadow 0.2s", fontFamily: "inherit",
  };

  // ── Real login flow (via API → OTP step) ─────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResetSuccess(false);
    if (!email || !password) { setError("Please fill in all fields."); return; }

    setLoading(true);

    // 1. Check if there's a real auth user via the API
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, password }),
      });
      const data = await res.json();

      // ── API login succeeded → OTP step ───────────────────
      if (res.ok && data.success) {
        const firstName = encodeURIComponent(data.firstName ?? "");
        const emailEnc  = encodeURIComponent(email.toLowerCase().trim());
        router.push(`/login-verify?email=${emailEnc}&name=${firstName}`);
        return;
      }

      // ── Not verified yet ──────────────────────────────────
      if (res.status === 403 && data.notVerified) {
        const emailEnc = encodeURIComponent(data.email ?? email.toLowerCase().trim());
        router.push(`/verify-email?email=${emailEnc}`);
        return;
      }

      // ── API returned error (wrong creds, rate limit) ──────
      if (!res.ok) {
        // Fall through to localStorage demo check only if it's a 401
        if (res.status !== 401) {
          setError(data.error ?? "Sign in failed. Please try again.");
          setLoading(false);
          return;
        }
      }
    } catch {
      // Network error — fall through to localStorage fallback
    }

    // 2. Fallback: check localStorage (demo user + pre-existing localStorage users)
    setTimeout(() => {
      const user = loginUser(email, password);
      if (!user) {
        setError("Incorrect email or password. Please try again.");
        setLoading(false);
        return;
      }
      saveCurrentUser(user);
      // Track login (for localStorage users — fire-and-forget)
      fetch("/api/auth/track-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId: user.id, email: user.email, status: "success" }),
      }).catch(() => {});
      router.push("/dashboard");
    }, 600);
  };

  // ── Demo login (bypass OTP for demo account) ─────────────
  const handleDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const user = loginUser("demo@vaulte.com", "Demo@12345");
      if (user) {
        saveCurrentUser(user);
        fetch("/api/auth/track-login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ userId: user.id, email: user.email, status: "success" }),
        }).catch(() => {});
        router.push("/dashboard");
      }
    }, 800);
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
          <p style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", marginBottom: 24 }}>Sign in to access your Vaulte account</p>

          {/* Reset success banner */}
          {resetSuccess && (
            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#16A34A" }}>
              ✅ Password reset successfully. You can now sign in with your new password.
            </div>
          )}

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
            <div style={{ marginBottom: 10 }}>
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

            {/* Forgot password link */}
            <div style={{ textAlign: "right", marginBottom: 22 }}>
              <Link href="/forgot-password" style={{ fontSize: 13, color: "#1A73E8", fontWeight: 600, textDecoration: "none" }}>
                Forgot Password?
              </Link>
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
                <p style={{ fontSize: 11.5, color: "#94A3B8", marginTop: 2 }}>Pre-loaded with data · No OTP required</p>
              </div>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(160deg,#BFDBFE 0%,#DBEAFE 100%)"}}><div style={{textAlign:"center"}}><div style={{width:40,height:40,border:"3px solid #1A73E8",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 12px"}}/><style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style><p style={{color:"#64748B",fontSize:14}}>Loading…</p></div></div>}>
      <LoginPageInner />
    </Suspense>
  );
}