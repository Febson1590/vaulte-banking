"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { getState, saveState, VaulteState, DEFAULT_STATE, Transaction, genTxId, genRef, fmtDate } from "@/lib/vaulteState";

const C = {
  bg: "#F3F5FA", card: "#ffffff", navy: "#0F172A", blue: "#1A73E8",
  border: "rgba(15,23,42,0.07)", muted: "#94A3B8", text: "#0F172A", sub: "#64748B",
  shadow: "0 1px 3px rgba(15,23,42,0.05), 0 6px 20px rgba(15,23,42,0.07)",
} as const;

const CONTACTS = [
  { name: "Sarah Williams",  initials: "SW", bg: "linear-gradient(145deg,#2563EB,#1d4ed8)",  bank: "Chase Bank",        accountNo: "****3842" },
  { name: "Alex Johnson",    initials: "AJ", bg: "linear-gradient(145deg,#374151,#1f2937)",  bank: "Bank of America",   accountNo: "****1290" },
  { name: "Emma Davis",      initials: "ED", bg: "linear-gradient(145deg,#7C3AED,#6d28d9)",  bank: "Wells Fargo",       accountNo: "****7734" },
  { name: "Mike Chen",       initials: "MC", bg: "linear-gradient(145deg,#059669,#047857)",  bank: "Citibank",          accountNo: "****5521" },
];

const FEE_RATE = 0; // 0% fees for same-currency, shown as $0.00
const EXCHANGE_RATES: Record<string, Record<string, number>> = {
  USD: { USD: 1, EUR: 0.917, GBP: 0.787, BTC: 0.0000152 },
  EUR: { USD: 1.09, EUR: 1, GBP: 0.858, BTC: 0.0000166 },
  GBP: { USD: 1.27, EUR: 1.165, GBP: 1, BTC: 0.0000193 },
};

type Step = 1 | 2 | 3 | "processing" | "success";

interface RecipientForm { name: string; accountNo: string; bank: string; }

export default function TransferPage() {
  const router = useRouter();
  const [state, setState] = useState<VaulteState>(DEFAULT_STATE);
  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [selectedContact, setSelectedContact] = useState<number | null>(null);
  const [manualMode, setManualMode]   = useState(false);
  const [recipient, setRecipient]     = useState<RecipientForm>({ name: "", accountNo: "", bank: "" });

  // Step 2
  const [fromAccountId, setFromAccountId] = useState("acc-001");
  const [amount, setAmount]               = useState("");
  const [currency, setCurrency]           = useState("USD");
  const [note, setNote]                   = useState("");
  const [amountErr, setAmountErr]         = useState("");

  // Result
  const [txId, setTxId]         = useState("");
  const [newBalance, setNewBalance] = useState(0);

  useEffect(() => { setState(getState()); }, []);

  const fromAccount = state.accounts.find(a => a.id === fromAccountId) ?? state.accounts[0];
  const numAmount   = parseFloat(amount) || 0;
  const fee         = 0;
  const total       = numAmount + fee;
  const rate        = EXCHANGE_RATES[fromAccount?.currency]?.[currency] ?? 1;
  const recipientName = selectedContact !== null ? CONTACTS[selectedContact].name : recipient.name;
  const recipientBank = selectedContact !== null ? CONTACTS[selectedContact].bank : recipient.bank;

  const canProceedStep1 = selectedContact !== null || (recipient.name.trim() && recipient.accountNo.trim());
  const canProceedStep2 = numAmount > 0 && numAmount <= (fromAccount?.balance ?? 0) && !amountErr;

  const validateAmount = (val: string) => {
    const n = parseFloat(val);
    if (!val) { setAmountErr(""); return; }
    if (isNaN(n) || n <= 0) { setAmountErr("Enter a valid amount"); return; }
    if (fromAccount && n > fromAccount.balance) { setAmountErr(`Insufficient balance (${fromAccount.symbol}${fromAccount.balance.toFixed(2)} available)`); return; }
    setAmountErr("");
  };

  const handleConfirm = () => {
    setStep("processing");
    setTimeout(() => {
      const id = genTxId();
      const newAccounts = state.accounts.map(a =>
        a.id === fromAccountId ? { ...a, balance: parseFloat((a.balance - numAmount).toFixed(8)) } : a
      );
      const balAfter = parseFloat((fromAccount.balance - numAmount).toFixed(8));
      const newTx: Transaction = {
        id, txType: "transfer_out", type: "debit",
        name: `Transfer to ${recipientName}`,
        sub: recipientBank || "Vaulte Transfer",
        amount: numAmount, fee: 0, balanceAfter: balAfter,
        currency, date: new Date().toISOString(),
        category: "Transfer", badge: "Transfer",
        badgeBg: "#EFF6FF", badgeBorder: "#BFDBFE", badgeColor: "#2563EB",
        status: "completed", accountId: fromAccountId,
        icon: "↗", iconBg: "linear-gradient(135deg,#DBEAFE,#BFDBFE)", iconColor: "#2563EB",
        reference: genRef(),
        recipientName,
        recipientBank: recipientBank || undefined,
        note: note || undefined,
      };
      const newState = { ...state, accounts: newAccounts, transactions: [newTx, ...state.transactions] };
      setState(newState);
      saveState(newState);
      setTxId(id);
      setNewBalance(newAccounts.find(a => a.id === fromAccountId)?.balance ?? 0);
      setStep("success");
    }, 1800);
  };

  const resetForm = () => {
    setStep(1); setSelectedContact(null); setManualMode(false);
    setRecipient({ name: "", accountNo: "", bank: "" });
    setAmount(""); setCurrency("USD"); setNote(""); setAmountErr("");
  };

  return (
    <DashboardLayout title="Send Money" subtitle="Instant transfers · 0% fees">
      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 24, alignItems: "start" }}>

        {/* ═══ Main transfer panel ═══ */}
        <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, overflow: "hidden" }}>

          {/* ── Stepper ── */}
          {(step === 1 || step === 2 || step === 3) && (
            <div style={{ padding: "24px 28px 20px", borderBottom: `1px solid ${C.border}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 0 }}>
                {["Recipient", "Amount", "Confirm"].map((label, i) => {
                  const n = i + 1;
                  const active = step === n;
                  const done   = (step as number) > n;
                  return (
                    <div key={label} style={{ display: "flex", alignItems: "center", flex: i < 2 ? 1 : "none" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
                        <div style={{ width: 32, height: 32, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, background: done ? "#059669" : active ? C.blue : C.bg, color: done || active ? "#fff" : C.muted, border: done ? "none" : active ? "none" : `1px solid ${C.border}`, transition: "all 0.25s" }}>
                          {done ? "✓" : n}
                        </div>
                        <span style={{ fontSize: 11.5, fontWeight: active ? 600 : 400, color: active ? C.blue : done ? "#059669" : C.muted, whiteSpace: "nowrap" }}>{label}</span>
                      </div>
                      {i < 2 && <div style={{ flex: 1, height: 2, margin: "0 10px 18px", background: done ? "#059669" : C.border, transition: "background 0.25s" }} />}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div style={{ padding: "28px 28px 32px" }}>

            {/* ──────────── STEP 1: Recipient ──────────── */}
            {step === 1 && (
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6, letterSpacing: "-0.2px" }}>Who are you sending to?</p>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Select a saved contact or enter recipient details.</p>

                {/* Quick contacts */}
                {!manualMode && (
                  <>
                    <p style={{ fontSize: 11, fontWeight: 600, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Quick Contacts</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 24 }}>
                      {CONTACTS.map((c, i) => (
                        <div key={i} onClick={() => setSelectedContact(i === selectedContact ? null : i)} style={{ padding: "16px 10px", borderRadius: 16, border: selectedContact === i ? `2px solid ${C.blue}` : `1px solid ${C.border}`, background: selectedContact === i ? "#EEF4FF" : "#FAFBFC", cursor: "pointer", textAlign: "center", transition: "all 0.18s", boxShadow: selectedContact === i ? `0 0 0 3px rgba(26,115,232,0.12)` : "none" }}>
                          <div style={{ width: 44, height: 44, borderRadius: 14, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 700, color: "#fff", margin: "0 auto 8px", boxShadow: "0 4px 12px rgba(15,23,42,0.16)" }}>{c.initials}</div>
                          <p style={{ fontSize: 12.5, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{c.name.split(" ")[0]}</p>
                          <p style={{ fontSize: 11, color: C.muted, marginTop: 2 }}>{c.accountNo}</p>
                        </div>
                      ))}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24 }}>
                      <div style={{ flex: 1, height: 1, background: C.border }} />
                      <span style={{ fontSize: 12, color: C.muted }}>or enter manually</span>
                      <div style={{ flex: 1, height: 1, background: C.border }} />
                    </div>
                  </>
                )}

                {/* Manual form */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 8 }}>
                  {[
                    { label: "Recipient Name", key: "name",      placeholder: "Full name",       value: recipient.name },
                    { label: "Account Number", key: "accountNo", placeholder: "Account or IBAN", value: recipient.accountNo },
                    { label: "Bank / Institution", key: "bank",  placeholder: "Bank name",       value: recipient.bank },
                  ].map(f => (
                    <div key={f.key} style={{ gridColumn: f.key === "bank" ? "1" : "auto" }}>
                      <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, display: "block", marginBottom: 6 }}>{f.label}</label>
                      <input value={f.value} onChange={e => { setManualMode(true); setSelectedContact(null); setRecipient(r => ({ ...r, [f.key]: e.target.value })); }} placeholder={f.placeholder}
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 13.5, color: C.text, background: C.bg, outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.18s, box-shadow 0.18s" }}
                        onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.08)"; e.target.style.background = "#fff"; }}
                        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; e.target.style.background = C.bg; }}
                      />
                    </div>
                  ))}
                </div>

                <button onClick={() => setStep(2)} disabled={!canProceedStep1} style={{ marginTop: 20, width: "100%", padding: "14px", borderRadius: 14, border: "none", background: canProceedStep1 ? "linear-gradient(135deg,#1A73E8,#1558b0)" : C.bg, color: canProceedStep1 ? "#fff" : C.muted, fontSize: 14, fontWeight: 600, cursor: canProceedStep1 ? "pointer" : "not-allowed", fontFamily: "inherit", boxShadow: canProceedStep1 ? "0 4px 16px rgba(26,115,232,0.28)" : "none", transition: "all 0.2s" }}>
                  Continue →
                </button>
              </div>
            )}

            {/* ──────────── STEP 2: Amount ──────────── */}
            {step === 2 && (
              <div>
                {/* Recipient pill */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: C.bg, borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: 28 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: selectedContact !== null ? CONTACTS[selectedContact].bg : "linear-gradient(135deg,#64748B,#475569)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff" }}>{recipientName.split(" ").map(w => w[0]).join("").slice(0, 2)}</div>
                  <div>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text }}>{recipientName}</p>
                    <p style={{ fontSize: 12, color: C.muted }}>{recipientBank}</p>
                  </div>
                  <button onClick={() => setStep(1)} style={{ marginLeft: "auto", fontSize: 12, color: C.blue, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Change</button>
                </div>

                <p style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6, letterSpacing: "-0.2px" }}>How much?</p>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 22 }}>Enter the amount to send.</p>

                {/* From account */}
                <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, display: "block", marginBottom: 6 }}>From Account</label>
                <select value={fromAccountId} onChange={e => { setFromAccountId(e.target.value); setAmount(""); setAmountErr(""); }}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 13.5, color: C.text, background: "#fff", outline: "none", fontFamily: "inherit", cursor: "pointer", marginBottom: 18, appearance: "none", backgroundImage: "url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 12 12%22><path fill=%22%2394A3B8%22 d=%22M6 8L1 3h10z%22/></svg>')", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}
                >
                  {state.accounts.filter(a => !a.frozen && a.type !== "crypto").map(a => (
                    <option key={a.id} value={a.id}>{a.flag} {a.name} — {a.symbol}{a.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</option>
                  ))}
                </select>

                {/* Amount + currency */}
                <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, display: "block", marginBottom: 6 }}>Amount</label>
                <div style={{ display: "flex", gap: 10, marginBottom: amountErr ? 6 : 18 }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 18, fontWeight: 600, color: C.muted, pointerEvents: "none" }}>{fromAccount?.symbol ?? "$"}</span>
                    <input type="number" min="0" step="0.01" value={amount} onChange={e => { setAmount(e.target.value); validateAmount(e.target.value); }}
                      placeholder="0.00"
                      style={{ width: "100%", padding: "13px 14px 13px 34px", borderRadius: 12, border: `1.5px solid ${amountErr ? "#EF4444" : C.border}`, fontSize: 22, fontWeight: 800, color: C.text, background: C.bg, outline: "none", fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.18s, box-shadow 0.18s", letterSpacing: "-0.5px" }}
                      onFocus={e => { e.target.style.borderColor = amountErr ? "#EF4444" : C.blue; e.target.style.boxShadow = `0 0 0 3px ${amountErr ? "rgba(239,68,68,0.1)" : "rgba(26,115,232,0.08)"}`; e.target.style.background = "#fff"; }}
                      onBlur={e => { e.target.style.borderColor = amountErr ? "#EF4444" : C.border; e.target.style.boxShadow = "none"; e.target.style.background = C.bg; }}
                    />
                  </div>
                  <select value={currency} onChange={e => setCurrency(e.target.value)}
                    style={{ width: 90, padding: "13px 10px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 13.5, fontWeight: 600, color: C.text, background: "#fff", outline: "none", fontFamily: "inherit", cursor: "pointer", appearance: "none", textAlign: "center" }}
                  >
                    {["USD","EUR","GBP"].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                {amountErr && <p style={{ fontSize: 12, color: "#EF4444", marginBottom: 14 }}>⚠ {amountErr}</p>}

                {/* Exchange rate info */}
                {fromAccount && fromAccount.currency !== currency && numAmount > 0 && (
                  <div style={{ padding: "10px 14px", background: "#EEF4FF", borderRadius: 10, border: "1px solid rgba(26,115,232,0.15)", marginBottom: 18, fontSize: 12.5, color: C.blue }}>
                    ℹ {numAmount.toFixed(2)} {fromAccount.currency} → {(numAmount * rate).toFixed(6)} {currency} (rate: {rate.toFixed(4)})
                  </div>
                )}

                {/* Note */}
                <label style={{ fontSize: 12, fontWeight: 600, color: C.sub, display: "block", marginBottom: 6 }}>Reference / Note <span style={{ fontWeight: 400, color: C.muted }}>(optional)</span></label>
                <input value={note} onChange={e => setNote(e.target.value)} placeholder="e.g. Rent, dinner, loan repayment…"
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 13.5, color: C.text, background: C.bg, outline: "none", fontFamily: "inherit", boxSizing: "border-box", marginBottom: 18, transition: "border-color 0.18s, box-shadow 0.18s" }}
                  onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.08)"; e.target.style.background = "#fff"; }}
                  onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; e.target.style.background = C.bg; }}
                />

                {/* Fee info */}
                <div style={{ padding: "12px 16px", background: "#ECFDF5", borderRadius: 12, border: "1px solid #A7F3D0", marginBottom: 22, display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 16 }}>✓</span>
                  <span style={{ fontSize: 13, color: "#059669", fontWeight: 500 }}>0% transfer fee · Instant arrival · Encrypted</span>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setStep(1)} style={{ padding: "13px 20px", borderRadius: 14, border: `1px solid ${C.border}`, background: "transparent", color: C.sub, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
                  <button onClick={() => setStep(3)} disabled={!canProceedStep2} style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: canProceedStep2 ? "linear-gradient(135deg,#1A73E8,#1558b0)" : C.bg, color: canProceedStep2 ? "#fff" : C.muted, fontSize: 14, fontWeight: 600, cursor: canProceedStep2 ? "pointer" : "not-allowed", fontFamily: "inherit", boxShadow: canProceedStep2 ? "0 4px 16px rgba(26,115,232,0.28)" : "none", transition: "all 0.2s" }}>
                    Review Transfer →
                  </button>
                </div>
              </div>
            )}

            {/* ──────────── STEP 3: Review ──────────── */}
            {step === 3 && (
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6, letterSpacing: "-0.2px" }}>Review your transfer</p>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Please confirm the details below before sending.</p>

                {/* Summary card */}
                <div style={{ background: C.bg, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 24 }}>
                  {[
                    { label: "From",         value: `${fromAccount?.flag ?? ""} ${fromAccount?.name ?? ""}` },
                    { label: "To",           value: recipientName },
                    { label: "Bank",         value: recipientBank || "Vaulte Network" },
                    { label: "Amount",       value: `${fromAccount?.symbol ?? "$"}${numAmount.toFixed(2)} ${fromAccount?.currency ?? "USD"}` },
                    { label: "Fee",          value: "Free (0%)" },
                    { label: "You send",     value: `${fromAccount?.symbol ?? "$"}${total.toFixed(2)} ${fromAccount?.currency ?? "USD"}` },
                    { label: "Est. arrival", value: "Instant" },
                    ...(note ? [{ label: "Reference", value: note }] : []),
                  ].map((row, i, arr) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none", background: row.label === "You send" ? "#EEF4FF" : "transparent" }}>
                      <span style={{ fontSize: 13, color: C.muted }}>{row.label}</span>
                      <span style={{ fontSize: 13.5, fontWeight: row.label === "You send" ? 800 : 600, color: row.label === "You send" ? C.blue : C.text, letterSpacing: row.label === "You send" ? "-0.3px" : "normal" }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setStep(2)} style={{ padding: "13px 20px", borderRadius: 14, border: `1px solid ${C.border}`, background: "transparent", color: C.sub, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
                  <button onClick={handleConfirm} style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#1A73E8,#1558b0)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(26,115,232,0.28)", transition: "all 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(26,115,232,0.38)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(26,115,232,0.28)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}
                  >
                    ✓ Confirm &amp; Send
                  </button>
                </div>
              </div>
            )}

            {/* ──────────── PROCESSING ──────────── */}
            {step === "processing" && (
              <div style={{ textAlign: "center", padding: "48px 20px" }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", border: `3px solid ${C.blue}`, borderTop: "3px solid transparent", margin: "0 auto 24px", animation: "spin 0.8s linear infinite" }} />
                <p style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>Processing Transfer…</p>
                <p style={{ fontSize: 13.5, color: C.muted }}>Securely encrypting and sending your payment.</p>
              </div>
            )}

            {/* ──────────── SUCCESS ──────────── */}
            {step === "success" && (
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ width: 72, height: 72, borderRadius: "50%", background: "linear-gradient(135deg,#22C55E,#16A34A)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 8px 24px rgba(34,197,94,0.3)", fontSize: 32, color: "#fff" }}>✓</div>
                <p style={{ fontSize: 22, fontWeight: 800, color: C.text, marginBottom: 6, letterSpacing: "-0.5px" }}>Transfer Sent!</p>
                <p style={{ fontSize: 13.5, color: C.muted, marginBottom: 28 }}>
                  {fromAccount?.symbol ?? "$"}{numAmount.toFixed(2)} sent to {recipientName}
                </p>

                <div style={{ background: C.bg, borderRadius: 16, border: `1px solid ${C.border}`, padding: "18px 20px", marginBottom: 28, textAlign: "left" }}>
                  {[
                    { label: "Transaction ID", value: txId.slice(0, 20) + "…" },
                    { label: "New Balance",    value: `${fromAccount?.symbol ?? "$"}${newBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                    { label: "Status",         value: "✓ Completed" },
                    { label: "Date",           value: new Date().toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) },
                  ].map((r, i) => (
                    <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: i < 3 ? `1px solid ${C.border}` : "none" }}>
                      <span style={{ fontSize: 12.5, color: C.muted }}>{r.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: r.label === "Status" ? "#059669" : C.text }}>{r.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={resetForm} style={{ flex: 1, padding: "13px", borderRadius: 14, border: `1px solid ${C.border}`, background: "transparent", color: C.sub, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>New Transfer</button>
                  <button onClick={() => router.push("/dashboard")} style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#1A73E8,#1558b0)", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(26,115,232,0.28)" }}>← Dashboard</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ═══ Sidebar: Recent transfers ═══ */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          {/* Info card */}
          <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "22px 20px" }}>
            <p style={{ fontSize: 14.5, fontWeight: 700, color: C.text, marginBottom: 16, letterSpacing: "-0.2px" }}>Transfer Info</p>
            {[
              { icon: "⚡", label: "Instant transfers",    sub: "Arrives in seconds" },
              { icon: "🔒", label: "Bank-level security",  sub: "256-bit encryption" },
              { icon: "💸", label: "Zero fees",            sub: "Free to all accounts" },
              { icon: "🌍", label: "140+ currencies",      sub: "via exchange feature" },
            ].map(i => (
              <div key={i.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: `1px solid ${C.border}` }}>
                <span style={{ fontSize: 20 }}>{i.icon}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{i.label}</p>
                  <p style={{ fontSize: 11.5, color: C.muted }}>{i.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent transfers */}
          <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "22px 20px" }}>
            <p style={{ fontSize: 14.5, fontWeight: 700, color: C.text, marginBottom: 16, letterSpacing: "-0.2px" }}>Recent Transfers</p>
            {state.transactions.filter(t => t.category === "Transfer").slice(0, 4).map((tx, i, arr) => (
              <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 11, background: tx.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: tx.iconColor }}>{tx.icon}</div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{tx.name.replace("Transfer to ", "")}</p>
                    <p style={{ fontSize: 11, color: C.muted }}>{fmtDate(tx.date)}</p>
                  </div>
                </div>
                <p style={{ fontSize: 13.5, fontWeight: 700, color: tx.type === "credit" ? "#059669" : C.text }}>
                  {tx.type === "credit" ? "+" : "−"}${tx.amount.toFixed(2)}
                </p>
              </div>
            ))}
            {state.transactions.filter(t => t.category === "Transfer").length === 0 && (
              <p style={{ fontSize: 13, color: C.muted, textAlign: "center", padding: "16px 0" }}>No transfer history yet.</p>
            )}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
      `}</style>
    </DashboardLayout>
  );
}
