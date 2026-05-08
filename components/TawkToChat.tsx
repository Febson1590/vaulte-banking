"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { getCurrentUser } from "@/lib/vaulteState";

// Public Tawk.to identifiers — safe to ship in the bundle, they identify the
// widget the same way a CSS class does.  NEXT_PUBLIC_* env vars override
// these at build time so we can switch staging / production accounts without
// a code change.
const TAWK_PROPERTY_ID =
  process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || "69fd676da11ae21c341a171b";
const TAWK_WIDGET_ID =
  process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || "1jo2to0tt";

// Pages where the chat launcher is more distraction than help.  The widget
// stays mounted but is visually hidden so SDK state isn't reset on navigation.
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

export default function TawkToChat() {
  const pathname = usePathname();

  // ── Tawk.to state ──────────────────────────────────────────────────────────
  const [chatOpen,  setChatOpen]  = useState(false);
  const [tawkReady, setTawkReady] = useState(false);
  const [unread,    setUnread]    = useState(0);
  const [hovered,   setHovered]   = useState(false);

  // ── Load Tawk.to script and hide their default launcher ───────────────────
  useEffect(() => {
    // Suppress Tawk's built-in launcher bubble so only our custom button shows.
    //
    // Rules applied:
    //  • display:none        — removes the element from layout and touch flow
    //  • pointer-events:none — belt-and-suspenders: if a future Tawk.to release
    //    removes display:none from one of these containers, it still can't
    //    intercept touch/scroll events on mobile and cause scroll freezing.
    //
    // We deliberately do NOT hide the chat-window iframe (the large panel that
    // appears when api.maximize() is called) — that must remain visible so the
    // conversation is actually usable after the user clicks our custom button.
    const styleTag = document.createElement("style");
    styleTag.id = "vaulte-tawk-hide";
    styleTag.textContent = `
      #tawk-bubble-container,
      .tawk-min-container,
      .tawk-button-circle,
      .tawk-branding,
      iframe[title*="chat button"],
      iframe[title*="chat widget"] {
        display:        none !important;
        pointer-events: none !important;
      }
    `;
    document.head.appendChild(styleTag);

    // ── Pre-fill visitor identity BEFORE the Tawk script loads ──────────────
    //
    // Tawk reads window.Tawk_API.visitor exactly once on init and uses it to
    // pre-populate the pre-chat form (name + email).  Setting it after the
    // widget has loaded is a no-op, so this MUST happen before s1 is appended.
    //
    // We also stash a list of tags that we'll apply once the API is ready —
    // tags can't be added before init, so they're handled in the poll loop
    // below.
    const tawkApi = (window as Window & { Tawk_API?: TawkAPI }).Tawk_API ?? {};
    const tags: string[] = [];

    try {
      const user = getCurrentUser();
      if (user) {
        // Logged-in customer — pre-fill name + email so the agent sees who's
        // chatting in the Tawk inbox instead of "Visitor 12345".
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
        (tawkApi as { visitor?: { name?: string; email?: string } }).visitor = {
          name:  fullName || user.email,
          email: user.email,
        };
        tags.push("customer");
        if (user.kycStatus === "verified")  tags.push("kyc-verified");
        if (user.kycStatus === "pending")   tags.push("kyc-pending");
        if (user.kycStatus === "unverified") tags.push("kyc-unverified");
      } else {
        // Anonymous visitor on the marketing pages.
        tags.push("prospect");
      }
    } catch {
      // localStorage / SSR edge cases — don't block widget load over identity.
      tags.push("prospect");
    }

    (window as Window & { Tawk_API?: TawkAPI }).Tawk_API = tawkApi as TawkAPI;

    // Inject Tawk.to script
    const s1 = document.createElement("script");
    s1.async = true;
    s1.src = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    document.head.appendChild(s1);

    // Hook Tawk.to API events once it's ready
    const pollInterval = setInterval(() => {
      if (typeof (window as Window & { Tawk_API?: TawkAPI }).Tawk_API?.hideWidget === "function") {
        clearInterval(pollInterval);
        const api = (window as Window & { Tawk_API?: TawkAPI }).Tawk_API!;
        api.hideWidget();
        setTawkReady(true);
        api.onChatMaximized      = () => setChatOpen(true);
        api.onChatMinimized      = () => setChatOpen(false);
        api.onUnreadCountChanged = (count: number) => setUnread(count);

        // Apply the tags we collected before the script loaded.  Tags show up
        // in the Tawk inbox so the agent can triage at a glance: customers
        // with "kyc-verified" can be answered immediately, "prospect" tags
        // signal a sales-style conversation, etc.
        if (tags.length > 0 && typeof api.addTags === "function") {
          api.addTags(tags, () => { /* swallow errors silently */ });
        }

        // JS-level touch isolation — belt-and-suspenders alongside the CSS rules.
        //
        // Even with display:none + pointer-events:none in the <style> tag above,
        // Tawk.to sometimes injects new DOM nodes AFTER the style is evaluated,
        // or uses selectors our CSS doesn't match yet.  We programmatically stamp
        // pointer-events:none (and touch-action:none as a second guard) on every
        // Tawk.to root container so no injected element can intercept a vertical
        // scroll gesture and route it away from the document body.
        //
        // We deliberately SKIP the chat-window iframe (the large panel opened by
        // api.maximize()) — that must remain interactive so the user can type.
        const TAWK_LAUNCHER_SELECTORS = [
          "#tawk-bubble-container",
          ".tawk-min-container",
          ".tawk-button-circle",
          ".tawk-branding",
        ] as const;

        function isolateTawkLaunchers(): void {
          TAWK_LAUNCHER_SELECTORS.forEach(sel => {
            document.querySelectorAll<HTMLElement>(sel).forEach(el => {
              el.style.pointerEvents = "none";
              el.style.touchAction   = "none";
            });
          });
          // Also stamp all Tawk.to iframes that are the launcher / widget button
          // (not the chat-window panel — that one has title "Tawk.to Live Chat").
          document.querySelectorAll<HTMLIFrameElement>("iframe").forEach(iframe => {
            const t = (iframe.title ?? "").toLowerCase();
            if ((t.includes("chat") && (t.includes("button") || t.includes("widget")))
                || t.includes("tawk")) {
              // Only isolate if it is NOT the open chat-window panel
              if (!t.includes("live chat") && !t.includes("chat window")) {
                iframe.style.pointerEvents = "none";
                iframe.style.touchAction   = "none";
              }
            }
          });
        }

        // Run once immediately, then re-run whenever Tawk.to re-injects elements
        isolateTawkLaunchers();
        const tawkObserver = new MutationObserver(isolateTawkLaunchers);
        tawkObserver.observe(document.body, { childList: true, subtree: true });

        // Store observer reference on the window so cleanup can stop it
        (window as Window & { _vaulteTawkObserver?: MutationObserver })._vaulteTawkObserver = tawkObserver;
      }
    }, 300);

    return () => {
      clearInterval(pollInterval);
      // Disconnect the DOM observer that stamps pointer-events:none on launchers
      const obs = (window as Window & { _vaulteTawkObserver?: MutationObserver })._vaulteTawkObserver;
      if (obs) { obs.disconnect(); delete (window as Window & { _vaulteTawkObserver?: MutationObserver })._vaulteTawkObserver; }
      try { document.head.removeChild(s1); } catch { /* ignore */ }
      const st = document.getElementById("vaulte-tawk-hide");
      if (st) document.head.removeChild(st);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Toggle chat on click ───────────────────────────────────────────────────
  const handleClick = () => {
    const api = (window as Window & { Tawk_API?: TawkAPI }).Tawk_API;
    if (api) {
      if (chatOpen) { api.minimize?.(); } else { api.maximize?.(); }
    }
  };

  const showPulse   = !chatOpen && unread > 0;
  const showTooltip = hovered && !chatOpen;
  const hidden      = shouldHide(pathname);

  return (
    <>
      {/*
       * ── Fixed bottom-right launcher button ────────────────────────────────
       *
       * Positioning is 100 % CSS-driven (right / bottom) — no JS coordinates,
       * no drag, no free movement.  The widget is always anchored to the
       * bottom-right safe zone and never moves to any other position.
       *
       * right/bottom values and widget size are set in the <style> block below
       * via media queries so the CSS cascade applies correctly at every
       * viewport width without any JavaScript measurement.
       */}
      <div
        className="vaulte-chat-btn"
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position:   "fixed",
          zIndex:     9998,
          cursor:     "pointer",
          userSelect: "none",
          overflow:   "visible",   // allow tooltip and pulse ring to extend outside bounds
          // On routes where we don't want the chat showing (auth flows, KYC
          // capture, admin login), hide the launcher with display:none rather
          // than unmounting the component — that keeps the Tawk script alive
          // so an open conversation isn't reset on every navigation.
          display:    hidden ? "none" : undefined,
        }}
      >
        {/* Outer pulse ring — shown when there are unread messages */}
        {showPulse && (
          <div style={{
            position: "absolute", inset: -5,
            borderRadius: "50%",
            background: "rgba(22,163,74,0.15)",
            animation: "chatPulseRing 2s ease-out infinite",
            pointerEvents: "none",
          }} />
        )}

        {/* Main circle */}
        <div style={{
          width: "100%", height: "100%",
          borderRadius: "50%",
          background: chatOpen
            ? "linear-gradient(135deg,#0F172A,#1E293B)"
            : "linear-gradient(135deg,#16A34A,#15803D)",
          boxShadow: chatOpen
            ? "0 4px 20px rgba(15,23,42,0.4), 0 0 0 2px rgba(255,255,255,0.08)"
            : "0 4px 20px rgba(22,163,74,0.45), 0 0 0 2px rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
          transition: "background 0.25s, box-shadow 0.25s",
        }}>
          {/* Icon */}
          <span style={{
            fontSize: chatOpen ? 20 : 22, lineHeight: 1,
            transition: "transform 0.25s",
            transform: chatOpen ? "rotate(180deg) scale(0.85)" : "rotate(0deg) scale(1)",
            userSelect: "none",
          }}>
            {chatOpen ? "✕" : "💬"}
          </span>

          {/* Unread badge */}
          {unread > 0 && !chatOpen && (
            <div style={{
              position: "absolute", top: 0, right: 0,
              minWidth: 18, height: 18, borderRadius: 9,
              background: "#EF4444", border: "2px solid #fff",
              fontSize: 10, fontWeight: 700, color: "#fff",
              display: "flex", alignItems: "center", justifyContent: "center",
              padding: "0 4px",
            }}>
              {unread > 9 ? "9+" : unread}
            </div>
          )}
        </div>

        {/*
         * Tooltip — always rendered to the LEFT of the button because the
         * widget is always in the bottom-right corner.  Opacity is driven by
         * React state so it works reliably across all browsers (no CSS
         * attribute-selector tricks).
         */}
        <div
          aria-hidden
          style={{
            position:    "absolute",
            right:       "calc(100% + 10px)",
            top:         "50%",
            transform:   "translateY(-50%)",
            background:  "#0F172A",
            color:       "#fff",
            fontSize:    12,
            fontWeight:  600,
            lineHeight:  1,
            padding:     "7px 12px",
            borderRadius: 9,
            whiteSpace:  "nowrap",
            boxShadow:   "0 4px 16px rgba(15,23,42,0.35)",
            pointerEvents: "none",
            zIndex:      1,
            opacity:     showTooltip ? 1 : 0,
            transition:  "opacity 0.15s ease",
          }}
        >
          {tawkReady ? "Live Support" : "Connecting…"}
          {/* Arrow caret pointing right toward the button */}
          <div style={{
            position:     "absolute",
            top:          "50%",
            right:        -6,
            transform:    "translateY(-50%)",
            width:        0,
            height:       0,
            borderTop:    "5px solid transparent",
            borderBottom: "5px solid transparent",
            borderLeft:   "6px solid #0F172A",
          }} />
        </div>
      </div>

      <style>{`
        /*
         * ── Widget positioning — fixed bottom-right, zero movement ────────────
         *
         * Spacing from screen edges:
         *   Desktop (> 768 px)  : right 24 px, bottom 24 px, size 56 × 56 px
         *   Tablet  (≤ 768 px)  : right 20 px, bottom 20 px, size 56 × 56 px
         *   Mobile  (≤ 480 px)  : right 16 px, bottom 16 px, size 48 × 48 px
         *                         (48 px = 14 % smaller than 56 px — within the
         *                          10–15 % reduction allowed to minimise overlap)
         *
         * Safe-area support:
         *   The second bottom declaration overwrites the first in browsers
         *   that support env() (iOS Safari, Chrome on Android with gesture nav).
         *   Browsers that do not support env() keep the plain pixel value.
         *
         * The widget is NEVER draggable and NEVER moves outside the bottom-right
         * zone regardless of page, language, screen size, or content below it.
         */
        .vaulte-chat-btn {
          right:  24px;
          bottom: 24px;
          width:  56px;
          height: 56px;
        }

        @media (max-width: 768px) {
          .vaulte-chat-btn {
            right:  20px;
            bottom: 20px;
            bottom: calc(20px + env(safe-area-inset-bottom, 0px));
          }
        }

        @media (max-width: 640px) {
          /* Raise the widget on narrow phones so it clears the iOS Safari
             bottom bar (~49 px) and sits above pagination / bottom buttons.
             72 px provides comfortable clearance without hiding the widget. */
          .vaulte-chat-btn {
            bottom: 72px;
            bottom: calc(72px + env(safe-area-inset-bottom, 0px));
          }
        }

        @media (max-width: 480px) {
          .vaulte-chat-btn {
            right:  16px;
            bottom: 72px;
            bottom: calc(72px + env(safe-area-inset-bottom, 0px));
            /* Slightly reduced size keeps it within the safe zone on narrow
               phones without blocking the hero buttons or login form inputs. */
            width:  48px;
            height: 48px;
          }
        }

        @keyframes chatPulseRing {
          0%   { transform: scale(1);    opacity: 0.6; }
          70%  { transform: scale(1.35); opacity: 0;   }
          100% { transform: scale(1.35); opacity: 0;   }
        }
      `}</style>
    </>
  );
}

// ── Minimal Tawk.to API type shim ─────────────────────────────────────────────
interface TawkAPI {
  hideWidget:           () => void;
  showWidget:           () => void;
  maximize:             () => void;
  minimize:             () => void;
  onChatMaximized:      () => void;
  onChatMinimized:      () => void;
  onUnreadCountChanged: (count: number) => void;
  addTags?:             (tags: string[], cb: (err?: unknown) => void) => void;
  setAttributes?:       (attrs: Record<string, string>, cb: (err?: unknown) => void) => void;
}
