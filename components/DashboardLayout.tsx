"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  getState, getCurrentUser, saveCurrentUser, saveUsers, getUsers, createEmptyUserState,
  VaulteState, DEMO_STATE, getTotalBalanceUSD, fmtAmount, VaulteUser,
} from "@/lib/vaulteState";

const C = {
  bg: "#F3F5FA", card: "#ffffff", navy: "#0F172A", blue: "#1A73E8",
  border: "rgba(15,23,42,0.07)", muted: "#94A3B8", text: "#0F172A", sub: "#64748B",
  shadow: "0 1px 3px rgba(15,23,42,0.05), 0 6px 20px rgba(15,23,42,0.07)",
} as const;

const NAV = [
  { icon: "⊞", label: "Dashboard",    href: "/dashboard" },
  { icon: "◫", label: "Accounts",     href: "/dashboard/accounts" },
  { icon: "⇄", label: "Transfers",    href: "/dashboard/transfer" },
  { icon: "↔", label: "Exchange",     href: "/dashboard/exchange" },
  { icon: "≡", label: "Transactions", href: "/dashboard/transactions" },
  { icon: "▭", label: "Cards",        href: "/dashboard/cards" },
  { icon: "🛡", label: "Security",     href: "/dashboard/security" },
  { icon: "◎", label: "Settings",     href: "/dashboard/settings" },
];

const KYC_BADGE: Record<string, { label: string; color: string; bg: string }> = {
  verified:   { label: "✓ Verified",   color: "#059669", bg: "rgba(5,150,105,0.12)" },
  pending:    { label: "⏳ Pending",    color: "#D97706", bg: "rgba(217,119,6,0.12)" },
  unverified: { label: "◎ Unverified", color: "#EF4444", bg: "rgba(239,68,68,0.12)" },
};

interface Props {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
  topRight?: React.ReactNode;
}

export default function DashboardLayout({ children, title, subtitle, topRight }: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const [state,          setState]          = useState<VaulteState>(DEMO_STATE);
  const [currentUser,    setCurrentUser]    = useState<VaulteUser | null>(null);
  const [mounted,        setMounted]        = useState(false);
  const [sidebarOpen,    setSidebarOpen]    = useState(false);
  const [serverHydrated, setServerHydrated] = useState(false);
  // Persists across client-side navigations (layout never unmounts).
  // Reset to false only on logout so the next login re-fetches from the server.
  const serverHydratedRef = useRef(false);

  useEffect(() => {
    // ── Already hydrated this browser session → read from localStorage cache ──
    if (serverHydratedRef.current) {
      const user = getCurrentUser();
      if (!user) { router.push("/login"); return; }
      setCurrentUser(user);
      setState(getState());
      setMounted(true);
      setServerHydrated(true);
      return;
    }

    // ── First visit (or page refresh): fetch from Redis via session cookie ────
    async function hydrateFromServer() {
      try {
        const [sessionRes, stateRes] = await Promise.all([
          fetch("/api/auth/session"),
          fetch("/api/user/state"),
        ]);
        const sessionData = await sessionRes.json();
        const stateData   = await stateRes.json();

        if (sessionData.user) {
          // ── Server returned a valid session ─────────────────────────────
          const serverUser = sessionData.user as VaulteUser;

          // Reconcile localStorage with the server-authoritative user record
          const allUsers    = getUsers();
          const existingIdx = allUsers.findIndex(u => u.email === serverUser.email);

          if (existingIdx !== -1) {
            const oldId = allUsers[existingIdx].id;
            const newId = serverUser.id;
            // Migrate cached state blob if the local ID differs from the Redis ID
            if (oldId !== newId) {
              const oldStateRaw = localStorage.getItem(`vaulte_state_${oldId}`);
              if (oldStateRaw && !localStorage.getItem(`vaulte_state_${newId}`)) {
                localStorage.setItem(`vaulte_state_${newId}`, oldStateRaw);
              }
              localStorage.removeItem(`vaulte_state_${oldId}`);
            }
            allUsers[existingIdx] = { ...allUsers[existingIdx], ...serverUser };
          } else {
            allUsers.push(serverUser);
          }
          saveUsers(allUsers);
          saveCurrentUser(serverUser);

          // Populate banking state from Redis, or seed it if this is the first login
          if (stateData.state) {
            localStorage.setItem(
              `vaulte_state_${serverUser.id}`,
              JSON.stringify(stateData.state),
            );
          } else {
            const emptyState = createEmptyUserState(serverUser);
            localStorage.setItem(
              `vaulte_state_${serverUser.id}`,
              JSON.stringify(emptyState),
            );
            fetch("/api/user/state", {
              method:  "PUT",
              headers: { "Content-Type": "application/json" },
              body:    JSON.stringify({ state: emptyState }),
            }).catch(() => {});
          }

          serverHydratedRef.current = true;
          setCurrentUser(serverUser);
          setState(getState());
          setMounted(true);
          setServerHydrated(true);
        } else {
          // ── No server session: fall back to localStorage ─────────────────
          // Covers the demo user and any temporary network issues.
          const localUser = getCurrentUser();
          if (!localUser) {
            router.push("/login");
            return;
          }
          serverHydratedRef.current = true;
          setCurrentUser(localUser);
          setState(getState());
          setMounted(true);
          setServerHydrated(true);
        }
      } catch {
        // Network failure — fall back to localStorage so the app stays usable offline
        const user = getCurrentUser();
        if (!user) { router.push("/login"); return; }
        serverHydratedRef.current = true;
        setCurrentUser(user);
        setState(getState());
        setMounted(true);
        setServerHydrated(true);
      }
    }

    hydrateFromServer();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    if (mounted) { setState(getState()); setCurrentUser(getCurrentUser()); }
  }, [pathname, mounted]);

  useEffect(() => { setSidebarOpen(false); }, [pathname]);

  const handleLogout = async () => {
    // Invalidate the httpOnly session token in Redis
    try { await fetch("/api/auth/session", { method: "DELETE" }); } catch { /* ignore */ }
    localStorage.removeItem("vaulte_user");
    serverHydratedRef.current = false; // Force re-hydration on next login
    router.push("/login");
  };

  // ── Loading spinner shown on first visit / refresh until server hydrates ──
  if (!serverHydrated) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 44, height: 44, border: "3.5px solid #1A73E8", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite", margin: "0 auto 14px" }} />
          <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
          <p style={{ color: C.sub, fontSize: 14, fontWeight: 500 }}>Loading your account…</p>
        </div>
      </div>
    );
  }

  const totalUSD    = getTotalBalanceUSD(state);
  const user        = currentUser;
  const firstName   = user?.firstName ?? "User";
  const lastName    = user?.lastName  ?? "";
  const initials    = `${firstName[0] ?? "U"}${lastName[0] ?? ""}`.toUpperCase();
  const kycStatus   = user?.kycStatus ?? "unverified";
  const kycBadge    = KYC_BADGE[kycStatus];
  const unreadCount = mounted ? state.notifications.filter(n => !n.read).length : 0;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div style={{ height: 72, display: "flex", alignItems: "center", justifyContent: "center", borderBottom: "1px solid rgba(255,255,255,0.05)", flexShrink: 0 }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }} onClick={() => setSidebarOpen(false)}>
          <img src="/assets/logo-vaulte.png" alt="Vaulte" style={{ height: 42, width: "auto", objectFit: "contain", filter: "brightness(0) invert(1)", opacity: 0.93 }} />
        </Link>
      </div>

      {/* Menu label */}
      <div style={{ padding: "18px 20px 6px" }}>
        <span style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.18)", letterSpacing: "0.14em", textTransform: "uppercase" }}>Menu</span>
      </div>

      {/* Nav */}
      <nav style={{ padding: "0 10px", flex: "0 0 auto" }}>
        {NAV.map(item => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.label} href={item.href} style={{
              display: "flex", alignItems: "center", gap: 11,
              padding: "10px 12px", borderRadius: 12, marginBottom: 2,
              textDecoration: "none",
              background: isActive ? "rgba(26,115,232,0.14)" : "transparent",
              borderLeft: isActive ? "2.5px solid #1A73E8" : "2.5px solid transparent",
              transition: "background 0.15s",
            }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <span style={{ fontSize: 14, color: isActive ? "#fff" : "rgba(255,255,255,0.35)", lineHeight: 1 }}>{item.icon}</span>
              <span style={{ fontSize: 13.5, fontWeight: isActive ? 600 : 400, color: isActive ? "#fff" : "rgba(255,255,255,0.45)", letterSpacing: "0.01em" }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* KYC verification link — only for non-verified users */}
      {mounted && kycStatus !== "verified" && (
        <div style={{ padding: "4px 10px 0" }}>
          <Link href="/dashboard/kyc" style={{
            display: "flex", alignItems: "center", gap: 11,
            padding: "10px 12px", borderRadius: 12, textDecoration: "none",
            background: pathname === "/dashboard/kyc" ? "rgba(26,115,232,0.14)" : "rgba(239,68,68,0.07)",
            borderLeft: pathname === "/dashboard/kyc" ? "2.5px solid #1A73E8" : "2.5px solid rgba(239,68,68,0.5)",
            transition: "background 0.15s",
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(239,68,68,0.12)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = pathname === "/dashboard/kyc" ? "rgba(26,115,232,0.14)" : "rgba(239,68,68,0.07)"; }}
          >
            <span style={{ fontSize: 14, color: "#EF4444", lineHeight: 1 }}>🪪</span>
            <span style={{ fontSize: 13.5, fontWeight: 600, color: kycStatus === "pending" ? "#F59E0B" : "#EF4444", letterSpacing: "0.01em" }}>
              {kycStatus === "pending" ? "KYC Pending" : "Verify Identity"}
            </span>
            <span style={{ marginLeft: "auto", width: 7, height: 7, borderRadius: "50%", background: kycStatus === "pending" ? "#F59E0B" : "#EF4444", flexShrink: 0 }} />
          </Link>
        </div>
      )}

      {/* Notifications */}
      <div style={{ padding: "4px 10px 0" }}>
        <Link href="/dashboard/notifications" style={{
          display: "flex", alignItems: "center", gap: 11,
          padding: "10px 12px", borderRadius: 12, textDecoration: "none",
          background: pathname === "/dashboard/notifications" ? "rgba(26,115,232,0.14)" : "transparent",
          borderLeft: pathname === "/dashboard/notifications" ? "2.5px solid #1A73E8" : "2.5px solid transparent",
          transition: "background 0.15s",
        }}
          onMouseEnter={e => { if (pathname !== "/dashboard/notifications") (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
          onMouseLeave={e => { if (pathname !== "/dashboard/notifications") (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        >
          <span style={{ fontSize: 14, color: pathname === "/dashboard/notifications" ? "#fff" : "rgba(255,255,255,0.35)" }}>🔔</span>
          <span style={{ fontSize: 13.5, fontWeight: pathname === "/dashboard/notifications" ? 600 : 400, color: pathname === "/dashboard/notifications" ? "#fff" : "rgba(255,255,255,0.45)" }}>Notifications</span>
          {unreadCount > 0 && (
            <span style={{ marginLeft: "auto", minWidth: 18, height: 18, borderRadius: 9, background: "#EF4444", fontSize: 10, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>{unreadCount}</span>
          )}
        </Link>
      </div>

      {/* Divider */}
      <div style={{ margin: "14px 18px", height: 1, background: "rgba(255,255,255,0.05)", flexShrink: 0 }} />

      {/* Balance card */}
      <div style={{
        margin: "0 10px", borderRadius: 16, padding: "16px",
        background: "linear-gradient(150deg, rgba(26,115,232,0.16) 0%, rgba(15,23,42,0.35) 100%)",
        border: "1px solid rgba(26,115,232,0.18)", flex: "0 0 auto", overflow: "hidden",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 }}>
          <div>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 4 }}>Total Balance</p>
            <p style={{ fontSize: 19, fontWeight: 800, color: "#fff", letterSpacing: "-0.8px", lineHeight: 1 }}>
              ${mounted ? totalUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "0.00"}
            </p>
          </div>
          {totalUSD > 0 && (
            <div style={{ background: "rgba(74,222,128,0.1)", border: "1px solid rgba(74,222,128,0.22)", borderRadius: 8, padding: "3px 8px" }}>
              <span style={{ fontSize: 11, color: "#4ADE80", fontWeight: 700 }}>+2.1%</span>
            </div>
          )}
        </div>
        {totalUSD > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 9, marginTop: 12 }}>
            {state.accounts.map((acc, i) => (
              <div key={acc.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: i < state.accounts.length - 1 ? 9 : 0, borderBottom: i < state.accounts.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ fontSize: 12, lineHeight: 1 }}>{acc.flag}</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.38)", fontWeight: 500 }}>{acc.currency}</span>
                </div>
                <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.82)", fontWeight: 600 }}>
                  {fmtAmount(acc.balance, acc.currency, acc.symbol)}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ fontSize: 11.5, color: "rgba(255,255,255,0.35)", marginTop: 10 }}>Complete KYC to activate your account</p>
        )}
      </div>

      {/* Sign out */}
      <div style={{ padding: "12px 10px 16px", flexShrink: 0 }}>
        <button onClick={handleLogout} style={{
          display: "flex", alignItems: "center", gap: 9, width: "100%",
          padding: "10px 14px", borderRadius: 12, background: "transparent",
          border: "1px solid rgba(255,255,255,0.07)", color: "rgba(255,255,255,0.3)",
          fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.18s",
        }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.05)"; el.style.color = "rgba(255,255,255,0.6)"; el.style.borderColor = "rgba(255,255,255,0.12)"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "transparent"; el.style.color = "rgba(255,255,255,0.3)"; el.style.borderColor = "rgba(255,255,255,0.07)"; }}
        >
          <span style={{ fontSize: 14, opacity: 0.55 }}>⎋</span>
          <span>Sign out</span>
        </button>
      </div>
    </>
  );

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>

      {/* ═══════════ DESKTOP SIDEBAR ═══════════ */}
      <aside className="vaulte-sidebar" style={{
        width: 236, background: C.navy, position: "fixed", top: 0, left: 0,
        height: "100vh", display: "flex", flexDirection: "column",
        zIndex: 100, boxShadow: "2px 0 32px rgba(15,23,42,0.2)", overflowY: "auto",
      }}>
        <SidebarContent />
      </aside>

      {/* ═══════════ MOBILE OVERLAY ═══════════ */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 149, display: "none" }}
          className="vaulte-overlay"
        />
      )}

      {/* ═══════════ MOBILE DRAWER ═══════════ */}
      <aside className="vaulte-mobile-sidebar" style={{
        width: 260, background: C.navy, position: "fixed", top: 0, left: 0,
        height: "100vh", display: "flex", flexDirection: "column",
        zIndex: 150, boxShadow: "2px 0 32px rgba(15,23,42,0.3)",
        transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
        transition: "transform 0.28s cubic-bezier(0.4,0,0.2,1)", overflowY: "auto",
      }}>
        <SidebarContent />
      </aside>

      {/* ═══════════ MAIN ═══════════ */}
      <div className="vaulte-main" style={{ flex: 1, marginLeft: 236, display: "flex", flexDirection: "column", minHeight: "100vh" }}>

        {/* Topbar */}
        <header className="vaulte-topbar" style={{
          background: "#fff", borderBottom: `1px solid ${C.border}`,
          padding: "0 32px", height: 72,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          position: "sticky", top: 0, zIndex: 50, boxShadow: "0 1px 0 rgba(15,23,42,0.06)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {/* Mobile hamburger */}
            <button className="vaulte-hamburger"
              onClick={() => setSidebarOpen(v => !v)}
              style={{ display: "none", width: 38, height: 38, borderRadius: 10, background: "transparent", border: `1px solid ${C.border}`, cursor: "pointer", fontSize: 18, alignItems: "center", justifyContent: "center", flexShrink: 0 }}
            >☰</button>

            <div>
              <p style={{ fontSize: 16, fontWeight: 700, color: C.text, letterSpacing: "-0.2px", lineHeight: 1.2 }}>{title}</p>
              {subtitle && <p style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{subtitle}</p>}
            </div>

            {/* Search — hidden on small screens */}
            <div className="vaulte-search" style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 1, height: 28, background: C.border }} />
              <div style={{ position: "relative", width: 224 }}>
                <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", fontSize: 12, color: C.muted, pointerEvents: "none" }}>⌕</span>
                <input placeholder="Search transactions, accounts…" style={{
                  width: "100%", padding: "9px 14px 9px 34px", borderRadius: 12,
                  border: `1.5px solid ${C.border}`, fontSize: 12.5, color: C.text,
                  background: C.bg, outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                  transition: "border-color 0.18s, box-shadow 0.18s, background 0.18s",
                }}
                  onFocus={e => { e.target.style.borderColor = C.blue; e.target.style.background = "#fff"; e.target.style.boxShadow = "0 0 0 3px rgba(26,115,232,0.08)"; }}
                  onBlur={e => { e.target.style.borderColor = C.border; e.target.style.background = C.bg; e.target.style.boxShadow = "none"; }}
                />
              </div>
            </div>
          </div>

          {/* Right */}
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {topRight}

            {/* Bell with badge */}
            <Link href="/dashboard/notifications" style={{
              width: 38, height: 38, borderRadius: 10, background: "transparent",
              border: `1px solid ${C.border}`, fontSize: 14,
              display: "flex", alignItems: "center", justifyContent: "center",
              position: "relative", transition: "background 0.15s", textDecoration: "none",
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              🔔
              {unreadCount > 0 && (
                <span style={{ position: "absolute", top: 6, right: 6, minWidth: 14, height: 14, background: "#EF4444", borderRadius: 7, fontSize: 9, fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid #fff", padding: "0 3px" }}>
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </Link>

            <Link href="/dashboard/settings" style={{ width: 38, height: 38, borderRadius: 10, background: "transparent", border: `1px solid ${C.border}`, fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none", transition: "background 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >⚙️</Link>

            <div style={{ width: 1, height: 28, background: C.border, margin: "0 2px" }} />

            {/* Profile pill */}
            <div style={{ display: "flex", alignItems: "center", gap: 9, padding: "5px 12px 5px 5px", borderRadius: 40, border: `1px solid ${C.border}`, cursor: "pointer", transition: "background 0.15s" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.bg; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              <div style={{ width: 32, height: 32, borderRadius: "50%", background: "linear-gradient(135deg,#1A73E8,#1558b0)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", boxShadow: "0 0 0 2px rgba(26,115,232,0.18)", flexShrink: 0 }}>{initials}</div>
              <div className="vaulte-profile-name" style={{ lineHeight: 1 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: C.text, letterSpacing: "-0.1px" }}>{firstName} {lastName}</p>
                <p style={{ fontSize: 11, fontWeight: 600, marginTop: 2, color: kycBadge.color }}>{kycBadge.label}</p>
              </div>
              <span className="vaulte-profile-name" style={{ fontSize: 10, color: C.muted, marginLeft: 2 }}>▾</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="vaulte-main-content" style={{ flex: 1, padding: "28px 32px 40px" }}>
          {children}
        </main>
      </div>

      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input::placeholder { color: #94A3B8; }
        textarea::placeholder { color: #94A3B8; }
        ::-webkit-scrollbar { width: 4px; height: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(15,23,42,0.1); border-radius: 99px; }
        @keyframes slideIn { from { opacity:0; transform: translateX(20px); } to { opacity:1; transform: translateX(0); } }
        @keyframes fadeIn  { from { opacity:0; transform: translateY(8px); }  to { opacity:1; transform: translateY(0); } }

        @media (max-width: 900px) {
          .vaulte-search { display: none !important; }
          .vaulte-profile-name { display: none !important; }
        }
        @media (max-width: 768px) {
          .vaulte-sidebar { display: none !important; }
          .vaulte-main { margin-left: 0 !important; }
          .vaulte-hamburger { display: flex !important; }
          .vaulte-overlay { display: block !important; }
          .vaulte-topbar { padding: 0 16px !important; }
          .vaulte-main-content { padding: 16px 16px 32px !important; }
        }
      `}</style>
    </div>
  );
}
