"use client";
import { Suspense } from "react";
import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { saveCurrentUser, createUser, getUsers } from "@/lib/vaulteState";

const BG  = "linear-gradient(160deg,#BFDBFE 0%,#C7D9FD 25%,#DBEAFE 55%,#EFF6FF 80%,#DBEAFE 100%)";
const BLUE = "#1A73E8";
const NAVY = "#0F172A";

function LoginVerifyInner() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const email        = searchParams.get("email") ?? "";
  const firstName    = searchParams.get("name")  ?? "";

  const [digits,      setDigits]      = useState(["", "", "", "", "", ""]);
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState(false);
  const [resending,   setResending]   = useState(false);
  const [resendMsg,   setResendMsg]   = useState("");
  const [cooldown,    setCooldown]    = useState(0);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setInterval(() => setCooldown(c => Math.max(0, c - 1)), 1000);
    return () => clearInterval(t);
  }, [cooldown]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  if (!email) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BG, padding: 24 }}>
        <div style={{ textAlign: "center", background: "#fff", borderRadius: 16, padding: "40px 32px", boxShadow: "0 20px 60px rgba(26,115,232,0.14)" }}>
          <p style={{ fontSize: 16, color: "#EF4444", marginBottom: 16 }}>⚠️ Session expired or missing email.</p>
          <Link href="/login" style={{ color: BLUE, fontWeight: 700 }}>Return to Login</Link>
        </div>
      </div>
    );
  }

  const handleDigit = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError("");
    if (digit && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted.length === 6) {
      setDigits(pasted.split(""));
      inputRefs.current[5]?.focus();
    }
  };

  const code = digits.join("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) { setError("Please enter the complete 6-digit code."); return; }

    setLoading(true);
    setError("");

    try {
      const res  = await fetch("/api/auth/verify-login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email, code }),
      });
      const data = await res.json();

      if (!res.ok) {
        if (data.attemptsLeft !== undefined) setAttemptsLeft(data.attemptsLeft);
        setError(data.error ?? "Verification failed.");
        if (data.expired || data.tooManyAttempts) {
          // Force re-login
          setTimeout(() => router.push("/login"), 2000);
        }
        setLoading(false);
        return;
      }

      // ── Session created — store in localStorage ───────────
      setSuccess(true);
      const userEmail = data.email ?? email;
      const nameLast  = data.lastName ?? "";
      const nameFirst = data.firstName ?? firstName ?? "";

      const existingUsers = getUsers();
      const existing = existingUsers.find(u => u.email === userEmail);

      if (existing) {
        saveCurrentUser(existing);
      } else {
        const newUser = createUser(nameFirst, nameLast, userEmail, "_oauth_session_");
        saveCurrentUser({ ...newUser, id: data.userId ?? newUser.id });
      }

      // Track login in Redis (async — don't block UI)
      fetch("/api/auth/track-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ userId: data.userId, email: userEmail, status: "success" }),
      }).catch(() => {});

      setTimeout(() => router.push("/dashboard"), 1800);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setResendMsg("");
    setError("");

    try {
      const res  = await fetch("/api/auth/resend-login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();

      if (!res.ok && data.waitSecs) {
        setCooldown(data.waitSecs);
        setResendMsg(`Please wait ${data.waitSecs}s before resending.`);
      } else {
        setCooldown(60);
        setResendMsg("A new login code has been sent to your email.");
        setDigits(["", "", "", "", "", ""]);
        setAttemptsLeft(5);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setResendMsg("Failed to resend. Please try again.");
    } finally {
      setResending(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: BG, padding: "24px", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "6%", left: "5%", width: 200, height: 200, background: "rgba(26,115,232,0.08)", borderRadius: "50%", filter: "blur(50px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "6%", right: "5%", width: 250, height: 250, background: "rgba(26,115,232,0.07)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: "15%", right: "18%", fontSize: 36, filter: "drop-shadow(0 10px 18px rgba(26,115,232,0.3))", transform: "rotate(10deg)", pointerEvents: "none" }}>🔐</div>
      <div style={{ position: "absolute", bottom: "18%", left: "8%", fontSize: 30, filter: "drop-shadow(0 8px 14px rgba(26,115,232,0.22))", transform: "rotate(-8deg)", pointerEvents: "none" }}>🛡️</div>

      <div style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(26,115,232,0.14), 0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden", position: "relative", zIndex: 1 }}>

        {/* Header */}
        <div style={{ background: "linear-gradient(135deg,#0F172A 0%,#1e293b 100%)", padding: "32px 32px 28px", textAlign: "center", position: "relative" }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 90, height: 90, background: "rgba(26,115,232,0.12)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: -14, left: -14, width: 70, height: 70, background: "rgba(26,115,232,0.08)", borderRadius: "50%" }} />
          <div style={{ fontSize: 40, marginBottom: 12 }}>{success ? "✅" : "🔐"}</div>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px" }}>
            {success ? "Login Successful!" : "Two-Factor Verification"}
          </h1>
          <p style={{ margin: "8px 0 0", fontSize: 13.5, color: "rgba(255,255,255,0.70)" }}>
            {success ? "Welcome back! Redirecting you…" : `Secure code sent to ${email}`}
          </p>
        </div>

        <div style={{ padding: "32px 32px 28px" }}>
          {success ? (
            <div style={{ textAlign: "center", padding: "20px 0" }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>👋</div>
              <p style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 8 }}>
                Welcome back{firstName ? `, ${firstName}` : ""}!
              </p>
              <p style={{ fontSize: 14, color: "#64748B" }}>Taking you to your dashboard…</p>
            </div>
          ) : (
            <>
              {/* Security info card */}
              <div style={{ background: "linear-gradient(135deg,#0F172A,#1e293b)", borderRadius: 12, padding: "16px 18px", marginBottom: 24, display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>🔒</span>
                <div>
                  <p style={{ margin: "0 0 4px", fontSize: 13.5, fontWeight: 700, color: "#fff" }}>Secure Login Verification</p>
                  <p style={{ margin: 0, fontSize: 12.5, color: "rgba(255,255,255,0.60)", lineHeight: 1.5 }}>
                    For your security, a one-time login code was sent to your email. This code expires in 5 minutes.
                  </p>
                </div>
              </div>

              {error && (
                <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#DC2626" }}>
                  ⚠️ {error}
                </div>
              )}
              {resendMsg && !error && (
                <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "10px 14px", marginBottom: 18, fontSize: 13, color: "#16A34A" }}>
                  ✓ {resendMsg}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: NAVY, marginBottom: 14, textAlign: "center" }}>
                  Enter your 6-digit login code
                </p>

                {/* 6-digit inputs */}
                <div className="otp-row" style={{ display: "flex", gap: 10, justifyContent: "center", marginBottom: 28 }} onPaste={handlePaste}>
                  {digits.map((d, i) => (
                    <input
                      key={i}
                      ref={el => { inputRefs.current[i] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={d}
                      onChange={e => handleDigit(i, e.target.value)}
                      onKeyDown={e => handleKeyDown(i, e)}
                      style={{
                        width: 52, height: 60, textAlign: "center",
                        fontSize: 24, fontWeight: 800, color: NAVY,
                        border: `2px solid ${d ? BLUE : error ? "#EF4444" : "#E2E8F0"}`,
                        borderRadius: 12, outline: "none", background: d ? "#EEF4FF" : "#F8FAFC",
                        transition: "all 0.18s", fontFamily: "'Courier New', monospace",
                        boxShadow: d ? `0 0 0 3px rgba(26,115,232,0.12)` : "none",
                      }}
                      onFocus={e => { (e.target as HTMLInputElement).style.borderColor = BLUE; (e.target as HTMLInputElement).style.boxShadow = "0 0 0 3px rgba(26,115,232,0.1)"; }}
                      onBlur={e => { if (!d) { (e.target as HTMLInputElement).style.borderColor = error ? "#EF4444" : "#E2E8F0"; (e.target as HTMLInputElement).style.boxShadow = "none"; } }}
                    />
                  ))}
                </div>

                {attemptsLeft < 5 && attemptsLeft > 0 && (
                  <p style={{ textAlign: "center", fontSize: 12.5, color: "#F59E0B", marginBottom: 16 }}>
                    ⚠️ {attemptsLeft} attempt{attemptsLeft === 1 ? "" : "s"} remaining
                  </p>
                )}

                <button type="submit" disabled={loading || code.length < 6} style={{
                  width: "100%", padding: "13px", borderRadius: 10, border: "none",
                  background: loading || code.length < 6 ? "#6B7280" : BLUE, color: "#fff",
                  fontSize: 15, fontWeight: 700, cursor: loading || code.length < 6 ? "not-allowed" : "pointer",
                  boxShadow: loading || code.length < 6 ? "none" : "0 4px 14px rgba(26,115,232,0.4)",
                  marginBottom: 16, transition: "all 0.2s", fontFamily: "inherit",
                }}>
                  {loading ? "Verifying…" : "Confirm Login"}
                </button>

                <div style={{ textAlign: "center", marginBottom: 20 }}>
                  <p style={{ fontSize: 13.5, color: "#64748B", margin: 0 }}>
                    Didn&apos;t receive the code?{" "}
                    <button type="button" onClick={handleResend} disabled={cooldown > 0 || resending} style={{
                      background: "none", border: "none", padding: 0,
                      color: cooldown > 0 ? "#94A3B8" : BLUE,
                      fontWeight: 700, cursor: cooldown > 0 ? "not-allowed" : "pointer",
                      fontSize: 13.5, fontFamily: "inherit",
                    }}>
                      {resending ? "Sending…" : cooldown > 0 ? `Resend in ${cooldown}s` : "Resend Code"}
                    </button>
                  </p>
                </div>

                {/* Security note */}
                <div style={{ padding: "12px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10 }}>
                  <p style={{ margin: 0, fontSize: 12, color: "#7F1D1D", textAlign: "center", lineHeight: 1.6 }}>
                    🔒 Never share this code with anyone. Vaulte will never call or ask for your login code.
                  </p>
                </div>
              </form>

              <div style={{ textAlign: "center", marginTop: 20 }}>
                <Link href="/login" style={{ color: "#64748B", fontSize: 13.5, textDecoration: "none" }}>
                  ← Back to Sign In
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}


export default function LoginVerifyPage() {
  return (
    <Suspense fallback={<div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(160deg,#BFDBFE 0%,#DBEAFE 100%)"}}><div style={{textAlign:"center"}}><div style={{width:40,height:40,border:"3px solid #1A73E8",borderTopColor:"transparent",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto 12px"}}/><style>{"@keyframes spin{to{transform:rotate(360deg)}}"}</style><p style={{color:"#64748B",fontSize:14}}>Loading…</p></div></div>}>
      <LoginVerifyInner />
    </Suspense>
  );
}