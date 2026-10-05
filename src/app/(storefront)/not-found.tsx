import Link from "next/link";

export default function StorefrontNotFound() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center">
      <p className="text-xs tracking-[0.2em] uppercase text-fg-muted mb-4">
        404
      </p>
      <h1 className="font-display text-h1 mb-4">We couldn&apos;t find that</h1>
      <p className="text-fg-muted mb-8">
        This product, page, or link may no longer be available.
      </p>
      <Link
        href="/"
        className="inline-block border border-fg px-8 py-3 text-xs tracking-wide uppercase hover:bg-fg hover:text-bg transition-colors"
      >
        Continue Shopping
      </Link>
    </div>
  );
}