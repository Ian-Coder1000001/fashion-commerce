"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import ContactMessage from "@/models/ContactMessage";
import { contactRateLimit, getClientIp } from "@/lib/rate-limit";
import { sendEmail, escapeHtml } from "@/lib/email";
import { getStoreSettings } from "@/services/settings.service";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("Not authorized.");
  }
}

const contactSchema = z.object({
  name: z.string().min(1, "Name is required."),
  email: z.email("Enter a valid email."),
  phone: z.string().optional(),
  subject: z.string().min(1, "Subject is required."),
  message: z.string().min(1, "Message is required."),
});

export interface ContactFormState {
  error?: string;
  success?: boolean;
}

export async function submitContactMessageAction(
  _prevState: ContactFormState,
  formData: FormData
): Promise<ContactFormState> {
  const ip = await getClientIp();
  const { success } = await contactRateLimit.limit(ip);
  if (!success) {
    return { error: "Too many messages sent. Please try again in a few minutes." };
  }

  const parsed = contactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your details." };
  }

  await connectToDatabase();
  await ContactMessage.create(parsed.data);

  // Alert the store owner by email. The message is already saved above,
  // so a failed email never loses anything.
  const settings = await getStoreSettings();
  if (settings.contactEmail) {
    const { name, email, phone, subject, message } = parsed.data;
    await sendEmail({
      to: settings.contactEmail,
      replyTo: email,
      subject: `New message: ${subject}`.replace(/[\r\n]+/g, " ").slice(0, 150),
      html: `
        <h2>New contact message</h2>
        <p><strong>From:</strong> ${escapeHtml(name)} (${escapeHtml(email)})</p>
        ${phone ? `<p><strong>Phone:</strong> ${escapeHtml(phone)}</p>` : ""}
        <p><strong>Subject:</strong> ${escapeHtml(subject)}</p>
        <p style="white-space:pre-line;">${escapeHtml(message)}</p>
      `,
    });
  }

  return { success: true };
}

export async function listMessagesForAdmin() {
  await requireAdmin();
  await connectToDatabase();
  return ContactMessage.find().sort({ createdAt: -1 }).lean();
}

export async function markMessageStatusAction(
  messageId: string,
  status: "unread" | "read" | "archived"
) {
  await requireAdmin();
  await connectToDatabase();
  await ContactMessage.findByIdAndUpdate(messageId, { status });
  revalidatePath("/admin/messages");
}

export async function deleteMessageAction(messageId: string) {
  await requireAdmin();
  await connectToDatabase();
  await ContactMessage.findByIdAndDelete(messageId);
  revalidatePath("/admin/messages");
}