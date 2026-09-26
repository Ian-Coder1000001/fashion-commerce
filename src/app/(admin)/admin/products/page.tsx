import Link from "next/link";
import { listProducts } from "@/services/product.service";
import { listCategories } from "@/actions/category.actions";
import { deleteProductAction } from "@/actions/product.actions";
import { ProductCreateForm } from "@/components/admin/ProductCreateForm";

export default async function AdminProductsPage() {
  const [{ items: products }, categories] = await Promise.all([
    listProducts({ limit: 50 }),
    listCategories(),
  ]);

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl">Products</h1>
      </div>

      {categories.length === 0 ? (
        <p className="text-sm text-fg-muted mb-10">
          You need at least one category before adding products.{" "}
          <Link href="/admin/categories" className="underline">
            Create one first
          </Link>
          .
        </p>
      ) : (
        <ProductCreateForm
          categories={categories.map((c) => ({
            _id: String(c._id),
            name: c.name,
          }))}
        />
      )}

      {products.length === 0 ? (
        <p className="text-sm text-fg-muted">No products yet.</p>
      ) : (
        <table className="w-full text-sm border-t border-border">
          <thead>
            <tr className="text-left text-fg-muted border-b border-border">
              <th className="py-3 font-normal">Product</th>
              <th className="py-3 font-normal">SKU</th>
              <th className="py-3 font-normal">Price</th>
              <th className="py-3 font-normal">Stock</th>
              <th className="py-3 font-normal">Status</th>
              <th className="py-3 font-normal w-20"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={String(product._id)} className="border-b border-border">
                <td className="py-3">
                  <Link
                    href={`/admin/products/${product._id}`}
                    className="hover:underline"
                  >
                    {product.name}
                  </Link>
                </td>
                <td className="py-3 text-fg-muted">{product.sku}</td>
                <td className="py-3">{product.price}</td>
                <td className="py-3">{product.stockQuantity}</td>
                <td className="py-3 text-fg-muted">{product.status}</td>
                <td className="py-3">
                  <form action={deleteProductAction.bind(null, String(product._id))}>
                    <button className="text-xs text-fg-muted hover:text-error">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}