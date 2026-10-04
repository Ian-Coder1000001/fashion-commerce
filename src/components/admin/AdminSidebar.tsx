"use client";

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

  return (
    <aside className="w-60 shrink-0 border-r border-border h-screen sticky top-0 flex flex-col">
      <div className="h-16 flex items-center px-6 border-b border-border">
        <Link href="/admin" className="font-display text-lg">
          {storeName ?? "Store"} Admin
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-6">
        <Link
          href="/admin"
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

      <div className="border-t border-border p-4">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-sm text-fg-muted hover:text-fg"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}