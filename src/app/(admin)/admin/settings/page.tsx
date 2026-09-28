import Image from "next/image";
import { getStoreSettings } from "@/services/settings.service";
import { uploadLogoAction } from "@/actions/settings.actions";
import { SettingsForm } from "@/components/admin/SettingsForm";
import { Button } from "@/components/ui/Button";

export default async function AdminSettingsPage() {
  const settings = await getStoreSettings();

  return (
    <div>
      <h1 className="font-display text-2xl mb-8">Settings</h1>

      <div className="mb-12 max-w-sm">
        <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">Logo</h2>
        {settings.logo?.secureUrl && (
          <div className="relative w-40 h-20 mb-4 border border-border bg-surface">
            <Image
              src={settings.logo.secureUrl}
              alt=""
              fill
              className="object-contain p-2"
            />
          </div>
        )}
        <form action={uploadLogoAction} className="flex flex-col gap-3 border border-border p-4">
          <input type="file" name="file" accept="image/*" required className="text-sm" />
          <Button type="submit" size="sm" className="self-start">
            {settings.logo?.secureUrl ? "Replace logo" : "Upload logo"}
          </Button>
        </form>
      </div>

      <SettingsForm settings={JSON.parse(JSON.stringify(settings))} />
    </div>
  );
}