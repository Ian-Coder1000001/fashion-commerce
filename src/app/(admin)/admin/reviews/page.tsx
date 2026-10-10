import Link from "next/link";
import {
  listReviewsForAdmin,
  toggleReviewHiddenAction,
  deleteReviewAction,
} from "@/actions/review.actions";
import { StarRating } from "@/components/storefront/StarRating";

export const dynamic = "force-dynamic";

export default async function AdminReviewsPage() {
  const reviews = await listReviewsForAdmin();

  return (
    <div>
      <h1 className="font-display text-2xl mb-8">Reviews</h1>

      {reviews.length === 0 ? (
        <p className="text-sm text-fg-muted">No reviews yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border border-y border-border">
          {reviews.map((review) => {
            const product = review.product as { _id: unknown; name?: string } | null;

            return (
              <div
                key={String(review._id)}
                className="py-5 flex flex-col sm:flex-row sm:justify-between gap-4"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-3 mb-1">
                    <StarRating value={review.rating} />
                    {review.status === "hidden" && (
                      <span className="text-[10px] tracking-wide uppercase text-fg-muted">
                        Hidden
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-fg-muted mb-2">
                    {review.userName} on{" "}
                    {product ? (
                      <Link
                        href={`/admin/products/${product._id}`}
                        className="underline underline-offset-4"
                      >
                        {product.name}
                      </Link>
                    ) : (
                      "a deleted product"
                    )}{" "}
                    · {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                  {review.title && <p className="text-sm font-medium">{review.title}</p>}
                  <p className="text-sm text-fg-muted whitespace-pre-line">
                    {review.body}
                  </p>
                </div>

                <div className="flex sm:flex-col gap-4 sm:gap-2 text-xs shrink-0">
                  <form action={toggleReviewHiddenAction.bind(null, String(review._id))}>
                    <button className="text-fg-muted hover:text-fg">
                      {review.status === "approved" ? "Hide" : "Show"}
                    </button>
                  </form>
                  <form action={deleteReviewAction.bind(null, String(review._id))}>
                    <button className="text-fg-muted hover:text-error">Delete</button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}