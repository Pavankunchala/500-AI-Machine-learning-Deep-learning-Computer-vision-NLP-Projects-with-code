"use client";

import { useState } from "react";
import type { Order } from "@/types";
import { inr, formatDate } from "@/lib/format";

export default function TrackPage() {
  const [id, setId] = useState("");
  const [phone, setPhone] = useState("");
  const [order, setOrder] = useState<Order | null>(null);
  const [err, setErr] = useState("");

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    const res = await fetch(`/api/orders/${encodeURIComponent(id)}?phone=${encodeURIComponent(phone)}`);
    if (!res.ok) {
      setOrder(null);
      setErr("We could not find that order. Check the ID from your confirmation.");
      return;
    }
    setOrder(await res.json());
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="font-serif text-4xl">Track an order</h1>
      <p className="mt-2 text-muted">Use the ID from your confirmation (BC-20XX-####) and the phone number on the order.</p>
      <form onSubmit={lookup} className="mt-6 space-y-3">
        <input value={id} onChange={(e) => setId(e.target.value)} placeholder="Order ID" className="h-11 w-full rounded-xl border border-sand px-3" required />
        <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="h-11 w-full rounded-xl border border-sand px-3" required />
        <button className="h-11 w-full rounded-full bg-brown text-cream">Look up</button>
      </form>
      {err && <p className="mt-4 text-sm text-terracotta">{err}</p>}
      {order && (
        <div className="mt-8 rounded-2xl border border-sand bg-paper p-5">
          <p className="text-sm uppercase tracking-wider text-terracotta">{order.status}</p>
          <p className="font-serif text-2xl">{order.id}</p>
          <p className="text-sm text-muted">{formatDate(order.createdAt)} · {inr(order.total)}</p>
          <ol className="mt-4 space-y-2 text-sm">
            {["confirmed", "packed", "shipped", "delivered"].map((s) => (
              <li key={s} className={statusIndex(order.status) >= statusIndex(s) ? "text-ink" : "text-muted"}>
                {statusIndex(order.status) >= statusIndex(s) ? "●" : "○"} {s}
              </li>
            ))}
          </ol>
          <p className="mt-3 text-sm text-muted">{order.trackingNote}</p>
        </div>
      )}
    </div>
  );
}

function statusIndex(s: string) {
  return ["confirmed", "packed", "shipped", "delivered"].indexOf(s);
}
