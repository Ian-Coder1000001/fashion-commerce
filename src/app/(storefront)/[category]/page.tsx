import { notFound } from "next/navigation";
import { getCategoryBySlug } from "@/services/category.service";
import { listProducts } from "@/services/product.service";
import { ProductCard } from "@/components/storefront/ProductCard";

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ category: string }>;
}) {
  const { category: slug } = await params;
  const category = await getCategoryBySlug(slug);

  if (!category) notFound();

  const { items: products } = await listProducts({
    category: String(category._id),
    status: "published",
    limit: 48,
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-display text-h1 mb-2">{category.name}</h1>
      {category.description && (
        <p className="text-fg-muted max-w-xl mb-10">{category.description}</p>
      )}

      {products.length === 0 ? (
        <p className="text-sm text-fg-muted mt-10">
          No products in this category yet.
        </p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10 mt-10">
          {products.map((product) => (
            <ProductCard
              key={String(product._id)}
              name={product.name}
              slug={product.slug}
              price={product.price}
              salePrice={product.salePrice}
              currency={product.currency}
              imageUrl={product.images?.[0]?.secureUrl}
            />
          ))}
        </div>
      )}
    </div>
  );
}