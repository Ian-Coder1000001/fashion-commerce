import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/services/collection.service";
import { listProducts } from "@/services/product.service";
import { ProductCard } from "@/components/storefront/ProductCard";

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) notFound();

  const { items: products } = await listProducts({
    collection: String(collection._id),
    status: "published",
    limit: 48,
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-display text-h1 mb-2">{collection.name}</h1>
      {collection.description && (
        <p className="text-fg-muted max-w-xl mb-10">{collection.description}</p>
      )}

      {products.length === 0 ? (
        <p className="text-sm text-fg-muted mt-10">
          No products in this collection yet.
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