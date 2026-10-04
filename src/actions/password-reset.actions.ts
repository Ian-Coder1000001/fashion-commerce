"use server";

import { z } from "zod";
import {
  createPasswordResetToken,
  resetPasswordWithToken,
} from "@/services/auth.service";
import { sendEmail } from "@/lib/email";

export interface ForgotPasswordState {
  submitted?: boolean;
}

export async function requestPasswordResetAction(
  _prevState: ForgotPasswordState,
  formData: FormData
): Promise<ForgotPasswordState> {
  const email = String(formData.get("email") ?? "").trim();
  const parsed = z.email().safeParse(email);

  // Always report success, even for an invalid/unknown email — revealing
  // which emails are registered is an account-enumeration risk.
  if (!parsed.success) return { submitted: true };

  const token = await createPasswordResetToken(email);
  if (token) {
    const resetUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password/${token}`;
    await sendEmail({
      to: email,
      subject: "Reset your password",
      html: `
        <p>Someone requested a password reset for this account.</p>
        <p><a href="${resetUrl}">Click here to set a new password</a>. This link expires in 1 hour.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      `,
    });
  }

  return { submitted: true };
}

export interface ResetPasswordState {
  error?: string;
  success?: boolean;
}

export async function resetPasswordAction(
  _prevState: ResetPasswordState,
  formData: FormData
): Promise<ResetPasswordState> {
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");

  if (password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }

  const success = await resetPasswordWithToken(token, password);
  if (!success) {
    return { error: "This reset link is invalid or has expired. Request a new one." };
  }

  return { success: true };
}