import { getStoreSettings } from "@/services/settings.service";

export default async function ShippingPage() {
  const settings = await getStoreSettings();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-h1 mb-8">Shipping</h1>
      {settings.shippingInfo ? (
        <p className="text-sm leading-relaxed whitespace-pre-line text-fg-muted">
          {settings.shippingInfo}
        </p>
      ) : (
        <p className="text-sm text-fg-muted">Shipping information coming soon.</p>
      )}
    </div>
  );
}