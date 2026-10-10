"use client";

import { useActionState, useState } from "react";
import {
  submitReviewAction,
  type ReviewFormState,
} from "@/actions/review.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: ReviewFormState = {};

interface ReviewFormProps {
  productId: string;
  initial?: { rating: number; title: string; body: string };
}

export function ReviewForm({ productId, initial }: ReviewFormProps) {
  const [state, formAction, isPending] = useActionState(
    submitReviewAction.bind(null, productId),
    initialState
  );
  const [rating, setRating] = useState(initial?.rating ?? 0);

  return (
    <form action={formAction} className="flex flex-col gap-4 max-w-lg">
      <fieldset>
        <legend className="text-xs tracking-wide text-fg-muted mb-2">
          Your rating
        </legend>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <label key={n} className="cursor-pointer">
              <input
                type="radio"
                name="rating"
                value={n}
                checked={rating === n}
                onChange={() => setRating(n)}
                required
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={`text-2xl leading-none peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-fg ${
                  n <= rating ? "text-primary" : "text-border"
                }`}
              >
                ★
              </span>
              <span className="sr-only">
                {n} star{n === 1 ? "" : "s"}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Input
        label="Title (optional)"
        name="title"
        defaultValue={initial?.title}
        maxLength={100}
      />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="review-body" className="text-xs tracking-wide text-fg-muted">
          Your review
        </label>
        <textarea
          id="review-body"
          name="body"
          defaultValue={initial?.body}
          required
          rows={4}
          maxLength={2000}
          className="border border-border bg-surface px-3 py-2 text-sm"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-error">
          {state.error}
        </p>
      )}
      {state.success && (
        <p role="status" className="text-sm text-fg">
          Thanks, your review is live.
        </p>
      )}

      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Saving…" : initial ? "Update review" : "Submit review"}
      </Button>
    </form>
  );
}