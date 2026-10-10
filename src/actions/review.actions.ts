"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Review from "@/models/Review";
import Product from "@/models/Product";
import User from "@/models/User";
import { hasPurchasedProduct } from "@/services/review.service";
import { contactRateLimit, getClientIp } from "@/lib/rate-limit";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("Not authorized.");
  }
}

async function revalidateProductPage(productId: unknown) {
  const product = await Product.findById(productId).select("slug").lean();
  if (product) revalidatePath(`/product/${product.slug}`);
}

// "Ian Mkumani" -> "Ian M." so reviews never expose full names.
function displayName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  return `${parts[0]} ${parts[parts.length - 1][0].toUpperCase()}.`;
}

const reviewSchema = z.object({
  rating: z.coerce.number().int().min(1, "Choose a star rating.").max(5),
  title: z.string().trim().max(100, "Keep the title under 100 characters."),
  body: z
    .string()
    .trim()
    .min(10, "Please write at least 10 characters.")
    .max(2000, "Keep your review under 2000 characters."),
});

export interface ReviewFormState {
  error?: string;
  success?: boolean;
}

export async function submitReviewAction(
  productId: string,
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const session = await auth();
  if (!session) return { error: "Please sign in to leave a review." };

  const ip = await getClientIp();
  const { success } = await contactRateLimit.limit(`review:${ip}`);
  if (!success) {
    return { error: "Too many attempts. Please try again in a few minutes." };
  }

  const parsed = reviewSchema.safeParse({
    rating: formData.get("rating"),
    title: String(formData.get("title") ?? ""),
    body: String(formData.get("body") ?? ""),
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Please check your review." };
  }

  // The real gate. The form only shows for eligible customers, but this
  // is what actually enforces it, since a form can always be faked.
  const purchased = await hasPurchasedProduct(session.user.id, productId);
  if (!purchased) {
    return { error: "Only customers who have received this product can review it." };
  }

  await connectToDatabase();
  const user = await User.findById(session.user.id).select("name").lean();
  if (!user) return { error: "Account not found." };

  await Review.findOneAndUpdate(
    { product: productId, user: session.user.id },
    {
      $set: {
        rating: parsed.data.rating,
        title: parsed.data.title,
        body: parsed.data.body,
        userName: displayName(user.name),
      },
      // Only set on first creation, so editing never un-hides a review
      // an admin has hidden.
      $setOnInsert: { status: "approved" },
    },
    { upsert: true }
  );

  await revalidateProductPage(productId);
  revalidatePath("/admin/reviews");
  return { success: true };
}

export async function listReviewsForAdmin() {
  await requireAdmin();
  await connectToDatabase();
  return Review.find()
    .sort({ createdAt: -1 })
    .populate("product", "name")
    .limit(200)
    .lean();
}

export async function toggleReviewHiddenAction(reviewId: string) {
  await requireAdmin();
  await connectToDatabase();

  const review = await Review.findById(reviewId);
  if (!review) return;

  review.status = review.status === "approved" ? "hidden" : "approved";
  await review.save();

  await revalidateProductPage(review.product);
  revalidatePath("/admin/reviews");
}

export async function deleteReviewAction(reviewId: string) {
  await requireAdmin();
  await connectToDatabase();

  const review = await Review.findByIdAndDelete(reviewId);
  if (review) await revalidateProductPage(review.product);
  revalidatePath("/admin/reviews");
}