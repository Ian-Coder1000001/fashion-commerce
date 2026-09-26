import { Schema, model, models, Types } from "mongoose";

const CategorySchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    description: String,
    image: {
      publicId: String,
      secureUrl: String,
      resourceType: String,
      folder: String,
    },
    parent: { type: Types.ObjectId, ref: "Category", default: null },
    order: { type: Number, default: 0 },
    isEnabled: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.Category || model("Category", CategorySchema);
