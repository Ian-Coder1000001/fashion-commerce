import Link from "next/link";
import Image from "next/image";
import { listEnabledCategories } from "@/services/category.service";
import { getCollectionById } from "@/services/collection.service";
import { listProducts } from "@/services/product.service";
import { getBestSellingProducts } from "@/services/home.service";
import { ProductCard } from "@/components/storefront/ProductCard";
import type { HomeSection as HomeSectionData } from "@/lib/home-sections";

interface GridProduct {
  _id: unknown;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  currency?: string;
  images?: { secureUrl: string }[];
}

function SectionButton({
  label,
  href,
  tone = "dark",
}: {
  label?: string;
  href?: string;
  tone?: "dark" | "light" | "accent";
}) {
  if (!label || !href) return null;

  const className =
    tone === "light"
      ? "inline-block border border-white px-8 py-3 text-xs tracking-wide uppercase text-white hover:bg-white hover:text-black transition-colors"
      : tone === "accent"
        ? "inline-block border border-accent-fg px-6 py-2 text-xs tracking-wide uppercase hover:bg-accent-fg hover:text-accent transition-colors"
        : "inline-block border border-fg px-8 py-3 text-xs tracking-wide uppercase hover:bg-fg hover:text-bg transition-colors";

  if (/^https?:\/\//i.test(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {label}
      </a>
    );
  }
  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}

function ProductGrid({ products }: { products: GridProduct[] }) {
  return (
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
  );
}

function SectionTitle({
  title,
  href,
}: {
  title: string;
  href?: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4 mb-8">
      <h2 className="font-display text-h2">{title}</h2>
      {href && (
        <Link
          href={href}
          className="text-xs tracking-wide uppercase text-fg-muted hover:text-fg underline underline-offset-4 shrink-0"
        >
          View all
        </Link>
      )}
    </div>
  );
}

function Hero({ section }: { section: HomeSectionData }) {
  const imageUrl = section.image?.secureUrl;

  return (
    <section
      className={
        imageUrl
          ? "relative h-[420px] sm:h-[540px] border-b border-border overflow-hidden"
          : "border-b border-border"
      }
    >
      {imageUrl && (
        <>
          <Image
            src={imageUrl}
            alt=""
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
          {/* Flat tint (no gradient) so text stays readable on any photo */}
          <div className="absolute inset-0 bg-black/35" />
        </>
      )}
      <div
        className={
          imageUrl
            ? "relative mx-auto max-w-7xl px-6 h-full flex flex-col justify-end pb-12 sm:pb-16 text-white"
            : "mx-auto max-w-7xl px-6 py-28 sm:py-40"
        }
      >
        {section.eyebrow && (
          <p
            className={`text-xs tracking-[0.2em] uppercase mb-4 ${
              imageUrl ? "text-white/80" : "text-fg-muted"
            }`}
          >
            {section.eyebrow}
          </p>
        )}
        {section.heading && (
          <h1 className="font-display text-hero max-w-3xl">{section.heading}</h1>
        )}
        {section.subheading && (
          <p
            className={`mt-6 max-w-md ${
              imageUrl ? "text-white/90" : "text-fg-muted"
            }`}
          >
            {section.subheading}
          </p>
        )}
        <div className="mt-8">
          <SectionButton
            label={section.buttonLabel}
            href={section.buttonHref}
            tone={imageUrl ? "light" : "dark"}
          />
        </div>
      </div>
    </section>
  );
}

export async function HomeSection({ section }: { section: HomeSectionData }) {
  if (section.type === "hero") {
    return <Hero section={section} />;
  }

  if (section.type === "categories") {
    const categories = await listEnabledCategories();
    if (categories.length === 0) return null;

    return (
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="font-display text-h2 mb-8">
          {section.heading || "Shop by Category"}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-border">
          {categories.map((category) => (
            <Link
              key={category._id}
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
    );
  }

  if (section.type === "new_arrivals") {
    const { items } = await listProducts({
      status: "published",
      limit: section.limit ?? 8,
    });

    return (
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="font-display text-h2 mb-8">
          {section.heading || "New Arrivals"}
        </h2>
        {items.length === 0 ? (
          <p className="text-sm text-fg-muted">New products are coming soon.</p>
        ) : (
          <ProductGrid products={items} />
        )}
      </section>
    );
  }

  if (section.type === "best_sellers") {
    const products = await getBestSellingProducts(section.limit ?? 8);
    if (products.length === 0) return null;

    return (
      <section className="mx-auto max-w-7xl px-6 py-20">
        <h2 className="font-display text-h2 mb-8">
          {section.heading || "Best Sellers"}
        </h2>
        <ProductGrid products={products} />
      </section>
    );
  }

  if (section.type === "collection") {
    if (!section.collectionId) return null;
    const collection = await getCollectionById(section.collectionId);
    if (!collection) return null;

    const { items } = await listProducts({
      collection: String(collection._id),
      status: "published",
      limit: section.limit ?? 8,
    });
    if (items.length === 0) return null;

    return (
      <section className="mx-auto max-w-7xl px-6 py-20">
        <SectionTitle
          title={section.heading || collection.name}
          href={`/collections/${collection.slug}`}
        />
        <ProductGrid products={items} />
      </section>
    );
  }

  if (section.type === "banner") {
    if (!section.heading) return null;

    return (
      <section className="bg-accent text-accent-fg">
        <div className="mx-auto max-w-7xl px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <p className="text-sm tracking-wide">{section.heading}</p>
          <SectionButton
            label={section.buttonLabel}
            href={section.buttonHref}
            tone="accent"
          />
        </div>
      </section>
    );
  }

  if (section.type === "editorial") {
    const imageUrl = section.image?.secureUrl;
    if (!section.heading && !section.subheading && !imageUrl) return null;

    return (
      <section className="mx-auto max-w-7xl px-6 py-20">
        <div
          className={
            imageUrl
              ? "grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center"
              : "max-w-2xl"
          }
        >
          {imageUrl && (
            <div className="relative aspect-[4/5] bg-surface border border-border">
              <Image
                src={imageUrl}
                alt={section.heading ?? ""}
                fill
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-cover"
              />
            </div>
          )}
          <div>
            {section.eyebrow && (
              <p className="text-xs tracking-[0.2em] uppercase text-fg-muted mb-4">
                {section.eyebrow}
              </p>
            )}
            {section.heading && (
              <h2 className="font-display text-h2 mb-4">{section.heading}</h2>
            )}
            {section.subheading && (
              <p className="text-sm leading-relaxed text-fg-muted whitespace-pre-line mb-8">
                {section.subheading}
              </p>
            )}
            <SectionButton label={section.buttonLabel} href={section.buttonHref} />
          </div>
        </div>
      </section>
    );
  }

  return null;
}