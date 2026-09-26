import { connectToDatabase } from "@/lib/db";
import Category from "@/models/Category";

export async function listEnabledCategories() {
  await connectToDatabase();
  return Category.find({ isEnabled: true, parent: null })
    .sort({ order: 1, name: 1 })
    .lean();
}

export async function getCategoryBySlug(slug: string) {
  await connectToDatabase();
  return Category.findOne({ slug, isEnabled: true }).lean();
}