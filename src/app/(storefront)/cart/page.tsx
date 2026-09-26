import Link from "next/link";
import { getCartSummary } from "@/services/cart.service";
import { CartLineRow } from "@/components/storefront/CartLineRow";
import { Button } from "@/components/ui/Button";

function formatPrice(amount: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function CartPage() {
  const { lines, subtotal } = await getCartSummary();

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-6 py-24 text-center">
        <h1 className="font-display text-h1 mb-4">Your bag is empty</h1>
        <p className="text-fg-muted mb-8">Discover the latest collection.</p>
        <Link
          href="/"
          className="inline-block border border-fg px-8 py-3 text-xs tracking-wide uppercase hover:bg-fg hover:text-bg transition-colors"
        >
          Shop New Arrivals
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-h1 mb-10">Your Bag</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2 flex flex-col divide-y divide-border border-y border-border">
          {lines.map((line) => (
            <CartLineRow key={line.itemId} line={line} />
          ))}
        </div>

        <div className="lg:col-span-1">
          <div className="border border-border p-6">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-fg-muted">Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <p className="text-xs text-fg-muted mb-6">
              Shipping and taxes calculated at checkout.
            </p>
            <Link href="/checkout">
              <Button className="w-full">Checkout</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}