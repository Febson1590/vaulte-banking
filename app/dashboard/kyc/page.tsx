"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getCurrentUser, submitKyc, getKycDoc, VaulteUser } from "@/lib/vaulteState";

const C = {
  bg: "#F3F5FA", card: "#ffffff", navy: "#0F172A", blue: "#1A73E8",
  border: "rgba(15,23,42,0.07)", muted: "#94A3B8", text: "#0F172A", sub: "#64748B",
  shadow: "0 1px 3px rgba(15,23,42,0.05), 0 6px 20px rgba(15,23,42,0.07)",
} as const;

const DOC_TYPES = [
  { value: "passport",         label: "Passport",          icon: "🛂" },
  { value: "drivers_license",  label: "Driver's License",  icon: "🪪" },
  { value: "national_id",      label: "National ID Card",  icon: "🪙" },
];

const COUNTRIES: { value: string; label: string }[] = [
  { value: "Afghanistan",           label: "🇦🇫 Afghanistan" },
  { value: "Albania",               label: "🇦🇱 Albania" },
  { value: "Algeria",               label: "🇩🇿 Algeria" },
  { value: "USA",                   label: "🇺🇸 USA" },
  { value: "Argentina",             label: "🇦🇷 Argentina" },
  { value: "Australia",             label: "🇦🇺 Australia" },
  { value: "Austria",               label: "🇦🇹 Austria" },
  { value: "Azerbaijan",            label: "🇦🇿 Azerbaijan" },
  { value: "Bangladesh",            label: "🇧🇩 Bangladesh" },
  { value: "Belgium",               label: "🇧🇪 Belgium" },
  { value: "Bolivia",               label: "🇧🇴 Bolivia" },
  { value: "Brazil",                label: "🇧🇷 Brazil" },
  { value: "United Kingdom",        label: "🇬🇧 United Kingdom" },
  { value: "Bulgaria",              label: "🇧🇬 Bulgaria" },
  { value: "Cameroon",              label: "🇨🇲 Cameroon" },
  { value: "Canada",                label: "🇨🇦 Canada" },
  { value: "Chile",                 label: "🇨🇱 Chile" },
  { value: "China",                 label: "🇨🇳 China" },
  { value: "Colombia",              label: "🇨🇴 Colombia" },
  { value: "Croatia",               label: "🇭🇷 Croatia" },
  { value: "Cuba",                  label: "🇨🇺 Cuba" },
  { value: "Czech Republic",        label: "🇨🇿 Czech Republic" },
  { value: "Denmark",               label: "🇩🇰 Denmark" },
  { value: "Netherlands",           label: "🇳🇱 Netherlands" },
  { value: "Egypt",                 label: "🇪🇬 Egypt" },
  { value: "United Arab Emirates",  label: "🇦🇪 United Arab Emirates" },
  { value: "Ethiopia",              label: "🇪🇹 Ethiopia" },
  { value: "Philippines",           label: "🇵🇭 Philippines" },
  { value: "Finland",               label: "🇫🇮 Finland" },
  { value: "France",                label: "🇫🇷 France" },
  { value: "Georgia",               label: "🇬🇪 Georgia" },
  { value: "Germany",               label: "🇩🇪 Germany" },
  { value: "Ghana",                 label: "🇬🇭 Ghana" },
  { value: "Greece",                label: "🇬🇷 Greece" },
  { value: "Guatemala",             label: "🇬🇹 Guatemala" },
  { value: "Hungary",               label: "🇭🇺 Hungary" },
  { value: "India",                 label: "🇮🇳 India" },
  { value: "Indonesia",             label: "🇮🇩 Indonesia" },
  { value: "Iran",                  label: "🇮🇷 Iran" },
  { value: "Iraq",                  label: "🇮🇶 Iraq" },
  { value: "Ireland",               label: "🇮🇪 Ireland" },
  { value: "Israel",                label: "🇮🇱 Israel" },
  { value: "Italy",                 label: "🇮🇹 Italy" },
  { value: "Ivory Coast",           label: "🇨🇮 Ivory Coast" },
  { value: "Jamaica",               label: "🇯🇲 Jamaica" },
  { value: "Japan",                 label: "🇯🇵 Japan" },
  { value: "Jordan",                label: "🇯🇴 Jordan" },
  { value: "Kazakhstan",            label: "🇰🇿 Kazakhstan" },
  { value: "Kenya",                 label: "🇰🇪 Kenya" },
  { value: "South Korea",           label: "🇰🇷 South Korea" },
  { value: "Lebanon",               label: "🇱🇧 Lebanon" },
  { value: "Libya",                 label: "🇱🇾 Libya" },
  { value: "Malaysia",              label: "🇲🇾 Malaysia" },
  { value: "Mexico",                label: "🇲🇽 Mexico" },
  { value: "Morocco",               label: "🇲🇦 Morocco" },
  { value: "Mozambique",            label: "🇲🇿 Mozambique" },
  { value: "Namibia",               label: "🇳🇦 Namibia" },
  { value: "Nepal",                 label: "🇳🇵 Nepal" },
  { value: "New Zealand",           label: "🇳🇿 New Zealand" },
  { value: "Nigeria",               label: "🇳🇬 Nigeria" },
  { value: "Norway",                label: "🇳🇴 Norway" },
  { value: "Pakistan",              label: "🇵🇰 Pakistan" },
  { value: "Peru",                  label: "🇵🇪 Peru" },
  { value: "Poland",                label: "🇵🇱 Poland" },
  { value: "Portugal",              label: "🇵🇹 Portugal" },
  { value: "Romania",               label: "🇷🇴 Romania" },
  { value: "Russia",                label: "🇷🇺 Russia" },
  { value: "Saudi Arabia",          label: "🇸🇦 Saudi Arabia" },
  { value: "Senegal",               label: "🇸🇳 Senegal" },
  { value: "Serbia",                label: "🇷🇸 Serbia" },
  { value: "Singapore",             label: "🇸🇬 Singapore" },
  { value: "South Africa",          label: "🇿🇦 South Africa" },
  { value: "Spain",                 label: "🇪🇸 Spain" },
  { value: "Sri Lanka",             label: "🇱🇰 Sri Lanka" },
  { value: "Sudan",                 label: "🇸🇩 Sudan" },
  { value: "Sweden",                label: "🇸🇪 Sweden" },
  { value: "Switzerland",           label: "🇨🇭 Switzerland" },
  { value: "Syria",                 label: "🇸🇾 Syria" },
  { value: "Taiwan",                label: "🇹🇼 Taiwan" },
  { value: "Tanzania",              label: "🇹🇿 Tanzania" },
  { value: "Thailand",              label: "🇹🇭 Thailand" },
  { value: "Tunisia",               label: "🇹🇳 Tunisia" },
  { value: "Turkey",                label: "🇹🇷 Turkey" },
  { value: "Uganda",                label: "🇺🇬 Uganda" },
  { value: "Ukraine",               label: "🇺🇦 Ukraine" },
  { value: "Uruguay",               label: "🇺🇾 Uruguay" },
  { value: "Uzbekistan",            label: "🇺🇿 Uzbekistan" },
  { value: "Venezuela",             label: "🇻🇪 Venezuela" },
  { value: "Vietnam",               label: "🇻🇳 Vietnam" },
  { value: "Yemen",                 label: "🇾🇪 Yemen" },
  { value: "Zambia",                label: "🇿🇲 Zambia" },
  { value: "Zimbabwe",              label: "🇿🇼 Zimbabwe" },
];

const inputStyle = (err?: string): React.CSSProperties => ({
  width: "100%", padding: "11px 14px", borderRadius: 10,
  border: `1.5px solid ${err ? "#FECACA" : C.border}`,
  fontSize: 14, color: C.text, outline: "none",
  fontFamily: "inherit", boxSizing: "border-box",
  background: err ? "#FFF8F8" : "#fff",
  transition: "border-color 0.15s",
});

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}>{msg}</p>;
}

function StepDot({ n, active, done }: { n: number; active: boolean; done: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 36, height: 36, borderRadius: "50%", display: "flex", alignItems: "center",
        justifyContent: "center", fontSize: done ? 16 : 14, fontWeight: 700,
        background: done ? "#059669" : active ? C.blue : "#E2E8F0",
        color: done || active ? "#fff" : C.muted,
        transition: "all 0.25s",
        boxShadow: active ? "0 0 0 4px rgba(26,115,232,0.15)" : "none",
      }}>
        {done ? "✓" : n}
      </div>
    </div>
  );
}

export default function KYCPage() {
  const router   = useRouter();
  const fileRef  = useRef<HTMLInputElement>(null);

  const [user,        setUser]        = useState<VaulteUser | null>(null);
  const [step,        setStep]        = useState<1 | 2 | 3>(1);
  const [submitting,  setSubmitting]  = useState(false);
  const [errors,      setErrors]      = useState<Record<string, string>>({});
  const [dragOver,    setDragOver]    = useState(false);

  const [form, setForm] = useState({
    dob: "", nationality: "", address: "", city: "", docType: "passport",
  });
  const [docImage,    setDocImage]    = useState<string | null>(null);
  const [docFileName, setDocFileName] = useState("");

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) { router.push("/login"); return; }
    setUser(u);

    // Pre-fill if user already submitted before
    if (u.kycDob)         setForm(f => ({ ...f, dob: u.kycDob! }));
    if (u.kycNationality) setForm(f => ({ ...f, nationality: u.kycNationality! }));
    if (u.kycAddress)     setForm(f => ({ ...f, address: u.kycAddress! }));
    if (u.kycCity)        setForm(f => ({ ...f, city: u.kycCity! }));
    if (u.kycDocType)     setForm(f => ({ ...f, docType: u.kycDocType! }));

    // Load existing doc preview
    const existingDoc = getKycDoc(u.id);
    if (existingDoc) setDocImage(existingDoc);

    // If already pending or verified, go straight to confirmation step
    if (u.kycStatus === "pending" || u.kycStatus === "verified") setStep(3);
  }, [router]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));
  const clearErr = (k: string)       => setErrors(e => { const c = { ...e }; delete c[k]; return c; });

  // ─── File handling ──────────────────────────────────────
  const handleFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrors(e => ({ ...e, doc: "Only image files are accepted (JPG, PNG, WEBP)" }));
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setErrors(e => ({ ...e, doc: "File size must be under 8 MB" }));
      return;
    }
    clearErr("doc");
    setDocFileName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setDocImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0] ?? null);
  };

  // ─── Validation ─────────────────────────────────────────
  const handleStep1Submit = () => {
    const errs: Record<string, string> = {};
    if (!form.dob)         errs.dob         = "Date of birth is required";
    if (!form.nationality) errs.nationality = "Please select your nationality";
    if (!form.address)     errs.address     = "Address is required";
    if (!form.city)        errs.city        = "City / country is required";
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep(2);
  };

  // ─── Submit ─────────────────────────────────────────────
  const handleSubmit = () => {
    if (!docImage)  { setErrors({ doc: "Please upload a photo of your ID document" }); return; }
    if (!user)      return;

    setSubmitting(true);
    // Simulate a short processing delay
    setTimeout(() => {
      submitKyc(user.id, form.docType, docImage, {
        dob: form.dob, nationality: form.nationality,
        address: form.address, city: form.city,
      });
      // Also write "pending" to Redis so other devices see the submission
      fetch("/api/kyc/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, kycStatus: "pending" }),
      }).catch(err => console.error("[kyc/submit] Redis sync failed:", err));
      setSubmitting(false);
      setStep(3);
    }, 1800);
  };

  const docTypeLabel = DOC_TYPES.find(d => d.value === form.docType)?.label ?? "ID Document";

  // ─── Render ─────────────────────────────────────────────
  return (
    <DashboardLayout title="Identity Verification" subtitle="KYC — Know Your Customer">

      {/* Outer container */}
      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        {/* ── Step indicator ── */}
        {step < 3 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0, marginBottom: 32 }}>
            <StepDot n={1} active={step === 1} done={step > 1} />
            <div style={{ flex: 1, height: 2, background: step > 1 ? "#059669" : "#E2E8F0", maxWidth: 80, transition: "background 0.3s" }} />
            <StepDot n={2} active={step === 2} done={step > 2} />
            <div style={{ flex: 1, height: 2, background: "#E2E8F0", maxWidth: 80 }} />
            <StepDot n={3} active={false} done={false} />

            {/* Labels */}
          </div>
        )}
        {step < 3 && (
          <div style={{ display: "flex", justifyContent: "space-around", marginTop: -28, marginBottom: 28 }}>
            {["Personal Details", "Upload ID", "Complete"].map((label, i) => (
              <span key={label} style={{ fontSize: 11.5, fontWeight: step === i + 1 ? 700 : 400, color: step === i + 1 ? C.blue : C.muted, textAlign: "center", letterSpacing: "0.02em" }}>
                {label}
              </span>
            ))}
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            STEP 1 — Personal Details
        ══════════════════════════════════════════════════ */}
        {step === 1 && (
          <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "32px 32px 28px" }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: C.text, marginBottom: 4, letterSpacing: "-0.3px" }}>Personal Details</h2>
            <p style={{ fontSize: 13.5, color: C.muted, marginBottom: 28, lineHeight: 1.5 }}>
              Please provide your personal information exactly as it appears on your government-issued ID.
            </p>

            <div className="kyc-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px 20px" }}>

              {/* Full name — read-only */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.sub, display: "block", marginBottom: 7 }}>First Name</label>
                <input value={user?.firstName ?? ""} readOnly
                  style={{ ...inputStyle(), background: "#F8FAFC", color: C.muted, cursor: "default" }} />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.sub, display: "block", marginBottom: 7 }}>Last Name</label>
                <input value={user?.lastName ?? ""} readOnly
                  style={{ ...inputStyle(), background: "#F8FAFC", color: C.muted, cursor: "default" }} />
              </div>

              {/* Date of birth */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.sub, display: "block", marginBottom: 7 }}>
                  Date of Birth <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <input type="date" value={form.dob}
                  max={new Date(Date.now() - 16 * 365.25 * 86400000).toISOString().split("T")[0]}
                  onChange={e => { set("dob", e.target.value); clearErr("dob"); }}
                  style={inputStyle(errors.dob)} />
                <FieldError msg={errors.dob} />
              </div>

              {/* Nationality */}
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.sub, display: "block", marginBottom: 7 }}>
                  Nationality <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <select value={form.nationality}
                  onChange={e => { set("nationality", e.target.value); clearErr("nationality"); }}
                  style={{ ...inputStyle(errors.nationality), appearance: "auto" }}>
                  <option value="">Select nationality...</option>
                  {COUNTRIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                <FieldError msg={errors.nationality} />
              </div>

              {/* Address */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.sub, display: "block", marginBottom: 7 }}>
                  Residential Address <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <input value={form.address} placeholder="123 Main Street"
                  onChange={e => { set("address", e.target.value); clearErr("address"); }}
                  style={inputStyle(errors.address)} />
                <FieldError msg={errors.address} />
              </div>

              {/* City */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.sub, display: "block", marginBottom: 7 }}>
                  City &amp; Country <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <input value={form.city} placeholder="e.g. New York, USA"
                  onChange={e => { set("city", e.target.value); clearErr("city"); }}
                  style={inputStyle(errors.city)} />
                <FieldError msg={errors.city} />
              </div>

              {/* Document type */}
              <div style={{ gridColumn: "1 / -1" }}>
                <label style={{ fontSize: 13, fontWeight: 600, color: C.sub, display: "block", marginBottom: 10 }}>
                  Document Type <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <div className="kyc-doc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
                  {DOC_TYPES.map(dt => (
                    <button key={dt.value} onClick={() => set("docType", dt.value)}
                      style={{
                        padding: "14px 10px", borderRadius: 12, cursor: "pointer",
                        border: `2px solid ${form.docType === dt.value ? C.blue : C.border}`,
                        background: form.docType === dt.value ? "#EEF4FF" : "#fff",
                        display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                        transition: "all 0.15s", fontFamily: "inherit",
                      }}>
                      <span style={{ fontSize: 22 }}>{dt.icon}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: form.docType === dt.value ? C.blue : C.text }}>{dt.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <button onClick={handleStep1Submit}
              style={{ width: "100%", marginTop: 28, padding: "13px", borderRadius: 12, border: "none", background: `linear-gradient(135deg, ${C.blue}, #1558b0)`, color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(26,115,232,0.3)", transition: "opacity 0.15s" }}>
              Continue to Document Upload →
            </button>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            STEP 2 — Upload ID
        ══════════════════════════════════════════════════ */}
        {step === 2 && (
          <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "32px 32px 28px" }}>
            <h2 style={{ fontSize: 19, fontWeight: 800, color: C.text, marginBottom: 4, letterSpacing: "-0.3px" }}>Upload {docTypeLabel}</h2>
            <p style={{ fontSize: 13.5, color: C.muted, marginBottom: 24, lineHeight: 1.6 }}>
              Take a clear photo of the <strong>front side</strong> of your {docTypeLabel}. Make sure all four corners are visible, the text is sharp, and there is no glare.
            </p>

            {/* Tips */}
            <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12, padding: "14px 16px", marginBottom: 24 }}>
              <p style={{ fontSize: 12.5, fontWeight: 700, color: "#166534", marginBottom: 8 }}>📸 Tips for a good photo:</p>
              <ul style={{ margin: 0, paddingLeft: 18, display: "flex", flexDirection: "column", gap: 4 }}>
                {["Place your ID on a flat, dark surface", "Ensure good lighting — no shadows or glare", "Keep all 4 corners of the ID visible", "Make sure all text is sharp and readable"].map(tip => (
                  <li key={tip} style={{ fontSize: 12, color: "#166534" }}>{tip}</li>
                ))}
              </ul>
            </div>

            {/* Drop zone */}
            <div
              onClick={() => fileRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={e => { e.preventDefault(); setDragOver(true); }}
              onDragLeave={() => setDragOver(false)}
              style={{
                border: `2px dashed ${errors.doc ? "#FECACA" : dragOver ? C.blue : "#CBD5E1"}`,
                borderRadius: 16, padding: "32px 20px", textAlign: "center",
                cursor: "pointer", transition: "border-color 0.2s, background 0.2s",
                background: dragOver ? "#EEF4FF" : errors.doc ? "#FFF8F8" : "#F8FAFC",
                marginBottom: docImage ? 20 : 0,
              }}>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }}
                onChange={e => handleFile(e.target.files?.[0] ?? null)} />
              <div style={{ fontSize: 40, marginBottom: 10 }}>📤</div>
              <p style={{ fontSize: 14.5, fontWeight: 700, color: C.text, marginBottom: 6 }}>
                {docImage ? "Click to replace image" : "Click or drag to upload"}
              </p>
              <p style={{ fontSize: 12.5, color: C.muted }}>JPG, PNG or WEBP · Max 8 MB</p>
            </div>
            <FieldError msg={errors.doc} />

            {/* Preview */}
            {docImage && (
              <div style={{ marginTop: 20, marginBottom: 4 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 10 }}>
                  Preview · <span style={{ fontWeight: 400, color: C.muted }}>{docFileName}</span>
                </p>
                <div style={{ position: "relative", borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}`, boxShadow: "0 4px 12px rgba(15,23,42,0.08)" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={docImage} alt="ID preview"
                    style={{ width: "100%", height: "auto", maxHeight: 280, objectFit: "contain", background: "#0F172A", display: "block" }} />
                  <div style={{ position: "absolute", top: 10, right: 10, background: "#059669", color: "#fff", borderRadius: 8, padding: "4px 10px", fontSize: 11.5, fontWeight: 700 }}>
                    ✓ Uploaded
                  </div>
                  <button onClick={e => { e.stopPropagation(); setDocImage(null); setDocFileName(""); }}
                    style={{ position: "absolute", top: 10, left: 10, background: "rgba(15,23,42,0.7)", color: "#fff", border: "none", borderRadius: 8, padding: "4px 10px", fontSize: 11.5, fontWeight: 600, cursor: "pointer" }}>
                    ✕ Remove
                  </button>
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div style={{ display: "flex", gap: 12, marginTop: 28 }}>
              <button onClick={() => setStep(1)}
                style={{ flex: "0 0 auto", padding: "13px 20px", borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent", color: C.sub, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                ← Back
              </button>
              <button onClick={handleSubmit} disabled={submitting}
                style={{ flex: 1, padding: "13px", borderRadius: 12, border: "none", background: submitting ? "#94A3B8" : `linear-gradient(135deg, ${C.blue}, #1558b0)`, color: "#fff", fontSize: 15, fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: submitting ? "none" : "0 4px 16px rgba(26,115,232,0.3)", transition: "background 0.2s", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
                {submitting ? (
                  <>
                    <span style={{ width: 16, height: 16, border: "2.5px solid rgba(255,255,255,0.35)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
                    Submitting...
                  </>
                ) : "Submit for Review ✓"}
              </button>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════
            STEP 3 — Submitted / Verified / Pending
        ══════════════════════════════════════════════════ */}
        {step === 3 && (
          <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "48px 40px", textAlign: "center" }}>

            {user?.kycStatus === "verified" ? (
              <>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px" }}>✓</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: "#065F46", marginBottom: 8, letterSpacing: "-0.3px" }}>Verification Complete</h2>
                <p style={{ fontSize: 14, color: "#047857", lineHeight: 1.7, marginBottom: 32 }}>
                  Your identity has been verified. You now have full access to all Vaulte banking features including transfers, cards, and international exchange.
                </p>
                <button onClick={() => router.push("/dashboard")}
                  style={{ padding: "13px 32px", borderRadius: 12, border: "none", background: "#059669", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                  Go to Dashboard →
                </button>
              </>
            ) : (
              <>
                {/* Pending state */}
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#FEF3C7,#FDE68A)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px" }}>⏳</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 8, letterSpacing: "-0.3px" }}>Verification Submitted</h2>
                <p style={{ fontSize: 14, color: C.sub, lineHeight: 1.7, marginBottom: 28 }}>
                  Your documents are under review. This typically takes <strong>1–2 business days</strong>. You will be notified once a decision has been made.
                </p>

                {/* Show submitted document thumbnail */}
                {docImage && (
                  <div style={{ margin: "0 auto 28px", maxWidth: 320 }}>
                    <p style={{ fontSize: 12.5, color: C.muted, marginBottom: 10, textAlign: "left" }}>
                      Submitted document · <strong>{DOC_TYPES.find(d => d.value === user?.kycDocType)?.label ?? "ID Document"}</strong>
                    </p>
                    <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${C.border}`, boxShadow: "0 4px 12px rgba(15,23,42,0.08)", position: "relative" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={docImage} alt="Submitted ID"
                        style={{ width: "100%", height: "auto", maxHeight: 200, objectFit: "contain", background: "#0F172A", display: "block", filter: "blur(6px) brightness(0.7)" }} />
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ background: "rgba(0,0,0,0.65)", color: "#fff", borderRadius: 10, padding: "8px 16px", fontSize: 13, fontWeight: 600 }}>🔒 Under Review</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Status timeline */}
                <div style={{ background: "#F8FAFC", borderRadius: 14, padding: "20px 20px", marginBottom: 28, textAlign: "left" }}>
                  {[
                    { icon: "✓", label: "Documents submitted",     color: "#059669", bg: "#D1FAE5", done: true },
                    { icon: "⏳", label: "Under admin review",      color: "#D97706", bg: "#FDE68A", done: false },
                    { icon: "○", label: "Decision notification",   color: C.muted,   bg: "#E2E8F0", done: false },
                  ].map((item, i) => (
                    <div key={item.label} style={{ display: "flex", alignItems: "center", gap: 14, padding: "10px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: item.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: item.color, fontWeight: 700, flexShrink: 0 }}>{item.icon}</div>
                      <span style={{ fontSize: 13.5, fontWeight: item.done ? 600 : 400, color: item.done ? C.text : C.muted }}>{item.label}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  <button onClick={() => router.push("/dashboard")}
                    style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: C.blue, color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    Back to Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Info footer */}
        {step < 3 && (
          <div style={{ marginTop: 20, display: "flex", alignItems: "center", gap: 10, padding: "14px 16px", background: "#F8FAFC", borderRadius: 12, border: `1px solid ${C.border}` }}>
            <span style={{ fontSize: 16 }}>🔒</span>
            <p style={{ fontSize: 12.5, color: C.muted, lineHeight: 1.5 }}>
              Your information is encrypted and stored securely. Vaulte will never share your data with third parties without your consent.
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </DashboardLayout>
  );
}
