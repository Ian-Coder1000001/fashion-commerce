"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { slugify } from "@/lib/slugify";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("Not authorized.");
  }
}

export async function listCategories() {
  await requireAdmin();
  await connectToDatabase();
  return Category.find().sort({ order: 1, name: 1 }).lean();
}

export async function createCategoryAction(formData: FormData) {
  await requireAdmin();
  await connectToDatabase();

  const name = String(formData.get("name") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? ""));
  

  if (!name || !slug) throw new Error("Name and slug are required.");

  await Category.create({ name, slug });
  revalidatePath("/admin/categories");
}

export async function deleteCategoryAction(id: string) {
  await requireAdmin();
  await connectToDatabase();

  const inUse = await Product.exists({ category: id });
  if (inUse) {
    throw new Error(
      "This category has products assigned to it. Reassign or delete those products first."
    );
  }

  await Category.findByIdAndDelete(id);
  revalidatePath("/admin/categories");
}
