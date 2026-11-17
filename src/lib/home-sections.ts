export const SECTION_TYPES = [
  "hero",
  "categories",
  "new_arrivals",
  "best_sellers",
  "collection",
  "banner",
  "editorial",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Hero banner",
  categories: "Shop by category",
  new_arrivals: "New arrivals",
  best_sellers: "Best sellers (automatic)",
  collection: "Featured collection",
  banner: "Promotional banner",
  editorial: "Editorial (image + text)",
};

export interface HomeSection {
  _id: string;
  type: SectionType;
  enabled: boolean;
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  buttonLabel?: string;
  buttonHref?: string;
  collectionId?: string | null;
  limit?: number;
  image?: {
    publicId: string;
    secureUrl: string;
    resourceType?: string;
    folder?: string;
  };
}

// What the homepage looks like until an admin saves their own layout.
export const DEFAULT_SECTIONS: Omit<HomeSection, "_id">[] = [
  {
    type: "hero",
    enabled: true,
    eyebrow: "New Season",
    heading: "The Everyday Edit",
    subheading: "Elevated essentials, considered details, made to be worn often.",
    buttonLabel: "Shop Collections",
    buttonHref: "/collections",
  },
  { type: "categories", enabled: true, heading: "Shop by Category" },
  { type: "new_arrivals", enabled: true, heading: "New Arrivals", limit: 8 },
];

/**
 * Only allows links that are safe to put in an href: a path on this
 * site, an anchor, or http(s). Anything else (including javascript:)
 * is dropped.
 */
export function safeHref(value: string): string {
  const v = value.trim();
  if (!v) return "";
  if (v.startsWith("/") && !v.startsWith("//")) return v;
  if (v.startsWith("#")) return v;
  if (/^https?:\/\//i.test(v)) return v;
  return "";
}