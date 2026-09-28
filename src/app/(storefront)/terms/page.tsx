import { getStoreSettings } from "@/services/settings.service";

export default async function TermsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-h1 mb-8">Terms &amp; Conditions</h1>
      {settings.termsAndConditions ? (
        <p className="text-sm leading-relaxed whitespace-pre-line text-fg-muted">
          {settings.termsAndConditions}
        </p>
      ) : (
        <p className="text-sm text-fg-muted">Terms and conditions coming soon.</p>
      )}
    </div>
  );
}