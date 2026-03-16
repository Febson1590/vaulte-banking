"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import AdminLayout from "@/components/AdminLayout";
import type { Transaction } from "@/lib/vaulteState";

// ─── Types ───────────────────────────────────────────────────
interface ApiAccount {
  id:       string;
  currency: string;
  name:     string;
  symbol:   string;
}
interface ApiUser {
  id:          string;
  firstName:   string;
  lastName:    string;
  email:       string;
  bankingState: {
    accounts:     ApiAccount[];
    transactions: Transaction[];
  } | null;
}
interface AdminTx extends Transaction {
  userName:  string;
  userEmail: string;
  userId:    string;
}

// ─── Badge helpers ───────────────────────────────────────────
const typeBadge: Record<string, { bg: string; color: string }> = {
  credit:  { bg: "#ECFDF5", color: "#059669" },
  debit:   { bg: "#FFF7ED", color: "#EA580C" },
};
const statusBadge: Record<string, { bg: string; color: string }> = {
  completed: { bg: "#ECFDF5", color: "#059669" },
  pending:   { bg: "#FFFBEB", color: "#D97706" },
  failed:    { bg: "#F3F4F6", color: "#6B7280" },
  reversed:  { bg: "#F5F3FF", color: "#7C3AED" },
};
function Badge({ label, map }: { label: string; map: Record<string, { bg: string; color: string }> }) {
  const s = map[label] ?? { bg: "#F3F4F6", color: "#6B7280" };
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: 600, textTransform: "capitalize" }}>
      {label}
    </span>
  );
}

const INPUT: React.CSSProperties = {
  width: "100%", padding: "10px 14px",
  border: "1.5px solid #E5E7EB", borderRadius: "10px",
  fontSize: "13px", outline: "none", boxSizing: "border-box",
  fontFamily: "inherit",
};

// ─────────────────────────────────────────────────────────────
export default function AdminTransactions() {
  // ── Data ────────────────────────────────────────────────────
  const [users,   setUsers]   = useState<ApiUser[]>([]);
  const [allTx,   setAllTx]   = useState<AdminTx[]>([]);
  const [loaded,  setLoaded]  = useState(false);
  const [loadErr, setLoadErr] = useState<string | null>(null);

  // ── Filters ────────────────────────────────────────────────
  const [search,       setSearch]       = useState("");
  const [typeFilter,   setTypeFilter]   = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  // ── Detail modal ───────────────────────────────────────────
  const [selected, setSelected] = useState<AdminTx | null>(null);

  // ── Create Transaction modal ───────────────────────────────
  const [showCreate,    setShowCreate]    = useState(false);
  const [createUser,    setCreateUser]    = useState("");
  const [createAcc,     setCreateAcc]     = useState("");
  const [createType,    setCreateType]    = useState<"credit" | "debit">("credit");
  const [createAmount,  setCreateAmount]  = useState("");
  const [createDesc,    setCreateDesc]    = useState("");
  const [createNote,    setCreateNote]    = useState("");
  const [createDate,    setCreateDate]    = useState("");
  const [creating,      setCreating]      = useState(false);
  const [createErr,     setCreateErr]     = useState("");
  const [createSuccess, setCreateSuccess] = useState(false);

  // ── Load all data from Redis ────────────────────────────────
  const loadData = useCallback(async () => {
    setLoaded(false);
    setLoadErr(null);
    try {
      const res  = await fetch("/api/admin/users");
      const data = await res.json() as { success: boolean; users: ApiUser[] };
      if (!data.success) throw new Error("Failed to load users");

      const real = data.users.filter(u => u.email !== "demo@vaulte.com");
      setUsers(real);

      const txs: AdminTx[] = [];
      for (const u of real) {
        if (!u.bankingState?.transactions) continue;
        for (const tx of u.bankingState.transactions) {
          txs.push({
            ...tx,
            userName:  `${u.firstName} ${u.lastName}`,
            userEmail: u.email,
            userId:    u.id,
          });
        }
      }
      txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAllTx(txs);
    } catch (err) {
      setLoadErr(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── Filtered view ───────────────────────────────────────────
  const filtered = useMemo(() => allTx.filter(tx => {
    const matchType   = typeFilter   === "All" || tx.type   === typeFilter;
    const matchStatus = statusFilter === "All" || tx.status === statusFilter;
    const q           = search.toLowerCase();
    const matchSearch = !q
      || tx.userName.toLowerCase().includes(q)
      || tx.name.toLowerCase().includes(q)
      || tx.id.toLowerCase().includes(q)
      || tx.reference.toLowerCase().includes(q);
    return matchType && matchStatus && matchSearch;
  }), [allTx, typeFilter, statusFilter, search]);

  // ── Accounts for selected create-user ─────────────────────
  const createUserObj = users.find(u => u.email === createUser);
  const createAccounts = createUserObj?.bankingState?.accounts ?? [];

  // When user changes in create form, reset account to first
  useEffect(() => {
    if (createAccounts.length > 0 && !createAccounts.find(a => a.id === createAcc)) {
      setCreateAcc(createAccounts[0].id);
    }
  }, [createUser, createAccounts, createAcc]);

  // Set default create user on load
  useEffect(() => {
    if (users.length > 0 && !createUser) {
      setCreateUser(users[0].email);
    }
  }, [users, createUser]);

  // ── Create transaction ─────────────────────────────────────
  const handleCreate = async () => {
    if (!createUser || !createAcc || !createAmount) {
      setCreateErr("User, wallet, and amount are required.");
      return;
    }
    const amt = parseFloat(createAmount);
    if (isNaN(amt) || amt <= 0) {
      setCreateErr("Amount must be a positive number.");
      return;
    }
    const acc = createAccounts.find(a => a.id === createAcc);
    if (!acc) { setCreateErr("Wallet not found."); return; }

    setCreating(true);
    setCreateErr("");
    try {
      const body: Record<string, unknown> = {
        email:    createUser,
        amount:   amt,
        type:     createType,
        currency: acc.currency,
      };
      if (createDesc.trim())  body.description  = createDesc.trim();
      if (createNote.trim())  body.internalNote = createNote.trim();
      if (createDate.trim())  body.txDate       = createDate.trim();

      const res  = await fetch("/api/admin/balance", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify(body),
      });
      const data = await res.json() as { success: boolean; error?: string };
      if (!data.success) throw new Error(data.error ?? "Failed");
      setCreateSuccess(true);
      setTimeout(() => {
        setCreateSuccess(false);
        setShowCreate(false);
        setCreateAmount("");
        setCreateDesc("");
        setCreateNote("");
        setCreateDate("");
        loadData();
      }, 1800);
    } catch (err) {
      setCreateErr(err instanceof Error ? err.message : "Error creating transaction");
    } finally {
      setCreating(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────
  return (
    <AdminLayout title="Transactions">
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0A1628" }}>Transaction Monitor</h1>
          <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>
            {loaded
              ? `${allTx.length} transactions across all users · Source: Redis ✓`
              : "Loading from Redis…"}
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center", flexWrap: "wrap" }}>
          {[
            { label: `Completed (${allTx.filter(t => t.status === "completed").length})`, color: "#059669", bg: "#ECFDF5" },
            { label: `Pending (${allTx.filter(t => t.status === "pending").length})`,     color: "#D97706", bg: "#FFFBEB" },
            { label: `Failed (${allTx.filter(t => t.status === "failed").length})`,       color: "#6B7280", bg: "#F3F4F6" },
          ].map(b => (
            <div key={b.label} style={{ background: b.bg, color: b.color, borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: 700 }}>{b.label}</div>
          ))}
          <button onClick={() => loadData()}
            style={{ padding: "8px 16px", borderRadius: "8px", border: "1px solid #E5E7EB", background: "#fff", color: "#374151", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
            ↻ Refresh
          </button>
          <button onClick={() => { setShowCreate(true); setCreateErr(""); setCreateSuccess(false); }}
            style={{ padding: "8px 20px", borderRadius: "8px", border: "none", background: "#1A73E8", color: "#fff", fontSize: "13px", fontWeight: 700, cursor: "pointer" }}>
            + Create Transaction
          </button>
        </div>
      </div>

      {loadErr && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", color: "#DC2626", fontSize: "13px" }}>
          ⚠ {loadErr}
        </div>
      )}

      {/* ── Filters ── */}
      <div style={{ background: "#fff", borderRadius: "14px", padding: "16px 20px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, minWidth: "200px" }}>
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }}>🔍</span>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by user, name, ID, or reference…"
            style={{ ...INPUT, paddingLeft: "36px" }} />
        </div>
        <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
          style={{ padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", background: "#fff", color: "#374151", outline: "none" }}>
          {["All", "credit", "debit"].map(t => (
            <option key={t} value={t}>{t === "All" ? "All Types" : t === "credit" ? "Credits" : "Debits"}</option>
          ))}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", background: "#fff", color: "#374151", outline: "none" }}>
          {["All", "completed", "pending", "failed", "reversed"].map(s => (
            <option key={s} value={s}>{s === "All" ? "All Statuses" : s[0].toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {/* ── Table ── */}
      <div className="admin-table-scroll" style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        {!loaded ? (
          <div style={{ padding: "60px", textAlign: "center", color: "#9CA3AF" }}>Loading from Redis…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <p style={{ fontSize: "36px", marginBottom: "12px" }}>💸</p>
            <p style={{ fontSize: "15px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>
              {allTx.length === 0 ? "No transactions yet" : "No transactions match your filters"}
            </p>
            <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
              {allTx.length === 0
                ? "Use the generator or Create Transaction to add the first entries."
                : "Try a different search or filter."}
            </p>
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ background: "#F8FAFC" }}>
              <tr>
                {["User", "Description", "Type", "Amount", "Status", "Date", "Actions"].map(h => (
                  <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map((tx, i) => (
                <tr key={`${tx.id}-${tx.userId}`} style={{ borderTop: "1px solid #F3F4F6", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#0A1628" }}>{tx.userName}</div>
                    <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{tx.userEmail}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#0A1628" }}>{tx.name}</div>
                    <div style={{ fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace" }}>{tx.reference}</div>
                  </td>
                  <td style={{ padding: "12px 16px" }}><Badge label={tx.type} map={typeBadge} /></td>
                  <td style={{ padding: "12px 16px", fontSize: "13px", fontWeight: 700, color: tx.type === "credit" ? "#059669" : "#DC2626" }}>
                    {tx.type === "credit" ? "+" : "−"}
                    {tx.currency === "BTC" ? `₿${tx.amount.toFixed(4)}` : `$${tx.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                  </td>
                  <td style={{ padding: "12px 16px" }}><Badge label={tx.status} map={statusBadge} /></td>
                  <td style={{ padding: "12px 16px", fontSize: "12px", color: "#9CA3AF" }}>
                    {new Date(tx.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <button onClick={() => setSelected(tx)}
                      style={{ background: "#EEF4FF", color: "#1A73E8", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {filtered.length > 100 && (
          <div style={{ padding: "14px", textAlign: "center", color: "#9CA3AF", fontSize: "13px", borderTop: "1px solid #F3F4F6" }}>
            Showing first 100 of {filtered.length} transactions. Use search to narrow results.
          </div>
        )}
      </div>

      {/* ── Detail modal ── */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "500px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0A1628" }}>Transaction Detail</h2>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9CA3AF" }}>✕</button>
            </div>
            <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "16px", marginBottom: "16px" }}>
              {[
                { label: "User",         value: `${selected.userName} (${selected.userEmail})` },
                { label: "Description",  value: selected.name },
                { label: "Sub",          value: selected.sub },
                { label: "Amount",       value: `${selected.currency} ${selected.amount.toFixed(selected.currency === "BTC" ? 6 : 2)}` },
                { label: "Type",         value: selected.type },
                { label: "Status",       value: selected.status },
                { label: "Category",     value: selected.category },
                { label: "Date",         value: new Date(selected.date).toLocaleString() },
                { label: "Reference",    value: selected.reference },
                { label: "Tx ID",        value: selected.id },
                { label: "Account ID",   value: selected.accountId },
              ].map(f => (
                <div key={f.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid #E5E7EB", gap: "12px" }}>
                  <span style={{ fontSize: "12px", color: "#9CA3AF", fontWeight: 600, flexShrink: 0 }}>{f.label}</span>
                  <span style={{ fontSize: "12.5px", color: "#0A1628", fontWeight: 500, textAlign: "right", wordBreak: "break-all" }}>{f.value}</span>
                </div>
              ))}
            </div>
            {/* Audit fields (admin-only) */}
            {(selected.source || selected.internalNote) && (
              <div style={{ background: "#FFFBEB", border: "1px solid #FDE68A", borderRadius: "10px", padding: "12px 14px", marginBottom: "16px" }}>
                <p style={{ fontSize: "11px", fontWeight: 700, color: "#D97706", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  Admin-Only Audit Fields
                </p>
                {selected.source && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", gap: "8px" }}>
                    <span style={{ fontSize: "11.5px", color: "#9CA3AF", fontWeight: 600 }}>Source</span>
                    <span style={{ fontSize: "11.5px", color: "#0A1628" }}>{selected.source}</span>
                  </div>
                )}
                {selected.createdBy && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", gap: "8px" }}>
                    <span style={{ fontSize: "11.5px", color: "#9CA3AF", fontWeight: 600 }}>Created By</span>
                    <span style={{ fontSize: "11.5px", color: "#0A1628" }}>{selected.createdBy}</span>
                  </div>
                )}
                {selected.internalNote && (
                  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", gap: "8px" }}>
                    <span style={{ fontSize: "11.5px", color: "#9CA3AF", fontWeight: 600 }}>Internal Note</span>
                    <span style={{ fontSize: "11.5px", color: "#0A1628", textAlign: "right" }}>{selected.internalNote}</span>
                  </div>
                )}
              </div>
            )}
            <button onClick={() => setSelected(null)}
              style={{ width: "100%", padding: "10px", background: "#F3F4F6", color: "#374151", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
              Close
            </button>
          </div>
        </div>
      )}

      {/* ── Create Transaction modal ── */}
      {showCreate && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "520px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
              <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0A1628" }}>Create Transaction</h2>
              <button onClick={() => setShowCreate(false)} style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9CA3AF" }}>✕</button>
            </div>
            <p style={{ fontSize: "13px", color: "#6B7280", marginBottom: "20px" }}>
              Create a credit or debit on any user&apos;s wallet. The visible description is what the user sees — never "Admin Credit/Debit".
            </p>

            {createSuccess ? (
              <div style={{ textAlign: "center", padding: "32px 0" }}>
                <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "#059669" }}>Transaction Created!</div>
                <div style={{ fontSize: "13px", color: "#6B7280", marginTop: "6px" }}>The ledger has been updated in Redis.</div>
              </div>
            ) : (
              <>
                {createErr && (
                  <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "8px", padding: "10px 14px", marginBottom: "14px", color: "#DC2626", fontSize: "13px" }}>
                    ⚠ {createErr}
                  </div>
                )}

                {/* Type toggle */}
                <div style={{ display: "flex", gap: "8px", marginBottom: "14px" }}>
                  {(["credit", "debit"] as const).map(t => (
                    <button key={t} onClick={() => setCreateType(t)}
                      style={{ flex: 1, padding: "10px", border: `2px solid ${createType === t ? (t === "credit" ? "#059669" : "#DC2626") : "#E5E7EB"}`, borderRadius: "10px", background: createType === t ? (t === "credit" ? "#ECFDF5" : "#FEF2F2") : "#fff", color: createType === t ? (t === "credit" ? "#059669" : "#DC2626") : "#6B7280", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
                      {t === "credit" ? "＋ Credit" : "— Debit"}
                    </button>
                  ))}
                </div>

                {/* Target user */}
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Target User</label>
                  <select value={createUser} onChange={e => setCreateUser(e.target.value)} style={INPUT}>
                    <option value="">— Select user —</option>
                    {users.map(u => (
                      <option key={u.email} value={u.email}>{u.firstName} {u.lastName} ({u.email})</option>
                    ))}
                  </select>
                </div>

                {/* Target wallet */}
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Target Wallet</label>
                  <select value={createAcc} onChange={e => setCreateAcc(e.target.value)} style={INPUT}>
                    {createAccounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name} ({a.currency})</option>
                    ))}
                  </select>
                </div>

                {/* Amount */}
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Amount</label>
                  <input type="number" value={createAmount} onChange={e => setCreateAmount(e.target.value)}
                    placeholder="0.00" min="0.01" step="0.01" style={INPUT} />
                </div>

                {/* Visible description */}
                <div style={{ marginBottom: "6px" }}>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Visible Description <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(what user sees on statement)</span>
                  </label>
                  <input type="text" value={createDesc} onChange={e => setCreateDesc(e.target.value)}
                    placeholder={createType === "credit"
                      ? "e.g. Timber Supply Payment – Weyerhaeuser"
                      : "e.g. Netflix  /  AT&T Wireless  /  Truck Fleet Diesel Payment"}
                    style={INPUT} />
                </div>
                <p style={{ fontSize: "11px", color: "#9CA3AF", marginBottom: "12px" }}>
                  Icons and badge colors are auto-assigned from keywords in this description.
                </p>

                {/* Date */}
                <div style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Transaction Date <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(optional — defaults to now)</span>
                  </label>
                  <input type="datetime-local" value={createDate} onChange={e => setCreateDate(e.target.value)} style={INPUT} />
                </div>

                {/* Internal note */}
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", fontSize: "12.5px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>
                    Internal Note <span style={{ color: "#9CA3AF", fontWeight: 400 }}>(admin-only, never shown to user)</span>
                  </label>
                  <input type="text" value={createNote} onChange={e => setCreateNote(e.target.value)}
                    placeholder="Audit note…"
                    style={{ ...INPUT, background: "#FFFBEB", border: "1.5px solid #FDE68A" }} />
                </div>

                <button onClick={handleCreate} disabled={creating}
                  style={{ width: "100%", padding: "13px", background: creating ? "#9CA3AF" : "#1A73E8", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: creating ? "not-allowed" : "pointer", fontFamily: "inherit" }}>
                  {creating ? "Creating…" : "Create & Save to Redis"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
