import { getCurrentUser } from "@/actions/account.actions";
import { AccountNav } from "@/components/storefront/AccountNav";

export default async function WishlistPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-h1 mb-2">Wishlist</h1>
      <p className="text-fg-muted mb-10">{user.email}</p>

      <AccountNav />

      <p className="text-sm text-fg-muted">
        Saving products to a wishlist is built alongside the shopping
        cart in a later phase.
      </p>
    </div>
  );
}