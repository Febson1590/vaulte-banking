"use client";
import { useState } from "react";
import AdminLayout from "@/components/AdminLayout";

export default function AdminSettings() {
  const [transferLimit, setTransferLimit] = useState("10000");
  const [withdrawalLimit, setWithdrawalLimit] = useState("5000");
  const [transferFee, setTransferFee] = useState("1.5");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState("System maintenance tonight 1AM – 3AM. Thank you for your patience.");
  const [features, setFeatures] = useState({
    externalTransfers: true,
    cryptoWallet: true,
    loanRequests: false,
    virtualCards: true,
    internationalTransfers: true,
  });
  const [currencies, setCurrencies] = useState({ USD: true, EUR: true, GBP: true, BTC: true, NGN: false, JPY: false });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const toggle = (key: keyof typeof features) => setFeatures(prev => ({ ...prev, [key]: !prev[key] }));
  const toggleCurrency = (key: keyof typeof currencies) => setCurrencies(prev => ({ ...prev, [key]: !prev[key] }));

  return (
    <AdminLayout title="Settings">
      <div className="admin-settings-header" style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0A1628" }}>System Settings</h1>
          <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>Configure platform-wide parameters and features</p>
        </div>
        <button onClick={handleSave}
          style={{ padding: "10px 24px", background: saved ? "#059669" : "#1A73E8", color: "#fff", border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 600, cursor: "pointer" }}>
          {saved ? "✅ Saved!" : "Save Changes"}
        </button>
      </div>

      <div className="admin-settings-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        {/* Transaction Limits */}
        <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700, color: "#0A1628" }}>💸 Transaction Limits</h2>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>Daily Transfer Limit (USD)</label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px", color: "#6B7280" }}>$</span>
              <input type="number" value={transferLimit} onChange={e => setTransferLimit(e.target.value)}
                style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "14px", outline: "none" }} />
            </div>
            <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px" }}>Current: $10,000/day</div>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>Daily Withdrawal Limit (USD)</label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px", color: "#6B7280" }}>$</span>
              <input type="number" value={withdrawalLimit} onChange={e => setWithdrawalLimit(e.target.value)}
                style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "14px", outline: "none" }} />
            </div>
            <div style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "4px" }}>Current: $5,000/day</div>
          </div>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>Transfer Fee (%)</label>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <input type="number" step="0.1" value={transferFee} onChange={e => setTransferFee(e.target.value)}
                style={{ flex: 1, padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "14px", outline: "none" }} />
              <span style={{ fontSize: "16px", color: "#6B7280" }}>%</span>
            </div>
          </div>
        </div>

        {/* Feature Toggles */}
        <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700, color: "#0A1628" }}>🔧 Feature Toggles</h2>
          {Object.entries(features).map(([key, enabled]) => {
            const labels: Record<string, string> = {
              externalTransfers: "External Transfers",
              cryptoWallet: "Crypto Wallet",
              loanRequests: "Loan Requests",
              virtualCards: "Virtual Cards",
              internationalTransfers: "International Transfers",
            };
            return (
              <div key={key} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #F3F4F6" }}>
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#0A1628" }}>{labels[key]}</div>
                  <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{enabled ? "Enabled" : "Disabled"}</div>
                </div>
                <div onClick={() => toggle(key as keyof typeof features)}
                  style={{ width: "48px", height: "26px", borderRadius: "13px", background: enabled ? "#1A73E8" : "#D1D5DB", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
                  <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#fff", position: "absolute", top: "3px", left: enabled ? "25px" : "3px", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Supported Currencies */}
        <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700, color: "#0A1628" }}>🌍 Supported Currencies</h2>
          <div className="admin-settings-currency-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            {Object.entries(currencies).map(([currency, enabled]) => (
              <div key={currency} onClick={() => toggleCurrency(currency as keyof typeof currencies)}
                style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", border: `1.5px solid ${enabled ? "#1A73E8" : "#E5E7EB"}`, borderRadius: "10px", cursor: "pointer", background: enabled ? "#EEF4FF" : "#fff" }}>
                <div style={{ width: "20px", height: "20px", borderRadius: "4px", border: `2px solid ${enabled ? "#1A73E8" : "#D1D5DB"}`, background: enabled ? "#1A73E8" : "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {enabled && <span style={{ color: "#fff", fontSize: "12px" }}>✓</span>}
                </div>
                <span style={{ fontSize: "14px", fontWeight: 600, color: enabled ? "#1A73E8" : "#374151" }}>{currency}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Maintenance Mode */}
        <div style={{ background: "#fff", borderRadius: "14px", padding: "24px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
          <h2 style={{ margin: "0 0 20px", fontSize: "16px", fontWeight: 700, color: "#0A1628" }}>🔴 Maintenance Mode</h2>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", padding: "14px", background: maintenanceMode ? "#FEF2F2" : "#F8FAFC", borderRadius: "10px", border: `1.5px solid ${maintenanceMode ? "#FECACA" : "#E5E7EB"}` }}>
            <div>
              <div style={{ fontSize: "14px", fontWeight: 700, color: maintenanceMode ? "#DC2626" : "#0A1628" }}>
                {maintenanceMode ? "🔴 Maintenance Active" : "🟢 System Online"}
              </div>
              <div style={{ fontSize: "12px", color: "#6B7280" }}>When active, users see a maintenance message</div>
            </div>
            <div onClick={() => setMaintenanceMode(!maintenanceMode)}
              style={{ width: "48px", height: "26px", borderRadius: "13px", background: maintenanceMode ? "#DC2626" : "#D1D5DB", cursor: "pointer", position: "relative", transition: "background 0.2s" }}>
              <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "#fff", position: "absolute", top: "3px", left: maintenanceMode ? "25px" : "3px", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
            </div>
          </div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>Maintenance Message</label>
          <textarea value={maintenanceMsg} onChange={e => setMaintenanceMsg(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", minHeight: "80px", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
        </div>
      </div>
    </AdminLayout>
  );
}
