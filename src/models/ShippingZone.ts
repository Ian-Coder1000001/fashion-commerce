import { Schema, model, models } from "mongoose";

const ShippingZoneSchema = new Schema(
  {
    name: { type: String, required: true },
    countries: { type: [String], default: [] },
    // Optional county/region for Kenya-style granularity. A zone with
    // a region set only matches that exact region within its countries.
    // A zone with no region is the country-wide fallback for any region
    // not covered by a more specific zone.
    region: { type: String, default: null },
    fee: { type: Number, required: true },
    freeShippingThreshold: { type: Number, default: null },
    estimatedDays: { type: String, default: "" },
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.ShippingZone || model("ShippingZone", ShippingZoneSchema);