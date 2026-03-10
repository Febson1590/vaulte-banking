"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"credentials" | "2fa">("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [twoFACode, setTwoFACode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Mock admin credentials
  const ADMIN_EMAIL = "admin@vaulte.com";
  const ADMIN_PASSWORD = "Admin@12345";
  const MOCK_2FA = "123456";

  const handleCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!email || !password) { setError("Please fill in all fields."); return; }
    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      setError("Invalid admin credentials.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep("2fa");
    }, 1000);
  };

  const handle2FA = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (twoFACode !== MOCK_2FA) {
      setError("Invalid verification code. Use 123456 for demo.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("vaulte_admin", JSON.stringify({ email: ADMIN_EMAIL, name: "Super Admin", role: "super_admin" }));
      router.push("/admin/dashboard");
    }, 1200);
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #0A1628 0%, #1A2B4A 50%, #0D1F3C 100%)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontFamily: "Inter, sans-serif",
      padding: "20px",
      position: "relative",
      overflow: "hidden",
    }}>
      {/* Background decorations */}
      <div style={{ position: "absolute", top: "-80px", right: "-80px", width: "300px", height: "300px", borderRadius: "50%", background: "rgba(26,115,232,0.08)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "-60px", left: "-60px", width: "250px", height: "250px", borderRadius: "50%", background: "rgba(26,115,232,0.06)", pointerEvents: "none" }} />

      <div style={{
        background: "#fff",
        borderRadius: "20px",
        padding: "48px 40px",
        width: "100%",
        maxWidth: "440px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.4)",
      }}>
        {/* Logo + Badge */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "16px" }}>
            <div style={{ background: "#0A1628", borderRadius: "12px", padding: "10px 20px", display: "inline-flex", alignItems: "center", gap: "8px" }}>
              <Image src="/logo.png" alt="Vaulte" width={100} height={28} style={{ objectFit: "contain" }} />
            </div>
          </div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "#FFF3CD", border: "1px solid #FFC107", borderRadius: "20px", padding: "4px 12px", marginBottom: "12px" }}>
            <span style={{ fontSize: "12px" }}>🔐</span>
            <span style={{ fontSize: "12px", fontWeight: 600, color: "#856404" }}>ADMIN ACCESS ONLY</span>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "#0A1628", margin: 0 }}>
            {step === "credentials" ? "Admin Sign In" : "Two-Factor Authentication"}
          </h1>
          <p style={{ fontSize: "14px", color: "#6B7280", marginTop: "6px" }}>
            {step === "credentials"
              ? "Enter your admin credentials to continue"
              : `A verification code has been sent to ${email}`}
          </p>
        </div>

        {/* Step indicator */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "28px" }}>
          <div style={{ flex: 1, height: "3px", borderRadius: "2px", background: "#1A73E8" }} />
          <div style={{ flex: 1, height: "3px", borderRadius: "2px", background: step === "2fa" ? "#1A73E8" : "#E5E7EB" }} />
        </div>

        {error && (
          <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "12px 16px", marginBottom: "20px", color: "#DC2626", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
            ⚠️ {error}
          </div>
        )}

        {step === "credentials" ? (
          <form onSubmit={handleCredentials}>
            <div style={{ marginBottom: "18px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>Admin Email</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "16px" }}>📧</span>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@vaulte.com"
                  style={{ width: "100%", padding: "12px 14px 12px 42px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box", transition: "border-color 0.2s" }}
                  onFocus={e => e.target.style.borderColor = "#1A73E8"}
                  onBlur={e => e.target.style.borderColor = "#E5E7EB"}
                />
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>Password</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", fontSize: "16px" }}>🔒</span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  style={{ width: "100%", padding: "12px 44px 12px 42px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }}
                  onFocus={e => e.target.style.borderColor = "#1A73E8"}
                  onBlur={e => e.target.style.borderColor = "#E5E7EB"}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: "absolute", right: "14px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "16px" }}>
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              style={{ width: "100%", padding: "14px", background: loading ? "#9CA3AF" : "#0A1628", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", transition: "background 0.2s" }}>
              {loading ? "Verifying..." : "Continue →"}
            </button>

            {/* Demo hint */}
            <div style={{ marginTop: "20px", padding: "12px", background: "#EEF4FF", borderRadius: "10px", fontSize: "12px", color: "#4B5563" }}>
              <strong style={{ color: "#1A73E8" }}>Demo credentials:</strong><br />
              Email: admin@vaulte.com<br />
              Password: Admin@12345<br />
              2FA Code: 123456
            </div>
          </form>
        ) : (
          <form onSubmit={handle2FA}>
            <div style={{ textAlign: "center", marginBottom: "24px" }}>
              <div style={{ width: "64px", height: "64px", background: "#EEF4FF", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "28px", margin: "0 auto 12px" }}>🔐</div>
              <p style={{ fontSize: "13px", color: "#6B7280" }}>Enter the 6-digit code from your authenticator app or email</p>
            </div>

            {/* 6-digit code input */}
            <div style={{ marginBottom: "24px" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>Verification Code</label>
              <input
                type="text"
                value={twoFACode}
                onChange={e => setTwoFACode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="_ _ _ _ _ _"
                maxLength={6}
                style={{ width: "100%", padding: "16px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "24px", fontWeight: 700, textAlign: "center", letterSpacing: "12px", outline: "none", boxSizing: "border-box" }}
                onFocus={e => e.target.style.borderColor = "#1A73E8"}
                onBlur={e => e.target.style.borderColor = "#E5E7EB"}
              />
            </div>

            <button type="submit" disabled={loading || twoFACode.length < 6}
              style={{ width: "100%", padding: "14px", background: (loading || twoFACode.length < 6) ? "#9CA3AF" : "#1A73E8", color: "#fff", border: "none", borderRadius: "10px", fontSize: "15px", fontWeight: 700, cursor: (loading || twoFACode.length < 6) ? "not-allowed" : "pointer" }}>
              {loading ? "Signing in..." : "Verify & Sign In"}
            </button>

            <button type="button" onClick={() => { setStep("credentials"); setError(""); setTwoFACode(""); }}
              style={{ width: "100%", padding: "12px", background: "none", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "14px", color: "#6B7280", cursor: "pointer", marginTop: "12px" }}>
              ← Back
            </button>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: "24px", fontSize: "12px", color: "#9CA3AF" }}>
          🔒 Secured by Vaulte Admin System · Unauthorized access is prohibited
        </div>
      </div>
    </div>
  );
}
