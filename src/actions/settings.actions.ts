"use server";

import { revalidatePath, updateTag } from "next/cache";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import StoreSettings from "@/models/StoreSettings";
import { uploadMedia, deleteMedia } from "@/services/media.service";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("Not authorized.");
  }
}

function revalidateEverythingBranded() {
  updateTag("settings");
  revalidatePath("/admin/settings");
  revalidatePath("/", "layout");
  revalidatePath("/shipping");
  revalidatePath("/returns");
  revalidatePath("/privacy");
  revalidatePath("/terms");
}

export async function updateStoreSettingsAction(formData: FormData) {
  await requireAdmin();
  await connectToDatabase();

  const update = {
    storeName: String(formData.get("storeName") ?? "").trim() || "Store",
    contactEmail: String(formData.get("contactEmail") ?? "").trim(),
    contactPhone: String(formData.get("contactPhone") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    currency: String(formData.get("currency") ?? "KES").trim() || "KES",
    socialLinks: {
      facebook: String(formData.get("facebook") ?? "").trim(),
      instagram: String(formData.get("instagram") ?? "").trim(),
      twitter: String(formData.get("twitter") ?? "").trim(),
      tiktok: String(formData.get("tiktok") ?? "").trim(),
    },
    shippingInfo: String(formData.get("shippingInfo") ?? "").trim(),
    returnPolicy: String(formData.get("returnPolicy") ?? "").trim(),
    privacyPolicy: String(formData.get("privacyPolicy") ?? "").trim(),
    termsAndConditions: String(formData.get("termsAndConditions") ?? "").trim(),
    theme: {
      primaryColor: String(formData.get("primaryColor") ?? "").trim() || null,
      secondaryColor: String(formData.get("secondaryColor") ?? "").trim() || null,
      textColor: String(formData.get("textColor") ?? "").trim() || null,
      backgroundColor: String(formData.get("backgroundColor") ?? "").trim() || null,
      buttonColor: String(formData.get("buttonColor") ?? "").trim() || null,
      buttonTextColor: String(formData.get("buttonTextColor") ?? "").trim() || null,
      borderColor: String(formData.get("borderColor") ?? "").trim() || null,
      fontPair: String(formData.get("fontPair") ?? "editorial-serif"),
    },
  };

  await StoreSettings.findOneAndUpdate({}, update, { upsert: true });
  revalidateEverythingBranded();
}

export async function uploadLogoAction(formData: FormData) {
  await requireAdmin();
  await connectToDatabase();

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    throw new Error("No file provided.");
  }

  const existing = await StoreSettings.findOne();
  if (existing?.logo?.publicId) {
    await deleteMedia(existing.logo.publicId, existing.logo.resourceType);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const asset = await uploadMedia(buffer, "branding");

  await StoreSettings.findOneAndUpdate({}, { logo: asset }, { upsert: true });
  revalidateEverythingBranded();
}