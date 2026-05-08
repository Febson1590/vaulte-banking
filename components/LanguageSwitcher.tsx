"use client";

import { useEffect, useMemo, useRef, useState } from "react";

/**
 * LanguageSwitcher
 * ────────────────
 * Inline navbar language picker backed by Google Website Translator.
 *
 * The component renders a compact icon-button (globe + flag + chevron) that
 * matches the surrounding navbar.  It's NOT floating — it lives inside the
 * header markup of every page chrome that calls it (landing Navbar,
 * DashboardLayout topbar, AdminLayout header, marketing-page mini navs).
 *
 * Pass `variant="dark"` for navbars on the dark fintech background (landing,
 * marketing pages, login/register cards) and `variant="light"` for the white
 * dashboard / admin topbars.
 *
 * Translation flow (unchanged):
 *   1. We set the `googtrans` cookie Google Translate's element.js reads.
 *   2. Reload the page.
 *   3. Google Translate's loader, mounted in app/layout.tsx, picks up the
 *      cookie and re-translates the page on the way back in.
 *
 * Why cookie + reload instead of programmatic .goog-te-combo selection?
 * React re-renders disturb Google's DOM patching and produce flicker +
 * partially-untranslated content.  Cookie+reload is the official, reliable
 * path Google's own widget uses.
 */

type Language = {
  code:    string;
  label:   string;     // endonym — "Español", "中文 (简体)"
  english: string;     // exonym  — "Spanish", "Chinese (Simplified)"
  flag:    string;
  starred?: boolean;   // bubbles to top of list when no search query
};

const LANGUAGES: Language[] = [
  { code: "en",    flag: "🇺🇸", label: "English",          english: "English",                    starred: true },
  { code: "es",    flag: "🇪🇸", label: "Español",          english: "Spanish",                    starred: true },
  { code: "fr",    flag: "🇫🇷", label: "Français",         english: "French",                     starred: true },
  { code: "de",    flag: "🇩🇪", label: "Deutsch",          english: "German",                     starred: true },
  { code: "pt",    flag: "🇵🇹", label: "Português",        english: "Portuguese",                 starred: true },
  { code: "it",    flag: "🇮🇹", label: "Italiano",         english: "Italian",                    starred: true },
  { code: "nl",    flag: "🇳🇱", label: "Nederlands",       english: "Dutch",                      starred: true },
  { code: "ru",    flag: "🇷🇺", label: "Русский",          english: "Russian",                    starred: true },
  { code: "zh-CN", flag: "🇨🇳", label: "中文 (简体)",       english: "Chinese (Simplified)",       starred: true },
  { code: "zh-TW", flag: "🇹🇼", label: "中文 (繁體)",       english: "Chinese (Traditional)" },
  { code: "ja",    flag: "🇯🇵", label: "日本語",            english: "Japanese",                   starred: true },
  { code: "ko",    flag: "🇰🇷", label: "한국어",            english: "Korean",                     starred: true },
  { code: "ar",    flag: "🇸🇦", label: "العربية",          english: "Arabic",                     starred: true },
  { code: "hi",    flag: "🇮🇳", label: "हिन्दी",             english: "Hindi",                      starred: true },
  { code: "bn",    flag: "🇧🇩", label: "বাংলা",             english: "Bengali",                    starred: true },
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
              pageLanguage:        string;
              includedLanguages?:  string;
              layout?:             number;
              autoDisplay?:        boolean;
              multilanguagePage?:  boolean;
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
  const raw   = decodeURIComponent(match.split("=")[1] || "");
  const parts = raw.split("/").filter(Boolean);
  return parts[1] || "en";
}

function setGoogTransCookie(target: string) {
  if (target === "en") {
    const host  = typeof window === "undefined" ? "" : window.location.hostname;
    const parts = host.split(".");
    const apex  = parts.length > 2 ? parts.slice(-2).join(".") : host;
    const exp   = "expires=Thu, 01 Jan 1970 00:00:00 GMT";
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
  const host  = window.location.hostname;
  const parts = host.split(".");
  const apex  = parts.length > 2 ? parts.slice(-2).join(".") : host;
  if (apex && apex.includes(".")) {
    document.cookie = `googtrans=${value}; domain=.${apex}; path=/`;
  }
  try { localStorage.setItem("vaulte_lang", target); } catch { /* ignore */ }
}

interface LanguageSwitcherProps {
  /**
   * Visual variant.
   *  - "dark"  → for dark navbars (landing page, marketing nav, login pages)
   *  - "light" → for white topbars (user dashboard, admin)
   */
  variant?: "dark" | "light";
}

export default function LanguageSwitcher({ variant = "dark" }: LanguageSwitcherProps) {
  const isDark = variant === "dark";

  const [open, setOpen]       = useState(false);
  const [current, setCurrent] = useState<string>("en");
  const [query, setQuery]     = useState("");
  const rootRef   = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);

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

  // Close dropdown on outside click + Escape key
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown",   onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown",   onKey);
    };
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

  // ── Trigger button styling per variant ────────────────────────────────────
  const triggerStyle: React.CSSProperties = isDark
    ? {
        // Dark navbar (landing, marketing pages)
        background:    "transparent",
        border:        "1px solid rgba(255,255,255,0.18)",
        color:         "rgba(255,255,255,0.9)",
      }
    : {
        // Light navbar (dashboard, admin)
        background:    "transparent",
        border:        "1px solid rgba(15,23,42,0.08)",
        color:         "#0F172A",
      };

  return (
    <div
      ref={rootRef}
      className="notranslate vaulte-lang-switcher"
      translate="no"
      style={{ position: "relative", display: "inline-flex" }}
    >
      {/* ─── Trigger button ─────────────────────────────────────── */}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Change language"
        title={`Language: ${currentLang.label}`}
        onClick={() => setOpen((v) => !v)}
        style={{
          display:        "inline-flex",
          alignItems:     "center",
          gap:            6,
          height:         38,
          padding:        "0 10px",
          borderRadius:   10,
          fontFamily:     "inherit",
          fontSize:       13,
          fontWeight:     600,
          cursor:         "pointer",
          transition:     "background 0.15s, border-color 0.15s",
          ...triggerStyle,
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = isDark
            ? "rgba(255,255,255,0.06)"
            : "rgba(15,23,42,0.04)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLButtonElement).style.background = "transparent";
        }}
      >
        {/* Globe icon */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ opacity: 0.85 }}
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>

        {/* Current language code (EN, FR, DE…) — clearer than just a flag,
           which doesn't render on every device. */}
        <span style={{ letterSpacing: "0.04em" }}>{currentLang.code.slice(0, 2).toUpperCase()}</span>

        <svg
          width="11"
          height="11"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ transition: "transform 0.18s", transform: open ? "rotate(180deg)" : "none", opacity: 0.7 }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* ─── Dropdown panel ─────────────────────────────────────── */}
      {open && (
        <div
          role="listbox"
          style={{
            position:     "absolute",
            top:          "calc(100% + 8px)",
            right:        0,
            width:        280,
            maxWidth:     "calc(100vw - 32px)",
            maxHeight:    "min(70vh, 480px)",
            display:      "flex",
            flexDirection:"column",
            overflow:     "hidden",
            borderRadius: 14,
            border:       isDark ? "1px solid rgba(96,165,250,0.25)" : "1px solid rgba(15,23,42,0.08)",
            background:   isDark ? "rgba(6,9,26,0.97)"               : "#fff",
            boxShadow:    isDark
                            ? "0 20px 60px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.04)"
                            : "0 18px 50px rgba(15,23,42,0.18), 0 4px 12px rgba(15,23,42,0.06)",
            backdropFilter:        isDark ? "blur(14px)" : undefined,
            WebkitBackdropFilter:  isDark ? "blur(14px)" : undefined,
            zIndex:       100,
          }}
        >
          {/* Search box */}
          <div style={{ borderBottom: isDark ? "1px solid rgba(96,165,250,0.1)" : "1px solid #E5E7EB", padding: "10px 12px" }}>
            <div style={{ position: "relative" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={isDark ? "rgba(255,255,255,0.4)" : "#94A3B8"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
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
                  width:        "100%",
                  padding:      "8px 30px 8px 32px",
                  borderRadius: 8,
                  border:       isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E5E7EB",
                  background:   isDark ? "rgba(255,255,255,0.04)"          : "#F8FAFC",
                  color:        isDark ? "#fff"                            : "#0F172A",
                  fontSize:     13,
                  outline:      "none",
                  fontFamily:   "inherit",
                  boxSizing:    "border-box",
                }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  aria-label="Clear search"
                  style={{
                    position:   "absolute",
                    right:      6,
                    top:        "50%",
                    transform:  "translateY(-50%)",
                    padding:    4,
                    borderRadius: "50%",
                    border:     "none",
                    background: "transparent",
                    cursor:     "pointer",
                    color:      isDark ? "rgba(255,255,255,0.4)" : "#9CA3AF",
                    display:    "flex",
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

          {/* Scrollable language list */}
          <div style={{ flex: 1, overflowY: "auto", padding: "4px 0" }}>
            {visibleLanguages.length === 0 ? (
              <p style={{ padding: "22px 16px", textAlign: "center", fontSize: 12, color: isDark ? "rgba(255,255,255,0.45)" : "#9CA3AF" }}>
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
                      display:    "flex",
                      width:      "100%",
                      alignItems: "center",
                      gap:        12,
                      padding:    "9px 14px",
                      background: active
                                    ? (isDark ? "rgba(96,165,250,0.12)" : "rgba(26,115,232,0.08)")
                                    : "transparent",
                      border:     "none",
                      textAlign:  "left",
                      fontSize:   13,
                      color:      active
                                    ? (isDark ? "#60A5FA" : "#1A73E8")
                                    : (isDark ? "rgba(255,255,255,0.78)" : "#0F172A"),
                      cursor:     "pointer",
                      fontFamily: "inherit",
                      transition: "background 0.12s, color 0.12s",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLButtonElement).style.background = isDark
                          ? "rgba(96,165,250,0.06)"
                          : "#F8FAFC";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                      }
                    }}
                  >
                    <span style={{ flexShrink: 0, fontSize: 17, lineHeight: 1 }} aria-hidden="true">{lang.flag}</span>
                    <span style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column" }}>
                      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontWeight: active ? 600 : 500 }}>{lang.label}</span>
                      {lang.label !== lang.english && (
                        <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", fontSize: 11, color: isDark ? "rgba(255,255,255,0.4)" : "#94A3B8" }}>{lang.english}</span>
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
    </div>
  );
}
