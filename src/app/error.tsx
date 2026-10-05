"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error boundary]", error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <p className="text-xs tracking-[0.2em] uppercase text-fg-muted mb-4">
        Something went wrong
      </p>
      <h1 className="font-display text-h1 mb-4">Unexpected error</h1>
      <p className="text-fg-muted mb-8 max-w-sm">
        Something didn&apos;t load correctly. You can try again, or head back
        home.
      </p>
      <div className="flex gap-4">
        <Button onClick={reset}>Try Again</Button>
        <Link
          href="/"
          className="inline-flex items-center border border-fg px-6 text-xs tracking-wide uppercase hover:bg-fg hover:text-bg transition-colors"
        >
          Go Home
        </Link>
      </div>
    </div>
  );
}