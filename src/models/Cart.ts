import { Schema, model, models, Types } from "mongoose";

const CartItemSchema = new Schema(
  {
    product: { type: Types.ObjectId, ref: "Product", required: true },
    variantId: { type: Types.ObjectId, default: null },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: true }
);

const CartSchema = new Schema(
  {
    userId: { type: Types.ObjectId, ref: "User", default: null, index: true },
    cartId: { type: String, default: null, index: true },
    items: { type: [CartItemSchema], default: [] },
  },
  { timestamps: true }
);

export default models.Cart || model("Cart", CartSchema);