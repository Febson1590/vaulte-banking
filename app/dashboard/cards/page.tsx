"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getState, saveState, VaulteState, DEFAULT_STATE, getCurrentUser, fmtDate } from "@/lib/vaulteState";

const C = {
  bg: "#F3F5FA", card: "#ffffff", navy: "#0F172A", blue: "#1A73E8",
  border: "rgba(15,23,42,0.07)", muted: "#94A3B8", text: "#0F172A", sub: "#64748B",
  shadow: "0 1px 3px rgba(15,23,42,0.05), 0 6px 20px rgba(15,23,42,0.07)",
  shadowHv: "0 2px 8px rgba(15,23,42,0.06), 0 14px 36px rgba(15,23,42,0.10)",
} as const;

// Card display helpers — derived from state.card (no hardcoded values)
function genCardFull(): string {
  const r = () => Math.floor(1000 + Math.random() * 9000).toString();
  const last4 = r();
  return `4532 ${r()} ${r()} ${last4}`;
}
function maskCard(full: string): string {
  const p = full.replace(/\s/g, "");
  return `${p.slice(0,4)} •••• •••• ${p.slice(12)}`;
}
function genExpiry(): string {
  const d = new Date();
  const m = (d.getMonth() + 1).toString().padStart(2, "0");
  const y = (d.getFullYear() + 3).toString().slice(2);
  return `${m}/${y}`;
}
function genCvv(): string {
  return Math.floor(100 + Math.random() * 900).toString();
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} style={{
      width: 46, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
      background: on ? C.blue : "#E2E8F0", position: "relative", transition: "background 0.25s", flexShrink: 0,
    }}>
      <span style={{ position: "absolute", top: 3, left: on ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "#fff", boxShadow: "0 1px 4px rgba(15,23,42,0.2)", transition: "left 0.25s" }} />
    </button>
  );
}

export default function CardsPage() {
  const [state, setState] = useState<VaulteState>(DEFAULT_STATE);
  const [showNumber, setShowNumber] = useState(false);
  const [copied, setCopied]         = useState(false);
  const [toast, setToast]           = useState<string | null>(null);
  const [limitModal, setLimitModal] = useState(false);
  const [newLimit, setNewLimit]     = useState("");
  const [requestSent, setRequestSent] = useState(false);
  const [reportSent, setReportSent]   = useState(false);

  useEffect(() => { setState(getState()); }, []);

  const { card }  = state;
  const user      = getCurrentUser();
  const firstName = user?.firstName ?? state.profile.firstName;
  const lastName  = user?.lastName  ?? state.profile.lastName;

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const updateCard = (patch: Partial<typeof card>) => {
    const newState = { ...state, card: { ...card, ...patch } };
    setState(newState);
    saveState(newState);
  };

  const handleFreeze = () => {
    updateCard({ frozen: !card.frozen });
    showToast(card.frozen ? "Card unfrozen — ready to use." : "Card frozen — all transactions blocked.");
  };

  const copyNumber = () => {
    const num = (card.cardNumberFull ?? card.cardNumber ?? "").replace(/\s/g, "");
    navigator.clipboard.writeText(num).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSetLimit = () => {
    const n = parseFloat(newLimit);
    if (!isNaN(n) && n > 0) {
      updateCard({ spendingLimit: n });
      showToast(`Spending limit updated to $${n.toLocaleString()}`);
      setLimitModal(false);
      setNewLimit("");
    }
  };

  const usedPct = Math.min((card.spentThisMonth / card.spendingLimit) * 100, 100);
  const barColor = usedPct > 85 ? "#EF4444" : usedPct > 60 ? "#F59E0B" : C.blue;

  const cardTxns = state.transactions.slice(0, 6);

  return (
    <DashboardLayout title="My Cards" subtitle="Virtual &amp; physical card management">

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 88, right: 32, zIndex: 999, background: C.navy, color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 13.5, fontWeight: 500, boxShadow: "0 8px 24px rgba(15,23,42,0.25)", display: "flex", alignItems: "center", gap: 10, animation: "slideIn 0.25s ease" }}>
          <span style={{ color: "#4ADE80" }}>✓</span> {toast}
        </div>
      )}

      {/* ─── No card issued empty state ─── */}
      {!card.issued && (
        <div style={{ maxWidth: 560, margin: "40px auto", textAlign: "center" }}>
          <div style={{ background: C.card, borderRadius: 24, padding: "48px 40px", border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
            {/* Card visual */}
            <div style={{ width: 200, height: 126, borderRadius: 16, background: "linear-gradient(135deg,#1e40af,#0F172A)", margin: "0 auto 28px", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", boxShadow: "0 8px 24px rgba(30,64,175,0.2)" }}>
              <div style={{ position: "absolute", top: -30, right: -30, width: 100, height: 100, borderRadius: "50%", background: "rgba(255,255,255,0.04)" }} />
              <div style={{ textAlign: "center" }}>
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 8 }}>Vaulte</p>
                <p style={{ fontSize: 26, color: "rgba(255,255,255,0.15)", fontFamily: "monospace", letterSpacing: "0.1em" }}>•••• •••• •••• ••••</p>
              </div>
            </div>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 8, letterSpacing: "-0.3px" }}>No Card Issued Yet</h2>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.7, marginBottom: 28 }}>
              Complete your identity verification (KYC) to request your Vaulte virtual card.
              Once approved, your card will be issued and ready to use instantly.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {user?.kycStatus === "verified" ? (
                <button onClick={() => { const full = genCardFull(); updateCard({ issued: true, spendingLimit: 2000, onlinePayments: true, contactless: true, internationalTxns: true, cardNumberFull: full, cardNumber: maskCard(full), expiry: genExpiry(), cvv: genCvv(), issuedAt: new Date().toISOString() }); showToast("Your Vaulte Virtual Card has been issued! 🎉"); }}
                  style={{ padding: "13px 28px", borderRadius: 12, background: `linear-gradient(135deg, ${C.blue}, #1558b0)`, border: "none", color: "#fff", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(26,115,232,0.3)" }}>
                  🎉 Issue My Virtual Card
                </button>
              ) : (
                <>
                  <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, padding: "14px 18px" }}>
                    <p style={{ fontSize: 13, color: "#991B1B", fontWeight: 600 }}>
                      {user?.kycStatus === "pending" ? "⏳ Your KYC is under review. Card will be issued upon approval." : "🔒 Complete KYC verification to unlock card issuance."}
                    </p>
                  </div>
                  <a href="/dashboard/settings" style={{ padding: "13px 28px", borderRadius: 12, background: C.blue, border: "none", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", textDecoration: "none", display: "inline-block" }}>
                    Go to Verification →
                  </a>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── Card management UI (only shown when card is issued) ─── */}
      {card.issued && (<>

      {/* Limit modal */}
      {limitModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 998, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ background: C.card, borderRadius: 20, padding: "32px 28px", width: 360, boxShadow: "0 24px 64px rgba(15,23,42,0.28)", border: `1px solid ${C.border}` }}>
            <p style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 6, letterSpacing: "-0.2px" }}>Set Spending Limit</p>
            <p style={{ fontSize: 13, color: C.muted, marginBottom: 20 }}>Current limit: ${card.spendingLimit.toLocaleString()}/month</p>
            <div style={{ position: "relative", marginBottom: 20 }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18, fontWeight: 600, color: C.muted }}>$</span>
              <input type="number" value={newLimit} onChange={e => setNewLimit(e.target.value)} placeholder="Enter new limit"
                style={{ width: "100%", padding: "12px 14px 12px 32px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 16, fontWeight: 700, color: C.text, outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
                onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.08)"; }}
                onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; }}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button onClick={() => { setLimitModal(false); setNewLimit(""); }} style={{ flex: 1, padding: "12px", borderRadius: 12, border: `1px solid ${C.border}`, background: "transparent", color: C.sub, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
              <button onClick={handleSetLimit} style={{ flex: 1, padding: "12px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#1A73E8,#1558b0)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(26,115,232,0.28)" }}>Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="cards-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 24, alignItems: "start" }}>

        {/* ═══ Left column ═══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Card display + actions */}
          <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "28px 28px 24px" }}>
            <div className="cards-top-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28, alignItems: "center" }}>

              {/* Virtual card visual */}
              <div style={{
                background: card.frozen
                  ? "linear-gradient(135deg,#374151,#1f2937,#111827)"
                  : "linear-gradient(135deg,#1e40af,#1e3a8a,#0F172A)",
                borderRadius: 20, padding: "22px 20px",
                boxShadow: card.frozen
                  ? "0 8px 28px rgba(55,65,81,0.35)"
                  : "0 8px 32px rgba(30,64,175,0.32), 0 0 0 1px rgba(255,255,255,0.06)",
                position: "relative", overflow: "hidden",
                transition: "all 0.5s ease",
                filter: card.frozen ? "grayscale(0.4) brightness(0.8)" : "none",
              }}>
                <div style={{ position: "absolute", top: -50, right: -50, width: 180, height: 180, borderRadius: "50%", background: "rgba(255,255,255,0.035)", pointerEvents: "none" }} />
                <div style={{ position: "absolute", bottom: -60, left: -30, width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,0.025)", pointerEvents: "none" }} />

                {/* Frozen overlay */}
                {card.frozen && (
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.15)", borderRadius: 20, zIndex: 2 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ fontSize: 28, marginBottom: 4 }}>❄</div>
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.85)", fontWeight: 700, letterSpacing: "0.08em" }}>CARD FROZEN</p>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, position: "relative", zIndex: 1 }}>
                  <div>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.38)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.16em", marginBottom: 4 }}>Vaulte</p>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.82)", fontWeight: 500 }}>Premium Card</p>
                  </div>
                  <div style={{ display: "flex" }}>
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#EF4444", opacity: 0.82 }} />
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#F59E0B", opacity: 0.82, marginLeft: -11 }} />
                  </div>
                </div>

                <div style={{ width: 36, height: 26, borderRadius: 5, marginBottom: 16, background: "linear-gradient(135deg,#B45309,#FBBF24,#B45309)", boxShadow: "inset 0 1px 3px rgba(255,255,255,0.3),0 2px 6px rgba(0,0,0,0.28)", position: "relative", zIndex: 1 }}>
                  <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 1, background: "rgba(100,50,0,0.22)", transform: "translateX(-50%)" }} />
                  <div style={{ position: "absolute", top: "50%", left: 0, right: 0, height: 1, background: "rgba(100,50,0,0.22)", transform: "translateY(-50%)" }} />
                </div>

                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.65)", letterSpacing: "0.22em", marginBottom: 20, fontFamily: "monospace", position: "relative", zIndex: 1 }}>
                  {showNumber ? (card.cardNumberFull ?? card.cardNumber ?? "•••• •••• •••• ••••") : (card.cardNumber ?? "•••• •••• •••• ••••")}
                </p>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", position: "relative", zIndex: 1 }}>
                  <div>
                    <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.32)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 5 }}>Card Holder</p>
                    <p style={{ fontSize: 14, color: "#fff", fontWeight: 600, letterSpacing: "0.04em" }}>{firstName} {lastName}</p>
                  </div>
                  <div style={{ display: "flex", gap: 18, alignItems: "flex-end" }}>
                    {showNumber && (
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.32)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 5 }}>CVV</p>
                        <p style={{ fontSize: 14, color: "#fff", fontWeight: 600, fontFamily: "monospace" }}>{card.cvv ?? "•••"}</p>
                      </div>
                    )}
                    <div style={{ textAlign: "right" }}>
                      <p style={{ fontSize: 9.5, color: "rgba(255,255,255,0.32)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 5 }}>Expires</p>
                      <p style={{ fontSize: 14, color: "#fff", fontWeight: 600 }}>{card.expiry ?? "—/——"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick actions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {/* Freeze toggle */}
                <button onClick={handleFreeze} style={{
                  display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14,
                  border: card.frozen ? "1.5px solid #BFDBFE" : `1px solid ${C.border}`,
                  background: card.frozen ? "#EFF6FF" : "#FAFBFC",
                  cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "all 0.2s",
                }}>
                  <span style={{ fontSize: 20 }}>{card.frozen ? "🔓" : "🔒"}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: card.frozen ? C.blue : C.text }}>{card.frozen ? "Unfreeze Card" : "Freeze Card"}</p>
                    <p style={{ fontSize: 11.5, color: C.muted }}>{card.frozen ? "Allow transactions" : "Block all transactions"}</p>
                  </div>
                </button>

                {/* Show/hide number */}
                <button onClick={() => setShowNumber(s => !s)} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, border: `1px solid ${C.border}`, background: "#FAFBFC", cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "background 0.15s" }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.bg}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#FAFBFC"}
                >
                  <span style={{ fontSize: 20 }}>{showNumber ? "🙈" : "👁"}</span>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{showNumber ? "Hide Number" : "Show Number"}</p>
                    <p style={{ fontSize: 11.5, color: C.muted }}>Reveal full card number</p>
                  </div>
                </button>

                {/* Copy number */}
                <button onClick={copyNumber} style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 14, border: `1px solid ${copied ? "#A7F3D0" : C.border}`, background: copied ? "#ECFDF5" : "#FAFBFC", cursor: "pointer", fontFamily: "inherit", textAlign: "left", transition: "all 0.2s" }}>
                  <span style={{ fontSize: 20 }}>{copied ? "✓" : "📋"}</span>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: copied ? "#059669" : C.text }}>{copied ? "Copied!" : "Copy Number"}</p>
                    <p style={{ fontSize: 11.5, color: C.muted }}>Copy to clipboard</p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Spending limit */}
          <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "24px 26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: "-0.2px" }}>Monthly Spending Limit</p>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>Resets on the 1st of each month</p>
              </div>
              <button onClick={() => setLimitModal(true)} style={{ padding: "7px 14px", borderRadius: 10, border: `1px solid ${C.border}`, background: "#FAFBFC", color: C.sub, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.bg}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#FAFBFC"}
              >Adjust Limit</button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 12 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: "-1px" }}>${card.spentThisMonth.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
              <span style={{ fontSize: 14, color: C.muted }}>of ${card.spendingLimit.toLocaleString()} limit</span>
            </div>

            <div style={{ height: 10, background: C.bg, borderRadius: 10, overflow: "hidden", marginBottom: 10, border: `1px solid ${C.border}` }}>
              <div style={{ height: "100%", width: `${usedPct}%`, background: barColor, borderRadius: 10, transition: "width 0.6s ease, background 0.3s" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ fontSize: 12, color: C.muted }}>{usedPct.toFixed(0)}% used</span>
              <span style={{ fontSize: 12, color: usedPct > 85 ? "#EF4444" : C.muted }}>${(card.spendingLimit - card.spentThisMonth).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} remaining</span>
            </div>
          </div>

          {/* Card transactions */}
          <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "24px 26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: "-0.2px" }}>Card Transactions</p>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>This month</p>
              </div>
            </div>
            {cardTxns.map((tx, i) => (
              <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 10px", margin: "0 -10px", borderBottom: i < cardTxns.length - 1 ? `1px solid ${C.border}` : "none", borderRadius: 12, cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.bg}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 13, background: tx.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17, color: tx.iconColor, flexShrink: 0, boxShadow: "0 2px 6px rgba(15,23,42,0.08)" }}>{tx.icon}</div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{tx.name}</p>
                      <span style={{ fontSize: 10.5, fontWeight: 600, color: tx.badgeColor, background: tx.badgeBg, border: `1px solid ${tx.badgeBorder}`, borderRadius: 5, padding: "1px 6px" }}>{tx.badge}</span>
                    </div>
                    <p style={{ fontSize: 11.5, color: C.muted }}>{tx.sub} · {fmtDate(tx.date)}</p>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: tx.type === "credit" ? "#059669" : C.text }}>{tx.type === "credit" ? "+" : "−"}${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 2 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 0 2px rgba(34,197,94,0.18)" }} />
                    <p style={{ fontSize: 11, color: C.muted }}>Completed</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ Right column ═══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Card settings toggles */}
          <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "22px 20px" }}>
            <p style={{ fontSize: 14.5, fontWeight: 700, color: C.text, marginBottom: 18, letterSpacing: "-0.2px" }}>Card Settings</p>
            {[
              { label: "Online Payments",        sub: "E-commerce & subscriptions", key: "onlinePayments" as const },
              { label: "Contactless",             sub: "Tap-to-pay & NFC",           key: "contactless" as const },
              { label: "International Txns",      sub: "Payments outside your region",key: "internationalTxns" as const },
            ].map((s, i, arr) => (
              <div key={s.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div>
                  <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{s.label}</p>
                  <p style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>{s.sub}</p>
                </div>
                <Toggle on={card[s.key]} onChange={() => { updateCard({ [s.key]: !card[s.key] }); showToast(`${s.label} ${!card[s.key] ? "enabled" : "disabled"}.`); }} />
              </div>
            ))}
          </div>

          {/* Card security */}
          <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "22px 20px" }}>
            <p style={{ fontSize: 14.5, fontWeight: 700, color: C.text, marginBottom: 16, letterSpacing: "-0.2px" }}>Card Security</p>
            {[
              { icon: "🛡", label: "3D Secure",      status: "Enabled",  color: "#059669", bg: "#ECFDF5" },
              { icon: "🔑", label: "Card PIN",        status: "Set",      color: "#1A73E8", bg: "#EEF4FF" },
              { icon: "📱", label: "SMS Alerts",      status: "Active",   color: "#059669", bg: "#ECFDF5" },
            ].map((item, i) => (
              <div key={item.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: i < 2 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 16 }}>{item.icon}</span>
                  <span style={{ fontSize: 13.5, fontWeight: 500, color: C.text }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 12, fontWeight: 600, color: item.color, background: item.bg, borderRadius: 20, padding: "3px 10px" }}>{item.status}</span>
              </div>
            ))}
          </div>

          {/* Physical card + report */}
          <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "22px 20px" }}>
            <p style={{ fontSize: 14.5, fontWeight: 700, color: C.text, marginBottom: 14, letterSpacing: "-0.2px" }}>Physical Card</p>
            <p style={{ fontSize: 12.5, color: C.muted, marginBottom: 16 }}>Get a physical Vaulte card delivered to your address.</p>
            <button onClick={() => { setRequestSent(true); showToast("Physical card request submitted!"); }} style={{ width: "100%", padding: "12px", borderRadius: 12, border: `1px solid ${C.border}`, background: requestSent ? "#ECFDF5" : "#FAFBFC", color: requestSent ? "#059669" : C.sub, fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: 10, transition: "all 0.2s" }}>
              {requestSent ? "✓ Request Submitted" : "Request Physical Card"}
            </button>
            <button onClick={() => { setReportSent(true); showToast("Card reported. A new card will be issued within 3-5 days."); }} style={{ width: "100%", padding: "12px", borderRadius: 12, border: "1px solid #FECACA", background: reportSent ? "#FEF2F2" : "transparent", color: reportSent ? "#DC2626" : "#EF4444", fontSize: 13.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s" }}>
              {reportSent ? "✓ Card Reported" : "Report Lost / Stolen"}
            </button>
          </div>
        </div>
      </div>

      </>)}
      {/* ─── End of issued-card UI ─── */}

      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @media (max-width: 900px) {
          .cards-main-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .cards-top-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}
