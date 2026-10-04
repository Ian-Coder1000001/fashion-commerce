import { connectToDatabase } from "@/lib/db";
import ShippingZone from "@/models/ShippingZone";

export interface ShippingEstimate {
  fee: number;
  freeShippingApplied: boolean;
  estimatedDays?: string;
  zoneName?: string;
}

/**
 * Three-tier lookup, most specific wins:
 *   1. Exact country + region match (e.g. Kenya + Nairobi)
 *   2. Country-wide zone with no region set (e.g. Kenya, any other county)
 *   3. The single isDefault zone (fallback for anywhere else entirely)
 *
 * Called twice in the real flow: once for the live preview as the
 * shopper fills in checkout, and again inside placeOrder() right before
 * the order is created — the second call is the one that's charged.
 */
export async function estimateShipping(
  country: string,
  region: string | undefined,
  subtotal: number
): Promise<ShippingEstimate> {
  await connectToDatabase();

  const normalizedCountry = country.trim();
  const normalizedRegion = region?.trim();

  let zone = null;

  if (normalizedCountry && normalizedRegion) {
    zone = await ShippingZone.findOne({
      countries: { $regex: `^${normalizedCountry}$`, $options: "i" },
      region: { $regex: `^${normalizedRegion}$`, $options: "i" },
    });
  }

  if (!zone && normalizedCountry) {
    zone = await ShippingZone.findOne({
      countries: { $regex: `^${normalizedCountry}$`, $options: "i" },
      region: null,
    });
  }

  if (!zone) {
    zone = await ShippingZone.findOne({ isDefault: true });
  }

  if (!zone) {
    return { fee: 0, freeShippingApplied: false };
  }

  const freeShippingApplied =
    zone.freeShippingThreshold != null && subtotal >= zone.freeShippingThreshold;

  return {
    fee: freeShippingApplied ? 0 : zone.fee,
    freeShippingApplied,
    estimatedDays: zone.estimatedDays || undefined,
    zoneName: zone.name,
  };
}