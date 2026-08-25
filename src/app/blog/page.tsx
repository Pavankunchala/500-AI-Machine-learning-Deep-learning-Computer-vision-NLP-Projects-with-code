import type { Metadata } from "next";
import Link from "next/link";
import { getPosts } from "@/lib/catalog";
import { formatDate } from "@/lib/format";

export const metadata: Metadata = {
  title: "Journal & recipes",
  description: "Health notes, roti recipes, storage tips and the Shekhawati wheat story — from the Bharatiya Chakki mill kitchen.",
};

export default function BlogPage() {
  const posts = getPosts();
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <p className="text-xs uppercase tracking-[0.22em] text-terracotta">Journal</p>
      <h1 className="mt-2 font-serif text-5xl">Recipes, mills, and quieter nutrition.</h1>
      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {posts.map((post) => (
          <article key={post.slug} className="overflow-hidden rounded-3xl border border-sand bg-paper">
            <Link href={`/blog/${post.slug}`} className="block">
              <img src={post.image} alt="" className="h-56 w-full object-cover" />
            </Link>
            <div className="p-6">
              <p className="text-xs uppercase tracking-wider text-terracotta">
                {post.category} · {formatDate(post.date)} · {post.readMinutes} min
              </p>
              <h2 className="mt-2 font-serif text-3xl">
                <Link href={`/blog/${post.slug}`} className="hover:text-terracotta">
                  {post.title}
                </Link>
              </h2>
              <p className="mt-2 text-muted">{post.excerpt}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
