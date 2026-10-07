"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCartAction } from "@/actions/cart.actions";
import { Button } from "@/components/ui/Button";

interface VariantOption {
  id: string;
  label: string;
  stock: number;
}

interface AddToBagProps {
  productId: string;
  variants: VariantOption[];
  inStock: boolean;
}

export function AddToBag({ productId, variants, inStock }: AddToBagProps) {
  const router = useRouter();
  const [variantId, setVariantId] = useState(variants[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [isPending, startTransition] = useTransition();
  const [added, setAdded] = useState(false);

  const requiresVariant = variants.length > 0;
  const canAdd = inStock && (!requiresVariant || variantId);

  function handleAdd() {
    setAdded(false);
    startTransition(async () => {
      await addToCartAction(
        productId,
        quantity,
        requiresVariant ? variantId : null,
      );
      setAdded(true);
      router.refresh();
    });
  }

  if (!inStock) {
    return (
      <Button disabled className="w-full sm:w-auto">
        Out of stock
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {requiresVariant && (
        <div className="flex flex-col gap-1.5">
          <label className="text-xs tracking-wide text-fg-muted">
            Size / Variant
          </label>
          <select
            value={variantId}
            onChange={(e) => setVariantId(e.target.value)}
            className="h-11 border border-border bg-surface px-3 text-sm w-full sm:w-64"
          >
            {variants.map((v) => (
              <option key={v.id} value={v.id} disabled={v.stock <= 0}>
                {v.label} {v.stock <= 0 ? "(out of stock)" : ""}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="flex items-center gap-4">
        <select
          value={quantity}
          onChange={(e) => setQuantity(Number(e.target.value))}
          aria-label="Quantity"
          className="h-11 border border-border bg-surface px-3 text-sm w-20"
        >
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>

        <Button
          onClick={handleAdd}
          disabled={!canAdd || isPending}
          className="flex-1 sm:flex-none sm:w-56"
        >
          {isPending ? "Adding…" : added ? "Added ✓" : "Add to Bag"}
        </Button>
      </div>
    </div>
  );
}
