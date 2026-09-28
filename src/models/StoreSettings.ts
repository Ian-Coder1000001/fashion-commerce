import { Schema, model, models } from "mongoose";

const StoreSettingsSchema = new Schema(
  {
    storeName: { type: String, default: "Store" },
    logo: {
      publicId: String,
      secureUrl: String,
      resourceType: String,
      folder: String,
    },
    contactEmail: String,
    contactPhone: String,
    address: String,
    currency: { type: String, default: "KES" },
    socialLinks: {
      facebook: String,
      instagram: String,
      twitter: String,
      tiktok: String,
    },
    shippingInfo: String,
    returnPolicy: String,
    privacyPolicy: String,
    termsAndConditions: String,

    theme: {
      primaryColor: { type: String, default: null },
      secondaryColor: { type: String, default: null },
      textColor: { type: String, default: null },
      backgroundColor: { type: String, default: null },
      buttonColor: { type: String, default: null },
      buttonTextColor: { type: String, default: null },
      borderColor: { type: String, default: null },
      fontPair: { type: String, default: "editorial-serif" },
    },
  },
  { timestamps: true }
);

export default models.StoreSettings || model("StoreSettings", StoreSettingsSchema);