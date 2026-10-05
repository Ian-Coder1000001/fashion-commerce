import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-6 text-center">
      <p className="text-xs tracking-[0.2em] uppercase text-fg-muted mb-4">
        404
      </p>
      <h1 className="font-display text-h1 mb-4">Page not found</h1>
      <p className="text-fg-muted mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or may have been moved.
      </p>
      <Link
        href="/"
        className="inline-block border border-fg px-8 py-3 text-xs tracking-wide uppercase hover:bg-fg hover:text-bg transition-colors"
      >
        Back to Home
      </Link>
    </div>
  );
}