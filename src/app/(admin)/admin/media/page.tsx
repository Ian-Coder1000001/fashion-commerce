import Image from "next/image";
import Link from "next/link";
import { listMediaForAdmin } from "@/actions/media.actions";
import { DeleteMediaButton } from "@/components/admin/DeleteMediaButton";

export default async function AdminMediaPage() {
  const items = await listMediaForAdmin();

  return (
    <div>
      <h1 className="font-display text-2xl mb-2">Media Library</h1>
      <p className="text-sm text-fg-muted mb-8">
        {items.length} image{items.length === 1 ? "" : "s"} across your store.
      </p>

      {items.length === 0 ? (
        <p className="text-sm text-fg-muted">No images uploaded yet.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.publicId} className="border border-border">
              <div className="relative aspect-square bg-surface">
                <Image src={item.secureUrl} alt="" fill className="object-cover" />
              </div>
              <div className="p-2">
                {item.usedBy.length > 0 ? (
                  <p className="text-[11px] text-fg-muted mb-1">
                    Used by:{" "}
                    {item.usedBy.map((u, i) => (
                      <span key={i}>
                        <Link href={u.href} className="hover:underline">
                          {u.label}
                        </Link>
                        {i < item.usedBy.length - 1 ? ", " : ""}
                      </span>
                    ))}
                  </p>
                ) : (
                  <p className="text-[11px] text-fg-muted mb-1">Unused</p>
                )}
                <DeleteMediaButton
                  publicId={item.publicId}
                  usedByCount={item.usedBy.length}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}