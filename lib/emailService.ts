// ─────────────────────────────────────────────────────────────
//  Vaulte — Email Service (Resend integration, lazy-initialized)
//  Sends all system emails via Resend transactional email API
// ─────────────────────────────────────────────────────────────
import { Resend } from "resend";
import {
  verificationCodeEmail,
  loginOtpEmail,
  passwordResetEmail,
  newLoginAlertEmail,
  welcomeEmail,
  supportAckEmail,
} from "./emailTemplates";

// Lazy singleton — not instantiated at build/import time
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

const NOREPLY = "Vaulte <no-reply@vaulte.com>";
const SUPPORT = "Vaulte Support <support@vaulte.com>";

// ─── Generic send wrapper ────────────────────────────────────
async function sendEmail(opts: {
  from:    string;
  to:      string;
  subject: string;
  html:    string;
  text:    string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const resend = getResend();
    const result = await resend.emails.send({
      from:    opts.from,
      to:      opts.to,
      subject: opts.subject,
      html:    opts.html,
      text:    opts.text,
    });
    if (result.error) {
      console.error("[EmailService] Resend error:", result.error);
      return { success: false, error: result.error.message };
    }
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown email error";
    console.error("[EmailService] Exception:", msg);
    return { success: false, error: msg };
  }
}

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
  return sendEmail({
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
  return sendEmail({
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
  return sendEmail({
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
  return sendEmail({
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
  return sendEmail({
    from:    NOREPLY,
    to:      opts.to,
    subject: "Welcome to Vaulte — Your Account is Ready 🎉",
    html,
    text,
  });
}

// ─── 6. Send Support Acknowledgement ─────────────────────────
export async function sendSupportAck(opts: {
  to:        string;
  firstName: string;
  ticketRef: string;
  subject:   string;
  message:   string;
}): Promise<{ success: boolean; error?: string }> {
  const { html, text } = supportAckEmail(opts);
  return sendEmail({
    from:    SUPPORT,
    to:      opts.to,
    subject: `Re: ${opts.subject} [Ref: ${opts.ticketRef}]`,
    html,
    text,
  });
}
