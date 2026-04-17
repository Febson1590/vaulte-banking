"use client";
import Link from "next/link";

const sections = [
  {
    title: "1. Information We Collect",
    content: `We collect information you provide directly to us, such as when you create an account, make a transaction, or contact us for support. This includes:

• Personal identification information (name, email address, phone number, date of birth)
• Government-issued ID and proof of address for identity verification
• Financial information (bank account details, transaction history)
• Device and usage information (IP address, browser type, pages visited)
• Communications you send us (support tickets, feedback)`,
  },
  {
    title: "2. How We Use Your Information",
    content: `We use the information we collect to:

• Provide, maintain, and improve our banking services
• Process transactions and send related information
• Verify your identity and prevent fraud
• Send you technical notices, updates, and support messages
• Comply with legal obligations and regulatory requirements
• Communicate with you about products, services, and promotions (you may opt out at any time)`,
  },
  {
    title: "3. Sharing Your Information",
    content: `We do not sell, trade, or rent your personal information to third parties. We may share your information with:

• Banking partners and payment processors to facilitate transactions
• Identity verification services to comply with KYC/AML regulations
• Law enforcement or government authorities when required by law
• Service providers who assist in our operations (under strict confidentiality agreements)
• Other parties with your explicit consent`,
  },
  {
    title: "4. Data Security",
    content: `We implement industry-standard security measures to protect your personal information:

• AES-256 encryption for all data in transit and at rest
• Two-factor authentication for account access
• Regular security audits and penetration testing
• 24/7 fraud monitoring and anomaly detection
• Strict access controls for employees handling customer data

Despite these measures, no method of transmission over the internet is 100% secure. We encourage you to use strong, unique passwords and enable two-factor authentication.`,
  },
  {
    title: "5. Data Retention",
    content: `We retain your personal information for as long as your account is active or as needed to provide you services. We may also retain and use your information to comply with legal obligations, resolve disputes, and enforce our agreements.

When you close your account, we will delete or anonymize your personal data within 90 days, except where retention is required by law (typically 5–7 years for financial records).`,
  },
  {
    title: "6. Your Rights",
    content: `Depending on your location, you may have the following rights regarding your personal data:

• Access: Request a copy of the personal data we hold about you
• Correction: Request correction of inaccurate or incomplete data
• Deletion: Request deletion of your personal data (subject to legal obligations)
• Portability: Receive your data in a structured, machine-readable format
• Objection: Object to certain types of data processing
• Withdrawal of consent: Withdraw consent at any time where processing is based on consent

To exercise any of these rights, please contact us at privacy@vaulte.com.`,
  },
  {
    title: "7. Cookies",
    content: `We use cookies and similar tracking technologies to track activity on our platform and improve your experience. You can control cookies through your browser settings. Disabling cookies may affect some functionality of the platform.

Types of cookies we use:
• Essential cookies: Required for the platform to function
• Analytics cookies: Help us understand how users interact with our platform
• Preference cookies: Remember your settings and preferences`,
  },
  {
    title: "8. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes by email or through a prominent notice on our platform. The date of the most recent update is displayed at the top of this page. Your continued use of our services after changes are posted constitutes your acceptance of the updated policy.`,
  },
  {
    title: "9. Contact Us",
    content: `If you have questions or concerns about this Privacy Policy or our data practices, please contact our Data Protection Officer:

Email: privacy@vaulte.com
Address: 123 Finance Street, San Francisco, CA 94103
Phone: +1 (800) 123-4567`,
  },
];

export default function PrivacyPolicyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC", fontFamily: "'Inter',sans-serif" }}>

      {/* Navbar */}
      <nav style={{ background: "#0F172A", padding: "0 5%", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <img src="/assets/logo-vaulte.png" alt="Vaulte" style={{ height: 120, objectFit: "contain", mixBlendMode: "screen" }} />
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Link href="/login" style={{ fontSize: 14, fontWeight: 600, color: "rgba(255,255,255,0.8)", textDecoration: "none", padding: "8px 16px", borderRadius: 8 }}>Login</Link>
          <Link href="/register" style={{ fontSize: 14, fontWeight: 700, color: "#fff", textDecoration: "none", padding: "9px 20px", borderRadius: 8, background: "#1A73E8" }}>Open Account</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "linear-gradient(135deg,#0F172A 0%,#1a3a7a 100%)", padding: "48px 5%", textAlign: "center" }}>
        <h1 style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 900, color: "#fff", marginBottom: 10, letterSpacing: "-1px" }}>Privacy Policy</h1>
        <p style={{ fontSize: 15, color: "rgba(255,255,255,0.55)" }}>Last updated: March 10, 2026</p>
      </div>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 5% 64px" }}>

        {/* Intro */}
        <div style={{ background: "#EFF6FF", borderRadius: 12, padding: "20px 24px", marginBottom: 36, border: "1px solid #BFDBFE" }}>
          <p style={{ fontSize: 15, color: "#1e40af", lineHeight: 1.8 }}>
            At Vaulte, your privacy is our priority. This policy explains how we collect, use, and protect your personal information when you use our global digital banking services. Please read it carefully.
          </p>
        </div>

        {/* Sections */}
        <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
          {sections.map(section => (
            <div key={section.title} style={{ background: "#fff", borderRadius: 14, padding: "28px 32px", border: "1px solid #E5E7EB", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, color: "#0F172A", marginBottom: 16, letterSpacing: "-0.3px" }}>{section.title}</h2>
              <p style={{ fontSize: 14.5, color: "#4B5563", lineHeight: 1.9, whiteSpace: "pre-line" }}>{section.content}</p>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div style={{ marginTop: 40, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#9CA3AF", marginBottom: 16 }}>Have questions about your privacy?</p>
          <Link href="/contact" style={{ display: "inline-block", padding: "12px 28px", background: "#1A73E8", color: "#fff", borderRadius: 10, fontWeight: 700, fontSize: 15, textDecoration: "none", boxShadow: "0 4px 14px rgba(26,115,232,0.35)" }}>
            Contact Our Privacy Team
          </Link>
        </div>
      </div>
    </div>
  );
}
