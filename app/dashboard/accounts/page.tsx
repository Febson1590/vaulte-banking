"use client";
import { useState, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import { getState, saveState, VaulteState, DEFAULT_STATE, Account, Transaction, fmtAmount, fmtDate, genTxId, genRef } from "@/lib/vaulteState";

const C = {
  bg: "#F3F5FA", card: "#ffffff", navy: "#0F172A", blue: "#1A73E8",
  border: "rgba(15,23,42,0.07)", muted: "#94A3B8", text: "#0F172A", sub: "#64748B",
  shadow: "0 1px 3px rgba(15,23,42,0.05), 0 6px 20px rgba(15,23,42,0.07)",
  shadowHv: "0 2px 8px rgba(15,23,42,0.06), 0 14px 36px rgba(15,23,42,0.10)",
} as const;

const typeLabel: Record<string, string> = { current: "Current Account", savings: "Savings", currency: "Currency Account", crypto: "Crypto Wallet" };

export default function AccountsPage() {
  const [state, setState] = useState<VaulteState>(DEFAULT_STATE);
  const [selected, setSelected] = useState<Account | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [freezing, setFreezing] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // Deposit modal state
  const [depositModal, setDepositModal] = useState(false);
  const [depositAccountId, setDepositAccountId] = useState("");
  const [depositAmount, setDepositAmount] = useState("");
  const [depositMethod, setDepositMethod] = useState("bank");
  const [depositStep, setDepositStep] = useState<"form"|"processing"|"success">("form");
  const [depositErr, setDepositErr] = useState("");

  useEffect(() => { setState(getState()); }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  const handleFreeze = (accountId: string) => {
    setFreezing(true);
    setTimeout(() => {
      const newAccounts = state.accounts.map(a => a.id === accountId ? { ...a, frozen: !a.frozen } : a);
      const newState = { ...state, accounts: newAccounts };
      setState(newState);
      saveState(newState);
      const updated = newAccounts.find(a => a.id === accountId)!;
      setSelected(updated);
      setFreezing(false);
      showToast(updated.frozen ? `${updated.name} has been frozen.` : `${updated.name} is now active.`);
    }, 900);
  };

  const copyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const openDeposit = (acc?: Account) => {
    setDepositAccountId(acc?.id ?? selected?.id ?? state.accounts[0]?.id ?? "");
    setDepositAmount("");
    setDepositMethod("bank");
    setDepositStep("form");
    setDepositErr("");
    setDepositModal(true);
  };

  const handleDeposit = () => {
    const amt = parseFloat(depositAmount);
    if (!depositAmount || isNaN(amt) || amt <= 0) { setDepositErr("Enter a valid amount."); return; }
    if (amt > 50000) { setDepositErr("Maximum single deposit is $50,000."); return; }
    setDepositErr("");
    setDepositStep("processing");
    setTimeout(() => {
      const acc = state.accounts.find(a => a.id === depositAccountId)!;
      const newBal = parseFloat((acc.balance + amt).toFixed(8));
      const newTx: Transaction = {
        id: genTxId(), txType: "deposit", type: "credit",
        name: "Account Deposit",
        sub: depositMethod === "bank" ? "Bank Transfer" : depositMethod === "card" ? "Card Deposit" : "Crypto Deposit",
        amount: amt, fee: 0, balanceAfter: newBal,
        currency: acc.currency, date: new Date().toISOString(),
        category: "Income", badge: "Deposit",
        badgeBg: "#F0FDF4", badgeBorder: "#BBF7D0", badgeColor: "#16A34A",
        status: "completed", accountId: depositAccountId,
        icon: "↙", iconBg: "linear-gradient(135deg,#DCFCE7,#BBF7D0)", iconColor: "#16A34A",
        reference: genRef(),
      };
      const newAccounts = state.accounts.map(a => a.id === depositAccountId ? { ...a, balance: newBal } : a);
      const newState = { ...state, accounts: newAccounts, transactions: [newTx, ...state.transactions] };
      setState(newState);
      saveState(newState);
      if (selected?.id === depositAccountId) setSelected({ ...acc, balance: newBal });
      setDepositStep("success");
    }, 1600);
  };

  const accountTxns = (accountId: string): Transaction[] =>
    state.transactions.filter(t => t.accountId === accountId).slice(0, 5);

  const totalUSD = state.accounts.reduce((s, a) => {
    const rates: Record<string, number> = { USD: 1, EUR: 1.09, GBP: 1.27, BTC: 66000 };
    return s + a.balance * (rates[a.currency] ?? 1);
  }, 0);

  return (
    <DashboardLayout title="My Accounts" subtitle={`${state.accounts.length} accounts · Total ≈ $${totalUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
      topRight={
        <button onClick={() => openDeposit()} style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: "linear-gradient(135deg,#059669,#047857)", color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 14px rgba(5,150,105,0.28)", display: "flex", alignItems: "center", gap: 7, transition: "all 0.2s" }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 20px rgba(5,150,105,0.36)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 14px rgba(5,150,105,0.28)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
        >
          <span style={{ fontSize: 16 }}>＋</span> Deposit Funds
        </button>
      }
    >

      {/* Toast */}
      {toast && (
        <div style={{ position: "fixed", top: 88, right: 32, zIndex: 999, background: C.navy, color: "#fff", padding: "12px 20px", borderRadius: 12, fontSize: 13.5, fontWeight: 500, boxShadow: "0 8px 24px rgba(15,23,42,0.25)", display: "flex", alignItems: "center", gap: 10, animation: "slideIn 0.25s ease" }}>
          <span style={{ color: "#4ADE80" }}>✓</span> {toast}
        </div>
      )}

      {/* ─── Deposit Modal ─── */}
      {depositModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,23,42,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(5px)" }}>
          <div style={{ background: C.card, borderRadius: 24, width: 420, maxWidth: "90vw", boxShadow: "0 32px 80px rgba(15,23,42,0.32)", border: `1px solid ${C.border}`, overflow: "hidden" }}>

            {/* Modal header */}
            <div style={{ padding: "24px 28px 20px", borderBottom: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <p style={{ fontSize: 17, fontWeight: 800, color: C.text, letterSpacing: "-0.3px" }}>Deposit Funds</p>
                <p style={{ fontSize: 12.5, color: C.muted, marginTop: 3 }}>Add money to your account instantly</p>
              </div>
              {depositStep === "form" && (
                <button onClick={() => setDepositModal(false)} style={{ width: 32, height: 32, borderRadius: 10, background: C.bg, border: `1px solid ${C.border}`, cursor: "pointer", fontSize: 14, color: C.sub }}>✕</button>
              )}
            </div>

            <div style={{ padding: "28px 28px 32px" }}>

              {/* ── FORM step ── */}
              {depositStep === "form" && (
                <div>
                  {/* Account selector */}
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, display: "block", marginBottom: 6 }}>Deposit To</label>
                  <select value={depositAccountId} onChange={e => setDepositAccountId(e.target.value)}
                    style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 13.5, color: C.text, background: "#fff", outline: "none", fontFamily: "inherit", marginBottom: 18, cursor: "pointer", appearance: "none", backgroundImage: "url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 12 12%22><path fill=%22%2394A3B8%22 d=%22M6 8L1 3h10z%22/></svg>')", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}>
                    {state.accounts.filter(a => a.type !== "crypto").map(a => (
                      <option key={a.id} value={a.id}>{a.flag} {a.name} — {a.symbol}{a.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}</option>
                    ))}
                  </select>

                  {/* Amount */}
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, display: "block", marginBottom: 6 }}>Amount (USD)</label>
                  <div style={{ position: "relative", marginBottom: 8 }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 20, fontWeight: 700, color: C.muted }}>$</span>
                    <input type="number" min="1" step="0.01" value={depositAmount} onChange={e => { setDepositAmount(e.target.value); setDepositErr(""); }}
                      placeholder="0.00" autoFocus
                      style={{ width: "100%", padding: "14px 14px 14px 36px", borderRadius: 12, border: `1.5px solid ${depositErr ? "#EF4444" : C.border}`, fontSize: 24, fontWeight: 800, color: C.text, background: C.bg, outline: "none", fontFamily: "inherit", boxSizing: "border-box", letterSpacing: "-0.5px", transition: "border-color 0.18s, box-shadow 0.18s" }}
                      onFocus={e => { e.target.style.borderColor = depositErr ? "#EF4444" : C.blue; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.08)"; e.target.style.background = "#fff"; }}
                      onBlur={e => { e.target.style.borderColor = depositErr ? "#EF4444" : C.border; e.target.style.boxShadow = "none"; e.target.style.background = C.bg; }}
                    />
                  </div>
                  {/* Quick amounts */}
                  <div style={{ display: "flex", gap: 8, marginBottom: depositErr ? 8 : 20 }}>
                    {[100, 500, 1000, 5000].map(v => (
                      <button key={v} onClick={() => { setDepositAmount(v.toString()); setDepositErr(""); }}
                        style={{ flex: 1, padding: "7px 0", borderRadius: 9, border: `1px solid ${C.border}`, background: depositAmount === v.toString() ? C.blue : "#FAFBFC", color: depositAmount === v.toString() ? "#fff" : C.sub, fontSize: 12.5, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                        ${v.toLocaleString()}
                      </button>
                    ))}
                  </div>
                  {depositErr && <p style={{ fontSize: 12.5, color: "#EF4444", marginBottom: 14 }}>⚠ {depositErr}</p>}

                  {/* Deposit method */}
                  <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, display: "block", marginBottom: 10 }}>Deposit Method</label>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                    {[
                      { key: "bank",   icon: "🏦", label: "Bank Transfer",     sub: "ACH / Wire — 1-2 business days" },
                      { key: "card",   icon: "💳", label: "Debit / Credit Card", sub: "Instant deposit — small fee may apply" },
                      { key: "crypto", icon: "₿",  label: "Crypto Deposit",     sub: "Send BTC/ETH to your wallet address" },
                    ].map(m => (
                      <div key={m.key} onClick={() => setDepositMethod(m.key)}
                        style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 16px", borderRadius: 12, border: depositMethod === m.key ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`, background: depositMethod === m.key ? "#EEF4FF" : "#FAFBFC", cursor: "pointer", transition: "all 0.15s" }}>
                        <span style={{ fontSize: 20 }}>{m.icon}</span>
                        <div>
                          <p style={{ fontSize: 13.5, fontWeight: 600, color: depositMethod === m.key ? C.blue : C.text }}>{m.label}</p>
                          <p style={{ fontSize: 11.5, color: C.muted }}>{m.sub}</p>
                        </div>
                        <div style={{ marginLeft: "auto", width: 16, height: 16, borderRadius: "50%", border: `2px solid ${depositMethod === m.key ? C.blue : C.border}`, background: depositMethod === m.key ? C.blue : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          {depositMethod === m.key && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#fff" }} />}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => setDepositModal(false)} style={{ padding: "13px 20px", borderRadius: 14, border: `1px solid ${C.border}`, background: "transparent", color: C.sub, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>Cancel</button>
                    <button onClick={handleDeposit} style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#059669,#047857)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(5,150,105,0.28)", transition: "all 0.2s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(5,150,105,0.36)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(5,150,105,0.28)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
                      Deposit Funds ↓
                    </button>
                  </div>
                </div>
              )}

              {/* ── PROCESSING step ── */}
              {depositStep === "processing" && (
                <div style={{ textAlign: "center", padding: "32px 20px" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", border: "3px solid #059669", borderTop: "3px solid transparent", margin: "0 auto 20px", animation: "spin 0.8s linear infinite" }} />
                  <p style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 6 }}>Processing Deposit…</p>
                  <p style={{ fontSize: 13, color: C.muted }}>Verifying and crediting your account.</p>
                </div>
              )}

              {/* ── SUCCESS step ── */}
              {depositStep === "success" && (
                <div style={{ textAlign: "center", padding: "24px 16px" }}>
                  <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#22C55E,#16A34A)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", boxShadow: "0 8px 24px rgba(34,197,94,0.3)", fontSize: 32, color: "#fff" }}>✓</div>
                  <p style={{ fontSize: 21, fontWeight: 800, color: C.text, marginBottom: 6, letterSpacing: "-0.3px" }}>Deposit Successful!</p>
                  <p style={{ fontSize: 13.5, color: C.muted, marginBottom: 24 }}>
                    ${parseFloat(depositAmount).toLocaleString("en-US", { minimumFractionDigits: 2 })} added to {state.accounts.find(a => a.id === depositAccountId)?.name}.
                  </p>
                  <div style={{ display: "flex", gap: 12 }}>
                    <button onClick={() => { setDepositModal(false); setDepositStep("form"); }}
                      style={{ flex: 1, padding: "13px", borderRadius: 14, border: `1px solid ${C.border}`, background: "transparent", color: C.sub, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      Done
                    </button>
                    <button onClick={() => { setDepositStep("form"); setDepositAmount(""); setDepositErr(""); }}
                      style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#059669,#047857)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(5,150,105,0.28)" }}>
                      Deposit Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 360px" : "1fr", gap: 24, alignItems: "start" }}>

        {/* ═══ Account cards grid ═══ */}
        <div>
          {/* Stats row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
            {[
              { label: "Total Accounts", value: state.accounts.length.toString(), icon: "◫", color: C.blue },
              { label: "Active",         value: state.accounts.filter(a => !a.frozen).length.toString(), icon: "●", color: "#059669" },
              { label: "Frozen",         value: state.accounts.filter(a => a.frozen).length.toString(),  icon: "❄", color: "#64748B" },
            ].map(s => (
              <div key={s.label} style={{ background: C.card, borderRadius: 16, padding: "18px 20px", border: `1px solid ${C.border}`, boxShadow: C.shadow, display: "flex", alignItems: "center", gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 12, background: `${s.color}18`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: s.color, flexShrink: 0 }}>{s.icon}</div>
                <div>
                  <p style={{ fontSize: 22, fontWeight: 800, color: C.text, letterSpacing: "-0.5px", lineHeight: 1 }}>{s.value}</p>
                  <p style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Account cards */}
          <div style={{ display: "grid", gridTemplateColumns: selected ? "1fr 1fr" : "repeat(2, 1fr)", gap: 16 }}>
            {state.accounts.map(acc => (
              <div key={acc.id}
                onClick={() => setSelected(selected?.id === acc.id ? null : acc)}
                style={{
                  background: C.card, borderRadius: 20, padding: "22px 24px",
                  border: selected?.id === acc.id ? `1.5px solid ${acc.color}` : `1px solid ${C.border}`,
                  boxShadow: selected?.id === acc.id ? `0 0 0 3px ${acc.color}18, ${C.shadow}` : C.shadow,
                  cursor: "pointer", transition: "all 0.22s ease",
                  opacity: acc.frozen ? 0.7 : 1,
                  filter: acc.frozen ? "grayscale(0.25)" : "none",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = C.shadowHv; (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = selected?.id === acc.id ? `0 0 0 3px ${acc.color}18, ${C.shadow}` : C.shadow; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
              >
                {/* Card top */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 14, background: `${acc.color}14`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{acc.flag}</div>
                  {acc.frozen
                    ? <span style={{ fontSize: 11, fontWeight: 700, color: "#64748B", background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 20, padding: "3px 10px" }}>❄ Frozen</span>
                    : <span style={{ fontSize: 11, fontWeight: 700, color: "#059669", background: "#ECFDF5", border: "1px solid #A7F3D0", borderRadius: 20, padding: "3px 10px" }}>● Active</span>
                  }
                </div>

                {/* Balance */}
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>{acc.name}</p>
                <p style={{ fontSize: 26, fontWeight: 800, color: C.text, letterSpacing: "-1px", lineHeight: 1, marginBottom: 8 }}>
                  {fmtAmount(acc.balance, acc.currency, acc.symbol)}
                </p>
                {acc.currency === "BTC" && <p style={{ fontSize: 11.5, color: C.muted }}>≈ ${(acc.balance * 66000).toLocaleString("en-US", { maximumFractionDigits: 0 })} USD</p>}

                {/* Account number */}
                <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${C.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: 12.5, color: C.sub, fontFamily: "monospace", letterSpacing: "0.05em" }}>
                    •••• {acc.accountNumber.slice(-4)}
                  </span>
                  <span style={{ fontSize: 11, color: acc.color, fontWeight: 600 }}>{acc.currency}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent activity */}
          <div style={{ background: C.card, borderRadius: 20, padding: "24px 26px", border: `1px solid ${C.border}`, boxShadow: C.shadow, marginTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: "-0.2px" }}>All Recent Activity</p>
                <p style={{ fontSize: 12, color: C.muted, marginTop: 3 }}>{state.transactions.length} transactions</p>
              </div>
            </div>
            {state.transactions.slice(0, 8).map((tx, i) => (
              <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 10px", margin: "0 -10px", borderBottom: i < Math.min(state.transactions.length, 8) - 1 ? `1px solid ${C.border}` : "none", borderRadius: 12, cursor: "pointer", transition: "background 0.15s" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = C.bg}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 13 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 13, background: tx.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: tx.iconColor, flexShrink: 0, boxShadow: "0 2px 6px rgba(15,23,42,0.08)" }}>{tx.icon}</div>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 3 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{tx.name}</p>
                      <span style={{ fontSize: 10, fontWeight: 600, color: tx.badgeColor, background: tx.badgeBg, border: `1px solid ${tx.badgeBorder}`, borderRadius: 5, padding: "1px 6px" }}>{tx.badge}</span>
                    </div>
                    <p style={{ fontSize: 11.5, color: C.muted }}>{tx.sub} · {fmtDate(tx.date)}</p>
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0 }}>
                  <p style={{ fontSize: 14, fontWeight: 700, color: tx.type === "credit" ? "#059669" : C.text }}>{tx.type === "credit" ? "+" : "−"}${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 4, marginTop: 2 }}>
                    <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22C55E", boxShadow: "0 0 0 2px rgba(34,197,94,0.18)" }} />
                    <p style={{ fontSize: 11, color: C.muted }}>Completed</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══ Account detail panel ═══ */}
        {selected && (
          <div style={{ position: "sticky", top: 96 }}>
            <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, overflow: "hidden" }}>
              {/* Panel header */}
              <div style={{ background: `linear-gradient(135deg, ${selected.color}18 0%, ${selected.color}08 100%)`, padding: "24px 24px 20px", borderBottom: `1px solid ${C.border}` }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 15, background: `${selected.color}20`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26 }}>{selected.flag}</div>
                  <button onClick={() => setSelected(null)} style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(15,23,42,0.05)", border: "none", cursor: "pointer", fontSize: 14, color: C.sub, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 4 }}>{typeLabel[selected.type]}</p>
                <p style={{ fontSize: 28, fontWeight: 800, color: C.text, letterSpacing: "-1px", lineHeight: 1 }}>{fmtAmount(selected.balance, selected.currency, selected.symbol)}</p>
                {selected.currency === "BTC" && <p style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>≈ ${(selected.balance * 66000).toLocaleString("en-US", { maximumFractionDigits: 0 })} USD</p>}
              </div>

              {/* Account details */}
              <div style={{ padding: "20px 24px" }}>
                <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Account Details</p>

                {[
                  { label: "Account Number", value: selected.accountNumber, key: "accnum" },
                  ...(selected.sortCode ? [{ label: "Sort Code", value: selected.sortCode, key: "sort" }] : []),
                  ...(selected.iban     ? [{ label: "IBAN",        value: selected.iban,        key: "iban" }] : []),
                ].map(row => (
                  <div key={row.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                    <div>
                      <p style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>{row.label}</p>
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text, fontFamily: "monospace", letterSpacing: "0.04em" }}>{row.value}</p>
                    </div>
                    <button onClick={() => copyText(row.value, row.key)} style={{ padding: "5px 11px", borderRadius: 8, border: `1px solid ${C.border}`, background: copied === row.key ? "#ECFDF5" : "transparent", color: copied === row.key ? "#059669" : C.sub, fontSize: 12, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", fontWeight: 500 }}>
                      {copied === row.key ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                ))}

                <div style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", marginBottom: 20 }}>
                  <div>
                    <p style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>Status</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: selected.frozen ? "#94A3B8" : "#22C55E", boxShadow: selected.frozen ? "none" : "0 0 0 3px rgba(34,197,94,0.18)" }} />
                      <p style={{ fontSize: 13.5, fontWeight: 600, color: selected.frozen ? C.sub : "#059669" }}>{selected.frozen ? "Frozen" : "Active"}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 11, color: C.muted, marginBottom: 2 }}>Currency</p>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{selected.currency}</p>
                  </div>
                </div>

                {/* Actions */}
                {selected.type !== "crypto" && (
                  <button onClick={() => openDeposit(selected)}
                    style={{ width: "100%", padding: "13px", borderRadius: 14, marginBottom: 10, border: "none", background: "linear-gradient(135deg,#059669,#047857)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(5,150,105,0.28)", transition: "all 0.2s" }}>
                    ↙ Deposit Funds
                  </button>
                )}
                <button
                  onClick={() => handleFreeze(selected.id)}
                  disabled={freezing}
                  style={{
                    width: "100%", padding: "13px", borderRadius: 14, marginBottom: 10,
                    background: selected.frozen ? "linear-gradient(135deg,#1A73E8,#1558b0)" : "#F8FAFC",
                    color: selected.frozen ? "#fff" : "#EF4444",
                    fontSize: 14, fontWeight: 600, cursor: freezing ? "not-allowed" : "pointer",
                    fontFamily: "inherit", transition: "all 0.2s",
                    border: selected.frozen ? "none" : "1px solid #FECACA",
                    opacity: freezing ? 0.7 : 1,
                    boxShadow: selected.frozen ? "0 4px 16px rgba(26,115,232,0.25)" : "none",
                  } as React.CSSProperties}
                >
                  {freezing ? "Processing…" : selected.frozen ? "✓ Unfreeze Account" : "❄ Freeze Account"}
                </button>

                {/* Recent txns for this account */}
                {accountTxns(selected.id).length > 0 && (
                  <>
                    <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", margin: "18px 0 12px" }}>Recent Transactions</p>
                    {accountTxns(selected.id).map((tx, i) => (
                      <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 0", borderBottom: i < accountTxns(selected.id).length - 1 ? `1px solid ${C.border}` : "none" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 11, background: tx.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: tx.iconColor, flexShrink: 0 }}>{tx.icon}</div>
                          <div>
                            <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{tx.name}</p>
                            <p style={{ fontSize: 11, color: C.muted }}>{fmtDate(tx.date)}</p>
                          </div>
                        </div>
                        <p style={{ fontSize: 13.5, fontWeight: 700, color: tx.type === "credit" ? "#059669" : C.text }}>
                          {tx.type === "credit" ? "+" : "−"}${tx.amount.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideIn { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>
    </DashboardLayout>
  );
}
