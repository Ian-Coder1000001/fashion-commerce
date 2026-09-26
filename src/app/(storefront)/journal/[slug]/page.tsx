import { notFound } from "next/navigation";
import Image from "next/image";
import { getPublishedPostBySlug } from "@/services/blog.service";

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedPostBySlug(slug);

  if (!post) notFound();

  return (
    <article className="mx-auto max-w-2xl px-6 py-16">
      <p className="text-xs text-fg-muted mb-3">
        {post.author}
        {post.publishedAt &&
          ` · ${new Date(post.publishedAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}`}
      </p>
      <h1 className="font-display text-h1 mb-8">{post.title}</h1>

      {post.featuredImage?.secureUrl && (
        <div className="relative aspect-[16/9] mb-10 border border-border bg-surface">
          <Image src={post.featuredImage.secureUrl} alt="" fill className="object-cover" />
        </div>
      )}

      <div className="text-sm leading-relaxed text-fg whitespace-pre-line">
        {post.content}
      </div>

      {post.tags?.length > 0 && (
        <div className="flex gap-2 mt-10 pt-6 border-t border-border">
          {post.tags.map((tag: string) => (
            <span key={tag} className="text-xs text-fg-muted">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}