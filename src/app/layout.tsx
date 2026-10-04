import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { FONT_CLASSES } from "@/lib/fonts";
import { buildThemeStyle } from "@/lib/theme";
import { getStoreSettings } from "@/services/settings.service";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const name = settings.storeName ?? "Store";
  return {
    title: { default: name, template: `%s | ${name}` },
    description: "A premium fashion store.",
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getStoreSettings();
  const themeStyle = buildThemeStyle(settings.theme);

  return (
    <html lang="en" className={`${FONT_CLASSES} h-full antialiased`} style={themeStyle}>
      <body className="min-h-full flex flex-col bg-bg text-fg" suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}