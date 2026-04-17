"use client";
import Link from "next/link";
import MarketingShell, { InfoCard, BackToHome } from "@/components/MarketingShell";

export const dynamic = "force-static";

const perks = [
  { icon: "🌍", title: "Work from anywhere",  desc: "Fully remote team across 20+ countries. Hire where the talent is, not where the office is." },
  { icon: "💰", title: "Competitive pay",     desc: "Top-of-market salary + meaningful equity, adjusted fairly for every market we hire in." },
  { icon: "🩺", title: "Health & wellbeing",  desc: "Comprehensive health cover for you and your family, plus a monthly wellness stipend." },
  { icon: "🏖️", title: "Real time off",      desc: "Minimum 25 paid days off per year. We encourage — and track — that you actually take them." },
  { icon: "📚", title: "Grow on our dime",    desc: "Annual learning budget for courses, conferences, books and certifications." },
  { icon: "💻", title: "Best-in-class kit",   desc: "A MacBook and a home-office stipend so your setup works as hard as you do." },
];

export default function CareersPage() {
  return (
    <MarketingShell
      badge="Join Us"
      badgeColor="#A78BFA"
      title="Build the future of global banking"
      subtitle="We&apos;re a distributed team on a simple mission: make borderless banking the default. If that sounds like the kind of problem you want to work on, we&apos;d love to meet you."
    >
      <InfoCard title="How we work">
        <p>Vaulte is remote-first by design. We hire senior people, give them context, and get out of their way. We optimise for written clarity over endless meetings, ship small and often, and treat trust as a feature we have to earn every day — with customers and with each other.</p>
      </InfoCard>

      <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", marginBottom: 18, marginTop: 8 }}>Why you&apos;ll enjoy it</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0,1fr))", gap: 14, marginBottom: 24 }}>
        {perks.map(p => (
          <div key={p.title} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 16, padding: "22px 20px" }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{p.icon}</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{p.title}</div>
            <div style={{ fontSize: 13.5, color: "rgba(255,255,255,0.55)", lineHeight: 1.65 }}>{p.desc}</div>
          </div>
        ))}
      </div>

      <InfoCard title="Open roles">
        <p style={{ marginBottom: 16 }}>We don&apos;t have open listings right now, but we&apos;re always interested in hearing from talented engineers, designers, compliance specialists and customer-success folk.</p>
        <Link href="/contact" style={{
          display:        "inline-flex",
          alignItems:     "center",
          gap:            8,
          padding:        "11px 22px",
          borderRadius:   10,
          background:     "rgba(96,165,250,0.1)",
          border:         "1px solid rgba(96,165,250,0.3)",
          color:          "#60A5FA",
          fontSize:       14,
          fontWeight:     600,
          textDecoration: "none",
        }}>
          Introduce yourself
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </Link>
      </InfoCard>

      <BackToHome />
    </MarketingShell>
  );
}
