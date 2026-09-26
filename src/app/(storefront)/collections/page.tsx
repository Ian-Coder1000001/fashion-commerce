import Link from "next/link";
import { listEnabledCollections } from "@/services/collection.service";

export default async function CollectionsIndexPage() {
  const collections = await listEnabledCollections();

  return (
    <div className="mx-auto max-w-7xl px-6 py-16">
      <h1 className="font-display text-h1 mb-10">Collections</h1>

      {collections.length === 0 ? (
        <p className="text-sm text-fg-muted">No collections yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-px bg-border">
          {collections.map((collection) => (
            <Link
              key={String(collection._id)}
              href={`/collections/${collection.slug}`}
              className="group relative aspect-[4/3] bg-surface flex items-end p-5"
            >
              <span className="text-sm tracking-wide uppercase group-hover:underline">
                {collection.name}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}