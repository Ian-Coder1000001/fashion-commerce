import Link from "next/link";
import Image from "next/image";
import { listPublishedPosts } from "@/services/blog.service";

export default async function JournalIndexPage() {
  const posts = await listPublishedPosts();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <h1 className="font-display text-h1 mb-10">Journal</h1>

      {posts.length === 0 ? (
        <p className="text-sm text-fg-muted">Nothing published yet.</p>
      ) : (
        <div className="flex flex-col divide-y divide-border border-y border-border">
          {posts.map((post) => (
            <Link key={String(post._id)} href={`/journal/${post.slug}`} className="group flex gap-6 py-8">
              <div className="relative w-40 h-32 shrink-0 bg-surface border border-border">
                {post.featuredImage?.secureUrl && (
                  <Image src={post.featuredImage.secureUrl} alt="" fill className="object-cover" />
                )}
              </div>
              <div>
                <p className="text-xs text-fg-muted mb-2">
                  {post.publishedAt &&
                    new Date(post.publishedAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                </p>
                <h2 className="font-display text-xl mb-2 group-hover:underline">{post.title}</h2>
                <p className="text-sm text-fg-muted">{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}