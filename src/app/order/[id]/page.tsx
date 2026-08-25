import { notFound } from "next/navigation";
import { readRuntime } from "@/lib/runtime";
import type { Order } from "@/types";
import { inr, formatDate } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

export default async function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const orders = readRuntime<Order[]>("orders.json", []);
  const order = orders.find((o) => o.id === id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16">
      <p className="text-xs uppercase tracking-[0.2em] text-terracotta">Order confirmed</p>
      <h1 className="mt-2 font-serif text-4xl">The mill has your order.</h1>
      <p className="mt-3 text-muted">
        {order.id} · {formatDate(order.createdAt)}. A confirmation has been recorded for {order.customer.email}
        {order.paymentMethod === "cod" ? " · Pay cash on delivery." : " · Payment received."}
      </p>
      <div className="mt-8 rounded-2xl border border-sand bg-paper p-6">
        <h2 className="font-serif text-2xl">Items</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {order.items.map((i) => (
            <li key={i.sku} className="flex justify-between">
              <span>
                {i.name} · {i.size} × {i.qty}
              </span>
              <span>{inr(i.price * i.qty)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 font-serif text-3xl">{inr(order.total)}</p>
        <p className="mt-2 text-sm text-muted">{order.trackingNote}</p>
      </div>
      <div className="mt-8 rounded-2xl bg-sand/50 p-5 text-sm leading-relaxed">
        <p className="font-medium">What we would have emailed</p>
        <p className="mt-2 text-muted">
          Namaste {order.customer.name}, your stone-ground order {order.id} is confirmed. Track it any time at {SITE.url}/track with this ID and your phone. FSSAI {SITE.fssai}.
        </p>
      </div>
      <div className="mt-8 flex gap-3">
        <Button href="/track">Track order</Button>
        <Button href="/shop" variant="ghost">
          Continue shopping
        </Button>
      </div>
    </div>
  );
}
