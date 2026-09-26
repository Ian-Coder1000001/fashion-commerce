import { Schema, model, models } from "mongoose";

const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["percentage", "fixed"], required: true },
    value: { type: Number, required: true },

    startDate: { type: Date, default: null },
    endDate: { type: Date, default: null },
    usageLimit: { type: Number, default: null }, // null = unlimited
    usedCount: { type: Number, default: 0 },

    minOrderAmount: { type: Number, default: null },
    maxDiscountAmount: { type: Number, default: null }, // caps percentage discounts

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Coupon || model("Coupon", CouponSchema);