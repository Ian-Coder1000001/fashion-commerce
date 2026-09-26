import Link from "next/link";
import { listEnabledCategories } from "@/services/category.service";
import { getCartSummary } from "@/services/cart.service";
import { auth } from "@/lib/auth";

export async function Navbar() {
  const [categories, session, cart] = await Promise.all([
    listEnabledCategories(),
    auth(),
    getCartSummary(),
  ]);

  return (
    <header className="border-b border-border">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-xl tracking-tight">
          Store
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
          <span className="hidden sm:inline cursor-default">Search</span>
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