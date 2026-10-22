"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NICHE_LABEL } from "@/lib/constants";
import { formatWhen } from "@/lib/format";
import { ALERT_CHANNELS, NICHES, type AlertChannel, type Niche } from "@/lib/types";
import { api } from "./api";

type AlertRow = { id: string; niche: Niche; threshold: number; channel: AlertChannel; destination: string | null; active: boolean; lastSentAt: string | null };
type Note = { id: string; title: string; body: string; trendId: string | null; channel: string; read: boolean; createdAt: string };

export function AlertsPanel() {
  const [alerts, setAlerts] = useState<AlertRow[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [niche, setNiche] = useState<Niche>("finance");
  const [threshold, setThreshold] = useState(150);
  const [channel, setChannel] = useState<AlertChannel>("inapp");
  const [destination, setDestination] = useState("");
  const [error, setError] = useState("");

  function load() {
    return Promise.all([api<{ alerts: AlertRow[] }>("/api/alerts"), api<{ items: Note[] }>("/api/notifications")]).then(([alertData, noteData]) => {
      setAlerts(alertData.alerts);
      setNotes(noteData.items);
    });
  }

  useEffect(() => {
    let cancel = false;
    Promise.all([api<{ alerts: AlertRow[] }>("/api/alerts"), api<{ items: Note[] }>("/api/notifications")])
      .then(([alertData, noteData]) => {
        if (cancel) return;
        setAlerts(alertData.alerts);
        setNotes(noteData.items);
      })
      .catch((err: Error) => {
        if (!cancel) setError(err.message);
      });
    return () => {
      cancel = true;
    };
  }, []);

  async function createAlert() {
    setError("");
    try {
      const data = await api<{ alerts: AlertRow[] }>("/api/alerts", {
        method: "POST",
        body: JSON.stringify({ niche, threshold, channel, destination: destination || undefined }),
      });
      setAlerts(data.alerts);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the alert.");
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-5xl">Alerts</h1>
        <p className="mt-2 max-w-xl text-muted">
          Get a note when a cached niche trend crosses your growth line. Email and WhatsApp send only when a provider key is configured. Otherwise the alert stays in the app.
        </p>
      </div>
      <form
        className="panel grid gap-4 rounded-[28px] p-6 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          void createAlert();
        }}
      >
        <label className="text-sm">Niche
          <select className="mt-2 w-full rounded-2xl border border-white/10 bg-transparent p-3" value={niche} onChange={(event) => setNiche(event.target.value as Niche)}>
            {NICHES.map((item) => <option key={item} value={item}>{NICHE_LABEL.en[item]}</option>)}
          </select>
        </label>
        <label className="text-sm">Growth threshold (%)
          <input className="mt-2 w-full rounded-2xl border border-white/10 bg-transparent p-3" type="number" min={10} max={500} value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} />
        </label>
        <label className="text-sm">Channel
          <select className="mt-2 w-full rounded-2xl border border-white/10 bg-transparent p-3" value={channel} onChange={(event) => setChannel(event.target.value as AlertChannel)}>
            {ALERT_CHANNELS.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </label>
        {channel === "whatsapp" ? (
          <label className="text-sm">WhatsApp number
            <input className="mt-2 w-full rounded-2xl border border-white/10 bg-transparent p-3" value={destination} onChange={(event) => setDestination(event.target.value)} placeholder="+9198..." />
          </label>
        ) : <p className="self-end text-sm text-muted">In-app alerts are immediate. Email uses your account address.</p>}
        <button type="submit" className="rounded-full bg-mint px-5 py-3 font-semibold text-[#07110c] md:col-span-2 md:w-fit">Save alert</button>
      </form>
      {error ? <p className="text-rose">{error}</p> : null}
      <ul className="space-y-3">
        {alerts.map((alert) => (
          <li key={alert.id} className="panel flex flex-wrap items-center justify-between gap-3 rounded-2xl p-4">
            <div>
              <div className="text-lg">{NICHE_LABEL.en[alert.niche]} · {alert.threshold}% · {alert.channel}</div>
              <div className="text-sm text-muted">{alert.destination || "No extra destination"} {alert.lastSentAt ? `· last sent ${formatWhen(alert.lastSentAt)}` : ""}</div>
            </div>
            <button
              type="button"
              className="text-sm text-mint"
              onClick={async () => {
                await api(`/api/alerts/${alert.id}`, { method: "PATCH", body: JSON.stringify({ active: !alert.active }) });
                await load();
              }}
            >
              {alert.active ? "Pause" : "Resume"}
            </button>
          </li>
        ))}
      </ul>
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-2xl">In-app alerts</h2>
          <button type="button" className="text-sm text-muted" onClick={async () => { await api("/api/notifications", { method: "POST" }); await load(); }}>Mark read</button>
        </div>
        {notes.length === 0 ? <p className="text-muted">None yet. A rising trend has to clear your threshold.</p> : null}
        <ul className="space-y-3">
          {notes.map((note) => (
            <li key={note.id} className="panel rounded-2xl p-4">
              <div className="text-xs uppercase tracking-widest text-muted">{note.channel} · {formatWhen(note.createdAt)} {note.read ? "" : "· new"}</div>
              <h3 className="mt-2 text-xl">{note.title}</h3>
              <p className="mt-2 text-sm text-muted">{note.body}</p>
              {note.trendId ? <Link className="mt-2 inline-block text-mint" href={`/trends/${note.trendId}`}>Open trend</Link> : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
