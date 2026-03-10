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
