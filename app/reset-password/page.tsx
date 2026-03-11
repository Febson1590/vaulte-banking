"use client";
import { Suspense } from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const BG  = "linear-gradient(160deg,#BFDBFE 0%,#C7D9FD 25%,#DBEAFE 55%,#EFF6FF 80%,#DBEAFE 100%)";
const BLUE = "#1A73E8";
const NAVY = "#0F172A";

function PasswordStrengthBar({ password }: { password: string }) {
  const checks = [
    { label: "Min 8 characters",     pass: password.length >= 8 },
    { label: "Uppercase letter",      pass: /[A-Z]/.test(password) },
    { label: "Lowercase letter",      pass: /[a-z]/.test(password) },
    { label: "Number",                pass: /[0-9]/.test(password) },
    { label: "Special character",     pass: /[^A-Za-z0-9]/.test(password) },
  ];
  const score = checks.filter(c => c.pass).length;
  const barColor = score <= 1 ? "#EF4444" : score <= 3 ? "#F59E0B" : score === 4 ? "#3B82F6" : "#10B981";
  const label    = score <= 1 ? "Weak" : score <= 3 ? "Fair" : score === 4 ? "Good" : "Strong";

  if (!password) return null;

  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 999, background: i <= score ? barColor : "#E2E8F0", transition: "background 0.3s" }} />
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <span style={{ fontSize: 12, color: barColor, fontWeight: 600 }}>{label}</span>
        <span style={{ fontSize: 11.5, color: "#94A3B8" }}>{score}/5 checks</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px" }}>
        {checks.map(c => (
          <span key={c.label} style={{ fontSize: 11.5, color: c.pass ? "#10B981" : "#94A3B8", display: "flex", alignItems: "center", gap: 4 }}>
            {c.pass ? "✓" : "○"} {c.label}
          </span>
        ))}
      </div>
    </div>
  );
}

function ResetPasswordInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get("token") ?? "";

  const [password,    setPassword]    = useState("");
  const [confirm,     setConfirm]     = useState("");
  const [showPass,    setShowPass]    = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState(false);
  const [tokenValid,  setTokenValid]  = useState<boolean | null>(null);
  const [tokenChecking, setTokenChecking] = useState(true);

  // ── Pre-validate token on page load ──────────────────────
  useEffect(() => {
    if (!token) { setTokenChecking(false); setTokenValid(false); return; }
    fetch(`/api/auth/reset-password?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(d => { setTokenValid(d.valid === true); })
      .catch(() => { setTokenValid(false); })
      .finally(() => { setTokenChecking(false); });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (password.length < 8)  { setError("Password must be at least 8 characters."); return; }

    setLoading(true);
    try {
      const res  = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ token, password, confirmPassword: confirm }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Reset failed. Please request a new link.");
        if (data.invalid || data.expired) setTokenValid(false);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/login?reset=1"), 3000);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  // ── Loading token check ───────────────────────────────────
  if (tokenChecking) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BG }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: `3px solid ${BLUE}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 16px" }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          <p style={{ color: "#64748B", fontSize: 14 }}>Validating your reset link…</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BG, padding: "24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "8%", left: "6%", width: 200, height: 200, background: "rgba(26,115,232,0.08)", borderRadius: "50%", filter: "blur(50px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "8%", right: "6%", width: 250, height: 250, background: "rgba(26,115,232,0.07)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(26,115,232,0.14), 0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden", position: "relative", zIndex: 1 }}>

        {/* Blue header */}
        <div style={{ background: "linear-gradient(135deg,#1A73E8 0%,#1d4ed8 100%)", height: 160, textAlign: "center", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 90, height: 90, background: "rgba(255,255,255,0.07)", borderRadius: "50%" }} />
          <img src="/assets/logo-vaulte.png" alt="Vaulte" style={{ height: 200, objectFit: "contain", mixBlendMode: "screen", display: "block", margin: "0 auto" }} />
        </div>

        <div style={{ padding: "32px 32px 28px" }}>
          {/* Invalid/expired token */}
          {tokenValid === false && !success && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>⛔</div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: NAVY, marginBottom: 10 }}>Link Expired or Invalid</h2>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7, marginBottom: 24 }}>
                This password reset link has expired or already been used. Reset links are valid for 15 minutes and can only be used once.
              </p>
              <Link href="/forgot-password" style={{
                display: "inline-block", padding: "12px 24px", borderRadius: 10,
                background: BLUE, color: "#fff", fontWeight: 700, textDecoration: "none",
                fontSize: 14, boxShadow: "0 4px 14px rgba(26,115,232,0.4)",
              }}>
                Request New Reset Link
              </Link>
              <p style={{ marginTop: 16, fontSize: 13.5 }}>
                <Link href="/login" style={{ color: "#64748B", textDecoration: "none" }}>← Back to Sign In</Link>
              </p>
            </div>
          )}

          {/* Success state */}
          {success && (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ width: 72, height: 72, background: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", fontSize: 32 }}>
                ✅
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: NAVY, marginBottom: 10 }}>Password Reset!</h2>
              <p style={{ fontSize: 14, color: "#64748B", lineHeight: 1.7, marginBottom: 24 }}>
                Your password has been updated successfully. You can now sign in with your new password.
              </p>
              <p style={{ fontSize: 13.5, color: "#94A3B8" }}>Redirecting to sign in…</p>
            </div>
          )}

          {/* Form state */}
          {tokenValid === true && !success && (
            <>
              <h1 style={{ fontSize: 22, fontWeight: 800, color: NAVY, textAlign: "center", marginBottom: 6, letterSpacing: "-0.4px" }}>Set New Password</h1>
              <p style={{ fontSize: 13.5, color: "#94A3B8", textAlign: "center", marginBottom: 28, lineHeight: 1.6 }}>
                Choose a strong, unique password for your Vaulte account.
              </p>

              {error && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#DC2626" }}>
                  ⚠️ {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                {/* New password */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 13.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 7 }}>New Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPass ? "text" : "password"}
                      value={password}
                      onChange={e => { setPassword(e.target.value); setError(""); }}
                      placeholder="Min. 8 characters"
                      style={{ width: "100%", padding: "12px 42px 12px 14px", borderRadius: 10, border: "1.5px solid #E2E8F0", fontSize: 14, color: "#111827", background: "#F8FAFC", outline: "none", boxSizing: "border-box", transition: "all 0.2s", fontFamily: "inherit" }}
                      onFocus={e => { e.target.style.borderColor = BLUE; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.1)"; }}
                      onBlur={e => { e.target.style.borderColor = "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                    />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9CA3AF" }}>
                      {showPass ? "🙈" : "👁️"}
                    </button>
                  </div>
                  <PasswordStrengthBar password={password} />
                </div>

                {/* Confirm password */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ fontSize: 13.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 7 }}>Confirm New Password</label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirm}
                      onChange={e => { setConfirm(e.target.value); setError(""); }}
                      placeholder="Repeat new password"
                      style={{
                        width: "100%", padding: "12px 42px 12px 14px", borderRadius: 10,
                        border: `1.5px solid ${confirm && confirm !== password ? "#EF4444" : "#E2E8F0"}`,
                        fontSize: 14, color: "#111827", background: "#F8FAFC",
                        outline: "none", boxSizing: "border-box", transition: "all 0.2s", fontFamily: "inherit",
                      }}
                      onFocus={e => { e.target.style.borderColor = BLUE; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.1)"; }}
                      onBlur={e => { e.target.style.borderColor = confirm && confirm !== password ? "#EF4444" : "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                    />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9CA3AF" }}>
                      {showConfirm ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {confirm && confirm !== password && (
                    <p style={{ fontSize: 11.5, color: "#EF4444", marginTop: 4 }}>Passwords do not match</p>
                  )}
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
                >
                  {loading ? "Resetting Password…" : "Reset Password"}
                </button>

                <div style={{ background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: 10, padding: "12px 14px", marginBottom: 16 }}>
                  <p style={{ margin: 0, fontSize: 12, color: "#94A3B8", textAlign: "center", lineHeight: 1.6 }}>
                    🔒 Your password is encrypted and never stored in plain text.
                  </p>
                </div>

                <p style={{ textAlign: "center", fontSize: 13.5, color: "#6B7280" }}>
                  <Link href="/login" style={{ color: "#64748B", textDecoration: "none" }}>← Back to Sign In</Link>
                </p>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(160deg,#BFDBFE 0%,#DBEAFE 100%)"}}><div style={{textAlign:"center"}}><div style={{width:40,height:40,border:"3px solid #1A73E8",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 12px"}}/><style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style><p style={{color:"#64748B",fontSize:14}}>Loading…</p></div></div>}>
      <ResetPasswordInner />
    </Suspense>
  );
}