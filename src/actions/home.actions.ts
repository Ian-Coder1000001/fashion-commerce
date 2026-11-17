"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import HomePage from "@/models/HomePage";
import { uploadMedia, deleteMedia } from "@/services/media.service";
import {
  DEFAULT_SECTIONS,
  SECTION_TYPES,
  safeHref,
  type HomeSection,
  type SectionType,
} from "@/lib/home-sections";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("Not authorized.");
  }
}

function revalidateHome() {
  revalidatePath("/");
  revalidatePath("/admin/homepage");
}

// Placeholder headings for newly added sections. Sections start
// switched off, so these are never public until an admin edits them.
const NEW_SECTION_HEADINGS: Record<SectionType, string> = {
  hero: "Your headline",
  categories: "Shop by Category",
  new_arrivals: "New Arrivals",
  best_sellers: "Best Sellers",
  collection: "",
  banner: "Your announcement",
  editorial: "Your headline",
};

/**
 * Singleton page document. The first time anything needs it, it's
 * created with the default sections so the admin starts from what the
 * storefront is already showing.
 */
async function getOrCreateHomePage() {
  await connectToDatabase();
  let page = await HomePage.findOne();
  if (!page) {
    page = await HomePage.create({ sections: DEFAULT_SECTIONS });
  }
  return page;
}

export async function getHomeSectionsForAdmin(): Promise<HomeSection[]> {
  await requireAdmin();
  const page = await getOrCreateHomePage();
  return JSON.parse(JSON.stringify(page.sections)) as HomeSection[];
}

export async function addHomeSectionAction(formData: FormData) {
  await requireAdmin();

  const type = String(formData.get("type") ?? "") as SectionType;
  if (!SECTION_TYPES.includes(type)) throw new Error("Unknown section type.");

  const page = await getOrCreateHomePage();
  page.sections.push({
    type,
    enabled: false,
    heading: NEW_SECTION_HEADINGS[type],
    limit: 8,
  });
  await page.save();
  revalidateHome();
}

const TEXT_FIELDS = ["eyebrow", "heading", "subheading", "buttonLabel"] as const;

export async function updateHomeSectionAction(sectionId: string, formData: FormData) {
  await requireAdmin();

  const page = await getOrCreateHomePage();
  const section = page.sections.id(sectionId);
  if (!section) return;

  // Each section type's form only contains its own fields, so only
  // fields actually present in the submission are touched.
  for (const field of TEXT_FIELDS) {
    if (formData.has(field)) {
      section[field] = String(formData.get(field) ?? "").trim();
    }
  }
  if (formData.has("buttonHref")) {
    section.buttonHref = safeHref(String(formData.get("buttonHref") ?? ""));
  }
  if (formData.has("collectionId")) {
    section.collectionId = String(formData.get("collectionId") ?? "") || null;
  }
  if (formData.has("limit")) {
    const n = parseInt(String(formData.get("limit")), 10);
    section.limit = Number.isFinite(n) ? Math.min(24, Math.max(1, n)) : 8;
  }

  await page.save();
  revalidateHome();
}

export async function toggleHomeSectionAction(sectionId: string) {
  await requireAdmin();

  const page = await getOrCreateHomePage();
  const section = page.sections.id(sectionId);
  if (!section) return;

  section.enabled = !section.enabled;
  await page.save();
  revalidateHome();
}

export async function moveHomeSectionAction(
  sectionId: string,
  direction: "up" | "down"
) {
  await requireAdmin();

  const page = await getOrCreateHomePage();
  const sections = page.toObject().sections as Array<{ _id: unknown }>;

  const index = sections.findIndex((s) => String(s._id) === sectionId);
  const target = direction === "up" ? index - 1 : index + 1;
  if (index < 0 || target < 0 || target >= sections.length) return;

  [sections[index], sections[target]] = [sections[target], sections[index]];
  page.set("sections", sections);
  await page.save();
  revalidateHome();
}

export async function removeHomeSectionAction(sectionId: string) {
  await requireAdmin();

  const page = await getOrCreateHomePage();
  const section = page.sections.id(sectionId);
  if (!section) return;

  if (section.image?.publicId) {
    await deleteMedia(section.image.publicId, section.image.resourceType);
  }

  section.deleteOne();
  await page.save();
  revalidateHome();
}

export async function uploadHomeSectionImageAction(
  sectionId: string,
  formData: FormData
) {
  await requireAdmin();

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("No file provided.");

  const page = await getOrCreateHomePage();
  const section = page.sections.id(sectionId);
  if (!section) throw new Error("Section not found.");

  // Replacing an image: remove the old Cloudinary asset first so
  // nothing is left orphaned.
  if (section.image?.publicId) {
    await deleteMedia(section.image.publicId, section.image.resourceType);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const asset = await uploadMedia(buffer, "homepage");

  section.image = asset;
  await page.save();
  revalidateHome();
}

export async function removeHomeSectionImageAction(sectionId: string) {
  await requireAdmin();

  const page = await getOrCreateHomePage();
  const section = page.sections.id(sectionId);
  if (!section) return;

  if (section.image?.publicId) {
    await deleteMedia(section.image.publicId, section.image.resourceType);
  }

  section.set("image", undefined);
  await page.save();
  revalidateHome();
}