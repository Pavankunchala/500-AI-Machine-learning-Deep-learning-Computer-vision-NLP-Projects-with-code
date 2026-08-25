"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { inr } from "@/lib/format";

type Hit = {
  slug: string;
  name: string;
  tagline: string;
  image: string;
  price: number;
};

export function SearchDialog({ onClose }: { onClose: () => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);

  useEffect(() => {
    input.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (q.trim().length < 1) {
        setHits([]);
        return;
      }
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setHits(data.products ?? []);
    }, 160);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="fixed inset-0 z-[70]">
      <button className="absolute inset-0 bg-ink/40" aria-label="Close search" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search products"
        className="relative mx-auto mt-16 w-[min(640px,92vw)] rounded-2xl bg-paper p-4 shadow-2xl"
      >
        <div className="flex items-center gap-2 rounded-xl border border-sand bg-cream px-3">
          <Search size={18} className="text-muted" />
          <input
            ref={input}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search atta, besan, millets…"
            className="h-12 w-full bg-transparent text-base outline-none"
            aria-autocomplete="list"
          />
          <button type="button" aria-label="Close" onClick={onClose} className="p-1">
            <X size={18} />
          </button>
        </div>
        <ul className="mt-3 max-h-[50vh] overflow-auto">
          {hits.map((hit) => (
            <li key={hit.slug}>
              <Link
                href={`/shop/${hit.slug}`}
                onClick={onClose}
                className="flex items-center gap-3 rounded-xl p-2 hover:bg-sand/60"
              >
                <img src={hit.image} alt="" className="h-14 w-14 rounded-lg object-cover" />
                <span className="flex-1">
                  <span className="block font-medium">{hit.name}</span>
                  <span className="block text-sm text-muted">{hit.tagline}</span>
                </span>
                <span className="text-sm">{inr(hit.price)}</span>
              </Link>
            </li>
          ))}
          {q && hits.length === 0 && (
            <li className="px-2 py-6 text-center text-sm text-muted">
              No matches. Try “atta”, “ragi”, or “besan”.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
