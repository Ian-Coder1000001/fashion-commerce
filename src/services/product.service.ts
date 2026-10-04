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
  salePrice?: number | null;
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
  size?: string;
  color?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: "newest" | "price_asc" | "price_desc";
}) {
  await connectToDatabase();
  const {
    page = 1,
    limit = 24,
    category,
    collection,
    status,
    search,
    size,
    color,
    minPrice,
    maxPrice,
    sort = "newest",
  } = params;

  const filter: Record<string, unknown> = {};
  if (category) filter.category = category;
  if (collection) filter.collections = collection;
  if (status) filter.status = status;
  if (search) filter.$text = { $search: search };
  if (size) filter["variants.size"] = size;
  if (color) filter["variants.color"] = color;
  if (minPrice != null || maxPrice != null) {
    filter.price = {
      ...(minPrice != null ? { $gte: minPrice } : {}),
      ...(maxPrice != null ? { $lte: maxPrice } : {}),
    };
  }

  const sortMap: Record<string, Record<string, 1 | -1>> = {
    newest: { createdAt: -1 },
    price_asc: { price: 1 },
    price_desc: { price: -1 },
  };







  const [items, total] = await Promise.all([
    Product.find(filter)
      .sort(sortMap[sort])
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("category", "name slug")
      .lean(),
    Product.countDocuments(filter),
  ]);

  return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
}



export async function getAvailableVariantOptions(categoryId?: string) {
  await connectToDatabase();
  const filter: Record<string, unknown> = { status: "published" };
  if (categoryId) filter.category = categoryId;

  const [sizes, colors] = await Promise.all([
    Product.distinct("variants.size", filter),
    Product.distinct("variants.color", filter),
  ]);

  return {
    sizes: sizes.filter(Boolean).sort(),
    colors: colors.filter(Boolean).sort(),
  };
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


export interface VariantInput {
  size?: string;
  color?: string;
  sku: string;
  price?: number;
  stock: number;
}

export async function addProductVariant(productId: string, variant: VariantInput) {
  await connectToDatabase();
  return Product.findByIdAndUpdate(
    productId,
    { $push: { variants: variant } },
    { new: true }
  );
}

export async function removeProductVariant(productId: string, variantId: string) {
  await connectToDatabase();
  return Product.findByIdAndUpdate(
    productId,
    { $pull: { variants: { _id: variantId } } },
    { new: true }
  );
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