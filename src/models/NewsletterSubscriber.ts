import { Schema, model, models } from "mongoose";

const NewsletterSubscriberSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default models.NewsletterSubscriber ||
  model("NewsletterSubscriber", NewsletterSubscriberSchema);