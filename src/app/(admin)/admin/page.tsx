import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";

export default async function AdminDashboardPage() {
  await connectToDatabase();
  const productCount = await Product.countDocuments();
  const publishedCount = await Product.countDocuments({ status: "published" });
  const lowStockCount = await Product.countDocuments({
    stockStatus: "low_stock",
  });

  const stats = [
    { label: "Products", value: productCount },
    { label: "Published", value: publishedCount },
    { label: "Low stock", value: lowStockCount },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl mb-8">Dashboard</h1>
      <div className="grid grid-cols-3 gap-px bg-border max-w-2xl">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface p-6">
            <p className="text-xs text-fg-muted mb-2">{stat.label}</p>
            <p className="font-display text-3xl">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
