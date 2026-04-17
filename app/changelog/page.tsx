"use client";
import MarketingShell, { BackToHome } from "@/components/MarketingShell";

export const dynamic = "force-static";

type Entry = {
  version: string;
  date:    string;
  tag:     "Feature" | "Improvement" | "Fix";
  title:   string;
  items:   string[];
};

const entries: Entry[] = [
  {
    version: "v4.7",
    date:    "Apr 14, 2026",
    tag:     "Feature",
    title:   "Premium landing & redesigned auth",
    items: [
      "Brand-new marketing pages with a deep-navy / electric-blue aesthetic.",
      "Login and register flows now share a single, responsive design system.",
      "New global language switcher with search across 100+ languages.",
    ],
  },
  {
    version: "v4.6",
    date:    "Mar 28, 2026",
    tag:     "Improvement",
    title:   "Faster FX, better rates",
    items: [
      "Average FX settlement dropped from 7s to 1.4s on mainline pairs.",
      "Improved rate display to show interbank + Vaulte margin side-by-side.",
      "Push notifications for large rate swings on currencies you hold.",
    ],
  },
  {
    version: "v4.5",
    date:    "Feb 11, 2026",
    tag:     "Feature",
    title:   "Virtual cards for teams",
    items: [
      "Issue single-use and recurring virtual cards for every team member.",
      "Per-card spend limits, merchant categories, and budget rules.",
      "Export card activity to Xero and QuickBooks automatically.",
    ],
  },
  {
    version: "v4.4",
    date:    "Jan 22, 2026",
    tag:     "Fix",
    title:   "Stability + security patches",
    items: [
      "Fixed an edge case where 2FA tokens expired 30s early on Android 14.",
      "Session handling hardened against replay attacks.",
      "Minor layout fixes on the transaction history page.",
    ],
  },
];

const tagColor: Record<Entry["tag"], string> = {
  Feature:     "#60A5FA",
  Improvement: "#A78BFA",
  Fix:         "#34D399",
};

export default function ChangelogPage() {
  return (
    <MarketingShell
      badge="Changelog"
      badgeColor="#A78BFA"
      title="What's new at Vaulte"
      subtitle="A running log of the features we've shipped, the rough edges we've smoothed, and the bugs we've squashed."
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
        {entries.map(e => (
          <article key={e.version} style={{
            background:    "rgba(255,255,255,0.03)",
            border:        "1px solid rgba(255,255,255,0.08)",
            borderRadius:  20,
            padding:       "28px 28px",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14, flexWrap: "wrap" }}>
              <span style={{
                fontSize:      11,
                fontWeight:    700,
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                color:         tagColor[e.tag],
                background:    `${tagColor[e.tag]}1a`,
                border:        `1px solid ${tagColor[e.tag]}40`,
                padding:       "4px 12px",
                borderRadius:  999,
              }}>{e.tag}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#fff", letterSpacing: "0.02em" }}>{e.version}</span>
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>· {e.date}</span>
            </div>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", letterSpacing: "-0.2px", marginBottom: 12, lineHeight: 1.3 }}>{e.title}</h3>
            <ul style={{ padding: 0, margin: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
              {e.items.map(it => (
                <li key={it} style={{ display: "flex", gap: 10, fontSize: 14, color: "rgba(255,255,255,0.65)", lineHeight: 1.6 }}>
                  <span aria-hidden="true" style={{ color: tagColor[e.tag], lineHeight: 1.4 }}>•</span>
                  <span>{it}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <BackToHome />
    </MarketingShell>
  );
}
