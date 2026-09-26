"use client";

import { useActionState } from "react";
import {
  createProductAction,
  type ProductFormState,
} from "@/actions/product.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface Category {
  _id: string;
  name: string;
}

const initialState: ProductFormState = {};

export function ProductCreateForm({ categories }: { categories: Category[] }) {
  const [state, formAction, isPending] = useActionState(
    createProductAction,
    initialState
  );

  return (
    <form
      action={formAction}
      className="grid grid-cols-2 gap-4 mb-10 max-w-2xl border border-border p-6"
    >
      <Input label="Name" name="name" required />
      <Input label="Slug" name="slug" required />
      <Input label="SKU" name="sku" required />
      <div className="flex flex-col gap-1.5">
        <label className="text-xs tracking-wide text-fg-muted">Category</label>
        <select
          name="category"
          required
          className="h-11 border border-border bg-surface px-3 text-sm"
        >
          {categories.map((c) => (
            <option key={c._id} value={c._id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <Input label="Price" name="price" type="number" step="0.01" required />
      <Input label="Stock quantity" name="stockQuantity" type="number" />
      <div className="flex flex-col gap-1.5">
        <label className="text-xs tracking-wide text-fg-muted">Status</label>
        <select
          name="status"
          defaultValue="draft"
          className="h-11 border border-border bg-surface px-3 text-sm"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>
      <div className="col-span-2 flex flex-col gap-1.5">
        <label className="text-xs tracking-wide text-fg-muted">Description</label>
        <textarea
          name="description"
          required
          rows={3}
          className="border border-border bg-surface px-3 py-2 text-sm"
        />
      </div>

      {state.error && (
        <p role="alert" className="col-span-2 text-sm text-error">
          {state.error}
        </p>
      )}

      <div className="col-span-2 flex items-center gap-4">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Adding…" : "Add product"}
        </Button>
        <p className="text-xs text-fg-muted">
          Photos are added after creating the product — click its name in
          the table below once it&apos;s created.
        </p>
      </div>
    </form>
  );
}