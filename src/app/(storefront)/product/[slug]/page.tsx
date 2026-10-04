import { notFound } from "next/navigation";
import Image from "next/image";
import { getProductBySlug } from "@/services/product.service";
import { AddToBag } from "@/components/storefront/AddToBag";
import { ProductGallery } from "@/components/storefront/ProductGallery";
import { auth } from "@/lib/auth";
import { getWishlistProductIds } from "@/services/wishlist.service";
import { WishlistButton } from "@/components/storefront/WishlistButton";

function formatPrice(amount: number, currency = "KES") {
  return new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const [session, wishlistIds] = await Promise.all([
    auth(),
    getWishlistProductIds(),
  ]);

  if (!product) notFound();

  const onSale =
    typeof product.salePrice === "number" && product.salePrice < product.price;

  return (
    <div className="mx-auto max-w-7xl px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12">
      <ProductGallery
        images={product.images ?? []}
        productName={product.name}
      />

      <div className="lg:pt-4">
        <h1 className="font-display text-h1 mb-3">{product.name}</h1>

        <p className="text-lg mb-6">
          {onSale ? (
            <>
              <span className="text-primary">
                {formatPrice(product.salePrice!, product.currency)}
              </span>{" "}
              <span className="text-fg-muted line-through">
                {formatPrice(product.price, product.currency)}
              </span>
            </>
          ) : (
            formatPrice(product.price, product.currency)
          )}
        </p>

        {product.shortDescription && (
          <p className="text-fg-muted mb-6">{product.shortDescription}</p>
        )}

        <p className="text-sm leading-relaxed text-fg-muted mb-8 whitespace-pre-line">
          {product.description}
        </p>

        <p className="text-xs tracking-wide uppercase text-fg-muted mb-6">
          {product.variants?.length
            ? product.variants.some((v: { stock: number }) => v.stock > 0)
              ? "In stock"
              : "Out of stock"
            : product.stockQuantity > 0
              ? `${product.stockQuantity} in stock`
              : "Out of stock"}
        </p>

        <AddToBag
          productId={String(product._id)}
          variants={(product.variants ?? []).map(
            (v: {
              _id: unknown;
              size?: string;
              color?: string;
              stock: number;
            }) => ({
              id: String(v._id),
              label: [v.size, v.color].filter(Boolean).join(" / ") || "Option",
              stock: v.stock,
            }),
          )}
          inStock={
            product.variants?.length
              ? product.variants.some((v: { stock: number }) => v.stock > 0)
              : product.stockQuantity > 0
          }
        />

        <div className="mt-3">
          <WishlistButton
            productId={String(product._id)}
            initialSaved={wishlistIds.includes(String(product._id))}
            isLoggedIn={!!session}
          />
        </div>

        {/* <Button disabled className="w-full sm:w-auto">
          Add to Bag — coming soon
        </Button> */}
      </div>
    </div>
  );
}
