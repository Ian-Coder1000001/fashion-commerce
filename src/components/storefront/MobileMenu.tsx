"use client";

import { useState } from "react";
import Link from "next/link";

import { useEffect } from "react";

interface Category {
  _id: string;
  name: string;
  slug: string;
}

export function MobileMenu({ categories }: { categories: Category[] }) {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        className="h-9 w-9 flex flex-col items-center justify-center gap-1.5"
      >
        <span className="block w-5 h-px bg-fg" />
        <span className="block w-5 h-px bg-fg" />
      </button>

      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-50 bg-bg flex flex-col"
        >
          <div className="h-16 flex items-center justify-between px-6 border-b border-border">
            <span className="font-display text-xl">Menu</span>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              className="text-2xl leading-none p-2 -mr-2"
            >
              ×
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-6 py-8 flex flex-col gap-1">
            {categories.map((category) => (
              <Link
                key={category._id}
                href={`/${category.slug}`}
                onClick={() => setIsOpen(false)}
                className="py-3 text-lg border-b border-border"
              >
                {category.name}
              </Link>
            ))}
            <Link
              href="/collections"
              onClick={() => setIsOpen(false)}
              className="py-3 text-lg border-b border-border"
            >
              Collections
            </Link>
            <Link
              href="/journal"
              onClick={() => setIsOpen(false)}
              className="py-3 text-lg border-b border-border"
            >
              Journal
            </Link>
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="py-3 text-lg border-b border-border"
            >
              Our Story
            </Link>
            <Link
              href="/contact"
              onClick={() => setIsOpen(false)}
              className="py-3 text-lg border-b border-border"
            >
              Contact
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
