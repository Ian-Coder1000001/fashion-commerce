"use client";

import { useActionState } from "react";
import {
  createCollectionAction,
  type CollectionFormState,
} from "@/actions/collection.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: CollectionFormState = {};

export function CollectionCreateForm() {
  const [state, formAction, isPending] = useActionState(
    createCollectionAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className="flex flex-col gap-4 mb-10 max-w-xl border border-border p-6"
    >
      <div className="grid grid-cols-2 gap-4">
        <Input label="Name" name="name" required />
        <Input label="Slug" name="slug" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-xs tracking-wide text-fg-muted">
          Description (optional)
        </label>
        <textarea
          name="description"
          rows={2}
          className="border border-border bg-surface px-3 py-2 text-sm"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-error">
          {state.error}
        </p>
      )}

      <Button type="submit" size="sm" disabled={isPending} className="self-start">
        {isPending ? "Adding…" : "Add collection"}
      </Button>
    </form>
  );
}