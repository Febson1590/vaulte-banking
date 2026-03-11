"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getState, saveState, VaulteState, DEFAULT_STATE, getCurrentUser } from "@/lib/vaulteState";

const C = {
  bg: "#F3F5FA", card: "#ffffff", navy: "#0F172A", blue: "#1A73E8",
  border: "rgba(15,23,42,0.07)", muted: "#94A3B8", text: "#0F172A", sub: "#64748B",
  shadow: "0 1px 3px rgba(15,23,42,0.05), 0 6px 20px rgba(15,23,42,0.07)",
} as const;

type Tab = "profile" | "security" | "notifications" | "preferences";

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{ width: 46, height: 26, borderRadius: 13, border: "none", cursor: "pointer", background: on ? C.blue : "#E2E8F0", position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
      <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(15,23,42,0.2)", transition: "left 0.25s" }} />
    </button>
  );
}

function Field({ label, value, onChange, type = "text", placeholder = "" }: { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <div>
      <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, display: "block", marginBottom: 6 }}>{label}</label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 13.5, color: C.text, background: C.bg, outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.18s, box-shadow 0.18s, background 0.18s" }}
        onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.08)"; e.target.style.background = "#fff"; }}
        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; e.target.style.background = C.bg; }}
      />
    </div>
  );
}

export default function SettingsPage() {
  const [state, setState] = useState<VaulteState>(DEFAULT_STATE);
  const [tab, setTab] = useState<Tab>("profile");
  const [toast, setToast] = useState<string | null>(null);

  // Profile form state
  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [email,     setEmail]     = useState("");
  const [phone,     setPhone]     = useState("");
  const [dob,       setDob]       = useState("");
  const [address,   setAddress]   = useState("");
  const [city,      setCity]      = useState("");
  const [country,   setCountry]   = useState("");

  // Security
  const [oldPw,  setOldPw]  = useState("");
  const [newPw,  setNewPw]  = useState("");
  const [confPw, setConfPw] = useState("");
  const [pwErr,  setPwErr]  = useState("");
  const [pwDone, setPwDone] = useState(false);

  useEffect(() => {
    const s = getState();
    setState(s);
    setFirstName(s.profile.firstName);
    setLastName(s.profile.lastName);
    setEmail(s.profile.email);
    setPhone(s.profile.phone);
    setDob(s.profile.dob);
    setAddress(s.profile.address);
    setCity(s.profile.city);
    setCountry(s.profile.country);
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const saveProfile = () => {
    const newState: VaulteState = { ...state, profile: { firstName, lastName, email, phone, dob, address, city, country } };
    setState(newState);
    saveState(newState);
    showToast("Profile saved successfully.");
  };

  const saveNotifications = () => {
    saveState(state);
    showToast("Notification preferences saved.");
  };

  const savePreferences = () => {
    saveState(state);
    showToast("Preferences saved successfully.");
  };

  const updatePref = <K extends keyof VaulteState["preferences"]>(key: K, value: VaulteState["preferences"][K]) => {
    const newState = { ...state, preferences: { ...state.preferences, [key]: value } };
    setState(newState);
  };

  const updateNotif = (key: keyof VaulteState["preferences"]["notifications"]) => {
    const newState = { ...state, preferences: { ...state.preferences, notifications: { ...state.preferences.notifications, [key]: !state.preferences.notifications[key] } } };
    setState(newState);
  };

  const [pwLoading, setPwLoading] = useState(false);

  const handlePwChange = async () => {
    setPwErr("");
    if (!oldPw) { setPwErr("Enter your current password."); return; }
    if (newPw.length < 8) { setPwErr("New password must be at least 8 characters."); return; }
    if (newPw !== confPw) { setPwErr("Passwords do not match."); return; }

    const user = getCurrentUser();
    if (!user?.email) { setPwErr("Could not identify your account. Please log in again."); return; }

    setPwLoading(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, currentPassword: oldPw, newPassword: newPw, confirmPassword: confPw }),
      });
      const data = await res.json();
      if (!res.ok) {
        setPwErr(data.error ?? "Password change failed.");
      } else {
        setPwDone(true);
        setOldPw(""); setNewPw(""); setConfPw("");
        showToast("Password changed successfully.");
        setTimeout(() => setPwDone(false), 4000);
      }
    } catch {
      setPwErr("Network error. Please try again.");
    } finally {
      setPwLoading(false);
    }
  };

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: "profile",       label: "Profile",       icon: "👤" },
    { key: "security",      label: "Security",      icon: "🔒" },
    { key: "notifications", label: "Notifications", icon: "🔔" },
    { key: "preferences",  label: "Preferences",   icon: "⚙️" },
  ];

  return (
    <DashboardLayout title="Settings" subtitle="Manage your account and preferences">

      {toast && (
        <div style={{ position: "fixed", top: 88, right: 32, zIndex: 999, background: C.navy, color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 13.5, fontWeight: 500, boxShadow: "0 8px 24px rgba(15,23,42,0.25)", display: "flex", alignItems: "center", gap: 10, animation: "slideIn 0.25s ease" }}>
          <span style={{ color: "#4ADE80" }}>✓</span> {toast}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, alignItems: "start" }}>

        {/* Tabs sidebar */}
        <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "12px 10px", position: "sticky", top: 96 }}>
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              display: "flex", alignItems: "center", gap: 12, width: "100%", padding: "12px 14px", borderRadius: 12, border: "none",
              background: tab === t.key ? "rgba(26,115,232,0.1)" : "transparent",
              color: tab === t.key ? C.blue : C.sub,
              borderLeft: `2.5px solid ${tab === t.key ? C.blue : "transparent"}`,
              fontSize: 13.5, fontWeight: tab === t.key ? 600 : 400, cursor: "pointer", fontFamily: "inherit",
              textAlign: "left", marginBottom: 2, transition: "all 0.15s",
            }}
              onMouseEnter={e => { if (tab !== t.key) (e.currentTarget as HTMLElement).style.background = C.bg; }}
              onMouseLeave={e => { if (tab !== t.key) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <span style={{ fontSize: 16 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Content panel */}
        <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "30px 32px" }}>

          {/* ──────────── PROFILE ──────────── */}
          {tab === "profile" && (
            <div>
              <p style={{ fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: "-0.3px", marginBottom: 4 }}>Personal Information</p>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>Update your name, contact details, and address.</p>

              {/* Avatar */}
              <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 30, padding: "18px 20px", background: C.bg, borderRadius: 16, border: `1px solid ${C.border}` }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "linear-gradient(135deg,#1A73E8,#1558b0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, fontWeight: 700, color: "#fff", flexShrink: 0, boxShadow: "0 4px 16px rgba(26,115,232,0.28)" }}>
                  {firstName[0] ?? "J"}{lastName[0] ?? "D"}
                </div>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: C.text }}>{firstName} {lastName}</p>
                  <p style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{email}</p>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#059669", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 20, padding: "2px 10px" }}>✓ ID Verified</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#1A73E8", background: "#EEF4FF", border: "1px solid #BFDBFE", borderRadius: 20, padding: "2px 10px" }}>Premium</span>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 28 }}>
                <Field label="First Name"    value={firstName} onChange={setFirstName} />
                <Field label="Last Name"     value={lastName}  onChange={setLastName} />
                <Field label="Email Address" value={email}     onChange={setEmail} type="email" />
                <Field label="Phone Number"  value={phone}     onChange={setPhone} type="tel" />
                <Field label="Date of Birth" value={dob}       onChange={setDob}   type="date" />
                <Field label="Country"       value={country}   onChange={setCountry} />
                <Field label="Address"       value={address}   onChange={setAddress} placeholder="Street address" />
                <Field label="City / State"  value={city}      onChange={setCity} />
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={saveProfile} style={{ padding: "13px 32px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#1A73E8,#1558b0)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(26,115,232,0.28)", transition: "all 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(26,115,232,0.38)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(26,115,232,0.28)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
                >Save Changes</button>
              </div>
            </div>
          )}

          {/* ──────────── SECURITY ──────────── */}
          {tab === "security" && (
            <div>
              <p style={{ fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: "-0.3px", marginBottom: 4 }}>Security Settings</p>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>Manage your password, 2FA, and active sessions.</p>

              {/* 2FA */}
              <div style={{ padding: "20px 22px", background: state.preferences.twoFactor ? "#ECFDF5" : "#FEF2F2", borderRadius: 16, border: `1px solid ${state.preferences.twoFactor ? "#A7F3D0" : "#FECACA"}`, marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  <span style={{ fontSize: 28 }}>{state.preferences.twoFactor ? "🛡" : "⚠️"}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Two-Factor Authentication</p>
                    <p style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{state.preferences.twoFactor ? "Your account is protected with 2FA." : "Enable 2FA to secure your account."}</p>
                  </div>
                </div>
                <Toggle on={state.preferences.twoFactor} onChange={() => { updatePref("twoFactor", !state.preferences.twoFactor); saveState(state); showToast(`2FA ${!state.preferences.twoFactor ? "enabled" : "disabled"}.`); }} />
              </div>

              {/* Change password */}
              <p style={{ fontSize: 14.5, fontWeight: 700, color: C.text, marginBottom: 16 }}>Change Password</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 8 }}>
                <Field label="Current Password" value={oldPw} onChange={setOldPw} type="password" placeholder="Enter current password" />
                <Field label="New Password"     value={newPw} onChange={setNewPw} type="password" placeholder="Min 8 characters" />
                <Field label="Confirm New Password" value={confPw} onChange={setConfPw} type="password" placeholder="Re-enter new password" />
              </div>
              {pwErr && <p style={{ fontSize: 12.5, color: "#EF4444", marginBottom: 12 }}>⚠ {pwErr}</p>}
              {pwDone && <p style={{ fontSize: 12.5, color: "#059669", marginBottom: 12 }}>✓ Password changed successfully.</p>}
              <button onClick={handlePwChange} disabled={pwLoading} style={{ padding: "12px 28px", borderRadius: 12, border: "none", background: pwLoading ? "#94A3B8" : "linear-gradient(135deg,#1A73E8,#1558b0)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: pwLoading ? "not-allowed" : "pointer", fontFamily: "inherit", boxShadow: pwLoading ? "none" : "0 4px 14px rgba(26,115,232,0.26)", marginBottom: 28 }}>{pwLoading ? "Updating…" : "Update Password"}</button>

              {/* Active sessions */}
              <p style={{ fontSize: 14.5, fontWeight: 700, color: C.text, marginBottom: 14 }}>Active Sessions</p>
              {[
                { device: "MacBook Pro", location: "New York, US", time: "Now — Current session", icon: "💻", current: true },
                { device: "iPhone 15",   location: "New York, US", time: "2 hours ago",           icon: "📱", current: false },
                { device: "Chrome Web",  location: "New York, US", time: "Yesterday",             icon: "🌐", current: false },
              ].map((s, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 16px", background: s.current ? "#EEF4FF" : C.bg, borderRadius: 14, marginBottom: 8, border: `1px solid ${s.current ? "rgba(26,115,232,0.15)" : C.border}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <span style={{ fontSize: 22 }}>{s.icon}</span>
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{s.device}</p>
                      <p style={{ fontSize: 12, color: C.muted }}>{s.location} · {s.time}</p>
                    </div>
                  </div>
                  {s.current
                    ? <span style={{ fontSize: 11, fontWeight: 700, color: C.blue, background: "#EEF4FF", border: "1px solid rgba(26,115,232,0.2)", borderRadius: 20, padding: "3px 10px" }}>This device</span>
                    : <button onClick={() => showToast(`Session on ${s.device} terminated.`)} style={{ fontSize: 12.5, fontWeight: 600, color: "#EF4444", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>End session</button>
                  }
                </div>
              ))}
            </div>
          )}

          {/* ──────────── NOTIFICATIONS ──────────── */}
          {tab === "notifications" && (
            <div>
              <p style={{ fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: "-0.3px", marginBottom: 4 }}>Notification Preferences</p>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>Choose how and when you want to be notified.</p>

              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginBottom: 28 }}>
                {[
                  { key: "email" as const,     icon: "📧", label: "Email Notifications",   sub: "Account updates, statements, and alerts" },
                  { key: "push" as const,      icon: "📲", label: "Push Notifications",    sub: "Real-time alerts on your device" },
                  { key: "sms" as const,       icon: "💬", label: "SMS Alerts",            sub: "Text messages for critical events" },
                  { key: "marketing" as const, icon: "🎯", label: "Marketing & Offers",    sub: "Promotions, tips, and product updates" },
                ].map((n, i, arr) => (
                  <div key={n.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 20px", background: C.bg, borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: i < arr.length - 1 ? 8 : 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <span style={{ fontSize: 22 }}>{n.icon}</span>
                      <div>
                        <p style={{ fontSize: 14, fontWeight: 600, color: C.text }}>{n.label}</p>
                        <p style={{ fontSize: 12.5, color: C.muted, marginTop: 2 }}>{n.sub}</p>
                      </div>
                    </div>
                    <Toggle on={state.preferences.notifications[n.key]} onChange={() => updateNotif(n.key)} />
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={saveNotifications} style={{ padding: "13px 32px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#1A73E8,#1558b0)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(26,115,232,0.28)" }}>Save Preferences</button>
              </div>
            </div>
          )}

          {/* ──────────── PREFERENCES ──────────── */}
          {tab === "preferences" && (
            <div>
              <p style={{ fontSize: 17, fontWeight: 700, color: C.text, letterSpacing: "-0.3px", marginBottom: 4 }}>App Preferences</p>
              <p style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>Customize your Vaulte experience.</p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 28 }}>
                {[
                  { label: "Default Currency", key: "defaultCurrency", options: ["USD", "EUR", "GBP", "BTC", "NGN", "JPY"] },
                  { label: "Language",          key: "language",        options: ["English", "French", "Spanish", "German", "Portuguese", "Arabic"] },
                  { label: "Timezone",          key: "timezone",        options: ["UTC-8 (Pacific)", "UTC-5 (Eastern)", "UTC+0 (London)", "UTC+1 (Paris)", "UTC+3 (Moscow)", "UTC+8 (Beijing)"] },
                  { label: "Theme",             key: "theme",           options: ["Light", "Dark", "System"] },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, display: "block", marginBottom: 6 }}>{f.label}</label>
                    <select
                      value={f.key !== "theme" ? (state.preferences as unknown as Record<string, string>)[f.key] : "Light"}
                      onChange={e => { if (f.key !== "theme") updatePref(f.key as keyof VaulteState["preferences"], e.target.value as never); }}
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 13.5, color: C.text, background: "#fff", outline: "none", fontFamily: "inherit", cursor: "pointer", appearance: "none", backgroundImage: "url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 12 12%22><path fill=%22%2394A3B8%22 d=%22M6 8L1 3h10z%22/></svg>')", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
                    >
                      {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>

              {/* Danger zone */}
              <div style={{ padding: "20px 22px", background: "#FEF2F2", borderRadius: 16, border: "1px solid #FECACA", marginBottom: 24 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: "#DC2626", marginBottom: 6 }}>Danger Zone</p>
                <p style={{ fontSize: 12.5, color: "#EF4444", marginBottom: 14 }}>These actions are irreversible. Please proceed with caution.</p>
                <button onClick={() => showToast("For account closure, please contact support at support@vaulte.com")} style={{ padding: "10px 20px", borderRadius: 10, border: "1px solid #FECACA", background: "transparent", color: "#DC2626", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Close Account</button>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <button onClick={savePreferences} style={{ padding: "13px 32px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#1A73E8,#1558b0)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(26,115,232,0.28)" }}>Save Preferences</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`@keyframes slideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }`}</style>
    </DashboardLayout>
  );
}
