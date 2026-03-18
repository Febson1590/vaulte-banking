"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  getUserState, saveUserState, getKycDoc,
  VaulteUser, VaulteState, genTxId, genRef,
  DEMO_USER, DEMO_STATE, createEmptyUserState,
} from "@/lib/vaulteState";

// ─── Badge helper ────────────────────────────────────────────
function Badge({ label }: { label: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    active:          { bg: "#ECFDF5", color: "#059669" },
    Active:          { bg: "#ECFDF5", color: "#059669" },
    frozen:          { bg: "#EFF6FF", color: "#2563EB" },
    Frozen:          { bg: "#EFF6FF", color: "#2563EB" },
    suspended:       { bg: "#FEF2F2", color: "#DC2626" },
    Suspended:       { bg: "#FEF2F2", color: "#DC2626" },
    closed:          { bg: "#F3F4F6", color: "#6B7280" },
    Closed:          { bg: "#F3F4F6", color: "#6B7280" },
    verified:        { bg: "#ECFDF5", color: "#059669" },
    Approved:        { bg: "#ECFDF5", color: "#059669" },
    pending:         { bg: "#FFFBEB", color: "#D97706" },
    Pending:         { bg: "#FFFBEB", color: "#D97706" },
    unverified:      { bg: "#F3F4F6", color: "#6B7280" },
    "Not Submitted": { bg: "#F3F4F6", color: "#6B7280" },
    Rejected:        { bg: "#FEF2F2", color: "#DC2626" },
  };
  const s = map[label] || { bg: "#F3F4F6", color: "#6B7280" };
  const display =
    label === "verified"    ? "Verified"
    : label === "pending"   ? "Pending"
    : label === "unverified"? "Not Submitted"
    : label === "active"    ? "Active"
    : label === "frozen"    ? "Frozen"
    : label === "suspended" ? "Suspended"
    : label === "closed"    ? "Closed"
    : label;
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: 600 }}>
      {display}
    </span>
  );
}

// ─── Types ────────────────────────────────────────────────────
interface UserRow {
  user: VaulteUser;
  state: VaulteState;
  totalBalance: number;
}

const RATES: Record<string, number> = { USD: 1, EUR: 1.09, GBP: 1.27, BTC: 66000 };
function getTotalBalance(state: VaulteState): number {
  return state.accounts.reduce((s, a) => s + a.balance * (RATES[a.currency] ?? 1), 0);
}
function fmtUSD(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Manage Modal ─────────────────────────────────────────────
function ManageModal({
  row, onClose, onUpdated, onDeleted,
}: {
  row: UserRow;
  onClose: () => void;
  onUpdated: (user: VaulteUser, state: VaulteState) => void;
  onDeleted: (userId: string) => void;
}) {
  const { user, state } = row;
  const isDemo = user.id === DEMO_USER.id;

  const [localUser,     setLocalUser]     = useState<VaulteUser>({ ...user });
  const [localState,    setLocalState]    = useState<VaulteState>({ ...state });
  const [toast,         setToast]         = useState<string | null>(null);
  const [errorMsg,      setErrorMsg]      = useState<string | null>(null);
  const [saving,        setSaving]        = useState(false);
  const [balAmount,     setBalAmount]     = useState("");
  const [balType,       setBalType]       = useState<"credit" | "debit">("credit");
  const [docPreview,    setDocPreview]    = useState<string | null>(null);
  const [showDoc,       setShowDoc]       = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting,      setDeleting]      = useState(false);

  useEffect(() => {
    if (user.id) setDocPreview(getKycDoc(user.id));
  }, [user.id]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  // ── Demo-user helper (local only) ───────────────────────────
  const persistDemo = (u: VaulteUser, s: VaulteState) => {
    saveUserState(u.id, s);
    onUpdated(u, s);
    setLocalUser(u);
    setLocalState(s);
  };

  // ── Account status ─────────────────────────────────────────
  const setAccStatus = async (status: "active" | "suspended" | "frozen" | "closed") => {
    const u = { ...localUser, accountStatus: status };
    if (isDemo) { persistDemo(u, localState); showToast(`Account status updated to ${status}`); return; }
    setSaving(true); setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: u.email, accountStatus: status }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Update failed");
      onUpdated(u, localState);
      setLocalUser(u);
      showToast(`Account status updated to ${status}`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update account status");
    } finally { setSaving(false); }
  };

  // ── KYC status ─────────────────────────────────────────────
  const setKycStatus = async (kycStatus: "unverified" | "pending" | "verified") => {
    const u = { ...localUser, kycStatus };
    if (isDemo) { persistDemo(u, localState); showToast(`KYC updated to ${kycStatus}`); return; }
    setSaving(true); setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: u.email, kycStatus }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Update failed");
      onUpdated(u, localState);
      setLocalUser(u);
      showToast(`KYC updated to ${kycStatus}`);
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update KYC status");
    } finally { setSaving(false); }
  };

  // ── Balance adjustment ──────────────────────────────────────
  const applyBalance = async () => {
    const amt = parseFloat(balAmount);
    if (isNaN(amt) || amt <= 0) { showToast("Enter a valid positive amount"); return; }

    if (isDemo) {
      // Demo: apply locally
      const accounts  = [...localState.accounts];
      const idx       = accounts.findIndex(a => a.currency === "USD");
      if (idx < 0)    { showToast("No USD account found"); return; }
      const newBal    = balType === "credit" ? accounts[idx].balance + amt : Math.max(0, accounts[idx].balance - amt);
      accounts[idx]   = { ...accounts[idx], balance: newBal };
      const txn = {
        id: genTxId(), txType: balType === "credit" ? "admin_credit" as const : "admin_debit" as const,
        type: balType === "credit" ? "credit" as const : "debit" as const,
        name: balType === "credit" ? "Admin Credit" : "Admin Debit",
        sub: "Manual Adjustment by Admin", amount: amt, fee: 0, balanceAfter: newBal,
        currency: "USD", date: new Date().toISOString(), category: "Adjustment",
        badge: "Admin", badgeBg: "#F5F3FF", badgeBorder: "#DDD6FE", badgeColor: "#7C3AED",
        status: "completed" as const, accountId: accounts[idx].id,
        icon: "⚙", iconBg: "linear-gradient(135deg,#F5F3FF,#DDD6FE)", iconColor: "#7C3AED",
        reference: genRef(),
      };
      const s = { ...localState, accounts, transactions: [txn, ...localState.transactions] };
      persistDemo(localUser, s);
      showToast(`${balType === "credit" ? "Credited" : "Debited"} ${fmtUSD(amt)}`);
      setBalAmount(""); return;
    }

    setSaving(true); setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/balance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: localUser.email, amount: amt, type: balType }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Balance update failed");
      // Update local state with the returned updated state
      if (data.updatedState) {
        const s = data.updatedState as VaulteState;
        onUpdated(localUser, s);
        setLocalState(s);
      }
      showToast(`${balType === "credit" ? "Credited" : "Debited"} ${fmtUSD(amt)}`);
      setBalAmount("");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to apply balance");
    } finally { setSaving(false); }
  };

  // ── Card ────────────────────────────────────────────────────
  const cardAction = async (action: "issue" | "freeze" | "unfreeze") => {
    if (isDemo) {
      const card = action === "issue"
        ? { ...localState.card, issued: true, onlinePayments: true, contactless: true, internationalTxns: true, spendingLimit: 2000, spentThisMonth: 0 }
        : { ...localState.card, frozen: action === "freeze" };
      persistDemo(localUser, { ...localState, card });
      showToast(action === "issue" ? "Card issued" : action === "freeze" ? "Card frozen" : "Card unfrozen");
      return;
    }
    setSaving(true); setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/card", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: localUser.email, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Card update failed");
      if (data.updatedState) {
        const s = data.updatedState as VaulteState;
        onUpdated(localUser, s);
        setLocalState(s);
      }
      showToast(action === "issue" ? "Card issued" : action === "freeze" ? "Card frozen" : "Card unfrozen");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to update card");
    } finally { setSaving(false); }
  };

  // ── Admin notes ─────────────────────────────────────────────
  const saveNotes = async () => {
    if (isDemo) { showToast("Notes saved (demo only)"); return; }
    setSaving(true); setErrorMsg(null);
    try {
      const res = await fetch("/api/admin/manage", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: localUser.email, adminNotes: localUser.adminNotes ?? "" }),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Save failed");
      onUpdated(localUser, localState);
      showToast("Notes saved");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Failed to save notes");
    } finally { setSaving(false); }
  };

  // ── Delete user ──────────────────────────────────────────────
  const deleteUser = async () => {
    setDeleting(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: localUser.id, email: localUser.email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Delete failed");
      // Clean up any local cache for this user
      if (typeof window !== "undefined") {
        localStorage.removeItem(`vaulte_state_${localUser.id}`);
        localStorage.removeItem(`vaulte_kyc_doc_${localUser.id}`);
        localStorage.removeItem(`vaulte_recipients_${localUser.id}`);
      }
      onDeleted(localUser.id);
    } catch (err) {
      console.error("[deleteUser]", err);
      showToast("Failed to delete user. Please try again.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const acctStatus  = localUser.accountStatus ?? "active";
  const primaryAcc  = localState.accounts.find(a => a.currency === "USD") ?? localState.accounts[0];
  const primaryBal  = primaryAcc?.balance ?? 0;
  const totalBal    = getTotalBalance(localState);

  return (
    <>
      <style>{`
        .admin-modal-body { overflow-x: hidden; }
        @media (max-width: 480px) {
          .admin-modal-header { padding: 16px 16px 14px !important; }
          .admin-modal-body   { padding: 16px !important; }
          .admin-user-acct-status-grid { grid-template-columns: repeat(2, 1fr) !important; }
          .admin-user-profile-grid     { grid-template-columns: 1fr !important; }
          .admin-bal-row    { flex-wrap: wrap !important; }
          .admin-bal-toggle { flex: 0 0 100% !important; }
          .admin-del-btns   { flex-wrap: wrap !important; }
        }
      `}</style>
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 200, padding: "20px", overflowY: "auto", overflowX: "hidden" }}>
      <div style={{ background: "#fff", borderRadius: "18px", width: "100%", maxWidth: "580px", boxShadow: "0 24px 70px rgba(0,0,0,0.3)", marginTop: "20px", marginBottom: "20px", overflow: "hidden" }}>

        {/* Toast */}
        {toast && (
          <div style={{ position: "fixed", top: 28, right: 28, zIndex: 999, background: "#0F172A", color: "#fff", padding: "10px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, boxShadow: "0 8px 24px rgba(15,23,42,0.25)" }}>
            <span style={{ color: "#4ADE80" }}>✓</span> {toast}
          </div>
        )}

        {/* Error banner */}
        {errorMsg && (
          <div style={{ background: "#FEF2F2", borderBottom: "1px solid #FECACA", padding: "10px 20px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ color: "#DC2626", fontSize: "14px" }}>⚠️ {errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} style={{ marginLeft: "auto", background: "none", border: "none", color: "#9CA3AF", cursor: "pointer", fontSize: "16px" }}>✕</button>
          </div>
        )}

        {/* Saving overlay indicator */}
        {saving && (
          <div style={{ background: "#EEF4FF", borderBottom: "1px solid #BFDBFE", padding: "6px 20px", fontSize: "12px", color: "#1A73E8", fontWeight: 600 }}>
            ⏳ Saving to server…
          </div>
        )}

        {/* Header */}
        <div className="admin-modal-header" style={{ padding: "24px 28px 20px", borderBottom: "1px solid #F3F4F6" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
              <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#EEF4FF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px", fontWeight: 700, color: "#1A73E8" }}>
                {`${localUser.firstName[0]}${localUser.lastName[0]}`.toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: "17px", fontWeight: 800, color: "#0A1628" }}>{localUser.firstName} {localUser.lastName}</div>
                <div style={{ fontSize: "13px", color: "#6B7280" }}>{localUser.email}</div>
                <div style={{ display: "flex", gap: "6px", marginTop: "5px" }}>
                  <Badge label={localUser.kycStatus} />
                  <Badge label={acctStatus} />
                </div>
              </div>
            </div>
            <button onClick={onClose} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "#9CA3AF", flexShrink: 0 }}>✕</button>
          </div>
        </div>

        {/* Scrollable body */}
        <div className="admin-modal-body" style={{ padding: "22px 28px", overflowY: "auto", maxHeight: "72vh", display: "flex", flexDirection: "column", gap: "22px" }}>

          {/* ── Profile info ── */}
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Profile</p>
            <div className="admin-user-profile-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { label: "User ID",       value: localUser.id.slice(0, 20) + "…" },
                { label: "Joined",        value: new Date(localUser.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) },
                { label: "Country",       value: localUser.kycNationality ?? "Not provided" },
                { label: "Total Balance", value: fmtUSD(totalBal) },
              ].map(f => (
                <div key={f.label} style={{ background: "#F8FAFC", borderRadius: "10px", padding: "10px 14px" }}>
                  <div style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "3px" }}>{f.label}</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#0A1628", wordBreak: "break-all" }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Account status ── */}
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Account Status</p>
            <div className="admin-user-acct-status-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              {(["active", "frozen", "suspended", "closed"] as const).map(s => (
                <button key={s} onClick={() => setAccStatus(s)} disabled={saving}
                  style={{ padding: "9px 6px", borderRadius: "10px", border: `2px solid ${acctStatus === s ? "#1A73E8" : "#E5E7EB"}`, background: acctStatus === s ? "#EEF4FF" : "#fff", color: acctStatus === s ? "#1A73E8" : "#6B7280", fontSize: "12px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", textTransform: "capitalize", fontFamily: "inherit", opacity: saving ? 0.6 : 1 }}>
                  {s === "active" ? "✅" : s === "frozen" ? "❄️" : s === "suspended" ? "🚫" : "⛔"}<br />{s}
                </button>
              ))}
            </div>
          </div>

          {/* ── KYC status ── */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
              <p style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em" }}>KYC Verification</p>
              {docPreview && (
                <button onClick={() => setShowDoc(!showDoc)}
                  style={{ fontSize: "12px", color: "#1A73E8", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
                  {showDoc ? "Hide Document ▲" : "View ID Document ▼"}
                </button>
              )}
            </div>
            {showDoc && docPreview && (
              <div style={{ marginBottom: "12px", borderRadius: "12px", overflow: "hidden", border: "1px solid #E5E7EB", background: "#0F172A" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={docPreview} alt="Uploaded ID" style={{ width: "100%", maxHeight: "200px", objectFit: "contain", display: "block" }} />
              </div>
            )}
            {!docPreview && localUser.kycStatus !== "unverified" && (
              <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "10px", padding: "10px 14px", marginBottom: "10px", fontSize: "12.5px", color: "#92400E" }}>
                No document uploaded by user yet.
              </div>
            )}
            <div className="admin-user-kyc-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {(["unverified", "pending", "verified"] as const).map(k => (
                <button key={k} onClick={() => setKycStatus(k)} disabled={saving}
                  style={{ padding: "9px 6px", borderRadius: "10px", border: `2px solid ${localUser.kycStatus === k ? "#1A73E8" : "#E5E7EB"}`, background: localUser.kycStatus === k ? "#EEF4FF" : "#fff", color: localUser.kycStatus === k ? "#1A73E8" : "#6B7280", fontSize: "12px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", textTransform: "capitalize", fontFamily: "inherit", opacity: saving ? 0.6 : 1 }}>
                  {k === "unverified" ? "◎" : k === "pending" ? "⏳" : "✓"}<br />
                  {k === "unverified" ? "Unverified" : k === "pending" ? "Pending" : "Approved"}
                </button>
              ))}
            </div>
          </div>

          {/* ── Balance management ── */}
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Balance Management</p>
            <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "14px 16px", marginBottom: "12px" }}>
              <p style={{ fontSize: "11.5px", color: "#9CA3AF", marginBottom: "3px" }}>Primary USD Account</p>
              <p style={{ fontSize: "20px", fontWeight: 800, color: "#0A1628" }}>{fmtUSD(primaryBal)}</p>
              {localState.accounts.length > 1 && (
                <p style={{ fontSize: "11.5px", color: "#6B7280", marginTop: "2px" }}>Total across all accounts: {fmtUSD(totalBal)}</p>
              )}
            </div>
            <div className="admin-bal-row" style={{ display: "flex", gap: "10px" }}>
              <div className="admin-bal-toggle" style={{ display: "flex", border: "1.5px solid #E5E7EB", borderRadius: "10px", overflow: "hidden", flexShrink: 0 }}>
                {(["credit", "debit"] as const).map(t => (
                  <button key={t} onClick={() => setBalType(t)}
                    style={{ padding: "10px 14px", border: "none", background: balType === t ? (t === "credit" ? "#059669" : "#DC2626") : "#fff", color: balType === t ? "#fff" : "#6B7280", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}>
                    {t === "credit" ? "+ Credit" : "– Debit"}
                  </button>
                ))}
              </div>
              <input type="number" value={balAmount} onChange={e => setBalAmount(e.target.value)} placeholder="Amount (USD)"
                style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "14px", outline: "none", fontFamily: "inherit" }} />
              <button onClick={applyBalance} disabled={saving}
                style={{ padding: "10px 18px", borderRadius: "10px", border: "none", background: saving ? "#9CA3AF" : "#1A73E8", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit", flexShrink: 0 }}>
                Apply
              </button>
            </div>
          </div>

          {/* ── Card management ── */}
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Virtual Card</p>
            <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
              <div>
                <p style={{ fontSize: "14px", fontWeight: 600, color: "#0A1628" }}>
                  {localState.card.issued ? (localState.card.frozen ? "❄️ Card Frozen" : "✅ Card Active") : "⛔ No Card Issued"}
                </p>
                <p style={{ fontSize: "12px", color: "#9CA3AF" }}>
                  {localState.card.issued ? `Limit: $${localState.card.spendingLimit.toLocaleString()}/mo` : "Card has not been issued to this user"}
                </p>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {!localState.card.issued && (
                  <button onClick={() => cardAction("issue")} disabled={saving}
                    style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: saving ? "#9CA3AF" : "#059669", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                    Issue Card
                  </button>
                )}
                {localState.card.issued && !localState.card.frozen && (
                  <button onClick={() => cardAction("freeze")} disabled={saving}
                    style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: saving ? "#9CA3AF" : "#2563EB", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                    Freeze Card
                  </button>
                )}
                {localState.card.issued && localState.card.frozen && (
                  <button onClick={() => cardAction("unfreeze")} disabled={saving}
                    style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: saving ? "#9CA3AF" : "#059669", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                    Unfreeze Card
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ── Admin notes ── */}
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Admin Notes</p>
            <textarea
              value={localUser.adminNotes ?? ""}
              onChange={e => setLocalUser({ ...localUser, adminNotes: e.target.value })}
              placeholder="Internal notes about this user (not visible to user)…"
              style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", minHeight: "80px", resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            />
            <button onClick={saveNotes} disabled={saving}
              style={{ marginTop: "8px", padding: "9px 18px", borderRadius: "8px", border: "none", background: "#F3F4F6", color: "#374151", fontSize: "13px", fontWeight: 600, cursor: saving ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
              Save Notes
            </button>
          </div>

          {/* ── Danger zone ── */}
          <div style={{ borderTop: "1.5px solid #FEE2E2", paddingTop: "18px" }}>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#DC2626", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Danger Zone</p>
            {!confirmDelete ? (
              <button onClick={() => setConfirmDelete(true)}
                style={{ padding: "9px 18px", borderRadius: "8px", border: "1.5px solid #DC2626", background: "#fff", color: "#DC2626", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                🗑 Delete User Account
              </button>
            ) : (
              <div style={{ background: "#FEF2F2", border: "1.5px solid #FECACA", borderRadius: "12px", padding: "14px 16px" }}>
                <p style={{ fontSize: "13.5px", fontWeight: 700, color: "#DC2626", marginBottom: "6px" }}>Are you sure?</p>
                <p style={{ fontSize: "12.5px", color: "#6B7280", marginBottom: "14px" }}>
                  This will permanently delete <strong>{localUser.firstName} {localUser.lastName}</strong> from Redis and all cached data.
                  They will be able to register again with the same email.
                </p>
                <div className="admin-del-btns" style={{ display: "flex", gap: "10px" }}>
                  <button onClick={deleteUser} disabled={deleting}
                    style={{ padding: "9px 20px", borderRadius: "8px", border: "none", background: "#DC2626", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: deleting ? "not-allowed" : "pointer", fontFamily: "inherit", opacity: deleting ? 0.7 : 1 }}>
                    {deleting ? "Deleting…" : "Yes, Delete Permanently"}
                  </button>
                  <button onClick={() => setConfirmDelete(false)} disabled={deleting}
                    style={{ padding: "9px 18px", borderRadius: "8px", border: "1.5px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ── Recent transactions ── */}
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>
              Recent Transactions ({localState.transactions.length} total)
            </p>
            {localState.transactions.length === 0 ? (
              <div style={{ background: "#F8FAFC", borderRadius: "10px", padding: "24px", textAlign: "center", color: "#9CA3AF", fontSize: "13.5px" }}>
                📭 No transactions yet
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {localState.transactions.slice(0, 8).map(tx => (
                  <div key={tx.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "#F8FAFC", borderRadius: "10px" }}>
                    <div>
                      <p style={{ fontSize: "13px", fontWeight: 600, color: "#0A1628" }}>{tx.name}</p>
                      <p style={{ fontSize: "11px", color: "#9CA3AF" }}>{tx.sub} · {new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                    <p style={{ fontSize: "13px", fontWeight: 700, color: tx.type === "credit" ? "#059669" : "#DC2626" }}>
                      {tx.type === "credit" ? "+" : "-"}{tx.currency === "BTC" ? `₿${tx.amount}` : `$${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────
export default function AdminUsers() {
  const [rows,         setRows]         = useState<UserRow[]>([]);
  const [search,       setSearch]       = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [kycFilter,    setKycFilter]    = useState("All");
  const [managing,     setManaging]     = useState<UserRow | null>(null);
  const [loaded,       setLoaded]       = useState(false);

  // ── Load: Redis only, no localStorage merge ────────────────
  const loadRows = async () => {
    setLoaded(false);
    try {
      const res  = await fetch("/api/admin/users");
      const data = await res.json();

      const redisUsers: (VaulteUser & { totalBalanceUSD?: number; bankingState?: Record<string, unknown> | null })[] =
        data.success ? data.users : [];

      // DEMO_USER pinned at top, real users from Redis
      const allRows: UserRow[] = [
        // Demo user: state from localStorage (it's a local simulation)
        { user: DEMO_USER, state: getUserState(DEMO_USER.id), totalBalance: getTotalBalance(getUserState(DEMO_USER.id)) },
        // Real users: state from Redis (returned by /api/admin/users)
        ...redisUsers
          .filter(u => u.id !== DEMO_USER.id)
          .map(u => {
            // Banking state comes from Redis via the API response.
            // Fall back to an empty state (not DEMO_STATE) for new users
            // who haven't logged in yet and have no state in Redis.
            const userForState: VaulteUser = { id: u.id, firstName: u.firstName, lastName: u.lastName, email: u.email, password: "", kycStatus: u.kycStatus, createdAt: u.createdAt };
            const state = (u.bankingState as VaulteState | null) ?? createEmptyUserState(userForState);
            return {
              user: {
                id:             u.id,
                firstName:      u.firstName,
                lastName:       u.lastName,
                email:          u.email,
                password:       "",
                kycStatus:      u.kycStatus,
                kycDocType:     u.kycDocType,
                kycSubmittedAt: u.kycSubmittedAt,
                kycNationality: u.kycNationality,
                kycAddress:     u.kycAddress,
                kycCity:        u.kycCity,
                createdAt:      u.createdAt,
                accountStatus:  u.accountStatus ?? "active",
                adminNotes:     u.adminNotes,
              } as VaulteUser,
              state,
              totalBalance: u.totalBalanceUSD ?? getTotalBalance(state),
            };
          }),
      ];

      setRows(allRows);
    } catch (e) {
      console.error("[AdminUsers] loadRows error:", e);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => { loadRows(); }, []);

  const filtered = rows.filter(r => {
    const accStatus = r.user.accountStatus ?? "active";
    const kycLabel  = r.user.kycStatus === "verified" ? "Approved" : r.user.kycStatus === "pending" ? "Pending" : "Not Submitted";
    const matchStatus = statusFilter === "All" || accStatus === statusFilter.toLowerCase();
    const matchKyc    = kycFilter    === "All" || kycLabel === kycFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || `${r.user.firstName} ${r.user.lastName}`.toLowerCase().includes(q) || r.user.email.toLowerCase().includes(q);
    return matchStatus && matchKyc && matchSearch;
  });

  const handleUpdated = (user: VaulteUser, state: VaulteState) => {
    const tb = getTotalBalance(state);
    setRows(prev => prev.map(r => r.user.id === user.id ? { user, state, totalBalance: tb } : r));
    if (managing) setManaging({ user, state, totalBalance: tb });
  };

  const handleDeleted = (userId: string) => {
    setRows(prev => prev.filter(r => r.user.id !== userId));
    setManaging(null);
  };

  return (
    <AdminLayout title="User Management">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0A1628" }}>User Management</h1>
          <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>
            {loaded ? `${rows.filter(r => r.user.id !== DEMO_USER.id).length} registered user${rows.filter(r => r.user.id !== DEMO_USER.id).length !== 1 ? "s" : ""} (+ demo account)` : "Loading…"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {[
            { label: `Total (${rows.filter(r => r.user.id !== DEMO_USER.id).length})`,                                                 color: "#1A73E8", bg: "#EEF4FF" },
            { label: `Pending KYC (${rows.filter(r => r.user.id !== DEMO_USER.id && r.user.kycStatus === "pending").length})`,          color: "#D97706", bg: "#FFFBEB" },
            { label: `Verified (${rows.filter(r => r.user.id !== DEMO_USER.id && r.user.kycStatus === "verified").length})`,            color: "#059669", bg: "#ECFDF5" },
          ].map(b => (
            <div key={b.label} style={{ background: b.bg, color: b.color, borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: 700 }}>{b.label}</div>
          ))}
          <button onClick={loadRows}
            style={{ padding: "8px 16px", borderRadius: "8px", border: "1.5px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", display: "flex", alignItems: "center", gap: "6px" }}>
            ↻ Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: "14px", padding: "16px 20px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email…"
            style={{ width: "100%", padding: "10px 14px 10px 36px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", background: "#fff", color: "#374151", outline: "none" }}>
          {["All", "Active", "Frozen", "Suspended", "Closed"].map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={kycFilter} onChange={e => setKycFilter(e.target.value)}
          style={{ padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", background: "#fff", color: "#374151", outline: "none" }}>
          {["All", "Not Submitted", "Pending", "Approved"].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="admin-table-scroll" style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {!loaded ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#9CA3AF" }}>Loading users from server…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <p style={{ fontSize: "40px", marginBottom: "12px" }}>👥</p>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>
              {rows.filter(r => r.user.id !== DEMO_USER.id).length === 0 ? "No registered users yet" : "No users match your filters"}
            </p>
            <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
              {rows.filter(r => r.user.id !== DEMO_USER.id).length === 0
                ? "Users will appear here once they register through the Vaulte sign-up page."
                : "Try adjusting your search or filter criteria."}
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#F8FAFC" }}>
              <tr>
                {["User", "Email", "Country", "Balance", "KYC", "Account", "Joined", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((row, i) => {
                const { user } = row;
                const accStatus = user.accountStatus ?? "active";
                const kycLabel  = user.kycStatus === "verified" ? "Approved" : user.kycStatus === "pending" ? "Pending" : "Not Submitted";
                return (
                  <tr key={user.id} style={{ borderTop: "1px solid #F3F4F6", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                    <td style={{ padding: "14px 16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: user.id === DEMO_USER.id ? "#FFF7ED" : "#EEF4FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: user.id === DEMO_USER.id ? "#D97706" : "#1A73E8", fontSize: "14px", flexShrink: 0 }}>
                          {`${user.firstName[0]}${user.lastName[0]}`.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 600, color: "#0A1628" }}>
                            {user.firstName} {user.lastName}
                            {user.id === DEMO_USER.id && <span style={{ marginLeft: "6px", fontSize: "11px", background: "#FFF7ED", color: "#D97706", borderRadius: "6px", padding: "1px 6px", fontWeight: 700 }}>DEMO</span>}
                          </div>
                          <div style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace" }}>{user.id.slice(0, 18)}…</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#374151" }}>{user.email}</td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", color: "#374151" }}>{user.kycNationality ?? "—"}</td>
                    <td style={{ padding: "14px 16px", fontSize: "13px", fontWeight: 700, color: "#0A1628" }}>{fmtUSD(row.totalBalance)}</td>
                    <td style={{ padding: "14px 16px" }}><Badge label={kycLabel} /></td>
                    <td style={{ padding: "14px 16px" }}><Badge label={accStatus} /></td>
                    <td style={{ padding: "14px 16px", fontSize: "12px", color: "#9CA3AF" }}>{new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <button onClick={() => setManaging(row)}
                        style={{ background: "#EEF4FF", color: "#1A73E8", border: "none", borderRadius: "8px", padding: "6px 14px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                        Manage
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Manage modal */}
      {managing && (
        <ManageModal
          row={managing}
          onClose={() => setManaging(null)}
          onUpdated={handleUpdated}
          onDeleted={handleDeleted}
        />
      )}
    </AdminLayout>
  );
}
