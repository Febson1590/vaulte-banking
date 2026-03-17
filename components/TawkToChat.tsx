"use client";
import { useEffect, useState } from "react";

const TAWK_PROPERTY_ID = "69af8003ddd7fc1c348540ae";
const TAWK_WIDGET_ID   = "1jjaoo3d8";

export default function TawkToChat() {
  // ── Tawk.to state ──────────────────────────────────────────────────────────
  const [chatOpen,  setChatOpen]  = useState(false);
  const [tawkReady, setTawkReady] = useState(false);
  const [unread,    setUnread]    = useState(0);
  const [hovered,   setHovered]   = useState(false);

  // ── Load Tawk.to script and hide their default launcher ───────────────────
  useEffect(() => {
    // Suppress Tawk's built-in launcher bubble so only our button shows
    const styleTag = document.createElement("style");
    styleTag.id = "vaulte-tawk-hide";
    styleTag.textContent = `
      #tawk-bubble-container,
      .tawk-min-container,
      .tawk-button-circle,
      iframe[title*="chat button"],
      iframe[title*="chat widget"] { display: none !important; }
    `;
    document.head.appendChild(styleTag);

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
      }
    }, 300);

    return () => {
      clearInterval(pollInterval);
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

        @media (max-width: 480px) {
          .vaulte-chat-btn {
            right:  16px;
            bottom: 16px;
            bottom: calc(16px + env(safe-area-inset-bottom, 0px));
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
}
