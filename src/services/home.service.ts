import { connectToDatabase } from "@/lib/db";
import HomePage from "@/models/HomePage";
import Order from "@/models/Order";
import Product from "@/models/Product";
import { DEFAULT_SECTIONS, type HomeSection } from "@/lib/home-sections";

export async function getHomeSections(): Promise<HomeSection[]> {
  await connectToDatabase();
  const page = await HomePage.findOne().lean();

  if (!page) {
    return DEFAULT_SECTIONS.map((section, i) => ({
      ...section,
      _id: `default-${i}`,
    }));
  }
  return JSON.parse(JSON.stringify(page.sections ?? [])) as HomeSection[];
}

/**
 * Ranks published products by units sold. Cancelled and returned orders
 * and failed payments don't count. Asks for extra rows because some of
 * the top sellers may since have been unpublished or deleted.
 */
export async function getBestSellingProducts(limit: number) {
  await connectToDatabase();

  const top = await Order.aggregate([
    {
      $match: {
        orderStatus: { $nin: ["cancelled", "returned"] },
        paymentStatus: { $ne: "failed" },
      },
    },
    { $unwind: "$items" },
    { $group: { _id: "$items.product", sold: { $sum: "$items.quantity" } } },
    { $sort: { sold: -1 } },
    { $limit: limit * 3 },
  ]);

  if (top.length === 0) return [];

  const products = await Product.find({
    _id: { $in: top.map((t) => t._id) },
    status: "published",
  }).lean();

  const byId = new Map(products.map((p) => [String(p._id), p]));

  return top
    .map((t) => byId.get(String(t._id)))
    .filter(Boolean)
    .slice(0, limit);
}