import { unstable_cache } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import Category from "@/models/Category";

export interface PublicCategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export const listEnabledCategories = unstable_cache(
  async (): Promise<PublicCategory[]> => {
    await connectToDatabase();
    const categories = await Category.find({ isEnabled: true, parent: null })
      .sort({ order: 1, name: 1 })
      .lean();
    return JSON.parse(JSON.stringify(categories)) as PublicCategory[];
  },
  ["enabled-categories"],
  { tags: ["categories"], revalidate: 300 }
);

export async function getCategoryBySlug(slug: string) {
  await connectToDatabase();
  return Category.findOne({ slug, isEnabled: true }).lean();
}