"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { EMOTION_META, LANGUAGE_LABEL, NICHE_LABEL, RANGE_LABEL, REGION_LABEL, STATUS_LABEL } from "@/lib/constants";
import { formatNumber, formatWhen } from "@/lib/format";
import type { TrendDetail } from "@/lib/types";
import { ApiError, api } from "./api";
import { Ring, Spark } from "./spark";
import { useSession } from "./session";

export function TrendDetailView({ id }: { id: string }) {
  const { refresh } = useSession();
  const [trend, setTrend] = useState<TrendDetail | null>(null);
  const [angle, setAngle] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [limited, setLimited] = useState(false);

  useEffect(() => {
    let cancel = false;
    api<{ trend: TrendDetail; bestAngle: string | null }>(`/api/trends/${id}`)
      .then((data) => {
        if (cancel) return;
        setTrend(data.trend);
        setAngle(data.bestAngle);
        void refresh();
      })
      .catch((err: Error) => {
        if (cancel) return;
        if (err instanceof ApiError && err.code === "PLAN_LIMIT") setLimited(true);
        setError(err.message);
      });
    return () => {
      cancel = true;
    };
  }, [id, refresh]);

  if (limited) {
    return (
      <div className="panel rounded-[28px] p-8">
        <h1 className="font-display text-4xl">Daily deep dives are used up</h1>
        <p className="mt-3 text-muted">{error} The list stays open. Creator plan removes the cap.</p>
        <Link href="/radar" className="mt-6 inline-block text-mint">Back to the list</Link>
      </div>
    );
  }
  if (error) return <p className="text-rose">{error}</p>;
  if (!trend) return <p className="text-muted">Opening the cached trend…</p>;

  const emotion = EMOTION_META[trend.emotion];
  const counts = trend.snapshots.map((snap) => snap.postCount);

  return (
    <article className="space-y-6">
      <div>
        <Link href="/radar" className="text-sm text-muted">Back to the list</Link>
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted">
          <span>{STATUS_LABEL[trend.status]}</span>
          <span>{emotion.emoji} {emotion.label}</span>
          <span>{NICHE_LABEL.en[trend.niche]}</span>
          <span>{REGION_LABEL[trend.region]}</span>
        </div>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="font-display text-5xl leading-none md:text-7xl">{trend.name}</h1>
          <div className="text-right">
            <div className="font-display text-5xl text-mint">+{trend.growthPct}%</div>
            <div className="text-xs uppercase tracking-widest text-muted">in {RANGE_LABEL[trend.windowKey]}</div>
          </div>
        </div>
        <p className="mt-4 max-w-2xl text-muted">
          {trend.origin === "demo-cache" ? "Illustrative snapshot sample, not a live X pull." : "Stored from X."} Prepared {formatWhen(trend.capturedAt)} IST.
          WOEID {trend.woeid}.
        </p>
      </div>

      <section className="panel rounded-[28px] p-6">
        <h2 className="font-display text-2xl">Why it is trending</h2>
        <p className="mt-3 text-lg">{trend.why}</p>
        <p className="mt-3 text-muted">{trend.summary}</p>
        {angle ? (
          <p className="mt-4 rounded-2xl border border-mint/30 bg-mint/5 p-4">
            <span className="text-xs uppercase tracking-widest text-mint">Best angle for your profile</span>
            <span className="mt-2 block">{angle}</span>
          </p>
        ) : null}
      </section>

      <section className="grid gap-4 md:grid-cols-[1.4fr_0.8fr]">
        <div className="panel rounded-[28px] p-6">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl">Volume</h2>
              <p className="text-sm text-muted">Post counts across the stored 15-minute slices.</p>
            </div>
            <div className="text-right">
              <div className="text-3xl">{formatNumber(trend.postCount)}</div>
              <div className="text-xs text-muted">latest posts</div>
            </div>
          </div>
          <Spark values={counts.length ? counts : trend.spark} className="mt-6 h-28 w-full" />
          <dl className="mt-6 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <Stat label="Likes" value={formatNumber(trend.likes)} />
            <Stat label="Reposts" value={formatNumber(trend.reposts)} />
            <Stat label="Replies" value={formatNumber(trend.replies)} />
            <Stat label="Authors" value={formatNumber(trend.uniqueAuthors)} />
          </dl>
        </div>
        <div className="panel rounded-[28px] p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl">Opportunity</h2>
            <Ring value={trend.score} />
          </div>
          <p className="mt-2 text-sm text-muted">Weighted from growth, engagement, volume, and fit for your niche.</p>
          <div className="mt-5 space-y-2 text-sm">
            <Sentiment label="Positive" value={trend.sentiment.positive} tone="bg-mint" />
            <Sentiment label="Neutral" value={trend.sentiment.neutral} tone="bg-white/30" />
            <Sentiment label="Negative" value={trend.sentiment.negative} tone="bg-rose" />
          </div>
        </div>
      </section>

      <section className="panel rounded-[28px] p-6">
        <h2 className="font-display text-2xl">Questions in the posts</h2>
        <ul className="mt-4 space-y-3">
          {trend.questions.map((question) => (
            <li key={question} className="rounded-2xl bg-white/5 px-4 py-3 text-lg">{question}</li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap gap-2 text-sm text-sky">
          {trend.hashtags.map((tag) => <span key={tag}>{tag}</span>)}
          {trend.keywords.map((word) => <span key={word} className="text-muted">#{word.replace(/\s+/g, "")}</span>)}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-2xl">Top posts in the snapshot</h2>
        {trend.posts.map((post) => (
          <article key={post.id} className="panel rounded-3xl p-5">
            <div className="text-xs uppercase tracking-widest text-muted">
              {post.origin === "x-api" ? "From X" : "Snapshot sample"} · {LANGUAGE_LABEL[post.language as keyof typeof LANGUAGE_LABEL] || post.language} · {post.sentiment}
            </div>
            <p className="mt-3 text-lg">{post.text}</p>
            <p className="mt-3 text-sm text-muted">
              {formatNumber(post.likes)} likes · {formatNumber(post.reposts)} reposts · {formatNumber(post.replies)} replies
              {post.xPostId ? (
                <>
                  {" · "}
                  <a className="text-sky" href={`https://x.com/i/web/status/${post.xPostId}`} target="_blank" rel="noreferrer">Open on X</a>
                </>
              ) : null}
            </p>
          </article>
        ))}
      </section>

      <Link href={`/trends/${trend.id}/ideas`} className="inline-flex rounded-full bg-mint px-6 py-4 font-semibold text-[#07110c]">
        Generate content ideas
      </Link>
    </article>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-widest text-muted">{label}</dt>
      <dd className="mt-1 text-xl">{value}</dd>
    </div>
  );
}

function Sentiment({ label, value, tone }: { label: string; value: number; tone: string }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-muted"><span>{label}</span><span>{value}%</span></div>
      <div className="h-1.5 rounded-full bg-white/10"><div className={`h-full rounded-full ${tone}`} style={{ width: `${value}%` }} /></div>
    </div>
  );
}
