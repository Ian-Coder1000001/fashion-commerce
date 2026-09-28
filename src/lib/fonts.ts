import {
  Fraunces,
  Archivo,
  Playfair_Display,
  Inter,
  Archivo_Black,
  Space_Grotesk,
} from "next/font/google";

// Variable fonts: no `weight` array — Next.js loads the full variable
// range automatically. Specifying discrete weights for a variable font
// is what caused the Turbopack "queries have exactly one entry" error.
export const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const archivo = Archivo({
  variable: "--font-archivo",
  subsets: ["latin"],
});

export const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

export const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

// Archivo Black is NOT a variable font — it only ships one static
// weight, so `weight` is required here (this one was already correct).
export const archivoBlack = Archivo_Black({
  variable: "--font-archivo-black",
  subsets: ["latin"],
  weight: ["400"],
});

export const FONT_CLASSES = [
  fraunces.variable,
  archivo.variable,
  playfair.variable,
  inter.variable,
  archivoBlack.variable,
  spaceGrotesk.variable,
].join(" ");

export interface FontPair {
  label: string;
  display: string;
  body: string;
}

export const FONT_PAIRS: Record<string, FontPair> = {
  "editorial-serif": {
    label: "Editorial Serif — Fraunces + Archivo",
    display: "var(--font-fraunces)",
    body: "var(--font-archivo)",
  },
  "classic-elegant": {
    label: "Classic Elegant — Playfair Display + Inter",
    display: "var(--font-playfair)",
    body: "var(--font-inter)",
  },
  "bold-streetwear": {
    label: "Bold Streetwear — Archivo Black + Archivo",
    display: "var(--font-archivo-black)",
    body: "var(--font-archivo)",
  },
  "minimal-modern": {
    label: "Minimal Modern — Space Grotesk + Inter",
    display: "var(--font-space-grotesk)",
    body: "var(--font-inter)",
  },
};

export const DEFAULT_FONT_PAIR = "editorial-serif";