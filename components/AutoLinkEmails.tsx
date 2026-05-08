"use client";
import React from "react";

/**
 * AutoLinkEmails
 * ──────────────
 * Takes plain text (potentially with newlines) and renders it with any
 * email addresses inside automatically wrapped in a `<a href="mailto:…">`
 * link.  Anywhere a Vaulte mailto is mentioned in user-facing copy,
 * passing the text through this component makes it instantly clickable —
 * the user's default mail client (Gmail web, Outlook, Apple Mail, etc.)
 * opens with the address pre-filled.
 *
 * It also preserves newlines via white-space: pre-line on the wrapping
 * element so legal pages keep their formatting.
 *
 * Usage:
 *   <AutoLinkEmails text={section.content} />
 *
 * If you need to override the link colour, pass `linkStyle`.
 */

// Reasonable email regex — matches the standard `local@domain.tld` form.
// Not RFC-perfect (no quoted local-parts) but covers every address we
// actually display on the site.
const EMAIL_RE = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;

interface Props {
  text:        string;
  linkStyle?:  React.CSSProperties;
  className?:  string;
  style?:      React.CSSProperties;
}

export default function AutoLinkEmails({ text, linkStyle, className, style }: Props) {
  // split() with a capturing group returns [textBefore, match, textBetween,
  // match, …].  Even indices = surrounding text, odd indices = email match.
  // This is more reliable than calling .test() on a /g regex (which is
  // stateful and can produce wrong results on subsequent calls).
  const parts = text.split(EMAIL_RE);

  return (
    <span className={className} style={{ whiteSpace: "pre-line", ...style }}>
      {parts.map((part, i) =>
        i % 2 === 1
          ? (
            <a
              key={i}
              href={`mailto:${part}`}
              style={{
                color:          "#1A73E8",
                textDecoration: "none",
                fontWeight:     600,
                ...linkStyle,
              }}
            >
              {part}
            </a>
          )
          : <React.Fragment key={i}>{part}</React.Fragment>
      )}
    </span>
  );
}
