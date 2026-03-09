import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
