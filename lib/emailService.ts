// ─────────────────────────────────────────────────────────────
//  Vaulte — Email Service
//
//  Two-track email delivery:
//
//   1. SYSTEM MAIL (high-volume, transactional, no human reply needed)
//      → Resend, sent from no-reply@vaulteapp.com
//      → Verification codes, login OTPs, password resets, login alerts,
//        welcome.
//
//   2. SUPPORT MAIL (low-volume, threaded, human-readable, replies needed)
//      → Zoho Mail SMTP, sent from / received at support@vaulteapp.com
//      → Customer ticket alert (lands in Zoho inbox), acknowledgement to
//        the customer, branded reply from a human agent.
//
//  This split keeps automation off the support inbox while letting
//  customer threads land in a real mailbox we can reply to.
// ─────────────────────────────────────────────────────────────
import { Resend } from "resend";
import nodemailer, { Transporter } from "nodemailer";
import {
  verificationCodeEmail,
  loginOtpEmail,
  passwordResetEmail,
  newLoginAlertEmail,
  welcomeEmail,
  supportAckEmail,
  internalSupportAlertEmail,
  supportReplyEmail,
} from "./emailTemplates";

// ─── Lazy Resend client (system mail) ────────────────────────
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY;
    if (!key) {
      throw new Error(
        "Resend is not configured. Set RESEND_API_KEY in .env.local. See .env.example."
      );
    }
    _resend = new Resend(key);
  }
  return _resend;
}

// ─── Lazy Zoho SMTP transporter (support mail) ───────────────
//
// Built on first use only.  Reads four env vars:
//   ZOHO_SMTP_HOST   — smtppro.zoho.com (paid plans: Lite/Standard/Premium)
//                     or smtp.zoho.com  (free Zoho Mail tier)
//                     EU/IN regions:  smtppro.zoho.eu / smtppro.zoho.in
//   ZOHO_SMTP_PORT   — 465 (SSL) recommended; 587 (STARTTLS) also works
//   ZOHO_SMTP_USER   — full mailbox address, e.g. support@vaulteapp.com
//   ZOHO_SMTP_PASS   — Zoho APP-SPECIFIC password, NOT the login password
let _zoho: Transporter | null = null;
function getZoho(): Transporter {
  if (!_zoho) {
    // Default to the paid-plan host since Vaulte runs on Zoho Mail Lite.
    const host = process.env.ZOHO_SMTP_HOST || "smtppro.zoho.com";
    const port = Number(process.env.ZOHO_SMTP_PORT || 465);
    const user = process.env.ZOHO_SMTP_USER;
    const pass = process.env.ZOHO_SMTP_PASS;
    if (!user || !pass) {
      throw new Error(
        "Zoho SMTP is not configured. Set ZOHO_SMTP_USER and ZOHO_SMTP_PASS in .env.local. See .env.example."
      );
    }
    _zoho = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,        // SSL on 465; STARTTLS on 587
      auth: { user, pass },
    });
  }
  return _zoho;
}

const NOREPLY = "Vaulte <no-reply@vaulteapp.com>";
const SUPPORT = "Vaulte Support <support@vaulteapp.com>";

// ─── Resend send wrapper (system mail) ───────────────────────
async function sendViaResend(opts: {
  from:     string;
  to:       string;
  subject:  string;
  html:     string;
  text:     string;
  replyTo?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from:    opts.from,
      to:      opts.to,
      subject: opts.subject,
      html:    opts.html,
      text:    opts.text,
      ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
    });
    if (result.error) {
      console.error("[EmailService/Resend] error:", result.error);
      return { success: false, error: result.error.message };
    }
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown email error";
    console.error("[EmailService/Resend] exception:", msg);
    return { success: false, error: msg };
  }
}

// ─── Zoho SMTP send wrapper (support mail) ───────────────────
async function sendViaZoho(opts: {
  from:     string;
  to:       string;
  subject:  string;
  html:     string;
  text:     string;
  replyTo?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const transporter = getZoho();
    const info = await transporter.sendMail({
      from:    opts.from,
      to:      opts.to,
      subject: opts.subject,
      html:    opts.html,
      text:    opts.text,
      ...(opts.replyTo ? { replyTo: opts.replyTo } : {}),
    });
    // Zoho returns SMTP response status in info.response (e.g. "250 OK ...")
    return { success: true, error: info.response };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown SMTP error";
    console.error("[EmailService/Zoho] exception:", msg);
    return { success: false, error: msg };
  }
}

// ═════════════════════════════════════════════════════════════
//  SYSTEM MAIL  →  Resend  →  no-reply@vaulteapp.com
// ═════════════════════════════════════════════════════════════

// ─── 1. Send Account Verification Code ───────────────────────
export async function sendVerificationCode(opts: {
  to:        string;
  firstName: string;
  code:      string;
}): Promise<{ success: boolean; error?: string }> {
  const { html, text } = verificationCodeEmail({
    firstName: opts.firstName,
    code:      opts.code,
    expiryMin: 10,
  });
  return sendViaResend({
    from:    NOREPLY,
    to:      opts.to,
    subject: "Vaulte Account Verification Code",
    html,
    text,
  });
}

// ─── 2. Send Login OTP ────────────────────────────────────────
export async function sendLoginOtp(opts: {
  to:        string;
  firstName: string;
  code:      string;
  ip:        string;
  device:    string;
  time:      string;
}): Promise<{ success: boolean; error?: string }> {
  const { html, text } = loginOtpEmail({
    firstName: opts.firstName,
    code:      opts.code,
    expiryMin: 5,
    ip:        opts.ip,
    device:    opts.device,
    time:      opts.time,
  });
  return sendViaResend({
    from:    NOREPLY,
    to:      opts.to,
    subject: "Vaulte Secure Login Code",
    html,
    text,
  });
}

// ─── 3. Send Password Reset Email ────────────────────────────
export async function sendPasswordReset(opts: {
  to:         string;
  firstName:  string;
  resetUrl:   string;
  ip:         string;
  time:       string;
}): Promise<{ success: boolean; error?: string }> {
  const { html, text } = passwordResetEmail({
    firstName:  opts.firstName,
    resetUrl:   opts.resetUrl,
    expiryMin:  15,
    ip:         opts.ip,
    time:       opts.time,
  });
  return sendViaResend({
    from:    NOREPLY,
    to:      opts.to,
    subject: "Vaulte Password Reset Request",
    html,
    text,
  });
}

// ─── 4. Send New Login Alert Email ───────────────────────────
export async function sendLoginAlert(opts: {
  to:        string;
  firstName: string;
  ip:        string;
  device:    string;
  browser:   string;
  time:      string;
  isNewIp:   boolean;
}): Promise<{ success: boolean; error?: string }> {
  const { html, text } = newLoginAlertEmail(opts);
  return sendViaResend({
    from:    NOREPLY,
    to:      opts.to,
    subject: "New Login Detected on Your Vaulte Account",
    html,
    text,
  });
}

// ─── 5. Send Welcome Email ────────────────────────────────────
export async function sendWelcomeEmail(opts: {
  to:        string;
  firstName: string;
  email:     string;
}): Promise<{ success: boolean; error?: string }> {
  const { html, text } = welcomeEmail({ firstName: opts.firstName, email: opts.email });
  return sendViaResend({
    from:    NOREPLY,
    to:      opts.to,
    subject: "Welcome to Vaulte — Your Account is Ready 🎉",
    html,
    text,
  });
}

// ═════════════════════════════════════════════════════════════
//  SUPPORT MAIL  →  Zoho SMTP  →  support@vaulteapp.com
//  Lands in / sends from the real Zoho mailbox so threads work.
// ═════════════════════════════════════════════════════════════

// ─── 6. Internal Support Alert (customer ticket → Zoho inbox) ──
//
// from:    Vaulte Support <support@vaulteapp.com>   — the From matches the inbox
//                                                     so Zoho threads with replies
// to:      support@vaulteapp.com                    — the team inbox
// replyTo: customer email                           — clicking Reply in Zoho goes
//                                                     directly to the customer
export async function sendInternalSupportAlert(opts: {
  ticketRef: string;
  firstName: string;
  lastName:  string;
  email:     string;
  category:  string;
  priority:  string;
  subject:   string;
  message:   string;
}): Promise<{ success: boolean; error?: string }> {
  const { html, text } = internalSupportAlertEmail(opts);
  const customerName   = [opts.firstName, opts.lastName].filter(Boolean).join(" ") || opts.email;
  return sendViaZoho({
    from:    SUPPORT,
    to:      "support@vaulteapp.com",
    replyTo: opts.email,
    subject: `[${opts.priority.toUpperCase()}] ${opts.ticketRef} — ${opts.category} | ${customerName}`,
    html,
    text,
  });
}

// ─── 7. Support Acknowledgement (Zoho → customer) ────────────
//
// from:    Vaulte Support <support@vaulteapp.com>   — looks trustworthy to the customer
// replyTo: support@vaulteapp.com                    — customer's reply lands in Zoho
export async function sendSupportAck(opts: {
  to:        string;
  firstName: string;
  ticketRef: string;
  subject:   string;
  message:   string;
}): Promise<{ success: boolean; error?: string }> {
  const { html, text } = supportAckEmail(opts);
  return sendViaZoho({
    from:    SUPPORT,
    to:      opts.to,
    replyTo: "support@vaulteapp.com",
    subject: `Re: ${opts.subject} [Ref: ${opts.ticketRef}]`,
    html,
    text,
  });
}

// ─── 8. Branded Support Reply (human agent → customer, via Zoho) ──
//
// Used when an admin replies to a customer through the Vaulte admin
// console.  Sent through Zoho so the message appears in our Sent
// folder and Gmail/Outlook authenticate it via DKIM/SPF.
export async function sendSupportReply(opts: {
  to:           string;
  customerName: string;
  subject:      string;
  messageText:  string;
}): Promise<{ success: boolean; error?: string }> {
  const { html, text } = supportReplyEmail({
    customerName: opts.customerName,
    subject:      opts.subject,
    messageText:  opts.messageText,
  });
  return sendViaZoho({
    from:    SUPPORT,
    to:      opts.to,
    replyTo: "support@vaulteapp.com",
    subject: opts.subject,
    html,
    text,
  });
}
