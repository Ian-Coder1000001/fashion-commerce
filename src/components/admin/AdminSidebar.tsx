"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import clsx from "clsx";

const NAV_SECTIONS = [
  {
    label: "Catalog",
    items: [
      { href: "/admin/products", label: "Products" },
      { href: "/admin/categories", label: "Categories" },
      { href: "/admin/collections", label: "Collections" },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/customers", label: "Customers" },
    ],
  },
  {
    label: "Marketing",
    items: [
      { href: "/admin/coupons", label: "Coupons" },
      { href: "/admin/newsletter", label: "Newsletter" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/blog", label: "Blog" },
      { href: "/admin/about", label: "About Page" },
      { href: "/admin/media", label: "Media" },
      { href: "/admin/messages", label: "Messages" },
    ],
  },
  {
    label: "Store",
    items: [
      { href: "/admin/shipping", label: "Shipping" },
      { href: "/admin/settings", label: "Settings" },
    ],
  },
];

export function AdminSidebar({ storeName }: { storeName?: string }) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const navContent = (
    <nav className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6">
      <Link
        href="/admin"
        onClick={() => setIsOpen(false)}
        className={clsx(
          "text-sm px-2 py-1.5",
          pathname === "/admin" ? "text-fg" : "text-fg-muted hover:text-fg"
        )}
      >
        Dashboard
      </Link>

      {NAV_SECTIONS.map((section) => (
        <div key={section.label}>
          <p className="text-xs tracking-wide text-fg-muted px-2 mb-2 uppercase">
            {section.label}
          </p>
          <div className="flex flex-col">
            {section.items.map((item) => {
              const isActive = pathname.startsWith(item.href) && item.href !== "/admin";
              return (
                <Link
                  key={item.href + item.label}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={clsx(
                    "text-sm px-2 py-1.5",
                    isActive ? "text-fg" : "text-fg-muted hover:text-fg"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      {/* Mobile top bar — only the hamburger trigger lives outside the
          drawer itself, same self-contained pattern as the storefront's
          MobileMenu, so no cross-component state is needed. */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-14 bg-bg border-b border-border z-30 flex items-center px-4 gap-3">
        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open admin menu"
          className="h-9 w-9 flex flex-col items-center justify-center gap-1.5 shrink-0"
        >
          <span className="block w-5 h-px bg-fg" />
          <span className="block w-5 h-px bg-fg" />
        </button>
        <span className="font-display text-base truncate">
          {storeName ?? "Store"} Admin
        </span>
      </div>

      {/* Backdrop, mobile only, only when drawer is open */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="md:hidden fixed inset-0 bg-black/40 z-40"
        />
      )}

      <aside
        className={clsx(
          "w-72 md:w-60 shrink-0 border-r border-border bg-bg flex flex-col",
          "fixed inset-y-0 left-0 z-50 transition-transform duration-200",
          "md:static md:translate-x-0 md:h-screen md:sticky md:top-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <Link href="/admin" className="font-display text-lg truncate">
            {storeName ?? "Store"} Admin
          </Link>
          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
            className="md:hidden text-2xl leading-none p-2 -mr-2 shrink-0"
          >
            ×
          </button>
        </div>

        {navContent}

        <div className="border-t border-border p-4">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-sm text-fg-muted hover:text-fg"
          >
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}