import { Schema, model, models } from "mongoose";

const MediaAssetSchema = new Schema(
  {
    publicId: String,
    secureUrl: String,
    resourceType: String,
    folder: String,
  },
  { _id: false }
);

const TeamMemberSchema = new Schema(
  {
    name: { type: String, required: true },
    role: String,
    bio: String,
    photo: MediaAssetSchema,
  },
  { _id: true }
);

const TimelineEntrySchema = new Schema(
  {
    year: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
  },
  { _id: true }
);

const AboutPageSchema = new Schema(
  {
    title: { type: String, default: "Our Story" },
    heroImage: MediaAssetSchema,
    story: String,
    mission: String,
    vision: String,
    values: { type: [String], default: [] },
    videoUrl: String,
    team: { type: [TeamMemberSchema], default: [] },
    timeline: { type: [TimelineEntrySchema], default: [] },
    seoTitle: String,
    seoDescription: String,
  },
  { timestamps: true }
);

export default models.AboutPage || model("AboutPage", AboutPageSchema);