// ─────────────────────────────────────────────────────────────
//  Vaulte — Shared State Management (localStorage-backed)
// ─────────────────────────────────────────────────────────────

export interface Account {
  id: string;
  name: string;
  type: "current" | "savings" | "currency" | "crypto";
  currency: string;
  symbol: string;
  flag: string;
  balance: number;
  accountNumber: string;
  sortCode?: string;
  iban?: string;
  frozen: boolean;
  color: string;
}

export interface Transaction {
  id: string;
  type: "debit" | "credit";
  name: string;
  sub: string;
  amount: number;
  currency: string;
  date: string;
  category: string;
  badge: string;
  badgeBg: string;
  badgeBorder: string;
  badgeColor: string;
  status: "completed" | "pending" | "failed";
  accountId: string;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface Profile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dob: string;
  address: string;
  city: string;
  country: string;
}

export interface CardSettings {
  frozen: boolean;
  onlinePayments: boolean;
  contactless: boolean;
  internationalTxns: boolean;
  spendingLimit: number;
  spentThisMonth: number;
}

export interface Preferences {
  defaultCurrency: string;
  language: string;
  timezone: string;
  twoFactor: boolean;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    marketing: boolean;
  };
}

export interface Notification {
  id: string;
  type: "transaction" | "security" | "account" | "promo";
  title: string;
  message: string;
  date: string;
  read: boolean;
  icon: string;
  iconBg: string;
  iconColor: string;
}

export interface VaulteState {
  accounts: Account[];
  transactions: Transaction[];
  profile: Profile;
  card: CardSettings;
  preferences: Preferences;
  notifications: Notification[];
  lastUpdated: string;
}

const STORAGE_KEY = "vaulte_state";

export const DEFAULT_STATE: VaulteState = {
  accounts: [
    {
      id: "acc-001",
      name: "Current Account",
      type: "current",
      currency: "USD",
      symbol: "$",
      flag: "🇺🇸",
      balance: 5240.0,
      accountNumber: "8247 4821",
      sortCode: "20-14-91",
      iban: "GB29 NWBK 6016 1331 9268 19",
      frozen: false,
      color: "#1A73E8",
    },
    {
      id: "acc-002",
      name: "Euro Account",
      type: "currency",
      currency: "EUR",
      symbol: "€",
      flag: "🇪🇺",
      balance: 3200.0,
      accountNumber: "6712 2934",
      iban: "DE89 3704 0044 0532 0130 00",
      frozen: false,
      color: "#7C3AED",
    },
    {
      id: "acc-003",
      name: "GBP Account",
      type: "currency",
      currency: "GBP",
      symbol: "£",
      flag: "🇬🇧",
      balance: 2150.0,
      accountNumber: "3391 7721",
      sortCode: "08-60-01",
      iban: "GB82 WEST 1234 5698 7654 32",
      frozen: false,
      color: "#059669",
    },
    {
      id: "acc-004",
      name: "Crypto Wallet",
      type: "crypto",
      currency: "BTC",
      symbol: "₿",
      flag: "₿",
      balance: 0.184,
      accountNumber: "bc1qxy2k...k4a9x",
      frozen: false,
      color: "#D97706",
    },
  ],
  transactions: [
    { id: "tx-001", type: "debit",  name: "Bitcoin Purchase",    sub: "Crypto.com",           amount: 500.00, currency: "USD", date: "2025-03-07T14:14:00", category: "Crypto",        badge: "Crypto",   badgeBg: "#FFFBEB", badgeBorder: "#FDE68A", badgeColor: "#D97706", status: "completed", accountId: "acc-001", icon: "₿",  iconBg: "linear-gradient(135deg,#F59E0B,#D97706)", iconColor: "#fff" },
    { id: "tx-002", type: "debit",  name: "ATM Withdrawal",      sub: "Chase Bank · NYC",     amount: 200.00, currency: "USD", date: "2025-03-07T10:30:00", category: "Cash",          badge: "Cash",     badgeBg: "#EFF6FF", badgeBorder: "#BFDBFE", badgeColor: "#2563EB", status: "completed", accountId: "acc-001", icon: "🏧", iconBg: "linear-gradient(135deg,#DBEAFE,#BFDBFE)", iconColor: "#2563EB" },
    { id: "tx-003", type: "credit", name: "Transfer Received",   sub: "From Sarah L.",        amount: 1000.00,currency: "USD", date: "2025-03-06T16:45:00", category: "Transfer",      badge: "Incoming", badgeBg: "#F0FDF4", badgeBorder: "#BBF7D0", badgeColor: "#16A34A", status: "completed", accountId: "acc-001", icon: "↗",  iconBg: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", iconColor: "#059669" },
    { id: "tx-004", type: "debit",  name: "Netflix Subscription", sub: "Netflix Inc.",         amount: 15.99,  currency: "USD", date: "2025-03-05T00:00:00", category: "Entertainment", badge: "Sub",      badgeBg: "#FEF2F2", badgeBorder: "#FECACA", badgeColor: "#DC2626", status: "completed", accountId: "acc-001", icon: "▶",  iconBg: "linear-gradient(135deg,#FEE2E2,#FECACA)", iconColor: "#DC2626" },
    { id: "tx-005", type: "debit",  name: "Whole Foods Market",   sub: "Grocery Store",        amount: 87.50,  currency: "USD", date: "2025-03-04T13:22:00", category: "Food",          badge: "Food",     badgeBg: "#F0FDF4", badgeBorder: "#BBF7D0", badgeColor: "#16A34A", status: "completed", accountId: "acc-001", icon: "🛒", iconBg: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", iconColor: "#059669" },
    { id: "tx-006", type: "credit", name: "Salary — March",       sub: "Acme Corp Ltd.",       amount: 3500.00,currency: "USD", date: "2025-03-01T09:00:00", category: "Income",        badge: "Income",   badgeBg: "#EFF6FF", badgeBorder: "#BFDBFE", badgeColor: "#2563EB", status: "completed", accountId: "acc-001", icon: "💼", iconBg: "linear-gradient(135deg,#EEF4FF,#DBEAFE)", iconColor: "#1A73E8" },
    { id: "tx-007", type: "debit",  name: "Amazon Purchase",      sub: "Amazon.com",           amount: 124.99, currency: "USD", date: "2025-02-28T15:40:00", category: "Shopping",      badge: "Shop",     badgeBg: "#FFFBEB", badgeBorder: "#FDE68A", badgeColor: "#D97706", status: "completed", accountId: "acc-001", icon: "📦", iconBg: "linear-gradient(135deg,#FFFBEB,#FDE68A)", iconColor: "#D97706" },
    { id: "tx-008", type: "debit",  name: "Uber Ride",            sub: "Uber Technologies",    amount: 12.50,  currency: "USD", date: "2025-02-27T20:15:00", category: "Transport",     badge: "Ride",     badgeBg: "#F8FAFC", badgeBorder: "#E2E8F0", badgeColor: "#64748B", status: "completed", accountId: "acc-001", icon: "🚗", iconBg: "linear-gradient(135deg,#F1F5F9,#E2E8F0)", iconColor: "#374151" },
    { id: "tx-009", type: "debit",  name: "Spotify Premium",      sub: "Spotify AB",           amount: 9.99,   currency: "USD", date: "2025-02-26T00:00:00", category: "Entertainment", badge: "Sub",      badgeBg: "#F0FDF4", badgeBorder: "#BBF7D0", badgeColor: "#16A34A", status: "completed", accountId: "acc-001", icon: "🎵", iconBg: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", iconColor: "#059669" },
    { id: "tx-010", type: "credit", name: "Freelance Payment",    sub: "Client · Web Project", amount: 750.00, currency: "USD", date: "2025-02-25T11:30:00", category: "Income",        badge: "Income",   badgeBg: "#EFF6FF", badgeBorder: "#BFDBFE", badgeColor: "#2563EB", status: "completed", accountId: "acc-001", icon: "💻", iconBg: "linear-gradient(135deg,#EEF4FF,#DBEAFE)", iconColor: "#1A73E8" },
  ],
  profile: {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@vaulte.com",
    phone: "+1 (555) 000-0001",
    dob: "1990-01-15",
    address: "123 Main Street",
    city: "New York, NY 10001",
    country: "United States",
  },
  card: {
    frozen: false,
    onlinePayments: true,
    contactless: true,
    internationalTxns: true,
    spendingLimit: 2000,
    spentThisMonth: 1205.48,
  },
  preferences: {
    defaultCurrency: "USD",
    language: "English",
    timezone: "UTC-5 (Eastern Time)",
    twoFactor: true,
    notifications: { email: true, push: true, sms: false, marketing: false },
  },
  notifications: [
    { id: "notif-001", type: "transaction", title: "Salary Received",          message: "Your March salary of $3,500.00 from Acme Corp Ltd. has been credited to your Current Account.",     date: "2025-03-01T09:01:00", read: false, icon: "💼", iconBg: "#EEF4FF", iconColor: "#1A73E8" },
    { id: "notif-002", type: "security",    title: "New Login Detected",        message: "A new login was detected from Chrome on Windows · New York, US. If this wasn't you, secure your account immediately.", date: "2025-03-06T08:15:00", read: false, icon: "🔐", iconBg: "#FEF2F2", iconColor: "#DC2626" },
    { id: "notif-003", type: "transaction", title: "Transfer Received",         message: "Sarah L. sent you $1,000.00. The funds are now available in your Current Account.",                 date: "2025-03-06T16:45:00", read: false, icon: "↗",  iconBg: "#F0FDF4", iconColor: "#16A34A" },
    { id: "notif-004", type: "account",     title: "KYC Verification Complete", message: "Your identity has been verified successfully. You now have full access to all Vaulte features.",   date: "2025-03-05T10:00:00", read: true,  icon: "✓",  iconBg: "#F0FDF4", iconColor: "#059669" },
    { id: "notif-005", type: "account",     title: "Spending Limit Alert",      message: "You have used 80% ($1,205.48 of $2,000.00) of your monthly card spending limit.",                  date: "2025-03-04T20:00:00", read: true,  icon: "⚠",  iconBg: "#FFFBEB", iconColor: "#D97706" },
    { id: "notif-006", type: "promo",       title: "Better Exchange Rates",     message: "Send money abroad with zero fees this weekend. Exchange rates updated — EUR and GBP at their best.", date: "2025-03-03T12:00:00", read: true,  icon: "🎁", iconBg: "#EEF4FF", iconColor: "#7C3AED" },
    { id: "notif-007", type: "security",    title: "Password Changed",          message: "Your account password was changed successfully. If you did not make this change, contact support.",  date: "2025-02-28T14:20:00", read: true,  icon: "🔑", iconBg: "#F0FDF4", iconColor: "#059669" },
    { id: "notif-008", type: "account",     title: "Card Expiry Reminder",      message: "Your Vaulte Virtual Card expires in 60 days. Request a new card in the Cards section to avoid disruption.", date: "2025-02-25T09:00:00", read: true, icon: "📅", iconBg: "#FEF2F2", iconColor: "#DC2626" },
  ],
  lastUpdated: new Date().toISOString(),
};

export function getState(): VaulteState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_STATE;
    const parsed = JSON.parse(raw) as Partial<VaulteState>;
    return {
      accounts:      parsed.accounts      ?? DEFAULT_STATE.accounts,
      transactions:  parsed.transactions  ?? DEFAULT_STATE.transactions,
      profile:       { ...DEFAULT_STATE.profile,      ...(parsed.profile ?? {}) },
      card:          { ...DEFAULT_STATE.card,         ...(parsed.card ?? {}) },
      preferences:   { ...DEFAULT_STATE.preferences,  ...(parsed.preferences ?? {}),
        notifications: { ...DEFAULT_STATE.preferences.notifications, ...(parsed.preferences?.notifications ?? {}) },
      },
      notifications: parsed.notifications ?? DEFAULT_STATE.notifications,
      lastUpdated:   parsed.lastUpdated   ?? new Date().toISOString(),
    };
  } catch {
    return DEFAULT_STATE;
  }
}

export function saveState(state: VaulteState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, lastUpdated: new Date().toISOString() }));
  } catch { /* silently fail */ }
}

// ─── Helpers ───────────────────────────────────────────────

const USD_RATES: Record<string, number> = { USD: 1, EUR: 1.09, GBP: 1.27, BTC: 66000 };

export function getTotalBalanceUSD(state: VaulteState): number {
  return state.accounts.reduce((sum, acc) => sum + acc.balance * (USD_RATES[acc.currency] ?? 1), 0);
}

export function fmtAmount(amount: number, currency: string, symbol: string): string {
  if (currency === "BTC") return `${amount.toFixed(4)} BTC`;
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now   = new Date();
  const diffMs = now.getTime() - date.getTime();
  const days   = Math.floor(diffMs / 86_400_000);
  if (days === 0) return `Today, ${date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}`;
  if (days === 1) return "Yesterday";
  if (days < 7)  return `${days} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function genTxId(): string {
  return `tx-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function genNotifId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
