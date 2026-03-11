// ─────────────────────────────────────────────────────────────
//  Vaulte — Core Banking State (localStorage-backed simulation)
//  Upgraded: proper transaction types, recipients, ledger,
//            4-account default, BTC wallet, fee tracking
// ─────────────────────────────────────────────────────────────

// ─── User Types ────────────────────────────────────────────
export type KycStatus = "unverified" | "pending" | "verified";

export interface VaulteUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  kycStatus: KycStatus;
  createdAt: string;
  kycDocType?: string;
  kycSubmittedAt?: string;
  kycDob?: string;
  kycNationality?: string;
  kycAddress?: string;
  kycCity?: string;
  accountStatus?: "active" | "suspended" | "frozen" | "closed";
  adminNotes?: string;
}

// ─── Account ────────────────────────────────────────────────
export interface Account {
  id: string;
  name: string;
  type: "current" | "savings" | "currency" | "crypto";
  currency: string;
  symbol: string;
  flag: string;
  balance: number;
  accountNumber: string;
  routingNumber?: string;
  sortCode?: string;
  iban?: string;
  btcAddress?: string;
  frozen: boolean;
  color: string;
}

// ─── Transaction (upgraded with txType, fee, balanceAfter, reference) ──
export type TxType =
  | "deposit" | "withdrawal" | "transfer_in" | "transfer_out"
  | "exchange" | "card_payment" | "refund"
  | "crypto_deposit" | "crypto_withdrawal"
  | "admin_credit" | "admin_debit";

export interface Transaction {
  id: string;
  txType: TxType;
  type: "debit" | "credit";           // direction shorthand
  name: string;
  sub: string;
  amount: number;
  fee: number;                         // transaction fee
  balanceAfter: number;               // running balance after this tx
  currency: string;
  date: string;
  category: string;
  badge: string;
  badgeBg: string;
  badgeBorder: string;
  badgeColor: string;
  status: "completed" | "pending" | "failed" | "reversed";
  accountId: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  reference: string;                   // e.g. "VLT-2025-XXXXX"
  note?: string;
  recipientName?: string;
  recipientBank?: string;
}

// ─── Recipient / Payee ──────────────────────────────────────
export type RecipientType = "internal_vaulte" | "ach" | "wire";

export interface Recipient {
  id: string;
  userId: string;
  recipientType: RecipientType;
  recipientName: string;
  bankName: string;
  routingNumber?: string;
  accountNumberMasked: string;
  accountType: "checking" | "savings";
  email?: string;
  createdAt: string;
  lastUsed?: string;
}

// ─── Profile ────────────────────────────────────────────────
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

// ─── Card ────────────────────────────────────────────────────
export interface CardSettings {
  issued: boolean;
  frozen: boolean;
  onlinePayments: boolean;
  contactless: boolean;
  internationalTxns: boolean;
  spendingLimit: number;
  spentThisMonth: number;
  cardNumber?: string;    // masked last 4, e.g. "4532 •••• •••• 7841"
  expiry?: string;        // "MM/YY"
  cvv?: string;           // masked "•••"
  cardBrand?: string;     // "visa"
  linkedAccountId?: string;
  issuedAt?: string;
}

// ─── Preferences ────────────────────────────────────────────
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

// ─── Notification ────────────────────────────────────────────
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

// ─── Root State ──────────────────────────────────────────────
export interface VaulteState {
  accounts: Account[];
  transactions: Transaction[];
  recipients: Recipient[];
  profile: Profile;
  card: CardSettings;
  preferences: Preferences;
  notifications: Notification[];
  lastUpdated: string;
}

// ─── Storage Keys ──────────────────────────────────────────
const USERS_KEY        = "vaulte_users";
const CURRENT_USER_KEY = "vaulte_user";
const stateKey = (userId: string) => `vaulte_state_${userId}`;

// ─── Demo User ─────────────────────────────────────────────
export const DEMO_USER_ID = "user-demo-001";
export const DEMO_USER: VaulteUser = {
  id:         DEMO_USER_ID,
  firstName:  "Alex",
  lastName:   "Morgan",
  email:      "demo@vaulte.com",
  password:   "Demo@12345",
  kycStatus:  "verified",
  createdAt:  "2024-01-01T00:00:00.000Z",
};

// ─── Exchange Rates ──────────────────────────────────────────
export const USD_RATES: Record<string, number> = {
  USD: 1, EUR: 1.09, GBP: 1.27, BTC: 66000,
};

export const CROSS_RATES: Record<string, number> = {
  "USD-EUR": 0.917, "EUR-USD": 1.09,
  "USD-GBP": 0.787, "GBP-USD": 1.27,
  "EUR-GBP": 0.858, "GBP-EUR": 1.165,
  "USD-BTC": 0.0000152, "BTC-USD": 66000,
  "EUR-BTC": 0.0000140, "BTC-EUR": 71400,
  "GBP-BTC": 0.0000120, "BTC-GBP": 83200,
};

// ─── Demo Seed State ────────────────────────────────────────
export const DEMO_STATE: VaulteState = {
  accounts: [
    { id: "acc-001", name: "Primary USD Account", type: "current",  currency: "USD", symbol: "$",  flag: "🇺🇸", balance: 5240.00, accountNumber: "8247 4821", routingNumber: "021000021", sortCode: "20-14-91", iban: "GB29 NWBK 6016 1331 9268 19", frozen: false, color: "#1A73E8" },
    { id: "acc-002", name: "Euro Wallet",          type: "currency", currency: "EUR", symbol: "€",  flag: "🇪🇺", balance: 3200.00, accountNumber: "6712 2934", iban: "DE89 3704 0044 0532 0130 00", frozen: false, color: "#7C3AED" },
    { id: "acc-003", name: "GBP Wallet",           type: "currency", currency: "GBP", symbol: "£",  flag: "🇬🇧", balance: 2150.00, accountNumber: "3391 7721", sortCode: "08-60-01", iban: "GB82 WEST 1234 5698 7654 32", frozen: false, color: "#059669" },
    { id: "acc-004", name: "Bitcoin Wallet",       type: "crypto",   currency: "BTC", symbol: "₿",  flag: "₿",   balance: 0.184,   accountNumber: "bc1q...k4a9x", btcAddress: "bc1qxy2kgdygjrsqtzq2n0yrf249", frozen: false, color: "#D97706" },
  ],
  transactions: [
    { id: "tx-001", txType: "crypto_deposit",  type: "credit", name: "Bitcoin Deposit",       sub: "External Wallet",      amount: 0.050,   fee: 0,     balanceAfter: 0.184, currency: "BTC", date: "2025-03-07T14:14:00", category: "Crypto",        badge: "Crypto",    badgeBg: "#FFFBEB", badgeBorder: "#FDE68A", badgeColor: "#D97706", status: "completed", accountId: "acc-004", icon: "₿",  iconBg: "linear-gradient(135deg,#F59E0B,#D97706)", iconColor: "#fff",     reference: "VLT-2025-83947" },
    { id: "tx-002", txType: "withdrawal",       type: "debit",  name: "ATM Withdrawal",        sub: "Chase Bank · NYC",     amount: 200.00,  fee: 2.50,  balanceAfter: 4840.00, currency: "USD", date: "2025-03-07T10:30:00", category: "Cash",          badge: "Cash",      badgeBg: "#EFF6FF", badgeBorder: "#BFDBFE", badgeColor: "#2563EB", status: "completed", accountId: "acc-001", icon: "🏧", iconBg: "linear-gradient(135deg,#DBEAFE,#BFDBFE)", iconColor: "#2563EB", reference: "VLT-2025-73821" },
    { id: "tx-003", txType: "transfer_in",      type: "credit", name: "Transfer Received",     sub: "From Sarah L.",        amount: 1000.00, fee: 0,     balanceAfter: 5040.00, currency: "USD", date: "2025-03-06T16:45:00", category: "Transfer",      badge: "Incoming",  badgeBg: "#F0FDF4", badgeBorder: "#BBF7D0", badgeColor: "#16A34A", status: "completed", accountId: "acc-001", icon: "↙",  iconBg: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", iconColor: "#059669", reference: "VLT-2025-62910", recipientName: "Sarah L." },
    { id: "tx-004", txType: "card_payment",     type: "debit",  name: "Netflix Subscription",  sub: "Netflix Inc.",         amount: 15.99,   fee: 0,     balanceAfter: 4040.00, currency: "USD", date: "2025-03-05T00:00:00", category: "Entertainment", badge: "Card",      badgeBg: "#FEF2F2", badgeBorder: "#FECACA", badgeColor: "#DC2626", status: "completed", accountId: "acc-001", icon: "▶",  iconBg: "linear-gradient(135deg,#FEE2E2,#FECACA)", iconColor: "#DC2626", reference: "VLT-2025-51847" },
    { id: "tx-005", txType: "card_payment",     type: "debit",  name: "Whole Foods Market",    sub: "Grocery Store",        amount: 87.50,   fee: 0,     balanceAfter: 4056.00, currency: "USD", date: "2025-03-04T13:22:00", category: "Food",          badge: "Card",      badgeBg: "#F0FDF4", badgeBorder: "#BBF7D0", badgeColor: "#16A34A", status: "completed", accountId: "acc-001", icon: "🛒", iconBg: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", iconColor: "#059669", reference: "VLT-2025-49321" },
    { id: "tx-006", txType: "deposit",          type: "credit", name: "Salary — March",        sub: "Acme Corp Ltd.",       amount: 3500.00, fee: 0,     balanceAfter: 4143.50, currency: "USD", date: "2025-03-01T09:00:00", category: "Income",        badge: "Deposit",   badgeBg: "#EFF6FF", badgeBorder: "#BFDBFE", badgeColor: "#2563EB", status: "completed", accountId: "acc-001", icon: "💼", iconBg: "linear-gradient(135deg,#EEF4FF,#DBEAFE)", iconColor: "#1A73E8", reference: "VLT-2025-38104" },
    { id: "tx-007", txType: "card_payment",     type: "debit",  name: "Amazon Purchase",       sub: "Amazon.com",           amount: 124.99,  fee: 0,     balanceAfter: 643.50,  currency: "USD", date: "2025-02-28T15:40:00", category: "Shopping",      badge: "Card",      badgeBg: "#FFFBEB", badgeBorder: "#FDE68A", badgeColor: "#D97706", status: "completed", accountId: "acc-001", icon: "📦", iconBg: "linear-gradient(135deg,#FFFBEB,#FDE68A)", iconColor: "#D97706", reference: "VLT-2025-27658" },
    { id: "tx-008", txType: "card_payment",     type: "debit",  name: "Uber Ride",             sub: "Uber Technologies",    amount: 12.50,   fee: 0,     balanceAfter: 768.50,  currency: "USD", date: "2025-02-27T20:15:00", category: "Transport",     badge: "Card",      badgeBg: "#F8FAFC", badgeBorder: "#E2E8F0", badgeColor: "#64748B", status: "completed", accountId: "acc-001", icon: "🚗", iconBg: "linear-gradient(135deg,#F1F5F9,#E2E8F0)", iconColor: "#374151", reference: "VLT-2025-19044" },
    { id: "tx-009", txType: "card_payment",     type: "debit",  name: "Spotify Premium",       sub: "Spotify AB",           amount: 9.99,    fee: 0,     balanceAfter: 781.00,  currency: "USD", date: "2025-02-26T00:00:00", category: "Entertainment", badge: "Card",      badgeBg: "#F0FDF4", badgeBorder: "#BBF7D0", badgeColor: "#16A34A", status: "completed", accountId: "acc-001", icon: "🎵", iconBg: "linear-gradient(135deg,#D1FAE5,#A7F3D0)", iconColor: "#059669", reference: "VLT-2025-10293" },
    { id: "tx-010", txType: "deposit",          type: "credit", name: "Freelance Payment",     sub: "Client · Web Project", amount: 750.00,  fee: 0,     balanceAfter: 790.99,  currency: "USD", date: "2025-02-25T11:30:00", category: "Income",        badge: "Deposit",   badgeBg: "#EFF6FF", badgeBorder: "#BFDBFE", badgeColor: "#2563EB", status: "completed", accountId: "acc-001", icon: "💻", iconBg: "linear-gradient(135deg,#EEF4FF,#DBEAFE)", iconColor: "#1A73E8", reference: "VLT-2025-00847" },
    { id: "tx-011", txType: "exchange",         type: "debit",  name: "Currency Exchange",     sub: "USD → EUR",            amount: 500.00,  fee: 1.50,  balanceAfter: 40.99,   currency: "USD", date: "2025-02-24T09:15:00", category: "Exchange",      badge: "Exchange",  badgeBg: "#EEF4FF", badgeBorder: "#C4B5FD", badgeColor: "#7C3AED", status: "completed", accountId: "acc-001", icon: "⇄",  iconBg: "linear-gradient(135deg,#EEF4FF,#C4B5FD)", iconColor: "#7C3AED", reference: "VLT-2025-99201" },
    { id: "tx-012", txType: "transfer_out",     type: "debit",  name: "Wire Transfer",         sub: "To James Wilson",      amount: 300.00,  fee: 15.00, balanceAfter: 540.99,  currency: "USD", date: "2025-02-23T14:00:00", category: "Transfer",      badge: "Transfer",  badgeBg: "#EFF6FF", badgeBorder: "#BFDBFE", badgeColor: "#2563EB", status: "completed", accountId: "acc-001", icon: "↗",  iconBg: "linear-gradient(135deg,#DBEAFE,#BFDBFE)", iconColor: "#2563EB", reference: "VLT-2025-88742", recipientName: "James Wilson", recipientBank: "Wells Fargo" },
  ],
  recipients: [
    { id: "rec-001", userId: DEMO_USER_ID, recipientType: "ach",             recipientName: "Sarah Johnson",  bankName: "Chase Bank",          routingNumber: "021000021", accountNumberMasked: "••••• 4821", accountType: "checking", createdAt: "2025-01-15T00:00:00", lastUsed: "2025-03-06T16:45:00" },
    { id: "rec-002", userId: DEMO_USER_ID, recipientType: "wire",            recipientName: "James Wilson",   bankName: "Wells Fargo",          routingNumber: "121000248", accountNumberMasked: "••••• 7734", accountType: "checking", createdAt: "2025-01-20T00:00:00", lastUsed: "2025-02-23T14:00:00" },
    { id: "rec-003", userId: DEMO_USER_ID, recipientType: "internal_vaulte", recipientName: "Emily Chen",     bankName: "Vaulte",               accountNumberMasked: "••••• 2290", accountType: "checking", email: "emily.chen@email.com", createdAt: "2025-02-01T00:00:00" },
  ],
  profile: {
    firstName: "Alex", lastName: "Morgan",
    email: "demo@vaulte.com", phone: "+1 (555) 000-0001",
    dob: "1990-01-15", address: "123 Main Street",
    city: "New York, NY 10001", country: "United States",
  },
  card: {
    issued: true, frozen: false, onlinePayments: true, contactless: true,
    internationalTxns: true, spendingLimit: 2000, spentThisMonth: 1205.48,
    cardNumber: "4532 •••• •••• 7841", expiry: "09/27", cvv: "•••",
    cardBrand: "visa", linkedAccountId: "acc-001", issuedAt: "2024-01-15T00:00:00",
  },
  preferences: {
    defaultCurrency: "USD", language: "English", timezone: "UTC-5 (Eastern Time)",
    twoFactor: true,
    notifications: { email: true, push: true, sms: false, marketing: false },
  },
  notifications: [
    { id: "notif-001", type: "transaction", title: "Salary Received",          message: "Your March salary of $3,500.00 from Acme Corp Ltd. has been credited to your Primary USD Account.",     date: "2025-03-01T09:01:00", read: false, icon: "💼", iconBg: "#EEF4FF", iconColor: "#1A73E8" },
    { id: "notif-002", type: "security",    title: "New Login Detected",        message: "A new login was detected from Chrome on Windows · New York, US. If this wasn't you, secure your account immediately.", date: "2025-03-06T08:15:00", read: false, icon: "🔐", iconBg: "#FEF2F2", iconColor: "#DC2626" },
    { id: "notif-003", type: "transaction", title: "Transfer Received",         message: "Sarah Johnson sent you $1,000.00. The funds are now available in your Primary USD Account.",             date: "2025-03-06T16:45:00", read: false, icon: "↙",  iconBg: "#F0FDF4", iconColor: "#16A34A" },
    { id: "notif-004", type: "account",     title: "KYC Verification Complete", message: "Your identity has been verified successfully. You now have full access to all Vaulte features.",         date: "2025-03-05T10:00:00", read: true,  icon: "✓",  iconBg: "#F0FDF4", iconColor: "#059669" },
    { id: "notif-005", type: "account",     title: "Spending Limit Alert",      message: "You have used 80% ($1,205.48 of $2,000.00) of your monthly card spending limit.",                        date: "2025-03-04T20:00:00", read: true,  icon: "⚠",  iconBg: "#FFFBEB", iconColor: "#D97706" },
    { id: "notif-006", type: "promo",       title: "Better Exchange Rates",     message: "Send money abroad with zero fees this weekend. EUR and GBP rates updated.",                              date: "2025-03-03T12:00:00", read: true,  icon: "🎁", iconBg: "#EEF4FF", iconColor: "#7C3AED" },
    { id: "notif-007", type: "security",    title: "Password Changed",          message: "Your account password was changed. If you did not make this change, contact support immediately.",        date: "2025-02-28T14:20:00", read: true,  icon: "🔑", iconBg: "#F0FDF4", iconColor: "#059669" },
    { id: "notif-008", type: "account",     title: "Card Expiry Reminder",      message: "Your Vaulte Virtual Card expires in 60 days. Request a new card to avoid disruption.",                   date: "2025-02-25T09:00:00", read: true,  icon: "📅", iconBg: "#FEF2F2", iconColor: "#DC2626" },
  ],
  lastUpdated: new Date().toISOString(),
};

export const DEFAULT_STATE = DEMO_STATE;

// ─── User Management ───────────────────────────────────────

export function getUsers(): VaulteUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as VaulteUser[]) : [];
  } catch { return []; }
}

export function saveUsers(users: VaulteUser[]): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch { /* silently fail */ }
}

export function getCurrentUser(): VaulteUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(CURRENT_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<VaulteUser>;
    if (!parsed.id) return null;
    return parsed as VaulteUser;
  } catch { return null; }
}

export function saveCurrentUser(user: VaulteUser): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user)); } catch { /* silently fail */ }
}

export function createUser(firstName: string, lastName: string, email: string, password: string): VaulteUser {
  const users = getUsers();
  const id    = `user-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const newUser: VaulteUser = {
    id, firstName: firstName.trim(), lastName: lastName.trim(),
    email: email.toLowerCase().trim(), password,
    kycStatus: "unverified", createdAt: new Date().toISOString(),
  };
  users.push(newUser);
  saveUsers(users);
  if (typeof window !== "undefined") {
    const empty = createEmptyUserState(newUser);
    try { localStorage.setItem(stateKey(id), JSON.stringify(empty)); } catch { /* silently fail */ }
  }
  return newUser;
}

export function loginUser(email: string, password: string): VaulteUser | null {
  const emailLower = email.toLowerCase().trim();
  if (emailLower === "demo@vaulte.com" && password === "Demo@12345") {
    ensureDemoState(); return DEMO_USER;
  }
  const users = getUsers();
  return users.find(u => u.email === emailLower && u.password === password) ?? null;
}

export function updateUser(userId: string, updates: Partial<VaulteUser>): void {
  if (userId === DEMO_USER_ID) return;
  const users = getUsers();
  const idx   = users.findIndex(u => u.id === userId);
  if (idx === -1) return;
  users[idx] = { ...users[idx], ...updates };
  saveUsers(users);
  const current = getCurrentUser();
  if (current?.id === userId) saveCurrentUser(users[idx]);
}

export function getUserState(userId: string): VaulteState {
  if (typeof window === "undefined") return DEMO_STATE;
  try {
    const key = stateKey(userId);
    const raw = localStorage.getItem(key);
    if (!raw) {
      if (userId === DEMO_USER_ID) return DEMO_STATE;
      const user = getUsers().find(u => u.id === userId);
      return user ? createEmptyUserState(user) : DEMO_STATE;
    }
    return JSON.parse(raw) as VaulteState;
  } catch { return DEMO_STATE; }
}

export function saveUserState(userId: string, state: VaulteState): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(stateKey(userId), JSON.stringify({ ...state, lastUpdated: new Date().toISOString() }));
  } catch { /* silently fail */ }
}

export function getUserById(id: string): VaulteUser | null {
  if (id === DEMO_USER_ID) return DEMO_USER;
  return getUsers().find(u => u.id === id) ?? null;
}

// ─── KYC ───────────────────────────────────────────────────
const kycDocKey = (userId: string) => `vaulte_kyc_doc_${userId}`;
export function getKycDoc(userId: string): string | null {
  if (typeof window === "undefined") return null;
  try { return localStorage.getItem(kycDocKey(userId)); } catch { return null; }
}
export function saveKycDoc(userId: string, base64DataUrl: string): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(kycDocKey(userId), base64DataUrl); } catch { /* silently fail */ }
}
export function submitKyc(
  userId: string, docType: string, docBase64: string,
  details: { dob: string; nationality: string; address: string; city: string }
): void {
  saveKycDoc(userId, docBase64);
  updateUser(userId, { kycStatus: "pending", kycDocType: docType,
    kycSubmittedAt: new Date().toISOString(), kycDob: details.dob,
    kycNationality: details.nationality, kycAddress: details.address, kycCity: details.city });
}

// ─── Recipients ─────────────────────────────────────────────
const recipientsKey = (userId: string) => `vaulte_recipients_${userId}`;

export function getRecipients(userId: string): Recipient[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(recipientsKey(userId));
    if (!raw) {
      if (userId === DEMO_USER_ID) return DEMO_STATE.recipients;
      return [];
    }
    return JSON.parse(raw) as Recipient[];
  } catch { return []; }
}

export function saveRecipients(userId: string, recipients: Recipient[]): void {
  if (typeof window === "undefined") return;
  try { localStorage.setItem(recipientsKey(userId), JSON.stringify(recipients)); } catch { /* silently fail */ }
}

export function addRecipient(userId: string, recipient: Omit<Recipient, "id" | "userId" | "createdAt">): Recipient {
  const recipients = getRecipients(userId);
  const newRec: Recipient = {
    ...recipient, id: `rec-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId, createdAt: new Date().toISOString(),
  };
  recipients.push(newRec);
  saveRecipients(userId, recipients);
  return newRec;
}

// ─── State Access ───────────────────────────────────────────

export function getState(): VaulteState {
  if (typeof window === "undefined") return DEMO_STATE;
  try {
    const user = getCurrentUser();
    if (!user) return DEMO_STATE;
    const key = stateKey(user.id);
    const raw = localStorage.getItem(key);
    if (!raw) {
      const empty = createEmptyUserState(user);
      try { localStorage.setItem(key, JSON.stringify(empty)); } catch { /* silently fail */ }
      return empty;
    }
    const parsed = JSON.parse(raw) as Partial<VaulteState>;
    const ref = user.id === DEMO_USER_ID ? DEMO_STATE : createEmptyUserState(user);
    return {
      accounts:      parsed.accounts      ?? ref.accounts,
      transactions:  parsed.transactions  ?? ref.transactions,
      recipients:    parsed.recipients    ?? ref.recipients ?? [],
      profile:       { ...ref.profile,       ...(parsed.profile ?? {}) },
      card:          { ...ref.card,          ...(parsed.card ?? {}) },
      preferences:   { ...ref.preferences,   ...(parsed.preferences ?? {}),
        notifications: { ...ref.preferences.notifications, ...(parsed.preferences?.notifications ?? {}) } },
      notifications: parsed.notifications ?? ref.notifications,
      lastUpdated:   parsed.lastUpdated   ?? new Date().toISOString(),
    };
  } catch { return DEMO_STATE; }
}

export function saveState(state: VaulteState): void {
  if (typeof window === "undefined") return;
  try {
    const user = getCurrentUser();
    if (!user) return;
    localStorage.setItem(stateKey(user.id), JSON.stringify({ ...state, lastUpdated: new Date().toISOString() }));
  } catch { /* silently fail */ }
}

// ─── Empty State Factory (4 accounts for all new users) ────
function randAccountNumber(): string {
  return `${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`;
}
function randRouting(): string {
  return `0${Math.floor(10000000 + Math.random() * 90000000)}`;
}
function randSortCode(): string {
  return Array.from({ length: 3 }, () => String(Math.floor(10 + Math.random() * 90))).join("-");
}
function randIBAN(): string {
  const d = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join("");
  return `GB${d.slice(0,2)} NWBK ${d.slice(2,6)} ${d.slice(6,10)} ${d.slice(10,14)} ${d.slice(14)}`;
}
function randBTCAddress(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  const suffix = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `bc1q...${suffix}`;
}

export function createEmptyUserState(user: VaulteUser): VaulteState {
  const uid = user.id;
  return {
    accounts: [
      { id: `acc-${uid}-001`, name: "Primary USD Account", type: "current",  currency: "USD", symbol: "$", flag: "🇺🇸", balance: 0, accountNumber: randAccountNumber(), routingNumber: randRouting(), sortCode: randSortCode(), iban: randIBAN(), frozen: false, color: "#1A73E8" },
      { id: `acc-${uid}-002`, name: "Euro Wallet",          type: "currency", currency: "EUR", symbol: "€", flag: "🇪🇺", balance: 0, accountNumber: randAccountNumber(), iban: randIBAN(), frozen: false, color: "#7C3AED" },
      { id: `acc-${uid}-003`, name: "GBP Wallet",           type: "currency", currency: "GBP", symbol: "£", flag: "🇬🇧", balance: 0, accountNumber: randAccountNumber(), sortCode: randSortCode(), iban: randIBAN(), frozen: false, color: "#059669" },
      { id: `acc-${uid}-004`, name: "Bitcoin Wallet",       type: "crypto",   currency: "BTC", symbol: "₿", flag: "₿",   balance: 0, accountNumber: randBTCAddress(), btcAddress: `bc1q${Math.random().toString(36).slice(2,30)}`, frozen: false, color: "#D97706" },
    ],
    transactions: [],
    recipients: [],
    profile: {
      firstName: user.firstName, lastName: user.lastName,
      email: user.email, phone: "", dob: "", address: "", city: "", country: "",
    },
    card: {
      issued: false, frozen: false, onlinePayments: false, contactless: false,
      internationalTxns: false, spendingLimit: 0, spentThisMonth: 0,
      cardBrand: "visa", linkedAccountId: `acc-${uid}-001`,
    },
    preferences: {
      defaultCurrency: "USD", language: "English", timezone: "UTC-5 (Eastern Time)",
      twoFactor: false,
      notifications: { email: true, push: true, sms: false, marketing: false },
    },
    notifications: [
      {
        id: genNotifId(), type: "account",
        title: "Welcome to Vaulte! 🎉",
        message: `Hi ${user.firstName}! Your account is ready. Complete KYC verification to unlock transfers, cards, and currency exchange.`,
        date: user.createdAt, read: false, icon: "🎉", iconBg: "#EEF4FF", iconColor: "#1A73E8",
      },
    ],
    lastUpdated: new Date().toISOString(),
  };
}

function ensureDemoState(): void {
  if (typeof window === "undefined") return;
  const key = stateKey(DEMO_USER_ID);
  if (!localStorage.getItem(key)) {
    try { localStorage.setItem(key, JSON.stringify(DEMO_STATE)); } catch { /* silently fail */ }
  }
}

// ─── Helpers ───────────────────────────────────────────────

export function getTotalBalanceUSD(state: VaulteState): number {
  return state.accounts.reduce((sum, acc) => sum + acc.balance * (USD_RATES[acc.currency] ?? 1), 0);
}

export function fmtAmount(amount: number, currency: string, symbol: string): string {
  if (currency === "BTC") return `${amount.toFixed(6)} BTC`;
  return `${symbol}${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function fmtDate(dateStr: string): string {
  const date   = new Date(dateStr);
  const now    = new Date();
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

export function genRef(): string {
  return `VLT-${new Date().getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;
}

export function genNotifId(): string {
  return `notif-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
