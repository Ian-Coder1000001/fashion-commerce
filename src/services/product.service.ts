import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import { deleteMedia, deleteManyMedia, type MediaAsset } from "@/services/media.service";

export interface CreateProductInput {
  name: string;
  slug: string;
  sku: string;
  description: string;
  shortDescription?: string;
  category: string;
  collections?: string[];
  price: number;
  salePrice?: number;
  stockQuantity?: number;
  images?: MediaAsset[];
  status?: "draft" | "published" | "archived";
}

export async function listProducts(params: {
  page?: number;
  limit?: number;
  category?: string;
  collection?: string;
  status?: string;
  search?: string;
}) {
  await connectToDatabase();
  const { page = 1, limit = 24, category, collection, status, search } = params;

  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (collection) filter.collections = collection;
  if (status) filter.status = status;
  if (search) filter.$text = { $search: search };

  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("category", "name slug")
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}

export async function getProductById(id: string) {
  await connectToDatabase();
  return Product.findById(id).lean();
}

export async function getProductBySlug(slug: string) {
  await connectToDatabase();
  return Product.findOne({ slug }).populate("category", "name slug").lean();
}

export async function addProductImage(productId: string, asset: MediaAsset) {
  await connectToDatabase();
  return Product.findByIdAndUpdate(
    productId,
    { $push: { images: asset } },
    { new: true }
  );
}

export async function removeProductImage(productId: string, publicId: string) {
  await connectToDatabase();
  const product = await Product.findById(productId);
  if (!product) return null;

  const image = (product.images as MediaAsset[]).find(
    (img) => img.publicId === publicId
  );
  if (image) {
    await deleteMedia(image.publicId, image.resourceType);
  }

  product.images = (product.images as MediaAsset[]).filter(
    (img) => img.publicId !== publicId
  );
  await product.save();
  return product;
}

/**
 * Moves the given image to the front of the array. Every display
 * component (ProductCard, product page) reads images[0] as the primary
 * image, so reordering the array is all "set primary" needs to do.
 */
export async function setPrimaryProductImage(productId: string, publicId: string) {
  await connectToDatabase();
  const product = await Product.findById(productId);
  if (!product) return null;

  const images = product.images as MediaAsset[];
  const index = images.findIndex((img) => img.publicId === publicId);
  if (index > 0) {
    const [img] = images.splice(index, 1);
    images.unshift(img);
  }
  await product.save();
  return product;
}

export async function createProduct(input: CreateProductInput) {
  await connectToDatabase();
  return Product.create(input);
}

export async function updateProduct(
  id: string,
  input: Partial<CreateProductInput>
) {
  await connectToDatabase();
  return Product.findByIdAndUpdate(id, input, { new: true });
}

/**
 * Deletes a product AND every Cloudinary asset it owns (gallery images
 * plus any variant-specific images). This is the operation the master
 * spec singles out — never let a caller delete the Mongo doc without
 * going through this function.
 */
export async function deleteProduct(id: string) {
  await connectToDatabase();
  const product = await Product.findById(id);
  if (!product) return null;

  const galleryAssets: MediaAsset[] = product.images ?? [];
  const variantAssets: MediaAsset[] = (product.variants ?? [])
    .map((v: { image?: MediaAsset }) => v.image)
    .filter(Boolean) as MediaAsset[];

  await deleteManyMedia([...galleryAssets, ...variantAssets]);
  await product.deleteOne();

  return product;
}