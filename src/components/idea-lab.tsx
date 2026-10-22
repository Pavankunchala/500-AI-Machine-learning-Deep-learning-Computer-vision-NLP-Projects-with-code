"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import type { IdeaPack, Platform, Spice, TweetHook } from "@/lib/types";
import { ApiError, api } from "./api";
import { Meter } from "./spark";
import { useSession } from "./session";

const SPICES: { id: Spice; label: string }[] = [
  { id: "spicier", label: "Make it spicier" },
  { id: "simpler", label: "Simpler" },
  { id: "professional", label: "More professional" },
];

export function IdeaLab({ trendId }: { trendId: string }) {
  const { user, refresh } = useSession();
  const [pack, setPack] = useState<IdeaPack | null>(null);
  const [spice, setSpice] = useState<Spice>("base");
  const [source, setSource] = useState("");
  const [cached, setCached] = useState(false);
  const [tab, setTab] = useState<"tweets" | "reels" | "carousels" | "youtube">("tweets");
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [variants, setVariants] = useState<Record<number, number>>({});
  const drag = useRef<number | null>(null);

  async function generate(next: Spice) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const data = await api<{ pack: IdeaPack; source: string; cached: boolean }>(`/api/trends/${trendId}/ideas`, {
        method: "POST",
        body: JSON.stringify({ spice: next }),
      });
      setPack(data.pack);
      setSpice(next);
      setSource(data.source);
      setCached(data.cached);
      setActive(0);
      await refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not draft ideas.");
    } finally {
      setBusy(false);
    }
  }

  async function save(hook: string, format: string, outline = "", strength: TweetHook["strength"] | null = null) {
    if (!user) return;
    const platform = (user.platforms[0] || "x") as Platform;
    try {
      const result = await api<{ created: boolean; points: number }>("/api/ideas", {
        method: "POST",
        body: JSON.stringify({ trendId, platform, format, hook, outline, strength }),
      });
      setSaved((current) => ({ ...current, [hook]: true }));
      setNotice(result.created ? `Saved. You have ${result.points} idea points.` : "Already on your board.");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    }
  }

  async function rewrite(index: number) {
    const variant = (variants[index] ?? 0) + 1;
    const data = await api<{ hook: TweetHook }>(`/api/trends/${trendId}/hooks`, {
      method: "POST",
      body: JSON.stringify({ index, spice, variant }),
    });
    setPack((current) => {
      if (!current) return current;
      const tweet_hooks = current.tweet_hooks.map((hook, hookIndex) => (hookIndex === index ? data.hook : hook));
      return { ...current, tweet_hooks };
    });
    setVariants((current) => ({ ...current, [index]: variant }));
    setActive(index);
  }

  const hook = pack?.tweet_hooks[active];

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/trends/${trendId}`} className="text-sm text-muted">Back to the trend</Link>
        <h1 className="font-display mt-3 text-5xl leading-none md:text-6xl">Idea lab</h1>
        <p className="mt-3 max-w-xl text-muted">
          Hooks are drafted from the cached snapshot for your niche, tone, and language. This accelerates ideas. It does not promise reach.
        </p>
      </div>

      {!pack ? (
        <button type="button" disabled={busy} onClick={() => generate("base")} className="rounded-full bg-mint px-8 py-5 text-lg font-semibold text-[#07110c] disabled:opacity-60">
          {busy ? "Dealing the cards…" : "Generate hooks"}
        </button>
      ) : (
        <div className="flex flex-wrap gap-2">
          {SPICES.map((item) => (
            <button key={item.id} type="button" disabled={busy} onClick={() => generate(item.id)} className={`rounded-full px-4 py-2 text-sm ${spice === item.id ? "bg-white text-[#07110c]" : "border border-white/15"}`}>
              {item.label}
            </button>
          ))}
          <button type="button" onClick={() => generate("base")} className="rounded-full border border-white/15 px-4 py-2 text-sm">Reset tone</button>
        </div>
      )}
      {error ? <p className="text-rose">{error}</p> : null}
      {notice ? <p className="text-mint">{notice}</p> : null}
      {pack ? (
        <p className="text-xs uppercase tracking-widest text-muted">
          {cached ? "Served from the idea cache" : source === "llm" ? "Model draft, checked against the snapshot" : "Drafted locally from the snapshot"}
          {spice !== "base" ? ` · ${spice}` : ""}
        </p>
      ) : null}

      {pack && hook ? (
        <>
          <div className="flex gap-2 text-sm">
            {(["tweets", "reels", "carousels", "youtube"] as const).map((item) => (
              <button key={item} type="button" onClick={() => setTab(item)} className={`rounded-full px-3 py-1.5 capitalize ${tab === item ? "bg-white/10" : "text-muted"}`}>
                {item}
              </button>
            ))}
          </div>

          {tab === "tweets" ? (
            <article
              className="panel deal rounded-[28px] p-6 md:p-8"
              style={{ touchAction: "pan-y" }}
              onPointerDown={(event) => {
                drag.current = event.clientX;
              }}
              onPointerUp={(event) => {
                if (drag.current === null) return;
                const dx = event.clientX - drag.current;
                drag.current = null;
                if (dx > 90) void save(hook.text, "tweet", "", hook.strength);
                if (dx < -90) void rewrite(active);
              }}
            >
              <div className="text-xs uppercase tracking-[0.18em] text-muted">Tweet hook {active + 1} / {pack.tweet_hooks.length}</div>
              <p className="mt-4 font-display text-3xl leading-tight md:text-4xl">{hook.text}</p>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                <Meter label="Clarity" value={hook.strength.clarity} />
                <Meter label="Curiosity" value={hook.strength.curiosity} />
                <Meter label="Controversy" value={hook.strength.controversy} />
              </div>
              <p className="mt-4 text-xs text-muted">Swipe right to save, left to rewrite. Or use the buttons.</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => save(hook.text, "tweet", "", hook.strength)} className="rounded-full bg-mint px-4 py-2 text-sm font-semibold text-[#07110c]">
                  {saved[hook.text] ? "Saved" : "Save hook"}
                </button>
                <button type="button" onClick={() => rewrite(active)} className="rounded-full border border-white/15 px-4 py-2 text-sm">Rewrite this one</button>
                <button type="button" onClick={() => setActive((active + pack.tweet_hooks.length - 1) % pack.tweet_hooks.length)} className="rounded-full border border-white/15 px-4 py-2 text-sm">Previous</button>
                <button type="button" onClick={() => setActive((active + 1) % pack.tweet_hooks.length)} className="rounded-full border border-white/15 px-4 py-2 text-sm">Next</button>
              </div>
            </article>
          ) : null}

          {tab === "tweets" ? (
            <ol className="space-y-3">
              {pack.tweet_hooks.map((item, index) => (
                <li key={`${item.text}-${index}`} className="deal" style={{ animationDelay: `${index * 45}ms` }}>
                  <button type="button" onClick={() => setActive(index)} className={`panel w-full rounded-2xl p-4 text-left ${index === active ? "ring-1 ring-mint" : ""}`}>
                    <span className="text-xs text-muted">0{index + 1}</span>
                    <span className="mt-1 block text-lg">{item.text}</span>
                  </button>
                </li>
              ))}
            </ol>
          ) : null}

          {tab === "reels" ? (
            <div className="space-y-4">
              {pack.reel_ideas.map((reel, index) => (
                <article key={reel.title} className="panel deal rounded-3xl p-5" style={{ animationDelay: `${index * 50}ms` }}>
                  <div className="text-xs uppercase tracking-widest text-muted">{reel.duration}</div>
                  <h2 className="font-display mt-2 text-2xl">{reel.title}</h2>
                  <p className="mt-2">{reel.hook}</p>
                  <ol className="mt-3 list-decimal space-y-1 pl-5 text-muted">
                    {reel.beats.map((beat) => <li key={beat}>{beat}</li>)}
                  </ol>
                  <button type="button" onClick={() => save(reel.title, "reel", reel.beats.join("\n"))} className="mt-4 rounded-full bg-white/10 px-4 py-2 text-sm">
                    {saved[reel.title] ? "Saved" : "Save reel"}
                  </button>
                </article>
              ))}
            </div>
          ) : null}

          {tab === "carousels" ? (
            <div className="space-y-4">
              {pack.carousel_outline.map((carousel, index) => (
                <article key={carousel.title} className="panel deal rounded-3xl p-5" style={{ animationDelay: `${index * 50}ms` }}>
                  <h2 className="font-display text-2xl">{carousel.title}</h2>
                  <ol className="mt-3 list-decimal space-y-2 pl-5">
                    {carousel.slides.map((slide) => <li key={slide}>{slide}</li>)}
                  </ol>
                  <button type="button" onClick={() => save(carousel.title, "carousel", carousel.slides.join("\n"))} className="mt-4 rounded-full bg-white/10 px-4 py-2 text-sm">
                    {saved[carousel.title] ? "Saved" : "Save carousel"}
                  </button>
                </article>
              ))}
            </div>
          ) : null}

          {tab === "youtube" ? (
            <div className="space-y-3">
              {pack.youtube_titles.map((title, index) => (
                <article key={title} className="panel deal flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4" style={{ animationDelay: `${index * 45}ms` }}>
                  <h2 className="text-lg">{title}</h2>
                  <button type="button" onClick={() => save(title, "youtube")} className="rounded-full bg-white/10 px-4 py-2 text-sm">
                    {saved[title] ? "Saved" : "Save title"}
                  </button>
                </article>
              ))}
            </div>
          ) : null}

          <section className="panel rounded-[28px] p-6">
            <h2 className="font-display text-2xl">Angle and asks</h2>
            <p className="mt-3 text-lg">{pack.best_angle}</p>
            <ul className="mt-4 space-y-2 text-muted">
              {pack.content_angles.map((item) => <li key={item}>{item}</li>)}
            </ul>
            <h3 className="mt-5 text-sm uppercase tracking-widest text-muted">CTAs</h3>
            <ul className="mt-2 space-y-2">
              {pack.cta.map((item) => (
                <li key={item} className="flex items-center justify-between gap-3">
                  <span>{item}</span>
                  <button type="button" onClick={() => save(item, "angle")} className="shrink-0 text-sm text-mint">Save</button>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-sky">{pack.posting_window}</p>
            <p className="mt-3 text-sm text-muted">{pack.disclaimer}</p>
          </section>
        </>
      ) : null}
    </div>
  );
}
