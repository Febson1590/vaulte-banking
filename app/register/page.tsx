"use client";
import { useState } from "react";
import Link from "next/link";

const countries = [
  "Afghanistan","Albania","Algeria","Argentina","Australia","Austria","Bangladesh","Belgium","Brazil","Canada",
  "Chile","China","Colombia","Croatia","Czech Republic","Denmark","Egypt","Ethiopia","Finland","France",
  "Germany","Ghana","Greece","Hungary","India","Indonesia","Iran","Iraq","Ireland","Israel",
  "Italy","Japan","Jordan","Kenya","Malaysia","Mexico","Morocco","Netherlands","New Zealand","Nigeria",
  "Norway","Pakistan","Peru","Philippines","Poland","Portugal","Romania","Russia","Saudi Arabia","Singapore",
  "South Africa","South Korea","Spain","Sri Lanka","Sudan","Sweden","Switzerland","Tanzania","Thailand",
  "Turkey","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Vietnam","Zimbabwe",
];

const steps = ["Personal Info", "Contact", "Security", "Review"];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "", lastName: "", dateOfBirth: "", country: "",
    email: "", phone: "", address: "",
    password: "", confirmPassword: "",
  });
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setErrors((e) => ({ ...e, [field]: "" }));
  };

  const validateStep = () => {
    const e: Record<string, string> = {};
    if (step === 0) {
      if (!form.firstName) e.firstName = "First name is required";
      if (!form.lastName) e.lastName = "Last name is required";
      if (!form.dateOfBirth) e.dateOfBirth = "Date of birth is required";
      if (!form.country) e.country = "Please select your country";
    }
    if (step === 1) {
      if (!form.email || !/\S+@\S+\.\S+/.test(form.email)) e.email = "Valid email is required";
      if (!form.phone) e.phone = "Phone number is required";
      if (!form.address) e.address = "Address is required";
    }
    if (step === 2) {
      if (!form.password || form.password.length < 8) e.password = "Password must be at least 8 characters";
      if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => { if (validateStep()) setStep((s) => s + 1); };
  const back = () => setStep((s) => s - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => setLoading(false), 1500);
  };

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%", padding: "13px 16px", borderRadius: 10,
    border: `1.5px solid ${errors[field] ? "#EF4444" : "#E5E7EB"}`,
    fontSize: 15, color: "#111827", background: "#fff",
    outline: "none", transition: "border-color 0.2s", boxSizing: "border-box",
  });

  const labelStyle: React.CSSProperties = { fontSize: 14, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 };
  const errorStyle: React.CSSProperties = { fontSize: 12, color: "#EF4444", marginTop: 4 };
  const fieldWrap: React.CSSProperties = { marginBottom: 18 };

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "#F8FAFC" }}>

      {/* Left Panel */}
      <div style={{
        flex: 1, background: "linear-gradient(135deg, #0F172A 0%, #1e3a6e 60%, #1A73E8 100%)",
        display: "flex", flexDirection: "column", justifyContent: "space-between",
        padding: "48px", position: "relative", overflow: "hidden",
      }} className="left-panel">
        <div style={{ position: "absolute", top: "20%", right: "-10%", width: 300, height: 300, background: "rgba(26,115,232,0.2)", borderRadius: "50%", filter: "blur(60px)" }} />

        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none", position: "relative" }}>
          <div style={{ width: 36, height: 36, background: "#1A73E8", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 4h14l-5 6v5l-4-2V10L3 4z" fill="white" /></svg>
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, color: "#fff" }}>Vaulte</span>
        </Link>

        <div style={{ position: "relative" }}>
          <h2 style={{ fontSize: 34, fontWeight: 900, color: "#fff", lineHeight: 1.2, marginBottom: 16, letterSpacing: "-1px" }}>
            Open your free<br /><span style={{ color: "#60A5FA" }}>global account</span>
          </h2>
          <p style={{ fontSize: 15, color: "rgba(255,255,255,0.6)", lineHeight: 1.75, maxWidth: 340, marginBottom: 36 }}>
            Join thousands of customers already banking smarter with Vaulte. No monthly fees, no borders.
          </p>

          {/* Progress steps display */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {steps.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: "50%", flexShrink: 0,
                  background: i < step ? "#22C55E" : i === step ? "#1A73E8" : "rgba(255,255,255,0.15)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 12, fontWeight: 700, color: "#fff",
                }}>
                  {i < step ? "✓" : i + 1}
                </div>
                <span style={{ fontSize: 14, color: i === step ? "#fff" : "rgba(255,255,255,0.5)", fontWeight: i === step ? 600 : 400 }}>{s}</span>
              </div>
            ))}
          </div>
        </div>

        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.25)", position: "relative" }}>
          © 2026 Vaulte — Global Digital Banking
        </p>
      </div>

      {/* Right Panel */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "48px 5%", overflowY: "auto" }}>
        <div style={{ width: "100%", maxWidth: 440 }}>
          {/* Header */}
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
              {steps.map((_, i) => (
                <div key={i} style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: i <= step ? "#1A73E8" : "#E5E7EB",
                  transition: "background 0.3s",
                }} />
              ))}
            </div>
            <p style={{ fontSize: 13, color: "#9CA3AF", marginBottom: 4 }}>Step {step + 1} of {steps.length}</p>
            <h1 style={{ fontSize: 26, fontWeight: 800, color: "#0F172A", letterSpacing: "-0.5px" }}>{steps[step]}</h1>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Step 0 — Personal Info */}
            {step === 0 && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 18 }}>
                  <div>
                    <label style={labelStyle}>First Name</label>
                    <input style={inputStyle("firstName")} value={form.firstName} onChange={(e) => update("firstName", e.target.value)} placeholder="John"
                      onFocus={(e) => (e.target.style.borderColor = "#1A73E8")} onBlur={(e) => (e.target.style.borderColor = errors.firstName ? "#EF4444" : "#E5E7EB")} />
                    {errors.firstName && <p style={errorStyle}>{errors.firstName}</p>}
                  </div>
                  <div>
                    <label style={labelStyle}>Last Name</label>
                    <input style={inputStyle("lastName")} value={form.lastName} onChange={(e) => update("lastName", e.target.value)} placeholder="Doe"
                      onFocus={(e) => (e.target.style.borderColor = "#1A73E8")} onBlur={(e) => (e.target.style.borderColor = errors.lastName ? "#EF4444" : "#E5E7EB")} />
                    {errors.lastName && <p style={errorStyle}>{errors.lastName}</p>}
                  </div>
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Date of Birth</label>
                  <input type="date" style={inputStyle("dateOfBirth")} value={form.dateOfBirth} onChange={(e) => update("dateOfBirth", e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = "#1A73E8")} onBlur={(e) => (e.target.style.borderColor = errors.dateOfBirth ? "#EF4444" : "#E5E7EB")} />
                  {errors.dateOfBirth && <p style={errorStyle}>{errors.dateOfBirth}</p>}
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Country of Residence</label>
                  <select style={{ ...inputStyle("country"), appearance: "none" }} value={form.country} onChange={(e) => update("country", e.target.value)}
                    onFocus={(e) => (e.target.style.borderColor = "#1A73E8")} onBlur={(e) => (e.target.style.borderColor = errors.country ? "#EF4444" : "#E5E7EB")}>
                    <option value="">Select your country</option>
                    {countries.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {errors.country && <p style={errorStyle}>{errors.country}</p>}
                </div>
              </>
            )}

            {/* Step 1 — Contact */}
            {step === 1 && (
              <>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Email Address</label>
                  <input type="email" style={inputStyle("email")} value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com"
                    onFocus={(e) => (e.target.style.borderColor = "#1A73E8")} onBlur={(e) => (e.target.style.borderColor = errors.email ? "#EF4444" : "#E5E7EB")} />
                  {errors.email && <p style={errorStyle}>{errors.email}</p>}
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Phone Number</label>
                  <input type="tel" style={inputStyle("phone")} value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 234 567 8901"
                    onFocus={(e) => (e.target.style.borderColor = "#1A73E8")} onBlur={(e) => (e.target.style.borderColor = errors.phone ? "#EF4444" : "#E5E7EB")} />
                  {errors.phone && <p style={errorStyle}>{errors.phone}</p>}
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Residential Address</label>
                  <textarea style={{ ...inputStyle("address"), resize: "vertical", minHeight: 90 } as React.CSSProperties} value={form.address} onChange={(e) => update("address", e.target.value)} placeholder="Street, City, State"
                    onFocus={(e) => (e.target.style.borderColor = "#1A73E8")} onBlur={(e) => (e.target.style.borderColor = errors.address ? "#EF4444" : "#E5E7EB")} />
                  {errors.address && <p style={errorStyle}>{errors.address}</p>}
                </div>
              </>
            )}

            {/* Step 2 — Security */}
            {step === 2 && (
              <>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Create Password</label>
                  <div style={{ position: "relative" }}>
                    <input type={showPass ? "text" : "password"} style={{ ...inputStyle("password"), paddingRight: 48 }} value={form.password} onChange={(e) => update("password", e.target.value)} placeholder="Min. 8 characters"
                      onFocus={(e) => (e.target.style.borderColor = "#1A73E8")} onBlur={(e) => (e.target.style.borderColor = errors.password ? "#EF4444" : "#E5E7EB")} />
                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#9CA3AF", fontSize: 18 }}>
                      {showPass ? "🙈" : "👁️"}
                    </button>
                  </div>
                  {errors.password && <p style={errorStyle}>{errors.password}</p>}
                  {/* Password strength */}
                  {form.password && (
                    <div style={{ marginTop: 8, display: "flex", gap: 4 }}>
                      {[1, 2, 3, 4].map((n) => (
                        <div key={n} style={{ flex: 1, height: 3, borderRadius: 2, background: form.password.length >= n * 3 ? (form.password.length >= 12 ? "#22C55E" : form.password.length >= 8 ? "#F59E0B" : "#EF4444") : "#E5E7EB" }} />
                      ))}
                    </div>
                  )}
                </div>
                <div style={fieldWrap}>
                  <label style={labelStyle}>Confirm Password</label>
                  <input type="password" style={inputStyle("confirmPassword")} value={form.confirmPassword} onChange={(e) => update("confirmPassword", e.target.value)} placeholder="Repeat your password"
                    onFocus={(e) => (e.target.style.borderColor = "#1A73E8")} onBlur={(e) => (e.target.style.borderColor = errors.confirmPassword ? "#EF4444" : "#E5E7EB")} />
                  {errors.confirmPassword && <p style={errorStyle}>{errors.confirmPassword}</p>}
                </div>
                <div style={{ background: "#EFF6FF", borderRadius: 10, padding: "14px 16px", border: "1px solid #BFDBFE", marginBottom: 8 }}>
                  <p style={{ fontSize: 13, color: "#1E40AF", fontWeight: 500, lineHeight: 1.6 }}>
                    🔒 After registration, a 2FA code will be sent to your email for every login.
                  </p>
                </div>
              </>
            )}

            {/* Step 3 — Review */}
            {step === 3 && (
              <div style={{ background: "#fff", border: "1.5px solid #E5E7EB", borderRadius: 14, padding: 20, marginBottom: 20 }}>
                <p style={{ fontSize: 13, fontWeight: 700, color: "#6B7280", letterSpacing: "0.08em", marginBottom: 16, textTransform: "uppercase" }}>Account Summary</p>
                {[
                  ["Full Name", `${form.firstName} ${form.lastName}`],
                  ["Date of Birth", form.dateOfBirth],
                  ["Country", form.country],
                  ["Email", form.email],
                  ["Phone", form.phone],
                  ["Address", form.address],
                ].map(([label, value]) => (
                  <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #F3F4F6" }}>
                    <span style={{ fontSize: 14, color: "#6B7280" }}>{label}</span>
                    <span style={{ fontSize: 14, color: "#111827", fontWeight: 500, maxWidth: 220, textAlign: "right" }}>{value}</span>
                  </div>
                ))}
                <div style={{ marginTop: 16, background: "#F0FDF4", borderRadius: 8, padding: "12px", border: "1px solid #BBF7D0" }}>
                  <p style={{ fontSize: 13, color: "#166534", fontWeight: 500 }}>
                    ✅ By creating an account, you agree to Vaulte Terms of Service and Privacy Policy.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
              {step > 0 && (
                <button type="button" onClick={back} style={{
                  flex: 1, padding: "13px", borderRadius: 10, border: "1.5px solid #E5E7EB",
                  background: "#fff", color: "#374151", fontSize: 15, fontWeight: 600, cursor: "pointer",
                }}>← Back</button>
              )}
              {step < steps.length - 1 ? (
                <button type="button" onClick={next} style={{
                  flex: 1, padding: "13px", borderRadius: 10, border: "none",
                  background: "#1A73E8", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer",
                  boxShadow: "0 4px 14px rgba(26,115,232,0.35)",
                }}>Continue →</button>
              ) : (
                <button type="submit" disabled={loading} style={{
                  flex: 1, padding: "13px", borderRadius: 10, border: "none",
                  background: loading ? "#93C5FD" : "#22C55E", color: "#fff",
                  fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(34,197,94,0.35)",
                }}>
                  {loading ? "Creating Account..." : "Create My Account"}
                </button>
              )}
            </div>

            {step === 0 && (
              <p style={{ textAlign: "center", fontSize: 14, color: "#6B7280", marginTop: 20 }}>
                Already have an account?{" "}
                <Link href="/login" style={{ color: "#1A73E8", fontWeight: 600, textDecoration: "none" }}>Sign in</Link>
              </p>
            )}
          </form>
        </div>
      </div>

      <style>{`
        @media (max-width: 768px) { .left-panel { display: none !important; } }
      `}</style>
    </div>
  );
}
