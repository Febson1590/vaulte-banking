"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { getCurrentUser } from "@/lib/vaulteState";

/**
 * TawkToChat
 * ──────────
 * Headless Tawk.to integration.  We render NO custom UI — Tawk's own widget
 * (configured in the Tawk dashboard: colour, avatar, welcome message,
 * pre-chat form, suggested replies) is what visitors see.  This component
 * just:
 *
 *   1. Loads the Tawk script with the right property/widget IDs.
 *   2. Pre-fills the visitor's name + email when the user is logged in,
 *      before the script initialises (Tawk reads window.Tawk_API.visitor
 *      exactly once on init).
 *   3. Tags the chat with customer / prospect / KYC status after init so
 *      the agent can triage at a glance in the Tawk inbox.
 *   4. Hides the launcher on auth / KYC capture paths where it would cover
 *      important UI — done via api.hideWidget() so the script stays alive
 *      and an in-flight conversation isn't reset on every navigation.
 *
 * Why no custom launcher anymore?
 *   The previous version painted a green circle on top of Tawk's own
 *   widget.  Once the operator configured the Tawk widget colour + Vaulte
 *   logo through the Tawk dashboard wizard, the custom overlay became
 *   redundant — and it covered the real, branded Tawk launcher.  Removing
 *   it means the colour you pick in the Tawk admin is what visitors see,
 *   instantly, without code changes.
 */

// Public Tawk.to identifiers — safe to ship in the bundle, they identify
// the widget the same way a CSS class does.  NEXT_PUBLIC_* env vars
// override these so we can switch staging / production accounts without a
// code change.
const TAWK_PROPERTY_ID =
  process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || "69fd676da11ae21c341a171b";
const TAWK_WIDGET_ID =
  process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || "1jo2to0tt";

// Pages where the chat launcher gets in the way more than it helps.  Tawk's
// hideWidget() is called on entry to these paths and showWidget() when the
// user navigates away.
const HIDE_ON_PATHS = [
  "/admin/login",
  "/verify-email",
  "/login-verify",
  "/forgot-password",
  "/reset-password",
  "/dashboard/kyc",
];

function shouldHide(pathname: string | null): boolean {
  if (!pathname) return false;
  return HIDE_ON_PATHS.some(p => pathname === p || pathname.startsWith(p + "/"));
}

// ── Minimal Tawk.to API type shim ───────────────────────────────────────────
interface TawkAPI {
  hideWidget?:           () => void;
  showWidget?:           () => void;
  maximize?:             () => void;
  minimize?:             () => void;
  addTags?:              (tags: string[], cb: (err?: unknown) => void) => void;
  setAttributes?:        (attrs: Record<string, string>, cb: (err?: unknown) => void) => void;
  visitor?:              { name?: string; email?: string };
}

type WindowWithTawk = Window & { Tawk_API?: TawkAPI };

export default function TawkToChat() {
  const pathname = usePathname();

  // ── Load the Tawk script + wire up identity + tags (runs once) ───────────
  useEffect(() => {
    // Build the Tawk_API object BEFORE the script loads.  Tawk reads
    // .visitor exactly once on init — setting it later does nothing.
    const tawkApi: TawkAPI = (window as WindowWithTawk).Tawk_API ?? {};
    const tags: string[] = [];

    try {
      const user = getCurrentUser();
      if (user) {
        const fullName = [user.firstName, user.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();
        tawkApi.visitor = {
          name:  fullName || user.email,
          email: user.email,
        };
        tags.push("customer");
        if (user.kycStatus === "verified")   tags.push("kyc-verified");
        if (user.kycStatus === "pending")    tags.push("kyc-pending");
        if (user.kycStatus === "unverified") tags.push("kyc-unverified");
      } else {
        tags.push("prospect");
      }
    } catch {
      // localStorage / SSR edge cases — never block the widget over identity.
      tags.push("prospect");
    }

    (window as WindowWithTawk).Tawk_API = tawkApi;

    // ── Mobile visibility boost ────────────────────────────────────────────
    //
    // Tawk's default mobile launcher is ~48 px and can blend into the page
    // on busy backgrounds.  This stylesheet:
    //   • Forces a minimum tap target of 64 × 64 px on phones (Apple's
    //     accessibility minimum is 44 px; we go larger for confidence).
    //   • Lifts the launcher above iOS Safari's bottom toolbar so it
    //     doesn't get hidden when the toolbar slides into view.
    //   • Adds a subtle drop shadow so the bubble pops on white pages.
    //
    // Tawk renders into iframes whose titles include "chat widget" — those
    // are stable across Tawk releases and what their docs recommend
    // targeting from outside.
    const sizeBoost = document.createElement("style");
    sizeBoost.id = "vaulte-tawk-size-boost";
    sizeBoost.textContent = `
      /* Selector matches Tawk's launcher iframe (the small bubble) but NOT
         the chat-window iframe (which is much wider).  Tawk's own scripts
         set inline styles, so we rely on !important. */
      iframe[title*="chat widget"] {
        min-width:  64px !important;
        min-height: 64px !important;
        filter: drop-shadow(0 6px 18px rgba(15,23,42,0.22)) !important;
      }

      @media (max-width: 768px) {
        iframe[title*="chat widget"] {
          /* Lift above iOS Safari's home indicator + bottom toolbar */
          bottom: max(16px, env(safe-area-inset-bottom)) !important;
        }
      }
    `;
    document.head.appendChild(sizeBoost);

    // Inject the script
    const s1 = document.createElement("script");
    s1.async   = true;
    s1.src     = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    document.head.appendChild(s1);

    // Apply tags once the API is live.  Tawk doesn't fire a single onLoad
    // event we can hook reliably — polling is the standard idiom in their
    // docs and finishes within ~300 ms in practice.
    const pollInterval = setInterval(() => {
      const api = (window as WindowWithTawk).Tawk_API;
      if (api && typeof api.addTags === "function") {
        clearInterval(pollInterval);
        if (tags.length > 0) {
          api.addTags(tags, () => { /* swallow errors silently */ });
        }
      }
    }, 300);

    // Stop polling after 15 s if Tawk never loads (network failure, blocker
    // extension, etc.) so we don't leak the interval forever.
    const stopPolling = window.setTimeout(() => clearInterval(pollInterval), 15_000);

    return () => {
      clearInterval(pollInterval);
      window.clearTimeout(stopPolling);
      try { document.head.removeChild(s1); } catch { /* ignore */ }
      const sb = document.getElementById("vaulte-tawk-size-boost");
      if (sb) try { document.head.removeChild(sb); } catch { /* ignore */ }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Show / hide the widget based on the current path ─────────────────────
  useEffect(() => {
    const api = (window as WindowWithTawk).Tawk_API;
    if (!api) return;

    const hide = shouldHide(pathname);

    // Tawk loads asynchronously, so api.hideWidget may not be a function yet
    // on the very first render after a fresh visit.  Retry briefly.
    const attempt = (tries: number): void => {
      const live = (window as WindowWithTawk).Tawk_API;
      const fn   = hide ? live?.hideWidget : live?.showWidget;
      if (typeof fn === "function") { fn(); return; }
      if (tries < 30) setTimeout(() => attempt(tries + 1), 300);
    };
    attempt(0);
  }, [pathname]);

  // No JSX — Tawk renders its own widget directly into <body>.
  return null;
}
