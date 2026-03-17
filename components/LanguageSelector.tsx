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

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Read the target language from the googtrans cookie (returns "en" if absent). */
function readCookieLang(): string {
  try {
    const m = document.cookie.match(/googtrans=\/[^/]+\/([^;]+)/);
    return m?.[1] ?? "en";
  } catch {
    return "en";
  }
}

/** Programmatically trigger Google Translate for the given language code.
 *  Retries up to 20 times (6 seconds) waiting for GT to initialise. */
function applyGoogleTranslate(langCode: string, retries = 0) {
  const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
  if (select) {
    select.value = langCode;
    select.dispatchEvent(new Event("change"));
  } else if (retries < 20) {
    setTimeout(() => applyGoogleTranslate(langCode, retries + 1), 300);
  }
}

/** Clear the googtrans cookie on both root path and domain, then reload. */
function resetToEnglish() {
  const expires = "expires=Thu, 01 Jan 1970 00:00:01 GMT";
  document.cookie = `googtrans=; path=/; ${expires}`;
  document.cookie = `googtrans=; path=/; ${expires}; domain=.${location.hostname}`;
  window.location.reload();
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

  // ── Initialise: restore saved / auto-detected language ───────────────────
  useEffect(() => {
    const cookieLang = readCookieLang();
    const savedLang  = localStorage.getItem("vaulte_lang");

    if (cookieLang !== "en") {
      // An active translation is already applied via cookie — sync the UI
      setSelectedCode(cookieLang);
      if (!savedLang) localStorage.setItem("vaulte_lang", cookieLang);
    } else if (savedLang && savedLang !== "en") {
      // Saved preference, but no active cookie — re-apply
      setSelectedCode(savedLang);
      applyGoogleTranslate(savedLang);
    } else if (!savedLang) {
      // Very first visit — auto-detect browser language
      const browserRaw = navigator.language.toLowerCase();           // e.g. "zh-tw"
      const prefix     = browserRaw.split("-")[0];                   // e.g. "zh"

      const match =
        LANGUAGES.find(l => l.code.toLowerCase() === browserRaw) ??  // exact
        LANGUAGES.find(l => l.code.toLowerCase() === prefix);         // prefix

      if (match && match.code !== "en") {
        setSelectedCode(match.code);
        localStorage.setItem("vaulte_lang", match.code);
        applyGoogleTranslate(match.code);
      } else {
        localStorage.setItem("vaulte_lang", "en");                   // mark as visited
      }
    }
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
      resetToEnglish();
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
        {/* Flag */}
        <span style={{ fontSize: 17, lineHeight: 1 }}>{current.flag}</span>
        {/* Full name — hidden below 900 px via CSS class */}
        <span
          className="vaulte-lang-name"
          style={{ fontWeight: 600, fontSize: 12.5, letterSpacing: "0.01em" }}
        >
          {current.name}
        </span>
        {/* Code — visible only when name is hidden (< 900 px) */}
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
            zIndex: 999,
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
