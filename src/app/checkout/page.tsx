"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { inr } from "@/lib/format";
import { COUPONS, quoteShipping } from "@/lib/shipping";
import { SITE } from "@/lib/site";
import { toast } from "@/components/ui/Toaster";

declare global {
  interface Window {
    Razorpay?: new (opts: Record<string, unknown>) => { open: () => void };
  }
}

export default function CheckoutPage() {
  const { items, subtotal, subscribeSavings, clear } = useCart();
  const router = useRouter();
  const [pincode, setPincode] = useState("");
  const welcome = useSyncExternalStore(
    () => () => {},
    () => localStorage.getItem("bc-welcome") ?? "",
    () => "",
  );
  const [coupon, setCoupon] = useState("");
  const couponValue = coupon || welcome;
  const [applied, setApplied] = useState<string | undefined>();
  const [method, setMethod] = useState<"razorpay" | "cod">("razorpay");
  const [busy, setBusy] = useState(false);

  const discountRate = applied ? COUPONS[applied] ?? 0 : 0;
  const discount = Math.round(subtotal * discountRate);
  const afterDiscount = Math.max(0, subtotal - discount);
  const ship = useMemo(() => quoteShipping(pincode, afterDiscount), [pincode, afterDiscount]);
  const codFee = method === "cod" ? ship.codFee(afterDiscount) : 0;
  const total = afterDiscount + (pincode.length === 6 ? ship.amount : 0) + codFee;

  function applyCoupon() {
    const code = couponValue.trim().toUpperCase();
    if (COUPONS[code]) {
      setApplied(code);
      toast(`${code} applied`);
    } else toast("That code is not in the mill book");
  }

  async function place(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!items.length) return;
    if (pincode.length !== 6) {
      toast("Enter a 6-digit PIN for shipping");
      return;
    }
    setBusy(true);
    const form = new FormData(e.currentTarget);
    const customer = {
      name: String(form.get("name")),
      email: String(form.get("email")),
      phone: String(form.get("phone")),
      address: String(form.get("address")),
      city: String(form.get("city")),
      state: String(form.get("state")),
      pincode,
    };

    const payload = {
      customer,
      items,
      coupon: applied,
      paymentMethod: method,
      shipping: ship.amount,
      discount,
      codFee,
      total,
    };

    if (method === "razorpay") {
      const orderRes = await fetch("/api/checkout/razorpay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const order = await orderRes.json();
      if (order.demo) {
        const confirm = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...payload, paymentStatus: "paid" }),
        });
        const data = await confirm.json();
        clear();
        router.push(`/order/${data.id}`);
        return;
      }
      await loadRazorpay();
      const rzp = new window.Razorpay!({
        key: order.key,
        amount: order.amount,
        currency: "INR",
        name: SITE.name,
        order_id: order.orderId,
        prefill: { name: customer.name, email: customer.email, contact: customer.phone },
        handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
          const verify = await fetch("/api/checkout/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...payload, ...response, paymentStatus: "paid" }),
          });
          const data = await verify.json();
          clear();
          router.push(`/order/${data.id}`);
        },
      });
      rzp.open();
      setBusy(false);
      return;
    }

    const confirm = await fetch("/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...payload, paymentStatus: "pending" }),
    });
    const data = await confirm.json();
    clear();
    router.push(`/order/${data.id}`);
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg px-4 py-24 text-center">
        <h1 className="font-serif text-4xl">Nothing to check out</h1>
        <Link href="/shop" className="mt-4 inline-block text-terracotta underline">
          Return to the shop
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="font-serif text-5xl">Checkout</h1>
      <form onSubmit={place} className="mt-8 grid gap-10 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <h2 className="font-serif text-2xl">Where should the flour go?</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input name="name" required placeholder="Full name" className="h-11 rounded-xl border border-sand px-3" />
            <input name="phone" required placeholder="Phone" className="h-11 rounded-xl border border-sand px-3" />
            <input name="email" type="email" required placeholder="Email for confirmation" className="h-11 rounded-xl border border-sand px-3 sm:col-span-2" />
            <input name="address" required placeholder="Address" className="h-11 rounded-xl border border-sand px-3 sm:col-span-2" />
            <input name="city" required placeholder="City" className="h-11 rounded-xl border border-sand px-3" />
            <input name="state" required placeholder="State" className="h-11 rounded-xl border border-sand px-3" />
            <input
              required
              placeholder="PIN code"
              value={pincode}
              onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              className="h-11 rounded-xl border border-sand px-3"
            />
          </div>
          {pincode.length === 6 && (
            <p className="text-sm text-muted">
              {ship.label} · {inr(ship.amount)} · {ship.eta}
            </p>
          )}
          <fieldset className="space-y-2">
            <legend className="font-medium">Payment</legend>
            <label className="flex items-center gap-2 rounded-xl border border-sand p-3">
              <input type="radio" name="pay" checked={method === "razorpay"} onChange={() => setMethod("razorpay")} />
              UPI / Cards / Netbanking (Razorpay)
            </label>
            <label className="flex items-center gap-2 rounded-xl border border-sand p-3">
              <input type="radio" name="pay" checked={method === "cod"} onChange={() => setMethod("cod")} />
              Cash on delivery {codFee ? `(+${inr(codFee)} under ₹500)` : ""}
            </label>
          </fieldset>
        </div>
        <aside className="h-fit rounded-2xl border border-sand bg-paper p-6 lg:col-span-2">
          <h2 className="font-serif text-2xl">Order</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {items.map((i) => (
              <li key={i.sku} className="flex justify-between gap-2">
                <span>
                  {i.name} · {i.size} × {i.qty}
                  {i.subscribe ? " (sub)" : ""}
                </span>
                <span>{inr(i.price * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex gap-2">
            <input
              value={couponValue}
              onChange={(e) => setCoupon(e.target.value)}
              placeholder="Coupon"
              className="h-10 flex-1 rounded-full border border-sand px-3 text-sm"
            />
            <button type="button" onClick={applyCoupon} className="rounded-full border border-brown/20 px-4 text-sm">
              Apply
            </button>
          </div>
          <dl className="mt-4 space-y-1 text-sm">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{inr(subtotal + subscribeSavings)}</dd>
            </div>
            {subscribeSavings > 0 && (
              <div className="flex justify-between text-terracotta">
                <dt>Subscribe</dt>
                <dd>−{inr(subscribeSavings)}</dd>
              </div>
            )}
            {discount > 0 && (
              <div className="flex justify-between text-terracotta">
                <dt>{applied}</dt>
                <dd>−{inr(discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{pincode.length === 6 ? inr(ship.amount) : "—"}</dd>
            </div>
            {codFee > 0 && (
              <div className="flex justify-between">
                <dt>COD fee</dt>
                <dd>{inr(codFee)}</dd>
              </div>
            )}
          </dl>
          <p className="mt-4 font-serif text-3xl">{inr(total)}</p>
          <button disabled={busy} className="mt-5 h-12 w-full rounded-full bg-terracotta text-cream disabled:opacity-50">
            {busy ? "Placing…" : method === "cod" ? "Place COD order" : "Pay securely"}
          </button>
          <p className="mt-3 text-xs text-muted">FSSAI {SITE.fssai} · Encrypted checkout · Freshness guarantee</p>
        </aside>
      </form>
    </div>
  );
}

function loadRazorpay() {
  return new Promise<void>((resolve, reject) => {
    if (window.Razorpay) return resolve();
    const s = document.createElement("script");
    s.src = "https://checkout.razorpay.com/v1/checkout.js";
    s.onload = () => resolve();
    s.onerror = () => reject();
    document.body.appendChild(s);
  });
}
