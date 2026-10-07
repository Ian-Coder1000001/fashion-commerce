"use client";

import { updateStoreSettingsAction } from "@/actions/settings.actions";
import { FONT_PAIRS } from "@/lib/fonts";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface SettingsFormProps {
  settings: {
    storeName?: string;
    contactEmail?: string;
    contactPhone?: string;
    address?: string;
    currency?: string;
    socialLinks?: {
      facebook?: string;
      instagram?: string;
      twitter?: string;
      tiktok?: string;
    };
    shippingInfo?: string;
    returnPolicy?: string;
    privacyPolicy?: string;
    termsAndConditions?: string;
    theme?: {
      primaryColor?: string | null;
      secondaryColor?: string | null;
      textColor?: string | null;
      backgroundColor?: string | null;
      buttonColor?: string | null;
      buttonTextColor?: string | null;
      borderColor?: string | null;
      fontPair?: string | null;
    };
  };
}

function ColorField({
  label,
  name,
  defaultValue,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={`color-${name}`} className="text-xs tracking-wide text-fg-muted">
        {label}
      </label>
      <input
        id={`color-${name}`}
        type="color"
        name={name}
        defaultValue={defaultValue || "#141414"}
        className="h-11 w-full border border-border bg-surface cursor-pointer"
      />
    </div>
  );
}

export function SettingsForm({ settings }: SettingsFormProps) {
  const theme = settings.theme ?? {};

  return (
    <form action={updateStoreSettingsAction} className="flex flex-col gap-12 max-w-3xl">
      <section>
        <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
          Store Info
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Store name"
            name="storeName"
            defaultValue={settings.storeName}
            required
            className="col-span-2"
          />
          <Input
            label="Contact email"
            name="contactEmail"
            type="email"
            defaultValue={settings.contactEmail}
          />
          <Input
            label="Contact phone"
            name="contactPhone"
            defaultValue={settings.contactPhone}
          />
          <Input
            label="Address"
            name="address"
            defaultValue={settings.address}
            className="col-span-2"
          />
          <Input
            label="Currency code"
            name="currency"
            defaultValue={settings.currency || "KES"}
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
          Social Links
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Facebook"
            name="facebook"
            defaultValue={settings.socialLinks?.facebook}
          />
          <Input
            label="Instagram"
            name="instagram"
            defaultValue={settings.socialLinks?.instagram}
          />
          <Input
            label="Twitter / X"
            name="twitter"
            defaultValue={settings.socialLinks?.twitter}
          />
          <Input
            label="TikTok"
            name="tiktok"
            defaultValue={settings.socialLinks?.tiktok}
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
          Brand Colors
        </h2>
        <div className="grid grid-cols-3 gap-4">
          <ColorField
            label="Background"
            name="backgroundColor"
            defaultValue={theme.backgroundColor}
          />
          <ColorField label="Text" name="textColor" defaultValue={theme.textColor} />
          <ColorField
            label="Muted text / secondary"
            name="secondaryColor"
            defaultValue={theme.secondaryColor}
          />
          <ColorField
            label="Border"
            name="borderColor"
            defaultValue={theme.borderColor}
          />
          <ColorField
            label="Button background"
            name="buttonColor"
            defaultValue={theme.buttonColor}
          />
          <ColorField
            label="Button text"
            name="buttonTextColor"
            defaultValue={theme.buttonTextColor}
          />
          <ColorField
            label="Primary accent (sale prices, highlights)"
            name="primaryColor"
            defaultValue={theme.primaryColor}
          />
        </div>
      </section>

      <section>
        <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
          Typography
        </h2>
        <div className="flex flex-col gap-1.5 max-w-sm">
          <label className="text-xs tracking-wide text-fg-muted">Font pairing</label>
          <select
            name="fontPair"
            defaultValue={theme.fontPair || "editorial-serif"}
            className="h-11 border border-border bg-surface px-3 text-sm"
          >
            {Object.entries(FONT_PAIRS).map(([key, pair]) => (
              <option key={key} value={key}>
                {pair.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <section>
        <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
          Policies
        </h2>
        <div className="flex flex-col gap-4">
          {[
            ["shippingInfo", "Shipping information"],
            ["returnPolicy", "Return policy"],
            ["privacyPolicy", "Privacy policy"],
            ["termsAndConditions", "Terms and conditions"],
          ].map(([name, label]) => (
            <div key={name} className="flex flex-col gap-1.5">
              <label className="text-xs tracking-wide text-fg-muted">{label}</label>
              <textarea
                name={name}
                defaultValue={
                  (settings as Record<string, unknown>)[name] as string | undefined
                }
                rows={4}
                className="border border-border bg-surface px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
      </section>

      <Button type="submit" size="sm" className="self-start">
        Save settings
      </Button>
    </form>
  );
}