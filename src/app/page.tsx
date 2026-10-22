import Link from "next/link";
import { EMOTION_META, RANGE_LABEL, REGION_LABEL, STATUS_LABEL } from "@/lib/constants";
import { trendScore } from "@/lib/score";
import { SEED_TRENDS } from "@/lib/seed";

const PREVIEW = ["ai-study-tools", "sebi-rule-talk", "local-llm"].map((id) => SEED_TRENDS.find((trend) => trend.id === id)!);

export default function HomePage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-8 md:py-14">
      <header className="flex items-center justify-between">
        <p className="font-display text-lg">TrendPulse</p>
        <div className="flex gap-3 text-sm">
          <Link href="/login" className="text-muted">Sign in</Link>
          <Link href="/signup" className="rounded-full bg-mint px-4 py-2 font-semibold text-[#07110c]">Start</Link>
        </div>
      </header>
      <section className="mt-16 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-mint">For creators</p>
        <h1 className="font-display mt-4 text-5xl leading-[0.92] md:text-7xl">See the trend. Understand the angle. Leave with a hook.</h1>
        <p className="mt-6 max-w-xl text-lg text-muted">
          TrendPulse turns a cached X snapshot into a large ranked list, a plain explanation, and ready hooks for your niche. Opening the list does not call X.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/signup" className="rounded-full bg-mint px-6 py-3 font-semibold text-[#07110c]">Build your list</Link>
          <Link href="/login" className="rounded-full border border-white/15 px-6 py-3">I already have an account</Link>
        </div>
      </section>
      <section className="mt-14 space-y-4">
        <p className="text-xs uppercase tracking-[0.18em] text-muted">Example rows from the demo cache</p>
        {PREVIEW.map((trend) => {
          const emotion = EMOTION_META[trend.emotion];
          const score = Math.round(trendScore(trend.growthRate, trend.engagementRate, trend.postVolume, trend.relevance[trend.niche]));
          return (
            <article key={trend.id} className="panel rounded-[28px] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted">{STATUS_LABEL[trend.status]} · {emotion.emoji} {emotion.label}</p>
                  <h2 className="font-display mt-2 text-4xl">{trend.name}</h2>
                  <p className="mt-2 text-sm text-muted">{REGION_LABEL[trend.region]} · opportunity {score}</p>
                </div>
                <p className="font-display text-4xl text-mint">+{trend.growthPct}%</p>
              </div>
              <p className="mt-4 text-muted">{trend.why}</p>
              <p className="mt-3 text-xs uppercase tracking-widest text-muted">Window {RANGE_LABEL[trend.windowKey]}</p>
            </article>
          );
        })}
      </section>
      <section className="mt-16 grid gap-4 md:grid-cols-3">
        <Point title="Ranked list" body="Rising, peaking, and cooling, filtered by place, niche, language, and time." />
        <Point title="Deep dive" body="Volume, sentiment, questions, and sample posts from the stored snapshot." />
        <Point title="Idea lab" body="Hooks, reels, carousels, and titles. Save them. No promise of virality." />
      </section>
    </main>
  );
}

function Point({ title, body }: { title: string; body: string }) {
  return (
    <article className="panel rounded-3xl p-5">
      <h2 className="font-display text-2xl">{title}</h2>
      <p className="mt-2 text-sm text-muted">{body}</p>
    </article>
  );
}
