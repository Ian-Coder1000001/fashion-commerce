"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import NewsletterSubscriber from "@/models/NewsletterSubscriber";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("Not authorized.");
  }
}

export interface NewsletterFormState {
  error?: string;
  success?: boolean;
}

export async function subscribeToNewsletterAction(
  _prevState: NewsletterFormState,
  formData: FormData
): Promise<NewsletterFormState> {
  const parsed = z.email().safeParse(formData.get("email"));
  if (!parsed.success) {
    return { error: "Enter a valid email." };
  }

  await connectToDatabase();

  const existing = await NewsletterSubscriber.findOne({ email: parsed.data });
  if (existing) {
    if (!existing.isActive) {
      existing.isActive = true;
      await existing.save();
    }
    return { success: true };
  }

  await NewsletterSubscriber.create({ email: parsed.data });
  return { success: true };
}

export async function listSubscribersForAdmin() {
  await requireAdmin();
  await connectToDatabase();
  return NewsletterSubscriber.find().sort({ createdAt: -1 }).lean();
}

export async function removeSubscriberAction(subscriberId: string) {
  await requireAdmin();
  await connectToDatabase();
  await NewsletterSubscriber.findByIdAndDelete(subscriberId);
  revalidatePath("/admin/newsletter");
}