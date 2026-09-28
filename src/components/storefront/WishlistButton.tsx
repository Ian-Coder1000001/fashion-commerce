"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { toggleWishlistAction } from "@/actions/wishlist.actions";

export function WishlistButton({
  productId,
  initialSaved,
  isLoggedIn,
}: {
  productId: string;
  initialSaved: boolean;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [saved, setSaved] = useState(initialSaved);
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!isLoggedIn) {
      router.push("/login");
      return;
    }
    setSaved((s) => !s);
    startTransition(async () => {
      await toggleWishlistAction(productId);
      router.refresh();
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-xs tracking-wide uppercase text-fg-muted hover:text-fg underline underline-offset-4"
    >
      {saved ? "Saved to Wishlist ✓" : "Save to Wishlist"}
    </button>
  );
}