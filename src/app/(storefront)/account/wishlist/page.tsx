import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/actions/account.actions";
import { getWishlistForCurrentUser } from "@/services/wishlist.service";
import { removeFromWishlistAction } from "@/actions/wishlist.actions";
import { AccountNav } from "@/components/storefront/AccountNav";

function formatPrice(amount: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const items = await getWishlistForCurrentUser();

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-h1 mb-2">Wishlist</h1>
      <p className="text-fg-muted mb-10">{user.email}</p>

      <AccountNav />

      {items.length === 0 ? (
        <p className="text-sm text-fg-muted">Nothing saved yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.productId}>
              <Link href={`/product/${item.slug}`} className="block">
                <div className="relative aspect-[3/4] bg-surface border border-border mb-2">
                  {item.image && (
                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                  )}
                </div>
                <p className="text-sm">{item.name}</p>
                <p className="text-sm text-fg-muted">
                  {formatPrice(item.salePrice ?? item.price, item.currency)}
                </p>
              </Link>
              <form action={removeFromWishlistAction.bind(null, item.productId)} className="mt-1">
                <button className="text-xs text-fg-muted hover:text-error">Remove</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}