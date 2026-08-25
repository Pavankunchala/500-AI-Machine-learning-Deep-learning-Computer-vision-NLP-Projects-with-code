import { Reveal } from "@/components/ui/Reveal";
import { SITE } from "@/lib/site";

const badges = [
  { title: "No preservatives", body: "If it needs a chemical to sit on a shelf, it is not our atta." },
  { title: "Single-origin wheat", body: "Shekhawati lots, milled separately from millet days." },
  { title: "Freshness guarantee", body: "Off smell or a crushed pack — replacement within 7 days." },
  { title: "Secure payments", body: "UPI, cards, netbanking via Razorpay. COD if you prefer." },
  { title: `FSSAI ${SITE.fssai}`, body: "Licensed mill. Number printed on every bag." },
  { title: "Subscribe & save 10%", body: "Monthly atta, paused whenever the tin is still full." },
];

export function TrustBadges() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16">
      <Reveal>
        <h2 className="font-serif text-4xl">What you can hold us to</h2>
      </Reveal>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((b) => (
          <div key={b.title} className="rounded-2xl border border-sand bg-paper p-5">
            <h3 className="font-medium">{b.title}</h3>
            <p className="mt-1 text-sm text-muted">{b.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
