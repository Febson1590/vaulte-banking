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
    width: "100%", padding: "13px 16px", borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.1)", fontSize: 14, color: "#fff",
    background: "rgba(255,255,255,0.05)", outline: "none", boxSizing: "border-box",
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

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg,#06091A 0%,#0B1836 50%,#0D1F40 100%)",
      padding: "24px", position: "relative", overflow: "hidden",
    }}>
      {/* Background glow blobs */}
      <div style={{ position: "absolute", top: "5%", left: "5%", width: 400, height: 400, background: "rgba(37,99,235,0.12)", borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "5%", right: "5%", width: 350, height: 350, background: "rgba(167,139,250,0.1)", borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", width: 500, height: 500, background: "rgba(96,165,250,0.04)", borderRadius: "50%", filter: "blur(120px)", pointerEvents: "none" }} />

      {/* Floating decorative elements */}
      <div style={{ position: "absolute", top: "12%", right: "14%", fontSize: 36, filter: "drop-shadow(0 12px 24px rgba(96,165,250,0.4))", transform: "rotate(12deg)", pointerEvents: "none", userSelect: "none", opacity: 0.7 }}>🪙</div>
      <div style={{ position: "absolute", bottom: "18%", right: "8%", fontSize: 32, filter: "drop-shadow(0 10px 20px rgba(167,139,250,0.4))", transform: "rotate(6deg)", pointerEvents: "none", userSelect: "none", opacity: 0.6 }}>📱</div>
      <div style={{ position: "absolute", bottom: "10%", right: "20%", fontSize: 28, filter: "drop-shadow(0 8px 16px rgba(52,211,153,0.4))", transform: "rotate(-14deg)", pointerEvents: "none", userSelect: "none", opacity: 0.5 }}>💳</div>
      <div style={{ position: "absolute", top: "20%", left: "8%", fontSize: 30, filter: "drop-shadow(0 8px 16px rgba(96,165,250,0.4))", transform: "rotate(4deg)", pointerEvents: "none", userSelect: "none", opacity: 0.6 }}>🛡️</div>

      <div style={{ width: "100%", maxWidth: 460, position: "relative", zIndex: 1 }}>
        {/* Glass card */}
        <div style={{
          background: "rgba(11,24,54,0.85)",
          border: "1px solid rgba(96,165,250,0.15)",
          borderRadius: 24,
          overflow: "hidden",
          boxShadow: "0 32px 80px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04), inset 0 1px 0 rgba(255,255,255,0.06)",
          backdropFilter: "blur(20px)",
        }}>
          {/* Header with logo */}
          <div style={{
            background: "linear-gradient(135deg,rgba(37,99,235,0.3) 0%,rgba(29,78,216,0.2) 100%)",
            borderBottom: "1px solid rgba(96,165,250,0.12)",
            height: 160, padding: "0 32px", textAlign: "center",
            position: "relative", overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            {/* Top gradient line */}
            <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg, transparent, rgba(96,165,250,0.5), rgba(167,139,250,0.5), transparent)" }} />
            <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, background: "rgba(96,165,250,0.08)", borderRadius: "50%", filter: "blur(20px)" }} />
            <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, background: "rgba(167,139,250,0.06)", borderRadius: "50%", filter: "blur(20px)" }} />
            <img className="auth-logo" src="/assets/logo-vaulte.png" alt="Vaulte" style={{ height: 200, objectFit: "contain", mixBlendMode: "screen", display: "block", margin: "0 auto", position: "relative" }} />
          </div>

          <div style={{ padding: "32px 32px 28px" }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: "#fff", textAlign: "center", marginBottom: 6, letterSpacing: "-0.5px" }}>Welcome Back</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center", marginBottom: 28 }}>Sign in to access your Vaulte account</p>

            {/* Reset success banner */}
            {resetSuccess && (
              <div style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: 10, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#34D399" }}>
                ✅ Password reset successfully. You can now sign in with your new password.
              </div>
            )}

            {error && (
              <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 10, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#F87171" }}>
                ⚠️ {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.65)", display: "block", marginBottom: 8 }}>Email Address</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 15, opacity: 0.5 }}>✉️</span>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                    style={{ ...inputBase, paddingLeft: 40 }}
                    onFocus={e => { e.target.style.borderColor = "rgba(96,165,250,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(96,165,250,0.1)"; e.target.style.background = "rgba(255,255,255,0.07)"; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
                  />
                </div>
              </div>

              {/* Password */}
              <div style={{ marginBottom: 10 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.65)", display: "block", marginBottom: 8 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••••"
                    style={{ ...inputBase, paddingRight: 44 }}
                    onFocus={e => { e.target.style.borderColor = "rgba(96,165,250,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(96,165,250,0.1)"; e.target.style.background = "rgba(255,255,255,0.07)"; }}
                    onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "rgba(255,255,255,0.4)", padding: 0 }}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              {/* Forgot password link */}
              <div style={{ textAlign: "right", marginBottom: 24 }}>
                <Link href="/forgot-password" style={{ fontSize: 13, color: "#60A5FA", fontWeight: 600, textDecoration: "none" }}>
                  Forgot Password?
                </Link>
              </div>

              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                background: loading ? "rgba(37,99,235,0.5)" : "linear-gradient(135deg,#2563EB,#1D4ED8)",
                color: "#fff", fontSize: 15, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 20px rgba(37,99,235,0.5)",
                marginBottom: 20, transition: "all 0.2s", fontFamily: "inherit",
                letterSpacing: "0.01em",
              }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(37,99,235,0.65)"; } }}
                onMouseLeave={e => { if (!loading) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(37,99,235,0.5)"; } }}
              >{loading ? "Signing in…" : "Sign In"}</button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>New to Vaulte?</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              </div>

              <Link href="/register" style={{
                display: "block", textAlign: "center", padding: "13px",
                border: "1px solid rgba(96,165,250,0.2)", borderRadius: 12,
                color: "#60A5FA", fontSize: 14, fontWeight: 600, textDecoration: "none",
                background: "rgba(96,165,250,0.05)",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(96,165,250,0.1)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(96,165,250,0.35)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(96,165,250,0.05)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(96,165,250,0.2)"; }}
              >Create Free Account</Link>
            </form>
          </div>
        </div>

        {/* Trust note */}
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ color: "#34D399" }}>🔒</span> 256-bit SSL encryption · Bank-grade security
        </p>
      </div>

      <style>{`
        @media (max-width: 480px) {
          .auth-logo { height: 140px !important; }
        }
        @media (max-width: 360px) {
          .auth-logo { height: 120px !important; }
        }
        input::placeholder { color: rgba(255,255,255,0.25) !important; }
      `}</style>
    </div>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(160deg,#06091A 0%,#0B1836 100%)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: "3px solid rgba(96,165,250,0.3)", borderTopColor: "#60A5FA", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
          <style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Loading…</p>
        </div>
      </div>
    }>
      <LoginPageInner />
    </Suspense>
  );
}
