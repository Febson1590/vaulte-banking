"use client";
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";

const systemDescriptions = [
  "Salary Payment", "International Transfer", "Online Purchase", "Grocery Store",
  "Restaurant Payment", "ATM Withdrawal", "Card Payment", "Utility Bill",
  "Subscription Payment", "Bank Fee", "Refund", "Cash Deposit", "Flight Booking",
  "Hotel Payment", "Ride Service", "Insurance Payment", "Mobile Recharge",
  "E-commerce Purchase", "Freelance Payment", "Client Transfer",
];

const users = [
  { id: "ACC001", label: "Samson Febaide — Checking (USD)" },
  { id: "ACC003", label: "Maria Kowalski — Checking (EUR)" },
  { id: "ACC005", label: "Aisha Bello — Checking (USD)" },
  { id: "ACC007", label: "Li Wei — Multi-Currency (GBP)" },
];

interface GeneratedTx {
  date: string;
  description: string;
  type: "credit" | "debit";
  amount: number;
  balance: number;
  reference: string;
  status: string;
}

function generateRef() {
  return "VLT-" + Math.random().toString(36).substr(2, 8).toUpperCase();
}

function generateTransactions(
  startDate: string,
  endDate: string,
  openingBalance: number,
  totalCredits: number,
  totalDebits: number,
  minTx: number,
  maxTx: number,
  activityLevel: string,
  includeWeekends: boolean,
  customDescs: string[]
): GeneratedTx[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const days: Date[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const day = d.getDay();
    if (!includeWeekends && (day === 0 || day === 6)) continue;
    days.push(new Date(d));
  }

  const txCount = Math.floor(Math.random() * (maxTx - minTx + 1)) + minTx;
  const allDescs = [...systemDescriptions, ...customDescs.filter(d => d.trim())];

  // Decide credit/debit split
  const creditCount = Math.ceil(txCount * 0.45);
  const debitCount = txCount - creditCount;

  const transactions: GeneratedTx[] = [];

  // Generate credit amounts that sum to totalCredits
  const creditAmounts = splitAmount(totalCredits, creditCount);
  const debitAmounts = splitAmount(totalDebits, debitCount);

  // Interleave credits and debits
  const allAmounts: { type: "credit" | "debit"; amount: number }[] = [
    ...creditAmounts.map(a => ({ type: "credit" as const, amount: a })),
    ...debitAmounts.map(a => ({ type: "debit" as const, amount: a })),
  ].sort(() => Math.random() - 0.5);

  let balance = openingBalance;

  allAmounts.forEach((tx, i) => {
    const dayIndex = Math.floor((i / allAmounts.length) * days.length);
    const day = days[Math.min(dayIndex, days.length - 1)];
    const hour = Math.floor(Math.random() * 14) + 7;
    const min = Math.floor(Math.random() * 60);
    const date = new Date(day);
    date.setHours(hour, min);

    if (tx.type === "credit") {
      balance += tx.amount;
    } else {
      balance -= tx.amount;
    }

    transactions.push({
      date: date.toLocaleString("en-US", { month: "short", day: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      description: allDescs[Math.floor(Math.random() * allDescs.length)],
      type: tx.type,
      amount: tx.amount,
      balance: Math.round(balance * 100) / 100,
      reference: generateRef(),
      status: "Completed",
    });
  });

  // Sort by date
  transactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return transactions;
}

function splitAmount(total: number, count: number): number[] {
  if (count === 0) return [];
  const amounts: number[] = [];
  let remaining = total;
  for (let i = 0; i < count - 1; i++) {
    const max = remaining - (count - i - 1) * 1;
    const min = 1;
    const amount = Math.round((Math.random() * (max * 0.4 - min) + min) * 100) / 100;
    amounts.push(amount);
    remaining -= amount;
  }
  amounts.push(Math.round(remaining * 100) / 100);
  return amounts;
}

export default function AdminTxGenerator() {
  const [form, setForm] = useState({
    accountId: "ACC001",
    startDate: "2025-01-01",
    endDate: "2025-03-10",
    openingBalance: "1000",
    finalBalance: "5240",
    totalCredits: "8000",
    totalDebits: "3760",
    minTx: "30",
    maxTx: "80",
    activityLevel: "normal",
    includeWeekends: true,
    customDescs: "",
  });

  const [preview, setPreview] = useState<GeneratedTx[] | null>(null);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [generating, setGenerating] = useState(false);

  const set = (key: string, value: string | boolean) => setForm(prev => ({ ...prev, [key]: value }));

  const validateAndGenerate = () => {
    setError("");
    const opening = parseFloat(form.openingBalance);
    const final = parseFloat(form.finalBalance);
    const credits = parseFloat(form.totalCredits);
    const debits = parseFloat(form.totalDebits);

    const expectedFinal = Math.round((opening + credits - debits) * 100) / 100;
    if (Math.abs(expectedFinal - final) > 0.01) {
      setError(`Balance formula doesn't match: Opening ($${opening}) + Credits ($${credits}) − Debits ($${debits}) = $${expectedFinal}, but Final Balance is set to $${final}. Please correct the values.`);
      return;
    }
    if (parseInt(form.minTx) > parseInt(form.maxTx)) {
      setError("Minimum transactions cannot be greater than maximum transactions.");
      return;
    }
    if (new Date(form.startDate) >= new Date(form.endDate)) {
      setError("Start date must be before end date.");
      return;
    }

    setGenerating(true);
    setTimeout(() => {
      const customDescs = form.customDescs.split("\n").filter(d => d.trim());
      const txs = generateTransactions(
        form.startDate, form.endDate,
        opening, credits, debits,
        parseInt(form.minTx), parseInt(form.maxTx),
        form.activityLevel, form.includeWeekends, customDescs
      );
      setPreview(txs);
      setGenerating(false);
      setSaved(false);
    }, 800);
  };

  const handleConfirm = () => {
    setSaved(true);
    setTimeout(() => { setSaved(false); setPreview(null); }, 2000);
  };

  return (
    <AdminLayout title="Transaction Generator">
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0A1628" }}>Historical Transaction Generator</h1>
        <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>
          Generate realistic past transaction histories for any user account
        </p>
      </div>

      {/* Info banner */}
      <div style={{ background: "linear-gradient(135deg, #0A1628, #1A2B4A)", borderRadius: "14px", padding: "20px 24px", marginBottom: "24px", display: "flex", gap: "16px", alignItems: "flex-start" }}>
        <div style={{ fontSize: "28px" }}>🔧</div>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#fff", marginBottom: "4px" }}>Admin-Only Tool</div>
          <div style={{ fontSize: "13px", color: "rgba(255,255,255,0.7)" }}>
            This tool generates dummy historical transactions for simulation purposes. The formula <strong style={{ color: "#FFC107" }}>Opening Balance + Total Credits − Total Debits = Final Balance</strong> must hold exactly. If values don't match, you'll see a validation error.
          </div>
        </div>
      </div>

      {error && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "14px 16px", marginBottom: "20px", color: "#DC2626", fontSize: "13px" }}>
          ⚠️ {error}
        </div>
      )}

      {saved ? (
        <div style={{ background: "#ECFDF5", border: "1px solid #6EE7B7", borderRadius: "14px", padding: "40px", textAlign: "center" }}>
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>✅</div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "#059669" }}>Transactions Saved Successfully!</div>
          <div style={{ fontSize: "14px", color: "#6B7280", marginTop: "8px" }}>{preview?.length} transactions added to the account history.</div>
        </div>
      ) : preview ? (
        <div>
          {/* Preview header */}
          <div style={{ background: "#fff", borderRadius: "14px", padding: "20px", marginBottom: "16px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
            <div className="admin-txgen-preview-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0A1628" }}>Preview — {preview.length} Transactions Generated</h2>
                <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6B7280" }}>Review the transactions below before confirming</p>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => setPreview(null)}
                  style={{ padding: "10px 18px", background: "#F3F4F6", color: "#6B7280", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  ← Back & Edit
                </button>
                <button onClick={validateAndGenerate}
                  style={{ padding: "10px 18px", background: "#FFFBEB", color: "#D97706", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  🔄 Regenerate
                </button>
                <button onClick={handleConfirm}
                  style={{ padding: "10px 18px", background: "#059669", color: "#fff", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  ✅ Confirm & Save
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="admin-txgen-summary-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
              {[
                { label: "Opening Balance", value: `$${form.openingBalance}`, color: "#1A73E8" },
                { label: "Total Credits", value: `+$${form.totalCredits}`, color: "#059669" },
                { label: "Total Debits", value: `-$${form.totalDebits}`, color: "#DC2626" },
                { label: "Final Balance", value: `$${form.finalBalance}`, color: "#7C3AED" },
              ].map(s => (
                <div key={s.label} style={{ background: "#F8FAFC", borderRadius: "10px", padding: "12px 16px", textAlign: "center" }}>
                  <div style={{ fontSize: "18px", fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Transaction table */}
          <div style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "auto", maxHeight: "500px" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "750px" }}>
              <thead style={{ background: "#F8FAFC", position: "sticky", top: 0 }}>
                <tr>
                  {["Date & Time", "Description", "Type", "Amount", "Running Balance", "Reference", "Status"].map(h => (
                    <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.map((tx, i) => (
                  <tr key={i} style={{ borderTop: "1px solid #F3F4F6", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                    <td style={{ padding: "10px 16px", fontSize: "12px", color: "#6B7280", whiteSpace: "nowrap" }}>{tx.date}</td>
                    <td style={{ padding: "10px 16px", fontSize: "13px", color: "#374151" }}>{tx.description}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ background: tx.type === "credit" ? "#ECFDF5" : "#FEF2F2", color: tx.type === "credit" ? "#059669" : "#DC2626", borderRadius: "20px", padding: "2px 10px", fontSize: "11px", fontWeight: 600 }}>
                        {tx.type === "credit" ? "Credit" : "Debit"}
                      </span>
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: "13px", fontWeight: 700, color: tx.type === "credit" ? "#059669" : "#DC2626" }}>
                      {tx.type === "credit" ? "+" : "-"}${tx.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: "10px 16px", fontSize: "13px", fontWeight: 700, color: "#0A1628" }}>${tx.balance.toFixed(2)}</td>
                    <td style={{ padding: "10px 16px", fontSize: "11px", color: "#9CA3AF", fontFamily: "monospace" }}>{tx.reference}</td>
                    <td style={{ padding: "10px 16px" }}>
                      <span style={{ background: "#ECFDF5", color: "#059669", borderRadius: "20px", padding: "2px 10px", fontSize: "11px", fontWeight: 600 }}>Completed</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Input form */
        <div className="admin-txgen-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          {/* Left column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700, color: "#0A1628" }}>📋 Account & Date Range</h3>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Target Account</label>
                <select value={form.accountId} onChange={e => set("accountId", e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", outline: "none" }}>
                  {users.map(u => <option key={u.id} value={u.id}>{u.label}</option>)}
                </select>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Start Date</label>
                  <input type="date" value={form.startDate} onChange={e => set("startDate", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>End Date</label>
                  <input type="date" value={form.endDate} onChange={e => set("endDate", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700, color: "#0A1628" }}>💰 Balance Parameters</h3>
              <div style={{ background: "#FFFBEB", border: "1px solid #FCD34D", borderRadius: "8px", padding: "10px 12px", marginBottom: "14px", fontSize: "12px", color: "#92400E" }}>
                <strong>Formula must hold:</strong> Opening + Credits − Debits = Final Balance
              </div>
              {[
                { key: "openingBalance", label: "Opening Balance ($)" },
                { key: "finalBalance", label: "Final Balance ($)" },
                { key: "totalCredits", label: "Total Credits ($)" },
                { key: "totalDebits", label: "Total Debits ($)" },
              ].map(f => (
                <div key={f.key} style={{ marginBottom: "12px" }}>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>{f.label}</label>
                  <input type="number" value={form[f.key as keyof typeof form] as string} onChange={e => set(f.key, e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
            </div>
          </div>

          {/* Right column */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 16px", fontSize: "15px", fontWeight: 700, color: "#0A1628" }}>⚙️ Generation Rules</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "14px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Min Transactions</label>
                  <input type="number" value={form.minTx} onChange={e => set("minTx", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "6px" }}>Max Transactions</label>
                  <input type="number" value={form.maxTx} onChange={e => set("maxTx", e.target.value)}
                    style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "14px", outline: "none", boxSizing: "border-box" }} />
                </div>
              </div>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>Activity Level</label>
                <div style={{ display: "flex", gap: "8px" }}>
                  {["low", "normal", "high"].map(level => (
                    <button key={level} onClick={() => set("activityLevel", level)}
                      style={{ flex: 1, padding: "10px", border: "1.5px solid", borderColor: form.activityLevel === level ? "#1A73E8" : "#E5E7EB", borderRadius: "8px", background: form.activityLevel === level ? "#EEF4FF" : "#fff", color: form.activityLevel === level ? "#1A73E8" : "#6B7280", fontWeight: 600, fontSize: "13px", cursor: "pointer", textTransform: "capitalize" }}>
                      {level}
                    </button>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderTop: "1px solid #F3F4F6" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>Include Weekends</div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF" }}>Generate transactions on Saturdays & Sundays</div>
                </div>
                <div onClick={() => set("includeWeekends", !form.includeWeekends)}
                  style={{ width: "48px", height: "26px", borderRadius: "13px", background: form.includeWeekends ? "#1A73E8" : "#D1D5DB", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#fff", position: "absolute", top: "3px", left: form.includeWeekends ? "25px" : "3px", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </div>
              </div>
            </div>

            <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <h3 style={{ margin: "0 0 8px", fontSize: "15px", fontWeight: 700, color: "#0A1628" }}>📝 Custom Descriptions</h3>
              <p style={{ margin: "0 0 12px", fontSize: "12px", color: "#9CA3AF" }}>One per line — mixed with system descriptions</p>
              <textarea value={form.customDescs} onChange={e => set("customDescs", e.target.value)}
                placeholder={"Freelance Payment\nClient Transfer\nOffice Rent\nConsulting Fee"}
                style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", minHeight: "100px", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
            </div>

            <button onClick={validateAndGenerate} disabled={generating}
              style={{ width: "100%", padding: "16px", background: generating ? "#9CA3AF" : "#1A73E8", color: "#fff", border: "none", borderRadius: "12px", fontSize: "16px", fontWeight: 700, cursor: generating ? "not-allowed" : "pointer" }}>
              {generating ? "⏳ Generating..." : "🔧 Generate Preview"}
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
