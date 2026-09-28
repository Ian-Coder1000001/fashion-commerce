"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Wishlist from "@/models/Wishlist";

export async function toggleWishlistAction(productId: string) {
  const session = await auth();
  if (!session) throw new Error("Please sign in to save items.");

  await connectToDatabase();

  let wishlist = await Wishlist.findOne({ user: session.user.id });
  if (!wishlist) {
    wishlist = await Wishlist.create({ user: session.user.id, products: [productId] });
  } else {
    const exists = wishlist.products.some((p: unknown) => String(p) === productId);
    if (exists) {
      wishlist.products = wishlist.products.filter((p: unknown) => String(p) !== productId);
    } else {
      wishlist.products.push(productId);
    }
    await wishlist.save();
  }

  revalidatePath("/account/wishlist");
}

export async function removeFromWishlistAction(productId: string) {
  const session = await auth();
  if (!session) throw new Error("Not authenticated.");
  await connectToDatabase();
  await Wishlist.findOneAndUpdate(
    { user: session.user.id },
    { $pull: { products: productId } }
  );
  revalidatePath("/account/wishlist");
}