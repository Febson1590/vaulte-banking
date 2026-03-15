"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import {
  getState, saveState, VaulteState, DEFAULT_STATE, Transaction,
  genTxId, genRef, fmtDate, getRecipients, addRecipient, Recipient,
  RecipientType, getCurrentUser,
} from "@/lib/vaulteState";
import {
  US_BANKS, BankEntry, validateRoutingNumber, validateAccountNumber,
  lookupBank, searchBanks, maskAccountNumber, getTransferFees,
  simulateVerification, VerificationResult,
} from "@/lib/transferData";

// ─── Design Tokens ───────────────────────────────────────────
const C = {
  bg:     "#F3F5FA",
  card:   "#ffffff",
  navy:   "#0F172A",
  blue:   "#1A73E8",
  border: "rgba(15,23,42,0.07)",
  muted:  "#94A3B8",
  text:   "#0F172A",
  sub:    "#64748B",
  shadow: "0 1px 3px rgba(15,23,42,0.05), 0 6px 20px rgba(15,23,42,0.07)",
} as const;

const AVATAR_GRADIENTS = [
  "linear-gradient(145deg,#2563EB,#1d4ed8)",
  "linear-gradient(145deg,#374151,#1f2937)",
  "linear-gradient(145deg,#7C3AED,#6d28d9)",
  "linear-gradient(145deg,#059669,#047857)",
  "linear-gradient(145deg,#DC2626,#b91c1c)",
  "linear-gradient(145deg,#D97706,#b45309)",
];

function getInitials(name: string): string {
  return name.split(" ").filter(Boolean).map(w => w[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Step Types ──────────────────────────────────────────────
type Step = 1 | 2 | 3 | 4 | "processing" | "success";

// ─── Internal Transfer Form ──────────────────────────────────
interface InternalForm {
  lookup: string;         // email / Vaulte ID / name
  resolvedName: string;
  resolvedAcct: string;
  resolvedEmail: string;
}

// ─── ACH / Wire Form ────────────────────────────────────────
interface BankForm {
  recipientName:   string;
  routingNumber:   string;
  accountNumber:   string;
  confirmAccount:  string;
  accountType:     "checking" | "savings";
  bankName:        string;
  bankCity:        string;
  bankState:       string;
  bankAddress:     string; // wire only (optional)
  memo:            string;
}

const emptyBankForm = (): BankForm => ({
  recipientName: "", routingNumber: "", accountNumber: "",
  confirmAccount: "", accountType: "checking", bankName: "",
  bankCity: "", bankState: "", bankAddress: "", memo: "",
});

export default function TransferPage() {
  const router = useRouter();
  const [state, setState]             = useState<VaulteState>(DEFAULT_STATE);
  const [savedRecipients, setSaved]   = useState<Recipient[]>([]);
  const [kycStatus, setKycStatus]     = useState<"verified"|"pending"|"none">("none");
  const [userId, setUserId]           = useState<string>("");

  // ── Step 1: Transfer type ──────────────────────────────────
  const [step, setStep]                       = useState<Step>(1);
  const [transferType, setTransferType]       = useState<RecipientType | "">("");

  // ── Step 2: Recipient ──────────────────────────────────────
  const [selectedSaved, setSelectedSaved]     = useState<Recipient | null>(null);
  const [internalForm, setInternalForm]       = useState<InternalForm>({ lookup: "", resolvedName: "", resolvedAcct: "", resolvedEmail: "" });
  const [bankForm, setBankForm]               = useState<BankForm>(emptyBankForm());

  // Bank autocomplete
  const [bankSearch, setBankSearch]           = useState("");
  const [bankDropdown, setBankDropdown]       = useState<BankEntry[]>([]);
  const [showBankDrop, setShowBankDrop]       = useState(false);
  const bankDropRef                           = useRef<HTMLDivElement>(null);

  // Routing number state
  const [routingErr, setRoutingErr]           = useState("");
  const [routingInfo, setRoutingInfo]         = useState<BankEntry | null>(null);
  const [accountErr, setAccountErr]           = useState("");
  const [confirmErr, setConfirmErr]           = useState("");
  const [verificationResult, setVerification] = useState<VerificationResult | null>(null);
  const [verifying, setVerifying]             = useState(false);

  // ── Step 3: Amount ─────────────────────────────────────────
  const [fromAccountId, setFromAccountId]     = useState("");
  const [amount, setAmount]                   = useState("");
  const [amountErr, setAmountErr]             = useState("");

  // ── Step 4: Review ─────────────────────────────────────────
  // (derived from above)

  // ── Result ─────────────────────────────────────────────────
  const [txRef, setTxRef]                     = useState("");
  const [newBalance, setNewBalance]           = useState(0);
  const [saveAfter, setSaveAfter]             = useState(false);
  const [saved, setSavedDone]                 = useState(false);

  // ── Init ──────────────────────────────────────────────────
  useEffect(() => {
    const s = getState();
    setState(s);
    const first = s.accounts.find(a => !a.frozen && a.type !== "crypto");
    setFromAccountId(first?.id ?? s.accounts[0]?.id ?? "");
    const user = getCurrentUser();
    if (user) {
      setKycStatus(user.kycStatus as "verified" | "pending" | "none");
      setUserId(user.id);
      setSaved(getRecipients(user.id));
    }
  }, []);

  // Close bank dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (bankDropRef.current && !bankDropRef.current.contains(e.target as Node)) {
        setShowBankDrop(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Derived ──────────────────────────────────────────────
  const fromAccount  = state.accounts.find(a => a.id === fromAccountId) ?? state.accounts[0];
  const numAmount    = parseFloat(amount) || 0;
  const feeInfo      = transferType ? getTransferFees(transferType as RecipientType, numAmount) : { fee: 0, feeLabel: "Free", deliveryTime: "instant", deliveryLabel: "Instant" };
  const totalSend    = numAmount + feeInfo.fee;

  // Who is the recipient?
  const recipientName = selectedSaved
    ? selectedSaved.recipientName
    : transferType === "internal_vaulte"
      ? internalForm.resolvedName
      : bankForm.recipientName;

  const recipientBankName = selectedSaved
    ? selectedSaved.bankName
    : transferType === "internal_vaulte"
      ? "Vaulte"
      : (bankForm.bankName || routingInfo?.name || "—");

  const recipientAcctMasked = selectedSaved
    ? selectedSaved.accountNumberMasked
    : transferType === "internal_vaulte"
      ? (internalForm.resolvedAcct ? maskAccountNumber(internalForm.resolvedAcct) : "—")
      : (bankForm.accountNumber ? maskAccountNumber(bankForm.accountNumber) : "—");

  const recipientEmail = selectedSaved?.email ?? (transferType === "internal_vaulte" ? internalForm.resolvedEmail : undefined);
  const memo = transferType === "internal_vaulte" ? "" : bankForm.memo;

  // ── Step-by-step validation ──────────────────────────────
  const step1Valid = transferType !== "";

  const step2Valid = (() => {
    if (selectedSaved) return true;
    if (transferType === "internal_vaulte") {
      return internalForm.resolvedName.trim() !== "";
    }
    if (transferType === "ach" || transferType === "wire") {
      const f = bankForm;
      const rOk = validateRoutingNumber(f.routingNumber).valid;
      const aOk = validateAccountNumber(f.accountNumber).valid;
      const match = f.accountNumber.replace(/\D/g,"") === f.confirmAccount.replace(/\D/g,"");
      return f.recipientName.trim() !== "" && rOk && aOk && match;
    }
    return false;
  })();

  const step3Valid = numAmount > 0 && numAmount <= (fromAccount?.balance ?? 0) && !amountErr;

  // ── Handlers ─────────────────────────────────────────────

  // Routing number change: validate + auto-fill bank
  const handleRoutingChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 9);
    setBankForm(f => ({ ...f, routingNumber: digits }));
    setRoutingErr("");
    setRoutingInfo(null);
    setVerification(null);

    if (digits.length === 9) {
      const result = validateRoutingNumber(digits);
      if (!result.valid) {
        setRoutingErr(result.message ?? "Invalid routing number");
        return;
      }
      const bank = lookupBank(digits);
      if (bank) {
        setRoutingInfo(bank);
        setBankForm(f => ({ ...f, bankName: bank.name, bankCity: bank.city, bankState: bank.state }));
        setBankSearch(bank.name);
      } else {
        setRoutingErr("Routing number not found in directory. Please enter bank name manually.");
      }
    }
  };

  // Account number change
  const handleAccountChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 17);
    setBankForm(f => ({ ...f, accountNumber: digits }));
    setVerification(null);
    if (!digits) { setAccountErr(""); return; }
    const r = validateAccountNumber(digits);
    setAccountErr(r.valid ? "" : (r.message ?? ""));
    // Re-check confirm
    if (bankForm.confirmAccount) {
      setConfirmErr(bankForm.confirmAccount.replace(/\D/g,"") !== digits ? "Account numbers do not match." : "");
    }
  };

  // Confirm account change
  const handleConfirmChange = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 17);
    setBankForm(f => ({ ...f, confirmAccount: digits }));
    setConfirmErr(
      digits && digits !== bankForm.accountNumber.replace(/\D/g,"")
        ? "Account numbers do not match."
        : ""
    );
  };

  // Bank search autocomplete
  const handleBankSearch = (q: string) => {
    setBankSearch(q);
    setBankForm(f => ({ ...f, bankName: q }));
    if (q.length >= 1) {
      setBankDropdown(searchBanks(q));
      setShowBankDrop(true);
    } else {
      setShowBankDrop(false);
    }
  };

  const selectBankFromDropdown = (bank: BankEntry) => {
    setRoutingInfo(bank);
    setBankSearch(bank.name);
    setBankForm(f => ({
      ...f,
      bankName:     bank.name,
      bankCity:     bank.city,
      bankState:    bank.state,
      routingNumber: bank.routingNumber,
    }));
    setRoutingErr("");
    setShowBankDrop(false);
  };

  // Simulate recipient verification (called when advancing from step 2)
  const runVerification = () => {
    if (transferType !== "ach" && transferType !== "wire") return;
    if (verificationResult) return; // already ran
    setVerifying(true);
    setTimeout(() => {
      const result = simulateVerification(
        bankForm.routingNumber,
        bankForm.accountNumber,
        bankForm.recipientName
      );
      setVerification(result);
      setVerifying(false);
    }, 900);
  };

  // Internal lookup simulation
  const handleInternalLookup = () => {
    const q = internalForm.lookup.trim().toLowerCase();
    if (!q) return;
    // Simulate a match against demo recipients + saved recipients
    const match = savedRecipients.find(r =>
      r.recipientType === "internal_vaulte" &&
      (r.email?.toLowerCase().includes(q) || r.recipientName.toLowerCase().includes(q))
    );
    if (match) {
      setInternalForm(f => ({
        ...f,
        resolvedName:  match.recipientName,
        resolvedAcct:  match.accountNumberMasked.replace(/•/g,""),
        resolvedEmail: match.email ?? "",
      }));
    } else {
      // Seed some fictional Vaulte users for demo
      const SEED: Array<{ q: string[]; name: string; acct: string; email: string }> = [
        { q: ["emily", "emily.chen", "emily.chen@email.com", "vlte-10293"], name: "Emily Chen",    acct: "5582290",  email: "emily.chen@email.com" },
        { q: ["sarah", "sarahj", "sarah.johnson@email.com"],                name: "Sarah Johnson", acct: "4821",     email: "sarah.johnson@email.com" },
        { q: ["marcus", "marcus.davis@email.com", "vlte-20034"],            name: "Marcus Davis",  acct: "9900112",  email: "marcus.davis@email.com" },
      ];
      const hit = SEED.find(s => s.q.some(k => q.includes(k) || k.includes(q)));
      if (hit) {
        setInternalForm(f => ({ ...f, resolvedName: hit.name, resolvedAcct: hit.acct, resolvedEmail: hit.email }));
      } else {
        setInternalForm(f => ({ ...f, resolvedName: "", resolvedAcct: "", resolvedEmail: "" }));
      }
    }
  };

  // Amount validation
  const validateAmount = (val: string) => {
    const n = parseFloat(val);
    if (!val) { setAmountErr(""); return; }
    if (isNaN(n) || n <= 0) { setAmountErr("Enter a valid amount."); return; }
    if (n < 0.01) { setAmountErr("Minimum transfer amount is $0.01."); return; }
    if (fromAccount && n + feeInfo.fee > fromAccount.balance) {
      const avail = fromAccount.balance - feeInfo.fee;
      setAmountErr(`Insufficient balance. Max you can send: ${fromAccount.symbol}${Math.max(0, avail).toFixed(2)}.`);
      return;
    }
    setAmountErr("");
  };

  // Confirm & process transfer
  const handleConfirm = () => {
    setStep("processing");
    setTimeout(() => {
      const ref      = genRef();
      const id       = genTxId();
      const balAfter = parseFloat((fromAccount.balance - totalSend).toFixed(8));

      const newTx: Transaction = {
        id,
        txType:      "transfer_out",
        type:        "debit",
        name:        `Transfer to ${recipientName}`,
        sub:         recipientBankName,
        amount:      numAmount,
        fee:         feeInfo.fee,
        balanceAfter: balAfter,
        currency:    fromAccount.currency,
        date:        new Date().toISOString(),
        category:    "Transfer",
        badge:       transferType === "wire" ? "Wire" : transferType === "ach" ? "ACH" : "Vaulte",
        badgeBg:     "#EFF6FF", badgeBorder: "#BFDBFE", badgeColor: "#2563EB",
        status:      transferType === "ach" ? "pending" : "completed",
        accountId:   fromAccountId,
        icon:        "↗",
        iconBg:      "linear-gradient(135deg,#DBEAFE,#BFDBFE)",
        iconColor:   "#2563EB",
        reference:   ref,
        recipientName,
        recipientBank: recipientBankName,
        note:        memo || undefined,
      };

      const newAccounts = state.accounts.map(a =>
        a.id === fromAccountId ? { ...a, balance: balAfter } : a
      );
      const newState = { ...state, accounts: newAccounts, transactions: [newTx, ...state.transactions] };
      setState(newState);
      saveState(newState);
      setTxRef(ref);
      setNewBalance(balAfter);
      setStep("success");
    }, 2000);
  };

  // Save recipient after success
  const handleSaveRecipient = () => {
    if (!userId || saved) return;
    const routingNum = transferType === "internal_vaulte"
      ? undefined
      : bankForm.routingNumber || selectedSaved?.routingNumber;
    addRecipient(userId, {
      recipientType:       (transferType || "ach") as RecipientType,
      recipientName,
      bankName:            recipientBankName,
      routingNumber:       routingNum,
      accountNumberMasked: recipientAcctMasked,
      accountType:         bankForm.accountType || selectedSaved?.accountType || "checking",
      email:               recipientEmail,
      lastUsed:            new Date().toISOString(),
    });
    setSavedDone(true);
  };

  // Reset entire form
  const resetForm = () => {
    setStep(1); setTransferType("");
    setSelectedSaved(null);
    setInternalForm({ lookup: "", resolvedName: "", resolvedAcct: "", resolvedEmail: "" });
    setBankForm(emptyBankForm());
    setBankSearch(""); setRoutingInfo(null); setRoutingErr(""); setAccountErr(""); setConfirmErr("");
    setVerification(null); setVerifying(false);
    setAmount(""); setAmountErr("");
    setTxRef(""); setSaveAfter(false); setSavedDone(false);
    const s = getState();
    const first = s.accounts.find(a => !a.frozen && a.type !== "crypto");
    setFromAccountId(first?.id ?? "");
  };

  // ─── KYC Gate ───────────────────────────────────────────
  if (kycStatus !== "verified") {
    return (
      <DashboardLayout title="Send Money" subtitle="U.S. bank transfers · ACH · Wire">
        <div style={{ maxWidth: 480, margin: "48px auto", textAlign: "center" }}>
          <div style={{ background: C.card, borderRadius: 24, padding: "48px 40px", border: `1px solid ${C.border}`, boxShadow: C.shadow }}>
            <div style={{ width: 80, height: 80, borderRadius: "50%", background: kycStatus === "pending" ? "#FEF3C7" : "#FEF2F2", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, margin: "0 auto 24px" }}>
              {kycStatus === "pending" ? "⏳" : "🔒"}
            </div>
            <h2 style={{ fontSize: 21, fontWeight: 800, color: C.text, marginBottom: 10 }}>
              {kycStatus === "pending" ? "Verification In Progress" : "Identity Verification Required"}
            </h2>
            <p style={{ fontSize: 14, color: C.muted, lineHeight: 1.75, marginBottom: 28 }}>
              {kycStatus === "pending"
                ? "Your KYC submission is under review. Transfers will be unlocked once approved, usually within 24 hours."
                : "Complete KYC verification to unlock transfers. This protects you and ensures regulatory compliance."}
            </p>
            {kycStatus !== "pending" && (
              <a href="/dashboard/settings" style={{ display: "inline-block", padding: "13px 32px", borderRadius: 14, background: "linear-gradient(135deg,#1A73E8,#1558b0)", color: "#fff", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>
                Complete Verification →
              </a>
            )}
            {kycStatus === "pending" && (
              <div style={{ padding: "14px 18px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, fontSize: 13, color: "#92400E", fontWeight: 500 }}>
                ⏳ Estimated approval: within 24 hours
              </div>
            )}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // ─── Step Labels ────────────────────────────────────────
  const STEP_LABELS = ["Type", "Recipient", "Amount", "Review"];

  // ─── Stepper Component ───────────────────────────────────
  const StepIndicator = () => {
    const currentStep = typeof step === "number" ? step : 5;
    return (
      <div className="transfer-stepper" style={{ padding: "22px 28px 18px", borderBottom: `1px solid ${C.border}` }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          {STEP_LABELS.map((label, i) => {
            const n = i + 1;
            const active = currentStep === n;
            const done   = currentStep > n;
            return (
              <div key={label} style={{ display: "flex", alignItems: "center", flex: i < 3 ? 1 : "none" }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, background: done ? "#059669" : active ? C.blue : C.bg, color: done || active ? "#fff" : C.muted, border: done || active ? "none" : `1px solid ${C.border}`, transition: "all 0.25s", flexShrink: 0 }}>
                    {done ? "✓" : n}
                  </div>
                  <span style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? C.blue : done ? "#059669" : C.muted, whiteSpace: "nowrap" }}>{label}</span>
                </div>
                {i < 3 && <div style={{ flex: 1, height: 2, margin: "0 8px 18px", background: done ? "#059669" : C.border, transition: "background 0.3s" }} />}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // ─── Input style helpers ────────────────────────────────
  const inputStyle = (err?: string): React.CSSProperties => ({
    width: "100%", padding: "11px 14px", borderRadius: 12,
    border: `1.5px solid ${err ? "#EF4444" : C.border}`,
    fontSize: 13.5, color: C.text, background: C.bg, outline: "none",
    fontFamily: "inherit", boxSizing: "border-box", transition: "border-color 0.18s, box-shadow 0.18s",
  });

  const labelStyle: React.CSSProperties = {
    fontSize: 12, fontWeight: 600, color: C.sub, display: "block", marginBottom: 6,
  };

  // ─── Main UI ────────────────────────────────────────────
  return (
    <DashboardLayout title="Send Money" subtitle="U.S. bank transfers · ACH · Wire · Vaulte">
      <div className="transfer-main-grid" style={{ display: "grid", gridTemplateColumns: "1fr 308px", gap: 24, alignItems: "start" }}>

        {/* ══════════════ MAIN PANEL ══════════════ */}
        <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, overflow: "hidden" }}>

          {/* Stepper (shown on steps 1-4) */}
          {typeof step === "number" && <StepIndicator />}

          <div className="transfer-panel-body" style={{ padding: "28px 28px 32px" }}>

            {/* ══════ STEP 1: Transfer Type ══════ */}
            {step === 1 && (
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 6, letterSpacing: "-0.2px" }}>How would you like to send?</p>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 26 }}>Choose the transfer method that fits your needs.</p>

                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {[
                    {
                      type: "internal_vaulte" as RecipientType,
                      icon: "⚡",
                      iconBg: "linear-gradient(135deg,#EEF4FF,#DBEAFE)",
                      iconColor: C.blue,
                      title: "Vaulte Transfer",
                      desc: "Send instantly to another Vaulte user by email or Vaulte ID.",
                      fee: "Free · Instant",
                      badge: "Recommended",
                      badgeBg: "#EEF4FF",
                      badgeColor: C.blue,
                    },
                    {
                      type: "ach" as RecipientType,
                      icon: "🏦",
                      iconBg: "linear-gradient(135deg,#F0FDF4,#D1FAE5)",
                      iconColor: "#059669",
                      title: "ACH Transfer",
                      desc: "Send to any U.S. bank account using routing and account number.",
                      fee: "Free · 1–3 Business Days",
                      badge: "Most Common",
                      badgeBg: "#F0FDF4",
                      badgeColor: "#059669",
                    },
                    {
                      type: "wire" as RecipientType,
                      icon: "🔀",
                      iconBg: "linear-gradient(135deg,#FFFBEB,#FDE68A)",
                      iconColor: "#D97706",
                      title: "Wire Transfer",
                      desc: "Guaranteed same-day delivery for urgent or large transfers.",
                      fee: "$15 fee · Same Business Day",
                      badge: "Urgent",
                      badgeBg: "#FFFBEB",
                      badgeColor: "#D97706",
                    },
                  ].map(opt => (
                    <div key={opt.type} onClick={() => setTransferType(opt.type)}
                      style={{ display: "flex", alignItems: "center", gap: 16, padding: "18px 20px", borderRadius: 16, border: transferType === opt.type ? `2px solid ${C.blue}` : `1.5px solid ${C.border}`, background: transferType === opt.type ? "#EEF4FF" : "#FAFBFC", cursor: "pointer", transition: "all 0.18s", boxShadow: transferType === opt.type ? `0 0 0 4px rgba(26,115,232,0.1)` : "none" }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: opt.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, flexShrink: 0 }}>
                        {opt.icon}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                          <span style={{ fontSize: 14.5, fontWeight: 700, color: C.text }}>{opt.title}</span>
                          <span style={{ fontSize: 10.5, fontWeight: 700, color: opt.badgeColor, background: opt.badgeBg, padding: "2px 8px", borderRadius: 20 }}>{opt.badge}</span>
                        </div>
                        <p style={{ fontSize: 12.5, color: C.muted, marginBottom: 2, lineHeight: 1.4 }}>{opt.desc}</p>
                        <p style={{ fontSize: 11.5, color: opt.iconColor, fontWeight: 600 }}>{opt.fee}</p>
                      </div>
                      <div style={{ width: 20, height: 20, borderRadius: "50%", border: transferType === opt.type ? `none` : `2px solid ${C.border}`, background: transferType === opt.type ? C.blue : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        {transferType === opt.type && <span style={{ color: "#fff", fontSize: 11, fontWeight: 700 }}>✓</span>}
                      </div>
                    </div>
                  ))}
                </div>

                <button onClick={() => setStep(2)} disabled={!step1Valid}
                  style={{ marginTop: 28, width: "100%", padding: "14px", borderRadius: 14, border: "none", background: step1Valid ? "linear-gradient(135deg,#1A73E8,#1558b0)" : C.bg, color: step1Valid ? "#fff" : C.muted, fontSize: 14, fontWeight: 700, cursor: step1Valid ? "pointer" : "not-allowed", fontFamily: "inherit", boxShadow: step1Valid ? "0 4px 16px rgba(26,115,232,0.28)" : "none", transition: "all 0.2s" }}>
                  Continue →
                </button>
              </div>
            )}

            {/* ══════ STEP 2: Recipient Details ══════ */}
            {step === 2 && (
              <div>
                {/* Transfer type badge */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 20 }}>{transferType === "internal_vaulte" ? "⚡" : transferType === "ach" ? "🏦" : "🔀"}</span>
                    <div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: C.text, letterSpacing: "-0.2px" }}>
                        {transferType === "internal_vaulte" ? "Vaulte Transfer" : transferType === "ach" ? "ACH Transfer" : "Wire Transfer"}
                      </p>
                      <p style={{ fontSize: 12, color: C.muted }}>
                        {transferType === "internal_vaulte" ? "Instant · Free" : transferType === "ach" ? "1–3 Business Days · Free" : "Same Day · $15 fee"}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setStep(1)} style={{ fontSize: 12, color: C.blue, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit" }}>Change</button>
                </div>

                {/* Saved recipients (only those matching transfer type) */}
                {(() => {
                  const filtered = savedRecipients.filter(r => r.recipientType === transferType);
                  if (filtered.length === 0) return null;
                  return (
                    <div style={{ marginBottom: 24 }}>
                      <p style={{ fontSize: 11, fontWeight: 700, color: C.muted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>Saved Recipients</p>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(110px,1fr))", gap: 10, marginBottom: 18 }}>
                        {filtered.map((r, i) => (
                          <div key={r.id} onClick={() => setSelectedSaved(selectedSaved?.id === r.id ? null : r)}
                            style={{ padding: "14px 10px", borderRadius: 14, border: selectedSaved?.id === r.id ? `2px solid ${C.blue}` : `1px solid ${C.border}`, background: selectedSaved?.id === r.id ? "#EEF4FF" : "#FAFBFC", cursor: "pointer", textAlign: "center", transition: "all 0.18s", boxShadow: selectedSaved?.id === r.id ? `0 0 0 3px rgba(26,115,232,0.12)` : "none" }}>
                            <div style={{ width: 40, height: 40, borderRadius: 12, background: AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length], display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", margin: "0 auto 7px" }}>
                              {getInitials(r.recipientName)}
                            </div>
                            <p style={{ fontSize: 12, fontWeight: 600, color: C.text, lineHeight: 1.3 }}>{r.recipientName.split(" ")[0]}</p>
                            <p style={{ fontSize: 10.5, color: C.muted, marginTop: 2 }}>{r.bankName}</p>
                          </div>
                        ))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 22 }}>
                        <div style={{ flex: 1, height: 1, background: C.border }} />
                        <span style={{ fontSize: 12, color: C.muted }}>or enter details manually</span>
                        <div style={{ flex: 1, height: 1, background: C.border }} />
                      </div>
                    </div>
                  );
                })()}

                {/* ── Internal Vaulte form ── */}
                {!selectedSaved && transferType === "internal_vaulte" && (
                  <div>
                    <label style={labelStyle}>Email or Vaulte ID</label>
                    <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                      <input
                        value={internalForm.lookup}
                        onChange={e => { setInternalForm(f => ({ ...f, lookup: e.target.value, resolvedName: "", resolvedAcct: "", resolvedEmail: "" })); }}
                        placeholder="e.g. emily@email.com or vlte-10293"
                        style={{ ...inputStyle(), flex: 1 }}
                        onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.08)"; e.target.style.background = "#fff"; }}
                        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; e.target.style.background = C.bg; }}
                      />
                      <button onClick={handleInternalLookup} disabled={!internalForm.lookup.trim()}
                        style={{ padding: "11px 18px", borderRadius: 12, border: "none", background: internalForm.lookup.trim() ? C.blue : C.bg, color: internalForm.lookup.trim() ? "#fff" : C.muted, fontSize: 13, fontWeight: 700, cursor: internalForm.lookup.trim() ? "pointer" : "not-allowed", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                        Look Up
                      </button>
                    </div>

                    {internalForm.lookup && !internalForm.resolvedName && (
                      <div style={{ padding: "12px 14px", background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: 12, fontSize: 13, color: "#DC2626", marginBottom: 16 }}>
                        ✕ No Vaulte user found. Check the email or Vaulte ID.
                      </div>
                    )}

                    {internalForm.resolvedName && (
                      <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 14, marginBottom: 16 }}>
                        <div style={{ width: 42, height: 42, borderRadius: 13, background: "linear-gradient(135deg,#059669,#047857)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                          {getInitials(internalForm.resolvedName)}
                        </div>
                        <div>
                          <p style={{ fontSize: 14, fontWeight: 700, color: "#059669" }}>{internalForm.resolvedName}</p>
                          <p style={{ fontSize: 12, color: "#16A34A" }}>{internalForm.resolvedEmail} · Vaulte Account</p>
                        </div>
                        <span style={{ marginLeft: "auto", fontSize: 20 }}>✓</span>
                      </div>
                    )}

                    <p style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>
                      ℹ️ This is a simulated lookup. In production, this would search the live Vaulte user directory.
                    </p>
                  </div>
                )}

                {/* ── ACH / Wire form ── */}
                {!selectedSaved && (transferType === "ach" || transferType === "wire") && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                    {/* Recipient Name */}
                    <div>
                      <label style={labelStyle}>Recipient Full Name</label>
                      <input value={bankForm.recipientName} onChange={e => { setBankForm(f => ({ ...f, recipientName: e.target.value })); setVerification(null); }}
                        placeholder="As it appears on the bank account"
                        style={inputStyle()}
                        onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.08)"; e.target.style.background = "#fff"; }}
                        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; e.target.style.background = C.bg; }}
                      />
                    </div>

                    {/* Routing Number */}
                    <div>
                      <label style={labelStyle}>Routing Number (ABA)</label>
                      <div style={{ position: "relative" }}>
                        <input value={bankForm.routingNumber} onChange={e => handleRoutingChange(e.target.value)}
                          placeholder="9-digit routing number"
                          maxLength={9}
                          style={inputStyle(routingErr)}
                          onFocus={e => { e.target.style.borderColor = routingErr ? "#EF4444" : C.blue; e.target.style.boxShadow = `0 0 0 3px ${routingErr ? "rgba(239,68,68,0.08)" : "rgba(26,115,232,0.08)"}`; e.target.style.background = "#fff"; }}
                          onBlur={e => { e.target.style.borderColor = routingErr ? "#EF4444" : C.border; e.target.style.boxShadow = "none"; e.target.style.background = C.bg; }}
                        />
                        {bankForm.routingNumber.length === 9 && !routingErr && routingInfo && (
                          <span style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: "#059669", fontWeight: 600 }}>✓ Validated</span>
                        )}
                      </div>
                      {routingErr && <p style={{ fontSize: 11.5, color: "#EF4444", marginTop: 5 }}>⚠ {routingErr}</p>}
                      {routingInfo && !routingErr && (
                        <div style={{ marginTop: 8, padding: "8px 12px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, fontSize: 12.5, color: "#059669", display: "flex", alignItems: "center", gap: 6 }}>
                          <span>🏦</span>
                          <span><strong>{routingInfo.name}</strong> · {routingInfo.city}, {routingInfo.state}</span>
                        </div>
                      )}
                    </div>

                    {/* Bank Name (autocomplete) */}
                    <div ref={bankDropRef} style={{ position: "relative" }}>
                      <label style={labelStyle}>Bank Name</label>
                      <input value={bankSearch} onChange={e => handleBankSearch(e.target.value)}
                        onFocus={() => { if (bankSearch.length >= 1) { setBankDropdown(searchBanks(bankSearch)); setShowBankDrop(true); } }}
                        placeholder="Search or type bank name…"
                        style={inputStyle()}
                        onFocusCapture={e => { e.target.style.borderColor = C.blue; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.08)"; e.target.style.background = "#fff"; }}
                        onBlurCapture={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; e.target.style.background = C.bg; }}
                      />
                      {showBankDrop && bankDropdown.length > 0 && (
                        <div style={{ position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, background: "#fff", border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: "0 8px 32px rgba(15,23,42,0.12)", zIndex: 100, overflow: "hidden" }}>
                          {bankDropdown.map(bank => (
                            <div key={bank.routingNumber} onMouseDown={() => selectBankFromDropdown(bank)}
                              style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 14px", cursor: "pointer", borderBottom: `1px solid ${C.border}`, transition: "background 0.15s" }}
                              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg; }}
                              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#fff"; }}>
                              <span style={{ fontSize: 18 }}>{bank.logo}</span>
                              <div>
                                <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{bank.name}</p>
                                <p style={{ fontSize: 11, color: C.muted }}>{bank.city}, {bank.state} · {bank.routingNumber}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Account Number */}
                    <div>
                      <label style={labelStyle}>Account Number</label>
                      <input value={bankForm.accountNumber} onChange={e => handleAccountChange(e.target.value)}
                        placeholder="4–17 digits, no dashes or spaces"
                        maxLength={17}
                        style={inputStyle(accountErr)}
                        onFocus={e => { e.target.style.borderColor = accountErr ? "#EF4444" : C.blue; e.target.style.boxShadow = `0 0 0 3px ${accountErr ? "rgba(239,68,68,0.08)" : "rgba(26,115,232,0.08)"}`; e.target.style.background = "#fff"; }}
                        onBlur={e => { e.target.style.borderColor = accountErr ? "#EF4444" : C.border; e.target.style.boxShadow = "none"; e.target.style.background = C.bg; }}
                      />
                      {accountErr && <p style={{ fontSize: 11.5, color: "#EF4444", marginTop: 5 }}>⚠ {accountErr}</p>}
                    </div>

                    {/* Confirm Account Number */}
                    <div>
                      <label style={labelStyle}>Confirm Account Number</label>
                      <input value={bankForm.confirmAccount} onChange={e => handleConfirmChange(e.target.value)}
                        placeholder="Re-enter account number"
                        maxLength={17}
                        style={inputStyle(confirmErr)}
                        onFocus={e => { e.target.style.borderColor = confirmErr ? "#EF4444" : C.blue; e.target.style.boxShadow = `0 0 0 3px ${confirmErr ? "rgba(239,68,68,0.08)" : "rgba(26,115,232,0.08)"}`; e.target.style.background = "#fff"; }}
                        onBlur={e => { e.target.style.borderColor = confirmErr ? "#EF4444" : C.border; e.target.style.boxShadow = "none"; e.target.style.background = C.bg; }}
                      />
                      {confirmErr && <p style={{ fontSize: 11.5, color: "#EF4444", marginTop: 5 }}>⚠ {confirmErr}</p>}
                      {!confirmErr && bankForm.confirmAccount && bankForm.confirmAccount === bankForm.accountNumber && (
                        <p style={{ fontSize: 11.5, color: "#059669", marginTop: 5 }}>✓ Account numbers match</p>
                      )}
                    </div>

                    {/* Account Type */}
                    <div>
                      <label style={labelStyle}>Account Type</label>
                      <div style={{ display: "flex", gap: 10 }}>
                        {(["checking", "savings"] as const).map(t => (
                          <button key={t} onClick={() => setBankForm(f => ({ ...f, accountType: t }))}
                            style={{ flex: 1, padding: "10px 14px", borderRadius: 12, border: bankForm.accountType === t ? `2px solid ${C.blue}` : `1.5px solid ${C.border}`, background: bankForm.accountType === t ? "#EEF4FF" : "#FAFBFC", color: bankForm.accountType === t ? C.blue : C.sub, fontSize: 13.5, fontWeight: bankForm.accountType === t ? 700 : 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s", textTransform: "capitalize" }}>
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bank Address (Wire only, optional) */}
                    {transferType === "wire" && (
                      <div>
                        <label style={labelStyle}>Bank Address <span style={{ fontWeight: 400, color: C.muted }}>(optional for wire)</span></label>
                        <input value={bankForm.bankAddress} onChange={e => setBankForm(f => ({ ...f, bankAddress: e.target.value }))}
                          placeholder="e.g. 100 Main St, New York, NY 10001"
                          style={inputStyle()}
                          onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.08)"; e.target.style.background = "#fff"; }}
                          onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; e.target.style.background = C.bg; }}
                        />
                      </div>
                    )}

                    {/* Memo */}
                    <div>
                      <label style={labelStyle}>Memo / Reference <span style={{ fontWeight: 400, color: C.muted }}>(optional)</span></label>
                      <input value={bankForm.memo} onChange={e => setBankForm(f => ({ ...f, memo: e.target.value }))}
                        placeholder="e.g. Rent, invoice #1234, gift…"
                        style={inputStyle()}
                        onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.08)"; e.target.style.background = "#fff"; }}
                        onBlur={e => { e.target.style.borderColor = C.border; e.target.style.boxShadow = "none"; e.target.style.background = C.bg; }}
                      />
                    </div>

                    {/* Verification result (shown after step 2 → 3 attempt) */}
                    {verifying && (
                      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 14px", background: "#EEF4FF", border: `1px solid rgba(26,115,232,0.2)`, borderRadius: 12, fontSize: 13, color: C.blue }}>
                        <div style={{ width: 16, height: 16, borderRadius: "50%", border: `2px solid ${C.blue}`, borderTop: "2px solid transparent", animation: "spin 0.7s linear infinite", flexShrink: 0 }} />
                        Verifying recipient details…
                      </div>
                    )}
                    {verificationResult && !verifying && (
                      <div style={{ padding: "12px 14px", background: verificationResult.bg, border: `1px solid ${verificationResult.border}`, borderRadius: 12, display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 700, color: verificationResult.color }}>{verificationResult.label}</p>
                          <p style={{ fontSize: 12, color: verificationResult.color, opacity: 0.85 }}>{verificationResult.sublabel}</p>
                          <p style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>⚠ Simulated verification — not a live bank lookup</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                  <button onClick={() => { setStep(1); setSelectedSaved(null); }}
                    style={{ padding: "13px 20px", borderRadius: 14, border: `1px solid ${C.border}`, background: "transparent", color: C.sub, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    ← Back
                  </button>
                  <button onClick={() => { runVerification(); setStep(3); }} disabled={!step2Valid}
                    style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: step2Valid ? "linear-gradient(135deg,#1A73E8,#1558b0)" : C.bg, color: step2Valid ? "#fff" : C.muted, fontSize: 14, fontWeight: 700, cursor: step2Valid ? "pointer" : "not-allowed", fontFamily: "inherit", boxShadow: step2Valid ? "0 4px 16px rgba(26,115,232,0.28)" : "none", transition: "all 0.2s" }}>
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {/* ══════ STEP 3: Amount ══════ */}
            {step === 3 && (
              <div>
                {/* Recipient pill */}
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", background: C.bg, borderRadius: 14, border: `1px solid ${C.border}`, marginBottom: 28 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: "linear-gradient(135deg,#2563EB,#1d4ed8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                    {getInitials(recipientName || "?")}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 13.5, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{recipientName || "—"}</p>
                    <p style={{ fontSize: 11.5, color: C.muted }}>{recipientBankName} · {recipientAcctMasked}</p>
                  </div>
                  <button onClick={() => setStep(2)} style={{ fontSize: 12, color: C.blue, fontWeight: 600, background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>Change</button>
                </div>

                <p style={{ fontSize: 15, fontWeight: 700, color: C.text, marginBottom: 5, letterSpacing: "-0.2px" }}>How much are you sending?</p>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 22 }}>Amount is in USD from your selected account.</p>

                {/* From account */}
                <label style={labelStyle}>From Account</label>
                <select value={fromAccountId} onChange={e => { setFromAccountId(e.target.value); setAmount(""); setAmountErr(""); }}
                  style={{ width: "100%", padding: "11px 14px", borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: 13.5, color: C.text, background: "#fff", outline: "none", fontFamily: "inherit", cursor: "pointer", marginBottom: 18, appearance: "none", backgroundImage: "url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 12 12%22><path fill=%22%2394A3B8%22 d=%22M6 8L1 3h10z%22/></svg>')", backgroundRepeat: "no-repeat", backgroundPosition: "right 14px center" }}>
                  {state.accounts.filter(a => !a.frozen && a.type !== "crypto").map(a => (
                    <option key={a.id} value={a.id}>{a.flag} {a.name} — {a.symbol}{a.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</option>
                  ))}
                </select>

                {/* Amount input */}
                <label style={labelStyle}>Amount</label>
                <div style={{ position: "relative", marginBottom: amountErr ? 6 : 18 }}>
                  <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", fontSize: 20, fontWeight: 600, color: C.muted, pointerEvents: "none" }}>{fromAccount?.symbol ?? "$"}</span>
                  <input type="number" min="0.01" step="0.01" value={amount}
                    onChange={e => { setAmount(e.target.value); validateAmount(e.target.value); }}
                    placeholder="0.00"
                    style={{ width: "100%", padding: "14px 14px 14px 36px", borderRadius: 12, border: `1.5px solid ${amountErr ? "#EF4444" : C.border}`, fontSize: 28, fontWeight: 800, color: C.text, background: C.bg, outline: "none", fontFamily: "inherit", boxSizing: "border-box", letterSpacing: "-0.5px", transition: "border-color 0.18s, box-shadow 0.18s" }}
                    onFocus={e => { e.target.style.borderColor = amountErr ? "#EF4444" : C.blue; e.target.style.boxShadow = `0 0 0 3px ${amountErr ? "rgba(239,68,68,0.1)" : "rgba(26,115,232,0.08)"}`; e.target.style.background = "#fff"; }}
                    onBlur={e => { e.target.style.borderColor = amountErr ? "#EF4444" : C.border; e.target.style.boxShadow = "none"; e.target.style.background = C.bg; }}
                  />
                </div>
                {amountErr && <p style={{ fontSize: 12, color: "#EF4444", marginBottom: 14 }}>⚠ {amountErr}</p>}

                {/* Quick fill buttons */}
                <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
                  {[50, 100, 250, 500, 1000].map(v => (
                    <button key={v} onClick={() => { setAmount(String(v)); validateAmount(String(v)); }}
                      style={{ padding: "7px 14px", borderRadius: 20, border: `1px solid ${C.border}`, background: amount === String(v) ? "#EEF4FF" : "#FAFBFC", color: amount === String(v) ? C.blue : C.sub, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                      ${v}
                    </button>
                  ))}
                </div>

                {/* Fee summary */}
                <div style={{ background: C.bg, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 22 }}>
                  {[
                    { label: "Amount",       value: numAmount > 0 ? `${fromAccount?.symbol ?? "$"}${numAmount.toFixed(2)}` : "—" },
                    { label: "Transfer fee", value: feeInfo.feeLabel, color: feeInfo.fee === 0 ? "#059669" : "#D97706" },
                    { label: "You send",     value: numAmount > 0 ? `${fromAccount?.symbol ?? "$"}${totalSend.toFixed(2)}` : "—", bold: true },
                    { label: "Delivery",     value: feeInfo.deliveryLabel },
                  ].map((row, i, arr) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "11px 16px", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none", background: row.bold ? "#EEF4FF" : "transparent" }}>
                      <span style={{ fontSize: 13, color: C.muted }}>{row.label}</span>
                      <span style={{ fontSize: 13.5, fontWeight: row.bold ? 800 : 600, color: (row as {color?: string}).color ?? (row.bold ? C.blue : C.text) }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setStep(2)} style={{ padding: "13px 20px", borderRadius: 14, border: `1px solid ${C.border}`, background: "transparent", color: C.sub, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
                  <button onClick={() => setStep(4)} disabled={!step3Valid}
                    style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: step3Valid ? "linear-gradient(135deg,#1A73E8,#1558b0)" : C.bg, color: step3Valid ? "#fff" : C.muted, fontSize: 14, fontWeight: 700, cursor: step3Valid ? "pointer" : "not-allowed", fontFamily: "inherit", boxShadow: step3Valid ? "0 4px 16px rgba(26,115,232,0.28)" : "none", transition: "all 0.2s" }}>
                    Review Transfer →
                  </button>
                </div>
              </div>
            )}

            {/* ══════ STEP 4: Review & Confirm ══════ */}
            {step === 4 && (
              <div>
                <p style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 5, letterSpacing: "-0.2px" }}>Review your transfer</p>
                <p style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>Confirm the details before sending. This action cannot be undone.</p>

                {/* Summary rows */}
                <div style={{ background: C.bg, borderRadius: 16, border: `1px solid ${C.border}`, overflow: "hidden", marginBottom: 20 }}>
                  {[
                    { label: "Transfer Type",   value: transferType === "internal_vaulte" ? "⚡ Vaulte Transfer" : transferType === "ach" ? "🏦 ACH Transfer" : "🔀 Wire Transfer" },
                    { label: "From",             value: `${fromAccount?.flag ?? ""} ${fromAccount?.name ?? ""}` },
                    { label: "To",               value: recipientName },
                    ...(transferType === "internal_vaulte" && recipientEmail ? [{ label: "Email", value: recipientEmail }] : []),
                    { label: "Bank",             value: recipientBankName },
                    { label: "Account",          value: recipientAcctMasked },
                    ...(transferType !== "internal_vaulte" ? [{ label: "Account Type", value: bankForm.accountType === "checking" ? "Checking" : "Savings" }] : []),
                    { label: "Amount",           value: `${fromAccount?.symbol ?? "$"}${numAmount.toFixed(2)}` },
                    { label: "Transfer Fee",     value: feeInfo.feeLabel, valueColor: feeInfo.fee === 0 ? "#059669" : "#D97706" },
                    { label: "Total Deducted",   value: `${fromAccount?.symbol ?? "$"}${totalSend.toFixed(2)}`, highlight: true },
                    { label: "Est. Delivery",    value: feeInfo.deliveryLabel },
                    ...(memo ? [{ label: "Memo", value: memo }] : []),
                  ].map((row, i, arr) => (
                    <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 18px", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none", background: (row as {highlight?: boolean}).highlight ? "#EEF4FF" : "transparent" }}>
                      <span style={{ fontSize: 13, color: C.muted }}>{row.label}</span>
                      <span style={{ fontSize: 13.5, fontWeight: (row as {highlight?: boolean}).highlight ? 800 : 600, color: (row as {valueColor?: string}).valueColor ?? ((row as {highlight?: boolean}).highlight ? C.blue : C.text) }}>{row.value}</span>
                    </div>
                  ))}
                </div>

                {/* Verification badge (ACH/Wire) */}
                {verificationResult && (transferType === "ach" || transferType === "wire") && (
                  <div style={{ padding: "11px 14px", background: verificationResult.bg, border: `1px solid ${verificationResult.border}`, borderRadius: 12, marginBottom: 18, display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 700, color: verificationResult.color }}>{verificationResult.label}</p>
                      <p style={{ fontSize: 11.5, color: C.muted, marginTop: 2 }}>⚠ This is a simulated bank verification — not a live lookup</p>
                    </div>
                  </div>
                )}

                {/* ACH pending notice */}
                {transferType === "ach" && (
                  <div style={{ padding: "11px 14px", background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: 12, marginBottom: 18, fontSize: 12.5, color: "#92400E" }}>
                    ⏳ ACH transfers arrive in 1–3 business days. Transaction will show as <strong>Pending</strong> until settled.
                  </div>
                )}

                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={() => setStep(3)} style={{ padding: "13px 20px", borderRadius: 14, border: `1px solid ${C.border}`, background: "transparent", color: C.sub, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>← Back</button>
                  <button onClick={handleConfirm}
                    style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#1A73E8,#1558b0)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(26,115,232,0.28)", transition: "all 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 8px 24px rgba(26,115,232,0.38)"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(26,115,232,0.28)"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; }}>
                    ✓ Confirm & Send
                  </button>
                </div>
              </div>
            )}

            {/* ══════ PROCESSING ══════ */}
            {step === "processing" && (
              <div style={{ textAlign: "center", padding: "56px 20px" }}>
                <div style={{ width: 68, height: 68, borderRadius: "50%", border: `3px solid ${C.blue}`, borderTop: "3px solid transparent", margin: "0 auto 28px", animation: "spin 0.8s linear infinite" }} />
                <p style={{ fontSize: 19, fontWeight: 800, color: C.text, marginBottom: 8, letterSpacing: "-0.3px" }}>Processing Transfer…</p>
                <p style={{ fontSize: 13.5, color: C.muted, maxWidth: 300, margin: "0 auto" }}>Securely routing your payment through the Vaulte network.</p>
              </div>
            )}

            {/* ══════ SUCCESS ══════ */}
            {step === "success" && (
              <div style={{ textAlign: "center", padding: "40px 8px 28px" }}>
                <div style={{ width: 76, height: 76, borderRadius: "50%", background: "linear-gradient(135deg,#22C55E,#16A34A)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", boxShadow: "0 8px 28px rgba(34,197,94,0.28)", fontSize: 34, color: "#fff" }}>✓</div>
                <p style={{ fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 6, letterSpacing: "-0.5px" }}>Transfer Sent!</p>
                <p style={{ fontSize: 14, color: C.muted, marginBottom: 28 }}>
                  {fromAccount?.symbol ?? "$"}{numAmount.toFixed(2)} sent to {recipientName}
                </p>

                {/* Transaction summary */}
                <div style={{ background: C.bg, borderRadius: 16, border: `1px solid ${C.border}`, padding: "4px 0", marginBottom: 22, textAlign: "left" }}>
                  {[
                    { label: "Reference",    value: txRef },
                    { label: "New Balance",  value: `${fromAccount?.symbol ?? "$"}${newBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` },
                    { label: "Status",       value: transferType === "ach" ? "⏳ Pending" : "✓ Completed" },
                    { label: "Delivery",     value: feeInfo.deliveryLabel },
                    { label: "Date",         value: new Date().toLocaleString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) },
                  ].map((r, i) => (
                    <div key={r.label} style={{ display: "flex", justifyContent: "space-between", padding: "10px 18px", borderBottom: i < 4 ? `1px solid ${C.border}` : "none" }}>
                      <span style={{ fontSize: 12.5, color: C.muted }}>{r.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: r.label === "Status" ? (transferType === "ach" ? "#D97706" : "#059669") : C.text }}>{r.value}</span>
                    </div>
                  ))}
                </div>

                {/* Save recipient CTA */}
                {!selectedSaved && !saved && (
                  <div style={{ padding: "16px 18px", background: "#EEF4FF", border: `1px solid rgba(26,115,232,0.2)`, borderRadius: 14, marginBottom: 22, textAlign: "left" }}>
                    <p style={{ fontSize: 13.5, fontWeight: 700, color: C.text, marginBottom: 4 }}>Save this recipient?</p>
                    <p style={{ fontSize: 12.5, color: C.muted, marginBottom: 12 }}>Save {recipientName} for faster future transfers.</p>
                    <button onClick={handleSaveRecipient}
                      style={{ padding: "10px 20px", borderRadius: 12, border: "none", background: C.blue, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                      + Save Recipient
                    </button>
                  </div>
                )}
                {saved && (
                  <div style={{ padding: "12px 16px", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 12, marginBottom: 22, fontSize: 13, color: "#059669", fontWeight: 600 }}>
                    ✓ {recipientName} saved to your recipients
                  </div>
                )}

                <div style={{ display: "flex", gap: 12 }}>
                  <button onClick={resetForm} style={{ flex: 1, padding: "13px", borderRadius: 14, border: `1px solid ${C.border}`, background: "transparent", color: C.sub, fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>New Transfer</button>
                  <button onClick={() => router.push("/dashboard")} style={{ flex: 1, padding: "13px", borderRadius: 14, border: "none", background: "linear-gradient(135deg,#1A73E8,#1558b0)", color: "#fff", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", boxShadow: "0 4px 16px rgba(26,115,232,0.28)" }}>← Dashboard</button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* ══════════════ SIDEBAR ══════════════ */}
        <div className="transfer-sidebar" style={{ display: "flex", flexDirection: "column", gap: 18 }}>

          {/* Transfer info */}
          <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "20px 20px" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14, letterSpacing: "-0.2px" }}>Transfer Guide</p>
            {[
              { icon: "⚡", label: "Vaulte Transfer",  sub: "Instant · Free",              color: C.blue },
              { icon: "🏦", label: "ACH Transfer",      sub: "1–3 Business Days · Free",    color: "#059669" },
              { icon: "🔀", label: "Wire Transfer",     sub: "Same Day · $15 fee",          color: "#D97706" },
              { icon: "🔒", label: "Bank-level security", sub: "256-bit encryption",       color: C.muted },
            ].map((i, idx) => (
              <div key={i.label} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 0", borderBottom: idx < 3 ? `1px solid ${C.border}` : "none" }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{i.icon}</span>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{i.label}</p>
                  <p style={{ fontSize: 11.5, color: i.color }}>{i.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Recent transfers */}
          <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "20px 20px" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 14, letterSpacing: "-0.2px" }}>Recent Transfers</p>
            {state.transactions.filter(t => t.category === "Transfer" && t.type === "debit").slice(0, 4).map((tx, i, arr) => (
              <div key={tx.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: tx.iconBg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: tx.iconColor, flexShrink: 0 }}>{tx.icon}</div>
                  <div>
                    <p style={{ fontSize: 12.5, fontWeight: 600, color: C.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 130 }}>{tx.recipientName ?? tx.name.replace("Transfer to ", "")}</p>
                    <p style={{ fontSize: 11, color: C.muted }}>{fmtDate(tx.date)}</p>
                  </div>
                </div>
                <p style={{ fontSize: 13, fontWeight: 700, color: C.text, flexShrink: 0 }}>−${tx.amount.toFixed(2)}</p>
              </div>
            ))}
            {state.transactions.filter(t => t.category === "Transfer" && t.type === "debit").length === 0 && (
              <p style={{ fontSize: 13, color: C.muted, textAlign: "center", padding: "16px 0" }}>No transfers yet.</p>
            )}
          </div>

          {/* Routing help */}
          <div style={{ background: C.card, borderRadius: 20, border: `1px solid ${C.border}`, boxShadow: C.shadow, padding: "20px 20px" }}>
            <p style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 12, letterSpacing: "-0.2px" }}>Where to find your routing #</p>
            <div style={{ background: "#F8FAFC", borderRadius: 12, padding: "14px", border: `1px solid ${C.border}`, fontFamily: "monospace", fontSize: 11.5, color: C.sub, lineHeight: 1.8 }}>
              <div>Check bottom-left: <span style={{ color: C.blue, fontWeight: 700 }}>⊟ 123456789 ⊟</span></div>
              <div style={{ marginTop: 4, color: C.muted }}>First 9 digits = routing number</div>
              <div style={{ marginTop: 4, color: C.muted }}>Next 9–12 digits = account number</div>
            </div>
            <p style={{ fontSize: 11.5, color: C.muted, marginTop: 10, lineHeight: 1.6 }}>
              You can also find your routing number in your bank&rsquo;s online portal or mobile app under &ldquo;Account Details.&rdquo;
            </p>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input[type=number]::-webkit-inner-spin-button,
        input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        input[type=number] { -moz-appearance: textfield; }
      `}</style>
    </DashboardLayout>
  );
}
