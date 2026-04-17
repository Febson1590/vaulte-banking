import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import TawkToChat from "@/components/TawkToChat";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.vaulteapp.com"),
  title: "Vaulte — Global Digital Banking",
  description: "Borderless banking for everyone. Send, save, and manage money worldwide with Vaulte.",
  alternates: {
    canonical: "https://www.vaulteapp.com",
  },
  openGraph: {
    title: "Vaulte — Global Digital Banking",
    description: "Borderless banking for everyone. Send, save, and manage money worldwide with Vaulte.",
    url: "https://www.vaulteapp.com",
    siteName: "Vaulte",
    images: [
      {
        url: "https://www.vaulteapp.com/assets/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Vaulte — Global Digital Banking",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vaulte — Global Digital Banking",
    description: "Borderless banking for everyone. Send, save, and manage money worldwide with Vaulte.",
    images: ["https://www.vaulteapp.com/assets/og-image.jpg"],
  },
  icons: {
    icon: [
      { url: "/favicon.ico",       sizes: "any" },
      { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png",      type: "image/png", sizes: "192x192" },
    ],
    apple:    [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: [{ url: "/favicon.ico" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/*
         * ── SYNC LANGUAGE GUARD (runs before any script, including GT) ──────
         *
         * If the user has explicitly saved "en" as their language preference,
         * wipe the googtrans cookie immediately — before Google Translate's
         * script has a chance to read it and re-apply a stale foreign language.
         *
         * This must be the FIRST script in <head> so it executes synchronously
         * during HTML parsing, well before the afterInteractive GT bundle loads.
         *
         * Five cookie-deletion variants are required:
         *   1. No domain          (localhost / bare hostname)
         *   2. domain=hostname    (e.g. www.vaulteapp.com)
         *   3. domain=.hostname   (e.g. .www.vaulteapp.com)
         *   4. domain=apex        (e.g. vaulteapp.com)   ← GT sets cookie here
         *   5. domain=.apex       (e.g. .vaulteapp.com)  ← GT's typical form
         *
         * Variants 4-5 are critical for www-prefixed custom domains.  On
         * www.vaulteapp.com Google Translate sets the cookie on the APEX domain
         * (.vaulteapp.com), not on www.  Without clearing the apex cookie the
         * page reverts to the previous language on every reload despite the user
         * having selected English.  vaulte-banking.vercel.app has no www prefix
         * so this was not visible there — it only manifested on the custom domain.
         */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script dangerouslySetInnerHTML={{ __html:
          `(function(){try{` +
          `var l=localStorage.getItem('vaulte_lang');` +
          `if(l==='en'){` +
          `var e='expires=Thu, 01 Jan 1970 00:00:01 GMT';` +
          `var h=location.hostname;` +
          `document.cookie='googtrans=; path=/; '+e+';';` +
          `document.cookie='googtrans=; path=/; '+e+'; domain='+h+';';` +
          `document.cookie='googtrans=; path=/; '+e+'; domain=.'+h+';';` +
          `var p=h.split('.');` +
          `if(p.length>2){` +
          `var a=p.slice(-2).join('.');` +
          `document.cookie='googtrans=; path=/; '+e+'; domain='+a+';';` +
          `document.cookie='googtrans=; path=/; '+e+'; domain=.'+a+';';` +
          `}` +
          `}}catch(x){}})()`
        }} />

        {/*
         * Define the Google Translate callback inline in <head> so it is
         * available before translate.js loads (the script calls this function
         * as soon as it finishes loading via ?cb=googleTranslateElementInit).
         *
         * autoDisplay: false  →  suppress the default translation banner.
         * multilanguagePage   →  hints that content may already be multilingual.
         */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.googleTranslateElementInit = function () {
                new window.google.translate.TranslateElement(
                  { pageLanguage: 'en', autoDisplay: false, multilanguagePage: true },
                  'google_translate_element'
                );
              };
            `,
          }}
        />
      </head>
      <body>
        {/*
         * Invisible mounting point required by Google Translate.
         * Positioned out of flow so it never affects layout.
         */}
        <div
          id="google_translate_element"
          style={{ position: "absolute", visibility: "hidden", height: 0, overflow: "hidden" }}
        />

        {children}
        <LanguageSwitcher />
        <TawkToChat />

        {/* Load Google Translate after the page is interactive */}
        <Script
          src="//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
