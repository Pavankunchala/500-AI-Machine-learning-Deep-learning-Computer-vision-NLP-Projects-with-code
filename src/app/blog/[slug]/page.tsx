import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/catalog";
import { formatDate } from "@/lib/format";
import type { BlogBlock } from "@/types";

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return { title: "Journal" };
  return { title: post.title, description: post.excerpt, openGraph: { images: [post.image] } };
}

function Block({ block }: { block: BlogBlock }) {
  if (block.type === "p") return <p className="mt-4 leading-relaxed text-muted">{block.text}</p>;
  if (block.type === "h2") return <h2 className="mt-10 font-serif text-3xl">{block.text}</h2>;
  if (block.type === "quote") {
    return <blockquote className="mt-6 border-l-2 border-wheat pl-4 font-serif text-2xl text-brown">{block.text}</blockquote>;
  }
  return (
    <ul className="mt-4 list-disc space-y-1 pl-5 text-muted">
      {block.items.map((i) => (
        <li key={i}>{i}</li>
      ))}
    </ul>
  );
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return (
    <article className="pb-16">
      <header className="relative isolate min-h-[42vh]">
        <img src={post.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/55" />
        <div className="relative mx-auto max-w-3xl px-4 py-24">
          <p className="text-xs uppercase tracking-[0.2em] text-wheat">
            {post.category} · {formatDate(post.date)}
          </p>
          <h1 className="mt-3 font-serif text-4xl text-cream sm:text-5xl">{post.title}</h1>
          <p className="mt-3 text-cream/80">{post.author} · {post.readMinutes} min read</p>
        </div>
      </header>
      <div className="mx-auto max-w-3xl px-4 py-10">
        {post.content.map((block, i) => (
          <Block key={i} block={block} />
        ))}
      </div>
    </article>
  );
}
