// ─────────────────────────────────────────────────────────────────────────────
//  Vaulte — Centralized KYC State Utility
//
//  ALL KYC-based UI decisions across the dashboard must flow through these
//  helpers.  Never check kycStatus === "verified" / "pending" / etc. directly
//  in component files; use NormalizedKyc + KYC_UI instead so that:
//    · Adding new backend states only requires one file change
//    · Every component shows the same labels and copy for the same state
//    · There is no ambiguity between "unverified" (never submitted) and
//      "rejected" (submitted but declined)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The four canonical KYC states used across all UI components.
 * Backend values are mapped to these via normalizeKyc().
 */
export type NormalizedKyc = "not_started" | "pending" | "approved" | "rejected";

/**
 * Normalise any raw kycStatus string from the backend/localStorage into one of
 * the four canonical states.  This is the ONLY place that knows about the raw
 * string values; everything else works with NormalizedKyc.
 *
 *  "verified"  → "approved"
 *  "pending"   → "pending"
 *  "rejected"  → "rejected"
 *  anything else (null, undefined, "unverified", …) → "not_started"
 */
export function normalizeKyc(raw: string | null | undefined): NormalizedKyc {
  switch (raw) {
    case "verified":  return "approved";
    case "pending":   return "pending";
    case "rejected":  return "rejected";
    default:          return "not_started";
  }
}

// ─── Per-state UI constants ───────────────────────────────────────────────────

export const KYC_UI = {
  not_started: {
    // Status dot
    dotColor:       "#F59E0B",
    dotRing:        "rgba(245,158,11,0.18)",
    // Welcome banner chip
    chipLabel:      "Unverified Account",
    // Welcome banner subtitle
    subtitle:       "Complete verification to start banking.",
    // Top alert banner
    bannerTitle:    "Identity Verification Required",
    bannerBody:     "Complete your KYC verification to unlock transfers, cards, and full account access.",
    bannerBg:       "linear-gradient(135deg,#FEF2F2,#FEE2E2)",
    bannerBorder:   "#FECACA",
    bannerIconBg:   "#FECACA",
    bannerIcon:     "🔒",
    bannerTitleC:   "#991B1B",
    bannerBodyC:    "#B91C1C",
    ctaLabel:       "Verify Now →",
    ctaHref:        "/dashboard/kyc" as string,
    ctaBg:          "#DC2626",
    ctaBgHover:     "#B91C1C",
    // Balance card empty state
    balanceBg:      "#FFFBEB",
    balanceBorder:  "#FDE68A",
    balanceIcon:    "🏦",
    balanceTitleC:  "#92400E",
    balanceBodyC:   "#B45309",
    balanceTitle:   "Start by verifying your identity",
    balanceBody:    "Complete KYC to unlock deposits, transfers, and the full Vaulte experience.",
    balanceCtaLabel:"Complete KYC →",
    balanceCtaHref: "/dashboard/kyc" as string,
    balanceCtaBg:   "#F59E0B",
    balanceCtaHv:   "#D97706",
    // Virtual card section
    cardMsg:        "Complete identity verification to request your Vaulte virtual card.",
    cardCtaLabel:   "Verify to Request Card",
    cardCtaHref:    "/dashboard/kyc" as string,
    // Sidebar balance card
    sidebarNote:    "Complete KYC to activate your account",
    // Account Status widget
    statusLabel:    "Not Verified",
    statusColor:    "#EF4444",
    statusBg:       "#FEF2F2",
    statusDot:      "#EF4444",
    statusDotRing:  "rgba(239,68,68,0.2)",
    // Settings badge
    settingsBadge:  "◎ Not Verified",
    settingsBadgeC: "#6B7280",
    settingsBadgeBg:"#F3F4F6",
    settingsBadgeBr:"#E5E7EB",
  },
  pending: {
    dotColor:       "#F59E0B",
    dotRing:        "rgba(245,158,11,0.18)",
    chipLabel:      "Verification Pending",
    subtitle:       "Your verification is under review.",
    bannerTitle:    "Verification Under Review",
    bannerBody:     "Your documents are being reviewed. This usually takes 1–2 business days.",
    bannerBg:       "linear-gradient(135deg,#FFFBEB,#FEF3C7)",
    bannerBorder:   "#FDE68A",
    bannerIconBg:   "#FDE68A",
    bannerIcon:     "⏳",
    bannerTitleC:   "#92400E",
    bannerBodyC:    "#B45309",
    ctaLabel:       null,      // pending users cannot re-submit
    ctaHref:        null,
    ctaBg:          "transparent",
    ctaBgHover:     "transparent",
    balanceBg:      "#FFFBEB",
    balanceBorder:  "#FDE68A",
    balanceIcon:    "⏳",
    balanceTitleC:  "#92400E",
    balanceBodyC:   "#B45309",
    balanceTitle:   "Verification under review",
    balanceBody:    "Your documents are being reviewed. Your balance will be unlocked once approved.",
    balanceCtaLabel:null,       // no CTA while pending
    balanceCtaHref: null,
    balanceCtaBg:   "transparent",
    balanceCtaHv:   "transparent",
    cardMsg:        "Your KYC is under review. Your card will be issued once approved.",
    cardCtaLabel:   null,
    cardCtaHref:    null,
    sidebarNote:    "Verification under review…",
    statusLabel:    "Pending Review",
    statusColor:    "#D97706",
    statusBg:       "#FFFBEB",
    statusDot:      "#F59E0B",
    statusDotRing:  "rgba(245,158,11,0.2)",
    settingsBadge:  "⏳ Verification Pending",
    settingsBadgeC: "#D97706",
    settingsBadgeBg:"#FFFBEB",
    settingsBadgeBr:"#FDE68A",
  },
  approved: {
    dotColor:       "#22C55E",
    dotRing:        "rgba(34,197,94,0.18)",
    chipLabel:      "Account Active",
    subtitle:       "Here's an overview of your account.",
    bannerTitle:    null,
    bannerBody:     null,
    bannerBg:       "transparent",
    bannerBorder:   "transparent",
    bannerIconBg:   "transparent",
    bannerIcon:     "",
    bannerTitleC:   "transparent",
    bannerBodyC:    "transparent",
    ctaLabel:       null,
    ctaHref:        null,
    ctaBg:          "transparent",
    ctaBgHover:     "transparent",
    balanceBg:      "transparent",
    balanceBorder:  "transparent",
    balanceIcon:    "",
    balanceTitleC:  "transparent",
    balanceBodyC:   "transparent",
    balanceTitle:   null,
    balanceBody:    null,
    balanceCtaLabel:null,
    balanceCtaHref: null,
    balanceCtaBg:   "transparent",
    balanceCtaHv:   "transparent",
    cardMsg:        "Request your Vaulte virtual card to start making payments.",
    cardCtaLabel:   "Request Card",
    cardCtaHref:    "/dashboard/cards" as string,
    sidebarNote:    null,
    statusLabel:    "Verified",
    statusColor:    "#059669",
    statusBg:       "#ECFDF5",
    statusDot:      "#22C55E",
    statusDotRing:  "rgba(34,197,94,0.2)",
    settingsBadge:  "✓ ID Verified",
    settingsBadgeC: "#059669",
    settingsBadgeBg:"#ECFDF5",
    settingsBadgeBr:"#A7F3D0",
  },
  rejected: {
    dotColor:       "#EF4444",
    dotRing:        "rgba(239,68,68,0.18)",
    chipLabel:      "Verification Rejected",
    subtitle:       "Your verification was rejected. Please resubmit.",
    bannerTitle:    "Verification Rejected",
    bannerBody:     "Your verification was rejected. Please resubmit your documents to continue.",
    bannerBg:       "linear-gradient(135deg,#FEF2F2,#FEE2E2)",
    bannerBorder:   "#FECACA",
    bannerIconBg:   "#FECACA",
    bannerIcon:     "❌",
    bannerTitleC:   "#991B1B",
    bannerBodyC:    "#B91C1C",
    ctaLabel:       "Resubmit →",
    ctaHref:        "/dashboard/kyc" as string,
    ctaBg:          "#B91C1C",
    ctaBgHover:     "#991B1B",
    balanceBg:      "#FEF2F2",
    balanceBorder:  "#FECACA",
    balanceIcon:    "❌",
    balanceTitleC:  "#991B1B",
    balanceBodyC:   "#B91C1C",
    balanceTitle:   "Verification rejected — action required",
    balanceBody:    "Your verification was rejected. Please resubmit your documents to unlock your account.",
    balanceCtaLabel:"Resubmit Documents →",
    balanceCtaHref: "/dashboard/kyc" as string,
    balanceCtaBg:   "#DC2626",
    balanceCtaHv:   "#B91C1C",
    cardMsg:        "Your verification was rejected. Resubmit to unlock card issuance.",
    cardCtaLabel:   "Resubmit →",
    cardCtaHref:    "/dashboard/kyc" as string,
    sidebarNote:    "Verification rejected — resubmit",
    statusLabel:    "Rejected",
    statusColor:    "#DC2626",
    statusBg:       "#FEF2F2",
    statusDot:      "#EF4444",
    statusDotRing:  "rgba(239,68,68,0.2)",
    settingsBadge:  "✗ Verification Rejected",
    settingsBadgeC: "#DC2626",
    settingsBadgeBg:"#FEF2F2",
    settingsBadgeBr:"#FECACA",
  },
} as const;
