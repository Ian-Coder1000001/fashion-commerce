import { Types } from "mongoose";
import { connectToDatabase } from "@/lib/db";
import Review from "@/models/Review";
import Order from "@/models/Order";
import { auth } from "@/lib/auth";

// Which order statuses count as "the customer has actually received
// this". Change this one list to loosen the rule, e.g. add "shipped".
const REVIEWABLE_ORDER_STATUSES = ["delivered"];

export interface PublicReview {
  id: string;
  userName: string;
  rating: number;
  title?: string;
  body: string;
  createdAt: string;
}

export interface ReviewSummary {
  average: number;
  count: number;
}

export type ReviewEligibility =
  | { state: "signed_out" }
  | { state: "not_purchased" }
  | { state: "can_review" }
  | { state: "can_edit"; review: { rating: number; title: string; body: string } };

export async function hasPurchasedProduct(
  userId: string,
  productId: string
): Promise<boolean> {
  await connectToDatabase();
  const order = await Order.exists({
    user: userId,
    "items.product": productId,
    orderStatus: { $in: REVIEWABLE_ORDER_STATUSES },
  });
  return !!order;
}

export async function getReviewsForProduct(
  productId: string
): Promise<{ reviews: PublicReview[]; summary: ReviewSummary }> {
  await connectToDatabase();

  const [reviews, stats] = await Promise.all([
    Review.find({ product: productId, status: "approved" })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
    Review.aggregate([
      { $match: { product: new Types.ObjectId(productId), status: "approved" } },
      { $group: { _id: null, average: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]),
  ]);

  const average = stats[0]?.average ? Math.round(stats[0].average * 10) / 10 : 0;
  const count = stats[0]?.count ?? 0;

  return {
    reviews: reviews.map((r) => ({
      id: String(r._id),
      userName: r.userName,
      rating: r.rating,
      title: r.title || undefined,
      body: r.body,
      createdAt: new Date(r.createdAt).toISOString(),
    })),
    summary: { average, count },
  };
}

export async function getReviewEligibility(
  productId: string
): Promise<ReviewEligibility> {
  const session = await auth();
  if (!session) return { state: "signed_out" };

  const purchased = await hasPurchasedProduct(session.user.id, productId);
  if (!purchased) return { state: "not_purchased" };

  await connectToDatabase();
  const existing = await Review.findOne({
    product: productId,
    user: session.user.id,
  }).lean();

  if (existing) {
    return {
      state: "can_edit",
      review: {
        rating: existing.rating,
        title: existing.title ?? "",
        body: existing.body,
      },
    };
  }
  return { state: "can_review" };
}