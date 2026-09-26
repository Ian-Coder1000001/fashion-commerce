import { connectToDatabase } from "@/lib/db";
import Collection from "@/models/Collection";

export async function listEnabledCollections() {
  await connectToDatabase();
  return Collection.find({ isEnabled: true }).sort({ order: 1, name: 1 }).lean();
}

export async function getCollectionBySlug(slug: string) {
  await connectToDatabase();
  return Collection.findOne({ slug, isEnabled: true }).lean();
}