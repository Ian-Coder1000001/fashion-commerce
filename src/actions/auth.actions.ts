"use server";

import { z } from "zod";
import { registerCustomer } from "@/services/auth.service";

import { contactRateLimit, getClientIp } from "@/lib/rate-limit";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.email("Enter a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export interface RegisterState {
  error?: string;
  success?: boolean;
}

export async function registerAction(
  _prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const ip = await getClientIp();
  // Reusing the contact rate limiter's bucket config (5 per 10 min) —
  // registration abuse and contact-form spam share the same risk
  // profile, so a separate limiter isn't needed.
  const { success } = await contactRateLimit.limit(`register:${ip}`);
  if (!success) {
    return { error: "Too many attempts. Please try again in a few minutes." };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input." };
  }

  const result = await registerCustomer(
    parsed.data.name,
    parsed.data.email,
    parsed.data.password
  );

  if ("error" in result) {
    return { error: result.error };
  }

  return { success: true };
}