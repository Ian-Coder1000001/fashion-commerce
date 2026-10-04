import { Schema, model, models } from "mongoose";

const AddressSchema = new Schema(
  {
    label: String, // e.g. "Home", "Work"
    line1: { type: String, required: true },
    line2: String,
    city: { type: String, required: true },
    region: String,
    postalCode: String,
    country: { type: String, required: true },
    phone: String,
    isDefault: { type: Boolean, default: false },
  },
  { _id: true }
);

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },

    // Absent for accounts created via Google OAuth
    passwordHash: { type: String, select: false },
    resetPasswordTokenHash: { type: String, select: false, default: null },
    resetPasswordExpires: { type: Date, select: false, default: null },

    provider: {
      type: String,
      enum: ["credentials", "google"],
      default: "credentials",
    },

    role: {
      type: String,
      enum: ["customer", "admin"],
      default: "customer",
    },

    phone: String,
    addresses: [AddressSchema],
    isDisabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default models.User || model("User", UserSchema);
