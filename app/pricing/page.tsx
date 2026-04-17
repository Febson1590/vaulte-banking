"use client";
import Link from "next/link";
import MarketingShell, { BackToHome } from "@/components/MarketingShell";

export const dynamic = "force-static";

type Plan = {
  name:        string;
  tag?:        string;
  price:       string;
  priceNote:   string;
  description: string;
  features:    string[];
  cta:         { label: string; href: string };
  highlighted?: boolean;
};

const plans: Plan[] = [
  {
    name:        "Free",
    price:       "£0",
    priceNote:   "/month, forever",
    description: "Everything an individual needs to get started with borderless banking.",
    features: [
      "Multi-currency account (GBP, EUR, USD)",
      "Virtual debit card",
      "Free transfers between Vaulte users",
      "Real exchange rates on FX",
      "Standard customer support",
    ],
    cta: { label: "Open free account", href: "/register" },
  },
  {
    name:        "Plus",
    tag:         "Most popular",
    price:       "£4.99",
    priceNote:   "/month",
    description: "For frequent travellers and cross-border freelancers.",
    features: [
      "Everything in Free",
      "50+ currencies with zero FX markup on the first £3,000/mo",
      "Unlimited virtual cards + metal physical card",
      "Priority customer support",
      "Airport lounge passes (2 / year)",
    ],
    cta: { label: "Start with Plus", href: "/register" },
    highlighted: true,
  },
  {
    name:        "Business",
    price:       "£14.99",
    priceNote:   "/month per seat",
    description: "Multi-user business accounts with team controls.",
    features: [
      "Everything in Plus",
      "Up to 20 team members",
      "Spend limits + approval workflows",
      "Accounting integrations (Xero, QuickBooks)",
      "Dedicated account manager",
    ],
    cta: { label: "Talk to sales", href: "/contact" },
  },
];

export default function PricingPage() {
  return (
    <MarketingShell
      badge="Pricing"
      badgeColor="#60A5FA"
      title="Simple, honest pricing"
      subtitle="Start free forever. Upgrade only when you need more — and never pay for what you don't use."
    >
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0,1fr))", gap: 18 }} className="pricing-grid">
        {plans.map(plan => (
          <div key={plan.name} style={{
            background:    plan.highlighted
                             ? "linear-gradient(165deg, rgba(37,99,235,0.12), rgba(167,139,250,0.08))"
                             : "rgba(255,255,255,0.03)",
            border:        plan.highlighted
                             ? "1px solid rgba(96,165,250,0.35)"
                             : "1px solid rgba(255,255,255,0.08)",
            borderRadius:  22,
            padding:       "32px 26px",
            position:      "relative",
            display:       "flex",
            flexDirection: "column",
          }}>
            {plan.tag && (
              <span style={{
                position:      "absolute",
                top:           -12,
                right:         22,
                fontSize:      11,
                fontWeight:    700,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color:         "#fff",
                background:    "linear-gradient(135deg,#2563EB,#1D4ED8)",
                padding:       "5px 12px",
                borderRadius:  999,
                boxShadow:     "0 6px 18px rgba(37,99,235,0.35)",
              }}>{plan.tag}</span>
            )}

            <div style={{ fontSize: 14, fontWeight: 700, color: plan.highlighted ? "#93C5FD" : "rgba(255,255,255,0.7)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>{plan.name}</div>
            <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 8 }}>
              <span style={{ fontSize: 36, fontWeight: 900, color: "#fff", letterSpacing: "-0.02em" }}>{plan.price}</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>{plan.priceNote}</span>
            </div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, marginBottom: 22 }}>{plan.description}</p>

            <ul style={{ flex: 1, padding: 0, margin: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 10, marginBottom: 22 }}>
              {plan.features.map(f => (
                <li key={f} style={{ display: "flex", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.72)", lineHeight: 1.55 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Link href={plan.cta.href} style={{
              display:        "inline-flex",
              alignItems:     "center",
              justifyContent: "center",
              gap:            8,
              padding:        "13px 20px",
              borderRadius:   12,
              background:     plan.highlighted
                                ? "linear-gradient(135deg,#2563EB,#1D4ED8)"
                                : "rgba(255,255,255,0.06)",
              border:         plan.highlighted
                                ? "none"
                                : "1px solid rgba(255,255,255,0.15)",
              color:          "#fff",
              fontSize:       14,
              fontWeight:     700,
              textDecoration: "none",
              boxShadow:      plan.highlighted ? "0 4px 20px rgba(37,99,235,0.4)" : "none",
              letterSpacing:  "0.01em",
            }}>{plan.cta.label}</Link>
          </div>
        ))}
      </div>

      <BackToHome />

      <style>{`
        @media (max-width: 960px) { .pricing-grid { grid-template-columns: 1fr !important; } }
      `}</style>
    </MarketingShell>
  );
}
