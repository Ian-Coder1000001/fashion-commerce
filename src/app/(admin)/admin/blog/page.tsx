import Link from "next/link";
import { listPostsForAdmin } from "@/actions/blog.actions";
import { BlogCreateForm } from "@/components/admin/BlogCreateForm";

export default async function AdminBlogPage() {
  const posts = await listPostsForAdmin();

  return (
    <div>
      <h1 className="font-display text-2xl mb-8">Blog</h1>

      <BlogCreateForm />

      {posts.length === 0 ? (
        <p className="text-sm text-fg-muted">No posts yet.</p>
      ) : (
        <table className="w-full text-sm border-t border-border">
          <thead>
            <tr className="text-left text-fg-muted border-b border-border">
              <th className="py-3 font-normal">Title</th>
              <th className="py-3 font-normal">Status</th>
              <th className="py-3 font-normal">Updated</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={String(post._id)} className="border-b border-border">
                <td className="py-3">
                  <Link href={`/admin/blog/${post._id}`} className="hover:underline">
                    {post.title}
                  </Link>
                </td>
                <td className="py-3 text-fg-muted">{post.status}</td>
                <td className="py-3 text-fg-muted">
                  {new Date(post.updatedAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}