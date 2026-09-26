"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  updateCartItemAction,
  removeCartItemAction,
} from "@/actions/cart.actions";
import type { CartLineForDisplay } from "@/services/cart.service";

function formatPrice(amount: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function CartLineRow({ line }: { line: CartLineForDisplay }) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(line.quantity);
  const [isPending, startTransition] = useTransition();

  function handleQuantityChange(next: number) {
    if (next < 1 || next > line.stockAvailable) return;
    setQuantity(next);
    startTransition(async () => {
      await updateCartItemAction(line.itemId, next);
      router.refresh();
    });
  }

  function handleRemove() {
    startTransition(async () => {
      await removeCartItemAction(line.itemId);
      router.refresh();
    });
  }

  return (
    <div className="flex gap-4 py-6">
      <Link
        href={`/product/${line.slug}`}
        className="relative w-24 h-32 shrink-0 bg-surface border border-border"
      >
        {line.image ? (
          <Image src={line.image} alt={line.name} fill className="object-cover" />
        ) : null}
      </Link>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <Link href={`/product/${line.slug}`} className="text-sm hover:underline">
            {line.name}
          </Link>
          <p className="text-sm text-fg-muted mt-1">{formatPrice(line.price)}</p>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center border border-border">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={isPending || quantity <= 1}
              className="w-8 h-8 text-sm disabled:opacity-40"
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="w-8 text-center text-sm">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={isPending || quantity >= line.stockAvailable}
              className="w-8 h-8 text-sm disabled:opacity-40"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          <button
            onClick={handleRemove}
            disabled={isPending}
            className="text-xs text-fg-muted hover:text-error"
          >
            Remove
          </button>
        </div>
      </div>

      <p className="text-sm w-24 text-right shrink-0">
        {formatPrice(line.lineTotal)}
      </p>
    </div>
  );
}