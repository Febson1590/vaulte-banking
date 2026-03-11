"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import {
  getUsers, updateUser, getUserState, saveUserState, getKycDoc,
  VaulteUser, VaulteState, genTxId, genRef, genNotifId,
} from "@/lib/vaulteState";

// ─── Badge helper ─────────────────────────────────────────
function Badge({ label }: { label: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    active:      { bg: "#ECFDF5", color: "#059669" },
    Active:      { bg: "#ECFDF5", color: "#059669" },
    frozen:      { bg: "#EFF6FF", color: "#2563EB" },
    Frozen:      { bg: "#EFF6FF", color: "#2563EB" },
    suspended:   { bg: "#FEF2F2", color: "#DC2626" },
    Suspended:   { bg: "#FEF2F2", color: "#DC2626" },
    closed:      { bg: "#F3F4F6", color: "#6B7280" },
    Closed:      { bg: "#F3F4F6", color: "#6B7280" },
    verified:    { bg: "#ECFDF5", color: "#059669" },
    Approved:    { bg: "#ECFDF5", color: "#059669" },
    pending:     { bg: "#FFFBEB", color: "#D97706" },
    Pending:     { bg: "#FFFBEB", color: "#D97706" },
    unverified:  { bg: "#F3F4F6", color: "#6B7280" },
    "Not Submitted": { bg: "#F3F4F6", color: "#6B7280" },
    Rejected:    { bg: "#FEF2F2", color: "#DC2626" },
  };
  const s = map[label] || { bg: "#F3F4F6", color: "#6B7280" };
  const displayLabel =
    label === "verified"   ? "Verified"
    : label === "pending"  ? "Pending"
    : label === "unverified" ? "Not Submitted"
    : label === "active"   ? "Active"
    : label === "frozen"   ? "Frozen"
    : label === "suspended"? "Suspended"
    : label === "closed"   ? "Closed"
    : label;
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: 600 }}>
      {displayLabel}
    </span>
  );
}

// ─── Type for enriched user row ───────────────────────────
interface UserRow {
  user: VaulteUser;
  state: VaulteState;
  totalBalance: number;
}

function getTotalBalance(state: VaulteState): number {
  const rates: Record<string, number> = { USD: 1, EUR: 1.09, GBP: 1.27, BTC: 66000 };
  return state.accounts.reduce((s, a) => s + a.balance * (rates[a.currency] ?? 1), 0);
}

function fmtUSD(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ─── Manage Modal ─────────────────────────────────────────
function ManageModal({
  row, onClose, onUpdated,
}: {
  row: UserRow;
  onClose: () => void;
  onUpdated: (user: VaulteUser, state: VaulteState) => void;
}) {
  const { user, state } = row;

  const [localUser,  setLocalUser]  = useState<VaulteUser>({ ...user });
  const [localState, setLocalState] = useState<VaulteState>({ ...state });
  const [toast,      setToast]      = useState<string | null>(null);
  const [balAmount,  setBalAmount]  = useState("");
  const [balType,    setBalType]    = useState<"credit" | "debit">("credit");
  const [docPreview, setDocPreview] = useState<string | null>(null);
  const [showDoc,    setShowDoc]    = useState(false);

  useEffect(() => {
    if (user.id) setDocPreview(getKycDoc(user.id));
  }, [user.id]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2800);
  };

  // Persist user + state to localStorage
  const persist = (u: VaulteUser, s: VaulteState) => {
    updateUser(u.id, u);
    saveUserState(u.id, s);
    onUpdated(u, s);
    setLocalUser(u);
    setLocalState(s);
  };

  // ── Account status ───────────────────────────────────
  const setAccStatus = (status: "active" | "suspended" | "frozen" | "closed") => {
    const u = { ...localUser, accountStatus: status };
    persist(u, localState);
    showToast(`Account status updated to ${status}`);
  };

  // ── KYC status ───────────────────────────────────────
  const setKycStatus = (kycStatus: "unverified" | "pending" | "verified") => {
    const u = { ...localUser, kycStatus };
    persist(u, localState);
    showToast(`KYC status updated to ${kycStatus}`);
  };

  // ── Balance adjustment ───────────────────────────────
  const applyBalance = () => {
    const amt = parseFloat(balAmount);
    if (isNaN(amt) || amt <= 0) { showToast("Enter a valid positive amount"); return; }
    const accounts = [...localState.accounts];
    const primaryIdx = accounts.findIndex(a => a.currency === "USD") ?? 0;
    const idx = primaryIdx >= 0 ? primaryIdx : 0;
    if (idx < 0) { showToast("No account found for this user"); return; }
    const oldBal = accounts[idx].balance;
    const newBal = balType === "credit" ? oldBal + amt : Math.max(0, oldBal - amt);
    accounts[idx] = { ...accounts[idx], balance: newBal };

    // Create admin transaction record
    const txn = {
      id: genTxId(),
      txType: balType === "credit" ? "admin_credit" as const : "admin_debit" as const,
      type: balType === "credit" ? "credit" as const : "debit" as const,
      name: balType === "credit" ? "Admin Credit" : "Admin Debit",
      sub: "Manual Adjustment by Admin",
      amount: amt, fee: 0, balanceAfter: newBal,
      currency: "USD", date: new Date().toISOString(),
      category: "Adjustment", badge: "Admin", badgeBg: "#F5F3FF",
      badgeBorder: "#DDD6FE", badgeColor: "#7C3AED", status: "completed" as const,
      accountId: accounts[idx].id, icon: "⚙", iconBg: "linear-gradient(135deg,#F5F3FF,#DDD6FE)", iconColor: "#7C3AED",
      reference: genRef(),
    };
    const s = { ...localState, accounts, transactions: [txn, ...localState.transactions] };
    persist(localUser, s);
    showToast(`${balType === "credit" ? "Credited" : "Debited"} ${fmtUSD(amt)} ${balType === "credit" ? "to" : "from"} account`);
    setBalAmount("");
  };

  // ── Card ────────────────────────────────────────────
  const issueCard = () => {
    const s = { ...localState, card: { ...localState.card, issued: true, onlinePayments: true, contactless: true, internationalTxns: true, spendingLimit: 2000, spentThisMonth: 0 } };
    persist(localUser, s);
    showToast("Virtual card issued for this user");
  };
  const freezeCard = (freeze: boolean) => {
    const s = { ...localState, card: { ...localState.card, frozen: freeze } };
    persist(localUser, s);
    showToast(freeze ? "Card frozen" : "Card unfrozen");
  };

  // ── Admin notes ─────────────────────────────────────
  const saveNotes = () => {
    const u = { ...localUser };
    persist(u, localState);
    showToast("Notes saved");
  };

  const acctStatus = localUser.accountStatus ?? "active";
  const primaryAcc = localState.accounts.find(a => a.currency === "USD") ?? localState.accounts[0];
  const primaryBal = primaryAcc?.balance ?? 0;
  const totalBal   = getTotalBalance(localState);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.55)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 200, padding: "20px", overflowY: "auto" }}>
      <div style={{ background: "#fff", borderRadius: "18px", width: "100%", maxWidth: "580px", boxShadow: "0 24px 70px rgba(0,0,0,0.3)", marginTop: "20px", marginBottom: "20px", overflow: "hidden" }}>

        {/* Toast */}
        {toast && (
          <div style={{ position: "fixed", top: 28, right: 28, zIndex: 999, background: "#0F172A", color: "#fff", padding: "10px 18px", borderRadius: "10px", fontSize: "13px", fontWeight: 500, boxShadow: "0 8px 24px rgba(15,23,42,0.25)" }}>
            <span style={{ color: "#4ADE80" }}>✓</span> {toast}
          </div>
        )}

        {/* Header */}
        <div style={{ padding: "24px 28px 20px", borderBottom: "1px solid #F3F4F6" }}>
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
        <div style={{ padding: "22px 28px", overflowY: "auto", maxHeight: "72vh", display: "flex", flexDirection: "column", gap: "22px" }}>

          {/* ── Profile info ── */}
          <div>
            <p style={{ fontSize: "12px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: "10px" }}>Profile</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {[
                { label: "User ID",       value: localUser.id.slice(0, 20) + "..." },
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "8px" }}>
              {(["active", "frozen", "suspended", "closed"] as const).map(s => (
                <button key={s} onClick={() => setAccStatus(s)}
                  style={{ padding: "9px 6px", borderRadius: "10px", border: `2px solid ${acctStatus === s ? "#1A73E8" : "#E5E7EB"}`, background: acctStatus === s ? "#EEF4FF" : "#fff", color: acctStatus === s ? "#1A73E8" : "#6B7280", fontSize: "12px", fontWeight: 600, cursor: "pointer", textTransform: "capitalize", fontFamily: "inherit" }}>
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
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {(["unverified", "pending", "verified"] as const).map(k => (
                <button key={k} onClick={() => setKycStatus(k)}
                  style={{ padding: "9px 6px", borderRadius: "10px", border: `2px solid ${localUser.kycStatus === k ? "#1A73E8" : "#E5E7EB"}`, background: localUser.kycStatus === k ? "#EEF4FF" : "#fff", color: localUser.kycStatus === k ? "#1A73E8" : "#6B7280", fontSize: "12px", fontWeight: 600, cursor: "pointer", textTransform: "capitalize", fontFamily: "inherit" }}>
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
            <div style={{ display: "flex", gap: "10px" }}>
              <div style={{ display: "flex", border: "1.5px solid #E5E7EB", borderRadius: "10px", overflow: "hidden", flexShrink: 0 }}>
                {(["credit", "debit"] as const).map(t => (
                  <button key={t} onClick={() => setBalType(t)}
                    style={{ padding: "10px 14px", border: "none", background: balType === t ? (t === "credit" ? "#059669" : "#DC2626") : "#fff", color: balType === t ? "#fff" : "#6B7280", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", transition: "background 0.15s" }}>
                    {t === "credit" ? "+ Credit" : "– Debit"}
                  </button>
                ))}
              </div>
              <input type="number" value={balAmount} onChange={e => setBalAmount(e.target.value)} placeholder="Amount (USD)"
                style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "14px", outline: "none", fontFamily: "inherit" }} />
              <button onClick={applyBalance}
                style={{ padding: "10px 18px", borderRadius: "10px", border: "none", background: "#1A73E8", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit", flexShrink: 0 }}>
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
                  <button onClick={issueCard}
                    style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: "#059669", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    Issue Card
                  </button>
                )}
                {localState.card.issued && !localState.card.frozen && (
                  <button onClick={() => freezeCard(true)}
                    style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: "#2563EB", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
                    Freeze Card
                  </button>
                )}
                {localState.card.issued && localState.card.frozen && (
                  <button onClick={() => freezeCard(false)}
                    style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: "#059669", color: "#fff", fontSize: "12px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
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
              placeholder="Internal notes about this user (not visible to user)..."
              style={{ width: "100%", padding: "12px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", minHeight: "80px", resize: "vertical", outline: "none", fontFamily: "inherit", boxSizing: "border-box" }}
            />
            <button onClick={saveNotes}
              style={{ marginTop: "8px", padding: "9px 18px", borderRadius: "8px", border: "none", background: "#F3F4F6", color: "#374151", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
              Save Notes
            </button>
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
  );
}

// ─── Main Page ────────────────────────────────────────────
export default function AdminUsers() {
  const [rows,       setRows]       = useState<UserRow[]>([]);
  const [search,     setSearch]     = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [kycFilter,  setKycFilter]  = useState("All");
  const [managing,   setManaging]   = useState<UserRow | null>(null);
  const [loaded,     setLoaded]     = useState(false);

  const loadRows = () => {
    const users = getUsers();
    const r: UserRow[] = users.map(u => {
      const state = getUserState(u.id);
      return { user: u, state, totalBalance: getTotalBalance(state) };
    });
    setRows(r);
    setLoaded(true);
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
    setRows(prev => prev.map(r => r.user.id === user.id ? { user, state, totalBalance: getTotalBalance(state) } : r));
    if (managing) setManaging({ user, state, totalBalance: getTotalBalance(state) });
  };

  return (
    <AdminLayout title="User Management">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0A1628" }}>User Management</h1>
          <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>
            {loaded ? `${rows.length} registered user${rows.length !== 1 ? "s" : ""}` : "Loading..."}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {[
            { label: `Total (${rows.length})`,         color: "#1A73E8", bg: "#EEF4FF" },
            { label: `Pending KYC (${rows.filter(r => r.user.kycStatus === "pending").length})`, color: "#D97706", bg: "#FFFBEB" },
            { label: `Verified (${rows.filter(r => r.user.kycStatus === "verified").length})`,   color: "#059669", bg: "#ECFDF5" },
          ].map(b => (
            <div key={b.label} style={{ background: b.bg, color: b.color, borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: 700 }}>{b.label}</div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: "#fff", borderRadius: "14px", padding: "16px 20px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..."
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
      <div style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {!loaded ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#9CA3AF" }}>Loading users...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <p style={{ fontSize: "40px", marginBottom: "12px" }}>👥</p>
            <p style={{ fontSize: "16px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>
              {rows.length === 0 ? "No registered users yet" : "No users match your filters"}
            </p>
            <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
              {rows.length === 0 ? "Users will appear here once they register through the Vaulte sign-up page." : "Try adjusting your search or filter criteria."}
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
                        <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#EEF4FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#1A73E8", fontSize: "14px", flexShrink: 0 }}>
                          {`${user.firstName[0]}${user.lastName[0]}`.toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: 600, color: "#0A1628" }}>{user.firstName} {user.lastName}</div>
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
        />
      )}
    </AdminLayout>
  );
}
