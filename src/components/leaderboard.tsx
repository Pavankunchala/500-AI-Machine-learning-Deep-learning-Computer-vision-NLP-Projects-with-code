"use client";

import { useEffect, useState } from "react";
import { NICHE_LABEL } from "@/lib/constants";
import { NICHES, type Niche } from "@/lib/types";
import { api } from "./api";
import { useSession } from "./session";

export function Leaderboard() {
  const { user } = useSession();
  const [picked, setPicked] = useState<Niche | null>(null);
  const niche = picked ?? user?.niche ?? "education";
  const [rows, setRows] = useState<{ name: string; saves: number }[]>([]);

  useEffect(() => {
    let cancel = false;
    api<{ rows: { name: string; saves: number }[] }>(`/api/leaderboard?niche=${niche}`)
      .then((data) => {
        if (!cancel) setRows(data.rows);
      })
      .catch(() => {
        if (!cancel) setRows([]);
      });
    return () => {
      cancel = true;
    };
  }, [niche]);

  return (
    <div>
      <h1 className="font-display text-5xl">Weekly ranks</h1>
      <p className="mt-2 max-w-xl text-muted">Most saved trends this week, inside one niche. Names only. No follower counts, no prizes.</p>
      <div className="mt-5 flex gap-2 overflow-x-auto no-scrollbar">
        {NICHES.map((item) => (
          <button key={item} type="button" onClick={() => setPicked(item)} className={`rounded-full px-4 py-2 text-sm ${niche === item ? "bg-white text-[#07110c]" : "border border-white/10"}`}>
            {NICHE_LABEL.en[item]}
          </button>
        ))}
      </div>
      <ol className="mt-6 space-y-3">
        {rows.length === 0 ? <li className="text-muted">No saves in this niche yet this week.</li> : null}
        {rows.map((row, index) => (
          <li key={`${row.name}-${index}`} className="panel flex items-center justify-between rounded-2xl px-4 py-4">
            <span className="font-display text-2xl">{String(index + 1).padStart(2, "0")} {row.name}</span>
            <span className="text-mint">{row.saves} saved</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
