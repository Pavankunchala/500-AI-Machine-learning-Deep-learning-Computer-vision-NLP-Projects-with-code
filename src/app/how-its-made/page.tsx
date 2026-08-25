"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

const chakki = [
  { k: "Speed", v: "Slow millstones, minutes not seconds" },
  { k: "Heat", v: "Typically under 60°C — germ oils survive" },
  { k: "Extraction", v: "Whole berry: bran, germ, endosperm together" },
  { k: "Shelf life", v: "Weeks, honestly printed" },
  { k: "Flavour", v: "Nutty, sweet, faintly of the field" },
];

const roller = [
  { k: "Speed", v: "High-speed steel rollers" },
  { k: "Heat", v: "Often high enough to dull oils and aroma" },
  { k: "Extraction", v: "Germ often removed; bran may be added back later" },
  { k: "Shelf life", v: "Months in a warehouse" },
  { k: "Flavour", v: "Mild, uniform, easy to ignore" },
];

const steps = [
  { n: "01", t: "Clean", d: "Stones, husk and dust leave before grain ever sees a millstone.", img: "/images/process-clean.webp" },
  { n: "02", t: "Rest", d: "Moisture evens out so the stones crush instead of smearing.", img: "/images/wheat-field.webp" },
  { n: "03", t: "Grind", d: "Two stones, a measured gap, a miller listening more than looking.", img: "/images/process-grind.webp" },
  { n: "04", t: "Even", d: "A gentle sift for roti grind — not a search for whiteness.", img: "/images/process-sift.webp" },
  { n: "05", t: "Pack", d: "Date, lot, and out. Flour is a fresh food.", img: "/images/process-pack.webp" },
];

export default function HowItsMadePage() {
  const [side, setSide] = useState<"chakki" | "roller">("chakki");
  const rows = side === "chakki" ? chakki : roller;

  return (
    <article className="pb-20">
      <header className="relative isolate min-h-[48vh]">
        <img src="/images/process-grind.webp" alt="Wheat being crushed between millstones" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-ink/55" />
        <div className="relative mx-auto max-w-6xl px-4 py-24">
          <p className="text-xs uppercase tracking-[0.22em] text-wheat">How it is made</p>
          <h1 className="mt-3 max-w-2xl font-serif text-5xl text-cream sm:text-6xl">
            Why the stone is the point.
          </h1>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-4 py-16">
        <h2 className="font-serif text-4xl">Chakki versus the roller mill</h2>
        <p className="mt-3 max-w-2xl text-muted">
          Toggle the mill. The nutrients are not a marketing add-on — they are what you keep when you refuse to heat and strip the grain.
        </p>
        <div className="mt-6 inline-flex rounded-full bg-sand p-1">
          <button
            type="button"
            onClick={() => setSide("chakki")}
            className={`rounded-full px-5 py-2 text-sm ${side === "chakki" ? "bg-brown text-cream" : ""}`}
          >
            Our chakki
          </button>
          <button
            type="button"
            onClick={() => setSide("roller")}
            className={`rounded-full px-5 py-2 text-sm ${side === "roller" ? "bg-brown text-cream" : ""}`}
          >
            Conventional roller
          </button>
        </div>
        <dl className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {rows.map((r) => (
            <div key={r.k} className="rounded-2xl border border-sand bg-paper p-5">
              <dt className="text-xs uppercase tracking-wider text-terracotta">{r.k}</dt>
              <dd className="mt-2 font-serif text-xl leading-snug">{r.v}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="bg-sand/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-serif text-4xl">Five quiet steps</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-5">
            {steps.map((s) => (
              <figure key={s.n} className="overflow-hidden rounded-2xl bg-paper">
                <img src={s.img} alt="" className="h-36 w-full object-cover" />
                <figcaption className="p-4">
                  <p className="text-xs text-terracotta">{s.n}</p>
                  <h3 className="font-serif text-2xl">{s.t}</h3>
                  <p className="mt-1 text-sm text-muted">{s.d}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16">
        <h2 className="font-serif text-4xl">Why more of the grain remains</h2>
        <p className="mt-4 leading-relaxed text-muted">
          Wheat germ holds vitamin E and oils. Bran holds fibre and minerals. A roller mill is designed to isolate the white endosperm because that fraction keeps. We mill the berry whole, at a pace that does not toast those oils. Independent nutrition tables will show chakki atta with more fibre and a fuller fat profile than highly refined flour — not because we add anything, but because we decline to take it out.
        </p>
        <div className="mt-8">
          <Button href="/shop">Taste the difference</Button>
        </div>
      </section>
    </article>
  );
}
