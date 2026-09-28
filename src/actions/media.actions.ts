"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import BlogPost from "@/models/BlogPost";
import StoreSettings from "@/models/StoreSettings";
import { deleteMedia } from "@/services/media.service";
import { listMediaLibrary } from "@/services/media-library.service";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("Not authorized.");
  }
}

export async function listMediaForAdmin() {
  await requireAdmin();
  return listMediaLibrary();
}

/**
 * Deletes a Cloudinary asset AND unlinks it from every document that
 * references it, so nothing is left pointing at a broken image. This is
 * the "delete anyway" path for an image that's still in use — the admin
 * page requires explicit confirmation before calling this.
 */
export async function deleteMediaAction(publicId: string) {
  await requireAdmin();
  await connectToDatabase();

  await Product.updateMany(
    { "images.publicId": publicId },
    { $pull: { images: { publicId } } }
  );
  await Product.updateMany(
    { "variants.image.publicId": publicId },
    { $unset: { "variants.$[elem].image": "" } },
    { arrayFilters: [{ "elem.image.publicId": publicId }] }
  );
  await BlogPost.updateMany(
    { "featuredImage.publicId": publicId },
    { $unset: { featuredImage: "" } }
  );
  await StoreSettings.updateMany(
    { "logo.publicId": publicId },
    { $unset: { logo: "" } }
  );

  await deleteMedia(publicId);

  revalidatePath("/admin/media");
}