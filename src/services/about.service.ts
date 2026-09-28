import { connectToDatabase } from "@/lib/db";
import AboutPage from "@/models/AboutPage";

const DEFAULTS = {
  title: "Our Story",
  values: [] as string[],
  team: [] as unknown[],
  timeline: [] as unknown[],
};

export async function getAboutPage() {
  await connectToDatabase();
  const page = await AboutPage.findOne().lean();
  return page ?? DEFAULTS;
}