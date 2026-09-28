import { Schema, model, models, Types } from "mongoose";

const WishlistSchema = new Schema(
  {
    user: { type: Types.ObjectId, ref: "User", required: true, unique: true },
    products: [{ type: Types.ObjectId, ref: "Product" }],
  },
  { timestamps: true }
);

export default models.Wishlist || model("Wishlist", WishlistSchema);