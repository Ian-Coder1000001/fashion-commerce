"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Collection from "@/models/Collection";
import Product from "@/models/Product";
import { slugify } from "@/lib/slugify";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("Not authorized.");
  }
}

export async function listCollectionsForAdmin() {
  await requireAdmin();
  await connectToDatabase();
  return Collection.find().sort({ order: 1, name: 1 }).lean();
}

export interface CollectionFormState {
  error?: string;
}

export async function createCollectionAction(
  _prevState: CollectionFormState,
  formData: FormData
): Promise<CollectionFormState> {
  await requireAdmin();
  await connectToDatabase();

  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? ""));
  const description = String(formData.get("description") ?? "").trim() || undefined;

  if (!name || !slug) {
    return { error: "Name and slug are required." };
  }

  try {
    await Collection.create({ name, slug, description });
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: number }).code === 11000
    ) {
      return { error: "A collection with that slug already exists." };
    }
    return { error: "Something went wrong. Please try again." };
  }

  revalidatePath("/admin/collections");
  return {};
}

export async function deleteCollectionAction(id: string) {
  await requireAdmin();
  await connectToDatabase();

  const inUse = await Product.exists({ collections: id });
  if (inUse) {
    throw new Error(
      "This collection has products assigned to it. Remove it from those products first."
    );
  }

  await Collection.findByIdAndDelete(id);
  revalidatePath("/admin/collections");
}