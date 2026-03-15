"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getCurrentUser } from "@/lib/vaulteState";

const C = {
  bg: "#F3F5FA", card: "#ffffff", navy: "#0F172A", blue: "#1A73E8",
  border: "rgba(15,23,42,0.07)", muted: "#94A3B8", text: "#0F172A", sub: "#64748B",
  shadow: "0 1px 3px rgba(15,23,42,0.05), 0 6px 20px rgba(15,23,42,0.07)",
} as const;

interface LoginRecord {
  timestamp: string;
  ip:        string;
  userAgent: string;
  device:    string;
  browser:   string;
  status:    "success" | "failed";
  isNewIp:   boolean;
}

function deviceIcon(device: string): string {
  const d = device.toLowerCase();
  if (d.includes("mobile") || d.includes("android") || d.includes("ios")) return "📱";
  if (d.includes("tablet") || d.includes("ipad")) return "📲";
  return "💻";
}

function browserIcon(browser: string): string {
  const b = browser.toLowerCase();
  if (b.includes("chrome"))  return "🌐";
  if (b.includes("firefox")) return "🦊";
  if (b.includes("safari"))  return "🧭";
  if (b.includes("edge"))    return "🌀";
  return "🌐";
}

function timeSince(isoDate: string): string {
  const now  = Date.now();
  const then = new Date(isoDate).getTime();
  const diff = Math.floor((now - then) / 1000);
  if (diff < 60)   return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  return new Date(isoDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function SecurityActivityPage() {
  const [history,  setHistory]  = useState<LoginRecord[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");
  const [selected, setSelected] = useState<LoginRecord | null>(null);
  const [mounted,  setMounted]  = useState(false);

  useEffect(() => {
    setMounted(true);
    const user = getCurrentUser();
    if (!user) { setLoading(false); return; }

    fetch(`/api/auth/login-history?userId=${user.id}`)
      .then(r => r.json())
      .then(data => {
        if (data.success) setHistory(data.history ?? []);
        else setError("Failed to load login history.");
      })
      .catch(() => setError("Network error. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  const newIpCount = history.filter(h => h.isNewIp).length;
  const failCount  = history.filter(h => h.status === "failed").length;

  return (
    <DashboardLayout title="Security Activity" subtitle="Recent login history and device access">
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Stats row */}
        <div className="security-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 24 }}>
          {[
            { icon: "🔐", label: "Total Logins", value: loading ? "—" : String(history.filter(h => h.status === "success").length), color: "#1A73E8", bg: "#EEF4FF" },
            { icon: "⚠️", label: "New IP Logins", value: loading ? "—" : String(newIpCount), color: newIpCount > 0 ? "#D97706" : "#059669", bg: newIpCount > 0 ? "#FFFBEB" : "#F0FDF4" },
            { icon: "🚫", label: "Failed Attempts", value: loading ? "—" : String(failCount), color: failCount > 0 ? "#DC2626" : "#059669", bg: failCount > 0 ? "#FEF2F2" : "#F0FDF4" },
          ].map(s => (
            <div key={s.label} style={{ background: C.card, borderRadius: 14, padding: "20px 18px", boxShadow: C.shadow, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                {s.icon}
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 22, fontWeight: 800, color: s.color }}>{s.value}</p>
                <p style={{ margin: 0, fontSize: 12, color: C.muted, fontWeight: 600 }}>{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Security tips */}
        <div style={{ background: "linear-gradient(135deg,#0F172A 0%,#1e293b 100%)", borderRadius: 14, padding: "20px 24px", marginBottom: 24, display: "flex", gap: 16, alignItems: "flex-start" }}>
          <span style={{ fontSize: 28, flexShrink: 0 }}>🛡️</span>
          <div>
            <p style={{ margin: "0 0 6px", fontSize: 14, fontWeight: 700, color: "#fff" }}>Security Tips</p>
            <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>
              Review your login activity regularly. If you notice a login you don&apos;t recognize, change your password immediately and contact{" "}
              <a href="mailto:support@vaulte.com" style={{ color: "#93C5FD", textDecoration: "none", fontWeight: 600 }}>support@vaulte.com</a>.
            </p>
          </div>
        </div>

        {/* Login history */}
        <div style={{ background: C.card, borderRadius: 16, boxShadow: C.shadow, border: `1px solid ${C.border}`, overflow: "hidden" }}>
          <div style={{ padding: "20px 24px 16px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: C.navy }}>Recent Login Activity</h2>
              <p style={{ margin: "4px 0 0", fontSize: 12.5, color: C.muted }}>Last 50 sign-in events on your account</p>
            </div>
            {history.length > 0 && (
              <span style={{ fontSize: 12, color: C.muted, background: "#F3F5FA", padding: "4px 10px", borderRadius: 999 }}>
                {history.length} record{history.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {loading ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <div style={{ width: 36, height: 36, border: `3px solid ${C.blue}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 12px" }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
              <p style={{ color: C.muted, fontSize: 14, margin: 0 }}>Loading login history…</p>
            </div>
          ) : error ? (
            <div style={{ padding: 32, textAlign: "center" }}>
              <p style={{ color: "#DC2626", fontSize: 14 }}>⚠️ {error}</p>
            </div>
          ) : history.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>📋</div>
              <p style={{ color: C.navy, fontSize: 15, fontWeight: 600, marginBottom: 6 }}>No login history yet</p>
              <p style={{ color: C.muted, fontSize: 13.5 }}>Login activity will appear here after you sign in through the secure verification flow.</p>
            </div>
          ) : (
            <div>
              {history.map((record, i) => (
                <div
                  key={i}
                  onClick={() => setSelected(selected === record ? null : record)}
                  style={{
                    padding: "16px 24px", borderBottom: i < history.length - 1 ? `1px solid ${C.border}` : "none",
                    cursor: "pointer", transition: "background 0.15s",
                    background: selected === record ? "#F8FAFC" : "transparent",
                  }}
                  onMouseEnter={e => { if (selected !== record) (e.currentTarget as HTMLElement).style.background = "#FAFBFD"; }}
                  onMouseLeave={e => { if (selected !== record) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                    {/* Device icon */}
                    <div style={{
                      width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                      background: record.status === "success" ? (record.isNewIp ? "#FFFBEB" : "#F0FDF4") : "#FEF2F2",
                      display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
                    }}>
                      {record.status === "failed" ? "🚫" : deviceIcon(record.device)}
                    </div>

                    {/* Main info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: C.navy }}>
                          {record.device || "Desktop · Unknown OS"}
                        </span>
                        {record.isNewIp && record.status === "success" && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#D97706", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 999, padding: "2px 8px" }}>
                            NEW IP
                          </span>
                        )}
                        {record.status === "failed" && (
                          <span style={{ fontSize: 11, fontWeight: 700, color: "#DC2626", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 999, padding: "2px 8px" }}>
                            FAILED
                          </span>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                        <span style={{ fontSize: 12.5, color: C.sub, display: "flex", alignItems: "center", gap: 4 }}>
                          {browserIcon(record.browser)} {record.browser}
                        </span>
                        <span style={{ fontSize: 12.5, color: C.sub, display: "flex", alignItems: "center", gap: 4 }}>
                          🌐 {record.ip}
                        </span>
                      </div>
                    </div>

                    {/* Time + status */}
                    <div style={{ textAlign: "right", flexShrink: 0 }}>
                      <p style={{ margin: 0, fontSize: 12.5, color: C.muted }}>{timeSince(record.timestamp)}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, justifyContent: "flex-end", marginTop: 4 }}>
                        <div style={{ width: 7, height: 7, borderRadius: "50%", background: record.status === "success" ? "#10B981" : "#EF4444" }} />
                        <span style={{ fontSize: 12, color: record.status === "success" ? "#10B981" : "#EF4444", fontWeight: 600, textTransform: "capitalize" }}>
                          {record.status}
                        </span>
                      </div>
                    </div>

                    {/* Expand arrow */}
                    <div style={{ color: C.muted, fontSize: 14, transition: "transform 0.2s", transform: selected === record ? "rotate(90deg)" : "none", flexShrink: 0 }}>
                      ›
                    </div>
                  </div>

                  {/* Expanded detail */}
                  {selected === record && (
                    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                      <div className="security-detail-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                        {[
                          ["Timestamp",   new Date(record.timestamp).toLocaleString("en-US", { dateStyle: "full", timeStyle: "short" })],
                          ["IP Address",  record.ip],
                          ["Device",      record.device || "Unknown"],
                          ["Browser",     record.browser || "Unknown"],
                          ["Status",      record.status === "success" ? "✅ Successful" : "❌ Failed"],
                          ["New IP",      record.isNewIp ? "⚠️ Yes — security alert sent" : "✓ No — known IP"],
                        ].map(([label, val]) => (
                          <div key={label} style={{ background: "#F8FAFC", borderRadius: 8, padding: "10px 12px" }}>
                            <p style={{ margin: "0 0 2px", fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.6px" }}>{label}</p>
                            <p style={{ margin: 0, fontSize: 13, color: C.navy, fontWeight: 500 }}>{val}</p>
                          </div>
                        ))}
                      </div>
                      {record.status === "success" && record.isNewIp && (
                        <div style={{ marginTop: 12, background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 8, padding: "10px 14px" }}>
                          <p style={{ margin: 0, fontSize: 12.5, color: "#92400E" }}>
                            ⚠️ This login was from a new IP address. A security alert email was sent to your registered email.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer note */}
        <p style={{ textAlign: "center", fontSize: 12.5, color: C.muted, marginTop: 20, lineHeight: 1.6 }}>
          Concerned about a login? Contact{" "}
          <a href="mailto:support@vaulte.com" style={{ color: C.blue, textDecoration: "none", fontWeight: 600 }}>support@vaulte.com</a>
          {" "}immediately.
        </p>
      </div>
    </DashboardLayout>
  );
}
