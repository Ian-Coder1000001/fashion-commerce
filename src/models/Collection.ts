import { Schema, model, models } from "mongoose";

const CollectionSchema = new Schema(
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
    order: { type: Number, default: 0 },
    isEnabled: { type: Boolean, default: true },
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true }
);

export default models.Collection || model("Collection", CollectionSchema);