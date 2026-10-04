import Image from "next/image";
import { notFound } from "next/navigation";
import { getProductById } from "@/services/product.service";
import { listCategories } from "@/actions/category.actions";
import {
  updateProductDetailsAction,
  uploadProductImageAction,
  removeProductImageAction,
  setPrimaryProductImageAction,
} from "@/actions/product.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { listCollectionsForAdmin } from "@/actions/collection.actions";
import {
  addVariantAction,
  removeVariantAction,
} from "@/actions/product.actions";

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, categories, collections] = await Promise.all([
    getProductById(id),
    listCategories(),
    listCollectionsForAdmin(),
  ]);

  if (!product) notFound();

  const assignedCollectionIds = new Set(
    (product.collections ?? []).map((c: unknown) => String(c)),
  );

  return (
    <div>
      <h1 className="font-display text-2xl mb-8">{product.name}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-5xl">
        <section>
          <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
            Details
          </h2>
          <form
            action={updateProductDetailsAction.bind(null, id)}
            className="flex flex-col gap-4"
          >
            <Input
              label="Name"
              name="name"
              defaultValue={product.name}
              required
            />
            <Input
              label="Slug"
              name="slug"
              defaultValue={product.slug}
              required
            />
            <Input label="SKU" name="sku" defaultValue={product.sku} required />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs tracking-wide text-fg-muted">
                Category
              </label>
              <select
                name="category"
                defaultValue={String(product.category)}
                required
                className="h-11 border border-border bg-surface px-3 text-sm"
              >
                {categories.map((c) => (
                  <option key={String(c._id)} value={String(c._id)}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {collections.length > 0 && (
              <div className="flex flex-col gap-1.5">
                <label className="text-xs tracking-wide text-fg-muted">
                  Collections
                </label>
                <div className="flex flex-col gap-1 border border-border p-3">
                  {collections.map((c) => (
                    <label
                      key={String(c._id)}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        name="collections"
                        value={String(c._id)}
                        defaultChecked={assignedCollectionIds.has(
                          String(c._id),
                        )}
                      />
                      {c.name}
                    </label>
                  ))}
                </div>
              </div>
            )}

            <Input
              label="Price"
              name="price"
              type="number"
              step="0.01"
              defaultValue={product.price}
              required
            />

            <Input
              label="Sale price (optional)"
              name="salePrice"
              type="number"
              step="0.01"
              defaultValue={product.salePrice ?? ""}
              placeholder="Leave blank for no sale"
            />

            <div className="flex flex-col gap-1.5">
              <Input
                label="Stock quantity"
                name="stockQuantity"
                type="number"
                defaultValue={product.stockQuantity}
                disabled={(product.variants ?? []).length > 0}
              />
              {(product.variants ?? []).length > 0 && (
                <p className="text-xs text-fg-muted">
                  This product has variants, so stock is tracked per size/color
                  below instead. This field is ignored at checkout.
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs tracking-wide text-fg-muted">
                Status
              </label>
              <select
                name="status"
                defaultValue={product.status}
                className="h-11 border border-border bg-surface px-3 text-sm"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs tracking-wide text-fg-muted">
                Description
              </label>
              <textarea
                name="description"
                defaultValue={product.description}
                required
                rows={4}
                className="border border-border bg-surface px-3 py-2 text-sm"
              />
            </div>
            <Button type="submit" size="sm" className="self-start">
              Save changes
            </Button>
          </form>
        </section>

        <section>
          <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
            Images
          </h2>

          {product.images?.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-6">
              {product.images.map(
                (
                  image: { publicId: string; secureUrl: string },
                  index: number,
                ) => (
                  <div key={image.publicId} className="flex flex-col gap-1">
                    <div className="relative aspect-[3/4] border border-border bg-surface">
                      <Image
                        src={image.secureUrl}
                        alt=""
                        fill
                        className="object-cover"
                      />
                      {index === 0 && (
                        <span className="absolute top-1 left-1 bg-fg text-bg text-[10px] px-1.5 py-0.5">
                          Primary
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between text-[11px]">
                      {index !== 0 ? (
                        <form
                          action={setPrimaryProductImageAction.bind(
                            null,
                            id,
                            image.publicId,
                          )}
                        >
                          <button className="text-fg-muted hover:text-fg">
                            Set primary
                          </button>
                        </form>
                      ) : (
                        <span />
                      )}
                      <form
                        action={removeProductImageAction.bind(
                          null,
                          id,
                          image.publicId,
                        )}
                      >
                        <button className="text-fg-muted hover:text-error">
                          Delete
                        </button>
                      </form>
                    </div>
                  </div>
                ),
              )}
            </div>
          )}

          <form
            action={uploadProductImageAction.bind(null, id)}
            className="flex flex-col gap-3 border border-border p-4"
          >
            <label className="text-xs tracking-wide text-fg-muted">
              Add an image
            </label>
            <input
              type="file"
              name="file"
              accept="image/*"
              required
              className="text-sm"
            />
            <Button type="submit" size="sm" className="self-start">
              Upload
            </Button>
          </form>
          <p className="text-xs text-fg-muted mt-2">
            The first image is used as the primary image across the site.
            Deleting an image removes it from Cloudinary too.
          </p>
        </section>

        <section className="lg:col-span-2">
          <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
            Variants (Sizes / Colors)
          </h2>

          {(product.variants ?? []).length > 0 && (
            <table className="w-full text-sm border-t border-border mb-6">
              <thead>
                <tr className="text-left text-fg-muted border-b border-border">
                  <th className="py-2 font-normal">Size</th>
                  <th className="py-2 font-normal">Color</th>
                  <th className="py-2 font-normal">SKU</th>
                  <th className="py-2 font-normal">Price override</th>
                  <th className="py-2 font-normal">Stock</th>
                  <th className="py-2 font-normal w-20"></th>
                </tr>
              </thead>
              <tbody>
                {product.variants.map(
                  (v: {
                    _id: string;
                    size?: string;
                    color?: string;
                    sku: string;
                    price?: number;
                    stock: number;
                  }) => (
                    <tr key={String(v._id)} className="border-b border-border">
                      <td className="py-2">{v.size ?? "—"}</td>
                      <td className="py-2">{v.color ?? "—"}</td>
                      <td className="py-2 text-fg-muted">{v.sku}</td>
                      <td className="py-2">{v.price ?? "—"}</td>
                      <td className="py-2">{v.stock}</td>
                      <td className="py-2">
                        <form
                          action={removeVariantAction.bind(
                            null,
                            id,
                            String(v._id),
                          )}
                        >
                          <button className="text-xs text-fg-muted hover:text-error">
                            Remove
                          </button>
                        </form>
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          )}

          <form
            action={addVariantAction.bind(null, id)}
            className="grid grid-cols-5 gap-3 border border-border p-4 max-w-3xl"
          >
            <Input label="Size" name="size" placeholder="M, L, 42…" />
            <Input label="Color" name="color" placeholder="Black, Navy…" />
            <Input label="SKU" name="sku" required />
            <Input
              label="Price override"
              name="price"
              type="number"
              step="0.01"
            />
            <Input label="Stock" name="stock" type="number" required />
            <div className="col-span-5">
              <Button type="submit" size="sm">
                Add variant
              </Button>
            </div>
          </form>
          <p className="text-xs text-fg-muted mt-2">
            Leave price override blank to use the product&apos;s base price for
            this variant.
          </p>
        </section>
      </div>
    </div>
  );
}
