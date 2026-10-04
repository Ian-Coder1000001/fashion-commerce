"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useTransition } from "react";

interface ProductFiltersProps {
  sizes: string[];
  colors: string[];
}

const SORT_OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

export function ProductFilters({ sizes, colors }: ProductFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <div className="flex flex-wrap gap-4 items-center mb-10 pb-6 border-b border-border text-sm">
      {sizes.length > 0 && (
        <select
          value={searchParams.get("size") ?? ""}
          onChange={(e) => updateParam("size", e.target.value)}
          disabled={isPending}
          className="h-10 border border-border bg-surface px-3 text-sm"
        >
          <option value="">All Sizes</option>
          {sizes.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      )}

      {colors.length > 0 && (
        <select
          value={searchParams.get("color") ?? ""}
          onChange={(e) => updateParam("color", e.target.value)}
          disabled={isPending}
          className="h-10 border border-border bg-surface px-3 text-sm"
        >
          <option value="">All Colors</option>
          {colors.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      )}

      <select
        value={searchParams.get("sort") ?? "newest"}
        onChange={(e) => updateParam("sort", e.target.value)}
        disabled={isPending}
        className="h-10 border border-border bg-surface px-3 text-sm ml-auto"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}