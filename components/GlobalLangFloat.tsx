"use client";

/**
 * GlobalLangFloat
 * ───────────────
 * A floating language-selector widget injected by the root layout.
 * Renders only on auth pages (which have no navbar) so users can
 * switch language from login, register, forgot-password, etc.
 *
 * It is rendered as a frosted-glass card so it is clearly visible on
 * any page background (e.g. the blue gradient on the login page).
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

  if (!AUTH_PATHS.includes(pathname)) return null;

  return (
    <div
      style={{
        position:             "fixed",
        top:                  16,
        right:                16,
        zIndex:               9999,
        /* Frosted-glass card — readable on any page background */
        background:           "rgba(255,255,255,0.97)",
        backdropFilter:       "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        borderRadius:         12,
        boxShadow:            "0 2px 16px rgba(15,23,42,0.12), 0 1px 4px rgba(15,23,42,0.06)",
        border:               "1px solid rgba(15,23,42,0.07)",
      }}
    >
      <LanguageSelector variant="light" />
    </div>
  );
}
