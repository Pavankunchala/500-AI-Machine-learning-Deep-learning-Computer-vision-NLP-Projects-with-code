import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/site";

export function Hero() {
  return (
    <section className="relative isolate min-h-[88vh] overflow-hidden">
      <img
        src="/images/hero-chakki.webp"
        alt="Miller feeding wheat into a traditional stone chakki mill"
        className="absolute inset-0 h-full w-full object-cover"
        fetchPriority="high"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/75 via-ink/45 to-ink/20" />
      <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:justify-center sm:pb-24">
        <p className="animate-fade-up text-xs uppercase tracking-[0.28em] text-wheat">
          Since {SITE.founded} · Jaipur mill
        </p>
        <h1 className="animate-fade-up mt-4 max-w-xl font-serif text-5xl leading-[0.95] text-cream sm:text-7xl" style={{ animationDelay: "80ms" }}>
          {SITE.tagline}
        </h1>
        <p className="animate-fade-up mt-5 max-w-lg text-base leading-relaxed text-cream/85 sm:text-lg" style={{ animationDelay: "140ms" }}>
          Stone-ground chakki atta from a family mill in Rajasthan. Slow, cool, and whole — nothing stripped, nothing added.
        </p>
        <div className="animate-fade-up mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: "200ms" }}>
          <Button href="/shop" className="bg-terracotta px-8">
            Shop atta
          </Button>
          <Button href="/how-its-made" variant="ghost" className="border-cream/40 text-cream hover:border-wheat hover:text-wheat">
            See the mill
          </Button>
        </div>
        <dl className="animate-fade-up mt-10 grid max-w-xl grid-cols-2 gap-4 text-cream sm:grid-cols-4" style={{ animationDelay: "280ms" }}>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-cream/60">Families</dt>
            <dd className="font-serif text-2xl">{SITE.familiesServed.toLocaleString("en-IN")}+</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-cream/60">Rating</dt>
            <dd className="font-serif text-2xl">{SITE.rating}★</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-cream/60">Reviews</dt>
            <dd className="font-serif text-2xl">{SITE.reviewCount.toLocaleString("en-IN")}</dd>
          </div>
          <div>
            <dt className="text-[11px] uppercase tracking-wider text-cream/60">FSSAI</dt>
            <dd className="font-serif text-lg leading-8">Licensed</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
