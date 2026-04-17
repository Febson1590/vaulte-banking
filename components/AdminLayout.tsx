'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';

const navItems = [
  { icon: '🏠', label: 'Dashboard',    href: '/admin/dashboard' },
  { icon: '👥', label: 'Users',        href: '/admin/users' },
  { icon: '🪪', label: 'KYC',          href: '/admin/kyc' },
  { icon: '💸', label: 'Transactions', href: '/admin/transactions' },
  { icon: '🏦', label: 'Accounts',     href: '/admin/accounts' },
  { icon: '✅', label: 'Approvals',    href: '/admin/approvals' },
  { icon: '📊', label: 'Reports',      href: '/admin/reports' },
  { icon: '⚙️', label: 'Settings',     href: '/admin/settings' },
  { icon: '📋', label: 'Audit Logs',   href: '/admin/audit-logs' },
  { icon: '🔧', label: 'TX Generator', href: '/admin/transaction-generator' },
];

export default function AdminLayout({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  /**
   * `expanded` controls the *desktop* behavior: a regular fixed sidebar that
   * can be collapsed to an icon-only rail (240px ↔ 64px).
   * `mobileOpen` is a separate state for the *mobile* slide-over drawer.
   * Keeping them separate stops the "drawer won't close" bug that happens
   * when one boolean tries to serve both purposes.
   */
  const [expanded, setExpanded]     = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close the mobile drawer whenever the route changes
  useEffect(() => { setMobileOpen(false); }, [pathname]);

  // Lock body scroll while the mobile drawer is open
  useEffect(() => {
    if (typeof document === 'undefined') return;
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    localStorage.removeItem('vaulte_admin');
    router.push('/admin/login');
  };

  const showLabels = expanded || mobileOpen;

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        fontFamily: 'Inter, sans-serif',
        background: '#F1F5F9',
      }}
    >
      {/* Mobile backdrop */}
      <div
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(10,22,40,0.55)',
          zIndex: 98,
          opacity: mobileOpen ? 1 : 0,
          pointerEvents: mobileOpen ? 'auto' : 'none',
          transition: 'opacity 0.2s ease',
        }}
        className="admin-mobile-backdrop"
      />

      {/* Sidebar */}
      <aside
        className="admin-sidebar"
        style={{
          width: expanded ? '240px' : '64px',
          background: '#0A1628',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.3s, transform 0.25s',
          flexShrink: 0,
          position: 'sticky',
          top: 0,
          height: '100vh',
          overflowY: 'auto',
          overflowX: 'hidden',
          zIndex: 99,
        }}
      >
        <div
          style={{
            padding: '20px 16px',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <div
            style={{
              background: 'rgba(255,255,255,0.1)',
              borderRadius: '8px',
              padding: '6px 10px',
              flexShrink: 0,
            }}
          >
            <Image
              src="/logo.png"
              alt="Vaulte"
              width={70}
              height={20}
              style={{ objectFit: 'contain' }}
            />
          </div>
          {showLabels && (
            <div
              style={{
                fontSize: '10px',
                color: '#FFC107',
                fontWeight: 700,
                letterSpacing: '1px',
                whiteSpace: 'nowrap',
              }}
            >
              ADMIN PANEL
            </div>
          )}
        </div>

        <nav style={{ flex: 1, padding: '16px 8px' }}>
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 12px',
                  borderRadius: '10px',
                  marginBottom: '4px',
                  background: active ? 'rgba(26,115,232,0.2)' : 'transparent',
                  borderLeft: active ? '3px solid #1A73E8' : '3px solid transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  fontSize: '14px',
                  fontWeight: active ? 600 : 400,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                <span style={{ fontSize: '18px', flexShrink: 0 }}>
                  {item.icon}
                </span>
                {showLabels && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            padding: '16px 8px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.6)',
              cursor: 'pointer',
              width: '100%',
              fontSize: '14px',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ fontSize: '18px', flexShrink: 0 }}>🚪</span>
            {showLabels && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div
        className="admin-main"
        style={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <header
          className="admin-header"
          style={{
            background: '#fff',
            borderBottom: '1px solid #E5E7EB',
            padding: '0 24px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
            {/* Desktop: toggles the rail 240px <-> 64px.
                Mobile (<=768): same button becomes the drawer toggle via CSS
                (no JS change — we piggy-back on a click handler that does both). */}
            <button
              className="admin-menu-btn"
              onClick={() => {
                // On mobile, open the drawer; on desktop, collapse the rail.
                // Use matchMedia so this works without layout shift.
                if (typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
                  setMobileOpen(v => !v);
                } else {
                  setExpanded(v => !v);
                }
              }}
              aria-label="Toggle menu"
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '20px',
                color: '#6B7280',
                padding: 0,
                width: 40,
                height: 40,
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              ☰
            </button>
            <span
              className="admin-title"
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#0A1628',
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {title}
            </span>
          </div>
          <div
            className="admin-header-right"
            style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}
          >
            <div
              className="admin-alerts"
              style={{
                background: '#FEF2F2',
                color: '#DC2626',
                borderRadius: '20px',
                padding: '4px 12px',
                fontSize: '12px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
              }}
            >
              🔴 3 Alerts
            </div>
            <div
              className="admin-header-user"
              style={{
                background: '#EEF4FF',
                borderRadius: '8px',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#1A73E8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: '12px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >
                SA
              </div>
              <div className="admin-header-user-info">
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#0A1628',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Super Admin
                </div>
                <div style={{ fontSize: '11px', color: '#6B7280', whiteSpace: 'nowrap' }}>
                  admin@vaulte.com
                </div>
              </div>
            </div>
          </div>
        </header>

        <main
          className="admin-content"
          style={{ flex: 1, padding: '28px 24px', minWidth: 0 }}
        >
          {children}
        </main>
      </div>

      <style>{`
        /* Global table / wide-grid safety net inside admin pages */
        .admin-content table { width: 100%; border-collapse: collapse; }
        .admin-content .scroll-x,
        .admin-content .table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; }

        /* ───────── Tablet (<= 1024) — shrink chrome ─────────────────────── */
        @media (max-width: 1024px) {
          .admin-header { padding: 0 16px !important; }
          .admin-content { padding: 22px 16px !important; }
        }

        /* ───────── Mobile (<= 768) — sidebar becomes a slide-in drawer ──── */
        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed !important;
            top: 0; left: 0;
            width: 260px !important;
            height: 100vh !important;
            transform: translateX(-100%);
            transition: transform 0.25s ease !important;
            box-shadow: 2px 0 32px rgba(10,22,40,0.25);
            z-index: 100;
          }
          .admin-sidebar.open { transform: translateX(0); }
          .admin-header { height: 56px !important; padding: 0 14px !important; gap: 8px; }
          .admin-title { font-size: 15px !important; }
          .admin-content { padding: 16px 14px 28px !important; }
          .admin-alerts { font-size: 11px !important; padding: 3px 10px !important; }
          .admin-header-user-info { display: none !important; }
          .admin-header-user { padding: 4px 6px !important; background: transparent !important; }

          /* Any <table> inside an admin page becomes horizontally-scrollable on
             mobile so wide columns never force the page to overflow. */
          .admin-content table {
            display: block;
            overflow-x: auto;
            -webkit-overflow-scrolling: touch;
            white-space: nowrap;
          }
        }

        /* ───────── Small phones (<= 420) — extra compact ─────────────────── */
        @media (max-width: 420px) {
          .admin-alerts { display: none !important; }
          .admin-header { padding: 0 10px !important; }
          .admin-content { padding: 14px 12px 24px !important; }
        }
      `}</style>

      {/* Apply drawer-open class via a hidden helper so we don't duplicate style */}
      <style>{mobileOpen ? `@media (max-width: 768px) { .admin-sidebar { transform: translateX(0) !important; } }` : ''}</style>
    </div>
  );
}
