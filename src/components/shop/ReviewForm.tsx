"use client";

import { useState } from "react";
import { toast } from "@/components/ui/Toaster";

export function ReviewForm({ productSlug }: { productSlug: string }) {
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photo, setPhoto] = useState<string | undefined>();
  const [busy, setBusy] = useState(false);

  async function onFile(file: File) {
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let binary = "";
    bytes.forEach((b) => (binary += String.fromCharCode(b)));
    setPhoto(`data:${file.type};base64,${btoa(binary)}`);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productSlug, name, city, rating, title, body, photo }),
    });
    setBusy(false);
    if (res.ok) {
      toast("Thank you — your review is on the mill board");
      setTitle("");
      setBody("");
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-sand bg-paper p-5">
      <h3 className="font-serif text-2xl">Share a kitchen note</h3>
      <p className="mt-1 text-sm text-muted">A photo of rotis is more useful to the next family than a star alone.</p>
      <div className="mt-4 grid gap-3">
        <input required placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} className="h-11 rounded-xl border border-sand px-3" />
        <input required placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} className="h-11 rounded-xl border border-sand px-3" />
        <label className="text-sm">
          Rating
          <select value={rating} onChange={(e) => setRating(Number(e.target.value))} className="ml-2 rounded-lg border border-sand px-2 py-1">
            {[5, 4, 3, 2, 1].map((n) => (
              <option key={n} value={n}>
                {n} stars
              </option>
            ))}
          </select>
        </label>
        <input required placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} className="h-11 rounded-xl border border-sand px-3" />
        <textarea required placeholder="How did the dough behave?" value={body} onChange={(e) => setBody(e.target.value)} className="min-h-28 rounded-xl border border-sand px-3 py-2" />
        <label className="text-sm text-muted">
          Photo (optional)
          <input
            type="file"
            accept="image/*"
            className="mt-1 block w-full text-sm"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFile(f);
            }}
          />
        </label>
        <button disabled={busy} className="h-11 rounded-full bg-brown text-cream disabled:opacity-50">
          {busy ? "Sending…" : "Publish review"}
        </button>
      </div>
    </form>
  );
}
