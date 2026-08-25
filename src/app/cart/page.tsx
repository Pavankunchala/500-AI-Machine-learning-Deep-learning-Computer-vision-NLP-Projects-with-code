"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { inr } from "@/lib/format";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/site";

export default function CartPage() {
  const { items, setQty, remove, toggleSubscribe, subtotal, subscribeSavings } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="font-serif text-4xl">Your jhola is empty</h1>
        <p className="mt-3 text-muted">The mill has atta waiting. Start with the classic 5 kg — it is what most kitchens reorder.</p>
        <div className="mt-6">
          <Button href="/shop">Shop atta</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-serif text-5xl">Cart</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-3">
        <ul className="space-y-4 lg:col-span-2">
          {items.map((item) => (
            <li key={item.sku} className="flex gap-4 rounded-2xl border border-sand bg-paper p-4">
              <img src={item.image} alt="" className="h-24 w-24 rounded-xl object-cover" />
              <div className="flex-1">
                <Link href={`/shop/${item.slug}`} className="font-medium hover:text-terracotta">
                  {item.name}
                </Link>
                <p className="text-sm text-muted">{item.size}</p>
                <label className="mt-2 flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={item.subscribe} onChange={() => toggleSubscribe(item.sku)} />
                  Subscribe & save 10%
                </label>
                <div className="mt-2 flex items-center gap-3">
                  <input
                    type="number"
                    min={1}
                    value={item.qty}
                    onChange={(e) => setQty(item.sku, Number(e.target.value))}
                    className="h-9 w-16 rounded-full border border-sand px-2"
                    aria-label={`Quantity for ${item.name}`}
                  />
                  <button type="button" className="text-sm text-terracotta" onClick={() => remove(item.sku)}>
                    Remove
                  </button>
                </div>
              </div>
              <p className="font-medium">
                {inr(
                  Math.round(item.price * item.qty * (item.subscribe ? 1 - SITE.subscribeDiscount : 1)),
                )}
              </p>
            </li>
          ))}
        </ul>
        <aside className="h-fit rounded-2xl border border-sand bg-paper p-6">
          <h2 className="font-serif text-2xl">Summary</h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{inr(subtotal + subscribeSavings)}</dd>
            </div>
            {subscribeSavings > 0 && (
              <div className="flex justify-between text-terracotta">
                <dt>Subscribe savings</dt>
                <dd>−{inr(subscribeSavings)}</dd>
              </div>
            )}
            <div className="flex justify-between text-muted">
              <dt>Shipping</dt>
              <dd>Calculated at checkout</dd>
            </div>
          </dl>
          <p className="mt-4 font-serif text-3xl">{inr(subtotal)}</p>
          <Button href="/checkout" className="mt-5 w-full">
            Checkout
          </Button>
          <p className="mt-3 text-xs text-muted">UPI, cards, netbanking, COD. Free shipping over {inr(SITE.freeShippingOver)}.</p>
        </aside>
      </div>
    </div>
  );
}
