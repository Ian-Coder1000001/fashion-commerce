import { Schema, model, models, Types } from "mongoose";

const MediaAssetSchema = new Schema(
  {
    publicId: { type: String, required: true },
    secureUrl: { type: String, required: true },
    resourceType: { type: String, default: "image" },
    folder: { type: String, required: true },
    width: Number,
    height: Number,
  },
  { _id: false }
);

const VariantSchema = new Schema(
  {
    size: String,
    color: String,
    sku: { type: String, required: true },
    price: Number, // overrides base price when set
    stock: { type: Number, default: 0 },
    image: MediaAssetSchema,
  },
  { _id: true }
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    sku: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    shortDescription: String,

    brand: String,
    category: { type: Types.ObjectId, ref: "Category", required: true },
    collections: [{ type: Types.ObjectId, ref: "Collection" }],
    tags: [String],

    price: { type: Number, required: true },
    salePrice: Number,
    saleStartDate: Date,
    saleEndDate: Date,
    currency: { type: String, default: "KES" },

    stockQuantity: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    stockStatus: {
      type: String,
      enum: ["in_stock", "low_stock", "out_of_stock"],
      default: "in_stock",
    },

    variants: [VariantSchema],
    images: { type: [MediaAssetSchema], default: [] },
    primaryImageIndex: { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },

    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true }
);

ProductSchema.index({ name: "text", description: "text", tags: "text" });

export default models.Product || model("Product", ProductSchema);
