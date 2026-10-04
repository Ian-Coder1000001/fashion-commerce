import { listProducts, getAvailableVariantOptions } from "@/services/product.service";
import { ProductCard } from "@/components/storefront/ProductCard";
import { ProductFilters } from "@/components/storefront/ProductFilters";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    size?: string;
    color?: string;
    sort?: "newest" | "price_asc" | "price_desc";
  }>;
}) {
  const { q, size, color, sort } = await searchParams;
  const query = q?.trim() ?? "";

  const [{ items: products }, options] = await Promise.all([
    query
      ? listProducts({ search: query, status: "published", limit: 48, size, color, sort })
      : Promise.resolve({ items: [] }),
    getAvailableVariantOptions(),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-display text-h1 mb-2">Search</h1>
      <p className="text-fg-muted mb-6">
        {query ? `Results for "${query}"` : "Enter a search term above."}
      </p>

      {query && <ProductFilters sizes={options.sizes} colors={options.colors} />}

      {query && products.length === 0 ? (
        <p className="text-sm text-fg-muted">No products matched your search.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
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