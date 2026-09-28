import { connectToDatabase } from "@/lib/db";
import Wishlist from "@/models/Wishlist";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";

export interface WishlistItem {
  productId: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  currency?: string;
  image?: string;
  inStock: boolean;
}

export async function getWishlistProductIds(): Promise<string[]> {
  const session = await auth();
  if (!session) return [];
  await connectToDatabase();
  const wishlist = await Wishlist.findOne({ user: session.user.id }).lean();
  return (wishlist?.products ?? []).map((p: unknown) => String(p));
}

export async function getWishlistForCurrentUser(): Promise<WishlistItem[]> {
  const session = await auth();
  if (!session) return [];
  await connectToDatabase();

  const wishlist = await Wishlist.findOne({ user: session.user.id }).lean();
  if (!wishlist || wishlist.products.length === 0) return [];

  const products = await Product.find({ _id: { $in: wishlist.products } }).lean();

  return products.map((p) => ({
    productId: String(p._id),
    name: p.name,
    slug: p.slug,
    price: p.price,
    salePrice: p.salePrice,
    currency: p.currency,
    image: p.images?.[0]?.secureUrl,
    inStock: p.stockQuantity > 0,
  }));
}