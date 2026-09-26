import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { connectToDatabase } from "@/lib/db";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { auth } from "@/lib/auth";

const CART_COOKIE = "cart_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

async function readCartIdCookie(): Promise<string | null> {
  const store = await cookies();
  return store.get(CART_COOKIE)?.value ?? null;
}

async function ensureCartIdCookie(): Promise<string> {
  const store = await cookies();
  const existing = store.get(CART_COOKIE)?.value;
  if (existing) return existing;

  const id = randomUUID();
  store.set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return id;
}

async function getOwnerFilter(forMutation: boolean) {
  const session = await auth();
  if (session) return { userId: session.user.id };

  const cartId = forMutation ? await ensureCartIdCookie() : await readCartIdCookie();
  if (!cartId) return null;
  return { cartId };
}

async function getOrCreateCart() {
  await connectToDatabase();
  const owner = await getOwnerFilter(true);
  if (!owner) throw new Error("Could not resolve cart owner.");

  let cart = await Cart.findOne(owner);
  if (!cart) cart = await Cart.create({ ...owner, items: [] });
  return cart;
}

export async function addToCart(
  productId: string,
  quantity: number,
  variantId?: string | null
) {
  const cart = await getOrCreateCart();

  const existing = cart.items.find(
    (item: { product: unknown; variantId: unknown }) =>
      String(item.product) === productId &&
      String(item.variantId ?? "") === String(variantId ?? "")
  );

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({ product: productId, variantId: variantId ?? null, quantity });
  }

  await cart.save();
}

export async function updateCartItemQuantity(itemId: string, quantity: number) {
  const cart = await getOrCreateCart();
  const item = cart.items.id(itemId);
  if (!item) return;

  if (quantity <= 0) {
    item.deleteOne();
  } else {
    item.quantity = quantity;
  }
  await cart.save();
}

export async function removeCartItem(itemId: string) {
  const cart = await getOrCreateCart();
  cart.items.id(itemId)?.deleteOne();
  await cart.save();
}

export interface CartLineForDisplay {
  itemId: string;
  productId: string;
  variantId: string | null;
  name: string;
  slug: string;
  sku: string;
  image?: string;
  price: number;
  quantity: number;
  lineTotal: number;
  stockAvailable: number;
}

export interface CartSummary {
  lines: CartLineForDisplay[];
  subtotal: number;
  itemCount: number;
}

export async function getCartSummary(): Promise<CartSummary> {
  await connectToDatabase();
  const owner = await getOwnerFilter(false);

  if (!owner) return { lines: [], subtotal: 0, itemCount: 0 };

  const cart = await Cart.findOne(owner).lean();
  if (!cart || cart.items.length === 0) {
    return { lines: [], subtotal: 0, itemCount: 0 };
  }

  const productIds = cart.items.map((item: { product: unknown }) => item.product);
  const products = await Product.find({ _id: { $in: productIds } }).lean();
  const productMap = new Map(products.map((p) => [String(p._id), p]));

  const lines: CartLineForDisplay[] = [];

  for (const item of cart.items) {
    const product = productMap.get(String(item.product));
    if (!product) continue;

    const variant = item.variantId
      ? product.variants?.find((v: { _id: unknown }) => String(v._id) === String(item.variantId))
      : null;

    const price = variant?.price ?? product.salePrice ?? product.price;
    const stockAvailable = variant ? variant.stock : product.stockQuantity;
    const sku = variant?.sku ?? product.sku;

    lines.push({
      itemId: String(item._id),
      productId: String(product._id),
      variantId: item.variantId ? String(item.variantId) : null,
      name: product.name,
      slug: product.slug,
      sku,
      image: product.images?.[0]?.secureUrl,
      price,
      quantity: item.quantity,
      lineTotal: price * item.quantity,
      stockAvailable,
    });
  }

  const subtotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);

  return { lines, subtotal, itemCount };
}

export async function claimAnonymousCartForCurrentUser() {
  const session = await auth();
  if (!session) return;

  await connectToDatabase();
  const cartId = await readCartIdCookie();
  if (!cartId) return;

  const anonCart = await Cart.findOne({ cartId });
  if (!anonCart || anonCart.items.length === 0) return;

  let userCart = await Cart.findOne({ userId: session.user.id });
  if (!userCart) {
    userCart = await Cart.create({ userId: session.user.id, items: [] });
  }

  for (const item of anonCart.items) {
    const existing = userCart.items.find(
      (i: { product: unknown; variantId: unknown }) =>
        String(i.product) === String(item.product) &&
        String(i.variantId ?? "") === String(item.variantId ?? "")
    );
    if (existing) {
      existing.quantity += item.quantity;
    } else {
      userCart.items.push({
        product: item.product,
        variantId: item.variantId,
        quantity: item.quantity,
      });
    }
  }

  await userCart.save();
  await anonCart.deleteOne();

  const store = await cookies();
  store.delete(CART_COOKIE);
}

export async function clearCurrentCart() {
  const owner = await getOwnerFilter(false);
  if (!owner) return;
  await connectToDatabase();
  await Cart.findOneAndUpdate(owner, { items: [] });
}