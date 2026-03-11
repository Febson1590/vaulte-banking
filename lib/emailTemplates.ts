// ─────────────────────────────────────────────────────────────
//  Vaulte — Premium Branded Email Template System
//  Master base layout + all 6 email types
//  Design: Premium digital banking, dark navy header,
//          clean white card, blue accent, professional footer
// ─────────────────────────────────────────────────────────────

const LOGO_URL = "https://vaulte-banking.vercel.app/assets/logo-vaulte.png";
const SUPPORT_EMAIL  = "support@vaulte.com";
const NOREPLY_EMAIL  = "no-reply@vaulte.com";
const BRAND_PRIMARY  = "#1A73E8";
const BRAND_NAVY     = "#0F172A";
const BRAND_LIGHT    = "#F3F5FA";

// ─── Master Base Layout ──────────────────────────────────────
function baseLayout(opts: {
  preheader:   string;
  headerTitle: string;
  headerSub?:  string;
  body:        string;
  footerNote:  string;
  footerFrom:  "no-reply" | "support";
}): string {
  const fromEmail = opts.footerFrom === "no-reply" ? NOREPLY_EMAIL : SUPPORT_EMAIL;
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${opts.headerTitle} — Vaulte</title>
  <!--[if mso]>
  <noscript>
    <xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml>
  </noscript>
  <![endif]-->
  <style>
    /* Reset */
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { -ms-interpolation-mode: bicubic; border: 0; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; background-color: ${BRAND_LIGHT}; }
    /* Responsive */
    @media only screen and (max-width: 620px) {
      .email-container { width: 100% !important; max-width: 100% !important; }
      .content-pad { padding: 28px 20px !important; }
      .code-box { font-size: 32px !important; letter-spacing: 10px !important; padding: 20px 16px !important; }
      .btn { padding: 14px 24px !important; font-size: 15px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${BRAND_LIGHT};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">

  <!-- Preheader (hidden preview text) -->
  <div style="display:none;max-height:0;overflow:hidden;font-size:1px;color:${BRAND_LIGHT};">
    ${opts.preheader}&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>

  <!-- Email wrapper -->
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:${BRAND_LIGHT};margin:0;padding:0;">
    <tr>
      <td align="center" style="padding:32px 16px;">

        <!-- Email container -->
        <table role="presentation" class="email-container" cellpadding="0" cellspacing="0" width="580" style="max-width:580px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,0.10),0 1px 4px rgba(15,23,42,0.06);">

          <!-- HEADER -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND_NAVY} 0%,#1e293b 100%);padding:0;text-align:center;position:relative;">
              <!-- Decorative circles -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td style="padding:32px 40px 28px;text-align:center;">
                    <!-- Logo -->
                    <img src="${LOGO_URL}" alt="Vaulte" width="130" style="max-width:130px;height:auto;display:inline-block;filter:brightness(0)invert(1);opacity:0.95;" />
                    <div style="margin-top:16px;">
                      <p style="margin:0;font-size:11px;font-weight:600;letter-spacing:2.5px;text-transform:uppercase;color:rgba(255,255,255,0.45);">Digital Banking Platform</p>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- TITLE BANNER -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND_PRIMARY} 0%,#1557b0 100%);padding:22px 40px;text-align:center;">
              <h1 style="margin:0;font-size:20px;font-weight:800;color:#ffffff;letter-spacing:-0.3px;line-height:1.3;">${opts.headerTitle}</h1>
              ${opts.headerSub ? `<p style="margin:6px 0 0;font-size:13.5px;color:rgba(255,255,255,0.80);font-weight:400;">${opts.headerSub}</p>` : ""}
            </td>
          </tr>

          <!-- BODY CONTENT -->
          <tr>
            <td class="content-pad" style="padding:36px 40px 28px;background:#ffffff;">
              ${opts.body}
            </td>
          </tr>

          <!-- DIVIDER -->
          <tr>
            <td style="padding:0 40px;">
              <div style="border-top:1px solid #E2E8F0;"></div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:24px 40px 32px;background:#ffffff;">
              <!-- Footer note -->
              <p style="margin:0 0 16px;font-size:12px;color:#94A3B8;line-height:1.6;text-align:center;">
                ${opts.footerNote}
              </p>
              <!-- Footer identity row -->
              <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td align="center">
                    <p style="margin:0;font-size:12px;color:#CBD5E1;">
                      Sent from <strong style="color:#64748B;">${fromEmail}</strong> · Vaulte Digital Banking
                    </p>
                    <p style="margin:8px 0 0;font-size:11.5px;color:#CBD5E1;">
                      Need help? Contact us at
                      <a href="mailto:${SUPPORT_EMAIL}" style="color:${BRAND_PRIMARY};text-decoration:none;font-weight:600;">${SUPPORT_EMAIL}</a>
                    </p>
                    <p style="margin:14px 0 0;font-size:11px;color:#E2E8F0;">
                      © ${new Date().getFullYear()} Vaulte Financial Ltd. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>
        <!-- End email container -->

      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ─── Shared UI Components ────────────────────────────────────

function codeBox(code: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;">
  <tr>
    <td align="center">
      <div class="code-box" style="
        display:inline-block;
        background:linear-gradient(135deg,#EEF4FF 0%,#DBEAFE 100%);
        border:2px solid #BFDBFE;
        border-radius:14px;
        padding:24px 32px;
        font-size:38px;
        font-weight:900;
        color:${BRAND_NAVY};
        letter-spacing:14px;
        font-family:'Courier New',Courier,monospace;
        min-width:220px;
        text-align:center;
        box-shadow:0 4px 14px rgba(26,115,232,0.12);
      ">${code}</div>
    </td>
  </tr>
</table>`;
}

function actionButton(text: string, url: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:24px 0;">
  <tr>
    <td align="center">
      <a href="${url}" class="btn" style="
        display:inline-block;
        background:linear-gradient(135deg,${BRAND_PRIMARY} 0%,#1557b0 100%);
        color:#ffffff;
        font-size:15.5px;
        font-weight:700;
        text-decoration:none;
        padding:15px 36px;
        border-radius:10px;
        letter-spacing:0.2px;
        box-shadow:0 4px 14px rgba(26,115,232,0.38);
        font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Arial,sans-serif;
      ">${text}</a>
      <p style="margin:12px 0 0;font-size:12px;color:#94A3B8;">
        Button not working?
        <a href="${url}" style="color:${BRAND_PRIMARY};text-decoration:underline;word-break:break-all;">${url}</a>
      </p>
    </td>
  </tr>
</table>`;
}

function securityBadge(text: string, type: "warning" | "info" = "warning"): string {
  const colors = {
    warning: { bg: "#FEF2F2", border: "#FECACA", icon: "⚠️", text: "#7F1D1D" },
    info:    { bg: "#EFF6FF", border: "#BFDBFE", icon: "🔒", text: "#1e3a5f" },
  }[type];
  return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0 0;">
  <tr>
    <td style="
      background:${colors.bg};
      border:1px solid ${colors.border};
      border-radius:10px;
      padding:14px 18px;
    ">
      <p style="margin:0;font-size:12.5px;color:${colors.text};line-height:1.6;">
        <strong>${colors.icon} Security Notice:</strong> ${text}
      </p>
    </td>
  </tr>
</table>`;
}

function greeting(name: string): string {
  return `<p style="margin:0 0 16px;font-size:16px;color:${BRAND_NAVY};font-weight:600;">Hello${name ? `, ${name}` : ""}! 👋</p>`;
}

function paragraph(text: string, opts?: { bold?: boolean; color?: string }): string {
  const weight = opts?.bold ? "font-weight:600;" : "";
  const color  = opts?.color ? `color:${opts.color};` : `color:#374151;`;
  return `<p style="margin:0 0 14px;font-size:14.5px;line-height:1.7;${color}${weight}">${text}</p>`;
}

function metaRow(label: string, value: string): string {
  return `
<tr>
  <td style="padding:10px 16px;border-bottom:1px solid #F1F5F9;">
    <span style="font-size:12px;color:#94A3B8;font-weight:600;text-transform:uppercase;letter-spacing:0.8px;">${label}</span>
  </td>
  <td style="padding:10px 16px;border-bottom:1px solid #F1F5F9;text-align:right;">
    <span style="font-size:13.5px;color:${BRAND_NAVY};font-weight:600;">${value}</span>
  </td>
</tr>`;
}

function metaTable(rows: [string, string][]): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:20px 0;background:#F8FAFC;border-radius:10px;border:1px solid #E2E8F0;overflow:hidden;">
  ${rows.map(([l, v]) => metaRow(l, v)).join("")}
</table>`;
}

// ─── 1. Account Verification Code Email ─────────────────────
export function verificationCodeEmail(opts: {
  firstName: string;
  code:      string;
  expiryMin: number;
}): { html: string; text: string } {
  const body = `
    ${greeting(opts.firstName)}
    ${paragraph("Thank you for creating your Vaulte account! To complete your registration and verify your email address, enter the 6-digit code below:")}

    ${codeBox(opts.code)}

    ${metaTable([
      ["Code expires in", `${opts.expiryMin} minutes`],
      ["Email verified",  "Pending"],
    ])}

    ${paragraph("This code is single-use and will expire automatically. Do not share this code with anyone, including Vaulte staff.", { color: "#64748B" })}

    ${securityBadge(`For your security, never share this verification code with anyone. Vaulte will never ask for your code. If you did not create an account, please ignore this email or contact <a href="mailto:${SUPPORT_EMAIL}" style="color:#DC2626;">${SUPPORT_EMAIL}</a>`)}
  `;

  const text = `Hello ${opts.firstName},

Your Vaulte account verification code is: ${opts.code}

This code expires in ${opts.expiryMin} minutes.

If you did not create a Vaulte account, please ignore this email or contact ${SUPPORT_EMAIL}.

— Vaulte Security Team`;

  return {
    html: baseLayout({
      preheader:   `Your Vaulte verification code: ${opts.code} — expires in ${opts.expiryMin} minutes`,
      headerTitle: "Verify Your Email Address",
      headerSub:   "One quick step to activate your Vaulte account",
      body,
      footerNote:  `This is an automated security email sent to confirm your identity. Do not reply to this email.`,
      footerFrom:  "no-reply",
    }),
    text,
  };
}

// ─── 2. Login OTP / Step-Up Verification Email ───────────────
export function loginOtpEmail(opts: {
  firstName: string;
  code:      string;
  expiryMin: number;
  ip:        string;
  device:    string;
  time:      string;
}): { html: string; text: string } {
  const body = `
    ${greeting(opts.firstName)}
    ${paragraph("A login attempt was detected on your Vaulte account. To complete your sign-in, enter the secure verification code below:")}

    ${codeBox(opts.code)}

    ${metaTable([
      ["Time",       opts.time],
      ["IP Address", opts.ip],
      ["Device",     opts.device],
      ["Expires in", `${opts.expiryMin} minutes`],
    ])}

    ${paragraph("If you did not attempt to sign in, your account may be at risk. Please secure your account immediately.", { color: "#DC2626", bold: true })}

    ${securityBadge(`Do not share this code with anyone. Vaulte will never ask for your login code. If this was not you, contact <a href="mailto:${SUPPORT_EMAIL}" style="color:#DC2626;">${SUPPORT_EMAIL}</a> immediately.`)}
  `;

  const text = `Hello ${opts.firstName},

Your Vaulte login verification code is: ${opts.code}

Login details:
- Time: ${opts.time}
- IP Address: ${opts.ip}
- Device: ${opts.device}

This code expires in ${opts.expiryMin} minutes.

If this was not you, contact ${SUPPORT_EMAIL} immediately.

— Vaulte Security Team`;

  return {
    html: baseLayout({
      preheader:   `Your Vaulte login code: ${opts.code} — expires in ${opts.expiryMin} minutes`,
      headerTitle: "Secure Login Verification",
      headerSub:   "Enter this code to complete your sign-in",
      body,
      footerNote:  `This verification code was generated because someone attempted to log into your Vaulte account.`,
      footerFrom:  "no-reply",
    }),
    text,
  };
}

// ─── 3. Password Reset Email ─────────────────────────────────
export function passwordResetEmail(opts: {
  firstName:  string;
  resetUrl:   string;
  expiryMin:  number;
  ip:         string;
  time:       string;
}): { html: string; text: string } {
  const body = `
    ${greeting(opts.firstName)}
    ${paragraph("We received a request to reset the password for your Vaulte account. Click the secure button below to create a new password:")}

    ${actionButton("Reset My Password →", opts.resetUrl)}

    ${metaTable([
      ["Requested at", opts.time],
      ["From IP",      opts.ip],
      ["Link expires", `${opts.expiryMin} minutes`],
      ["Single-use",   "Yes — link invalidates after use"],
    ])}

    ${paragraph("This link will expire in <strong>${opts.expiryMin} minutes</strong> and can only be used once. If the link has expired, you can request a new one on the login page.")}

    ${securityBadge(`If you did not request a password reset, your account may be at risk. Do not click the link above and contact <a href="mailto:${SUPPORT_EMAIL}" style="color:#DC2626;">${SUPPORT_EMAIL}</a> immediately.`)}
  `;

  const text = `Hello ${opts.firstName},

We received a request to reset your Vaulte account password.

Click the link below to reset your password:
${opts.resetUrl}

This link expires in ${opts.expiryMin} minutes and is single-use.

Request details:
- Time: ${opts.time}
- IP: ${opts.ip}

If you did not request this, contact ${SUPPORT_EMAIL} immediately.

— Vaulte Security Team`;

  return {
    html: baseLayout({
      preheader:   `Reset your Vaulte password — link expires in ${opts.expiryMin} minutes`,
      headerTitle: "Password Reset Request",
      headerSub:   "Secure link to reset your Vaulte account password",
      body,
      footerNote:  `This reset link was generated because a password reset was requested for your account. If you did not make this request, please contact support immediately.`,
      footerFrom:  "no-reply",
    }),
    text,
  };
}

// ─── 4. New Login Alert Email ────────────────────────────────
export function newLoginAlertEmail(opts: {
  firstName: string;
  ip:        string;
  device:    string;
  browser:   string;
  time:      string;
  isNewIp:   boolean;
}): { html: string; text: string } {
  const alertType = opts.isNewIp ? "New IP Address Detected" : "New Device Detected";
  const body = `
    ${greeting(opts.firstName)}
    ${paragraph(`A successful login was detected on your Vaulte account${opts.isNewIp ? " from a <strong>new IP address</strong>" : " from a new device"}. Please review the details below:`)}

    ${metaTable([
      ["Time",       opts.time],
      ["IP Address", opts.ip],
      ["Device",     opts.device],
      ["Browser",    opts.browser],
      ["Status",     "✅ Login Successful"],
    ])}

    ${paragraph("If this was you, no action is required. If you do not recognize this login, your account may have been accessed without your permission.")}

    ${actionButton("Secure My Account →", "https://vaulte-banking.vercel.app/dashboard/security")}

    ${securityBadge(`If this login was NOT you, reset your password immediately and contact <a href="mailto:${SUPPORT_EMAIL}" style="color:#DC2626;">${SUPPORT_EMAIL}</a>. Do not share your password with anyone.`)}
  `;

  const text = `Hello ${opts.firstName},

A new login was detected on your Vaulte account.

Login details:
- Time: ${opts.time}
- IP Address: ${opts.ip}
- Device: ${opts.device}
- Browser: ${opts.browser}

If this was you, no action is needed.

If this was NOT you, reset your password immediately and contact ${SUPPORT_EMAIL}.

— Vaulte Security Team`;

  return {
    html: baseLayout({
      preheader:   `${alertType} on your Vaulte account — ${opts.time}`,
      headerTitle: "New Login Detected",
      headerSub:   alertType,
      body,
      footerNote:  `This security alert was sent because a login was detected on your Vaulte account. You receive these alerts to help protect your account.`,
      footerFrom:  "no-reply",
    }),
    text,
  };
}

// ─── 5. Welcome Email ────────────────────────────────────────
export function welcomeEmail(opts: {
  firstName: string;
  email:     string;
}): { html: string; text: string } {
  const body = `
    ${greeting(opts.firstName)}
    ${paragraph("Welcome to <strong>Vaulte Digital Banking</strong> — your account is now fully verified and active. 🎉")}
    ${paragraph("Here's what you can do with your Vaulte account:")}

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0 24px;">
      ${[
        ["💳", "Virtual Card", "Get a virtual debit card for online payments"],
        ["⇄",  "Transfers",   "Send money globally with zero hidden fees"],
        ["🔄", "Exchange",    "Convert currencies at live interbank rates"],
        ["🪪", "KYC / ID",    "Complete identity verification to unlock all features"],
      ].map(([icon, title, desc]) => `
      <tr>
        <td style="padding:10px 0;vertical-align:top;width:40px;">
          <span style="font-size:22px;">${icon}</span>
        </td>
        <td style="padding:10px 0 10px 12px;vertical-align:top;">
          <p style="margin:0;font-size:14px;font-weight:700;color:${BRAND_NAVY};">${title}</p>
          <p style="margin:2px 0 0;font-size:13px;color:#64748B;">${desc}</p>
        </td>
      </tr>`).join("")}
    </table>

    ${actionButton("Go to My Dashboard →", "https://vaulte-banking.vercel.app/dashboard")}

    ${securityBadge("Your account email is " + opts.email + ". If you did not create this account, contact " + `<a href="mailto:${SUPPORT_EMAIL}" style="color:#DC2626;">${SUPPORT_EMAIL}</a> immediately.`, "info")}
  `;

  const text = `Welcome to Vaulte, ${opts.firstName}!

Your account is now verified and active.

Go to your dashboard: https://vaulte-banking.vercel.app/dashboard

Your account email: ${opts.email}

If you need help, contact ${SUPPORT_EMAIL}

— The Vaulte Team`;

  return {
    html: baseLayout({
      preheader:   `Welcome to Vaulte, ${opts.firstName}! Your account is now active.`,
      headerTitle: `Welcome to Vaulte, ${opts.firstName}! 🎉`,
      headerSub:   "Your digital banking account is ready",
      body,
      footerNote:  `You are receiving this email because you successfully verified your Vaulte account. We're glad to have you.`,
      footerFrom:  "no-reply",
    }),
    text,
  };
}

// ─── 6. Support Acknowledgement Email ────────────────────────
export function supportAckEmail(opts: {
  firstName:  string;
  ticketRef:  string;
  subject:    string;
  message:    string;
}): { html: string; text: string } {
  const body = `
    ${greeting(opts.firstName)}
    ${paragraph("We have received your support request and our team will respond within <strong>24–48 hours</strong> during business days.")}

    ${metaTable([
      ["Reference",  opts.ticketRef],
      ["Subject",    opts.subject],
      ["Status",     "📬 Received — In Review"],
      ["Response",   "Within 24–48 hours"],
    ])}

    <p style="margin:20px 0 8px;font-size:13px;font-weight:600;color:${BRAND_NAVY};">Your message:</p>
    <div style="background:#F8FAFC;border:1px solid #E2E8F0;border-radius:10px;padding:16px 18px;font-size:13.5px;color:#374151;line-height:1.7;">
      ${opts.message}
    </div>

    ${paragraph("If your issue is urgent, please reply to this email and include your reference number.", { color: "#64748B" })}

    ${securityBadge("Never share your password, OTP codes, or financial credentials with anyone, including Vaulte support staff.", "info")}
  `;

  const text = `Hello ${opts.firstName},

We received your support request.

Reference: ${opts.ticketRef}
Subject: ${opts.subject}
Status: Received — In Review

We'll respond within 24–48 business hours.

Your message:
${opts.message}

— Vaulte Support Team
${SUPPORT_EMAIL}`;

  return {
    html: baseLayout({
      preheader:   `Support request received — Ref: ${opts.ticketRef}`,
      headerTitle: "Support Request Received",
      headerSub:   `Reference: ${opts.ticketRef}`,
      body,
      footerNote:  `This is a confirmation that your support request was received. Our team will follow up via ${SUPPORT_EMAIL}.`,
      footerFrom:  "support",
    }),
    text,
  };
}
