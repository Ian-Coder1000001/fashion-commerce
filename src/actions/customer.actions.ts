"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { connectToDatabase } from "@/lib/db";
import User from "@/models/User";
import Order from "@/models/Order";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("Not authorized.");
  }
}

export async function listCustomersForAdmin(search?: string) {
  await requireAdmin();
  await connectToDatabase();

  const filter: Record<string, unknown> = { role: "customer" };
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  const [customers, spendByCustomer] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).lean(),
    Order.aggregate([
      { $match: { user: { $ne: null } } },
      {
        $group: {
          _id: "$user",
          totalSpent: { $sum: "$total" },
          orderCount: { $sum: 1 },
        },
      },
    ]),
  ]);

  const spendMap = new Map(
    spendByCustomer.map((s) => [
      String(s._id),
      { totalSpent: s.totalSpent as number, orderCount: s.orderCount as number },
    ])
  );

  return customers.map((customer) => ({
    ...customer,
    totalSpent: spendMap.get(String(customer._id))?.totalSpent ?? 0,
    orderCount: spendMap.get(String(customer._id))?.orderCount ?? 0,
  }));
}

export async function getCustomerDetailForAdmin(customerId: string) {
  await requireAdmin();
  await connectToDatabase();

  const [customer, orders] = await Promise.all([
    User.findById(customerId).lean(),
    Order.find({ user: customerId }).sort({ createdAt: -1 }).lean(),
  ]);

  return { customer, orders };
}

export async function toggleCustomerDisabledAction(customerId: string) {
  await requireAdmin();
  await connectToDatabase();

  const customer = await User.findById(customerId);
  if (!customer) return;

  customer.isDisabled = !customer.isDisabled;
  await customer.save();

  revalidatePath(`/admin/customers/${customerId}`);
  revalidatePath("/admin/customers");
}