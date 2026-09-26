import { listCategories, createCategoryAction, deleteCategoryAction } from "@/actions/category.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default async function AdminCategoriesPage() {
  const categories = await listCategories();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl">Categories</h1>
      </div>

      <form
        action={createCategoryAction}
        className="flex items-end gap-4 mb-10 max-w-xl"
      >
        <Input label="Name" name="name" required className="flex-1" />
        <Input label="Slug" name="slug" required className="flex-1" />
        <Button type="submit" size="sm">
          Add category
        </Button>
      </form>

      {categories.length === 0 ? (
        <p className="text-sm text-fg-muted">
          No categories yet. Add one above — you&apos;ll need at least one
          before you can create a product.
        </p>
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
            {categories.map((category) => (
              <tr
                key={String(category._id)}
                className="border-b border-border"
              >
                <td className="py-3">{category.name}</td>
                <td className="py-3 text-fg-muted">{category.slug}</td>
                <td className="py-3">
                  <form
                    action={deleteCategoryAction.bind(null, String(category._id))}
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
