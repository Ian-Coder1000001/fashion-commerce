import { getStoreSettings } from "@/services/settings.service";

export default async function PrivacyPage() {
  const settings = await getStoreSettings();

  return (
    <div className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="font-display text-h1 mb-8">Privacy Policy</h1>
      {settings.privacyPolicy ? (
        <p className="text-sm leading-relaxed whitespace-pre-line text-fg-muted">
          {settings.privacyPolicy}
        </p>
      ) : (
        <p className="text-sm text-fg-muted">Privacy policy coming soon.</p>
      )}
    </div>
  );
}