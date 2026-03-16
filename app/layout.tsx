import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import TawkToChat from "@/components/TawkToChat";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Vaulte — Global Digital Banking",
  description: "Borderless banking for everyone. Send, save, and manage money worldwide with Vaulte.",
  icons: {
    icon:     [{ url: "/icon.png",       type: "image/png", sizes: "32x32"   }],
    apple:    [{ url: "/apple-icon.png", type: "image/png", sizes: "180x180" }],
    shortcut: [{ url: "/favicon.ico" }],
    other:    [{ rel: "icon",            url: "/icon-192.png", sizes: "192x192" }],
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
