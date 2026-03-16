"use client";
import { useEffect, useRef, useState, useCallback } from "react";

const TAWK_PROPERTY_ID = "69af8003ddd7fc1c348540ae";
const TAWK_WIDGET_ID   = "1jjaoo3d8";

// ── Storage key for persisting position across page navigations ─────────────
const POS_KEY = "vaulte_chat_pos";

function loadPos(): { x: number; y: number } | null {
  try {
    const raw = localStorage.getItem(POS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* ignore */ }
  return null;
}
function savePos(pos: { x: number; y: number }) {
  try { localStorage.setItem(POS_KEY, JSON.stringify(pos)); } catch { /* ignore */ }
}

// ── Button size — slightly smaller on narrow viewports ─────────────────────
const BTN_DESKTOP = 56;
const BTN_MOBILE  = 48;
const getBtn = () => (typeof window !== "undefined" && window.innerWidth <= 520 ? BTN_MOBILE : BTN_DESKTOP);

// ── Clamp so the button stays fully inside the viewport ────────────────────
function clamp(pos: { x: number; y: number }, btn: number): { x: number; y: number } {
  const MARGIN = 12;
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  return {
    x: Math.min(Math.max(pos.x, MARGIN), vw - btn - MARGIN),
    y: Math.min(Math.max(pos.y, MARGIN), vh - btn - MARGIN),
  };
}

export default function TawkToChat() {
  // ── Tawk.to state ──────────────────────────────────────────────────────────
  const [chatOpen,    setChatOpen]    = useState(false);
  const [tawkReady,   setTawkReady]   = useState(false);
  const [unread,      setUnread]      = useState(0);
  const [btnSize,     setBtnSize]     = useState(BTN_DESKTOP);

  // ── Draggable state ────────────────────────────────────────────────────────
  const btnRef       = useRef<HTMLDivElement>(null);
  const dragging     = useRef(false);
  const dragOffset   = useRef({ x: 0, y: 0 });
  const didDrag      = useRef(false);          // distinguish click vs drag

  // ── Default position:
  //   • Mobile  (≤ 520 px wide): bottom-LEFT — avoids covering right-aligned
  //     transaction amounts which are the most tapped content area
  //   • Desktop: bottom-RIGHT (traditional chat position)
  const defaultPos = useCallback((): { x: number; y: number } => {
    const btn = getBtn();
    const isMobile = window.innerWidth <= 520;
    return {
      x: isMobile ? 16 : window.innerWidth  - btn - 20,
      y: window.innerHeight - btn - 28,
    };
  }, []);

  const [pos, setPos] = useState<{ x: number; y: number }>({ x: -9999, y: -9999 });

  // Hydrate position + button size after mount (avoids SSR mismatch)
  useEffect(() => {
    const btn = getBtn();
    setBtnSize(btn);
    const saved = loadPos();
    setPos(clamp(saved ?? defaultPos(), btn));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reposition + resize button on viewport resize
  useEffect(() => {
    const onResize = () => {
      const btn = getBtn();
      setBtnSize(btn);
      setPos(p => clamp(p, btn));
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

        api.onChatMaximized  = () => setChatOpen(true);
        api.onChatMinimized  = () => setChatOpen(false);
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

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const onPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!btnRef.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    dragging.current = true;
    didDrag.current  = false;
    dragOffset.current = {
      x: e.clientX - pos.x,
      y: e.clientY - pos.y,
    };
  }, [pos]);

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    didDrag.current = true;
    const next = clamp({ x: e.clientX - dragOffset.current.x, y: e.clientY - dragOffset.current.y }, btnSize);
    setPos(next);
  }, [btnSize]);

  const onPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    dragging.current = false;
    e.currentTarget.releasePointerCapture(e.pointerId);

    // Save final position
    setPos(p => { savePos(p); return p; });

    // If user didn't drag (just clicked), toggle the chat widget
    if (!didDrag.current) {
      const api = (window as Window & { Tawk_API?: TawkAPI }).Tawk_API;
      if (api) {
        if (chatOpen) { api.minimize?.(); } else { api.maximize?.(); }
      }
    }
  }, [chatOpen]);

  // ── Snap to nearest edge on double-click ──────────────────────────────────
  const onDoubleClick = useCallback(() => {
    if (didDrag.current) return;
    setPos(p => {
      const vw  = window.innerWidth;
      const btn = getBtn();
      const snapped = clamp({ x: p.x < vw / 2 ? 16 : vw - btn - 16, y: p.y }, btn);
      savePos(snapped);
      return snapped;
    });
  }, []);

  // ── Render ─────────────────────────────────────────────────────────────────
  // Don't render until position is hydrated (avoids layout jump)
  if (pos.x === -9999) return null;

  const showPulse = !chatOpen && (unread > 0 || !tawkReady === false);

  return (
    <>
      {/* ── Custom draggable launcher button ─────────────────────────────── */}
      <div
        ref={btnRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onDoubleClick={onDoubleClick}
        style={{
          position:   "fixed",
          left:        pos.x,
          top:         pos.y,
          width:       btnSize,
          height:      btnSize,
          zIndex:      9998,
          cursor:      dragging.current ? "grabbing" : "grab",
          userSelect:  "none",
          touchAction: "none",
          transition: dragging.current ? "none" : "left 0.25s cubic-bezier(0.4,0,0.2,1), top 0.25s cubic-bezier(0.4,0,0.2,1)",
        }}
        title="Live Support — drag to reposition"
      >
        {/* Outer pulse ring */}
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
          width: btnSize, height: btnSize, borderRadius: "50%",
          background: chatOpen
            ? "linear-gradient(135deg,#0F172A,#1E293B)"
            : "linear-gradient(135deg,#16A34A,#15803D)",
          boxShadow: chatOpen
            ? "0 4px 20px rgba(15,23,42,0.4), 0 0 0 2px rgba(255,255,255,0.08)"
            : "0 4px 20px rgba(22,163,74,0.45), 0 0 0 2px rgba(255,255,255,0.12)",
          display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
          transition: "background 0.25s, box-shadow 0.25s, transform 0.18s",
        }}>
          {/* Icon */}
          <span style={{ fontSize: chatOpen ? 20 : 22, lineHeight: 1, transition: "transform 0.25s", transform: chatOpen ? "rotate(180deg) scale(0.85)" : "rotate(0deg) scale(1)", userSelect: "none" }}>
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

        {/* Tooltip label — shown on hover when idle */}
        {!chatOpen && (
          <div style={{
            position: "absolute",
            ...(pos.x > window.innerWidth / 2
              ? { right: btnSize + 10, left: "auto" }
              : { left: btnSize + 10, right: "auto" }),
            top: "50%", transform: "translateY(-50%)",
            background: "#0F172A", color: "#fff",
            fontSize: 11, fontWeight: 600,
            padding: "5px 10px", borderRadius: 8,
            whiteSpace: "nowrap" as const,
            boxShadow: "0 2px 12px rgba(15,23,42,0.3)",
            pointerEvents: "none",
            opacity: 0,
            transition: "opacity 0.18s",
          }}
            className="chat-tooltip"
          >
            {tawkReady ? "Live Support" : "Connecting…"}
            <div style={{
              position: "absolute", top: "50%", transform: "translateY(-50%)",
              ...(pos.x > window.innerWidth / 2
                ? { right: -4, left: "auto", borderLeft: "4px solid #0F172A", borderRight: "none" }
                : { left: -4, right: "auto", borderRight: "4px solid #0F172A", borderLeft: "none" }),
              borderTop: "4px solid transparent",
              borderBottom: "4px solid transparent",
              width: 0, height: 0,
            }} />
          </div>
        )}
      </div>

      <style>{`
        @keyframes chatPulseRing {
          0%   { transform: scale(1);    opacity: 0.6; }
          70%  { transform: scale(1.35); opacity: 0;   }
          100% { transform: scale(1.35); opacity: 0;   }
        }
        div[title="Live Support — drag to reposition"]:hover .chat-tooltip {
          opacity: 1 !important;
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
