import Link from "next/link";
import Image from "next/image";
import { listEnabledCategories } from "@/services/category.service";
import { getCartSummary } from "@/services/cart.service";
import { getStoreSettings } from "@/services/settings.service";
import { auth } from "@/lib/auth";
import { SearchBar } from "@/components/storefront/SearchBar";

export async function Navbar() {
  const [categories, session, cart, settings] = await Promise.all([
    listEnabledCategories(),
    auth(),
    getCartSummary(),
    getStoreSettings(),
  ]);

  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          {settings.logo?.secureUrl ? (
            <span className="relative w-32 h-10 block">
              <Image
                src={settings.logo.secureUrl}
                alt={settings.storeName ?? "Store"}
                fill
                className="object-contain object-left"
              />
            </span>
          ) : (
            <span className="font-display text-xl tracking-tight">
              {settings.storeName ?? "Store"}
            </span>
          )}
        </Link>

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

        <div className="flex items-center gap-5 text-xs tracking-wide uppercase text-fg-muted">

                    <SearchBar />

          {/* <span className="hidden sm:inline cursor-default">Search</span> */}
          <Link href={session ? "/account" : "/login"} className="hover:text-fg">
            Account
          </Link>
          <Link href="/cart" className="hover:text-fg">
            Bag ({cart.itemCount})
          </Link>
        </div>
      </div>
    </header>
  );
}