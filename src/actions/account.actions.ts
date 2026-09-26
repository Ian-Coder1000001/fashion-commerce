"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import type { Address } from "@/types/address";

async function requireSession() {
  const session = await auth();
  if (!session) throw new Error("Not authenticated.");
  return session;
}

export async function getCurrentUser() {
  const session = await requireSession();
  await connectToDatabase();
  return User.findById(session.user.id).lean();
}

export async function updateProfileAction(formData: FormData) {
  const session = await requireSession();
  await connectToDatabase();

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();

  if (!name) throw new Error("Name is required.");

  await User.findByIdAndUpdate(session.user.id, { name, phone });
  revalidatePath("/account");
}

export async function addAddressAction(formData: FormData) {
  const session = await requireSession();
  await connectToDatabase();

  const address = {
    label: String(formData.get("label") ?? "").trim() || undefined,
    line1: String(formData.get("line1") ?? "").trim(),
    line2: String(formData.get("line2") ?? "").trim() || undefined,
    city: String(formData.get("city") ?? "").trim(),
    region: String(formData.get("region") ?? "").trim() || undefined,
    postalCode: String(formData.get("postalCode") ?? "").trim() || undefined,
    country: String(formData.get("country") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim() || undefined,
  };

  if (!address.line1 || !address.city || !address.country) {
    throw new Error("Address line, city, and country are required.");
  }

  const user = await User.findById(session.user.id);
  if (!user) throw new Error("User not found.");

  const isFirstAddress = user.addresses.length === 0;
  user.addresses.push({ ...address, isDefault: isFirstAddress });
  await user.save();

  revalidatePath("/account/addresses");
}

export async function deleteAddressAction(addressId: string) {
  const session = await requireSession();
  await connectToDatabase();

  await User.findByIdAndUpdate(session.user.id, {
    $pull: { addresses: { _id: addressId } },
  });

  revalidatePath("/account/addresses");
}

export async function setDefaultAddressAction(addressId: string) {
  const session = await requireSession();
  await connectToDatabase();

  const user = await User.findById(session.user.id);
  if (!user) throw new Error("User not found.");

  user.addresses.forEach((addr: Address) => {
    addr.isDefault = String(addr._id) === addressId;
  });
  await user.save();

  revalidatePath("/account/addresses");
}