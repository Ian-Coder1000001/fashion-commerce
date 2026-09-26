import Image from "next/image";
import { notFound } from "next/navigation";
import {
  getPostByIdForAdmin,
  updatePostAction,
  togglePublishAction,
  deletePostAction,
  uploadFeaturedImageAction,
} from "@/actions/blog.actions";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default async function AdminEditPostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPostByIdForAdmin(id);

  if (!post) notFound();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl">{post.title}</h1>
        <div className="flex items-center gap-4">
          <span
            className={`text-xs tracking-wide uppercase ${
              post.status === "published" ? "text-fg" : "text-fg-muted"
            }`}
          >
            {post.status}
          </span>
          <form action={togglePublishAction.bind(null, id)}>
            <Button type="submit" size="sm" variant="secondary">
              {post.status === "published" ? "Unpublish" : "Publish"}
            </Button>
          </form>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-4xl">
        <section>
          <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
            Details
          </h2>
          <form action={updatePostAction.bind(null, id)} className="flex flex-col gap-4">
            <Input label="Title" name="title" defaultValue={post.title} required />
            <Input label="Slug" name="slug" defaultValue={post.slug} required />
            <Input label="Author" name="author" defaultValue={post.author} />
            <Input
              label="Tags (comma separated)"
              name="tags"
              defaultValue={(post.tags ?? []).join(", ")}
            />
            <div className="flex flex-col gap-1.5">
              <label className="text-xs tracking-wide text-fg-muted">Excerpt</label>
              <textarea
                name="excerpt"
                defaultValue={post.excerpt}
                required
                rows={2}
                className="border border-border bg-surface px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs tracking-wide text-fg-muted">Content</label>
              <textarea
                name="content"
                defaultValue={post.content}
                required
                rows={10}
                className="border border-border bg-surface px-3 py-2 text-sm"
              />
            </div>
            <Button type="submit" size="sm" className="self-start">
              Save changes
            </Button>
          </form>

          <form action={deletePostAction.bind(null, id)} className="mt-8 pt-6 border-t border-border">
            <button type="submit" className="text-xs text-fg-muted hover:text-error">
              Delete post
            </button>
          </form>
        </section>

        <section>
          <h2 className="text-sm tracking-wide uppercase text-fg-muted mb-4">
            Featured Image
          </h2>

          {post.featuredImage?.secureUrl && (
            <div className="relative aspect-[16/10] border border-border bg-surface mb-4">
              <Image src={post.featuredImage.secureUrl} alt="" fill className="object-cover" />
            </div>
          )}

          <form
            action={uploadFeaturedImageAction.bind(null, id)}
            className="flex flex-col gap-3 border border-border p-4"
          >
            <label className="text-xs tracking-wide text-fg-muted">
              {post.featuredImage?.secureUrl ? "Replace image" : "Add an image"}
            </label>
            <input type="file" name="file" accept="image/*" required className="text-sm" />
            <Button type="submit" size="sm" className="self-start">
              Upload
            </Button>
          </form>
          <p className="text-xs text-fg-muted mt-2">
            Uploading a new image replaces the old one and removes it from
            Cloudinary.
          </p>
        </section>
      </div>
    </div>
  );
}