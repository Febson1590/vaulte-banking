"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getState, getCurrentUser, VaulteState, DEMO_STATE, Transaction, fmtDate, VaulteUser } from "@/lib/vaulteState";
import { normalizeKyc, KYC_UI } from "@/lib/kycUtils";

const C = {
  bg: "#F3F5FA", card: "#ffffff", navy: "#0F172A", blue: "#1A73E8",
  border: "rgba(15,23,42,0.07)", muted: "#94A3B8", text: "#0F172A", sub: "#64748B",
  shadow: "0 1px 3px rgba(15,23,42,0.05), 0 6px 20px rgba(15,23,42,0.07)",
  shadowHv: "0 2px 8px rgba(15,23,42,0.06), 0 14px 36px rgba(15,23,42,0.10)",
} as const;


const tabs = ["Dashboard", "Accounts", "Transfers", "Cards", "Help"];
const tabLinks: Record<string, string> = {
  Dashboard: "/dashboard", Accounts: "/dashboard/accounts",
  Transfers: "/dashboard/transfer", Cards: "/dashboard/cards", Help: "/help",
};

const card = (extra: React.CSSProperties = {}): React.CSSProperties => ({
  background: C.card, borderRadius: 20, border: `1px solid ${C.border}`,
  boxShadow: C.shadow, transition: "box-shadow 0.22s ease, transform 0.22s ease", ...extra,
});

export default function Dashboard() {
  const router = useRouter();
  const [state,      setState]      = useState<VaulteState>(DEMO_STATE);
  const [currentUser, setUser]      = useState<VaulteUser | null>(null);
  const [activeTab,  setActiveTab]  = useState("Dashboard");
  const [mounted,    setMounted]    = useState(false);
  const [period, setPeriod] = useState<"7D" | "1M" | "3M">("7D");

  useEffect(() => {
    // DashboardLayout has already hydrated localStorage from Redis before this
    // component mounts. getCurrentUser() returns the server-authoritative user
    // (including the correct KYC status). No additional reconciliation needed.
    const user = getCurrentUser();
    if (user) setUser(user);
    setState(getState());
    setMounted(true);
  }, []);

  const liftCard = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.boxShadow = C.shadowHv; e.currentTarget.style.transform = "translateY(-2px)"; };
  const dropCard = (e: React.MouseEvent<HTMLElement>) => { e.currentTarget.style.boxShadow = C.shadow;   e.currentTarget.style.transform = "translateY(0)"; };

  const totalUSD = state.accounts.reduce((s, a) => {
    const rates: Record<string, number> = { USD: 1, EUR: 1.09, GBP: 1.27, BTC: 66000 };
    return s + a.balance * (rates[a.currency] ?? 1);
  }, 0);

  const recentTxns  = state.transactions.slice(0, 3);
  const kycStatus   = currentUser?.kycStatus ?? "unverified";
  const firstName   = currentUser?.firstName ?? state.profile.firstName;
  const lastName    = currentUser?.lastName  ?? state.profile.lastName;
  const isVerified  = kycStatus === "verified";

  // ── Centralized KYC state — single source of truth for all UI ────────────
  // nKyc is "not_started" until mounted (prevents stale state flash before
  // DashboardLayout hydration writes the real user to localStorage).
  const nKyc = mounted ? normalizeKyc(kycStatus) : "not_started";
  const kyc  = KYC_UI[nKyc];

  // ── Period helpers ────────────────────────────────────────────────────────
  const periodDays   = period === "7D" ? 7 : period === "1M" ? 30 : 90;
  const periodLabel  = period === "7D" ? "Last 7 days" : period === "1M" ? "Last 30 days" : "Last 3 months";
  const periodCutoff = (() => {
    const d = new Date(); d.setTime(d.getTime() - periodDays * 86_400_000); return d;
  })();

  // Transactions that fall within the selected period
  const periodTxns = state.transactions.filter(t => new Date(t.date) >= periodCutoff);

  // Chart: always 7 bars regardless of period; bucket width scales with period
  const BARS = 7;
  const msPer = periodDays * 86_400_000 / BARS;          // ms per bar
  const chartData = (() => {
    const now = Date.now();
    return Array.from({ length: BARS }, (_, i) => {
      const barEnd   = now - (BARS - 1 - i) * msPer;
      const barStart = barEnd - msPer;
      const barTxns  = state.transactions.filter(t => {
        const ms = new Date(t.date).getTime();
        return ms >= barStart && ms < barEnd;
      });
      // Label: day name for 7D, date for longer periods
      let label: string;
      if (period === "7D") {
        const d = new Date(now - (BARS - 1 - i) * 86_400_000);
        label = d.toLocaleDateString("en-US", { weekday: "short" });
      } else {
        const mid = new Date((barStart + barEnd) / 2);
        label = mid.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      }
      return {
        day:      label,
        amount:   barTxns.filter(t => t.type === "debit") .reduce((s, t) => s + t.amount, 0),
        income:   barTxns.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0),
        isLatest: i === BARS - 1,
      };
    });
  })();
  const maxSpend = Math.max(...chartData.map(d => Math.max(d.amount, d.income)), 1);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
    if (tab !== "Dashboard") router.push(tabLinks[tab]);
  };

  return (
    <DashboardLayout
      title="Dashboard"
      subtitle={mounted ? new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" }) : ""}
    >
      {/* ── KYC Banner — driven entirely by KYC_UI[nKyc] ── */}
      {mounted && nKyc !== "approved" && kyc.bannerTitle && (
        <div style={{
          background: kyc.bannerBg, border: `1px solid ${kyc.bannerBorder}`,
          borderRadius: 16, padding: "16px 20px", marginBottom: 20,
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 13, background: kyc.bannerIconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
              {kyc.bannerIcon}
            </div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: kyc.bannerTitleC, marginBottom: 3 }}>{kyc.bannerTitle}</p>
              <p style={{ fontSize: 13, color: kyc.bannerBodyC }}>{kyc.bannerBody}</p>
            </div>
          </div>
          {kyc.ctaLabel && kyc.ctaHref && (
            <Link href={kyc.ctaHref} style={{
              padding: "9px 20px", borderRadius: 10, background: kyc.ctaBg,
              color: "#fff", fontSize: 13.5, fontWeight: 700, textDecoration: "none",
              flexShrink: 0, transition: "background 0.15s",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = kyc.ctaBgHover; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = kyc.ctaBg; }}
            >{kyc.ctaLabel}</Link>
          )}
        </div>
      )}

      {/* Tab nav */}
      <div className="dash-tabs" style={{ background: "#fff", borderBottom: `1px solid ${C.border}`, display: "flex", margin: "-28px -32px 28px", paddingLeft: 32, overflowX: "auto", WebkitOverflowScrolling: "touch" as React.CSSProperties["WebkitOverflowScrolling"] }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => handleTabClick(tab)} style={{
            padding: "13px 18px", background: "none", border: "none", cursor: "pointer",
            fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
            color: activeTab === tab ? C.blue : C.muted,
            borderBottom: activeTab === tab ? `2px solid ${C.blue}` : "2px solid transparent",
            transition: "color 0.15s, border-color 0.15s", fontFamily: "inherit",
            marginBottom: "-1px", letterSpacing: "0.01em",
          }}>{tab}</button>
        ))}
      </div>

      {/* Welcome banner */}
      <div className="dash-welcome" style={{
        background: "linear-gradient(135deg,#EBF3FF 0%,#EEF6FF 60%,#ECF2FF 100%)",
        borderRadius: 20, padding: "26px 32px", marginBottom: 24,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        position: "relative", overflow: "hidden",
        border: "1px solid rgba(219,234,254,0.9)",
        boxShadow: "0 4px 20px rgba(26,115,232,0.06), 0 1px 3px rgba(26,115,232,0.04)",
      }}>
        <div style={{ position: "absolute", right: 0, top: 0, bottom: 0, width: "55%", background: "radial-gradient(ellipse at 75% 50%,rgba(26,115,232,0.07) 0%,transparent 70%)", pointerEvents: "none" }} />
        <div style={{ position: "relative" }}>
          {/* Status chip — only rendered after mount so we never show stale state */}
          {mounted && (
            <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 8 }}>
              <div style={{
                width: 7, height: 7, borderRadius: "50%",
                background: kyc.dotColor,
                boxShadow: `0 0 0 3px ${kyc.dotRing}`,
              }} />
              <span style={{ fontSize: 12, color: C.sub, fontWeight: 500 }}>{kyc.chipLabel}</span>
            </div>
          )}
          <h1 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6, letterSpacing: "-0.5px" }}>
            Welcome back, {firstName} {lastName} 👋
          </h1>
          {/* Subtitle — gated by mounted to avoid "unverified" flash before hydration */}
          <p style={{ fontSize: 13.5, color: C.sub }}>
            {mounted ? kyc.subtitle : ""}
          </p>
        </div>
        {/* Phone mockup */}
        <div className="dash-phone-wrap" style={{ position: "relative", flexShrink: 0 }}>
          <div style={{ position: "absolute", top: -14, right: 124, fontSize: 26, filter: "drop-shadow(0 6px 12px rgba(245,158,11,0.35))", transform: "rotate(8deg)", pointerEvents: "none" }}>🪙</div>
          <div style={{ position: "absolute", bottom: -10, left: -38, width: 76, height: 48, background: "linear-gradient(135deg,#1A73E8,#0F172A)", borderRadius: 9, transform: "rotate(-6deg)", boxShadow: "0 6px 16px rgba(26,115,232,0.28)" }} />
          <div style={{ width: 110, height: 198, background: "#0F172A", borderRadius: 24, border: "5px solid #0F172A", boxShadow: "0 24px 48px rgba(15,23,42,0.28)", position: "relative", overflow: "hidden", zIndex: 1 }}>
            <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 34, height: 7, background: "#0F172A", borderRadius: "0 0 6px 6px", zIndex: 5 }} />
            <div style={{ background: "linear-gradient(160deg,#1A73E8 0%,#0c2d7a 100%)", height: "100%", padding: "14px 9px 9px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <div style={{ width: 11, height: 11, background: "rgba(255,255,255,0.2)", borderRadius: 3 }} />
                <span style={{ fontSize: 7, fontWeight: 800, color: "#fff" }}>Vaulte</span>
                <span style={{ fontSize: 7, color: "rgba(255,255,255,0.4)" }}>⚙</span>
              </div>
              <p style={{ fontSize: 7, color: "rgba(255,255,255,0.5)", marginBottom: 1 }}>Balance</p>
              <p style={{ fontSize: 12, fontWeight: 900, color: "#fff", marginBottom: 7 }}>${mounted ? totalUSD.toFixed(2) : "0.00"}</p>
              {state.accounts.slice(0, 3).map((a, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 7, color: "rgba(255,255,255,0.7)" }}>{a.flag} {a.currency === "BTC" ? a.balance.toFixed(3) : a.symbol + a.balance.toFixed(0)}</span>
                  <span style={{ fontSize: 7, fontWeight: 700, color: a.balance > 0 ? "#4ADE80" : "rgba(255,255,255,0.3)" }}>{a.balance > 0 ? "+" : "—"}</span>
                </div>
              ))}
              <div style={{ marginTop: 4, borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 5, display: "flex", justifyContent: "space-around" }}>
                {["⊞","◫","⇄","🛡️"].map((ic,i)=><span key={i} style={{ fontSize: 9, opacity: 0.55 }}>{ic}</span>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 292px", gap: 20, alignItems: "start" }} className="dash-grid">

        {/* ═══ LEFT ═══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Balance + Actions */}
          <div style={card()} onMouseEnter={liftCard} onMouseLeave={dropCard}>
            <div style={{ padding: "26px 28px 28px" }}>
              <p style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>Total Balance</p>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 24 }}>
                <p style={{ fontSize: 42, fontWeight: 800, color: C.text, letterSpacing: "-2px", lineHeight: 1 }}>
                  ${mounted ? totalUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
                </p>
                {totalUSD > 0 && (
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#059669", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 8, padding: "4px 10px", flexShrink: 0 }}>▲ +2.1%</span>
                )}
              </div>

              {/* Balance card lower section:
                  - Before mounted: render nothing (avoids flash with wrong kycStatus)
                  - After mounted, not approved, $0 balance: show kycStatus-aware prompt
                  - Otherwise: show Quick Actions + Holdings grid */}
              {!mounted ? null : nKyc !== "approved" && totalUSD === 0 ? (
                /* KYC-aware empty state — copy driven by KYC_UI[nKyc] */
                <div style={{ background: kyc.balanceBg, border: `1px solid ${kyc.balanceBorder}`, borderRadius: 14, padding: "20px 22px", display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{kyc.balanceIcon}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, color: kyc.balanceTitleC, marginBottom: 4 }}>{kyc.balanceTitle}</p>
                    <p style={{ fontSize: 13, color: kyc.balanceBodyC, lineHeight: 1.6 }}>{kyc.balanceBody}</p>
                    {kyc.balanceCtaLabel && kyc.balanceCtaHref && (
                      <Link href={kyc.balanceCtaHref} style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, padding: "8px 16px", borderRadius: 9, background: kyc.balanceCtaBg, color: "#fff", fontSize: 13, fontWeight: 700, textDecoration: "none", transition: "background 0.15s" }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = kyc.balanceCtaHv; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = kyc.balanceCtaBg; }}
                      >{kyc.balanceCtaLabel}</Link>
                    )}
                  </div>
                </div>
              ) : (
                <div className="dash-balance-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  {/* Action tiles */}
                  <div>
                    <p style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Quick Actions</p>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {[
                        { icon: "↗", label: "Send",     color: "#1A73E8", bg: "#EEF4FF", shadowC: "rgba(26,115,232,0.2)",  href: "/dashboard/transfer" },
                        { icon: "↙", label: "Request",  color: "#7C3AED", bg: "#F5F3FF", shadowC: "rgba(124,58,237,0.2)",  href: "/dashboard/transfer" },
                        { icon: "⇄", label: "Exchange", color: "#059669", bg: "#ECFDF5", shadowC: "rgba(5,150,105,0.2)",   href: "/dashboard/exchange" },
                        { icon: "＋", label: "Add",      color: "#D97706", bg: "#FFFBEB", shadowC: "rgba(217,119,6,0.2)",   href: "/dashboard/accounts" },
                      ].map(a => (
                        <Link key={a.label} href={a.href} style={{
                          padding: "15px 8px", borderRadius: 16, border: `1px solid ${C.border}`,
                          background: "#FAFBFC", cursor: "pointer",
                          display: "flex", flexDirection: "column", alignItems: "center", gap: 9,
                          transition: "all 0.2s ease", textDecoration: "none",
                        }}
                          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = a.bg; el.style.borderColor = "transparent"; el.style.transform = "translateY(-3px)"; el.style.boxShadow = `0 8px 20px ${a.shadowC}`; }}
                          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#FAFBFC"; el.style.borderColor = C.border; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}
                        >
                          <div style={{ width: 40, height: 40, borderRadius: 13, background: a.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: a.color, fontWeight: 700, boxShadow: `0 2px 8px ${a.shadowC}` }}>{a.icon}</div>
                          <span style={{ fontSize: 12, fontWeight: 600, color: C.sub, letterSpacing: "0.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "100%" }}>{a.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Holdings */}
                  <div style={{ borderLeft: `1px solid ${C.border}`, paddingLeft: 24 }}>
                    <p style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Holdings</p>
                    {state.accounts.map((acc, i) => (
                      <div key={acc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < state.accounts.length - 1 ? `1px solid ${C.border}` : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 18, lineHeight: 1 }}>{acc.flag}</span>
                          <div>
                            <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text, lineHeight: 1.25 }}>
                              {acc.currency === "BTC" ? `${acc.balance.toFixed(4)} BTC` : `${acc.symbol}${acc.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                            </p>
                            {acc.currency === "BTC" && acc.balance > 0 && <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>≈ ${(acc.balance * 66000).toLocaleString("en-US", { maximumFractionDigits: 0 })}</p>}
                          </div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <p style={{ fontSize: 11.5, color: C.sub, fontWeight: 500, marginBottom: 3 }}>{acc.currency}</p>
                          {acc.balance > 0 && <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 6, padding: "1px 6px" }}>+2.1%</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Spending chart */}
          <div style={card()} onMouseEnter={liftCard} onMouseLeave={dropCard}>
            <div style={{ padding: "26px 28px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: "-0.2px", marginBottom: 3 }}>Spending Overview</p>
                  <p style={{ fontSize: 12.5, color: C.muted }}>{periodLabel}</p>
                </div>
                <div style={{ display: "flex", gap: 3, background: C.bg, borderRadius: 10, padding: 3 }}>
                  {(["7D","1M","3M"] as const).map(t => {
                    const active = t === period;
                    return (
                      <button key={t} onClick={() => setPeriod(t)} style={{ padding: "5px 13px", borderRadius: 8, border: "none", background: active ? "#fff" : "transparent", color: active ? C.text : C.muted, fontSize: 12, fontWeight: active ? 700 : 500, cursor: "pointer", fontFamily: "inherit", boxShadow: active ? C.shadow : "none", transition: "all 0.15s" }}>{t}</button>
                    );
                  })}
                </div>
              </div>

              {state.transactions.length === 0 ? (
                /* Empty chart state */
                <div style={{ height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, background: C.bg, borderRadius: 14, border: `1px dashed ${C.border}` }}>
                  <span style={{ fontSize: 32 }}>📊</span>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>No spending data yet</p>
                  <p style={{ fontSize: 12.5, color: C.muted }}>Your chart will appear after your first transaction.</p>
                </div>
              ) : (
                <>
                  {/* ── Spending metric cards — period-filtered, responsive ── */}
                  {(() => {
                    const totalSpent  = periodTxns.filter(t => t.type === "debit") .reduce((s, t) => s + t.amount, 0);
                    const totalIncome = periodTxns.filter(t => t.type === "credit").reduce((s, t) => s + t.amount, 0);
                    const netChange   = totalIncome - totalSpent;
                    const netPos      = netChange >= 0;
                    // Compact formatter: keeps values short on any screen size
                    const fmt = (n: number) => {
                      const abs = Math.abs(n);
                      if (abs >= 1_000_000) return `${(abs / 1_000_000).toFixed(1)}M`;
                      if (abs >= 10_000)    return `${(abs / 1_000).toFixed(1)}k`;
                      return abs.toLocaleString("en-US", { maximumFractionDigits: 0 });
                    };
                    const metrics = [
                      { label: "Spent",   shortLabel: "Spent",  display: `$${fmt(totalSpent)}`,                              color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", trend: "↓", spanFull: false },
                      { label: "Income",  shortLabel: "Income", display: `+$${fmt(totalIncome)}`,                            color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", trend: "↑", spanFull: false },
                      { label: "Net",     shortLabel: "Net",    display: `${netPos ? "+" : "−"}$${fmt(Math.abs(netChange))}`, color: netPos ? "#059669" : "#D97706", bg: netPos ? "#ECFDF5" : "#FFFBEB", border: netPos ? "#A7F3D0" : "#FDE68A", trend: netPos ? "▲" : "▼", spanFull: true },
                    ];
                    return (
                      <div className="spend-metrics-grid" style={{ marginBottom: 24 }}>
                        {metrics.map(m => (
                          <div key={m.label}
                            className={m.spanFull ? "spend-metric-net" : ""}
                            style={{
                              background: m.bg, border: `1px solid ${m.border}`,
                              borderRadius: 12, padding: "11px 13px",
                              display: "flex", flexDirection: "column", gap: 3,
                              minWidth: 0,
                            }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 4 }}>
                              <p style={{ fontSize: 9.5, color: C.muted, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", whiteSpace: "nowrap" as const }}>{m.label}</p>
                              <span style={{ fontSize: 9.5, color: m.color, fontWeight: 700 }}>{m.trend}</span>
                            </div>
                            <p style={{
                              fontSize: 17, fontWeight: 800, color: m.color,
                              letterSpacing: "-0.4px", lineHeight: 1.1,
                              whiteSpace: "nowrap" as const,
                              overflow: "hidden", textOverflow: "ellipsis",
                            }}>{m.display}</p>
                          </div>
                        ))}
                      </div>
                    );
                  })()}

                  <div style={{ position: "relative", height: 160, paddingLeft: 36 }}>
                    {[0,250,500,750,1000].map(v => (
                      <div key={v} style={{ position: "absolute", left: 0, bottom: `${(v / maxSpend) * 130}px`, fontSize: 10, color: C.muted, fontWeight: 500, lineHeight: 1, width: 30, textAlign: "right" }}>{v === 0 ? "" : v >= 1000 ? "1k" : v}</div>
                    ))}
                    {[250,500,750,1000].map(v => (
                      <div key={v} style={{ position: "absolute", left: 36, right: 0, bottom: `${(v / maxSpend) * 130}px`, borderTop: "1px dashed rgba(15,23,42,0.04)" }} />
                    ))}
                    <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: "100%", paddingBottom: 24 }}>
                      {chartData.map((d, i) => {
                        const isLatest = d.isLatest;
                        const barH    = Math.max((d.amount / maxSpend) * 130, d.amount > 0 ? 4 : 0);
                        const incomeH = d.income > 0 ? (d.income / maxSpend) * 130 : 0;
                        return (
                          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative", height: "100%" }}>
                            {incomeH > 0 && <div style={{ position: "absolute", bottom: 24, width: "50%", height: incomeH, background: "linear-gradient(180deg,#34D399,#10B981)", borderRadius: "5px 5px 0 0", opacity: 0.35 }} />}
                            {barH > 0 && <div style={{ position: "absolute", bottom: 24, width: "44%", height: barH, background: isLatest ? "linear-gradient(180deg,#60A5FA,#1A73E8)" : "linear-gradient(180deg,#DBEAFE,#BFDBFE)", borderRadius: "5px 5px 0 0", cursor: "pointer", boxShadow: isLatest ? "0 4px 14px rgba(26,115,232,0.22)" : "none", transition: "opacity 0.18s" }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = "0.72"; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
                            />}
                            <span style={{ position: "absolute", bottom: 4, fontSize: 10.5, fontWeight: isLatest ? 700 : 500, color: isLatest ? C.blue : C.muted }}>{d.day}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 20, marginTop: 10, paddingTop: 14, borderTop: `1px solid ${C.border}` }}>
                    {[{ color: "#1A73E8", label: "Spending" }, { color: "#10B981", label: "Income" }].map(l => (
                      <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                        <div style={{ width: 9, height: 9, borderRadius: 3, background: l.color, opacity: l.color === "#10B981" ? 0.45 : 1 }} />
                        <span style={{ fontSize: 12, color: C.muted, fontWeight: 500 }}>{l.label}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Transactions */}
          <div style={card()} onMouseEnter={liftCard} onMouseLeave={dropCard}>
            <div style={{ padding: "26px 28px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div>
                  <p style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: "-0.2px", marginBottom: 3 }}>Recent Transactions</p>
                  <p style={{ fontSize: 12, color: C.muted }}>{state.transactions.length > 0 ? `${recentTxns.length} recent` : "No transactions yet"}</p>
                </div>
                {state.transactions.length > 0 && (
                  <Link href="/dashboard/transactions" style={{ fontSize: 12.5, color: C.blue, textDecoration: "none", fontWeight: 600, display: "flex", alignItems: "center", gap: 4, padding: "7px 14px", borderRadius: 10, background: "#EEF4FF", border: "1px solid rgba(26,115,232,0.15)", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLAnchorElement).style.background = "#dbeafe"}
                    onMouseLeave={e => (e.currentTarget as HTMLAnchorElement).style.background = "#EEF4FF"}
                  >View all →</Link>
                )}
              </div>

              {recentTxns.length === 0 ? (
                <div style={{ padding: "32px 0", textAlign: "center" }}>
                  <p style={{ fontSize: 40, marginBottom: 12 }}>📭</p>
                  <p style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6 }}>No transactions yet</p>
                  <p style={{ fontSize: 13, color: C.muted, marginBottom: 18 }}>Your transaction history will appear here after you make a transfer or deposit.</p>
                  <Link href="/dashboard/transfer" style={{ padding: "9px 20px", borderRadius: 10, background: C.blue, color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none", display: "inline-block" }}>
                    Make a Transfer
                  </Link>
                </div>
              ) : (
                recentTxns.map((tx: Transaction, i: number) => (
                  <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 12px", margin: "0 -12px", borderBottom: i < recentTxns.length - 1 ? `1px solid ${C.border}` : "none", borderRadius: 14, cursor: "pointer", transition: "background 0.15s" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.bg}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
                  >
                    <div className="tx-left" style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ width: 44, height: 44, borderRadius: 14, background: tx.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18, color: tx.iconColor, flexShrink: 0, boxShadow: "0 2px 8px rgba(15,23,42,0.07)" }}>{tx.icon}</div>
                      <div className="tx-meta">
                        <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 4, minWidth: 0 }}>
                          <p className="tx-name" style={{ fontSize: 14, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 200 }}>{tx.name}</p>
                          <span style={{ fontSize: 10.5, fontWeight: 600, color: tx.badgeColor, background: tx.badgeBg, border: `1px solid ${tx.badgeBorder}`, borderRadius: 6, padding: "2px 7px", flexShrink: 0 }}>{tx.badge}</span>
                        </div>
                        <p style={{ fontSize: 12, color: C.muted }}>{tx.sub} · {fmtDate(tx.date)}</p>
                      </div>
                    </div>
                    <div className="tx-right" style={{ textAlign: "right", flexShrink: 0 }}>
                      <p className="tx-amount" style={{ fontSize: 15, fontWeight: 700, color: tx.type === "credit" ? "#059669" : "#EF4444", letterSpacing: "-0.3px" }}>{tx.type === "credit" ? "+" : "−"}${tx.amount.toFixed(2)}</p>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 3 }}>
                        <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 0 2px rgba(34,197,94,0.18)" }} />
                        <p style={{ fontSize: 11, color: C.muted, fontWeight: 500 }}>Completed</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* ═══ RIGHT ═══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Virtual Card */}
          {state.card.issued ? (
            <Link href="/dashboard/cards" style={{ textDecoration: "none" }}>
              <div style={{ background: "linear-gradient(135deg,#1e40af,#1e3a8a,#0F172A)", borderRadius: 20, padding: "22px 20px", boxShadow: "0 8px 24px rgba(30,64,175,0.24),0 0 0 1px rgba(255,255,255,0.06)", position: "relative", overflow: "hidden", transition: "transform 0.25s ease, box-shadow 0.25s ease", cursor: "pointer" }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 18px 48px rgba(30,64,175,0.35),0 0 0 1px rgba(255,255,255,0.1)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(30,64,175,0.24),0 0 0 1px rgba(255,255,255,0.06)"; }}
              >
                <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.03)", pointerEvents: "none" }} />
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 4 }}>Vaulte</p>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.82)", fontWeight: 500 }}>Premium Card</p>
                  </div>
                  <div style={{ display: "flex" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#EF4444", opacity: 0.82 }} />
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#F59E0B", opacity: 0.82, marginLeft: -11 }} />
                  </div>
                </div>
                <div style={{ width: 36, height: 26, borderRadius: 5, marginBottom: 16, background: "linear-gradient(135deg,#B45309,#FBBF24,#B45309)", boxShadow: "inset 0 1px 3px rgba(255,255,255,0.3),0 2px 6px rgba(0,0,0,0.28)", position: "relative" }}>
                  <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(100,50,0,0.22)", transform: "translateX(-50%)" }} />
                  <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(100,50,0,0.22)", transform: "translateY(-50%)" }} />
                </div>
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", letterSpacing: "0.22em", marginBottom: 20, fontFamily: "monospace" }}>{state.card.cardNumber ?? "•••• •••• •••• ••••"}</p>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
                  <div>
                    <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.32)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 5 }}>Card Holder</p>
                    <p style={{ fontSize: 14, color: "#fff", fontWeight: 600, letterSpacing: "0.04em" }}>{firstName} {lastName}</p>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.32)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 5 }}>Expires</p>
                    <p style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>{state.card.expiry ?? "—/——"}</p>
                  </div>
                </div>
              </div>
            </Link>
          ) : (
            /* No card issued state — message driven by KYC_UI[nKyc] */
            <div style={card({ padding: "22px 20px" })}>
              <p style={{ fontSize: 14.5, fontWeight: 700, color: C.text, letterSpacing: "-0.2px", marginBottom: 4 }}>Virtual Card</p>
              <div style={{ padding: "28px 16px", textAlign: "center" }}>
                <div style={{ width: 64, height: 44, borderRadius: 10, background: C.bg, border: `2px dashed ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 22 }}>💳</div>
                <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text, marginBottom: 6 }}>No Card Issued Yet</p>
                <p style={{ fontSize: 12.5, color: C.muted, marginBottom: 16, lineHeight: 1.6 }}>
                  {mounted ? kyc.cardMsg : ""}
                </p>
                {mounted && kyc.cardCtaHref && kyc.cardCtaLabel && (
                  <Link href={kyc.cardCtaHref} style={{ display: "inline-block", padding: "9px 18px", borderRadius: 10, background: nKyc === "approved" ? C.blue : "#F59E0B", color: "#fff", fontSize: 12.5, fontWeight: 600, textDecoration: "none" }}>
                    {kyc.cardCtaLabel} →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Account Status */}
          <div style={card({ padding: "22px 20px" })} onMouseEnter={e => (e.currentTarget as HTMLElement).style.boxShadow = C.shadowHv} onMouseLeave={e => (e.currentTarget as HTMLElement).style.boxShadow = C.shadow}>
            <p style={{ fontSize: 14.5, fontWeight: 700, color: C.text, letterSpacing: "-0.2px", marginBottom: 16 }}>Account Status</p>
            {[
              {
                label:   "KYC Verification",
                status:  kyc.statusLabel,
                color:   kyc.statusColor,
                bg:      kyc.statusBg,
                dot:     kyc.statusDot,
                dotRing: kyc.statusDotRing,
              },
              {
                label: "2FA Security",
                status: state.preferences.twoFactor ? "Enabled" : "Disabled",
                color: state.preferences.twoFactor ? "#1A73E8" : "#EF4444",
                bg:    state.preferences.twoFactor ? "#EEF4FF" : "#FEF2F2",
                dot:   state.preferences.twoFactor ? "#60A5FA" : "#EF4444",
                dotRing: state.preferences.twoFactor ? "rgba(96,165,250,0.2)" : "rgba(239,68,68,0.2)",
              },
              {
                label: "Card Status",
                status: !state.card.issued ? "No Card Issued" : state.card.frozen ? "Frozen" : "Active",
                color: !state.card.issued ? "#94A3B8" : state.card.frozen ? "#64748B" : "#059669",
                bg:    !state.card.issued ? "#F1F5F9" : state.card.frozen ? "#F1F5F9" : "#ECFDF5",
                dot:   !state.card.issued ? "#CBD5E1" : state.card.frozen ? "#94A3B8" : "#22C55E",
                dotRing: !state.card.issued ? "rgba(203,213,225,0.2)" : state.card.frozen ? "rgba(148,163,184,0.2)" : "rgba(34,197,94,0.2)",
              },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none", gap: 8 }}>
                <span style={{ fontSize: 13, color: C.sub, fontWeight: 400, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0, flex: 1 }}>{item.label}</span>
                <div style={{ display: "flex", alignItems: "center", gap: 6, background: item.bg, borderRadius: 20, padding: "4px 11px" }}>
                  <div style={{ width: 6, height: 6, borderRadius: "50%", background: item.dot, boxShadow: `0 0 0 3px ${item.dotRing}` }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: item.color }}>{item.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }

        /* Spending metric cards — 3-column on desktop, 2+1 on mobile */
        .spend-metrics-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 10px;
        }
        .spend-metric-net { /* Net Change — normal column on desktop */ }

        @media (max-width: 520px) {
          .spend-metrics-grid {
            grid-template-columns: 1fr 1fr;
          }
          /* Net Change spans both columns on small screens */
          .spend-metric-net {
            grid-column: 1 / -1;
          }
        }

        @media (max-width: 900px) { .dash-grid { grid-template-columns: 1fr !important; } }
        @media (max-width: 768px) {
          .dash-tabs { margin: -16px -16px 20px !important; padding-left: 12px !important; }
          .dash-tabs::-webkit-scrollbar { display: none; }
          .dash-welcome { flex-direction: column !important; align-items: flex-start !important; gap: 0 !important; }
          .dash-phone-wrap { display: none !important; }
        }
        @media (max-width: 600px) {
          .dash-balance-grid { grid-template-columns: 1fr !important; }
          .dash-balance-grid > div:nth-child(2) { border-left: none !important; padding-left: 0 !important; border-top: 1px solid rgba(15,23,42,0.07); padding-top: 16px; }
        }
      `}</style>
    </DashboardLayout>
  );
}
