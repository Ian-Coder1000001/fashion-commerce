import { Schema, model, models, Types } from "mongoose";

const ReviewSchema = new Schema(
  {
    product: { type: Types.ObjectId, ref: "Product", required: true, index: true },
    user: { type: Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: String,
    body: { type: String, required: true },
    status: { type: String, enum: ["approved", "hidden"], default: "approved" },
  },
  { timestamps: true }
);

// One review per customer per product, enforced by the database itself.
ReviewSchema.index({ product: 1, user: 1 }, { unique: true });

export default models.Review || model("Review", ReviewSchema);