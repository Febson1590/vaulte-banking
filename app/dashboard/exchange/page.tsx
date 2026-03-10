"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getState, saveState, VaulteState, DEFAULT_STATE, Transaction, genTxId, fmtDate } from "@/lib/vaulteState";

const C = {
  bg: "#F3F5FA", card: "#ffffff", navy: "#0F172A", blue: "#1A73E8",
  border: "rgba(15,23,42,0.07)", muted: "#94A3B8", text: "#0F172A", sub: "#64748B",
  shadow: "0 1px 3px rgba(15,23,42,0.05), 0 6px 20px rgba(15,23,42,0.07)",
} as const;

// 1 unit of currency = N USD
const TO_USD: Record<string, number> = { USD: 1, EUR: 1.09, GBP: 1.27, BTC: 66000 };

function getRate(from: string, to: string): number {
  return TO_USD[from] / TO_USD[to];
}

function fmtCurrency(amount: number, currency: string): string {
  if (currency === "BTC") return `${amount.toFixed(6)} BTC`;
  return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

type ExchangeStep = "form" | "confirm" | "processing" | "success";

export default function ExchangePage() {
  const [state,      setState]      = useState<VaulteState>(DEFAULT_STATE);
  const [fromId,     setFromId]     = useState("acc-001");
  const [toId,       setToId]       = useState("acc-002");
  const [amount,     setAmount]     = useState("");
  const [amountErr,  setAmountErr]  = useState("");
  const [step,       setStep]       = useState<ExchangeStep>("form");
  const [txId,       setTxId]       = useState("");
  const [toast,      setToast]      = useState<string | null>(null);

  useEffect(() => { setState(getState()); }, []);

  const fromAcc = state.accounts.find(a => a.id === fromId)!;
  const toAcc   = state.accounts.find(a => a.id === toId)!;
  const num     = parseFloat(amount) || 0;
  const rate    = fromAcc && toAcc ? getRate(fromAcc.currency, toAcc.currency) : 1;
  const toAmount = num * rate;

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 2800); };

  const handleSwap = () => { setFromId(toId); setToId(fromId); setAmount(""); setAmountErr(""); };

  const handleReview = () => {
    setAmountErr("");
    if (!num || num <= 0) { setAmountErr("Please enter a valid amount."); return; }
    if (num > fromAcc.balance) { setAmountErr(`Insufficient balance. Available: ${fromAcc.symbol}${fromAcc.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`); return; }
    if (fromId === toId) { setAmountErr("Please select two different accounts."); return; }
    setStep("confirm");
  };

  const handleConfirm = () => {
    setStep("processing");
    setTimeout(() => {
      const newTxId = genTxId();
      const now = new Date().toISOString();

      const debitTx: Transaction = {
        id: newTxId + "-out",
        type: "debit",
        name: `Exchange to ${toAcc.currency}`,
        sub: `Vaulte Exchange · Rate: 1 ${fromAcc.currency} = ${rate.toFixed(4)} ${toAcc.currency}`,
        amount: num,
        currency: fromAcc.currency,
        date: now,
        category: "Transfer",
        badge: "Exchange",
        badgeBg: "#EEF4FF", badgeBorder: "#BFDBFE", badgeColor: "#2563EB",
        status: "completed",
        accountId: fromId,
        icon: "↔",
        iconBg: "linear-gradient(135deg,#EEF4FF,#DBEAFE)", iconColor: "#1A73E8",
      };
      const creditTx: Transaction = {
        id: newTxId + "-in",
        type: "credit",
        name: `Exchange from ${fromAcc.currency}`,
        sub: `Vaulte Exchange · Rate: 1 ${fromAcc.currency} = ${rate.toFixed(4)} ${toAcc.currency}`,
        amount: toAmount,
        currency: toAcc.currency,
        date: now,
        category: "Transfer",
        badge: "Exchange",
        badgeBg: "#EEF4FF", badgeBorder: "#BFDBFE", badgeColor: "#2563EB",
        status: "completed",
        accountId: toId,
        icon: "↔",
        iconBg: "linear-gradient(135deg,#EEF4FF,#DBEAFE)", iconColor: "#1A73E8",
      };

      const newAccounts = state.accounts.map(a => {
        if (a.id === fromId) return { ...a, balance: +(a.balance - num).toFixed(6) };
        if (a.id === toId)   return { ...a, balance: +(a.balance + toAmount).toFixed(6) };
        return a;
      });

      const newState = { ...state, accounts: newAccounts, transactions: [debitTx, creditTx, ...state.transactions] };
      setState(newState);
      saveState(newState);
      setTxId(newTxId);
      setStep("success");
    }, 2000);
  };

  const handleReset = () => { setStep("form"); setAmount(""); setAmountErr(""); };

  const recentExchanges = state.transactions.filter(t => t.badge === "Exchange").slice(0, 5);

  const PAIRS = [
    { from: "USD", to: "EUR", label: "USD → EUR" },
    { from: "USD", to: "GBP", label: "USD → GBP" },
    { from: "EUR", to: "GBP", label: "EUR → GBP" },
    { from: "GBP", to: "USD", label: "GBP → USD" },
    { from: "EUR", to: "USD", label: "EUR → USD" },
    { from: "USD", to: "BTC", label: "USD → BTC" },
  ];

  return (
    <DashboardLayout title="Currency Exchange" subtitle="Convert between your accounts instantly">

      {toast && (
        <div style={{ position: "fixed", top: 88, right: 32, zIndex: 999, background: C.navy, color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 13.5, fontWeight: 500, boxShadow: "0 8px 24px rgba(15,23,42,0.25)", display: "flex", alignItems: "center", gap: 10, animation: "slideIn 0.25s ease" }}>
          <span style={{ color: "#4ADE80" }}>✓</span> {toast}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24, alignItems: "start" }} className="exchange-grid">

        {/* ═══ Left — Exchange form ═══ */}
        <div>
          {/* Rate cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 24 }} className="rate-cards">
            {PAIRS.slice(0, 3).map(p => (
              <div key={p.label} style={{ background: C.card, borderRadius: 14, padding: "14px 16px", border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
                <p style={{ fontSize: 11, color: C.muted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>{p.label}</p>
                <p style={{ fontSize: 20, fontWeight: 800, color: C.text, letterSpacing: "-0.5px" }}>
                  {getRate(p.from, p.to).toFixed(4)}
                </p>
                <p style={{ fontSize: 11, color: C.sub, marginTop: 3 }}>1 {p.from} = {getRate(p.from, p.to).toFixed(4)} {p.to}</p>
              </div>
            ))}
          </div>

          {/* Exchange card */}
          <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, overflow: "hidden" }}>

            {/* ── FORM step ── */}
            {step === "form" && (
              <div style={{ padding: "28px 28px" }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 6 }}>Exchange Currency</h2>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>Zero fees on all exchanges between your Vaulte accounts.</p>

                {/* From account */}
                <div style={{ marginBottom: 16 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.sub, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>From</label>
                  <div style={{ background: C.bg, borderRadius: 14, padding: "16px 18px", border: `1.5px solid ${C.border}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <select value={fromId} onChange={e => { setFromId(e.target.value); setAmountErr(""); }}
                        style={{ background: "transparent", border: "none", fontSize: 14, fontWeight: 600, color: C.text, cursor: "pointer", outline: "none", fontFamily: "inherit" }}>
                        {state.accounts.filter(a => !a.frozen).map(a => (
                          <option key={a.id} value={a.id} disabled={a.id === toId}>{a.flag} {a.name} ({a.currency})</option>
                        ))}
                      </select>
                      <span style={{ fontSize: 12, color: C.muted }}>Balance: <strong style={{ color: C.text }}>{fromAcc?.symbol}{fromAcc?.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></span>
                    </div>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", fontSize: 22, fontWeight: 700, color: C.text }}>{fromAcc?.symbol}</span>
                      <input
                        type="number" value={amount} min={0}
                        onChange={e => { setAmount(e.target.value); setAmountErr(""); }}
                        placeholder="0.00"
                        style={{ width: "100%", background: "transparent", border: "none", outline: "none", fontSize: 28, fontWeight: 800, color: C.text, paddingLeft: 28, fontFamily: "inherit" }}
                      />
                    </div>
                    {fromAcc && (
                      <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                        {[25, 50, 75, 100].map(pct => (
                          <button key={pct} onClick={() => { setAmount(((fromAcc.balance * pct) / 100).toFixed(2)); setAmountErr(""); }}
                            style={{ flex: 1, padding: "5px 0", borderRadius: 8, border: `1px solid ${C.border}`, background: "transparent", fontSize: 11.5, color: C.sub, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#EEF4FF"; (e.currentTarget as HTMLElement).style.borderColor = C.blue; (e.currentTarget as HTMLElement).style.color = C.blue; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.borderColor = C.border; (e.currentTarget as HTMLElement).style.color = C.sub; }}
                          >{pct}%</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Swap button */}
                <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
                  <button onClick={handleSwap} style={{ width: 42, height: 42, borderRadius: "50%", background: C.blue, border: "none", color: "#fff", fontSize: 18, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 4px 14px rgba(26,115,232,0.35)", transition: "transform 0.18s, box-shadow 0.18s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "rotate(180deg) scale(1.08)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "rotate(0deg) scale(1)"; }}
                  >⇅</button>
                </div>

                {/* To account */}
                <div style={{ marginBottom: 24 }}>
                  <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: C.sub, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>To</label>
                  <div style={{ background: "#F0FDF4", borderRadius: 14, padding: "16px 18px", border: "1.5px solid #BBF7D0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <select value={toId} onChange={e => { setToId(e.target.value); setAmountErr(""); }}
                        style={{ background: "transparent", border: "none", fontSize: 14, fontWeight: 600, color: C.text, cursor: "pointer", outline: "none", fontFamily: "inherit" }}>
                        {state.accounts.map(a => (
                          <option key={a.id} value={a.id} disabled={a.id === fromId}>{a.flag} {a.name} ({a.currency})</option>
                        ))}
                      </select>
                      <span style={{ fontSize: 12, color: C.muted }}>Balance: <strong style={{ color: C.text }}>{toAcc?.symbol}{toAcc?.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</strong></span>
                    </div>
                    <p style={{ fontSize: 28, fontWeight: 800, color: "#059669", letterSpacing: "-0.8px" }}>
                      {toAcc?.symbol}{fmtCurrency(toAmount, toAcc?.currency ?? "USD")}
                    </p>
                    {num > 0 && fromAcc && toAcc && (
                      <p style={{ fontSize: 11.5, color: "#059669", marginTop: 6 }}>
                        Rate: 1 {fromAcc.currency} = {rate.toFixed(6)} {toAcc.currency}
                      </p>
                    )}
                  </div>
                </div>

                {amountErr && (
                  <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 10, padding: "10px 14px", marginBottom: 18 }}>
                    <p style={{ fontSize: 13, color: "#DC2626", fontWeight: 500 }}>⚠ {amountErr}</p>
                  </div>
                )}

                {/* Exchange info */}
                <div style={{ background: "#EEF4FF", borderRadius: 12, padding: "14px 16px", marginBottom: 24, display: "flex", flexDirection: "column", gap: 8 }}>
                  {[
                    { label: "Exchange Rate", value: fromAcc && toAcc ? `1 ${fromAcc.currency} = ${rate.toFixed(6)} ${toAcc.currency}` : "—" },
                    { label: "Fees",          value: "Free (0.00)" },
                    { label: "Estimated Time", value: "Instant" },
                  ].map(r => (
                    <div key={r.label} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span style={{ fontSize: 12.5, color: C.sub }}>{r.label}</span>
                      <span style={{ fontSize: 12.5, fontWeight: 600, color: C.text }}>{r.value}</span>
                    </div>
                  ))}
                </div>

                <button onClick={handleReview} style={{
                  width: "100%", padding: "14px", borderRadius: 14, background: `linear-gradient(135deg, ${C.blue}, #1558b0)`,
                  color: "#fff", border: "none", fontSize: 15, fontWeight: 700, cursor: "pointer",
                  fontFamily: "inherit", boxShadow: "0 4px 16px rgba(26,115,232,0.3)", transition: "opacity 0.18s",
                }}>
                  Review Exchange →
                </button>
              </div>
            )}

            {/* ── CONFIRM step ── */}
            {step === "confirm" && (
              <div style={{ padding: "32px 28px" }}>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 4 }}>Confirm Exchange</h2>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 28 }}>Please review the details before confirming.</p>

                <div style={{ background: C.bg, borderRadius: 16, padding: "20px", marginBottom: 24, display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    { label: "You Send",       value: `${fromAcc?.symbol}${fmtCurrency(num, fromAcc?.currency ?? "USD")} ${fromAcc?.currency}`, color: "#DC2626" },
                    { label: "You Receive",    value: `${toAcc?.symbol}${fmtCurrency(toAmount, toAcc?.currency ?? "USD")} ${toAcc?.currency}`,   color: "#059669" },
                    { label: "Exchange Rate",  value: `1 ${fromAcc?.currency} = ${rate.toFixed(6)} ${toAcc?.currency}`, color: C.text },
                    { label: "Fee",            value: "Free",       color: "#059669" },
                    { label: "From Account",   value: fromAcc?.name ?? "—", color: C.text },
                    { label: "To Account",     value: toAcc?.name  ?? "—", color: C.text },
                  ].map((r, i, arr) => (
                    <div key={r.label} style={{ display: "flex", justifyContent: "space-between", paddingBottom: i < arr.length - 1 ? 14 : 0, borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
                      <span style={{ fontSize: 13, color: C.sub }}>{r.label}</span>
                      <span style={{ fontSize: 13.5, fontWeight: 700, color: r.color }}>{r.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                  <button onClick={() => setStep("form")} style={{ padding: "13px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: "transparent", fontSize: 14, fontWeight: 600, color: C.text, cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
                  <button onClick={handleConfirm} style={{ padding: "13px", borderRadius: 12, background: `linear-gradient(135deg, ${C.blue}, #1558b0)`, border: "none", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(26,115,232,0.3)" }}>Confirm ✓</button>
                </div>
              </div>
            )}

            {/* ── PROCESSING step ── */}
            {step === "processing" && (
              <div style={{ padding: "60px 28px", textAlign: "center" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#EEF4FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 20px", animation: "spin 1s linear infinite" }}>↔</div>
                <p style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 8 }}>Processing Exchange…</p>
                <p style={{ fontSize: 13, color: C.muted }}>Converting your funds. This only takes a moment.</p>
              </div>
            )}

            {/* ── SUCCESS step ── */}
            {step === "success" && (
              <div style={{ padding: "40px 28px", textAlign: "center" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, margin: "0 auto 20px", border: "3px solid #4ADE80" }}>✓</div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: C.text, marginBottom: 8 }}>Exchange Successful!</h2>
                <p style={{ fontSize: 13.5, color: C.muted, marginBottom: 24 }}>
                  {fromAcc?.symbol}{fmtCurrency(num, fromAcc?.currency ?? "USD")} {fromAcc?.currency} converted to {toAcc?.symbol}{fmtCurrency(toAmount, toAcc?.currency ?? "USD")} {toAcc?.currency}
                </p>
                <div style={{ background: C.bg, borderRadius: 14, padding: "16px", marginBottom: 28, display: "flex", flexDirection: "column", gap: 8 }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12.5, color: C.sub }}>Transaction ID</span>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.text, fontFamily: "monospace" }}>{txId.slice(0, 18)}…</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span style={{ fontSize: 12.5, color: C.sub }}>New balance ({fromAcc?.currency})</span>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: C.text }}>{fromAcc?.symbol}{state.accounts.find(a => a.id === fromId)?.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
                <button onClick={handleReset} style={{ width: "100%", padding: "13px", borderRadius: 12, background: `linear-gradient(135deg, ${C.blue}, #1558b0)`, border: "none", fontSize: 14, fontWeight: 700, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
                  Make Another Exchange
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ═══ Right — Live rates + history ═══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Live rates */}
          <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: C.shadow, overflow: "hidden" }}>
            <div style={{ padding: "18px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Live Rates</h3>
              <span style={{ fontSize: 11, color: "#059669", fontWeight: 600, background: "#F0FDF4", padding: "3px 9px", borderRadius: 7, border: "1px solid #BBF7D0" }}>● Live</span>
            </div>
            {PAIRS.map((p, i) => (
              <div key={p.label} style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < PAIRS.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: 10, background: "#EEF4FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: C.blue }}>↔</div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{p.label}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{getRate(p.from, p.to).toFixed(4)}</p>
                  <p style={{ fontSize: 10.5, color: "#059669", fontWeight: 600 }}>+0.12%</p>
                </div>
              </div>
            ))}
          </div>

          {/* Exchange history */}
          <div style={{ background: C.card, borderRadius: 16, border: `1px solid ${C.border}`, boxShadow: C.shadow, overflow: "hidden" }}>
            <div style={{ padding: "18px 20px", borderBottom: `1px solid ${C.border}` }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: C.text }}>Exchange History</h3>
            </div>
            {recentExchanges.length === 0 ? (
              <div style={{ padding: "30px 20px", textAlign: "center" }}>
                <p style={{ fontSize: 32, marginBottom: 8 }}>↔</p>
                <p style={{ fontSize: 13, color: C.muted }}>No exchanges yet. Make your first exchange above.</p>
              </div>
            ) : (
              recentExchanges.map((tx, i) => (
                <div key={tx.id} style={{ padding: "12px 20px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: i < recentExchanges.length - 1 ? `1px solid ${C.border}` : "none" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, background: tx.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: tx.iconColor, flexShrink: 0 }}>{tx.icon}</div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{tx.name}</p>
                      <p style={{ fontSize: 11, color: C.muted }}>{fmtDate(tx.date)}</p>
                    </div>
                  </div>
                  <p style={{ fontSize: 13.5, fontWeight: 700, color: tx.type === "credit" ? "#059669" : C.text }}>
                    {tx.type === "credit" ? "+" : "−"}{tx.currency === "BTC" ? `${tx.amount.toFixed(4)} BTC` : `$${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes slideIn { from { opacity:0; transform: translateX(20px); } to { opacity:1; transform: translateX(0); } }
        @media (max-width: 900px) {
          .exchange-grid { grid-template-columns: 1fr !important; }
          .rate-cards { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 480px) {
          .rate-cards { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </DashboardLayout>
  );
}
