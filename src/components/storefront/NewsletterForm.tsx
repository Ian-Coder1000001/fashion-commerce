"use client";

import { useActionState } from "react";
import {
  subscribeToNewsletterAction,
  type NewsletterFormState,
} from "@/actions/newsletter.actions";

const initialState: NewsletterFormState = {};

export function NewsletterForm() {
  const [state, formAction, isPending] = useActionState(
    subscribeToNewsletterAction,
    initialState
  );

  if (state.success) {
    return <p className="text-fg-muted text-sm">You&apos;re subscribed.</p>;
  }

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex border border-border">
        <input
          type="email"
          name="email"
          required
          placeholder="Email address"
          className="flex-1 bg-surface px-3 py-2 text-sm placeholder:text-fg-muted focus:outline-none"
        />
        <button
          type="submit"
          disabled={isPending}
          className="px-4 text-xs tracking-wide uppercase text-fg-muted hover:text-fg disabled:opacity-40"
        >
          {isPending ? "…" : "Join"}
        </button>
      </div>
      {state.error && <p className="text-xs text-error">{state.error}</p>}
    </form>
  );
}