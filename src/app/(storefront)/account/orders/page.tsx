import { getCurrentUser } from "@/actions/account.actions";
import { AccountNav } from "@/components/storefront/AccountNav";

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="font-display text-h1 mb-2">Orders</h1>
      <p className="text-fg-muted mb-10">{user.email}</p>

      <AccountNav />

      <p className="text-sm text-fg-muted">
        Checkout and order history land in a later phase, once the cart
        and payment system are built. This page will show your real
        orders once that&apos;s in place.
      </p>
    </div>
  );
}