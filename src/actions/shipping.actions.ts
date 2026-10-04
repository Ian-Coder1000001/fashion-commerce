"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import ShippingZone from "@/models/ShippingZone";
import { estimateShipping, type ShippingEstimate } from "@/services/shipping.service";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("Not authorized.");
  }
}

export async function getShippingEstimateAction(
  country: string,
  region: string | undefined,
  subtotal: number
): Promise<ShippingEstimate> {
  return estimateShipping(country, region, subtotal);
}

export async function listShippingZonesForAdmin() {
  await requireAdmin();
  await connectToDatabase();
  return ShippingZone.find().sort({ isDefault: 1, countries: 1, region: 1 }).lean();
}

export interface ShippingZoneFormState {
  error?: string;
}

export async function createShippingZoneAction(
  _prevState: ShippingZoneFormState,
  formData: FormData
): Promise<ShippingZoneFormState> {
  await requireAdmin();
  await connectToDatabase();

  const name = String(formData.get("name") ?? "").trim();
  const countriesRaw = String(formData.get("countries") ?? "").trim();
  const region = String(formData.get("region") ?? "").trim() || null;
  const fee = Number(formData.get("fee"));
  const freeShippingThreshold = formData.get("freeShippingThreshold")
    ? Number(formData.get("freeShippingThreshold"))
    : null;
  const estimatedDays = String(formData.get("estimatedDays") ?? "").trim();
  const isDefault = formData.get("isDefault") === "on";

  if (!name || Number.isNaN(fee)) {
    return { error: "Name and a valid fee are required." };
  }
  if (!isDefault && !countriesRaw) {
    return { error: "List at least one country, or mark this as the default zone." };
  }
  if (region && !countriesRaw) {
    return { error: "A region-specific zone needs a country too." };
  }

  const countries = countriesRaw
    .split(",")
    .map((c) => c.trim())
    .filter(Boolean);

  if (isDefault) {
    await ShippingZone.updateMany({ isDefault: true }, { isDefault: false });
  }

  await ShippingZone.create({
    name,
    countries,
    region,
    fee,
    freeShippingThreshold,
    estimatedDays,
    isDefault,
  });

  revalidatePath("/admin/shipping");
  return {};
}

export async function deleteShippingZoneAction(zoneId: string) {
  await requireAdmin();
  await connectToDatabase();
  await ShippingZone.findByIdAndDelete(zoneId);
  revalidatePath("/admin/shipping");
}