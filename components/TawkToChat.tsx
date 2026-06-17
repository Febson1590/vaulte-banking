"use client";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { getCurrentUser } from "@/lib/vaulteState";

const TAWK_PROPERTY_ID =
  process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || "69fd676da11ae21c341a171b";
const TAWK_WIDGET_ID =
  process.env.NEXT_PUBLIC_TAWK_WIDGET_ID || "1jo2to0tt";

const SCRIPT_ID = "vaulte-tawk-script";

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

interface TawkAPI {
  hideWidget?:      () => void;
  showWidget?:      () => void;
  maximize?:        () => void;
  minimize?:        () => void;
  addTags?:         (tags: string[], cb: (err?: unknown) => void) => void;
  setAttributes?:   (attrs: Record<string, string>, cb: (err?: unknown) => void) => void;
  visitor?:         { name?: string; email?: string };
  onLoad?:          () => void;
  onChatMaximized?: () => void;
  onChatMinimized?: () => void;
}

type WindowWithTawk = Window & { Tawk_API?: TawkAPI; Tawk_LoadStart?: Date };

export default function TawkToChat() {
  const pathname = usePathname();
  const pendingTagsRef = useRef<string[]>([]);
  const pathnameRef    = useRef<string | null>(pathname);
  pathnameRef.current  = pathname;

  // Controls our custom launcher button visibility.
  // Hidden until Tawk loads; also hidden on HIDE_ON_PATHS.
  const [showButton, setShowButton] = useState(false);

  // ── Load the Tawk script ────────────────────────────────────────────────
  useEffect(() => {
    if (document.getElementById(SCRIPT_ID)) return;

    const w = window as WindowWithTawk;
    const tawkApi: TawkAPI = w.Tawk_API ?? {};
    w.Tawk_LoadStart = new Date();

    // Visitor identity
    const tags: string[] = [];
    try {
      const user = getCurrentUser();
      if (user) {
        const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
        tawkApi.visitor = { name: fullName || user.email, email: user.email };
        tags.push("customer");
        if (user.kycStatus === "verified")   tags.push("kyc-verified");
        if (user.kycStatus === "pending")    tags.push("kyc-pending");
        if (user.kycStatus === "unverified") tags.push("kyc-unverified");
      } else {
        tags.push("prospect");
      }
    } catch {
      tags.push("prospect");
    }
    pendingTagsRef.current = tags;

    tawkApi.onLoad = () => {
      const live = (window as WindowWithTawk).Tawk_API;
      if (!live) return;

      // Apply tags
      if (pendingTagsRef.current.length && typeof live.addTags === "function") {
        live.addTags(pendingTagsRef.current, () => {});
        pendingTagsRef.current = [];
      }

      // Hide Tawk's own launcher completely — we control open/close ourselves.
      // This is the only reliable way to prevent Tawk dashboard triggers from
      // auto-opening the chat window without user interaction.
      if (typeof live.hideWidget === "function") live.hideWidget();

      // Show our custom button unless we're on a hidden path
      if (!shouldHide(pathnameRef.current)) setShowButton(true);
    };

    // When user closes/minimizes the chat window, hide the Tawk widget again
    // so we're back to our custom button state.
    tawkApi.onChatMinimized = () => {
      const live = (window as WindowWithTawk).Tawk_API;
      if (typeof live?.hideWidget === "function") live.hideWidget();
      if (!shouldHide(pathnameRef.current)) setShowButton(true);
    };

    w.Tawk_API = tawkApi;

    const s1 = document.createElement("script");
    s1.id      = SCRIPT_ID;
    s1.async   = true;
    s1.src     = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;
    s1.charset = "UTF-8";
    s1.setAttribute("crossorigin", "*");
    s1.onerror = () => console.warn("[Tawk] script failed to load.");

    const firstScript = document.getElementsByTagName("script")[0];
    if (firstScript?.parentNode) {
      firstScript.parentNode.insertBefore(s1, firstScript);
    } else {
      document.head.appendChild(s1);
    }

    // Fallback tag poll
    const pollInterval = setInterval(() => {
      const live = (window as WindowWithTawk).Tawk_API;
      if (live && typeof live.addTags === "function" && pendingTagsRef.current.length) {
        clearInterval(pollInterval);
        live.addTags(pendingTagsRef.current, () => {});
        pendingTagsRef.current = [];
      }
    }, 500);
    const stopPolling = window.setTimeout(() => clearInterval(pollInterval), 15_000);

    return () => {
      clearInterval(pollInterval);
      window.clearTimeout(stopPolling);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Show / hide our custom button on route change ───────────────────────
  useEffect(() => {
    const live = (window as WindowWithTawk).Tawk_API;
    const hide = shouldHide(pathname);

    if (hide) {
      setShowButton(false);
      if (typeof live?.hideWidget === "function") live.hideWidget();
    } else {
      // Only show button if Tawk is already loaded (hideWidget exists)
      if (typeof live?.hideWidget === "function") {
        live.hideWidget();
        setShowButton(true);
      }
    }
  }, [pathname]);

  // ── Open chat when user clicks our button ──────────────────────────────
  function openChat() {
    const live = (window as WindowWithTawk).Tawk_API;
    if (!live) return;
    setShowButton(false);
    if (typeof live.showWidget === "function") live.showWidget();
    if (typeof live.maximize  === "function") live.maximize();
  }

  if (!showButton) return null;

  return (
    <button
      onClick={openChat}
      aria-label="Open live chat"
      style={{
        position:        "fixed",
        bottom:          "24px",
        right:           "24px",
        width:           "60px",
        height:          "60px",
        borderRadius:    "50%",
        background:      "#1a56db",
        border:          "none",
        cursor:          "pointer",
        display:         "flex",
        alignItems:      "center",
        justifyContent:  "center",
        boxShadow:       "0 6px 20px rgba(15,23,42,0.25)",
        zIndex:          2147483600,
        transition:      "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e: { currentTarget: HTMLButtonElement }) => {
        e.currentTarget.style.transform  = "scale(1.08)";
        e.currentTarget.style.boxShadow = "0 8px 24px rgba(15,23,42,0.35)";
      }}
      onMouseLeave={(e: { currentTarget: HTMLButtonElement }) => {
        e.currentTarget.style.transform  = "scale(1)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(15,23,42,0.25)";
      }}
    >
      <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M20 2H4C2.9 2 2 2.9 2 4v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
          fill="white"
        />
      </svg>
    </button>
  );
}
