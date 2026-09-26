import { connectToDatabase } from "@/lib/db";
import BlogPost from "@/models/BlogPost";

export async function listPublishedPosts(limit = 20) {
  await connectToDatabase();
  return BlogPost.find({ status: "published" })
    .sort({ publishedAt: -1 })
    .limit(limit)
    .lean();
}

export async function getPublishedPostBySlug(slug: string) {
  await connectToDatabase();
  return BlogPost.findOne({ slug, status: "published" }).lean();
}