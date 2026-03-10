"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getState, saveState, VaulteState, DEFAULT_STATE, Notification, fmtDate, genNotifId } from "@/lib/vaulteState";

const C = {
  bg: "#F3F5FA", card: "#ffffff", navy: "#0F172A", blue: "#1A73E8",
  border: "rgba(15,23,42,0.07)", muted: "#94A3B8", text: "#0F172A", sub: "#64748B",
  shadow: "0 1px 3px rgba(15,23,42,0.05), 0 6px 20px rgba(15,23,42,0.07)",
} as const;

type FilterType = "all" | "transaction" | "security" | "account" | "promo";

const TYPE_META: Record<string, { label: string; color: string; bg: string; border: string }> = {
  transaction: { label: "Transaction", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE" },
  security:    { label: "Security",    color: "#DC2626", bg: "#FEF2F2", border: "#FECACA" },
  account:     { label: "Account",     color: "#D97706", bg: "#FFFBEB", border: "#FDE68A" },
  promo:       { label: "Promo",       color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" },
};

export default function NotificationsPage() {
  const [state,  setState]  = useState<VaulteState>(DEFAULT_STATE);
  const [filter, setFilter] = useState<FilterType>("all");
  const [toast,  setToast]  = useState<string | null>(null);

  useEffect(() => { setState(getState()); }, []);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  const persist = (notifications: Notification[]) => {
    const newState = { ...state, notifications };
    setState(newState);
    saveState(newState);
  };

  const markRead = (id: string) => {
    persist(state.notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    persist(state.notifications.map(n => ({ ...n, read: true })));
    showToast("All notifications marked as read.");
  };

  const deleteNotif = (id: string) => {
    persist(state.notifications.filter(n => n.id !== id));
  };

  const clearAll = () => {
    const filtered = filter === "all"
      ? []
      : state.notifications.filter(n => n.type !== filter);
    persist(filtered);
    showToast(filter === "all" ? "All notifications cleared." : `${TYPE_META[filter].label} notifications cleared.`);
  };

  const displayed = filter === "all"
    ? state.notifications
    : state.notifications.filter(n => n.type === filter);

  const unreadTotal = state.notifications.filter(n => !n.read).length;

  const filterCounts: Record<FilterType, number> = {
    all:         state.notifications.length,
    transaction: state.notifications.filter(n => n.type === "transaction").length,
    security:    state.notifications.filter(n => n.type === "security").length,
    account:     state.notifications.filter(n => n.type === "account").length,
    promo:       state.notifications.filter(n => n.type === "promo").length,
  };

  const TABS: { key: FilterType; label: string; icon: string }[] = [
    { key: "all",         label: "All",         icon: "⊞" },
    { key: "transaction", label: "Transactions", icon: "↕" },
    { key: "security",    label: "Security",     icon: "🔐" },
    { key: "account",     label: "Account",      icon: "◫" },
    { key: "promo",       label: "Promotions",   icon: "🎁" },
  ];

  return (
    <DashboardLayout
      title="Notifications"
      subtitle={unreadTotal > 0 ? `${unreadTotal} unread notification${unreadTotal !== 1 ? "s" : ""}` : "All caught up"}
    >
      {toast && (
        <div style={{ position: "fixed", top: 88, right: 32, zIndex: 999, background: C.navy, color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 13.5, fontWeight: 500, boxShadow: "0 8px 24px rgba(15,23,42,0.25)", display: "flex", alignItems: "center", gap: 10, animation: "slideIn 0.25s ease" }}>
          <span style={{ color: "#4ADE80" }}>✓</span> {toast}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: 24, alignItems: "start" }} className="notif-grid">

        {/* ═══ Left — notification list ═══ */}
        <div>
          {/* Filter tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
            {TABS.map(t => {
              const isActive = filter === t.key;
              const unread = t.key === "all"
                ? unreadTotal
                : state.notifications.filter(n => n.type === t.key && !n.read).length;
              return (
                <button key={t.key} onClick={() => setFilter(t.key)} style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "8px 16px", borderRadius: 12,
                  border: `1.5px solid ${isActive ? C.blue : C.border}`,
                  background: isActive ? C.blue : C.card,
                  color: isActive ? "#fff" : C.text,
                  fontSize: 13, fontWeight: isActive ? 700 : 500,
                  cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
                  boxShadow: isActive ? "0 4px 12px rgba(26,115,232,0.25)" : "none",
                }}>
                  <span>{t.icon}</span>
                  <span>{t.label}</span>
                  <span style={{
                    minWidth: 18, height: 18, borderRadius: 9, fontSize: 10, fontWeight: 700,
                    display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px",
                    background: isActive ? "rgba(255,255,255,0.25)" : C.bg,
                    color: isActive ? "#fff" : C.sub,
                  }}>{filterCounts[t.key]}</span>
                  {unread > 0 && !isActive && (
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#EF4444", display: "inline-block", marginLeft: -3 }} />
                  )}
                </button>
              );
            })}
          </div>

          {/* Action bar */}
          {displayed.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
              <p style={{ fontSize: 13, color: C.muted }}>{displayed.length} notification{displayed.length !== 1 ? "s" : ""}</p>
              <div style={{ display: "flex", gap: 10 }}>
                {displayed.some(n => !n.read) && (
                  <button onClick={markAllRead} style={{ padding: "7px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, background: "transparent", fontSize: 12.5, color: C.blue, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#EEF4FF"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >✓ Mark all read</button>
                )}
                <button onClick={clearAll} style={{ padding: "7px 14px", borderRadius: 10, border: "1.5px solid #FECACA", background: "transparent", fontSize: 12.5, color: "#DC2626", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >✕ Clear {filter !== "all" ? TYPE_META[filter].label : "All"}</button>
              </div>
            </div>
          )}

          {/* Notification cards */}
          {displayed.length === 0 ? (
            <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "60px 24px", textAlign: "center" }}>
              <p style={{ fontSize: 48, marginBottom: 14 }}>🔔</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6 }}>You're all caught up!</p>
              <p style={{ fontSize: 13.5, color: C.muted }}>No {filter !== "all" ? TYPE_META[filter]?.label.toLowerCase() + " " : ""}notifications right now.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {displayed.map(notif => {
                const meta = TYPE_META[notif.type];
                return (
                  <div
                    key={notif.id}
                    onClick={() => !notif.read && markRead(notif.id)}
                    style={{
                      background: notif.read ? C.card : "#FAFCFF",
                      borderRadius: 16, border: `1px solid ${notif.read ? C.border : "rgba(26,115,232,0.15)"}`,
                      padding: "16px 18px", display: "flex", gap: 14, alignItems: "flex-start",
                      cursor: notif.read ? "default" : "pointer",
                      transition: "all 0.15s", position: "relative",
                      boxShadow: notif.read ? "none" : "0 2px 12px rgba(26,115,232,0.06)",
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = C.shadow; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = notif.read ? "none" : "0 2px 12px rgba(26,115,232,0.06)"; }}
                  >
                    {/* Unread dot */}
                    {!notif.read && (
                      <div style={{ position: "absolute", top: 16, right: 14, width: 8, height: 8, borderRadius: "50%", background: C.blue }} />
                    )}

                    {/* Icon */}
                    <div style={{ width: 44, height: 44, borderRadius: 13, background: notif.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: notif.iconColor, flexShrink: 0 }}>
                      {notif.icon}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <p style={{ fontSize: 14, fontWeight: notif.read ? 600 : 700, color: C.text }}>{notif.title}</p>
                        <span style={{ fontSize: 10.5, fontWeight: 600, padding: "2px 7px", borderRadius: 6, background: meta?.bg, color: meta?.color, border: `1px solid ${meta?.border}`, flexShrink: 0 }}>
                          {meta?.label}
                        </span>
                      </div>
                      <p style={{ fontSize: 13, color: C.sub, lineHeight: 1.55, marginBottom: 8 }}>{notif.message}</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 11.5, color: C.muted }}>{fmtDate(notif.date)}</span>
                        {!notif.read && <span style={{ fontSize: 11.5, color: C.blue, fontWeight: 600 }}>• Tap to mark read</span>}
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      onClick={e => { e.stopPropagation(); deleteNotif(notif.id); }}
                      style={{ width: 28, height: 28, borderRadius: 8, background: "transparent", border: `1px solid ${C.border}`, color: C.muted, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, flexShrink: 0, transition: "all 0.15s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#FEF2F2"; (e.currentTarget as HTMLElement).style.borderColor = "#FECACA"; (e.currentTarget as HTMLElement).style.color = "#DC2626"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.muted; }}
                    >✕</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ═══ Right — Summary panel ═══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

          {/* Summary */}
          <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "20px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>Summary</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: C.sub }}>Total</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{state.notifications.length}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 13, color: C.sub }}>Unread</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: unreadTotal > 0 ? "#DC2626" : "#059669" }}>{unreadTotal}</span>
              </div>
              <div style={{ width: "100%", height: 6, background: C.bg, borderRadius: 99, overflow: "hidden" }}>
                <div style={{ height: "100%", width: state.notifications.length ? `${(unreadTotal / state.notifications.length) * 100}%` : "0%", background: unreadTotal > 0 ? "#EF4444" : "#4ADE80", borderRadius: 99, transition: "width 0.4s ease" }} />
              </div>
              <p style={{ fontSize: 11.5, color: C.muted }}>{state.notifications.length - unreadTotal} of {state.notifications.length} read</p>
            </div>
          </div>

          {/* Category breakdown */}
          <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "20px" }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 16 }}>By Category</h3>
            {(["transaction", "security", "account", "promo"] as const).map(type => {
              const meta = TYPE_META[type];
              const count = filterCounts[type];
              return (
                <div key={type} onClick={() => setFilter(type)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 12, cursor: "pointer", marginBottom: 6, transition: "background 0.12s", background: filter === type ? `${meta.bg}` : "transparent", border: `1px solid ${filter === type ? meta.border : "transparent"}` }}
                  onMouseEnter={e => { if (filter !== type) (e.currentTarget as HTMLElement).style.background = C.bg; }}
                  onMouseLeave={e => { if (filter !== type) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <div style={{ width: 32, height: 32, borderRadius: 9, background: meta.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>
                    {type === "transaction" ? "↕" : type === "security" ? "🔐" : type === "account" ? "◫" : "🎁"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{meta.label}</p>
                  </div>
                  <span style={{ fontSize: 13.5, fontWeight: 700, color: meta.color }}>{count}</span>
                </div>
              );
            })}
          </div>

          {/* Notification prefs link */}
          <div style={{ background: "linear-gradient(135deg,#1A73E8,#1558b0)", borderRadius: 16, padding: "20px" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>Notification Settings</p>
            <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.7)", marginBottom: 16 }}>Manage which alerts you receive and how.</p>
            <a href="/dashboard/settings" style={{ display: "inline-block", padding: "8px 16px", borderRadius: 10, background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)", color: "#fff", fontSize: 12.5, fontWeight: 600, textDecoration: "none", transition: "background 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.25)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.15)"; }}
            >Open Settings →</a>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideIn { from { opacity:0; transform: translateX(20px); } to { opacity:1; transform: translateX(0); } }
        @media (max-width: 900px) {
          .notif-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}
