import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { getCartSummary, clearCurrentCart } from "@/services/cart.service";
import { validateAndComputeDiscount, incrementCouponUsage } from "@/services/coupon.service";
import { estimateShipping } from "@/services/shipping.service";
import { auth } from "@/lib/auth";

export interface ShippingAddressInput {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode?: string;
  country: string;
  phone: string;
}

export interface PlaceOrderInput {
  shippingAddress: ShippingAddressInput;
  guestEmail?: string;
  paymentMethod: "cash_on_delivery" | "pesapal";
  couponCode?: string;
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

async function decrementStock(
  productId: string,
  variantId: string | null,
  quantity: number
): Promise<boolean> {
  if (variantId) {
    // $elemMatch is required here, not separate "variants._id" / "variants.$.stock"
    // filter conditions — the $ positional operator only works inside the
    // UPDATE document, never inside the query/filter document. Using it in
    // the filter silently matches nothing, which was causing every
    // variant checkout to report "insufficient stock" regardless of the
    // real number.
    const result = await Product.findOneAndUpdate(
      {
        _id: productId,
        variants: { $elemMatch: { _id: variantId, stock: { $gte: quantity } } },
      },
      { $inc: { "variants.$.stock": -quantity } }
    );
    return !!result;
  }




  const result = await Product.findOneAndUpdate(
    { _id: productId, stockQuantity: { $gte: quantity } },
    { $inc: { stockQuantity: -quantity } }
  );
  return !!result;
}

async function restoreStock(
  productId: string,
  variantId: string | null,
  quantity: number
) {
  if (variantId) {
    await Product.findOneAndUpdate(
      { _id: productId, "variants._id": variantId },
      { $inc: { "variants.$.stock": quantity } }
    );
    return;
  }
  await Product.findByIdAndUpdate(productId, {
    $inc: { stockQuantity: quantity },
  });
}

export class InsufficientStockError extends Error {
  constructor(public productName: string) {
    super(`Not enough stock for "${productName}".`);
  }
}

export class CouponError extends Error {}

export async function placeOrder(input: PlaceOrderInput) {
  await connectToDatabase();

  const session = await auth();
  if (!session && !input.guestEmail) {
    throw new Error("Email is required for guest checkout.");
  }

  const cart = await getCartSummary();
  if (cart.lines.length === 0) {
    throw new Error("Your bag is empty.");
  }

  let discountAmount = 0;
  let appliedCouponId: string | undefined;
  if (input.couponCode) {
    const result = await validateAndComputeDiscount(input.couponCode, cart.subtotal);
    if (!result.valid) {
      throw new CouponError(result.error ?? "Invalid coupon.");
    }
    discountAmount = result.discountAmount;
    appliedCouponId = result.couponId;
  }

  // Shipping is recomputed here from the submitted address — never
  // trust a fee the client displayed during the live preview.
    const shipping = await estimateShipping(
    input.shippingAddress.country,
    input.shippingAddress.region,
    cart.subtotal
  );
  const shippingFee = shipping.fee;

  const decremented: { productId: string; variantId: string | null; quantity: number }[] = [];

  try {
    for (const line of cart.lines) {
      const ok = await decrementStock(line.productId, line.variantId, line.quantity);
      if (!ok) {
        throw new InsufficientStockError(line.name);
      }
      decremented.push({
        productId: line.productId,
        variantId: line.variantId,
        quantity: line.quantity,
      });
    }

    const total = cart.subtotal - discountAmount + shippingFee;

    const order = await Order.create({
      orderNumber: generateOrderNumber(),
      user: session?.user.id ?? null,
      guestEmail: session ? null : input.guestEmail,
      items: cart.lines.map((line) => ({
        product: line.productId,
        variantId: line.variantId,
        name: line.name,
        image: line.image,
        sku: line.sku,
        price: line.price,
        quantity: line.quantity,
      })),
      shippingAddress: input.shippingAddress,
      subtotal: cart.subtotal,
      shippingFee,
      couponCode: input.couponCode?.toUpperCase().trim() || null,
      discountAmount,
      total,
      paymentMethod: input.paymentMethod,
      paymentStatus: "pending",
      orderStatus: "pending",
    });

    if (appliedCouponId) {
      await incrementCouponUsage(appliedCouponId);
    }

    await clearCurrentCart();
    return order;
  } catch (err) {
    for (const d of decremented) {
      await restoreStock(d.productId, d.variantId, d.quantity);
    }
    throw err;
  }
}

export async function getOrderByNumber(orderNumber: string) {
  await connectToDatabase();
  return Order.findOne({ orderNumber }).lean();
}

export async function getOrdersForCurrentUser() {
  const session = await auth();
  if (!session) return [];
  await connectToDatabase();
  return Order.find({ user: session.user.id }).sort({ createdAt: -1 }).lean();
}