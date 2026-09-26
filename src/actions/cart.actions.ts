"use server";

import { revalidatePath } from "next/cache";
import {
  addToCart,
  updateCartItemQuantity,
  removeCartItem,
  claimAnonymousCartForCurrentUser,
} from "@/services/cart.service";

export async function addToCartAction(
  productId: string,
  quantity: number,
  variantId?: string | null
) {
  await addToCart(productId, quantity, variantId);
  revalidatePath("/cart");
}

export async function updateCartItemAction(itemId: string, quantity: number) {
  await updateCartItemQuantity(itemId, quantity);
  revalidatePath("/cart");
}

export async function removeCartItemAction(itemId: string) {
  await removeCartItem(itemId);
  revalidatePath("/cart");
}

export async function mergeCartOnLoginAction() {
  await claimAnonymousCartForCurrentUser();
  revalidatePath("/cart");
}