import { Resend } from "resend";
import { getStoreSettings } from "@/services/settings.service";

const resend = new Resend(process.env.RESEND_API_KEY);

// Swapping to a real domain later is just changing this env var. Until a
// domain is verified in Resend, this MUST stay "onboarding@resend.dev",
// which only delivers to the email on the Resend account itself.
const FROM_ADDRESS = process.env.EMAIL_FROM || "onboarding@resend.dev";

// TEST MODE: when set, every email is sent to this one address instead
// of its real recipient. Use it only while Resend has no verified
// domain. Delete the variable before taking real customers, or their
// emails (including password resets) will land in this inbox instead.
const TEST_REDIRECT = process.env.EMAIL_TEST_REDIRECT?.trim() || "";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

/**
 * Escapes text before it goes into an HTML email. Anything a visitor
 * typed (names, subjects, messages) must pass through this, otherwise
 * they could inject links or markup into an email sent to someone else.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Centralized email sending. Never throws: a failed email must never
 * break the user-facing action it's attached to.
 */
export async function sendEmail({ to, subject, html, replyTo }: SendEmailInput) {
  try {
    const settings = await getStoreSettings();
    const senderName = String(settings.storeName ?? "Store").replace(/[<>"]/g, "");

    let recipient = to;
    let finalSubject = subject;
    let finalHtml = html;

    if (TEST_REDIRECT) {
      recipient = TEST_REDIRECT;
      finalSubject = `[TEST → ${to}] ${subject}`.replace(/[\r\n]+/g, " ");
      finalHtml = `
        <p style="background:#fff3cd;padding:8px 12px;font-size:12px;">
          Test mode: this email was addressed to <strong>${escapeHtml(to)}</strong>
          and redirected to you.
        </p>
        ${html}
      `;
      console.warn(
        `[email] EMAIL_TEST_REDIRECT is on: "${subject}" for ${to} was sent to ${TEST_REDIRECT}.`
      );
    }

    const result = await resend.emails.send({
      from: `${senderName} <${FROM_ADDRESS}>`,
      to: recipient,
      subject: finalSubject,
      html: finalHtml,
      ...(replyTo ? { replyTo } : {}),
    });
    if (result.error) {
      console.error("[email] send failed:", result.error);
    }
    return result;
  } catch (err) {
    console.error("[email] send threw:", err);
    return null;
  }
}