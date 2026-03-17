"use client";

/**
 * GlobalLangFloat
 * ───────────────
 * A fixed, floating language-selector widget rendered by the root layout.
 * It shows ONLY on auth pages that have no navbar of their own, so users
 * can switch language even before they log in.
 *
 * Auth pages covered:
 *   /login  /register  /forgot-password  /reset-password
 *   /login-verify  /verify-email
 */

import { usePathname } from "next/navigation";
import LanguageSelector from "@/components/LanguageSelector";

const AUTH_PATHS = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/login-verify",
  "/verify-email",
];

export default function GlobalLangFloat() {
  const pathname = usePathname();

  // Only render on auth pages
  if (!AUTH_PATHS.includes(pathname)) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 16,
        right: 16,
        zIndex: 9999,
      }}
    >
      <LanguageSelector variant="light" />
    </div>
  );
}
