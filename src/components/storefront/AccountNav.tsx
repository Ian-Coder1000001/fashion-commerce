"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import clsx from "clsx";

const TABS = [
  { href: "/account", label: "Profile" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/wishlist", label: "Wishlist" },
];

export function AccountNav() {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between mb-12 text-sm border-b border-border pb-4">
      <div className="flex gap-8">
        {TABS.map((tab) => (
          <Link
            key={tab.href}
            href={tab.href}
            className={clsx(
              pathname === tab.href ? "text-fg" : "text-fg-muted hover:text-fg"
            )}
          >
            {tab.label}
          </Link>
        ))}
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/" })}
        className="text-fg-muted hover:text-fg"
      >
        Sign out
      </button>
    </div>
  );
}