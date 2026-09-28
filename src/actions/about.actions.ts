"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import AboutPage from "@/models/AboutPage";
import { uploadMedia, deleteMedia } from "@/services/media.service";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("Not authorized.");
  }
}

function revalidateAbout() {
  revalidatePath("/admin/about");
  revalidatePath("/about");
}

export async function updateAboutContentAction(formData: FormData) {
  await requireAdmin();
  await connectToDatabase();

  const values = String(formData.get("values") ?? "")
    .split("\n")
    .map((v) => v.trim())
    .filter(Boolean);

  const update = {
    title: String(formData.get("title") ?? "").trim() || "Our Story",
    story: String(formData.get("story") ?? "").trim(),
    mission: String(formData.get("mission") ?? "").trim(),
    vision: String(formData.get("vision") ?? "").trim(),
    videoUrl: String(formData.get("videoUrl") ?? "").trim(),
    values,
  };

  await AboutPage.findOneAndUpdate({}, update, { upsert: true });
  revalidateAbout();
}

export async function uploadAboutHeroImageAction(formData: FormData) {
  await requireAdmin();
  await connectToDatabase();

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    throw new Error("No file provided.");
  }

  const existing = await AboutPage.findOne();
  if (existing?.heroImage?.publicId) {
    await deleteMedia(existing.heroImage.publicId, existing.heroImage.resourceType);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const asset = await uploadMedia(buffer, "about");

  await AboutPage.findOneAndUpdate({}, { heroImage: asset }, { upsert: true });
  revalidateAbout();
}

export async function addTeamMemberAction(formData: FormData) {
  await requireAdmin();
  await connectToDatabase();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Name is required.");

  const role = String(formData.get("role") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  let photo;
  const file = formData.get("photo") as File | null;
  if (file && file.size > 0) {
    const buffer = Buffer.from(await file.arrayBuffer());
    photo = await uploadMedia(buffer, "about/team");
  }

  await AboutPage.findOneAndUpdate(
    {},
    { $push: { team: { name, role, bio, photo } } },
    { upsert: true }
  );
  revalidateAbout();
}

export async function removeTeamMemberAction(memberId: string) {
  await requireAdmin();
  await connectToDatabase();

  const about = await AboutPage.findOne();
  if (!about) return;

  const member = about.team.id(memberId);
  if (member?.photo?.publicId) {
    await deleteMedia(member.photo.publicId, member.photo.resourceType);
  }
  member?.deleteOne();
  await about.save();

  revalidateAbout();
}

export async function addTimelineEntryAction(formData: FormData) {
  await requireAdmin();
  await connectToDatabase();

  const year = String(formData.get("year") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!year || !title) throw new Error("Year and title are required.");

  await AboutPage.findOneAndUpdate(
    {},
    { $push: { timeline: { year, title, description } } },
    { upsert: true }
  );
  revalidateAbout();
}

export async function removeTimelineEntryAction(entryId: string) {
  await requireAdmin();
  await connectToDatabase();

  await AboutPage.findOneAndUpdate({}, { $pull: { timeline: { _id: entryId } } });
  revalidateAbout();
}