"use client";

import { useState, useEffect, useRef } from "react";

// ── Supported languages (Google Translate codes) ─────────────────────────────
export const LANGUAGES = [
  { code: "en",    name: "English",           flag: "🇬🇧" },
  { code: "es",    name: "Español",           flag: "🇪🇸" },
  { code: "fr",    name: "Français",          flag: "🇫🇷" },
  { code: "de",    name: "Deutsch",           flag: "🇩🇪" },
  { code: "it",    name: "Italiano",          flag: "🇮🇹" },
  { code: "pt",    name: "Português",         flag: "🇵🇹" },
  { code: "nl",    name: "Nederlands",        flag: "🇳🇱" },
  { code: "pl",    name: "Polski",            flag: "🇵🇱" },
  { code: "ru",    name: "Русский",           flag: "🇷🇺" },
  { code: "uk",    name: "Українська",        flag: "🇺🇦" },
  { code: "sv",    name: "Svenska",           flag: "🇸🇪" },
  { code: "no",    name: "Norsk",             flag: "🇳🇴" },
  { code: "da",    name: "Dansk",             flag: "🇩🇰" },
  { code: "fi",    name: "Suomi",             flag: "🇫🇮" },
  { code: "ro",    name: "Română",            flag: "🇷🇴" },
  { code: "cs",    name: "Čeština",           flag: "🇨🇿" },
  { code: "hu",    name: "Magyar",            flag: "🇭🇺" },
  { code: "el",    name: "Ελληνικά",          flag: "🇬🇷" },
  { code: "tr",    name: "Türkçe",            flag: "🇹🇷" },
  { code: "ar",    name: "العربية",           flag: "🇸🇦" },
  { code: "he",    name: "עברית",             flag: "🇮🇱" },
  { code: "hi",    name: "हिन्दी",            flag: "🇮🇳" },
  { code: "bn",    name: "বাংলা",             flag: "🇧🇩" },
  { code: "ur",    name: "اردو",              flag: "🇵🇰" },
  { code: "fa",    name: "فارسی",             flag: "🇮🇷" },
  { code: "zh-CN", name: "中文（简体）",       flag: "🇨🇳" },
  { code: "zh-TW", name: "中文（繁體）",       flag: "🇹🇼" },
  { code: "ja",    name: "日本語",             flag: "🇯🇵" },
  { code: "ko",    name: "한국어",             flag: "🇰🇷" },
  { code: "th",    name: "ภาษาไทย",           flag: "🇹🇭" },
  { code: "vi",    name: "Tiếng Việt",        flag: "🇻🇳" },
  { code: "id",    name: "Bahasa Indonesia",  flag: "🇮🇩" },
  { code: "ms",    name: "Bahasa Melayu",     flag: "🇲🇾" },
  { code: "tl",    name: "Filipino",          flag: "🇵🇭" },
  { code: "sw",    name: "Kiswahili",         flag: "🇰🇪" },
];

// ── Cancellation token ────────────────────────────────────────────────────────
// Every applyGoogleTranslate call takes ownership of the current version.
// clearGoogTransCookie() also bumps the version. Any retry callback whose
// captured version no longer matches _gtVersion is silently dropped — this
// prevents orphaned retries from re-applying a stale language after the user
// has already selected English (or a different language).
let _gtVersion = 0;

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Delete the googtrans cookie on every domain/path variant Google Translate
 * might have used.  Also increments _gtVersion to abort any in-flight
 * applyGoogleTranslate retry loops immediately.
 *
 * We clear five variants to handle both bare hostnames (vaulte-banking.vercel.app)
 * and www-prefixed custom domains (www.vaulteapp.com).  On a custom domain GT
 * typically sets the cookie on the APEX domain (.vaulteapp.com) — not on the
 * www subdomain — so clearing only location.hostname misses it entirely.
 */
function clearGoogTransCookie(): void {
  _gtVersion++;                                     // cancel pending retries
  const exp  = "expires=Thu, 01 Jan 1970 00:00:01 GMT";
  const host = location.hostname;

  // 1. No explicit domain (covers localhost / direct file)
  document.cookie = `googtrans=; path=/; ${exp}`;
  // 2-3. Exact hostname and dot-prefixed hostname (e.g. www.vaulteapp.com)
  document.cookie = `googtrans=; path=/; ${exp}; domain=${host}`;
  document.cookie = `googtrans=; path=/; ${exp}; domain=.${host}`;

  // 4-5. Apex domain — critical for www.* custom domains.
  //      GT sets the cookie on the APEX (vaulteapp.com / .vaulteapp.com),
  //      not on the www subdomain, so we must also clear it there.
  const parts = host.split(".");
  if (parts.length > 2) {
    const apex = parts.slice(-2).join(".");
    document.cookie = `googtrans=; path=/; ${exp}; domain=${apex}`;
    document.cookie = `googtrans=; path=/; ${exp}; domain=.${apex}`;
  }
}

/**
 * Programmatically apply a language via Google Translate.
 *
 * Retries every 300 ms (up to 6 s total) until the hidden GT combo select
 * is available.  Each call claims a unique version number; if a newer call
 * (or clearGoogTransCookie) increments _gtVersion, all pending retries for
 * the previous version are silently dropped.
 */
function applyGoogleTranslate(langCode: string): void {
  const version = ++_gtVersion;

  function attempt(tries: number): void {
    if (version !== _gtVersion) return;             // cancelled by a newer call
    const sel = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (sel) {
      sel.value = langCode;
      sel.dispatchEvent(new Event("change"));
    } else if (tries < 20) {
      setTimeout(() => attempt(tries + 1), 300);
    }
  }

  attempt(0);
}

/**
 * Reset to English.
 *
 * Order of operations matters:
 * 1. clearGoogTransCookie() — bumps _gtVersion (cancels retries) AND wipes the
 *    googtrans cookie before the reload so GT has nothing to restore.
 * 2. localStorage — written so the root-layout sync <script> knows to keep the
 *    cookie clear on the very next load (before GT initialises).
 * 3. reload — gives GT a clean slate.
 */
function resetToEnglish(): void {
  clearGoogTransCookie();                           // step 1: cancel + clear
  localStorage.setItem("vaulte_lang", "en");        // step 2: persist choice
  window.location.reload();                         // step 3: clean reload
}

// ── Component ─────────────────────────────────────────────────────────────────

interface LanguageSelectorProps {
  /** "light" (default) — dark text on light bg (sidebar / floating).
   *  "dark"            — light text on dark bg (public navbars). */
  variant?: "light" | "dark";
}

export default function LanguageSelector({ variant = "light" }: LanguageSelectorProps) {
  const isDark = variant === "dark";
  const [selectedCode, setSelectedCode] = useState("en");
  const [open,         setOpen]         = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  // ── Init: localStorage is the single source of truth ─────────────────────
  //
  // We deliberately do NOT read the googtrans cookie here.  The cookie is
  // GT's internal output; our source of truth is localStorage["vaulte_lang"].
  // The root-layout sync <script> clears the cookie before GT loads whenever
  // the saved preference is English, so there is no flash of a foreign language.
  useEffect(() => {
    const saved = localStorage.getItem("vaulte_lang");

    // ── First visit: nothing saved yet ───────────────────────────────────────
    if (!saved) {
      const raw    = navigator.language.toLowerCase();    // e.g. "zh-tw"
      const prefix = raw.split("-")[0];                   // e.g. "zh"
      const match  =
        LANGUAGES.find(l => l.code.toLowerCase() === raw)    ??  // exact
        LANGUAGES.find(l => l.code.toLowerCase() === prefix);    // prefix

      if (match && match.code !== "en") {
        setSelectedCode(match.code);
        localStorage.setItem("vaulte_lang", match.code);
        applyGoogleTranslate(match.code);
      } else {
        setSelectedCode("en");
        localStorage.setItem("vaulte_lang", "en");
        clearGoogTransCookie();                           // ensure no stale cookie
      }
      return;
    }

    // ── English: make sure no stale cookie can trigger GT ────────────────────
    if (saved === "en") {
      setSelectedCode("en");
      clearGoogTransCookie();   // bumps version + clears cookie (belt-and-suspenders
                                // alongside the sync head script in layout.tsx)
      return;
    }

    // ── Saved non-English language: apply it ──────────────────────────────────
    setSelectedCode(saved);
    applyGoogleTranslate(saved);
  }, []);

  // ── Close dropdown on outside click ──────────────────────────────────────
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Language change ───────────────────────────────────────────────────────
  const handleSelect = (langCode: string) => {
    setOpen(false);
    setSelectedCode(langCode);
    localStorage.setItem("vaulte_lang", langCode);
    if (langCode === "en") {
      resetToEnglish();         // clears cookie + cancels retries + reloads
    } else {
      applyGoogleTranslate(langCode);
    }
  };

  const current   = LANGUAGES.find(l => l.code === selectedCode) ?? LANGUAGES[0];
  const codeLabel = selectedCode.slice(0, 2).toUpperCase();

  // ── Styles ────────────────────────────────────────────────────────────────
  const triggerStyle: React.CSSProperties = {
    display: "flex", alignItems: "center", gap: 5,
    height: 38, padding: "0 11px",
    borderRadius: 10,
    border: isDark ? "1px solid rgba(255,255,255,0.2)" : "1px solid rgba(15,23,42,0.07)",
    background: "transparent",
    cursor: "pointer",
    fontSize: 13, color: isDark ? "rgba(255,255,255,0.9)" : "#0F172A",
    fontFamily: "inherit",
    transition: "background 0.15s",
    whiteSpace: "nowrap",
  };

  return (
    <div ref={wrapRef} style={{ position: "relative" }}>

      {/* ── Trigger button ─────────────────────────────────────────────── */}
      <button
        style={triggerStyle}
        onClick={() => setOpen(v => !v)}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(255,255,255,0.1)" : "#F3F5FA"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; }}
        title="Select language"
        aria-label="Language selector"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <span style={{ fontSize: 17, lineHeight: 1 }}>{current.flag}</span>
        {/* Full name — hidden below 900 px via CSS class */}
        <span
          className="vaulte-lang-name"
          style={{ fontWeight: 600, fontSize: 12.5, letterSpacing: "0.01em" }}
        >
          {current.name}
        </span>
        {/* 2-letter code — visible only when name is hidden (< 900 px) */}
        <span
          className="vaulte-lang-code"
          style={{ fontWeight: 600, fontSize: 12.5, letterSpacing: "0.02em" }}
        >
          {codeLabel}
        </span>
        <span style={{ fontSize: 9, color: isDark ? "rgba(255,255,255,0.5)" : "#94A3B8", marginLeft: 1 }}>▾</span>
      </button>

      {/* ── Dropdown ───────────────────────────────────────────────────── */}
      {open && (
        <div
          role="listbox"
          aria-label="Language list"
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            right: 0,
            width: 230,
            maxHeight: 320,
            overflowY: "auto",
            background: "#fff",
            borderRadius: 14,
            border: "1px solid rgba(15,23,42,0.07)",
            boxShadow: "0 8px 32px rgba(15,23,42,0.12), 0 2px 8px rgba(15,23,42,0.06)",
            zIndex: 1000,
            padding: "6px 0",
          }}
        >
          {LANGUAGES.map(lang => {
            const isActive = lang.code === selectedCode;
            return (
              <button
                key={lang.code}
                role="option"
                aria-selected={isActive}
                onClick={() => handleSelect(lang.code)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  width: "100%",
                  padding: "9px 14px",
                  background: isActive ? "rgba(26,115,232,0.06)" : "transparent",
                  border: "none",
                  cursor: "pointer",
                  textAlign: "left",
                  fontSize: 13,
                  color: isActive ? "#1A73E8" : "#0F172A",
                  fontWeight: isActive ? 600 : 400,
                  fontFamily: "inherit",
                  transition: "background 0.12s",
                }}
                onMouseEnter={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "#F8FAFC";
                }}
                onMouseLeave={e => {
                  if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent";
                }}
              >
                <span style={{ fontSize: 18, lineHeight: 1, flexShrink: 0 }}>{lang.flag}</span>
                <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {lang.name}
                </span>
                {isActive && (
                  <span style={{ fontSize: 11, color: "#1A73E8", flexShrink: 0 }}>✓</span>
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
