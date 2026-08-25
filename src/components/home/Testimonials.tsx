import { Reveal } from "@/components/ui/Reveal";
import { Stars } from "@/components/ui/Stars";
import { Button } from "@/components/ui/Button";
import type { Review } from "@/types";

export function Testimonials({ reviews }: { reviews: Review[] }) {
  return (
    <section className="bg-brown py-16 text-cream sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <Reveal>
          <p className="text-xs uppercase tracking-[0.22em] text-wheat">Kitchens, not studios</p>
          <h2 className="mt-2 font-serif text-4xl sm:text-5xl">What people bake when the flour is honest</h2>
        </Reveal>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {reviews.slice(0, 3).map((r) => (
            <blockquote key={r.id} className="rounded-2xl bg-cream/5 p-6 ring-1 ring-cream/10">
              <Stars value={r.rating} />
              <p className="mt-3 font-serif text-2xl">{r.title}</p>
              <p className="mt-3 text-sm leading-relaxed text-cream/80">{r.body}</p>
              <footer className="mt-5 text-sm text-wheat">
                {r.name}, {r.city}
                {r.verified ? " · Verified order" : ""}
              </footer>
            </blockquote>
          ))}
        </div>
        <div className="mt-8">
          <Button href="/reviews" variant="ghost" className="border-cream/30 text-cream hover:text-wheat">
            All reviews
          </Button>
        </div>
      </div>
    </section>
  );
}
