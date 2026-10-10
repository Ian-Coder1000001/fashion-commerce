import Link from "next/link";
import { StarRating } from "@/components/storefront/StarRating";
import { ReviewForm } from "@/components/storefront/ReviewForm";
import type {
  PublicReview,
  ReviewSummary,
  ReviewEligibility,
} from "@/services/review.service";

interface ProductReviewsProps {
  productId: string;
  productSlug: string;
  reviews: PublicReview[];
  summary: ReviewSummary;
  eligibility: ReviewEligibility;
}

export function ProductReviews({
  productId,
  productSlug,
  reviews,
  summary,
  eligibility,
}: ProductReviewsProps) {
  return (
    <section id="reviews" className="mt-20 pt-12 border-t border-border max-w-3xl">
      <h2 className="font-display text-h2 mb-2">Reviews</h2>

      {summary.count > 0 ? (
        <div className="flex items-center gap-3 mb-8">
          <StarRating value={summary.average} size="text-lg" />
          <span className="text-sm text-fg-muted">
            {summary.average.toFixed(1)} · {summary.count} review
            {summary.count === 1 ? "" : "s"}
          </span>
        </div>
      ) : (
        <p className="text-sm text-fg-muted mb-8">No reviews yet.</p>
      )}

      {reviews.length > 0 && (
        <ul className="flex flex-col divide-y divide-border border-y border-border mb-12">
          {reviews.map((review) => (
            <li key={review.id} className="py-6">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-1">
                <StarRating value={review.rating} />
                <span className="text-xs text-fg-muted">
                  {review.userName} ·{" "}
                  {new Date(review.createdAt).toLocaleDateString("en-KE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}{" "}
                  · Verified purchase
                </span>
              </div>
              {review.title && <p className="text-sm font-medium">{review.title}</p>}
              <p className="text-sm text-fg-muted whitespace-pre-line mt-1">
                {review.body}
              </p>
            </li>
          ))}
        </ul>
      )}

      {eligibility.state === "signed_out" && (
        <p className="text-sm text-fg-muted">
          <Link
            href={`/login?callbackUrl=/product/${productSlug}`}
            className="underline underline-offset-4"
          >
            Sign in
          </Link>{" "}
          to review products you&apos;ve bought.
        </p>
      )}

      {eligibility.state === "not_purchased" && (
        <p className="text-sm text-fg-muted">
          Only customers who have received this product can review it.
        </p>
      )}

      {eligibility.state === "can_review" && (
        <div>
          <h3 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
            Write a review
          </h3>
          <ReviewForm productId={productId} />
        </div>
      )}

      {eligibility.state === "can_edit" && (
        <div>
          <h3 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
            Your review
          </h3>
          <ReviewForm productId={productId} initial={eligibility.review} />
        </div>
      )}
    </section>
  );
}