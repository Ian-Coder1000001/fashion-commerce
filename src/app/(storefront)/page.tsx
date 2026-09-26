import Link from "next/link";
import { listProducts } from "@/services/product.service";
import { listEnabledCategories } from "@/services/category.service";
import { ProductCard } from "@/components/storefront/ProductCard";

export default async function HomePage() {
  const [categories, newArrivals] = await Promise.all([
    listEnabledCategories(),
    listProducts({ status: "published", limit: 8 }),
  ]);

  return (
    <div>
      <section className="border-b border-border">
        <div className="mx-auto max-w-7xl px-6 py-28 sm:py-40">
          <p className="text-xs tracking-[0.2em] uppercase text-fg-muted mb-4">
            New Season
          </p>
          <h1 className="font-display text-hero leading-[0.95] max-w-3xl">
            The Everyday Edit
          </h1>
          <p className="mt-6 max-w-md text-fg-muted">
            Elevated essentials, considered details, made to be worn often.
          </p>
          {categories[0] && (
            <Link
              href={`/${categories[0].slug}`}
              className="inline-block mt-8 border border-fg px-8 py-3 text-xs tracking-wide uppercase hover:bg-fg hover:text-bg transition-colors"
            >
              Shop {categories[0].name}
            </Link>
          )}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="font-display text-h2 mb-8">Shop by Category</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-border">
            {categories.map((category) => (
              <Link
                key={String(category._id)}
                href={`/${category.slug}`}
                className="group relative aspect-[4/3] bg-surface flex items-end p-5"
              >
                <span className="text-sm tracking-wide uppercase group-hover:underline">
                  {category.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="font-display text-h2 mb-8">New Arrivals</h2>

        {newArrivals.items.length === 0 ? (
          <p className="text-sm text-fg-muted">
            Nothing published yet — add products from the admin and mark
            them as Published to see them here.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
            {newArrivals.items.map((product) => (
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
      </section>
    </div>
  );
}