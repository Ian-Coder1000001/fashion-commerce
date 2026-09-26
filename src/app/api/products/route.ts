import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createProduct, listProducts } from "@/services/product.service";

const createProductSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  sku: z.string().min(1),
  description: z.string().min(1),
  shortDescription: z.string().optional(),
  category: z.string().min(1),
  price: z.number().positive(),
  salePrice: z.number().positive().optional(),
  stockQuantity: z.number().int().min(0).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  try {
    const result = await listProducts({
      page: Number(searchParams.get("page")) || 1,
      limit: Number(searchParams.get("limit")) || 24,
      category: searchParams.get("category") ?? undefined,
      status: searchParams.get("status") ?? undefined,
      search: searchParams.get("q") ?? undefined,
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Failed to load products." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // TODO(Phase 2): require an authenticated admin session here before
  // any write operation. Left open now since auth lands next.
  const body = await request.json();
  const parsed = createProductSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid product data.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const product = await createProduct(parsed.data);
    return NextResponse.json(product, { status: 201 });
  } catch (err) {
    const message =
      err instanceof Error && "code" in err && (err as { code?: number }).code === 11000
        ? "A product with that slug or SKU already exists."
        : "Failed to create product.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
