"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { EMOTION_META, LANGUAGE_LABEL, NICHE_LABEL, RANGE_LABEL, REGION_LABEL, STATUS_LABEL } from "@/lib/constants";
import { formatCompact, formatWhen } from "@/lib/format";
import { LANGUAGES, NICHES, RANGES, REGIONS, STATUSES, type Language, type Niche, type PublicUser, type RangeKey, type Region, type TrendCard, type TrendStatus } from "@/lib/types";
import { api } from "./api";
import { Ring, Spark } from "./spark";
import { useSession } from "./session";

type Filters = {
  region: Region | "all";
  niche: Niche | "all";
  language: Language | "all";
  range: RangeKey;
  status: TrendStatus | "all";
  q: string;
};

const NICHE_ORDER: Array<Niche | "all"> = ["all", ...NICHES];

export function TrendList() {
  const { user, setUser } = useSession();
  const [filters, setFilters] = useState<Filters | null>(null);
  const [trends, setTrends] = useState<TrendCard[]>([]);
  const [meta, setMeta] = useState<{ capturedAt: string | null; origin: string }>({ capturedAt: null, origin: "demo-cache" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const drag = useRef<{ x: number; y: number } | null>(null);

  if (user && filters === null) {
    let initial: Filters = {
      region: "all",
      niche: "all",
      language: "all",
      range: "24h",
      status: "all",
      q: "",
    };
    if (typeof window !== "undefined") {
      const saved = sessionStorage.getItem("tp-filters");
      if (saved) {
        try {
          initial = JSON.parse(saved) as Filters;
        } catch {
          /* keep the profile default */
        }
      }
    }
    setFilters(initial);
  }

  useEffect(() => {
    if (!filters) return;
    const params = new URLSearchParams(filters);
    let cancel = false;
    api<{ trends: TrendCard[]; capturedAt: string | null; origin: string; user: PublicUser }>(`/api/trends?${params}`)
      .then((data) => {
        if (cancel) return;
        setTrends(data.trends);
        setMeta({ capturedAt: data.capturedAt, origin: data.origin });
        setUser(data.user);
        setError("");
      })
      .catch((err: Error) => {
        if (!cancel) setError(err.message);
      })
      .finally(() => {
        if (!cancel) setLoading(false);
      });
    return () => {
      cancel = true;
    };
  }, [filters, setUser]);

  function update(next: Filters) {
    sessionStorage.setItem("tp-filters", JSON.stringify(next));
    setLoading(true);
    setFilters(next);
  }

  function shiftNiche(direction: number) {
    if (!filters) return;
    const index = NICHE_ORDER.indexOf(filters.niche);
    const next = NICHE_ORDER[(index + direction + NICHE_ORDER.length) % NICHE_ORDER.length];
    update({ ...filters, niche: next });
  }

  if (!filters) return <p className="text-muted">Reading the cache…</p>;

  return (
    <section
      onPointerDown={(event) => {
        if ((event.target as HTMLElement).closest("a,button,input,select")) return;
        drag.current = { x: event.clientX, y: event.clientY };
      }}
      onPointerUp={(event) => {
        if (!drag.current) return;
        const dx = event.clientX - drag.current.x;
        const dy = event.clientY - drag.current.y;
        drag.current = null;
        if (Math.abs(dx) < 80 || Math.abs(dx) < Math.abs(dy)) return;
        shiftNiche(dx < 0 ? 1 : -1);
      }}
    >
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-mint">Cached list</p>
          <h1 className="font-display mt-2 text-4xl leading-none md:text-6xl">What is rising</h1>
          <p className="mt-3 max-w-xl text-muted">
            A large list, ranked for your niche. Opening it reads the cache. It does not call X.
          </p>
        </div>
        <p className="max-w-xs text-sm text-muted">
          {meta.origin === "demo-cache"
            ? "Demo snapshot. Add an X bearer token and run ingestion to replace these rows."
            : "Rows include data stored from X."}{" "}
          {meta.capturedAt ? `Prepared ${formatWhen(meta.capturedAt)} IST.` : ""}
        </p>
      </div>

      <div className="sticky top-16 z-10 -mx-1 mb-5 space-y-3 bg-[#070910]/85 py-2 backdrop-blur">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <Chip active={filters.region === "all"} onClick={() => update({ ...filters, region: "all" })}>
            All places
          </Chip>
          {REGIONS.map((region) => (
            <Chip key={region} active={filters.region === region} onClick={() => update({ ...filters, region })}>
              {REGION_LABEL[region]}
            </Chip>
          ))}
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {NICHE_ORDER.map((niche) => (
            <Chip key={niche} active={filters.niche === niche} onClick={() => update({ ...filters, niche })}>
              {niche === "all" ? "All niches" : NICHE_LABEL.en[niche]}
            </Chip>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {RANGES.map((range) => (
            <Chip key={range} active={filters.range === range} onClick={() => update({ ...filters, range })}>
              {RANGE_LABEL[range]}
            </Chip>
          ))}
          {STATUSES.map((status) => (
            <Chip key={status} active={filters.status === status} onClick={() => update({ ...filters, status: filters.status === status ? "all" : status })}>
              {STATUS_LABEL[status]}
            </Chip>
          ))}
          <label className="sr-only" htmlFor="language">Language</label>
          <select
            id="language"
            className="rounded-full border border-white/10 bg-transparent px-3 py-1.5 text-sm"
            value={filters.language}
            onChange={(event) => update({ ...filters, language: event.target.value as Filters["language"] })}
          >
            <option value="all">All languages</option>
            {LANGUAGES.map((language) => (
              <option key={language} value={language}>
                {LANGUAGE_LABEL[language]}
              </option>
            ))}
          </select>
          <input
            value={filters.q}
            onChange={(event) => update({ ...filters, q: event.target.value })}
            placeholder="Search the cache"
            className="min-w-40 flex-1 rounded-full border border-white/10 bg-transparent px-4 py-1.5 text-sm outline-none"
          />
        </div>
        <p className="text-xs text-muted">
          India includes Bengaluru, Mumbai, and Delhi. Opportunity scores use your {user?.niche ?? "selected"} lens. Swipe sideways to change niche.
        </p>
      </div>

      {error ? <p className="mb-4 text-rose">{error}</p> : null}
      {loading ? <p className="text-muted">Reading the cache…</p> : null}
      {!loading && trends.length === 0 ? (
        <p className="panel rounded-3xl p-8 text-muted">Nothing in this slice. Widen the time range or niche.</p>
      ) : null}

      <ol className="space-y-4">
        {trends.map((trend, index) => {
          const emotion = EMOTION_META[trend.emotion];
          const speed = `${Math.max(0.8, 2.4 - trend.growthPct / 220).toFixed(2)}s`;
          return (
            <li key={trend.id} className={`panel rise-in rounded-[28px] p-5 md:p-7 ${trend.status === "rising" ? "rise" : trend.status === "peaking" ? "peak" : "cool"}`} style={{ animationDelay: `${index * 40}ms` }}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.18em] text-muted">
                    <span className="inline-flex items-center gap-2">
                      <span className={`h-2 w-2 rounded-full ${trend.status === "rising" ? "bg-mint pulse-dot" : trend.status === "peaking" ? "bg-amber" : "bg-sky"}`} style={{ animationDuration: speed }} />
                      {STATUS_LABEL[trend.status]}
                    </span>
                    <span>{String(index + 1).padStart(2, "0")}</span>
                    <span>{emotion.emoji} {emotion.label}</span>
                    {trend.hunter === "you" ? <span className="text-mint">Trend Hunter</span> : null}
                  </div>
                  <Link href={`/trends/${trend.id}`} className="mt-3 block font-display text-4xl leading-[0.95] tracking-tight hover:text-mint md:text-5xl">
                    {trend.name}
                  </Link>
                  <p className="mt-3 text-sm text-muted">
                    {NICHE_LABEL.en[trend.niche]} · {REGION_LABEL[trend.region]} · {LANGUAGE_LABEL[trend.language]}
                  </p>
                </div>
                <div className="text-right">
                  <div className="font-display text-5xl leading-none text-mint">+{trend.growthPct}%</div>
                  <div className="mt-1 text-xs uppercase tracking-widest text-muted">in {RANGE_LABEL[trend.windowKey]}</div>
                </div>
              </div>
              <div className="mt-6 flex flex-wrap items-center gap-6">
                <div>
                  <div className="text-xs uppercase tracking-widest text-muted">Posts in snapshot</div>
                  <div className="mt-1 text-2xl">{formatCompact(trend.postCount)}</div>
                </div>
                <Spark values={trend.spark} />
                <div className="ml-auto flex items-center gap-3">
                  <div className="text-right text-xs uppercase tracking-widest text-muted">
                    Opportunity
                    <div className="mt-1 normal-case tracking-normal text-muted">for your niche</div>
                  </div>
                  <Ring value={trend.score} />
                </div>
              </div>
              <p className="mt-5 max-w-3xl text-base text-ink/90">{trend.why}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={`/trends/${trend.id}/ideas`} className="rounded-full bg-mint px-5 py-3 text-sm font-semibold text-[#07110c]">
                  Turn into content
                </Link>
                <Link href={`/trends/${trend.id}`} className="rounded-full border border-white/15 px-5 py-3 text-sm">
                  Open the deep dive
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function Chip({ active, children, onClick }: { active: boolean; children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full px-4 py-2 text-sm ${active ? "bg-white text-[#07110c]" : "border border-white/10 text-muted"}`}
    >
      {children}
    </button>
  );
}
