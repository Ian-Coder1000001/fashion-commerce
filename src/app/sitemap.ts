import type { MetadataRoute } from "next";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import Collection from "@/models/Collection";
import BlogPost from "@/models/BlogPost";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connectToDatabase();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com";

  const [products, categories, collections, posts] = await Promise.all([
    Product.find({ status: "published" }).select("slug updatedAt").lean(),
    Category.find({ isEnabled: true }).select("slug updatedAt").lean(),
    Collection.find({ isEnabled: true }).select("slug updatedAt").lean(),
    BlogPost.find({ status: "published" }).select("slug updatedAt").lean(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/collections`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/journal`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${baseUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${baseUrl}/contact`, changeFrequency: "monthly", priority: 0.3 },
  ];

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${baseUrl}/product/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "weekly",
    priority: 0.9,
  }));

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${baseUrl}/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const collectionRoutes: MetadataRoute.Sitemap = collections.map((c) => ({
    url: `${baseUrl}/collections/${c.slug}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  const postRoutes: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${baseUrl}/journal/${p.slug}`,
    lastModified: p.updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }));

  return [
    ...staticRoutes,
    ...productRoutes,
    ...categoryRoutes,
    ...collectionRoutes,
    ...postRoutes,
  ];
}