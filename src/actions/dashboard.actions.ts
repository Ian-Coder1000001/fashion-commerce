"use server";

import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import Order from "@/models/Order";
import Product from "@/models/Product";
import User from "@/models/User";
import ContactMessage from "@/models/ContactMessage";
import { getStoreSettings } from "@/services/settings.service";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("Not authorized.");
  }
}

// Nairobi has no daylight saving (always UTC+3), so stepping back in
// 24-hour blocks always lands on the right calendar day.
const TIMEZONE = "Africa/Nairobi";
const DAY_MS = 24 * 60 * 60 * 1000;
const ALLOWED_RANGES = [7, 30, 90];
const INACTIVE_ORDER_STATUSES = ["cancelled", "returned"];
const OPEN_ORDER_STATUSES = ["pending", "confirmed", "processing", "packed"];

// "2026-10-04" style key for a date, in Nairobi time.
function dayKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export interface DashboardData {
  rangeDays: number;
  currency: string;
  revenue: number;
  orderCount: number;
  openOrders: number;
  customerCount: number;
  newCustomers: number;
  productCount: number;
  publishedCount: number;
  pendingPayments: { count: number; amount: number };
  lowStockCount: number;
  lowStockItems: { id: string; name: string; detail: string; out: boolean }[];
  unreadMessages: number;
  daily: { key: string; revenue: number; orders: number }[];
  topProducts: {
    productId: string;
    name: string;
    sold: number;
    revenue: number;
    exists: boolean;
  }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    customer: string;
    total: number;
    paymentStatus: string;
    orderStatus: string;
    createdAt: string;
  }[];
  recentCustomers: {
    id: string;
    name: string;
    email: string;
    createdAt: string;
  }[];
}

export async function getDashboardData(rangeInput: number): Promise<DashboardData> {
  await requireAdmin();
  await connectToDatabase();

  const rangeDays = ALLOWED_RANGES.includes(rangeInput) ? rangeInput : 30;

  const now = new Date();
  const keys: string[] = [];
  for (let i = rangeDays - 1; i >= 0; i--) {
    keys.push(dayKey(new Date(now.getTime() - i * DAY_MS)));
  }
  const start = new Date(`${keys[0]}T00:00:00+03:00`);

  // A product is "low" when it has no variants and its own stock is at
  // or below its threshold, or when ANY variant is at or below it.
  const threshold = { $ifNull: ["$lowStockThreshold", 5] };
  const variantsOrEmpty = { $ifNull: ["$variants", []] };
  const lowStockFilter = {
    status: "published",
    $expr: {
      $cond: [
        { $gt: [{ $size: variantsOrEmpty }, 0] },
        {
          $anyElementTrue: {
            $map: {
              input: variantsOrEmpty,
              as: "v",
              in: { $lte: ["$$v.stock", threshold] },
            },
          },
        },
        { $lte: ["$stockQuantity", threshold] },
      ],
    },
  };

  const [
    settings,
    dailyRows,
    orderCount,
    openOrders,
    customerCount,
    newCustomers,
    productCount,
    publishedCount,
    pendingRows,
    lowStockCount,
    lowStockDocs,
    unreadMessages,
    topRows,
    recentOrderDocs,
    recentCustomerDocs,
  ] = await Promise.all([
    getStoreSettings(),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start },
          paymentStatus: "paid",
          orderStatus: { $nin: INACTIVE_ORDER_STATUSES },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: TIMEZONE,
            },
          },
          revenue: { $sum: "$total" },
          orders: { $sum: 1 },
        },
      },
    ]),
    Order.countDocuments({
      createdAt: { $gte: start },
      orderStatus: { $nin: INACTIVE_ORDER_STATUSES },
    }),
    Order.countDocuments({ orderStatus: { $in: OPEN_ORDER_STATUSES } }),
    User.countDocuments({ role: "customer" }),
    User.countDocuments({ role: "customer", createdAt: { $gte: start } }),
    Product.countDocuments(),
    Product.countDocuments({ status: "published" }),
    Order.aggregate([
      {
        $match: {
          paymentStatus: "pending",
          orderStatus: { $nin: INACTIVE_ORDER_STATUSES },
        },
      },
      {
        $group: { _id: null, count: { $sum: 1 }, amount: { $sum: "$total" } },
      },
    ]),
    Product.countDocuments(lowStockFilter),
    Product.find(lowStockFilter)
      .select("name variants stockQuantity lowStockThreshold")
      .limit(50)
      .lean(),
    ContactMessage.countDocuments({ status: "unread" }),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: start },
          orderStatus: { $nin: INACTIVE_ORDER_STATUSES },
          paymentStatus: { $ne: "failed" },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          name: { $first: "$items.name" },
          sold: { $sum: "$items.quantity" },
          revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } },
        },
      },
      { $sort: { sold: -1 } },
      { $limit: 5 },
    ]),
    Order.find().sort({ createdAt: -1 }).limit(6).populate("user", "name").lean(),
    User.find({ role: "customer" })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("name email createdAt")
      .lean(),
  ]);

  // Every day in the range gets an entry, even with no sales, so the
  // chart has no gaps.
  const byDay = new Map(
    (dailyRows as { _id: string; revenue: number; orders: number }[]).map((row) => [
      row._id,
      row,
    ])
  );
  const daily = keys.map((key) => ({
    key,
    revenue: byDay.get(key)?.revenue ?? 0,
    orders: byDay.get(key)?.orders ?? 0,
  }));
  const revenue = daily.reduce((sum, d) => sum + d.revenue, 0);

  const pending = (pendingRows as { count: number; amount: number }[])[0];

  const lowStockItems = lowStockDocs
    .map((p) => {
      const productThreshold = p.lowStockThreshold ?? 5;
      const variants = (p.variants ?? []) as {
        size?: string;
        color?: string;
        stock: number;
      }[];

      if (variants.length > 0) {
        const low = variants.filter((v) => v.stock <= productThreshold);
        if (low.length === 0) return null;
        return {
          id: String(p._id),
          name: String(p.name),
          detail: low
            .map(
              (v) =>
                `${[v.size, v.color].filter(Boolean).join(" / ") || "Option"}: ${v.stock}`
            )
            .join(", "),
          lowest: Math.min(...low.map((v) => v.stock)),
        };
      }

      return {
        id: String(p._id),
        name: String(p.name),
        detail: `${p.stockQuantity} left`,
        lowest: Number(p.stockQuantity),
      };
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)
    .sort((a, b) => a.lowest - b.lowest)
    .slice(0, 8)
    .map((item) => ({
      id: item.id,
      name: item.name,
      detail: item.detail,
      out: item.lowest <= 0,
    }));

  const topRowsTyped = topRows as {
    _id: unknown;
    name: string;
    sold: number;
    revenue: number;
  }[];
  const existing = new Set(
    (
      await Product.find({ _id: { $in: topRowsTyped.map((r) => r._id) } })
        .select("_id")
        .lean()
    ).map((p) => String(p._id))
  );

  return {
    rangeDays,
    currency: String(settings.currency ?? "KES"),
    revenue,
    orderCount,
    openOrders,
    customerCount,
    newCustomers,
    productCount,
    publishedCount,
    pendingPayments: { count: pending?.count ?? 0, amount: pending?.amount ?? 0 },
    lowStockCount,
    lowStockItems,
    unreadMessages,
    daily,
    topProducts: topRowsTyped.map((r) => ({
      productId: String(r._id),
      name: r.name,
      sold: r.sold,
      revenue: r.revenue,
      exists: existing.has(String(r._id)),
    })),
    recentOrders: recentOrderDocs.map((o) => ({
      id: String(o._id),
      orderNumber: String(o.orderNumber),
      customer:
        (o.user as { name?: string } | null)?.name ?? o.guestEmail ?? "Guest",
      total: Number(o.total),
      paymentStatus: String(o.paymentStatus),
      orderStatus: String(o.orderStatus),
      createdAt: new Date(o.createdAt).toISOString(),
    })),
    recentCustomers: recentCustomerDocs.map((u) => ({
      id: String(u._id),
      name: String(u.name),
      email: String(u.email),
      createdAt: new Date(u.createdAt).toISOString(),
    })),
  };
}