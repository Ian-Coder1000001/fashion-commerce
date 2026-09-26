import {
  listCollectionsForAdmin,
  deleteCollectionAction,
} from "@/actions/collection.actions";
import { CollectionCreateForm } from "@/components/admin/CollectionCreateForm";

export default async function AdminCollectionsPage() {
  const collections = await listCollectionsForAdmin();

  return (
    <div>
      <h1 className="font-display text-2xl mb-8">Collections</h1>

      <CollectionCreateForm />

      {collections.length === 0 ? (
        <p className="text-sm text-fg-muted">No collections yet.</p>
      ) : (
        <table className="w-full text-sm border-t border-border">
          <thead>
            <tr className="text-left text-fg-muted border-b border-border">
              <th className="py-3 font-normal">Name</th>
              <th className="py-3 font-normal">Slug</th>
              <th className="py-3 font-normal w-20"></th>
            </tr>
          </thead>
          <tbody>
            {collections.map((collection) => (
              <tr key={String(collection._id)} className="border-b border-border">
                <td className="py-3">{collection.name}</td>
                <td className="py-3 text-fg-muted">{collection.slug}</td>
                <td className="py-3">
                  <form
                    action={deleteCollectionAction.bind(null, String(collection._id))}
                  >
                    <button className="text-xs text-fg-muted hover:text-error">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}