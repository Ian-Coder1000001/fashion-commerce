"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createPostAction, type PostFormState } from "@/actions/blog.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: PostFormState = {};

export function BlogCreateForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createPostAction,
    initialState
  );

  useEffect(() => {
    if (state.postId) {
      router.push(`/admin/blog/${state.postId}`);
    }
  }, [state.postId, router]);

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 mb-10 max-w-xl border border-border p-6"
    >
      <Input label="Title" name="title" required />
      <Input label="Slug" name="slug" required />
      <div className="flex flex-col gap-1.5">
        <label className="text-xs tracking-wide text-fg-muted">Excerpt</label>
        <textarea
          name="excerpt"
          required
          rows={2}
          className="border border-border bg-surface px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs tracking-wide text-fg-muted">Content</label>
        <textarea
          name="content"
          required
          rows={5}
          className="border border-border bg-surface px-3 py-2 text-sm"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-error">
          {state.error}
        </p>
      )}

      <Button type="submit" size="sm" disabled={isPending} className="self-start">
        {isPending ? "Creating…" : "Create post"}
      </Button>
      <p className="text-xs text-fg-muted">
        You&apos;ll add the featured image and set it to Published on the
        next screen.
      </p>
    </form>
  );
}