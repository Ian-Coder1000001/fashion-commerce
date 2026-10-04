"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  createProduct,
  deleteProduct,
  updateProduct,
  addProductImage,
  removeProductImage,
  setPrimaryProductImage,
  type CreateProductInput,
} from "@/services/product.service";
import { uploadMedia } from "@/services/media.service";

import { slugify } from "@/lib/slugify";
import { addProductVariant, removeProductVariant } from "@/services/product.service";

async function requireAdmin() {
  const session = await auth();
  if (!session || session.user.role !== "admin") {
    throw new Error("Not authorized.");
  }
}

export interface ProductFormState {
  error?: string;
}

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const input: CreateProductInput = {
    name: String(formData.get("name") ?? ""),
    slug: slugify(String(formData.get("slug") ?? "")),
    sku: String(formData.get("sku") ?? ""),
    description: String(formData.get("description") ?? ""),
    category: String(formData.get("category") ?? ""),
    price: Number(formData.get("price")),
    stockQuantity: Number(formData.get("stockQuantity") ?? 0),
    status: (formData.get("status") as CreateProductInput["status"]) ?? "draft",
  };

  if (!input.name || !input.slug || !input.sku || !input.category || !input.price) {
    return { error: "Please fill in all required fields." };
  }

  try {
    await createProduct(input);
  } catch (err) {
    if (
      err &&
      typeof err === "object" &&
      "code" in err &&
      (err as { code?: number }).code === 11000
    ) {
      return {
        error: "A product with that slug or SKU already exists. Use a different one.",
      };
    }
    return { error: "Something went wrong creating the product. Please try again." };
  }

  revalidatePath("/admin/products");
  return {};
}

export async function deleteProductAction(id: string) {
  await requireAdmin();
  await deleteProduct(id);
  revalidatePath("/admin/products");
}

export async function updateProductDetailsAction(
  productId: string,
  formData: FormData
) {
  await requireAdmin();

  const input: Partial<CreateProductInput> = {
    name: String(formData.get("name") ?? ""),
    slug: slugify(String(formData.get("slug") ?? "")),
    sku: String(formData.get("sku") ?? ""),
    description: String(formData.get("description") ?? ""),
    category: String(formData.get("category") ?? ""),
    collections: formData.getAll("collections").map(String),
    price: Number(formData.get("price")),
    stockQuantity: Number(formData.get("stockQuantity") ?? 0),

    salePrice: formData.get("salePrice") ? Number(formData.get("salePrice")) : null,
    status: formData.get("status") as CreateProductInput["status"],
  };

  await updateProduct(productId, input);
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/admin/products");
}

export async function uploadProductImageAction(
  productId: string,
  formData: FormData
) {
  await requireAdmin();

  const file = formData.get("file") as File | null;
  if (!file || file.size === 0) {
    throw new Error("No file provided.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const asset = await uploadMedia(buffer, `products/${productId}`);
  await addProductImage(productId, asset);

  revalidatePath(`/admin/products/${productId}`);
}

export async function removeProductImageAction(
  productId: string,
  publicId: string
) {
  await requireAdmin();
  await removeProductImage(productId, publicId);
  revalidatePath(`/admin/products/${productId}`);
}

export async function setPrimaryProductImageAction(
  productId: string,
  publicId: string
) {
  await requireAdmin();
  await setPrimaryProductImage(productId, publicId);
  revalidatePath(`/admin/products/${productId}`);
}


export async function addVariantAction(productId: string, formData: FormData) {
  await requireAdmin();

  const size = String(formData.get("size") ?? "").trim() || undefined;
  const color = String(formData.get("color") ?? "").trim() || undefined;
  const sku = String(formData.get("sku") ?? "").trim();
  const priceRaw = formData.get("price");
  const price = priceRaw ? Number(priceRaw) : undefined;
  const stock = Number(formData.get("stock") ?? 0);

  if (!sku) throw new Error("Variant SKU is required.");
  if (!size && !color) throw new Error("Provide a size or color for the variant.");

  await addProductVariant(productId, { size, color, sku, price, stock });
  revalidatePath(`/admin/products/${productId}`);
}

export async function removeVariantAction(productId: string, variantId: string) {
  await requireAdmin();
  await removeProductVariant(productId, variantId);
  revalidatePath(`/admin/products/${productId}`);
}