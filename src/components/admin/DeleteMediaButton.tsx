"use client";

import { useTransition } from "react";
import { deleteMediaAction } from "@/actions/media.actions";

export function DeleteMediaButton({
  publicId,
  usedByCount,
}: {
  publicId: string;
  usedByCount: number;
}) {
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (usedByCount > 0) {
      const confirmed = window.confirm(
        `This image is used in ${usedByCount} place${usedByCount === 1 ? "" : "s"}. Deleting it will remove it there too. Continue?`
      );
      if (!confirmed) return;
    }
    startTransition(() => {
      deleteMediaAction(publicId);
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="text-xs text-fg-muted hover:text-error"
    >
      {isPending ? "Deleting…" : "Delete"}
    </button>
  );
}