// ─────────────────────────────────────────────────────────────
//  Vaulte — U.S. Bank Transfer Data & Helpers
//  Contains: US bank directory (routing → bank name),
//            fee structures, verification simulation,
//            routing number validation
// ─────────────────────────────────────────────────────────────

// ─── Bank Directory ─────────────────────────────────────────
export interface BankEntry {
  routingNumber: string;
  name: string;
  shortName: string;
  city: string;
  state: string;
  logo?: string; // emoji fallback
}

export const US_BANKS: BankEntry[] = [
  // ── Major National Banks ──────────────────────────────────
  { routingNumber: "021000021", name: "JPMorgan Chase Bank",         shortName: "Chase",          city: "Columbus",      state: "OH", logo: "🏦" },
  { routingNumber: "026009593", name: "Bank of America",             shortName: "BofA",           city: "Charlotte",     state: "NC", logo: "🏦" },
  { routingNumber: "121000248", name: "Wells Fargo Bank",            shortName: "Wells Fargo",    city: "San Francisco", state: "CA", logo: "🏦" },
  { routingNumber: "021001088", name: "Citibank",                    shortName: "Citi",           city: "Sioux Falls",   state: "SD", logo: "🏦" },
  { routingNumber: "091000019", name: "U.S. Bank",                   shortName: "US Bank",        city: "Minneapolis",   state: "MN", logo: "🏦" },
  { routingNumber: "022000020", name: "HSBC Bank USA",               shortName: "HSBC",           city: "Buffalo",       state: "NY", logo: "🏦" },
  { routingNumber: "021302567", name: "TD Bank",                     shortName: "TD Bank",        city: "Wilmington",    state: "DE", logo: "🏦" },
  { routingNumber: "065000090", name: "Capital One Bank",            shortName: "Capital One",    city: "McLean",        state: "VA", logo: "🏦" },
  { routingNumber: "071000013", name: "BMO Harris Bank",             shortName: "BMO Harris",     city: "Chicago",       state: "IL", logo: "🏦" },
  { routingNumber: "122105155", name: "Charles Schwab Bank",         shortName: "Schwab Bank",    city: "Reno",          state: "NV", logo: "🏦" },

  // ── Regional Banks ────────────────────────────────────────
  { routingNumber: "044000037", name: "KeyBank National Association", shortName: "KeyBank",       city: "Cleveland",     state: "OH", logo: "🏦" },
  { routingNumber: "053000219", name: "Branch Banking & Trust (Truist)", shortName: "Truist",    city: "Charlotte",     state: "NC", logo: "🏦" },
  { routingNumber: "063100277", name: "SunTrust Bank (Truist)",      shortName: "SunTrust",       city: "Atlanta",       state: "GA", logo: "🏦" },
  { routingNumber: "042000314", name: "Fifth Third Bank",            shortName: "Fifth Third",    city: "Cincinnati",    state: "OH", logo: "🏦" },
  { routingNumber: "071921891", name: "Northern Trust Company",      shortName: "Northern Trust", city: "Chicago",       state: "IL", logo: "🏦" },
  { routingNumber: "021200025", name: "Santander Bank",              shortName: "Santander",      city: "Boston",        state: "MA", logo: "🏦" },
  { routingNumber: "011900254", name: "Citizens Bank",               shortName: "Citizens",       city: "Providence",    state: "RI", logo: "🏦" },
  { routingNumber: "073000228", name: "Regions Bank",                shortName: "Regions",        city: "Birmingham",    state: "AL", logo: "🏦" },
  { routingNumber: "084000026", name: "Synovus Bank",                shortName: "Synovus",        city: "Columbus",      state: "GA", logo: "🏦" },
  { routingNumber: "031100089", name: "PNC Bank",                    shortName: "PNC",            city: "Pittsburgh",    state: "PA", logo: "🏦" },
  { routingNumber: "124303120", name: "Zions Bancorporation",        shortName: "Zions Bank",     city: "Salt Lake City",state: "UT", logo: "🏦" },
  { routingNumber: "031201360", name: "Sovereign Bank (Santander)",  shortName: "Sovereign",      city: "Wyomissing",    state: "PA", logo: "🏦" },
  { routingNumber: "107002312", name: "First National Bank of Omaha",shortName: "FNBO",           city: "Omaha",         state: "NE", logo: "🏦" },
  { routingNumber: "101089742", name: "Commerce Bank",               shortName: "Commerce Bank",  city: "Kansas City",   state: "MO", logo: "🏦" },
  { routingNumber: "064000017", name: "Avenue Bank",                 shortName: "Avenue Bank",    city: "Nashville",     state: "TN", logo: "🏦" },

  // ── Credit Unions & Online Banks ──────────────────────────
  { routingNumber: "256074974", name: "Navy Federal Credit Union",   shortName: "Navy Federal",   city: "Vienna",        state: "VA", logo: "🏛" },
  { routingNumber: "314089681", name: "USAA Federal Savings Bank",   shortName: "USAA",           city: "San Antonio",   state: "TX", logo: "🏛" },
  { routingNumber: "321180379", name: "Alliant Credit Union",        shortName: "Alliant CU",     city: "Chicago",       state: "IL", logo: "🏛" },
  { routingNumber: "324377516", name: "Pentagon Federal CU (PenFed)",shortName: "PenFed",         city: "McLean",        state: "VA", logo: "🏛" },
  { routingNumber: "291471814", name: "Bethpage Federal Credit Union",shortName: "Bethpage FCU",  city: "Bethpage",      state: "NY", logo: "🏛" },
  { routingNumber: "231372691", name: "Ally Bank",                   shortName: "Ally Bank",      city: "Sandy",         state: "UT", logo: "💻" },
  { routingNumber: "084015767", name: "Chime (The Bancorp Bank)",    shortName: "Chime",          city: "San Francisco", state: "CA", logo: "💻" },
  { routingNumber: "021214891", name: "Marcus by Goldman Sachs",     shortName: "Marcus GS",      city: "New York",      state: "NY", logo: "💻" },
  { routingNumber: "124085244", name: "SoFi Bank",                   shortName: "SoFi",           city: "San Francisco", state: "CA", logo: "💻" },
  { routingNumber: "021000128", name: "Goldman Sachs Bank USA",      shortName: "Goldman Sachs",  city: "New York",      state: "NY", logo: "🏦" },

  // ── Community / State Banks ───────────────────────────────
  { routingNumber: "061092387", name: "Renasant Bank",               shortName: "Renasant",       city: "Tupelo",        state: "MS", logo: "🏦" },
  { routingNumber: "091300023", name: "Bremer Bank",                 shortName: "Bremer",         city: "Saint Paul",    state: "MN", logo: "🏦" },
  { routingNumber: "041215032", name: "Heartland BancCorp",          shortName: "Heartland",      city: "Gahanna",       state: "OH", logo: "🏦" },
  { routingNumber: "122237944", name: "Pacific Premier Bank",        shortName: "Pacific Premier", city: "Irvine",       state: "CA", logo: "🏦" },
  { routingNumber: "053100300", name: "First Horizon Bank",          shortName: "First Horizon",  city: "Memphis",       state: "TN", logo: "🏦" },
  { routingNumber: "065400137", name: "Investar Bank",               shortName: "Investar",       city: "Baton Rouge",   state: "LA", logo: "🏦" },
];

// Build lookup map: routing number → bank entry
export const ROUTING_LOOKUP: Record<string, BankEntry> = {};
for (const bank of US_BANKS) {
  ROUTING_LOOKUP[bank.routingNumber] = bank;
}

// ─── Routing Number Validation ──────────────────────────────
// ABA routing number checksum: 3×d1 + 7×d2 + d3 + 3×d4 + 7×d5 + d6 + 3×d7 + 7×d8 + d9 ≡ 0 (mod 10)
export function validateRoutingNumber(routing: string): { valid: boolean; message?: string } {
  const clean = routing.replace(/\D/g, "");
  if (clean.length !== 9) {
    return { valid: false, message: "Routing number must be exactly 9 digits." };
  }
  const d = clean.split("").map(Number);
  const checksum = 3 * d[0] + 7 * d[1] + d[2] +
                   3 * d[3] + 7 * d[4] + d[5] +
                   3 * d[6] + 7 * d[7] + d[8];
  if (checksum % 10 !== 0) {
    return { valid: false, message: "Invalid routing number. Please double-check." };
  }
  return { valid: true };
}

// Lookup bank by routing number (exact match from directory)
export function lookupBank(routing: string): BankEntry | null {
  const clean = routing.replace(/\D/g, "");
  return ROUTING_LOOKUP[clean] ?? null;
}

// Search banks by name (for autocomplete)
export function searchBanks(query: string): BankEntry[] {
  if (!query.trim()) return US_BANKS.slice(0, 10);
  const q = query.toLowerCase();
  return US_BANKS.filter(b =>
    b.name.toLowerCase().includes(q) ||
    b.shortName.toLowerCase().includes(q) ||
    b.city.toLowerCase().includes(q) ||
    b.routingNumber.startsWith(q)
  ).slice(0, 8);
}

// ─── Account Number Validation ──────────────────────────────
export function validateAccountNumber(acct: string): { valid: boolean; message?: string } {
  const clean = acct.replace(/\D/g, "");
  if (clean.length < 4 || clean.length > 17) {
    return { valid: false, message: "Account number must be 4–17 digits." };
  }
  return { valid: true };
}

// Mask account number for display: ••••• 4821
export function maskAccountNumber(acct: string): string {
  const clean = acct.replace(/\D/g, "");
  if (clean.length <= 4) return `••••• ${clean}`;
  return `••••• ${clean.slice(-4)}`;
}

// ─── Transfer Fee Structure ──────────────────────────────────
export interface FeeInfo {
  fee: number;
  feeLabel: string;
  deliveryTime: string;
  deliveryLabel: string;
}

export function getTransferFees(type: "internal_vaulte" | "ach" | "wire", amount: number): FeeInfo {
  switch (type) {
    case "internal_vaulte":
      return {
        fee: 0,
        feeLabel: "Free",
        deliveryTime: "instant",
        deliveryLabel: "Instant",
      };
    case "ach":
      return {
        fee: 0,
        feeLabel: "Free",
        deliveryTime: "1–3 business days",
        deliveryLabel: "1–3 Business Days",
      };
    case "wire":
      // Flat $15 wire fee (standard domestic)
      return {
        fee: 15,
        feeLabel: "$15.00",
        deliveryTime: "same day",
        deliveryLabel: "Same Business Day",
      };
  }
}

// ─── Simulated Recipient Verification ───────────────────────
// In reality this would hit a bank API. Here we simulate it with
// seeded records keyed by routing + last4 of account number.
// Clearly labelled as simulation in the UI.

export type VerificationStatus = "verified" | "name_mismatch" | "unverified";

export interface VerificationResult {
  status: VerificationStatus;
  label: string;
  sublabel: string;
  color: string;
  bg: string;
  border: string;
}

interface SeedRecord {
  recipientName: string; // canonical name
}

// Seeded verification records: key = `${routingNumber}_${last4}`
const SEED_RECORDS: Record<string, SeedRecord> = {
  "021000021_4821": { recipientName: "Sarah Johnson" },
  "021000021_7734": { recipientName: "James Wilson" },
  "121000248_2290": { recipientName: "Emily Chen" },
  "026009593_1122": { recipientName: "Marcus Davis" },
  "031100089_5593": { recipientName: "Olivia Torres" },
  "065000090_8847": { recipientName: "David Kim" },
  "044000037_3361": { recipientName: "Priya Patel" },
  "256074974_7722": { recipientName: "Robert Nguyen" },
  "314089681_9910": { recipientName: "Lauren Scott" },
  "042000314_6630": { recipientName: "Anthony Brown" },
};

export function simulateVerification(
  routingNumber: string,
  accountNumber: string,
  recipientName: string
): VerificationResult {
  const cleanRouting = routingNumber.replace(/\D/g, "");
  const cleanAcct    = accountNumber.replace(/\D/g, "");
  const last4        = cleanAcct.slice(-4);
  const key          = `${cleanRouting}_${last4}`;
  const seed         = SEED_RECORDS[key];

  if (!seed) {
    // No record → unable to verify (not necessarily wrong)
    return {
      status:   "unverified",
      label:    "Unable to Verify",
      sublabel: "Name confirmation not available. Proceed with caution.",
      color:    "#D97706",
      bg:       "#FFFBEB",
      border:   "#FDE68A",
    };
  }

  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z\s]/g, "").trim();
  const inputName = normalize(recipientName);
  const seedName  = normalize(seed.recipientName);

  if (inputName === seedName) {
    return {
      status:   "verified",
      label:    "Name Verified",
      sublabel: "Recipient name matches bank records.",
      color:    "#059669",
      bg:       "#F0FDF4",
      border:   "#BBF7D0",
    };
  }

  // Partial match: first name or last name matches
  const inputParts = inputName.split(" ").filter(Boolean);
  const seedParts  = seedName.split(" ").filter(Boolean);
  const partialMatch = inputParts.some(p => seedParts.includes(p));

  if (partialMatch) {
    return {
      status:   "name_mismatch",
      label:    "Partial Name Match",
      sublabel: "Some details matched, but full name confirmation failed.",
      color:    "#D97706",
      bg:       "#FFFBEB",
      border:   "#FDE68A",
    };
  }

  return {
    status:   "name_mismatch",
    label:    "Name Not Confirmed",
    sublabel: "Recipient name did not match bank records. Please verify.",
    color:    "#DC2626",
    bg:       "#FEF2F2",
    border:   "#FECACA",
  };
}
