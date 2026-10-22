"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { IDEA_STATUSES, type BoardItem, type IdeaStatus } from "@/lib/types";
import { ApiError, api, downloadExport } from "./api";
import { useSession } from "./session";

const STATUS_COPY: Record<IdeaStatus, string> = {
  to_create: "To create",
  posted: "Posted",
  performed: "Performed well",
};

export function Board() {
  const { user, refresh } = useSession();
  const [items, setItems] = useState<BoardItem[]>([]);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function load() {
    return api<{ items: BoardItem[] }>("/api/board").then((data) => setItems(data.items));
  }

  useEffect(() => {
    let cancel = false;
    api<{ items: BoardItem[] }>("/api/board")
      .then((data) => {
        if (!cancel) {
          setItems(data.items);
          setReady(true);
        }
      })
      .catch((err: Error) => {
        if (!cancel) {
          setError(err.message);
          setReady(true);
        }
      });
    return () => {
      cancel = true;
    };
  }, []);

  async function patch(id: string, body: { status?: IdeaStatus; notes?: string }) {
    const result = await api<{ points: number }>(`/api/ideas/${id}`, { method: "PATCH", body: JSON.stringify(body) });
    setNotice(`Board updated. ${result.points} idea points.`);
    await Promise.all([load(), refresh()]);
  }

  async function remove(id: string) {
    await api(`/api/ideas/${id}`, { method: "DELETE" });
    setItems((current) => current.filter((item) => item.id !== id));
  }

  async function exportAs(format: "csv" | "json" | "notion") {
    try {
      await downloadExport(format);
      setNotice(format === "csv" ? "CSV downloaded. It opens in Google Sheets." : "Export downloaded.");
      setError("");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Export failed.");
    }
  }

  const exports = user?.limits.export ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl">Idea board</h1>
          <p className="mt-2 text-muted">Save hooks, mark what you posted, and keep a note on what worked.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => exportAs("csv")} className="rounded-full border border-white/15 px-4 py-2 text-sm">CSV / Sheets</button>
          <button type="button" onClick={() => exportAs("notion")} className="rounded-full border border-white/15 px-4 py-2 text-sm">Notion table</button>
          <button type="button" onClick={() => exportAs("json")} className="rounded-full border border-white/15 px-4 py-2 text-sm">JSON</button>
        </div>
      </div>
      {error ? <p className="text-rose">{error}</p> : null}
      {notice ? <p className="text-mint">{notice}</p> : null}
      {exports.length === 0 ? <p className="text-sm text-muted">Free plan can save ideas. CSV export starts on Creator.</p> : null}
      {ready && items.length === 0 ? (
        <p className="panel rounded-3xl p-8 text-muted">Nothing saved yet. <Link className="text-mint" href="/radar">Pick a trend from the list.</Link></p>
      ) : null}
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.id} className="panel rounded-[28px] p-5">
            <div className="text-xs uppercase tracking-widest text-muted">{item.trendName} · {item.format} · {item.platform}</div>
            <p className="mt-3 text-2xl leading-snug">{item.hook}</p>
            {item.outline ? <pre className="mt-3 whitespace-pre-wrap font-sans text-sm text-muted">{item.outline}</pre> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              {IDEA_STATUSES.map((status) => (
                <button key={status} type="button" onClick={() => patch(item.id, { status })} className={`rounded-full px-3 py-1.5 text-sm ${item.status === status ? "bg-mint text-[#07110c]" : "border border-white/10"}`}>
                  {STATUS_COPY[status]}
                </button>
              ))}
            </div>
            <label className="mt-4 block text-xs uppercase tracking-widest text-muted" htmlFor={`note-${item.id}`}>Note</label>
            <textarea
              id={`note-${item.id}`}
              defaultValue={item.notes}
              onBlur={(event) => {
                if (event.target.value !== item.notes) void patch(item.id, { notes: event.target.value });
              }}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-transparent p-3 text-sm"
              rows={2}
            />
            <button type="button" onClick={() => remove(item.id)} className="mt-3 text-sm text-rose">Remove</button>
          </li>
        ))}
      </ul>
    </div>
  );
}
