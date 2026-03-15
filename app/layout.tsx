import type { Metadata } from "next";
import { Inter } from "next/font/google";
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
      <body>
        {children}
        <TawkToChat />
      </body>
    </html>
  );
}
