"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import BlogPost from "@/models/BlogPost";
import { uploadMedia, deleteMedia } from "@/services/media.service";

import { slugify } from "@/lib/slugify";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("Not authorized.");
  }
}

export async function listPostsForAdmin() {
  await requireAdmin();
  await connectToDatabase();
  return BlogPost.find().sort({ createdAt: -1 }).lean();
}

export async function getPostByIdForAdmin(id: string) {
  await requireAdmin();
  await connectToDatabase();
  return BlogPost.findById(id).lean();
}

export interface PostFormState {
  error?: string;
  postId?: string;
}

export async function createPostAction(
  _prevState: PostFormState,
  formData: FormData
): Promise<PostFormState> {
  await requireAdmin();
  await connectToDatabase();

  const title = String(formData.get("title") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? ""));
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!title || !slug || !excerpt || !content) {
    return { error: "Please fill in all required fields." };
  }

  try {
    const post = await BlogPost.create({ title, slug, excerpt, content });
    revalidatePath("/admin/blog");
    return { postId: String(post._id) };
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: number }).code === 11000
    ) {
      return { error: "A post with that slug already exists." };
    }
    return { error: "Something went wrong. Please try again." };
  }
}

export async function updatePostAction(postId: string, formData: FormData) {
  await requireAdmin();
  await connectToDatabase();

  const title = String(formData.get("title") ?? "").trim();
  const slug = slugify(String(formData.get("slug") ?? ""));
  const excerpt = String(formData.get("excerpt") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();
  const author = String(formData.get("author") ?? "").trim() || "Store Team";
  const tags = String(formData.get("tags") ?? "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  await BlogPost.findByIdAndUpdate(postId, {
    title,
    slug,
    excerpt,
    content,
    author,
    tags,
  });

  revalidatePath(`/admin/blog/${postId}`);
  revalidatePath("/admin/blog");
}

export async function togglePublishAction(postId: string) {
  await requireAdmin();
  await connectToDatabase();

  const post = await BlogPost.findById(postId);
  if (!post) return;

  if (post.status === "published") {
    post.status = "draft";
  } else {
    post.status = "published";
    if (!post.publishedAt) post.publishedAt = new Date();
  }
  await post.save();

  revalidatePath(`/admin/blog/${postId}`);
  revalidatePath("/admin/blog");
}

export async function deletePostAction(postId: string) {
  await requireAdmin();
  await connectToDatabase();

  const post = await BlogPost.findById(postId);
  if (!post) return;

  if (post.featuredImage?.publicId) {
    await deleteMedia(post.featuredImage.publicId, post.featuredImage.resourceType);
  }

  await post.deleteOne();
  revalidatePath("/admin/blog");
}

export async function uploadFeaturedImageAction(postId: string, formData: FormData) {
  await requireAdmin();
  await connectToDatabase();

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    throw new Error("No file provided.");
  }

  const post = await BlogPost.findById(postId);
  if (!post) throw new Error("Post not found.");

  if (post.featuredImage?.publicId) {
    await deleteMedia(post.featuredImage.publicId, post.featuredImage.resourceType);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const asset = await uploadMedia(buffer, `blog/${postId}`);

  post.featuredImage = asset;
  await post.save();

  revalidatePath(`/admin/blog/${postId}`);
}