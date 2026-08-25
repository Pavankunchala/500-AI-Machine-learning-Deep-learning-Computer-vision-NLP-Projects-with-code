import type { Metadata } from "next";
import { SITE } from "@/lib/site";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Our story",
  description:
    "How a Jaipur millstone became Bharatiya Chakki — family sourcing, FSSAI licensing, and the chakki process we still refuse to speed up.",
};

const steps = [
  {
    title: "Grain from known fields",
    body: "Contracts with Shekhawati families before sowing. Wheat is cleaned of stones, husk and smut in the courtyard — not anonymously in a mega-silo.",
    image: "/images/family-farm.webp",
    alt: "Farming family in a wheat field at golden hour",
  },
  {
    title: "Wash, sun, rest",
    body: "A light wash, then drying on cloth in the open. Resting the berry lets moisture even out so the millstones grind instead of smear.",
    image: "/images/process-clean.webp",
    alt: "Wheat drying in woven baskets in a sunlit courtyard",
  },
  {
    title: "The chakki",
    body: "Two stones, slowly. Temperature stays modest. Germ, bran and endosperm stay together. This is the entire argument of our mill.",
    image: "/images/process-grind.webp",
    alt: "Close-up of millstones grinding wheat into atta",
  },
  {
    title: "Sift only to even",
    body: "We do not mill white flour and add bran back. We sift to a consistent roti grind — nothing discarded for shelf life.",
    image: "/images/process-sift.webp",
    alt: "Fresh atta falling through a traditional sieve",
  },
  {
    title: "Pack the same week",
    body: "Kraft bags, grinding date printed, out the door. A warehouse is a poor home for living flour.",
    image: "/images/process-pack.webp",
    alt: "Hands packing freshly milled atta into kraft bags",
  },
];

export default function AboutPage() {
  return (
    <article>
      <header className="relative isolate min-h-[50vh]">
        <img
          src="/images/mill-interior.webp"
          alt="Interior of the Jaipur mill with sacks of wheat and sunlit dust"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-ink/55" />
        <div className="relative mx-auto max-w-6xl px-4 py-28">
          <p className="text-xs uppercase tracking-[0.22em] text-wheat">Since {SITE.founded}</p>
          <h1 className="mt-3 max-w-2xl font-serif text-5xl text-cream sm:text-6xl">
            A mill that still knows its farmers by name.
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-16 text-lg leading-relaxed text-muted">
        <p>
          Bharatiya Chakki began because Raghunath Sharma disliked the atta coming out of the new roller mill on the Ajmer road. It was white, it kept for months, and it made rotis that tasted of almost nothing. He bought millstones. Neighbours noticed. The godown became a mill; the mill became a livelihood for three generations.
        </p>
        <p className="mt-4">
          We are not a heritage theme park. The stones have been dressed and replaced. The packing line is newer than the rafters. What has not changed is the refusal to strip germ for warehouse convenience, and the habit of paying farmers before the grain is even threshed.
        </p>
      </div>

      <section className="bg-sand/40 py-16">
        <div className="mx-auto max-w-6xl px-4">
          <h2 className="font-serif text-4xl">The chakki, step by step</h2>
          <ol className="mt-10 space-y-12">
            {steps.map((s, i) => (
              <li key={s.title} className={`grid items-center gap-8 lg:grid-cols-2 ${i % 2 ? "lg:[&>div:first-child]:order-2" : ""}`}>
                <div className="overflow-hidden rounded-3xl">
                  <img src={s.image} alt={s.alt} className="w-full object-cover" />
                </div>
                <div>
                  <p className="text-sm text-terracotta">0{i + 1}</p>
                  <h3 className="mt-1 font-serif text-3xl">{s.title}</h3>
                  <p className="mt-3 text-muted leading-relaxed">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 lg:grid-cols-2">
        <Reveal>
          <h2 className="font-serif text-4xl">Sourcing</h2>
          <p className="mt-4 leading-relaxed text-muted">
            Wheat from Sikar and Jhunjhunu. Jowar from partner lots in Maharashtra. Bajra from rain-fed Rajasthan farms. Ragi from Karnataka. Organic wheat is stored in a separate godown and milled on dedicated days — less efficient, entirely the point.
          </p>
        </Reveal>
        <Reveal>
          <h2 className="font-serif text-4xl">Certifications</h2>
          <ul className="mt-4 space-y-3 text-muted">
            <li>
              <strong className="text-ink">FSSAI</strong> licence {SITE.fssai} — licensed mill and packer.
            </li>
            <li>
              <strong className="text-ink">India Organic</strong> on Organic Chakki Atta lots.
            </li>
            <li>
              <strong className="text-ink">GSTIN</strong> {SITE.gstin}
            </li>
            <li>No claims we cannot print on a pack. If a grain is blended, the bag says so.</li>
          </ul>
        </Reveal>
      </section>
    </article>
  );
}
