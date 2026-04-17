"use client";
import MarketingShell, { BackToHome } from "@/components/MarketingShell";

export const dynamic = "force-static";

const posts = [
  {
    tag:     "Product",
    date:    "Apr 12, 2026",
    title:   "Why we rebuilt multi-currency balances from scratch",
    excerpt: "A look at the engineering tradeoffs behind sub-second FX conversions and what it means for your transfer fees.",
    minutes: 6,
  },
  {
    tag:     "Security",
    date:    "Mar 28, 2026",
    title:   "How we scored our SOC 2 Type II in 90 days",
    excerpt: "The controls, tooling and internal rituals that let a small team ship enterprise-grade compliance without losing momentum.",
    minutes: 9,
  },
  {
    tag:     "Company",
    date:    "Mar 04, 2026",
    title:   "Going live in 40 new markets this year",
    excerpt: "We&apos;re doubling our footprint — here&apos;s where we&apos;re going, why it matters, and what it means for your Vaulte account.",
    minutes: 4,
  },
  {
    tag:     "Engineering",
    date:    "Feb 17, 2026",
    title:   "The anatomy of a Vaulte transfer",
    excerpt: "From the moment you tap send to the moment the recipient&apos;s balance ticks up — a deep dive into our payment rails.",
    minutes: 12,
  },
];

const tagColor: Record<string, string> = {
  Product:     "#60A5FA",
  Security:    "#34D399",
  Company:     "#A78BFA",
  Engineering: "#FBBF24",
};

export default function BlogPage() {
  return (
    <MarketingShell
      badge="Blog"
      badgeColor="#60A5FA"
      title="Notes from the Vaulte team"
      subtitle="Product updates, engineering deep dives, and stories from our customers across the globe."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {posts.map(p => (
          <article key={p.title} style={{
            background:    "rgba(255,255,255,0.03)",
            border:        "1px solid rgba(255,255,255,0.07)",
            borderRadius:  20,
            padding:       "28px 28px",
            transition:    "border-color 0.2s, background 0.2s",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12, flexWrap: "wrap" }}>
              <span style={{
                fontSize:      11,
                fontWeight:    700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color:         tagColor[p.tag] || "#60A5FA",
                background:    `${tagColor[p.tag] || "#60A5FA"}1a`,
                border:        `1px solid ${tagColor[p.tag] || "#60A5FA"}40`,
                padding:       "4px 12px",
                borderRadius:  999,
              }}>{p.tag}</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>{p.date}</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>· {p.minutes} min read</span>
            </div>
            <h3 style={{ fontSize: 20, fontWeight: 800, color: "#fff", letterSpacing: "-0.3px", marginBottom: 10, lineHeight: 1.3 }}>{p.title}</h3>
            <p style={{ fontSize: 14.5, color: "rgba(255,255,255,0.6)", lineHeight: 1.7, margin: 0 }}>{p.excerpt}</p>
          </article>
        ))}
      </div>

      <p style={{ marginTop: 32, textAlign: "center", fontSize: 13, color: "rgba(255,255,255,0.4)" }}>
        New posts every couple of weeks. Follow us on social for updates.
      </p>

      <BackToHome />
    </MarketingShell>
  );
}
