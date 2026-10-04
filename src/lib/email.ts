import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

// Swapping to a real domain later is just changing this env var — no
// code change needed. Until a domain is verified in Resend, this value
// MUST stay "onboarding@resend.dev", Resend's shared test sender, which
// only delivers to the email address on the Resend account itself.
const FROM_ADDRESS = process.env.EMAIL_FROM || "onboarding@resend.dev";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

/**
 * Centralized email sending. Every transactional email in the app goes
 * through this function, so swapping providers later (or adding
 * logging/retries) only needs one change, not one per call site.
 * Never throws — a failed email should never break the user-facing
 * action it's attached to (e.g. an order that was successfully placed
 * shouldn't error out just because the confirmation email failed).
 */
export async function sendEmail({ to, subject, html }: SendEmailInput) {
  try {
    const result = await resend.emails.send({
      from: `Store <${FROM_ADDRESS}>`,
      to,
      subject,
      html,
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