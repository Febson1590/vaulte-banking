"use client";
import Link from "next/link";
import LanguageSelector from "@/components/LanguageSelector";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By creating an account or using any Vaulte services, you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree to these terms, please do not use our services.

We may update these terms from time to time. We will notify you of material changes via email or in-app notification. Continued use of our services after changes take effect constitutes acceptance of the updated terms.`,
  },
  {
    title: "2. Eligibility",
    content: `To use Vaulte services, you must:

• Be at least 18 years of age (or the age of majority in your jurisdiction)
• Have the legal capacity to enter into a binding agreement
• Not be a resident of a country subject to international sanctions
• Complete our identity verification (KYC) process successfully
• Not have had a previous Vaulte account terminated for violations

By registering, you confirm that all information you provide is accurate and complete.`,
  },
  {
    title: "3. Account Responsibilities",
    content: `You are responsible for:

• Maintaining the confidentiality of your account credentials
• All activity that occurs under your account
• Notifying us immediately at security@vaulte.com if you suspect unauthorized access
• Keeping your contact information up to date
• Complying with all applicable laws and regulations in your jurisdiction

You may not share your account credentials or allow another person to access your account. We are not liable for losses resulting from unauthorized use of your account due to your failure to keep credentials secure.`,
  },
  {
    title: "4. Permitted Use",
    content: `You agree to use Vaulte services only for lawful purposes. You must not:

• Use our services for money laundering, fraud, or financing illegal activities
• Attempt to circumvent our security measures or fraud detection systems
• Engage in transactions that violate sanctions laws or regulations
• Use automated tools to access our platform without authorization
• Impersonate any person or entity
• Transmit any malware, viruses, or harmful code

Violation of these restrictions may result in immediate account suspension and reporting to relevant authorities.`,
  },
  {
    title: "5. Fees and Charges",
    content: `Our current fee schedule is available on our website and within the app. Key points:

• Transfers between Vaulte accounts: Free
• International bank transfers: Fees vary by destination (shown before you confirm)
• Currency exchange: We use the real exchange rate with a small margin disclosed at time of transaction
• ATM withdrawals: Free up to the monthly limit, then a small fee applies
• Card replacement: Fee applies for lost/stolen cards (first replacement free per year)

We will notify you at least 30 days before implementing new fees or increasing existing ones.`,
  },
  {
    title: "6. Transaction Limits",
    content: `Vaulte applies transaction limits for security and regulatory compliance:

• Standard verified accounts: $10,000/day transfer limit
• Enhanced verified accounts: Higher limits available upon request
• Newly registered accounts: Lower limits apply during the initial verification period

We reserve the right to adjust limits based on account activity, risk assessment, and regulatory requirements. You may request a limit increase by contacting our support team.`,
  },
  {
    title: "7. Termination",
    content: `Either party may terminate the account relationship at any time:

• You may close your account by contacting support or through account settings (subject to no pending transactions)
• We may suspend or terminate your account immediately if you violate these terms, engage in fraudulent activity, or if required by law

Upon termination, you will be given the opportunity to withdraw your remaining balance. Funds not claimed within 6 months of termination may be subject to applicable unclaimed property laws.`,
  },
  {
    title: "8. Limitation of Liability",
    content: `To the maximum extent permitted by law, Vaulte shall not be liable for:

• Indirect, incidental, or consequential damages
• Loss of profits, data, or goodwill
• Unauthorized access to your account resulting from your failure to secure credentials
• Service interruptions due to maintenance or circumstances beyond our control
• Third-party actions or failures

Our total liability to you for any claim shall not exceed the amount of fees you paid to us in the 12 months preceding the claim.`,
  },
  {
    title: "9. Governing Law",
    content: `These Terms are governed by the laws of the State of California, United States, without regard to conflict of law principles. Any disputes shall be resolved through binding arbitration in San Francisco, California, except where prohibited by applicable law.

If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in full force and effect.`,
  },
  {
    title: "10. Contact",
    content: `For questions about these Terms of Service, please contact us:

Email: legal@vaulte.com
Address: 123 Finance Street, San Francisco, CA 94103
Phone: +1 (800) 123-4567`,
  },
];

export default function TermsPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter',sans-serif" }}>

      {/* Navbar */}
      <nav style={{ background: "#0F172A", padding: "0 5%", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <img src="/assets/logo-vaulte.png" alt="Vaulte" style={{ height: 120, objectFit: "contain", mixBlendMode: "screen" }} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <LanguageSelector variant="dark" />
          <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.8)", textDecoration: "none", padding: "8px 16px", borderRadius: 8 }}>Login</Link>
          <Link href="/register" style={{ fontSize: 14, fontWeight: 700, color: "#fff", textDecoration: "none", padding: "9px 20px", borderRadius: 8, background: "#1A73E8" }}>Open Account</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#0F172A 0%,#1a3a7a 100%)", padding: "48px 5%", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 900, color: "#fff", marginBottom: 10, letterSpacing: "-1px" }}>Terms of Service</h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)" }}>Last updated: March 10, 2026</p>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 5% 64px" }}>

        {/* Intro */}
        <div style={{ background: "#FFF7ED", borderRadius: 12, padding: "20px 24px", marginBottom: 36, border: "1px solid #FED7AA" }}>
          <p style={{ fontSize: 15, color: "#92400e", lineHeight: 1.8 }}>
            Please read these Terms of Service carefully before using Vaulte. These terms constitute a legally binding agreement between you and Vaulte Global Digital Banking.
          </p>
        </div>

        {/* Table of contents */}
        <div style={{ background: "#fff", borderRadius: 14, padding: "24px 28px", marginBottom: 32, border: "1px solid #E5E7EB" }}>
          <p style={{ fontSize: 15, fontWeight: 700, color: "#0F172A", marginBottom: 14 }}>Table of Contents</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px" }}>
            {sections.map(s => (
              <p key={s.title} style={{ fontSize: 13.5, color: "#1A73E8", cursor: "pointer", lineHeight: 1.6 }}>{s.title}</p>
            ))}
          </div>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {sections.map(section => (
            <div key={section.title} style={{ background: "#fff", borderRadius: 14, padding: "28px 32px", border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0F172A", marginBottom: 14, letterSpacing: "-0.3px" }}>{section.title}</h2>
              <p style={{ fontSize: 14.5, color: "#4B5563", lineHeight: 1.9, whiteSpace: "pre-line" }}>{section.content}</p>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 16 }}>Questions about our Terms?</p>
          <Link href="/contact" style={{ display: "inline-block", padding: "12px 28px", background: "#1A73E8", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 4px 14px rgba(26,115,232,0.35)" }}>
            Contact Legal Team
          </Link>
        </div>
      </div>
    </div>
  );
}
