"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createUser, saveCurrentUser, getUsers, saveUsers } from "@/lib/vaulteState";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm]       = useState({ firstName: "", lastName: "", email: "", password: "", confirmPassword: "" });
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const update = (f: string, v: string) => { setForm(p => ({ ...p, [f]: v })); setErrors(p => ({ ...p, [f]: "" })); };

  // Password strength check
  const pw = form.password;
  const pwScore = [pw.length >= 8, /[A-Z]/.test(pw), /[a-z]/.test(pw), /[0-9]/.test(pw), /[^A-Za-z0-9]/.test(pw)].filter(Boolean).length;
  const pwColor = pwScore <= 1 ? "#F87171" : pwScore <= 3 ? "#FBBF24" : "#34D399";
  const pwLabel = pwScore <= 1 ? "Weak" : pwScore <= 3 ? "Fair" : pwScore === 4 ? "Good" : "Strong";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.firstName.trim())  errs.firstName = "First name is required";
    if (!form.lastName.trim())   errs.lastName  = "Last name is required";
    if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) errs.email = "Valid email required";
    if (!form.password || form.password.length < 8) errs.password = "Min. 8 characters";
    if (form.password !== form.confirmPassword) errs.confirmPassword = "Passwords do not match";

    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);

    // ── Try real API registration (sends verification email) ──
    try {
      const res  = await fetch("/api/auth/register", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          firstName: form.firstName,
          lastName:  form.lastName,
          email:     form.email,
          password:  form.password,
        }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        // Remove any stale localStorage entry for this email before creating fresh one
        const normalizedEmail = form.email.toLowerCase().trim();
        const existingUsers = getUsers();
        const staleEntry = existingUsers.find(u => u.email === normalizedEmail);
        if (staleEntry) {
          saveUsers(existingUsers.filter(u => u.email !== normalizedEmail));
          try { localStorage.removeItem(`vaulte_state_${staleEntry.id}`); } catch { /* ignore */ }
        }

        createUser(form.firstName, form.lastName, form.email, form.password);

        const emailEnc = encodeURIComponent(form.email.toLowerCase().trim());
        const nameEnc  = encodeURIComponent(form.firstName.trim());
        router.push(`/verify-email?email=${emailEnc}&name=${nameEnc}`);
        return;
      }

      if (!res.ok) {
        if (data.error?.includes("already exists")) {
          setErrors({ email: "An account with this email already exists." });
        } else {
          setErrors({ email: data.error ?? "Registration failed." });
        }
        setLoading(false);
        return;
      }
    } catch {
      console.warn("[register] API call failed — falling back to localStorage-only registration");
    }

    // ── Fallback: localStorage-only (no email verification) ──
    setTimeout(() => {
      const newUser = createUser(form.firstName, form.lastName, form.email, form.password);
      saveCurrentUser(newUser);
      router.push("/dashboard");
    }, 1000);
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%", padding: "13px 16px", borderRadius: 12,
    border: `1px solid ${errors[field] ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)"}`,
    fontSize: 14, color: "#fff", background: "rgba(255,255,255,0.05)",
    outline: "none", boxSizing: "border-box", transition: "border-color 0.2s, box-shadow 0.2s, background 0.2s", fontFamily: "inherit",
  });

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(160deg,#06091A 0%,#0B1836 50%,#0D1F40 100%)",
      padding: "24px 24px", position: "relative", overflow: "hidden",
    }}>
      {/* Background glow blobs */}
      <div style={{ position: "absolute", top: "5%", left: "5%", width: 400, height: 400, background: "rgba(37,99,235,0.12)", borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "5%", right: "5%", width: 350, height: 350, background: "rgba(167,139,250,0.1)", borderRadius: "50%", filter: "blur(100px)", pointerEvents: "none" }} />

      {/* Floating decorative elements */}
      <div style={{ position: "absolute", top: "10%", right: "10%", fontSize: 36, filter: "drop-shadow(0 12px 24px rgba(96,165,250,0.4))", transform: "rotate(12deg)", pointerEvents: "none", userSelect: "none", opacity: 0.6 }}>🚀</div>
      <div style={{ position: "absolute", bottom: "15%", left: "6%", fontSize: 32, filter: "drop-shadow(0 10px 20px rgba(52,211,153,0.4))", transform: "rotate(-8deg)", pointerEvents: "none", userSelect: "none", opacity: 0.5 }}>🌍</div>
      <div style={{ position: "absolute", top: "25%", left: "5%", fontSize: 28, filter: "drop-shadow(0 8px 16px rgba(167,139,250,0.4))", transform: "rotate(6deg)", pointerEvents: "none", userSelect: "none", opacity: 0.55 }}>🔐</div>

      <div style={{ width: "100%", maxWidth: 500, position: "relative", zIndex: 1 }}>
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
            height: 150, padding: "0 32px", textAlign: "center",
            position: "relative", overflow: "hidden",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: 1, background: "linear-gradient(90deg, transparent, rgba(96,165,250,0.5), rgba(167,139,250,0.5), transparent)" }} />
            <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, background: "rgba(96,165,250,0.08)", borderRadius: "50%", filter: "blur(20px)" }} />
            <div style={{ position: "absolute", bottom: -20, left: -20, width: 100, height: 100, background: "rgba(167,139,250,0.06)", borderRadius: "50%", filter: "blur(20px)" }} />
            <img className="auth-logo" src="/assets/logo-vaulte.png" alt="Vaulte" style={{ height: 190, objectFit: "contain", mixBlendMode: "screen", display: "block", margin: "0 auto", position: "relative" }} />
          </div>

          <div style={{ padding: "28px 32px 28px" }}>
            <h1 style={{ fontSize: 21, fontWeight: 800, color: "#fff", textAlign: "center", marginBottom: 6, letterSpacing: "-0.5px" }}>Create Your Account</h1>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", textAlign: "center", marginBottom: 24 }}>Free to open · Email verification required</p>

            <form onSubmit={handleSubmit}>
              {/* Name row */}
              <div className="register-name-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 15 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.65)", display: "block", marginBottom: 7 }}>First Name</label>
                  <input type="text" value={form.firstName} onChange={e => update("firstName", e.target.value)} placeholder="John"
                    style={inputStyle("firstName")}
                    onFocus={e => { e.target.style.borderColor = "rgba(96,165,250,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(96,165,250,0.1)"; e.target.style.background = "rgba(255,255,255,0.07)"; }}
                    onBlur={e => { e.target.style.borderColor = errors.firstName ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
                  />
                  {errors.firstName && <p style={{ fontSize: 11.5, color: "#F87171", marginTop: 5 }}>{errors.firstName}</p>}
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.65)", display: "block", marginBottom: 7 }}>Last Name</label>
                  <input type="text" value={form.lastName} onChange={e => update("lastName", e.target.value)} placeholder="Doe"
                    style={inputStyle("lastName")}
                    onFocus={e => { e.target.style.borderColor = "rgba(96,165,250,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(96,165,250,0.1)"; e.target.style.background = "rgba(255,255,255,0.07)"; }}
                    onBlur={e => { e.target.style.borderColor = errors.lastName ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
                  />
                  {errors.lastName && <p style={{ fontSize: 11.5, color: "#F87171", marginTop: 5 }}>{errors.lastName}</p>}
                </div>
              </div>

              {/* Email */}
              <div style={{ marginBottom: 15 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.65)", display: "block", marginBottom: 7 }}>Email Address</label>
                <input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="you@example.com"
                  style={inputStyle("email")}
                  onFocus={e => { e.target.style.borderColor = "rgba(96,165,250,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(96,165,250,0.1)"; e.target.style.background = "rgba(255,255,255,0.07)"; }}
                  onBlur={e => { e.target.style.borderColor = errors.email ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
                />
                {errors.email && <p style={{ fontSize: 11.5, color: "#F87171", marginTop: 5 }}>{errors.email}</p>}
              </div>

              {/* Password */}
              <div style={{ marginBottom: 15 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.65)", display: "block", marginBottom: 7 }}>Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showPass ? "text" : "password"} value={form.password} onChange={e => update("password", e.target.value)} placeholder="Min. 8 characters"
                    style={{ ...inputStyle("password"), paddingRight: 44 }}
                    onFocus={e => { e.target.style.borderColor = "rgba(96,165,250,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(96,165,250,0.1)"; e.target.style.background = "rgba(255,255,255,0.07)"; }}
                    onBlur={e => { e.target.style.borderColor = errors.password ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "rgba(255,255,255,0.4)", padding: 0 }}>
                    {showPass ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.password && <p style={{ fontSize: 11.5, color: "#F87171", marginTop: 5 }}>{errors.password}</p>}
                {/* Password strength bar */}
                {form.password && (
                  <div style={{ marginTop: 10 }}>
                    <div style={{ display: "flex", gap: 4, marginBottom: 5 }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{ flex: 1, height: 3, borderRadius: 999, background: i <= pwScore ? pwColor : "rgba(255,255,255,0.1)", transition: "background 0.3s" }} />
                      ))}
                    </div>
                    <p style={{ margin: 0, fontSize: 11.5, color: pwColor, fontWeight: 600 }}>{pwLabel} password</p>
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.65)", display: "block", marginBottom: 7 }}>Confirm Password</label>
                <div style={{ position: "relative" }}>
                  <input type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} placeholder="Repeat password"
                    style={{ ...inputStyle("confirmPassword"), paddingRight: 44 }}
                    onFocus={e => { e.target.style.borderColor = "rgba(96,165,250,0.5)"; e.target.style.boxShadow = "0 0 0 3px rgba(96,165,250,0.1)"; e.target.style.background = "rgba(255,255,255,0.07)"; }}
                    onBlur={e => { e.target.style.borderColor = errors.confirmPassword ? "rgba(248,113,113,0.5)" : "rgba(255,255,255,0.1)"; e.target.style.boxShadow = "none"; e.target.style.background = "rgba(255,255,255,0.05)"; }}
                  />
                  <button type="button" onClick={() => setShowConfirm(!showConfirm)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "rgba(255,255,255,0.4)", padding: 0 }}>
                    {showConfirm ? "🙈" : "👁️"}
                  </button>
                </div>
                {errors.confirmPassword && <p style={{ fontSize: 11.5, color: "#F87171", marginTop: 5 }}>{errors.confirmPassword}</p>}
              </div>

              {/* Email verification notice */}
              <div style={{ background: "rgba(96,165,250,0.07)", border: "1px solid rgba(96,165,250,0.2)", borderRadius: 12, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ fontSize: 18, flexShrink: 0 }}>📧</span>
                <p style={{ margin: 0, fontSize: 12.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
                  A <strong style={{ color: "#60A5FA" }}>6-digit verification code</strong> will be sent to your email. You&apos;ll need to verify it to activate your account.
                </p>
              </div>

              <button type="submit" disabled={loading} style={{
                width: "100%", padding: "14px", borderRadius: 12, border: "none",
                background: loading ? "rgba(37,99,235,0.5)" : "linear-gradient(135deg,#2563EB,#1D4ED8)",
                color: "#fff", fontSize: 15, fontWeight: 700,
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 4px 20px rgba(37,99,235,0.5)",
                marginBottom: 18, transition: "all 0.2s", fontFamily: "inherit",
                letterSpacing: "0.01em",
              }}
                onMouseEnter={e => { if (!loading) { e.currentTarget.style.transform = "translateY(-1px)"; e.currentTarget.style.boxShadow = "0 8px 28px rgba(37,99,235,0.65)"; } }}
                onMouseLeave={e => { if (!loading) { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(37,99,235,0.5)"; } }}
              >{loading ? "Creating Account…" : "Create Account & Verify Email"}</button>

              {/* Divider */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Already have an account?</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              </div>

              <Link href="/login" style={{
                display: "block", textAlign: "center", padding: "13px",
                border: "1px solid rgba(96,165,250,0.2)", borderRadius: 12,
                color: "#60A5FA", fontSize: 14, fontWeight: 600, textDecoration: "none",
                background: "rgba(96,165,250,0.05)",
                transition: "all 0.2s",
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(96,165,250,0.1)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(96,165,250,0.35)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(96,165,250,0.05)"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(96,165,250,0.2)"; }}
              >Sign In to Existing Account</Link>
            </form>
          </div>
        </div>

        {/* Trust note */}
        <p style={{ textAlign: "center", marginTop: 20, fontSize: 12, color: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <span style={{ color: "#34D399" }}>🔒</span> 256-bit SSL encryption · Your data is safe with us
        </p>
      </div>

      <style>{`
        @media(max-width:480px){
          .register-name-grid { grid-template-columns: 1fr !important; }
          .auth-logo { height: 140px !important; }
        }
        @media(max-width:360px){
          .auth-logo { height: 120px !important; }
        }
        input::placeholder { color: rgba(255,255,255,0.25) !important; }
      `}</style>
    </div>
  );
}
