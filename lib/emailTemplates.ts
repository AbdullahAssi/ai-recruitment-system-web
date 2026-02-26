/**
 * emailTemplates.ts
 * ─────────────────────────────────────────────────────────────────────
 * Centralised, beautiful transactional email templates for QMindAI.
 * All styles are inline so they render correctly in Gmail, Outlook, Apple
 * Mail, and mobile clients.
 * ─────────────────────────────────────────────────────────────────────
 */

const APP_NAME = "QMindAI";
const BRAND_DARK = "#0b66c3"; // deep navy
const BRAND_MID = "#1e4d8c"; // brand blue
const BRAND_LIGHT = "#3b82f6"; // tailwind blue-500
const TEXT_DARK = "#111827";
const TEXT_MID = "#374151";
const TEXT_MUTED = "#6b7280";
const BG_PAGE = "#f0f4f8";
const BG_CARD = "#ffffff";

/** Wraps any content in the shared chrome (header + footer). */
function base(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>${APP_NAME}</title>
</head>
<body style="margin:0;padding:0;background:${BG_PAGE};font-family:'Segoe UI',Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG_PAGE};padding:32px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${BRAND_DARK} 0%,${BRAND_MID} 60%,${BRAND_LIGHT} 100%);border-radius:16px 16px 0 0;padding:36px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:10px;">
                <div style="width:36px;height:36px;background:rgba(255,255,255,0.18);border-radius:10px;display:inline-block;line-height:36px;text-align:center;">
                  <span style="font-size:20px;">🧠</span>
                </div>
                <span style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">${APP_NAME}</span>
              </div>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background:${BG_CARD};padding:40px 40px 32px;box-shadow:0 4px 24px rgba(0,0,0,0.07);">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#e8edf2;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:${TEXT_MUTED};">
                © ${new Date().getFullYear()} ${APP_NAME} · AI-Powered Recruitment Platform
              </p>
              <p style="margin:6px 0 0;font-size:12px;color:#9ca3af;">
                You're receiving this because an action was performed on your account.
              </p>
            </td>
          </tr>

        </table>
        <!-- /Card -->

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** ── 1. EMAIL VERIFICATION ───────────────────────────────────────── */
export function verificationEmailHtml({
  name,
  code,
  role,
}: {
  name: string;
  code: string;
  role: "HR" | "CANDIDATE";
}): string {
  const roleLabel = role === "HR" ? "HR" : "Candidate";
  // Split code into individual digit cells
  const digits = code.split("").map(
    (d) =>
      `<td style="padding:0 5px;">
        <div style="width:44px;height:54px;background:#f0f4f8;border:2px solid #d1dde8;border-radius:10px;
                    font-size:28px;font-weight:700;color:${BRAND_DARK};text-align:center;line-height:54px;">
          ${d}
        </div>
      </td>`,
  );

  return base(`
    <!-- Icon -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:60px;height:60px;background:linear-gradient(135deg,${BRAND_MID},${BRAND_LIGHT});
                  border-radius:16px;display:inline-block;line-height:60px;text-align:center;">
        <span style="font-size:28px;">✉️</span>
      </div>
    </div>

    <!-- Heading -->
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${TEXT_DARK};text-align:center;">
      Verify your email
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${TEXT_MUTED};text-align:center;">
      Enter this code on the verification page to activate your account
    </p>

    <p style="margin:0 0 24px;font-size:15px;color:${TEXT_MID};">
      Hi <strong>${name}</strong>, thanks for joining ${APP_NAME} as a <strong>${roleLabel}</strong>.
      Please use the 6-digit code below to verify your email address.
    </p>

    <!-- OTP digits -->
    <div style="text-align:center;margin:0 0 28px;">
      <table cellpadding="0" cellspacing="0" border="0" style="display:inline-table;">
        <tr>${digits.join("")}</tr>
      </table>
    </div>

    <!-- Expiry pill -->
    <div style="text-align:center;margin-bottom:28px;">
      <span style="display:inline-block;background:#fef3c7;color:#92400e;border:1px solid #fde68a;
                   border-radius:20px;padding:6px 16px;font-size:13px;font-weight:600;">
        ⏱ Expires in 15 minutes
      </span>
    </div>

    <!-- Divider -->
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px;" />

    <p style="margin:0;font-size:13px;color:${TEXT_MUTED};text-align:center;">
      If you didn't create an account, you can safely ignore this email.
    </p>
  `);
}

/** ── 2. FORGOT PASSWORD ──────────────────────────────────────────── */
export function forgotPasswordEmailHtml({
  name,
  resetLink,
}: {
  name: string;
  resetLink: string;
}): string {
  return base(`
    <!-- Icon -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:60px;height:60px;background:linear-gradient(135deg,${BRAND_MID},${BRAND_LIGHT});
                  border-radius:16px;display:inline-block;line-height:60px;text-align:center;">
        <span style="font-size:28px;">🔐</span>
      </div>
    </div>

    <!-- Heading -->
    <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:${TEXT_DARK};text-align:center;">
      Reset your password
    </h1>
    <p style="margin:0 0 28px;font-size:14px;color:${TEXT_MUTED};text-align:center;">
      We received a request to reset your ${APP_NAME} password
    </p>

    <p style="margin:0 0 28px;font-size:15px;color:${TEXT_MID};">
      Hi <strong>${name}</strong>,
      click the button below to choose a new password. This link is valid for <strong>1 hour</strong>.
    </p>

    <!-- CTA Button -->
    <div style="text-align:center;margin-bottom:32px;">
      <a href="${resetLink}"
         style="display:inline-block;background:linear-gradient(135deg,${BRAND_DARK},${BRAND_MID});
                color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:10px;
                font-size:15px;font-weight:700;letter-spacing:0.3px;
                box-shadow:0 4px 14px rgba(30,77,140,0.35);">
        Reset Password →
      </a>
    </div>

    <!-- Expiry pill -->
    <div style="text-align:center;margin-bottom:28px;">
      <span style="display:inline-block;background:#fef3c7;color:#92400e;border:1px solid #fde68a;
                   border-radius:20px;padding:6px 16px;font-size:13px;font-weight:600;">
        ⏱ Link expires in 1 hour
      </span>
    </div>

    <!-- Divider -->
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:0 0 20px;" />

    <!-- Fallback link -->
    <p style="margin:0 0 8px;font-size:13px;color:${TEXT_MUTED};text-align:center;">
      Button not working? Copy and paste this URL into your browser:
    </p>
    <p style="margin:0 0 20px;font-size:12px;color:#9ca3af;text-align:center;word-break:break-all;">
      ${resetLink}
    </p>

    <p style="margin:0;font-size:13px;color:${TEXT_MUTED};text-align:center;">
      If you didn't request a password reset, you can safely ignore this email.
      Your password will not be changed.
    </p>
  `);
}

/** ── 3. RESEND VERIFICATION ─────────────────────────────────────── */
export function resendVerificationEmailHtml({
  name,
  code,
  role,
}: {
  name: string;
  code: string;
  role: "HR" | "CANDIDATE";
}): string {
  // Reuse the same template — just different intro copy
  return verificationEmailHtml({ name, code, role });
}

/**
 * ── 4. HR EMAIL BASE CHROME ──────────────────────────────────────
 * Wraps HR-to-candidate template bodies in the branded chrome.
 * The `innerHtml` parameter may still contain {{variable}} placeholders —
 * they are substituted at send-time by processEmailTemplate(), not here.
 *
 * Usage in the seed route:
 *   body: hrEmailBase(`<p>Dear {{candidateName}}, ...</p>`, "🗓", "Interview Invitation")
 */
export function hrEmailBase(
  innerHtml: string,
  emoji: string,
  heading: string,
): string {
  return base(`
    <!-- Icon -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="width:60px;height:60px;background:linear-gradient(135deg,${BRAND_MID},${BRAND_LIGHT});
                  border-radius:16px;display:inline-block;line-height:60px;text-align:center;">
        <span style="font-size:28px;">${emoji}</span>
      </div>
    </div>

    <!-- Heading -->
    <h1 style="margin:0 0 28px;font-size:22px;font-weight:700;color:${TEXT_DARK};text-align:center;">
      ${heading}
    </h1>

    <!-- Body content with {{variables}} still intact -->
    ${innerHtml}

    <!-- Divider -->
    <hr style="border:none;border-top:1px solid #e5e7eb;margin:32px 0 20px;" />
    <p style="margin:0;font-size:13px;color:${TEXT_MUTED};text-align:center;">
      This email was sent by ${APP_NAME} on behalf of your recruiter.
      Please do not reply directly to this message.
    </p>
  `);
}
