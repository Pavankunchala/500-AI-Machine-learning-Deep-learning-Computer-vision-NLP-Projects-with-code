"use client";

import { useEffect, useState } from "react";
import { PLANS, type Plan } from "@/lib/types";
import { api } from "./api";
import { formatWhen } from "@/lib/format";

type Usage = {
  totals: { source: string; status: string; n: number; units: number }[];
  recent: { endpoint: string; source: string; status: string; latency_ms: number; detail: string | null; created_at: string }[];
  users: { id: string; email: string; name: string; plan: Plan; role: string; created_at: string }[];
  counts: { trends: number; posts: number; ideas: number; cachePacks: number };
  jobs: { id: string; status: string; attempts: number; last_error: string | null; created_at: string }[];
  budget: { endpoint: string; used: number; limit: number }[];
  xConfigured: boolean;
  llmConfigured: boolean;
};

export function AdminDashboard() {
  const [data, setData] = useState<Usage | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function load() {
    return api<Usage>("/api/admin/usage").then((next) => setData(next));
  }

  useEffect(() => {
    let cancel = false;
    api<Usage>("/api/admin/usage")
      .then((next) => {
        if (!cancel) setData(next);
      })
      .catch((err: Error) => {
        if (!cancel) setError(err.message);
      });
    return () => {
      cancel = true;
    };
  }, []);

  if (!data) return <p className="text-muted">{error || "Loading usage…"}</p>;
  const max = Math.max(...data.totals.map((row) => row.n), 1);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-5xl">API usage</h1>
          <p className="mt-2 max-w-xl text-muted">X is pay-per-use. This board shows cache hits, local drafts, and any real X calls from the shared worker.</p>
        </div>
        <button
          type="button"
          className="rounded-full bg-mint px-5 py-3 font-semibold text-[#07110c]"
          onClick={async () => {
            const result = await api<{ summary?: string; message?: string }>("/api/admin/ingest", { method: "POST" });
            setMessage(result.summary || result.message || "Ingestion finished.");
            await load();
          }}
        >
          Run ingestion
        </button>
      </div>
      {message ? <p className="text-mint">{message}</p> : null}
      {error ? <p className="text-rose">{error}</p> : null}
      <div className="grid gap-3 md:grid-cols-4">
        <Stat label="Cached trends" value={data.counts.trends} />
        <Stat label="Stored posts" value={data.counts.posts} />
        <Stat label="Saved ideas" value={data.counts.ideas} />
        <Stat label="Idea packs cached" value={data.counts.cachePacks} />
      </div>
      <section className="panel rounded-[28px] p-6">
        <h2 className="font-display text-2xl">Last 24 hours</h2>
        <p className="mt-1 text-sm text-muted">X token {data.xConfigured ? "is set" : "is not set"}. Model key {data.llmConfigured ? "is set" : "is not set"}.</p>
        <ul className="mt-4 space-y-3">
          {data.totals.length === 0 ? <li className="text-muted">No calls recorded yet. Open the list to log a cache hit.</li> : null}
          {data.totals.map((row) => (
            <li key={`${row.source}-${row.status}`}>
              <div className="mb-1 flex justify-between text-sm"><span>{row.source} · {row.status}</span><span>{row.n}</span></div>
              <div className="h-2 rounded-full bg-white/10"><div className="h-full rounded-full bg-sky" style={{ width: `${(row.n / max) * 100}%` }} /></div>
            </li>
          ))}
        </ul>
      </section>
      <section className="panel rounded-[28px] p-6">
        <h2 className="font-display text-2xl">Worker budget</h2>
        <p className="mt-1 text-sm text-muted">Recent search is capped in our queue at 450 requests per 15 minutes, ahead of the X window. Trends are capped lower so one run cannot drain the app.</p>
        <ul className="mt-3 space-y-2 text-sm">
          {data.budget.map((row) => (
            <li key={row.endpoint}>{row.endpoint}: {row.used} / {row.limit} this window</li>
          ))}
        </ul>
        <h3 className="mt-4 text-sm uppercase tracking-widest text-muted">Jobs</h3>
        <ul className="mt-2 space-y-2 text-sm">
          {data.jobs.length === 0 ? <li className="text-muted">No jobs yet.</li> : null}
          {data.jobs.map((job) => (
            <li key={job.id}>{job.status} · attempts {job.attempts} {job.last_error ? `· ${job.last_error}` : ""} · {formatWhen(job.created_at)}</li>
          ))}
        </ul>
      </section>
      <section className="panel overflow-x-auto rounded-[28px] p-6">
        <h2 className="font-display text-2xl">Recent calls</h2>
        <table className="mt-4 w-full text-left text-sm">
          <thead className="text-muted"><tr><th className="py-2">When</th><th>Endpoint</th><th>Source</th><th>Status</th><th>Detail</th></tr></thead>
          <tbody>
            {data.recent.map((row, index) => (
              <tr key={`${row.created_at}-${index}`} className="border-t border-white/5">
                <td className="py-2 pr-3">{formatWhen(row.created_at)}</td>
                <td className="pr-3">{row.endpoint}</td>
                <td className="pr-3">{row.source}</td>
                <td className="pr-3">{row.status}</td>
                <td className="max-w-xs truncate text-muted">{row.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <section className="panel rounded-[28px] p-6">
        <h2 className="font-display text-2xl">Plans</h2>
        <ul className="mt-4 space-y-3">
          {data.users.map((person) => (
            <li key={person.id} className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div>{person.name}</div>
                <div className="text-sm text-muted">{person.email} · {person.role}</div>
              </div>
              <select
                className="rounded-full border border-white/10 bg-transparent px-3 py-2 text-sm"
                value={person.plan}
                onChange={async (event) => {
                  await api("/api/admin/users", { method: "PATCH", body: JSON.stringify({ userId: person.id, plan: event.target.value }) });
                  await load();
                }}
              >
                {PLANS.map((plan) => <option key={plan} value={plan}>{plan}</option>)}
              </select>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="panel rounded-3xl p-4">
      <div className="text-xs uppercase tracking-widest text-muted">{label}</div>
      <div className="mt-2 font-display text-3xl">{value}</div>
    </div>
  );
}
