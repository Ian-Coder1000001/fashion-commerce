import { getStoreSettings } from "@/services/settings.service";

export default async function ReturnsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-h1 mb-8">Returns</h1>
      {settings.returnPolicy ? (
        <p className="text-sm leading-relaxed whitespace-pre-line text-fg-muted">
          {settings.returnPolicy}
        </p>
      ) : (
        <p className="text-sm text-fg-muted">Return policy coming soon.</p>
      )}
    </div>
  );
}