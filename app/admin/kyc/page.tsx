"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminLayout";
import { updateUser, getKycDoc } from "@/lib/vaulteState";
import type { VaulteUser } from "@/lib/vaulteState";

// ─── KYC Entry Type ─────────────────────────────────────────
interface KYCEntry {
  id: string;
  user: string;
  email: string;
  doc: string;
  docNumber: string;
  submitted: string;
  status: string;
  country: string;
  isRealUser?: boolean;
  userId?: string;
}

// No dummy KYC entries — only real registered users are shown

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; color: string }> = {
    Pending:                 { bg: "#FFFBEB", color: "#D97706" },
    Approved:                { bg: "#ECFDF5", color: "#059669" },
    Rejected:                { bg: "#FEF2F2", color: "#DC2626" },
    "Resubmission Requested":{ bg: "#F5F3FF", color: "#7C3AED" },
  };
  const s = map[status] || { bg: "#F3F4F6", color: "#6B7280" };
  return (
    <span style={{ background: s.bg, color: s.color, borderRadius: "20px", padding: "3px 10px", fontSize: "12px", fontWeight: 600 }}>
      {status}
    </span>
  );
}

export default function AdminKYC() {
  const [kycs, setKycs]               = useState<KYCEntry[]>([]);
  const [filter, setFilter]           = useState("All");
  const [selected, setSelected]       = useState<KYCEntry | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [showReject, setShowReject]   = useState(false);
  const [docPreview, setDocPreview]   = useState<string | null>(null);
  const [syncError,  setSyncError]    = useState("");
  const [syncing,    setSyncing]      = useState(false);

  // ─── Load KYC document when modal opens ─────────────────
  useEffect(() => {
    if (!selected) { setDocPreview(null); return; }
    if (selected.isRealUser && selected.userId) {
      setDocPreview(getKycDoc(selected.userId));
    } else {
      setDocPreview(null);
    }
  }, [selected]);

  // ─── Load users from Redis via admin API (single source of truth) ─
  useEffect(() => {
    fetch("/api/admin/users")
      .then(r => r.json())
      .then(({ users }: { users: VaulteUser[] }) => {
        if (!users?.length) { setKycs([]); return; }
        const entries: KYCEntry[] = users.map(u => ({
          id:         u.id,
          user:       `${u.firstName} ${u.lastName}`,
          email:      u.email,
          doc:        u.kycDocType === "passport"        ? "Passport"
                    : u.kycDocType === "drivers_license" ? "Driver's License"
                    : u.kycDocType === "national_id"     ? "National ID"
                    : "Not uploaded",
          docNumber:  "—",
          submitted:  u.kycSubmittedAt
                        ? new Date(u.kycSubmittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })
                        : `Joined ${new Date(u.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`,
          status:     u.kycStatus === "verified" ? "Approved"
                    : u.kycStatus === "pending"  ? "Pending"
                    : "Pending",
          country:    u.kycNationality ?? "Unknown",
          isRealUser: true,
          userId:     u.id,
        }));
        // Redis has exactly one record per email — no deduplication needed
        setKycs(entries);
      })
      .catch(err => console.error("[admin/kyc] Failed to load users from API:", err));
  }, []);

  const filtered = kycs.filter(k => filter === "All" || k.status === filter);

  // ─── Update KYC status ─────────────────────────────────────
  // Redis is written and confirmed FIRST. localStorage is only updated after the
  // server write succeeds, ensuring the two stores never diverge due to a failed sync.
  const updateStatus = async (id: string, status: string) => {
    setSyncError("");
    const entry = kycs.find(k => k.id === id);

    if (entry?.isRealUser && entry.userId) {
      const kycStatus =
        status === "Approved" ? "verified"
        : status === "Rejected" ? "unverified"
        : "pending";

      setSyncing(true);
      try {
        const res = await fetch("/api/kyc/status", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ email: entry.email, kycStatus }),
        });
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
      } catch (err) {
        console.error("[admin/kyc] Redis sync failed:", err);
        setSyncError("⚠️ Failed to sync to server — please try again.");
        setSyncing(false);
        return; // Do NOT update localStorage or the list if Redis write failed
      } finally {
        setSyncing(false);
      }

      // Server write confirmed — now update localStorage
      updateUser(entry.userId, { kycStatus });
    }

    setKycs(prev => prev.map(k => k.id === id ? { ...k, status } : k));
    setSelected(null);
    setShowReject(false);
    setRejectReason("");
  };

  const pending  = kycs.filter(k => k.status === "Pending").length;
  const approved = kycs.filter(k => k.status === "Approved").length;
  const rejected = kycs.filter(k => k.status === "Rejected").length;

  return (
    <AdminLayout title="KYC Management">
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 800, color: "#0A1628" }}>KYC Management</h1>
          <p style={{ margin: "4px 0 0", color: "#6B7280", fontSize: "14px" }}>
            {pending} submission{pending !== 1 ? "s" : ""} pending review · {kycs.length} total
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          {[
            { label: `Pending (${pending})`,  color: "#D97706", bg: "#FFFBEB" },
            { label: `Approved (${approved})`,color: "#059669", bg: "#ECFDF5" },
            { label: `Rejected (${rejected})`,color: "#DC2626", bg: "#FEF2F2" },
          ].map(badge => (
            <div key={badge.label} style={{ background: badge.bg, color: badge.color, borderRadius: "8px", padding: "8px 14px", fontSize: "13px", fontWeight: 700 }}>
              {badge.label}
            </div>
          ))}
        </div>
      </div>

      {/* Sync error banner */}
      {syncError && (
        <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", borderRadius: "10px", padding: "12px 16px", marginBottom: "16px", fontSize: "13px", color: "#DC2626", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {syncError}
          <button onClick={() => setSyncError("")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "16px", color: "#DC2626", lineHeight: 1 }}>×</button>
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ background: "#fff", borderRadius: "14px", padding: "12px 16px", marginBottom: "20px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {["All", "Pending", "Approved", "Rejected", "Resubmission Requested"].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "8px 16px", borderRadius: "8px", border: "none", background: filter === f ? "#1A73E8" : "#F3F4F6", color: filter === f ? "#fff" : "#6B7280", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
            {f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="admin-table-scroll" style={{ background: "#fff", borderRadius: "14px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#F8FAFC" }}>
            <tr>
              {["User", "Email", "Country", "Document Type", "Doc Number", "Submitted", "Status", "Actions"].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "left", fontSize: "11px", fontWeight: 700, color: "#9CA3AF", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={8} style={{ padding: "48px", textAlign: "center" }}>
                  <p style={{ fontSize: "36px", marginBottom: "10px" }}>🪪</p>
                  <p style={{ fontSize: "15px", fontWeight: 700, color: "#374151", marginBottom: "6px" }}>
                    {kycs.length === 0 ? "No registered users yet" : "No entries match this filter"}
                  </p>
                  <p style={{ fontSize: "13px", color: "#9CA3AF" }}>
                    {kycs.length === 0 ? "KYC submissions will appear here once users register and submit their documents." : "Try selecting a different filter tab."}
                  </p>
                </td>
              </tr>
            )}
            {filtered.map((kyc, i) => (
              <tr key={kyc.id} style={{ borderTop: "1px solid #F3F4F6", background: i % 2 === 0 ? "#fff" : "#FAFAFA" }}>
                <td style={{ padding: "14px 16px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "34px", height: "34px", borderRadius: "50%", background: kyc.isRealUser ? "#FFF7ED" : "#EEF4FF", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: kyc.isRealUser ? "#EA580C" : "#1A73E8", fontSize: "13px", flexShrink: 0 }}>
                      {kyc.user.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div>
                      <span style={{ fontSize: "14px", fontWeight: 600, color: "#0A1628", display: "block" }}>{kyc.user}</span>
                      {kyc.isRealUser && (
                        <span style={{ fontSize: "10px", background: "#FFF7ED", color: "#EA580C", borderRadius: "4px", padding: "1px 6px", fontWeight: 600 }}>Registered User</span>
                      )}
                    </div>
                  </div>
                </td>
                <td style={{ padding: "14px 16px", fontSize: "13px", color: "#374151" }}>{kyc.email}</td>
                <td style={{ padding: "14px 16px", fontSize: "13px", color: "#374151" }}>{kyc.country}</td>
                <td style={{ padding: "14px 16px", fontSize: "13px", color: "#374151" }}>{kyc.doc}</td>
                <td style={{ padding: "14px 16px", fontSize: "12px", color: "#9CA3AF", fontFamily: "monospace" }}>{kyc.docNumber}</td>
                <td style={{ padding: "14px 16px", fontSize: "12px", color: "#9CA3AF" }}>{kyc.submitted}</td>
                <td style={{ padding: "14px 16px" }}><StatusBadge status={kyc.status} /></td>
                <td style={{ padding: "14px 16px" }}>
                  <button onClick={() => { setSelected(kyc); setShowReject(false); }}
                    style={{ background: "#EEF4FF", color: "#1A73E8", border: "none", borderRadius: "8px", padding: "6px 12px", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>
                    Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Review Modal */}
      {selected && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: "20px" }}>
          <div style={{ background: "#fff", borderRadius: "16px", padding: "32px", width: "100%", maxWidth: "500px", boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
            {/* Modal header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px" }}>
              <div>
                <h2 style={{ margin: 0, fontSize: "18px", fontWeight: 700, color: "#0A1628" }}>KYC Review</h2>
                {selected.isRealUser && (
                  <span style={{ fontSize: "11px", background: "#FFF7ED", color: "#EA580C", borderRadius: "4px", padding: "2px 8px", fontWeight: 600 }}>
                    Registered User — Changes will persist
                  </span>
                )}
              </div>
              <button onClick={() => { setSelected(null); setShowReject(false); }}
                style={{ background: "none", border: "none", fontSize: "20px", cursor: "pointer", color: "#9CA3AF" }}>✕</button>
            </div>

            {/* User info */}
            <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "16px", marginBottom: "20px" }}>
              <div style={{ fontSize: "16px", fontWeight: 700, color: "#0A1628", marginBottom: "4px" }}>{selected.user}</div>
              <div style={{ fontSize: "13px", color: "#6B7280", marginBottom: "12px" }}>{selected.email} · {selected.country}</div>
              <div className="admin-kyc-modal-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                {[
                  { label: "Document Type",    value: selected.doc },
                  { label: "Document Number",  value: selected.docNumber },
                  { label: "Submitted",        value: selected.submitted },
                  { label: "Current Status",   value: selected.status },
                ].map(f => (
                  <div key={f.label}>
                    <div style={{ fontSize: "11px", color: "#9CA3AF" }}>{f.label}</div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#0A1628" }}>{f.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Document preview — real upload if available, dummy placeholder otherwise */}
            {docPreview ? (
              <div style={{ marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "10px" }}>
                  <p style={{ fontSize: "12px", fontWeight: 700, color: "#374151" }}>
                    Uploaded Document · <span style={{ color: "#6B7280", fontWeight: 400 }}>{selected.doc}</span>
                  </p>
                  <span style={{ fontSize: "11px", background: "#ECFDF5", color: "#059669", borderRadius: "6px", padding: "2px 8px", fontWeight: 600 }}>✓ Photo Uploaded</span>
                </div>
                <div style={{ borderRadius: "12px", overflow: "hidden", border: "1px solid #E5E7EB", boxShadow: "0 4px 12px rgba(0,0,0,0.08)", background: "#0F172A" }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={docPreview} alt="Submitted ID document"
                    style={{ width: "100%", height: "auto", maxHeight: "260px", objectFit: "contain", display: "block" }} />
                </div>
                <p style={{ fontSize: "11px", color: "#9CA3AF", marginTop: "8px", textAlign: "center" }}>
                  Review the document carefully before approving or rejecting.
                </p>
              </div>
            ) : (
              <div style={{ background: "#F8FAFC", borderRadius: "12px", padding: "20px", marginBottom: "20px", textAlign: "center", border: "2px dashed #E5E7EB" }}>
                <div style={{ fontSize: "40px", marginBottom: "8px" }}>🪪</div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "#374151" }}>{selected.doc} Document</div>
                <div style={{ fontSize: "12px", color: "#9CA3AF" }}>
                  {selected.isRealUser ? "No document uploaded yet — user has not submitted KYC" : "Document preview — demo entry"}
                </div>
              </div>
            )}

            {showReject ? (
              <div style={{ marginBottom: "16px" }}>
                <label style={{ fontSize: "13px", fontWeight: 600, color: "#374151", display: "block", marginBottom: "8px" }}>Rejection Reason</label>
                <textarea value={rejectReason} onChange={e => setRejectReason(e.target.value)}
                  placeholder="Enter the reason for rejection..."
                  style={{ width: "100%", padding: "10px 14px", border: "1.5px solid #E5E7EB", borderRadius: "10px", fontSize: "13px", minHeight: "80px", resize: "vertical", outline: "none", boxSizing: "border-box" }} />
                <div style={{ display: "flex", gap: "8px", marginTop: "10px" }}>
                  <button onClick={() => updateStatus(selected.id, "Rejected")}
                    style={{ flex: 1, padding: "10px", background: "#DC2626", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                    Confirm Rejection
                  </button>
                  <button onClick={() => setShowReject(false)}
                    style={{ flex: 1, padding: "10px", background: "#F3F4F6", color: "#6B7280", border: "none", borderRadius: "8px", fontSize: "13px", cursor: "pointer" }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                <button onClick={() => updateStatus(selected.id, "Approved")}
                  style={{ flex: 1, padding: "10px", background: "#059669", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  ✅ Approve
                </button>
                <button onClick={() => setShowReject(true)}
                  style={{ flex: 1, padding: "10px", background: "#DC2626", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  ❌ Reject
                </button>
                <button onClick={() => updateStatus(selected.id, "Resubmission Requested")}
                  style={{ flex: 1, padding: "10px", background: "#7C3AED", color: "#fff", border: "none", borderRadius: "8px", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}>
                  🔄 Request Resubmission
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
