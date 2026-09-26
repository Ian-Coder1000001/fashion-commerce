import { Schema, model, models } from "mongoose";

const BlogPostSchema = new Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    featuredImage: {
      publicId: String,
      secureUrl: String,
      resourceType: String,
      folder: String,
    },
    author: { type: String, default: "Store Team" },
    tags: [String],
    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
    },
    publishedAt: { type: Date, default: null },
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true }
);

export default models.BlogPost || model("BlogPost", BlogPostSchema);