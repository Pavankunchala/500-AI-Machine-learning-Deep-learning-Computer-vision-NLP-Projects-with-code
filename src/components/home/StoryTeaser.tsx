import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function StoryTeaser() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 sm:py-24 lg:grid-cols-2">
      <Reveal>
        <div className="overflow-hidden rounded-3xl">
          <img
            src="/images/family-farm.webp"
            alt="Three generations of a farming family in a Shekhawati wheat field"
            className="h-full w-full object-cover"
          />
        </div>
      </Reveal>
      <Reveal>
        <p className="text-xs uppercase tracking-[0.22em] text-terracotta">A mill, not a brand story</p>
        <h2 className="mt-2 font-serif text-4xl sm:text-5xl">The recipe was never written down. The millstones were.</h2>
        <p className="mt-4 text-muted leading-relaxed">
          In 1978, Raghunath Sharma bought a pair of millstones and a small godown in Jaipur. Neighbours brought wheat; he sent them home with atta that still smelled of the field. His grandson runs those stones today — slower than a factory, on purpose.
        </p>
        <p className="mt-3 text-muted leading-relaxed">
          We still buy grain from the same Shekhawati families. We still refuse to blend maida for “softness”. Softness, we have learned, comes from freshness.
        </p>
        <div className="mt-6">
          <Button href="/about" variant="ghost">
            Read the family story
          </Button>
        </div>
      </Reveal>
    </section>
  );
}
