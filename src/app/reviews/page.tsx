import type { Metadata } from "next";
import { getReviews } from "@/lib/catalog";
import { Stars } from "@/components/ui/Stars";
import { formatDate } from "@/lib/format";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Customer reviews",
  description: `Kitchen notes from ${SITE.reviewCount.toLocaleString("en-IN")} orders — rotis, pakoras, and millet breakfasts.`,
};

export default function ReviewsPage() {
  const reviews = getReviews();
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <p className="text-xs uppercase tracking-[0.22em] text-terracotta">{SITE.rating}★ · {SITE.reviewCount.toLocaleString("en-IN")} reviews</p>
      <h1 className="mt-2 font-serif text-5xl">From real tawas, not a studio.</h1>
      <div className="mt-10 grid gap-6 md:grid-cols-2">
        {reviews.map((r) => (
          <article key={r.id} className="overflow-hidden rounded-3xl border border-sand bg-paper">
            {r.photo && <img src={r.photo} alt={`Kitchen photo from ${r.name}`} className="h-64 w-full object-cover" />}
            <div className="p-6">
              <Stars value={r.rating} />
              <h2 className="mt-2 font-serif text-2xl">{r.title}</h2>
              <p className="mt-2 text-muted">{r.body}</p>
              <p className="mt-4 text-sm">
                {r.name}, {r.city}
                {r.verified ? " · Verified order" : ""} · {formatDate(r.date)}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
