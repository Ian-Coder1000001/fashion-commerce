"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

export function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    startTransition(() => {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="hidden sm:block">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search"
        aria-label="Search products"
        disabled={isPending}
        className="w-32 focus:w-48 transition-all bg-transparent border-b border-transparent focus:border-border text-xs placeholder:text-fg-muted focus:outline-none py-1"
      />
    </form>
  );
}
