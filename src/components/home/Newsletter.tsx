"use client";

import { useState } from "react";
import { SITE } from "@/lib/site";
import { toast } from "@/components/ui/Toaster";

export function Newsletter() {
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState(true);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/newsletter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, whatsapp }),
    });
    if (res.ok) {
      localStorage.setItem("bc-welcome", SITE.welcomeCoupon);
      setDone(true);
      toast(`Use ${SITE.welcomeCoupon} for 10% off your first order`);
    }
  }

  return (
    <section className="relative overflow-hidden">
      <img
        src="/images/wheat-field.webp"
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-ink/70" />
      <div className="relative mx-auto max-w-xl px-4 py-20 text-center text-cream">
        <p className="text-xs uppercase tracking-[0.22em] text-wheat">The mill letter</p>
        <h2 className="mt-2 font-serif text-4xl">10% off your first sack</h2>
        <p className="mt-3 text-cream/80">
          Grinding notes, a roti recipe, and the {SITE.welcomeCoupon} coupon — once, by email or WhatsApp. No weekly noise.
        </p>
        {done ? (
          <p className="mt-6 rounded-full bg-cream/10 px-4 py-3 text-sm">
            You are on the list. Code <strong>{SITE.welcomeCoupon}</strong> is waiting at checkout.
          </p>
        ) : (
          <form onSubmit={submit} className="mt-6 flex flex-col gap-3">
            <div className="flex flex-col gap-2 sm:flex-row">
              <label className="sr-only" htmlFor="nl-email">
                Email
              </label>
              <input
                id="nl-email"
                required
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="h-12 flex-1 rounded-full bg-cream px-5 text-ink outline-none"
              />
              <button
                type="submit"
                className="h-12 rounded-full bg-terracotta px-6 text-sm font-medium"
              >
                Send my code
              </button>
            </div>
            <label className="flex items-center justify-center gap-2 text-sm text-cream/80">
              <input
                type="checkbox"
                checked={whatsapp}
                onChange={(e) => setWhatsapp(e.target.checked)}
              />
              Also opt in on WhatsApp for grinding-day notes
            </label>
          </form>
        )}
      </div>
    </section>
  );
}
