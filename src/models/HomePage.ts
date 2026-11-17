import { Schema, model, models, Types } from "mongoose";
import { SECTION_TYPES } from "@/lib/home-sections";

const MediaAssetSchema = new Schema(
  {
    publicId: String,
    secureUrl: String,
    resourceType: String,
    folder: String,
  },
  { _id: false }
);

const SectionSchema = new Schema({
  type: { type: String, enum: [...SECTION_TYPES], required: true },
  enabled: { type: Boolean, default: true },
  eyebrow: String,
  heading: String,
  subheading: String,
  buttonLabel: String,
  buttonHref: String,
  collectionId: { type: Types.ObjectId, ref: "Collection", default: null },
  limit: { type: Number, default: 8 },
  image: MediaAssetSchema,
});

const HomePageSchema = new Schema(
  {
    sections: { type: [SectionSchema], default: [] },
  },
  { timestamps: true }
);

export default models.HomePage || model("HomePage", HomePageSchema);