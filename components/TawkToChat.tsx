"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getCurrentUser } from "@/lib/vaulteState";

/**
 * TawkToChat
 * ──────────
 * Headless Tawk.to integration.  We render NO custom UI — Tawk's own widget
 * (configured in the Tawk dashboard: colour, avatar, welcome message,
 * pre-chat form, suggested replies) is what visitors see.  This component:
 *
 *   1. Loads the Tawk script ONCE (idempotent — protected against React
 *      strict-mode double-effects, hot-reload, and accidental remounts).
 *   2. Pre-fills the visitor's name + email when the user is logged in,
 *      before the script initialises (Tawk reads window.Tawk_API.visitor
 *      exactly once on init).
 *   3. Tags the chat with customer / prospect / KYC status via the
 *      Tawk_API.onLoad callback so we know the API is fully live.
 *   4. Hides the launcher on auth / KYC capture paths via api.hideWidget()
 *      so the script stays alive and an in-flight conversation isn't
 *      reset on every navigation.
 *
 * Why no custom launcher?
 *   The Tawk dashboard already controls the launcher's colour, avatar,
 *   welcome message, and behaviour.  Painting a custom button on top
 *   creates two competing click targets and (as we found) blocks Tawk's
 *   real launcher entirely.
 */

// Public Tawk.to identifiers — safe to ship in the bundle, they identify
// the widget the same way a CSS class does.  NEXT_PUBLIC_* env vars
// override these so we can switch staging / production accounts without
// a code change.
const TAWK_PROPERTY_ID =
  process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || "69fd676da11ae21c341a171b";
const TAWK_WIDGET_ID =
  process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || "1jo2to0tt";

// DOM IDs we own — used to guarantee idempotent injection.
const SCRIPT_ID = "vaulte-tawk-script";
const STYLE_ID  = "vaulte-tawk-size-boost";

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
  onLoad?:               () => void;
  onChatMaximized?:      () => void;
  onChatMinimized?:      () => void;
}

type WindowWithTawk = Window & { Tawk_API?: TawkAPI; Tawk_LoadStart?: Date };

export default function TawkToChat() {
  const pathname = usePathname();
  // Stash tags + the latest pathname in refs so onLoad (which captures
  // the closure of the FIRST render) always sees current values.  This
  // is the canonical "ref to latest" pattern for async callbacks.
  const pendingTagsRef = useRef<string[]>([]);
  const pathnameRef    = useRef<string | null>(pathname);
  pathnameRef.current  = pathname;

  // ── Load the Tawk script + wire up identity (runs once globally) ─────────
  useEffect(() => {
    // ── Idempotent guard ─────────────────────────────────────────────────
    // If our script tag already exists in the document, don't re-inject.
    // This protects against React strict-mode double effects and
    // accidental remounts.
    if (document.getElementById(SCRIPT_ID)) return;

    // ── Build window.Tawk_API BEFORE the script loads ────────────────────
    // Tawk reads .visitor exactly once during init, and binds .onLoad to
    // the post-init callback.  Setting either after the script loads is
    // a no-op.
    const w = window as WindowWithTawk;
    const tawkApi: TawkAPI = w.Tawk_API ?? {};
    w.Tawk_LoadStart = new Date();

    // Visitor identity (name + email) for logged-in customers.
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
    pendingTagsRef.current = tags;

    // Apply tags + sync visibility the moment the widget is fully live.
    // Tawk_API.onLoad is the canonical "ready" hook from their docs.
    //
    // CRITICAL: this is also where we re-assert the show/hide state.
    // The path-change useEffect below polls for the API but gives up
    // after ~9 s — on slow mobile networks Tawk sometimes loads later
    // than that, leading to "the chat icon doesn't appear after a
    // refresh" reports.  Reading pathnameRef inside onLoad guarantees
    // the visibility is correct as soon as the API is callable, no
    // matter how long the script took to download.
    tawkApi.onLoad = () => {
      const live = (window as WindowWithTawk).Tawk_API;
      if (!live) return;
      // eslint-disable-next-line no-console
      console.log("[Tawk] widget ready");

      // Always start minimized — only open when the user clicks the launcher.
      if (typeof live.minimize === "function") live.minimize();

      // Tags
      if (pendingTagsRef.current.length && typeof live.addTags === "function") {
        live.addTags(pendingTagsRef.current, () => { /* swallow */ });
        pendingTagsRef.current = [];
      }

      // Visibility — Tawk shows the launcher by default, so this is
      // only meaningful for the HIDE_ON_PATHS case, but we call it
      // unconditionally so any state Tawk might have cached
      // server-side / in localStorage is overridden by what the
      // current path expects.
      const hideNow = shouldHide(pathnameRef.current);
      if (hideNow && typeof live.hideWidget === "function") {
        live.hideWidget();
      } else if (!hideNow && typeof live.showWidget === "function") {
        live.showWidget();
      }
    };

    w.Tawk_API = tawkApi;

    // ── Mobile visibility / shadow polish ────────────────────────────────
    // Boost the launcher to a confident 64 × 64 tap target on mobile and
    // lift it above the iOS home indicator.  Style tag has its own ID so
    // we can detect duplicates.
    if (!document.getElementById(STYLE_ID)) {
      const sizeBoost = document.createElement("style");
      sizeBoost.id = STYLE_ID;
      sizeBoost.textContent = `
        /* Selector matches Tawk's launcher iframe (the small bubble) but NOT
           the chat-window iframe (which is much wider).  Tawk's own scripts
           set inline styles, so we rely on !important. */
        iframe[title*="chat widget"] {
          min-width:  64px !important;
          min-height: 64px !important;
          filter:     drop-shadow(0 6px 18px rgba(15,23,42,0.22)) !important;
          /* Tawk's launcher must always sit above any other floating UI.
             2147483600 is comfortably above the 2147483000 default while
             still inside the 32-bit signed integer range. */
          z-index:    2147483600 !important;
          /* Belt-and-suspenders: explicitly enable pointer events in case
             a global rule (aria-hidden, etc.) ever tries to disable them. */
          pointer-events: auto !important;
        }
        iframe[title*="chat window"] {
          z-index: 2147483600 !important;
        }
        @media (max-width: 768px) {
          iframe[title*="chat widget"] {
            bottom: max(16px, env(safe-area-inset-bottom)) !important;
          }
        }
      `;
      document.head.appendChild(sizeBoost);
    }

    // ── Inject the actual Tawk script ────────────────────────────────────
    // Use the Tawk-recommended insertBefore-the-first-script pattern so
    // the loader is queued before any other async script that might race.
    const s1 = document.createElement("script");
    s1.id      = SCRIPT_ID;
    s1.async   = true;
    s1.src     = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");

    s1.onerror = () => {
      // eslint-disable-next-line no-console
      console.warn("[Tawk] script failed to load — chat will be unavailable.");
    };

    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript && firstScript.parentNode) {
      firstScript.parentNode.insertBefore(s1, firstScript);
    } else {
      document.head.appendChild(s1);
    }

    // ── Fallback poll for tags ────────────────────────────────────────────
    // If onLoad never fires (e.g. Tawk's own callback wiring fails on
    // certain network conditions), this poll is a safety net that still
    // applies the tags within ~3 s of the API becoming queryable.
    const pollInterval = setInterval(() => {
      const live = (window as WindowWithTawk).Tawk_API;
      if (live && typeof live.addTags === "function" && pendingTagsRef.current.length) {
        clearInterval(pollInterval);
        live.addTags(pendingTagsRef.current, () => { /* swallow */ });
        pendingTagsRef.current = [];
      }
    }, 500);
    // Stop after 15 s.  After this point the API is either live (tags
    // already applied) or the script truly failed and there's nothing to do.
    const stopPolling = window.setTimeout(() => clearInterval(pollInterval), 15_000);

    // ── Cleanup ──────────────────────────────────────────────────────────
    // We deliberately DON'T remove the Tawk script tag in cleanup.  This
    // component is mounted in the root layout, so it shouldn't unmount
    // during normal navigation.  If it does (e.g. React DevTools, a hot
    // reload), tearing down the script would also lose any in-flight
    // chat — much worse than leaving the script attached.
    return () => {
      clearInterval(pollInterval);
      window.clearTimeout(stopPolling);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Show / hide the widget based on the current path ─────────────────────
  // This effect handles client-side route changes after Tawk is already
  // live.  The first-paint case (Tawk not loaded yet) is handled inside
  // the onLoad hook above — it reads the current pathname from the ref
  // and applies the right visibility regardless of how slowly the
  // script downloaded.
  useEffect(() => {
    const hide = shouldHide(pathname);

    // Tawk loads asynchronously.  Poll briefly for cases where the
    // client-side navigation arrives before the script.  We give up
    // after ~30 s (100 × 300 ms) — that's enough for any reasonable
    // mobile network; if the script truly failed to load, onerror has
    // already logged it and there's nothing to call anyway.
    let cancelled = false;
    const attempt = (tries: number): void => {
      if (cancelled) return;
      const live = (window as WindowWithTawk).Tawk_API;
      const fn   = hide ? live?.hideWidget : live?.showWidget;
      if (typeof fn === "function") { fn(); return; }
      if (tries < 100) setTimeout(() => attempt(tries + 1), 300);
    };
    attempt(0);
    return () => { cancelled = true; };
  }, [pathname]);

  // No JSX — Tawk renders its own widget directly into <body>.
  return null;
}
