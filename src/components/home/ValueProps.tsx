import { Reveal } from "@/components/ui/Reveal";

const items = [
  {
    title: "Slow millstones",
    body: "Our chakki runs cool. Germ oils stay in the flour instead of cooking off on hot rollers.",
    icon: "◉",
  },
  {
    title: "Single-origin wheat",
    body: "Shekhawati farms, one harvest at a time — not a blended silo from four states.",
    icon: "✧",
  },
  {
    title: "Ground this week",
    body: "Packed within days of milling. The date on the bag is a grinding date, not a fiction.",
    icon: "◍",
  },
  {
    title: "Nothing added",
    body: "No maida blend, no bleach, no preservatives. Wheat, millets, or dal — that is the list.",
    icon: "✦",
  },
];

export function ValueProps() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <Reveal>
        <p className="text-xs uppercase tracking-[0.22em] text-terracotta">Why stone-ground</p>
        <h2 className="mt-2 max-w-xl font-serif text-4xl sm:text-5xl">The mill is the method, not a motif.</h2>
      </Reveal>
      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <Reveal key={item.title}>
            <div className="h-full rounded-2xl border border-sand bg-paper p-6">
              <span className="text-2xl text-gold" aria-hidden>
                {item.icon}
              </span>
              <h3 className="mt-4 font-serif text-2xl">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{item.body}</p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
