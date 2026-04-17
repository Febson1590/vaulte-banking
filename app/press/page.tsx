"use client";
import MarketingShell, { InfoCard, BackToHome } from "@/components/MarketingShell";

export const dynamic = "force-static";

const coverage = [
  { outlet: "TechCrunch",     headline: "Vaulte raises Series B to expand borderless banking across Asia",     date: "Mar 2026" },
  { outlet: "Financial Times", headline: "Inside the neobank quietly signing up customers in 190 countries", date: "Feb 2026" },
  { outlet: "Forbes",          headline: "Vaulte&apos;s multi-currency play is giving incumbents a real problem", date: "Dec 2025" },
  { outlet: "The Verge",       headline: "This app wants to replace your bank — and your three-letter travel card", date: "Oct 2025" },
];

export default function PressPage() {
  return (
    <MarketingShell
      badge="Press"
      badgeColor="#34D399"
      title="For journalists and analysts"
      subtitle="Everything you need to cover Vaulte — company background, latest press releases, brand assets and a direct line to our press team."
    >
      <InfoCard title="About Vaulte">
        <p>Vaulte is a global digital banking platform headquartered in London, with engineering, product and operations teams distributed across Europe, Africa and South-East Asia. The company serves 500,000+ personal and business customers across 190+ countries with multi-currency accounts, instant transfers, virtual cards, and enterprise-grade security.</p>
      </InfoCard>

      <InfoCard title="Recent coverage">
        <ul style={{ padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14, listStyle: "none" }}>
          {coverage.map(c => (
            <li key={c.headline} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#60A5FA", background: "rgba(96,165,250,0.1)", border: "1px solid rgba(96,165,250,0.3)", padding: "3px 10px", borderRadius: 999 }}>{c.outlet}</span>
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>{c.date}</span>
              </div>
              <div style={{ fontSize: 15, color: "#fff", fontWeight: 600, lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: c.headline }} />
            </li>
          ))}
        </ul>
      </InfoCard>

      <InfoCard title="Press contact">
        <p>
          For media enquiries, please reach out to{" "}
          <a href="mailto:press@vaulteapp.com" style={{ color: "#60A5FA", textDecoration: "none", fontWeight: 600 }}>press@vaulteapp.com</a>.
          We aim to respond within one business day.
        </p>
      </InfoCard>

      <BackToHome />
    </MarketingShell>
  );
}
