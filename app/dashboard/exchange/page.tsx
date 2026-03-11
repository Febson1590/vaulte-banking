"use client";
import { useState, useEffect, useRef } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import {
  getState, saveState, VaulteState, DEMO_STATE, CROSS_RATES,
  Transaction, genTxId, genRef, fmtAmount, fmtDate,
} from "@/lib/vaulteState";

// ─── Design tokens ────────────────────────────────────────────────────────────
const C = {
  bg:       "#F3F5FA",
  card:     "#ffffff",
  navy:     "#0F172A",
  blue:     "#1A73E8",
  border:   "rgba(15,23,42,0.07)",
  muted:    "#94A3B8",
  text:     "#0F172A",
  sub:      "#64748B",
  green:    "#16A34A",
  shadow:   "0 1px 3px rgba(15,23,42,0.05), 0 6px 20px rgba(15,23,42,0.07)",
} as const;

// ─── Rate helpers ─────────────────────────────────────────────────────────────
function getRate(from: string, to: string): number {
  if (from === to) return 1;
  const key = `${from}-${to}`;
  if (CROSS_RATES[key] !== undefined) return CROSS_RATES[key];
  const USD_RATES: Record<string, number> = { USD: 1, EUR: 1.09, GBP: 1.27, BTC: 66000 };
  return (USD_RATES[from] ?? 1) / (USD_RATES[to] ?? 1);
}

function fmtConverted(amount: number, currency: string, symbol: string): string {
  if (currency === "BTC") return `${amount.toFixed(6)} BTC`;
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

// ─── Live rates table data ────────────────────────────────────────────────────
const RATE_PAIRS = [
  { from: "USD", to: "EUR", up: true,  change: "+0.18%" },
  { from: "USD", to: "GBP", up: false, change: "-0.07%" },
  { from: "EUR", to: "GBP", up: true,  change: "+0.11%" },
  { from: "USD", to: "BTC", up: true,  change: "+1.42%" },
  { from: "EUR", to: "BTC", up: false, change: "-0.33%" },
  { from: "GBP", to: "BTC", up: true,  change: "+0.89%" },
];

type ExchangeStep = "form" | "processing" | "success";

export default function ExchangePage() {
  const [state,          setState]       = useState<VaulteState>(DEMO_STATE);
  const [fromId,         setFromId]      = useState("acc-001");
  const [toId,           setToId]        = useState("acc-002");
  const [amount,         setAmount]      = useState("");
  const [amountErr,      setAmountErr]   = useState("");
  const [step,           setStep]        = useState<ExchangeStep>("form");
  const [txId,           setTxId]        = useState("");
  const [toast,          setToast]       = useState<string | null>(null);
  const [swapRotated,    setSwapRotated] = useState(false);
  const [countdown,      setCountdown]   = useState(30);
  const [showModal,      setShowModal]   = useState(false);
  const [showFeeTooltip, setShowFeeTooltip] = useState(false);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => { setState(getState()); }, []);

  useEffect(() => {
    if (countdownRef.current) clearInterval(countdownRef.current);
    setCountdown(30);
    countdownRef.current = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? 30 : prev - 1));
    }, 1000);
    return () => { if (countdownRef.current) clearInterval(countdownRef.current); };
  }, [fromId, toId, amount]);

  const fromAcc  = state.accounts.find(a => a.id === fromId)!;
  const toAcc    = state.accounts.find(a => a.id === toId)!;
  const num      = parseFloat(amount) || 0;
  const rate     = fromAcc && toAcc ? getRate(fromAcc.currency, toAcc.currency) : 1;
  const toAmount = +(num * rate).toFixed(
    fromAcc?.currency === "BTC" || toAcc?.currency === "BTC" ? 6 : 2
  );

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleSwap = () => {
    setSwapRotated(r => !r);
    setFromId(toId);
    setToId(fromId);
    setAmount("");
    setAmountErr("");
  };

  const handleQuickPct = (pct: number) => {
    if (!fromAcc) return;
    const val = fromAcc.balance * pct;
    setAmount(fromAcc.currency === "BTC" ? val.toFixed(6) : val.toFixed(2));
    setAmountErr("");
  };

  const handleReview = () => {
    setAmountErr("");
    if (!num || num <= 0)      { setAmountErr("Please enter a valid amount."); return; }
    if (num > fromAcc.balance) { setAmountErr(`Insufficient balance. Available: ${fmtAmount(fromAcc.balance, fromAcc.currency, fromAcc.symbol)}`); return; }
    if (fromId === toId)       { setAmountErr("Please select two different accounts."); return; }
    setShowModal(true);
  };

  const handleConfirm = () => {
    setShowModal(false);
    setStep("processing");
    setTimeout(() => {
      const newTxId      = genTxId();
      const ref          = genRef();
      const now          = new Date().toISOString();
      const fromBalAfter = +(fromAcc.balance - num).toFixed(6);
      const toBalAfter   = +(toAcc.balance + toAmount).toFixed(6);
      const rateStr4     = rate.toFixed(
        fromAcc.currency === "BTC" || toAcc.currency === "BTC" ? 8 : 4
      );

      const debitTx: Transaction = {
        id: newTxId + "-out", txType: "exchange", type: "debit",
        name: `Exchange to ${toAcc.currency}`,
        sub: `Vaulte Exchange · Rate: 1 ${fromAcc.currency} = ${rateStr4} ${toAcc.currency}`,
        amount: num, fee: 0, balanceAfter: fromBalAfter,
        currency: fromAcc.currency, date: now, category: "Exchange",
        badge: "Exchange", badgeBg: "#EEF4FF", badgeBorder: "#C4B5FD", badgeColor: "#7C3AED",
        status: "completed", accountId: fromId,
        icon: "⇄", iconBg: "linear-gradient(135deg,#EEF4FF,#C4B5FD)", iconColor: "#7C3AED",
        reference: ref,
      };
      const creditTx: Transaction = {
        id: newTxId + "-in", txType: "exchange", type: "credit",
        name: `Exchange from ${fromAcc.currency}`,
        sub: `Vaulte Exchange · Rate: 1 ${fromAcc.currency} = ${rateStr4} ${toAcc.currency}`,
        amount: toAmount, fee: 0, balanceAfter: toBalAfter,
        currency: toAcc.currency, date: now, category: "Exchange",
        badge: "Exchange", badgeBg: "#EEF4FF", badgeBorder: "#C4B5FD", badgeColor: "#7C3AED",
        status: "completed", accountId: toId,
        icon: "⇄", iconBg: "linear-gradient(135deg,#EEF4FF,#C4B5FD)", iconColor: "#7C3AED",
        reference: ref,
      };

      const newAccounts = state.accounts.map(a => {
        if (a.id === fromId) return { ...a, balance: fromBalAfter };
        if (a.id === toId)   return { ...a, balance: toBalAfter };
        return a;
      });
      const newState: VaulteState = {
        ...state,
        accounts: newAccounts,
        transactions: [debitTx, creditTx, ...state.transactions],
      };
      setState(newState);
      saveState(newState);
      setTxId(newTxId);
      setStep("success");
      showToast("Exchange completed successfully!");
    }, 2200);
  };

  const handleReset = () => {
    setStep("form");
    setAmount("");
    setAmountErr("");
    setCountdown(30);
  };

  const recentExchanges = state.transactions.filter(
    t => t.txType === "exchange" || t.badge === "Exchange"
  ).slice(0, 5);

  const rateStr = fromAcc && toAcc
    ? `1 ${fromAcc.currency} = ${rate.toFixed(fromAcc.currency === "BTC" || toAcc.currency === "BTC" ? 8 : 4)} ${toAcc.currency}`
    : "—";

  const cdColor = countdown <= 10 ? "#DC2626" : countdown <= 20 ? "#D97706" : C.green;

  return (
    <DashboardLayout title="Currency Exchange" subtitle="Convert between your accounts instantly">

      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", top: 88, right: 32, zIndex: 1000,
          background: C.navy, color: "#fff", padding: "13px 22px",
          borderRadius: 12, fontSize: 13.5, fontWeight: 600,
          boxShadow: "0 8px 28px rgba(15,23,42,0.28)",
          display: "flex", alignItems: "center", gap: 10,
          animation: "slideIn 0.25s ease",
        }}>
          <span style={{ color: "#4ADE80", fontSize: 16 }}>✓</span> {toast}
        </div>
      )}

      {/* Confirm modal */}
      {showModal && (
        <div style={{
          position: "fixed", inset: 0, zIndex: 900,
          background: "rgba(15,23,42,0.55)", backdropFilter: "blur(4px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: 24, animation: "fadeIn 0.2s ease",
        }}>
          <div style={{
            background: C.card, borderRadius: 20, padding: "32px 28px",
            width: "100%", maxWidth: 440,
            boxShadow: "0 20px 60px rgba(15,23,42,0.25)",
            animation: "slideUp 0.25s ease",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#EEF4FF,#C4B5FD)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, color: "#7C3AED" }}>⇄</div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 800, color: C.text, marginBottom: 2 }}>Confirm Exchange</h2>
                <p style={{ fontSize: 13, color: C.muted }}>Review details before confirming</p>
              </div>
            </div>

            <div style={{ background: C.bg, borderRadius: 16, padding: 20, marginBottom: 20, display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{fromAcc?.flag}</div>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 4 }}>{fromAcc?.currency}</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: "#DC2626" }}>-{fmtConverted(num, fromAcc?.currency ?? "USD", fromAcc?.symbol ?? "$")}</p>
              </div>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: `linear-gradient(135deg, ${C.blue}, #1558b0)`, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 18, flexShrink: 0, boxShadow: "0 4px 14px rgba(26,115,232,0.3)" }}>→</div>
              <div style={{ flex: 1, textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{toAcc?.flag}</div>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.sub, marginBottom: 4 }}>{toAcc?.currency}</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: C.green }}>+{fmtConverted(toAmount, toAcc?.currency ?? "EUR", toAcc?.symbol ?? "€")}</p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 24 }}>
              {[
                { label: "Exchange Rate", value: rateStr,              valueColor: C.text  },
                { label: "Fee",           value: "Free",               valueColor: C.green },
                { label: "From Account",  value: fromAcc?.name ?? "—", valueColor: C.text  },
                { label: "To Account",    value: toAcc?.name  ?? "—",  valueColor: C.text  },
              ].map(r => (
                <div key={r.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 13, color: C.sub }}>{r.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: r.valueColor }}>{r.value}</span>
                </div>
              ))}
            </div>

            <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 10, padding: "10px 14px", marginBottom: 24, display: "flex", alignItems: "flex-start", gap: 8 }}>
              <span style={{ color: "#D97706", fontSize: 14, lineHeight: "20px" }}>⚠</span>
              <p style={{ fontSize: 12.5, color: "#92400E", lineHeight: 1.5 }}>
                This action will immediately deduct funds from your {fromAcc?.currency} account. This cannot be undone.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <button onClick={() => setShowModal(false)}
                style={{ padding: "13px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: "transparent", fontSize: 14, fontWeight: 600, color: C.text, cursor: "pointer", fontFamily: "inherit" }}>
                Cancel
              </button>
              <button onClick={handleConfirm}
                style={{ padding: "13px", borderRadius: 12, background: `linear-gradient(135deg, ${C.blue}, #1558b0)`, border: "none", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(26,115,232,0.3)" }}>
                Confirm Exchange
              </button>
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }} className="exchange-grid">

        {/* ════ LEFT — Exchange widget ════ */}
        <div>
          <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, overflow: "hidden" }}>

            {step === "form" && (
              <div style={{ padding: "28px 28px 32px" }}>
                <div style={{ marginBottom: 28 }}>
                  <h2 style={{ fontSize: 19, fontWeight: 800, color: C.text, marginBottom: 4, letterSpacing: "-0.3px" }}>Currency Exchange</h2>
                  <p style={{ fontSize: 13, color: C.muted }}>Convert between your accounts instantly</p>
                </div>

                {/* FROM */}
                <div>
                  <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 10 }}>
                    <span>From</span>
                    <span style={{ fontSize: 12, fontWeight: 500, textTransform: "none" as const, letterSpacing: 0 }}>
                      Available: <strong style={{ color: C.text, fontWeight: 700 }}>{fromAcc ? fmtAmount(fromAcc.balance, fromAcc.currency, fromAcc.symbol) : "—"}</strong>
                    </span>
                  </label>
                  <div style={{ background: C.bg, borderRadius: 16, border: `1.5px solid ${C.border}`, padding: "18px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <select value={fromId} onChange={e => { setFromId(e.target.value); setAmountErr(""); }}
                        style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "8px 12px", fontSize: 13.5, fontWeight: 600, color: C.text, cursor: "pointer", outline: "none", fontFamily: "inherit" }}>
                        {state.accounts.filter(a => !a.frozen).map(a => (
                          <option key={a.id} value={a.id} disabled={a.id === toId}>{a.flag} {a.name} ({a.currency})</option>
                        ))}
                      </select>
                      <div style={{ background: "#EEF4FF", border: "1px solid rgba(26,115,232,0.2)", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700, color: C.blue }}>{fromAcc?.currency}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ fontSize: 26, fontWeight: 800, color: C.muted, marginRight: 6, lineHeight: 1, flexShrink: 0 }}>{fromAcc?.symbol}</span>
                      <input type="number" value={amount} min={0}
                        onChange={e => { setAmount(e.target.value); setAmountErr(""); }}
                        placeholder="0.00"
                        style={{ flex: 1, background: "transparent", border: "none", outline: "none", fontSize: 34, fontWeight: 800, color: C.text, fontFamily: "inherit", letterSpacing: "-1px" }} />
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                      {[{ label: "25%", pct: 0.25 }, { label: "50%", pct: 0.50 }, { label: "75%", pct: 0.75 }, { label: "MAX", pct: 1.00 }].map(({ label, pct }) => (
                        <button key={label} onClick={() => handleQuickPct(pct)}
                          style={{ flex: 1, padding: "6px 0", borderRadius: 8, border: `1.5px solid ${C.border}`, background: "transparent", fontSize: 12, fontWeight: 700, color: C.sub, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#EEF4FF"; el.style.borderColor = C.blue; el.style.color = C.blue; }}
                          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.borderColor = C.border; el.style.color = C.sub; }}
                        >{label}</button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Swap bar */}
                <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "16px 0" }}>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#EEF4FF", border: "1px solid rgba(26,115,232,0.15)", borderRadius: 40, padding: "8px 14px", whiteSpace: "nowrap" as const }}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: C.blue }}>{rateStr}</span>
                    <span style={{ fontSize: 10.5, color: C.muted }}>🔄 Just now</span>
                  </div>
                  <button onClick={handleSwap}
                    style={{ width: 40, height: 40, borderRadius: "50%", flexShrink: 0, background: `linear-gradient(135deg, ${C.blue}, #1558b0)`, border: "none", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(26,115,232,0.35)", transform: swapRotated ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.35s cubic-bezier(0.34,1.56,0.64,1)" }}>⇅</button>
                  <div style={{ flex: 1, height: 1, background: C.border }} />
                </div>

                {/* TO */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 11.5, fontWeight: 700, color: C.sub, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 10 }}>
                    <span>You Receive</span>
                    <span style={{ fontSize: 12, fontWeight: 500, textTransform: "none" as const, letterSpacing: 0 }}>
                      Balance: <strong style={{ color: C.text, fontWeight: 700 }}>{toAcc ? fmtAmount(toAcc.balance, toAcc.currency, toAcc.symbol) : "—"}</strong>
                    </span>
                  </label>
                  <div style={{ background: "#F0FDF4", borderRadius: 16, border: "1.5px solid #BBF7D0", padding: "18px 20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                      <select value={toId} onChange={e => { setToId(e.target.value); setAmountErr(""); }}
                        style={{ background: C.card, border: "1px solid #BBF7D0", borderRadius: 10, padding: "8px 12px", fontSize: 13.5, fontWeight: 600, color: C.text, cursor: "pointer", outline: "none", fontFamily: "inherit" }}>
                        {state.accounts.map(a => (
                          <option key={a.id} value={a.id} disabled={a.id === fromId}>{a.flag} {a.name} ({a.currency})</option>
                        ))}
                      </select>
                      <div style={{ background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "4px 10px", fontSize: 12, fontWeight: 700, color: C.green }}>{toAcc?.currency}</div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <span style={{ fontSize: 26, fontWeight: 800, color: "#86EFAC", marginRight: 6, lineHeight: 1, flexShrink: 0 }}>{toAcc?.symbol}</span>
                      <span style={{ fontSize: 34, fontWeight: 800, color: num > 0 ? C.green : "#86EFAC", letterSpacing: "-1px" }}>
                        {num > 0
                          ? (toAcc?.currency === "BTC"
                              ? toAmount.toFixed(6)
                              : toAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
                          : "0.00"}
                      </span>
                    </div>
                    {num > 0 && <p style={{ fontSize: 11.5, color: "#059669", marginTop: 6, fontWeight: 500 }}>Rate: 1 {fromAcc?.currency} = {rate.toFixed(6)} {toAcc?.currency}</p>}
                  </div>
                </div>

                {amountErr && (
                  <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", marginBottom: 18, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ color: "#DC2626", fontSize: 14 }}>⚠</span>
                    <p style={{ fontSize: 13, color: "#DC2626", fontWeight: 500 }}>{amountErr}</p>
                  </div>
                )}

                {/* Fee */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", marginBottom: 16, background: "#F0FDF4", borderRadius: 10, border: "1px solid #BBF7D0" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ fontSize: 13, color: C.sub }}>Exchange Fee</span>
                    <div style={{ position: "relative" as const, display: "inline-flex" }}>
                      <button
                        onMouseEnter={() => setShowFeeTooltip(true)}
                        onMouseLeave={() => setShowFeeTooltip(false)}
                        style={{ width: 16, height: 16, borderRadius: "50%", background: C.border, border: "none", cursor: "pointer", fontSize: 10, color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit" }}>i
                      </button>
                      {showFeeTooltip && (
                        <div style={{ position: "absolute" as const, bottom: "calc(100% + 8px)", left: "50%", transform: "translateX(-50%)", background: C.navy, color: "#fff", borderRadius: 8, padding: "7px 12px", fontSize: 11.5, whiteSpace: "nowrap" as const, boxShadow: "0 4px 16px rgba(15,23,42,0.25)", zIndex: 10 }}>
                          Vaulte charges zero fees on all<br />currency exchanges between accounts.
                        </div>
                      )}
                    </div>
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 700, color: C.green }}>Free</span>
                </div>

                {/* Summary */}
                <div style={{ background: C.bg, borderRadius: 14, border: `1px solid ${C.border}`, padding: "16px 18px", marginBottom: 24 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {[
                      { label: "Exchange Rate", value: rateStr,                                                                                          valueColor: C.text  },
                      { label: "Fee",           value: "Free",                                                                                           valueColor: C.green },
                      { label: "You Send",      value: num > 0 ? fmtConverted(num, fromAcc?.currency ?? "USD", fromAcc?.symbol ?? "$") : "—",           valueColor: C.text  },
                      { label: "You Receive",   value: num > 0 ? fmtConverted(toAmount, toAcc?.currency ?? "EUR", toAcc?.symbol ?? "€") : "—",         valueColor: C.green },
                    ].map((row, i, arr) => (
                      <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: i < arr.length - 1 ? 10 : 0, borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
                        <span style={{ fontSize: 12.5, color: C.sub }}>{row.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 700, color: row.valueColor }}>{row.value}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 10, borderTop: `1px solid ${C.border}` }}>
                      <span style={{ fontSize: 12.5, color: C.sub }}>Rate locked for</span>
                      <span style={{ fontSize: 13, fontWeight: 800, color: cdColor, transition: "color 0.4s" }}>⏱ {countdown}s</span>
                    </div>
                  </div>
                </div>

                <button onClick={handleReview}
                  style={{ width: "100%", padding: "15px", borderRadius: 14, background: `linear-gradient(135deg, ${C.blue}, #1558b0)`, color: "#fff", border: "none", fontSize: 15.5, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 6px 20px rgba(26,115,232,0.35)", transition: "opacity 0.18s, transform 0.18s" }}
                  onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.opacity = "0.92"; el.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.opacity = "1"; el.style.transform = "translateY(0)"; }}
                >Exchange Now →</button>
              </div>
            )}

            {step === "processing" && (
              <div style={{ padding: "72px 28px", textAlign: "center" as const }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#EEF4FF,#C4B5FD)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 24px", animation: "spin 1.2s linear infinite", border: "3px solid rgba(124,58,237,0.2)" }}>⇄</div>
                <h2 style={{ fontSize: 19, fontWeight: 800, color: C.text, marginBottom: 8 }}>Processing Exchange…</h2>
                <p style={{ fontSize: 13.5, color: C.muted }}>Converting your funds. This only takes a moment.</p>
                <div style={{ marginTop: 28, height: 4, background: C.bg, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: `linear-gradient(90deg, ${C.blue}, #7C3AED)`, borderRadius: 4, animation: "progress 2.2s ease-in-out forwards" }} />
                </div>
              </div>
            )}

            {step === "success" && (
              <div style={{ padding: "44px 28px", textAlign: "center" as const }}>
                <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, margin: "0 auto 20px", border: "3px solid #4ADE80", animation: "popIn 0.4s cubic-bezier(0.34,1.56,0.64,1)" }}>✓</div>
                <h2 style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6 }}>Exchange Successful!</h2>
                <p style={{ fontSize: 13.5, color: C.muted, marginBottom: 28 }}>
                  {fromAcc && fmtConverted(num, fromAcc.currency, fromAcc.symbol)} converted to {toAcc && fmtConverted(toAmount, toAcc.currency, toAcc.symbol)}
                </p>
                <div style={{ background: C.bg, borderRadius: 14, padding: "18px", marginBottom: 28, display: "flex", flexDirection: "column", gap: 10, textAlign: "left" as const }}>
                  {[
                    { label: "Transaction ID",               value: txId.slice(0, 22) + "…",                                                                                                           mono: true,  green: false },
                    { label: "Status",                       value: "Completed",                                                                                                                        mono: false, green: true  },
                    { label: `New ${fromAcc?.currency} Balance`, value: fromAcc ? fmtAmount(state.accounts.find(a => a.id === fromId)?.balance ?? 0, fromAcc.currency, fromAcc.symbol) : "—", mono: false, green: false },
                    { label: `New ${toAcc?.currency} Balance`,   value: toAcc   ? fmtAmount(state.accounts.find(a => a.id === toId)?.balance   ?? 0, toAcc.currency,   toAcc.symbol)   : "—", mono: false, green: false },
                  ].map(r => (
                    <div key={r.label} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12.5, color: C.sub }}>{r.label}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: r.green ? C.green : C.text, fontFamily: r.mono ? "monospace" : "inherit" }}>{r.value}</span>
                    </div>
                  ))}
                </div>
                <button onClick={handleReset}
                  style={{ width: "100%", padding: "14px", borderRadius: 12, background: `linear-gradient(135deg, ${C.blue}, #1558b0)`, border: "none", fontSize: 14.5, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(26,115,232,0.3)" }}>
                  Make Another Exchange
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ════ RIGHT — Rates + History ════ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Live Rates */}
          <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: C.shadow, overflow: "hidden" }}>
            <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Live Rates</h3>
                <p style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>6 currency pairs</p>
              </div>
              <span style={{ fontSize: 11, color: "#059669", fontWeight: 700, background: "#F0FDF4", padding: "4px 10px", borderRadius: 20, border: "1px solid #BBF7D0", display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ fontSize: 8 }}>●</span> Live
              </span>
            </div>
            {RATE_PAIRS.map((p, i) => {
              const r = getRate(p.from, p.to);
              const isBTC = p.from === "BTC" || p.to === "BTC";
              return (
                <div key={`${p.from}-${p.to}`}
                  style={{ padding: "11px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < RATE_PAIRS.length - 1 ? `1px solid ${C.border}` : "none", transition: "background 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: p.up ? "#F0FDF4" : "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, border: `1px solid ${p.up ? "#BBF7D0" : "#FECACA"}` }}>
                      {p.up ? "↗" : "↘"}
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: C.text }}>{p.from}/{p.to}</p>
                      <p style={{ fontSize: 10.5, color: C.muted }}>1 {p.from} in {p.to}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" as const }}>
                    <p style={{ fontSize: 13.5, fontWeight: 800, color: C.text }}>{isBTC ? r.toFixed(8) : r.toFixed(4)}</p>
                    <p style={{ fontSize: 11, fontWeight: 700, color: p.up ? C.green : "#DC2626" }}>{p.change}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Exchange History */}
          <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: C.shadow, overflow: "hidden" }}>
            <div style={{ padding: "16px 18px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Exchange History</h3>
                <p style={{ fontSize: 11, color: C.muted, marginTop: 1 }}>Last 5 exchanges</p>
              </div>
              {recentExchanges.length > 0 && (
                <span style={{ fontSize: 11.5, fontWeight: 600, color: C.blue, background: "#EEF4FF", padding: "3px 10px", borderRadius: 20, border: "1px solid rgba(26,115,232,0.15)" }}>{recentExchanges.length}</span>
              )}
            </div>
            {recentExchanges.length === 0 ? (
              <div style={{ padding: "36px 20px", textAlign: "center" as const }}>
                <div style={{ width: 52, height: 52, borderRadius: 14, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, margin: "0 auto 12px" }}>⇄</div>
                <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.5 }}>No exchanges yet.<br />Make your first exchange above.</p>
              </div>
            ) : (
              recentExchanges.map((tx, i) => (
                <div key={tx.id}
                  style={{ padding: "12px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < recentExchanges.length - 1 ? `1px solid ${C.border}` : "none", transition: "background 0.15s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: tx.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, color: tx.iconColor, flexShrink: 0 }}>{tx.icon}</div>
                    <div>
                      <p style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{tx.name}</p>
                      <p style={{ fontSize: 10.5, color: C.muted }}>{fmtDate(tx.date)}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" as const }}>
                    <p style={{ fontSize: 13, fontWeight: 800, color: tx.type === "credit" ? C.green : C.text }}>
                      {tx.type === "credit" ? "+" : "−"}{tx.currency === "BTC"
                        ? `${tx.amount.toFixed(6)} BTC`
                        : `${state.accounts.find(a => a.id === tx.accountId)?.symbol ?? ""}${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
                    </p>
                    <p style={{ fontSize: 10.5, color: C.muted, marginTop: 1 }}>{tx.currency}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin     { from { transform: rotate(0deg); }   to { transform: rotate(360deg); } }
        @keyframes slideIn  { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeIn   { from { opacity: 0; }               to { opacity: 1; } }
        @keyframes slideUp  { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes popIn    { from { opacity: 0; transform: scale(0.6); } to { opacity: 1; transform: scale(1); } }
        @keyframes progress { from { width: 0%; } to { width: 100%; } }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
        @media (max-width: 900px) {
          .exchange-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}
