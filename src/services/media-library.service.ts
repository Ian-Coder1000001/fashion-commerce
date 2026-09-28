import cloudinary from "@/lib/cloudinary";
import { connectToDatabase } from "@/lib/db";
import Product from "@/models/Product";
import BlogPost from "@/models/BlogPost";
import StoreSettings from "@/models/StoreSettings";
import AboutPage from "@/models/AboutPage";

export interface MediaUsage {
  type: string;
  label: string;
  href: string;
}

export interface MediaLibraryItem {
  publicId: string;
  secureUrl: string;
  width?: number;
  height?: number;
  createdAt: string;
  usedBy: MediaUsage[];
}

interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  width?: number;
  height?: number;
  created_at: string;
}

// Only these folders are ever written to by this app (see uploadMedia
// callers throughout the codebase). Restricting to them keeps unrelated
// images from other projects sharing the same Cloudinary account out of
// this store's Media Library entirely.
const OWNED_PREFIXES = ["products/", "blog/", "about/", "branding/"];

async function fetchOwnedCloudinaryResources(): Promise<CloudinaryResource[]> {
  const results = await Promise.all(
    OWNED_PREFIXES.map((prefix) =>
      cloudinary.api
        .resources({ type: "upload", prefix, max_results: 500 })
        .then((r) => r.resources as CloudinaryResource[])
        .catch(() => [] as CloudinaryResource[])
    )
  );

  const byPublicId = new Map<string, CloudinaryResource>();
  for (const list of results) {
    for (const resource of list) {
      byPublicId.set(resource.public_id, resource);
    }
  }
  return Array.from(byPublicId.values());
}

export async function listMediaLibrary(): Promise<MediaLibraryItem[]> {
  await connectToDatabase();

  const [resources, products, posts, settings, about] = await Promise.all([
    fetchOwnedCloudinaryResources(),
    Product.find().select("name images variants").lean(),
    BlogPost.find().select("title featuredImage").lean(),
    StoreSettings.findOne().lean(),
    AboutPage.findOne().lean(),
  ]);

  const usageMap = new Map<string, MediaUsage[]>();

  function addUsage(publicId: string | undefined, entry: MediaUsage) {
    if (!publicId) return;
    const existing = usageMap.get(publicId) ?? [];
    existing.push(entry);
    usageMap.set(publicId, existing);
  }

  for (const product of products) {
    for (const img of product.images ?? []) {
      addUsage(img.publicId, {
        type: "Product",
        label: product.name,
        href: `/admin/products/${product._id}`,
      });
    }
    for (const variant of product.variants ?? []) {
      if (variant.image?.publicId) {
        addUsage(variant.image.publicId, {
          type: "Product variant",
          label: product.name,
          href: `/admin/products/${product._id}`,
        });
      }
    }
  }

  for (const post of posts) {
    if (post.featuredImage?.publicId) {
      addUsage(post.featuredImage.publicId, {
        type: "Blog post",
        label: post.title,
        href: `/admin/blog/${post._id}`,
      });
    }
  }

  if (settings?.logo?.publicId) {
    addUsage(settings.logo.publicId, {
      type: "Store logo",
      label: "Site branding",
      href: "/admin/settings",
    });
  }

  if (about?.heroImage?.publicId) {
    addUsage(about.heroImage.publicId, {
      type: "About page",
      label: "Hero image",
      href: "/admin/about",
    });
  }
  for (const member of about?.team ?? []) {
    if (member.photo?.publicId) {
      addUsage(member.photo.publicId, {
        type: "About page",
        label: `Team: ${member.name}`,
        href: "/admin/about",
      });
    }
  }

  return resources
    .map((resource) => ({
      publicId: resource.public_id,
      secureUrl: resource.secure_url,
      width: resource.width,
      height: resource.height,
      createdAt: resource.created_at,
      usedBy: usageMap.get(resource.public_id) ?? [],
    }))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}