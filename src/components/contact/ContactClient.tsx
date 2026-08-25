"use client";

import { useState } from "react";
import { SITE, WHATSAPP_URL } from "@/lib/site";
import type { Faq, Store } from "@/types";
import { toast } from "@/components/ui/Toaster";

export function ContactClient({ faqs, stores }: { faqs: Faq[]; stores: Store[] }) {
  const [open, setOpen] = useState<number | null>(0);
  const [activeStore, setActiveStore] = useState(stores[0]);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(Object.fromEntries(form)),
    });
    setBusy(false);
    if (res.ok) {
      toast("Message received — a miller will reply");
      e.currentTarget.reset();
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <p className="text-xs uppercase tracking-[0.22em] text-terracotta">Contact</p>
      <h1 className="mt-2 font-serif text-5xl">Write, call, or stand at the mill door.</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <form onSubmit={submit} className="space-y-3 rounded-3xl border border-sand bg-paper p-6">
          <label className="block text-sm">
            Name
            <input name="name" required className="mt-1 h-11 w-full rounded-xl border border-sand px-3" />
          </label>
          <label className="block text-sm">
            Email
            <input name="email" type="email" required className="mt-1 h-11 w-full rounded-xl border border-sand px-3" />
          </label>
          <label className="block text-sm">
            Phone
            <input name="phone" className="mt-1 h-11 w-full rounded-xl border border-sand px-3" />
          </label>
          <label className="block text-sm">
            Message
            <textarea name="message" required className="mt-1 min-h-32 w-full rounded-xl border border-sand px-3 py-2" />
          </label>
          <button disabled={busy} className="h-11 rounded-full bg-terracotta px-6 text-sm text-cream">
            {busy ? "Sending…" : "Send to the mill"}
          </button>
          <p className="text-sm text-muted">
            Prefer chat?{" "}
            <a href={WHATSAPP_URL} className="text-terracotta underline" target="_blank" rel="noreferrer">
              WhatsApp the mill
            </a>
            . {SITE.phone} · {SITE.email}
          </p>
        </form>
        <div>
          <h2 className="font-serif text-3xl">Stores & pickup</h2>
          <div className="mt-4 space-y-3">
            {stores.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => setActiveStore(s)}
                className={`block w-full rounded-2xl border p-4 text-left ${
                  activeStore.id === s.id ? "border-terracotta bg-paper" : "border-sand"
                }`}
              >
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-muted">
                  {s.address}, {s.city} {s.pincode}
                </p>
                <p className="text-sm text-muted">{s.hours}</p>
              </button>
            ))}
          </div>
          <div className="mt-4 overflow-hidden rounded-2xl border border-sand">
            <iframe
              title={`Map of ${activeStore.name}`}
              className="h-64 w-full"
              loading="lazy"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${activeStore.lng - 0.04}%2C${activeStore.lat - 0.03}%2C${activeStore.lng + 0.04}%2C${activeStore.lat + 0.03}&layer=mapnik&marker=${activeStore.lat}%2C${activeStore.lng}`}
            />
          </div>
        </div>
      </div>
      <section className="mt-16 max-w-3xl">
        <h2 className="font-serif text-4xl">Questions we hear at the counter</h2>
        <div className="mt-6 divide-y divide-sand border-y border-sand">
          {faqs.map((f, i) => (
            <div key={f.q}>
              <button
                type="button"
                className="flex w-full items-center justify-between py-4 text-left font-medium"
                aria-expanded={open === i}
                onClick={() => setOpen(open === i ? null : i)}
              >
                {f.q}
                <span aria-hidden>{open === i ? "–" : "+"}</span>
              </button>
              {open === i && <p className="pb-4 text-muted">{f.a}</p>}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
