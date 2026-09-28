import type { CSSProperties } from "react";
import { FONT_PAIRS, DEFAULT_FONT_PAIR } from "@/lib/fonts";

export interface ThemeSettings {
  primaryColor?: string | null;
  secondaryColor?: string | null;
  textColor?: string | null;
  backgroundColor?: string | null;
  buttonColor?: string | null;
  buttonTextColor?: string | null;
  borderColor?: string | null;
  fontPair?: string | null;
}

/**
 * Builds an inline style object applied to <html>. Inline styles beat
 * any stylesheet rule on specificity, so this reliably overrides the
 * defaults in globals.css regardless of CSS injection order — which
 * matters because Next.js doesn't guarantee load order between
 * next/font's generated stylesheet and globals.css.
 */
export function buildThemeStyle(theme?: ThemeSettings | null): CSSProperties {
  const pair =
    FONT_PAIRS[theme?.fontPair ?? DEFAULT_FONT_PAIR] ?? FONT_PAIRS[DEFAULT_FONT_PAIR];

  const style: Record<string, string> = {
    "--font-display": pair.display,
    "--font-body": pair.body,
  };

  if (theme?.backgroundColor) style["--color-bg"] = theme.backgroundColor;
  if (theme?.textColor) style["--color-fg"] = theme.textColor;
  if (theme?.secondaryColor) style["--color-fg-muted"] = theme.secondaryColor;
  if (theme?.borderColor) style["--color-border"] = theme.borderColor;
  if (theme?.buttonColor) style["--color-accent"] = theme.buttonColor;
  if (theme?.buttonTextColor) style["--color-accent-fg"] = theme.buttonTextColor;
  if (theme?.primaryColor) style["--color-primary"] = theme.primaryColor;

  return style as CSSProperties;
}