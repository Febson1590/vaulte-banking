"use client";
import MarketingShell, { InfoCard, BackToHome } from "@/components/MarketingShell";

export const dynamic = "force-static";

const stats = [
  { value: "500K+", label: "Customers worldwide" },
  { value: "190+",  label: "Countries supported" },
  { value: "$2B+",  label: "Moved through Vaulte" },
  { value: "24/7",  label: "Support coverage"    },
];

export default function AboutPage() {
  return (
    <MarketingShell
      badge="Our Story"
      badgeColor="#60A5FA"
      title="Banking that belongs to everyone"
      subtitle="Vaulte is on a mission to make global banking as simple as sending a text — fast, fair, and available to anyone with an internet connection."
    >
      <InfoCard title="Why we exist">
        <p>Traditional banks still treat international money like it&apos;s 1985 — slow transfers, awkward fees, and different rules depending on the passport you hold. We started Vaulte because moving money across borders shouldn&apos;t require paperwork, a branch visit, or a phone call at 3am.</p>
        <p style={{ marginTop: 14 }}>Today Vaulte powers borderless accounts, multi-currency balances, virtual cards and real-time transfers for people and teams in more than 190 countries.</p>
      </InfoCard>

      <InfoCard title="What we believe">
        <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 10, margin: 0 }}>
          <li><strong style={{ color: "#fff" }}>Access over gatekeeping.</strong> A good financial product shouldn&apos;t care where you were born.</li>
          <li><strong style={{ color: "#fff" }}>Honest pricing.</strong> Real exchange rates, no surprise fees hidden on page 12 of a PDF.</li>
          <li><strong style={{ color: "#fff" }}>Security by default.</strong> Bank-grade encryption, 2FA, and 24/7 fraud monitoring from day one.</li>
          <li><strong style={{ color: "#fff" }}>Speed that feels native.</strong> Money should move at the pace of the internet, not the pace of legacy rails.</li>
        </ul>
      </InfoCard>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 14, marginTop: 10 }}>
        {stats.map(s => (
          <div key={s.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "22px 20px" }}>
            <div style={{ fontSize: 24, fontWeight: 900, color: "#60A5FA", letterSpacing: "-0.02em" }}>{s.value}</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginTop: 4 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <BackToHome />
    </MarketingShell>
  );
}
