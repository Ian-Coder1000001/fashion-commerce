import Link from "next/link";
import Image from "next/image";
import { listEnabledCategories } from "@/services/category.service";
import { getCartSummary } from "@/services/cart.service";
import { getStoreSettings } from "@/services/settings.service";
import { auth } from "@/lib/auth";
import { SearchBar } from "@/components/storefront/SearchBar";
import { MobileMenu } from "@/components/storefront/MobileMenu";

export async function Navbar() {
  const [categories, session, cart, settings] = await Promise.all([
    listEnabledCategories(),
    auth(),
    getCartSummary(),
    getStoreSettings(),
  ]);

  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 shrink-0">
          <MobileMenu
            categories={categories.map((c) => ({
              _id: String(c._id),
              name: c.name,
              slug: c.slug,
            }))}
          />
          <Link href="/" className="flex items-center min-w-0">
            {settings.logo?.secureUrl ? (
              <span className="relative w-24 sm:w-32 h-8 sm:h-10 block shrink-0">
                <Image
                  src={settings.logo.secureUrl}
                  alt={settings.storeName ?? "Store"}
                  fill
                  sizes="128px"
                  className="object-contain object-left"
                />
              </span>
            ) : (
              <span className="font-display text-lg sm:text-xl tracking-tight truncate">
                {settings.storeName ?? "Store"}
              </span>
            )}
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-8">
          {categories.map((category) => (
            <Link
              key={String(category._id)}
              href={`/${category.slug}`}
              className="text-xs tracking-wide uppercase text-fg-muted hover:text-fg"
            >
              {category.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1 shrink-0">
          <SearchBar />
          <Link
            href={session ? "/account" : "/login"}
            aria-label="Account"
            className="h-9 w-9 flex items-center justify-center text-fg-muted hover:text-fg"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 21a8 8 0 0 0-16 0" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </Link>
          <Link
            href="/cart"
            className="h-9 flex items-center px-2 text-xs tracking-wide uppercase text-fg-muted hover:text-fg whitespace-nowrap"
          >
            Bag ({cart.itemCount})
          </Link>
        </div>
      </div>
    </header>
  );
}