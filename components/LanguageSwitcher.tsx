"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Site-wide language switcher backed by Google Website Translator.
 *
 * Adapted from the Atlas Trust design to Vaulte's deep-navy / electric-blue
 * palette.  Uses inline styles (matching the rest of this codebase) rather
 * than Tailwind classes.
 *
 * Flow:
 *   1. The root <head> defines window.googleTranslateElementInit and loads
 *      Google's translate_a/element.js once (see app/layout.tsx).
 *   2. We render our own styled trigger + dropdown in the bottom-left corner.
 *   3. When the user picks a language we set the `googtrans` cookie Google's
 *      engine reads (format: `/<source>/<target>`) and reload.  Google's
 *      element picks up the cookie on next page-load and re-translates.
 *
 * Why cookie + reload instead of programmatic .goog-te-combo selection?
 * React re-renders disturb Google's DOM patching and produce flicker +
 * partially-untranslated content.  Cookie + reload is the official,
 * reliable path.
 *
 * Positioned bottom-left so it never collides with Tawk chat (bottom-right).
 */

type Language = {
  code: string;
  label: string;      // endonym — "Español", "中文 (简体)"
  english: string;    // exonym  — "Spanish", "Chinese (Simplified)"
  flag: string;
  starred?: boolean;  // floats to top of the list when no search query
};

const LANGUAGES: Language[] = [
  { code: "en",    flag: "🇺🇸", label: "English",          english: "English",           starred: true },
  { code: "es",    flag: "🇪🇸", label: "Español",          english: "Spanish",           starred: true },
  { code: "fr",    flag: "🇫🇷", label: "Français",         english: "French",            starred: true },
  { code: "de",    flag: "🇩🇪", label: "Deutsch",          english: "German",            starred: true },
  { code: "pt",    flag: "🇵🇹", label: "Português",        english: "Portuguese",        starred: true },
  { code: "it",    flag: "🇮🇹", label: "Italiano",         english: "Italian",           starred: true },
  { code: "nl",    flag: "🇳🇱", label: "Nederlands",       english: "Dutch",             starred: true },
  { code: "ru",    flag: "🇷🇺", label: "Русский",          english: "Russian",           starred: true },
  { code: "zh-CN", flag: "🇨🇳", label: "中文 (简体)",       english: "Chinese (Simplified)", starred: true },
  { code: "zh-TW", flag: "🇹🇼", label: "中文 (繁體)",       english: "Chinese (Traditional)" },
  { code: "ja",    flag: "🇯🇵", label: "日本語",            english: "Japanese",          starred: true },
  { code: "ko",    flag: "🇰🇷", label: "한국어",            english: "Korean",            starred: true },
  { code: "ar",    flag: "🇸🇦", label: "العربية",          english: "Arabic",            starred: true },
  { code: "hi",    flag: "🇮🇳", label: "हिन्दी",             english: "Hindi",             starred: true },
  { code: "bn",    flag: "🇧🇩", label: "বাংলা",             english: "Bengali",           starred: true },
  { code: "tr",    flag: "🇹🇷", label: "Türkçe",           english: "Turkish" },
  { code: "pl",    flag: "🇵🇱", label: "Polski",           english: "Polish" },
  { code: "vi",    flag: "🇻🇳", label: "Tiếng Việt",       english: "Vietnamese" },
  { code: "th",    flag: "🇹🇭", label: "ไทย",               english: "Thai" },
  { code: "id",    flag: "🇮🇩", label: "Bahasa Indonesia", english: "Indonesian" },
  { code: "ms",    flag: "🇲🇾", label: "Bahasa Melayu",    english: "Malay" },
  { code: "fil",   flag: "🇵🇭", label: "Filipino",         english: "Filipino" },
  { code: "sw",    flag: "🇹🇿", label: "Kiswahili",        english: "Swahili" },
  { code: "am",    flag: "🇪🇹", label: "አማርኛ",              english: "Amharic" },
  { code: "af",    flag: "🇿🇦", label: "Afrikaans",        english: "Afrikaans" },
  { code: "sq",    flag: "🇦🇱", label: "Shqip",            english: "Albanian" },
  { code: "hy",    flag: "🇦🇲", label: "Հայերեն",          english: "Armenian" },
  { code: "az",    flag: "🇦🇿", label: "Azərbaycan",       english: "Azerbaijani" },
  { code: "eu",    flag: "🇪🇸", label: "Euskara",          english: "Basque" },
  { code: "be",    flag: "🇧🇾", label: "Беларуская",       english: "Belarusian" },
  { code: "bs",    flag: "🇧🇦", label: "Bosanski",         english: "Bosnian" },
  { code: "bg",    flag: "🇧🇬", label: "Български",        english: "Bulgarian" },
  { code: "ca",    flag: "🇪🇸", label: "Català",           english: "Catalan" },
  { code: "ceb",   flag: "🇵🇭", label: "Cebuano",          english: "Cebuano" },
  { code: "ny",    flag: "🇲🇼", label: "Chichewa",         english: "Chichewa" },
  { code: "co",    flag: "🇫🇷", label: "Corsu",            english: "Corsican" },
  { code: "hr",    flag: "🇭🇷", label: "Hrvatski",         english: "Croatian" },
  { code: "cs",    flag: "🇨🇿", label: "Čeština",          english: "Czech" },
  { code: "da",    flag: "🇩🇰", label: "Dansk",            english: "Danish" },
  { code: "eo",    flag: "🌐",   label: "Esperanto",        english: "Esperanto" },
  { code: "et",    flag: "🇪🇪", label: "Eesti",            english: "Estonian" },
  { code: "fi",    flag: "🇫🇮", label: "Suomi",            english: "Finnish" },
  { code: "fy",    flag: "🇳🇱", label: "Frysk",            english: "Frisian" },
  { code: "gl",    flag: "🇪🇸", label: "Galego",           english: "Galician" },
  { code: "ka",    flag: "🇬🇪", label: "ქართული",          english: "Georgian" },
  { code: "el",    flag: "🇬🇷", label: "Ελληνικά",         english: "Greek" },
  { code: "gu",    flag: "🇮🇳", label: "ગુજરાતી",           english: "Gujarati" },
  { code: "ht",    flag: "🇭🇹", label: "Kreyòl ayisyen",   english: "Haitian Creole" },
  { code: "ha",    flag: "🇳🇬", label: "Hausa",            english: "Hausa" },
  { code: "iw",    flag: "🇮🇱", label: "עברית",            english: "Hebrew" },
  { code: "hu",    flag: "🇭🇺", label: "Magyar",           english: "Hungarian" },
  { code: "is",    flag: "🇮🇸", label: "Íslenska",         english: "Icelandic" },
  { code: "ig",    flag: "🇳🇬", label: "Igbo",             english: "Igbo" },
  { code: "ga",    flag: "🇮🇪", label: "Gaeilge",          english: "Irish" },
  { code: "jw",    flag: "🇮🇩", label: "Basa Jawa",        english: "Javanese" },
  { code: "kn",    flag: "🇮🇳", label: "ಕನ್ನಡ",              english: "Kannada" },
  { code: "kk",    flag: "🇰🇿", label: "Қазақ",            english: "Kazakh" },
  { code: "km",    flag: "🇰🇭", label: "ខ្មែរ",              english: "Khmer" },
  { code: "rw",    flag: "🇷🇼", label: "Kinyarwanda",      english: "Kinyarwanda" },
  { code: "ku",    flag: "🇹🇷", label: "Kurdî",            english: "Kurdish" },
  { code: "ky",    flag: "🇰🇬", label: "Кыргызча",         english: "Kyrgyz" },
  { code: "lo",    flag: "🇱🇦", label: "ລາວ",               english: "Lao" },
  { code: "la",    flag: "🇻🇦", label: "Latina",           english: "Latin" },
  { code: "lv",    flag: "🇱🇻", label: "Latviešu",         english: "Latvian" },
  { code: "lt",    flag: "🇱🇹", label: "Lietuvių",         english: "Lithuanian" },
  { code: "lb",    flag: "🇱🇺", label: "Lëtzebuergesch",   english: "Luxembourgish" },
  { code: "mk",    flag: "🇲🇰", label: "Македонски",       english: "Macedonian" },
  { code: "mg",    flag: "🇲🇬", label: "Malagasy",         english: "Malagasy" },
  { code: "ml",    flag: "🇮🇳", label: "മലയാളം",            english: "Malayalam" },
  { code: "mt",    flag: "🇲🇹", label: "Malti",            english: "Maltese" },
  { code: "mi",    flag: "🇳🇿", label: "Māori",            english: "Maori" },
  { code: "mr",    flag: "🇮🇳", label: "मराठी",              english: "Marathi" },
  { code: "mn",    flag: "🇲🇳", label: "Монгол",           english: "Mongolian" },
  { code: "my",    flag: "🇲🇲", label: "မြန်မာ",              english: "Myanmar (Burmese)" },
  { code: "ne",    flag: "🇳🇵", label: "नेपाली",             english: "Nepali" },
  { code: "no",    flag: "🇳🇴", label: "Norsk",            english: "Norwegian" },
  { code: "ps",    flag: "🇦🇫", label: "پښتو",             english: "Pashto" },
  { code: "fa",    flag: "🇮🇷", label: "فارسی",            english: "Persian" },
  { code: "pa",    flag: "🇮🇳", label: "ਪੰਜਾਬੀ",             english: "Punjabi" },
  { code: "ro",    flag: "🇷🇴", label: "Română",           english: "Romanian" },
  { code: "sm",    flag: "🇼🇸", label: "Gagana Samoa",     english: "Samoan" },
  { code: "sr",    flag: "🇷🇸", label: "Српски",           english: "Serbian" },
  { code: "st",    flag: "🇱🇸", label: "Sesotho",          english: "Sesotho" },
  { code: "sn",    flag: "🇿🇼", label: "ChiShona",         english: "Shona" },
  { code: "sd",    flag: "🇵🇰", label: "سنڌي",             english: "Sindhi" },
  { code: "si",    flag: "🇱🇰", label: "සිංහල",             english: "Sinhala" },
  { code: "sk",    flag: "🇸🇰", label: "Slovenčina",       english: "Slovak" },
  { code: "sl",    flag: "🇸🇮", label: "Slovenščina",      english: "Slovenian" },
  { code: "so",    flag: "🇸🇴", label: "Soomaali",         english: "Somali" },
  { code: "su",    flag: "🇮🇩", label: "Basa Sunda",       english: "Sundanese" },
  { code: "sv",    flag: "🇸🇪", label: "Svenska",          english: "Swedish" },
  { code: "tg",    flag: "🇹🇯", label: "Тоҷикӣ",           english: "Tajik" },
  { code: "ta",    flag: "🇮🇳", label: "தமிழ்",             english: "Tamil" },
  { code: "te",    flag: "🇮🇳", label: "తెలుగు",            english: "Telugu" },
  { code: "uk",    flag: "🇺🇦", label: "Українська",       english: "Ukrainian" },
  { code: "ur",    flag: "🇵🇰", label: "اردو",             english: "Urdu" },
  { code: "uz",    flag: "🇺🇿", label: "Oʻzbek",           english: "Uzbek" },
  { code: "cy",    flag: "🏴󠁧󠁢󠁷󠁬󠁳󠁿", label: "Cymraeg",          english: "Welsh" },
  { code: "xh",    flag: "🇿🇦", label: "IsiXhosa",         english: "Xhosa" },
  { code: "yi",    flag: "🇮🇱", label: "ייִדיש",            english: "Yiddish" },
  { code: "yo",    flag: "🇳🇬", label: "Yorùbá",           english: "Yoruba" },
  { code: "zu",    flag: "🇿🇦", label: "IsiZulu",          english: "Zulu" },
];

declare global {
  interface Window {
    google?: {
      translate?: {
        TranslateElement: {
          new (
            config: {
              pageLanguage: string;
              includedLanguages?: string;
              layout?: number;
              autoDisplay?: boolean;
              multilanguagePage?: boolean;
            },
            containerId: string
          ): unknown;
          InlineLayout: { SIMPLE: number };
        };
      };
    };
    googleTranslateElementInit?: () => void;
  }
}

function readGoogTransCookie(): string {
  if (typeof document === "undefined") return "en";
  const match = document.cookie
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("googtrans="));
  if (!match) return "en";
  const raw = decodeURIComponent(match.split("=")[1] || "");
  const parts = raw.split("/").filter(Boolean);
  return parts[1] || "en";
}

function setGoogTransCookie(target: string) {
  // Clearing (going back to English) — delete every scope Google may have set.
  if (target === "en") {
    const host = typeof window === "undefined" ? "" : window.location.hostname;
    const parts = host.split(".");
    const apex = parts.length > 2 ? parts.slice(-2).join(".") : host;
    const exp = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = `googtrans=; path=/; ${exp}`;
    document.cookie = `googtrans=; path=/; ${exp}; domain=${host}`;
    document.cookie = `googtrans=; path=/; ${exp}; domain=.${host}`;
    if (apex && apex !== host) {
      document.cookie = `googtrans=; path=/; ${exp}; domain=${apex}`;
      document.cookie = `googtrans=; path=/; ${exp}; domain=.${apex}`;
    }
    try { localStorage.setItem("vaulte_lang", "en"); } catch { /* ignore */ }
    return;
  }
  const value = `/en/${target}`;
  document.cookie = `googtrans=${value}; path=/`;
  const host = window.location.hostname;
  const parts = host.split(".");
  const apex = parts.length > 2 ? parts.slice(-2).join(".") : host;
  if (apex && apex.includes(".")) {
    document.cookie = `googtrans=${value}; domain=.${apex}; path=/`;
  }
  try { localStorage.setItem("vaulte_lang", target); } catch { /* ignore */ }
}

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<string>("en");
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

  // Skip on authenticated areas — those have their own in-sidebar selector.
  const skip = pathname?.startsWith("/dashboard") || pathname?.startsWith("/admin");

  // Filtered list — starred languages bubble to the top when no query.
  const visibleLanguages = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) {
      return [
        ...LANGUAGES.filter((l) => l.starred),
        ...LANGUAGES.filter((l) => !l.starred).sort((a, b) =>
          a.english.localeCompare(b.english)
        ),
      ];
    }
    return LANGUAGES.filter(
      (l) =>
        l.english.toLowerCase().includes(q) ||
        l.label.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q)
    ).sort((a, b) => a.english.localeCompare(b.english));
  }, [query]);

  // Initial language — prefer saved localStorage, fall back to cookie.
  useEffect(() => {
    try {
      const saved = localStorage.getItem("vaulte_lang");
      if (saved) setCurrent(saved);
      else setCurrent(readGoogTransCookie());
    } catch {
      setCurrent(readGoogTransCookie());
    }
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  // Focus the search input when the dropdown opens, reset on close
  useEffect(() => {
    if (open) {
      const id = window.setTimeout(() => searchRef.current?.focus(), 0);
      return () => window.clearTimeout(id);
    }
    setQuery("");
  }, [open]);

  const handleSelect = (code: string) => {
    setOpen(false);
    if (code === current) return;
    setCurrent(code);
    setGoogTransCookie(code);
    window.location.reload();
  };

  const currentLang = LANGUAGES.find((l) => l.code === current) || LANGUAGES[0];

  if (skip) return null;

  return (
    <div
      ref={rootRef}
      // `notranslate` keeps our own UI labels untouched — we don't want Google
      // translating "Español" into whatever the current target language is.
      className="notranslate vaulte-lang-switcher"
      translate="no"
      style={{
        position: "fixed",
        bottom: 24,
        left: 24,
        zIndex: 60,
      }}
    >
      {/* Dropdown panel */}
      {open && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            bottom: "calc(100% + 8px)",
            left: 0,
            display: "flex",
            width: 288,
            maxWidth: "calc(100vw - 48px)",
            maxHeight: "min(70vh, 520px)",
            flexDirection: "column",
            overflow: "hidden",
            borderRadius: 14,
            border: "1px solid rgba(96,165,250,0.25)",
            background: "rgba(6,9,26,0.95)",
            boxShadow: "0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
        >
          {/* Header: title + search */}
          <div style={{ borderBottom: "1px solid rgba(96,165,250,0.1)", padding: "12px 16px" }}>
            <p style={{
              marginBottom: 8,
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.16em",
              textTransform: "uppercase",
              color: "#60A5FA",
            }}>
              Choose Language · {LANGUAGES.length}
            </p>
            <div style={{ position: "relative" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                <circle cx="11" cy="11" r="8" />
                <path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search language…"
                aria-label="Search languages"
                style={{
                  width: "100%",
                  padding: "8px 30px 8px 32px",
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.08)",
                  background: "rgba(255,255,255,0.04)",
                  color: "#fff",
                  fontSize: 13,
                  outline: "none",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => { e.currentTarget.style.borderColor = "rgba(96,165,250,0.5)"; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  style={{
                    position: "absolute",
                    right: 6,
                    top: "50%",
                    transform: "translateY(-50%)",
                    padding: 4,
                    borderRadius: "50%",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    color: "rgba(255,255,255,0.4)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Scrollable list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
            {visibleLanguages.length === 0 ? (
              <p style={{ padding: "22px 16px", textAlign: "center", fontSize: 12, color: "rgba(255,255,255,0.45)" }}>
                No languages match &ldquo;{query}&rdquo;
              </p>
            ) : (
              visibleLanguages.map((lang) => {
                const active = lang.code === current;
                return (
                  <button
                    key={lang.code}
                    role="option"
                    aria-selected={active}
                    onClick={() => handleSelect(lang.code)}
                    style={{
                      display: "flex",
                      width: "100%",
                      alignItems: "center",
                      gap: 12,
                      padding: "9px 16px",
                      background: active ? "rgba(96,165,250,0.12)" : "transparent",
                      border: "none",
                      textAlign: "left",
                      fontSize: 13.5,
                      color: active ? "#60A5FA" : "rgba(255,255,255,0.75)",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      transition: "background 0.12s, color 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLButtonElement).style.background = "rgba(96,165,250,0.06)";
                        (e.currentTarget as HTMLButtonElement).style.color = "#fff";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.75)";
                      }
                    }}
                  >
                    <span style={{ flexShrink: 0, fontSize: 17, lineHeight: 1 }} aria-hidden="true">{lang.flag}</span>
                    <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: active ? 600 : 500 }}>{lang.label}</span>
                      {lang.label !== lang.english && (
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{lang.english}</span>
                      )}
                    </span>
                    {active && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Trigger button */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "9px 14px 9px 12px",
          borderRadius: 999,
          border: "1px solid rgba(96,165,250,0.35)",
          background: "rgba(6,9,26,0.9)",
          color: "#60A5FA",
          fontSize: 13,
          fontWeight: 600,
          fontFamily: "inherit",
          cursor: "pointer",
          boxShadow: "0 8px 24px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.03)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          transition: "all 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(96,165,250,0.6)";
          e.currentTarget.style.background = "rgba(11,24,54,0.95)";
          e.currentTarget.style.color = "#93C5FD";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(96,165,250,0.35)";
          e.currentTarget.style.background = "rgba(6,9,26,0.9)";
          e.currentTarget.style.color = "#60A5FA";
        }}
      >
        <span style={{ fontSize: 16, lineHeight: 1 }} aria-hidden="true">{currentLang.flag}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ opacity: 0.65 }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        <span className="vaulte-lang-label">{currentLang.label}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <style>{`
        @media (max-width: 480px) {
          .vaulte-lang-switcher { bottom: 16px !important; left: 16px !important; }
          .vaulte-lang-label { display: none; }
        }
      `}</style>
    </div>
  );
}
