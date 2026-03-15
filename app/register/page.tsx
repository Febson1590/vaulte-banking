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
  const pwColor = pwScore <= 1 ? "#EF4444" : pwScore <= 3 ? "#F59E0B" : "#10B981";
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
        // (prevents duplicates when re-registering an email that existed in localStorage only)
        const normalizedEmail = form.email.toLowerCase().trim();
        const existingUsers = getUsers();
        const staleEntry = existingUsers.find(u => u.email === normalizedEmail);
        if (staleEntry) {
          saveUsers(existingUsers.filter(u => u.email !== normalizedEmail));
          try { localStorage.removeItem(`vaulte_state_${staleEntry.id}`); } catch { /* ignore */ }
        }

        // Also store in localStorage so dashboard works even before OTP
        // (with a placeholder password since the real hash is in Redis)
        createUser(form.firstName, form.lastName, form.email, form.password);

        // Redirect to verify email page
        const emailEnc = encodeURIComponent(form.email.toLowerCase().trim());
        const nameEnc  = encodeURIComponent(form.firstName.trim());
        router.push(`/verify-email?email=${emailEnc}&name=${nameEnc}`);
        return;
      }

      if (!res.ok) {
        // API error (email taken on server, validation, etc.)
        if (data.error?.includes("already exists")) {
          setErrors({ email: "An account with this email already exists." });
        } else {
          setErrors({ email: data.error ?? "Registration failed." });
        }
        setLoading(false);
        return;
      }
    } catch {
      // Network / server not configured — fall through to localStorage-only mode
      console.warn("[register] API call failed — falling back to localStorage-only registration");
    }

    // ── Fallback: localStorage-only (no email verification) ──
    // This runs if the API is not configured (no .env vars set)
    setTimeout(() => {
      const newUser = createUser(form.firstName, form.lastName, form.email, form.password);
      saveCurrentUser(newUser);
      router.push("/dashboard");
    }, 1000);
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
      <div style={{ position: "absolute", top: "8%", left: "8%", width: 220, height: 220, background: "rgba(26,115,232,0.07)", borderRadius: "50%", filter: "blur(60px)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "8%", right: "8%", width: 280, height: 280, background: "rgba(26,115,232,0.06)", borderRadius: "50%", filter: "blur(70px)", pointerEvents: "none" }} />

      <div style={{ width: "100%", maxWidth: 480, background: "#fff", borderRadius: 20, boxShadow: "0 20px 60px rgba(26,115,232,0.14), 0 4px 20px rgba(0,0,0,0.06)", overflow: "hidden", position: "relative", zIndex: 1 }}>
        {/* Blue header */}
        <div style={{ background: "linear-gradient(135deg,#1A73E8 0%,#1d4ed8 100%)", height: 160, padding: "0 32px", textAlign: "center", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", top: -20, right: -20, width: 90, height: 90, background: "rgba(255,255,255,0.07)", borderRadius: "50%" }} />
          <div style={{ position: "absolute", bottom: -14, left: -14, width: 70, height: 70, background: "rgba(255,255,255,0.05)", borderRadius: "50%" }} />
          <img src="/assets/logo-vaulte.png" alt="Vaulte" style={{ height: 200, objectFit: "contain", mixBlendMode: "screen", display: "block", margin: "0 auto" }} />
        </div>

        <div style={{ padding: "28px 32px 28px" }}>
          <h1 style={{ fontSize: 21, fontWeight: 800, color: "#0F172A", textAlign: "center", marginBottom: 6, letterSpacing: "-0.4px" }}>Create Your Account</h1>
          <p style={{ fontSize: 13, color: "#94A3B8", textAlign: "center", marginBottom: 24 }}>Free to open · Email verification required</p>

          <form onSubmit={handleSubmit}>
            {/* Name row */}
            <div className="register-name-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 15 }}>
              <div>
                <label style={{ fontSize: 13.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>First Name</label>
                <input type="text" value={form.firstName} onChange={e => update("firstName", e.target.value)} placeholder="John"
                  style={inputStyle("firstName")}
                  onFocus={e => { e.target.style.borderColor = "#1A73E8"; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = errors.firstName ? "#EF4444" : "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                />
                {errors.firstName && <p style={{ fontSize: 11.5, color: "#EF4444", marginTop: 4 }}>{errors.firstName}</p>}
              </div>
              <div>
                <label style={{ fontSize: 13.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Last Name</label>
                <input type="text" value={form.lastName} onChange={e => update("lastName", e.target.value)} placeholder="Doe"
                  style={inputStyle("lastName")}
                  onFocus={e => { e.target.style.borderColor = "#1A73E8"; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = errors.lastName ? "#EF4444" : "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                />
                {errors.lastName && <p style={{ fontSize: 11.5, color: "#EF4444", marginTop: 4 }}>{errors.lastName}</p>}
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 15 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Email Address</label>
              <input type="email" value={form.email} onChange={e => update("email", e.target.value)} placeholder="you@example.com"
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
                <input type={showPass ? "text" : "password"} value={form.password} onChange={e => update("password", e.target.value)} placeholder="Min. 8 characters"
                  style={{ ...inputStyle("password"), paddingRight: 42 }}
                  onFocus={e => { e.target.style.borderColor = "#1A73E8"; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.1)"; }}
                  onBlur={e => { e.target.style.borderColor = errors.password ? "#EF4444" : "#E2E8F0"; e.target.style.boxShadow = "none"; }}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 16, color: "#9CA3AF" }}>
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
              {errors.password && <p style={{ fontSize: 11.5, color: "#EF4444", marginTop: 4 }}>{errors.password}</p>}
              {/* Password strength bar */}
              {form.password && (
                <div style={{ marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 3, marginBottom: 4 }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ flex: 1, height: 3, borderRadius: 999, background: i <= pwScore ? pwColor : "#E2E8F0", transition: "background 0.3s" }} />
                    ))}
                  </div>
                  <p style={{ margin: 0, fontSize: 11.5, color: pwColor, fontWeight: 600 }}>{pwLabel} password</p>
                </div>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: 13.5, fontWeight: 600, color: "#374151", display: "block", marginBottom: 6 }}>Confirm Password</label>
              <div style={{ position: "relative" }}>
                <input type={showConfirm ? "text" : "password"} value={form.confirmPassword} onChange={e => update("confirmPassword", e.target.value)} placeholder="Repeat password"
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

            {/* Email verification notice */}
            <div style={{ background: "#EEF4FF", border: "1px solid #BFDBFE", borderRadius: 10, padding: "12px 14px", marginBottom: 18, display: "flex", alignItems: "flex-start", gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>📧</span>
              <p style={{ margin: 0, fontSize: 12.5, color: "#1e3a5f", lineHeight: 1.5 }}>
                A <strong>6-digit verification code</strong> will be sent to your email. You&apos;ll need to verify it to activate your account.
              </p>
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
            >{loading ? "Creating Account…" : "Create Account & Verify Email"}</button>

            <p style={{ textAlign: "center", fontSize: 14, color: "#6B7280" }}>
              Already have an account?{" "}
              <Link href="/login" style={{ color: "#1A73E8", fontWeight: 700, textDecoration: "none" }}>Login</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
