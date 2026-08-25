"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/types";
import { CATEGORY_LABELS } from "@/lib/site";
import { useCart } from "@/context/CartContext";
import { toast } from "@/components/ui/Toaster";
import { inr, freshnessLabel, daysUntilBest, lastGrindingDate, formatDate } from "@/lib/format";
import { Stars } from "@/components/ui/Stars";
import { Button } from "@/components/ui/Button";
import { SITE } from "@/lib/site";
import { ReviewForm } from "@/components/shop/ReviewForm";

export function ProductDetail({
  product,
  related,
  reviews,
}: {
  product: Product;
  related: Product[];
  reviews: { id: string; name: string; city: string; rating: number; title: string; body: string; photo?: string; verified: boolean }[];
}) {
  const { add } = useCart();
  const router = useRouter();
  const [sku, setSku] = useState(product.variants[0].sku);
  const [qty, setQty] = useState(1);
  const [subscribe, setSubscribe] = useState(false);
  const [tab, setTab] = useState<"story" | "nutrition" | "reviews">("story");
  const [hero, setHero] = useState(product.gallery[0] ?? product.image);

  const variant = product.variants.find((v) => v.sku === sku) ?? product.variants[0];
  const price = subscribe ? Math.round(variant.price * (1 - SITE.subscribeDiscount)) : variant.price;

  const avg = useMemo(() => {
    if (!reviews.length) return product.rating;
    return reviews.reduce((n, r) => n + r.rating, 0) / reviews.length;
  }, [reviews, product.rating]);

  function addToCart() {
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        size: variant.size,
        sku: variant.sku,
        price: variant.price,
        mrp: variant.mrp,
        subscribe,
      },
      qty,
    );
    toast(subscribe ? "Added with Subscribe & Save" : "Added to cart");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-3xl bg-sand">
            <img src={hero} alt={product.name} className="aspect-square w-full object-cover" />
          </div>
          <div className="mt-3 flex gap-2">
            {product.gallery.map((src) => (
              <button
                key={src}
                type="button"
                onClick={() => setHero(src)}
                className={`h-20 w-20 overflow-hidden rounded-xl ring-2 ${hero === src ? "ring-terracotta" : "ring-transparent"}`}
              >
                <img src={src} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-terracotta">{CATEGORY_LABELS[product.category]} · {product.origin}</p>
          <h1 className="mt-2 font-serif text-4xl sm:text-5xl">{product.name}</h1>
          <p className="mt-3 text-lg text-muted">{product.tagline}</p>
          <div className="mt-3 flex items-center gap-2">
            <Stars value={avg} />
            <span className="text-sm text-muted">
              {avg.toFixed(1)} · {product.reviewCount} reviews
            </span>
          </div>
          <p className="mt-6">
            <span className="font-serif text-4xl">{inr(price)}</span>
            <span className="ml-2 text-muted">/ {variant.size}</span>
            {variant.mrp > variant.price && (
              <span className="ml-2 text-muted line-through">{inr(variant.mrp)}</span>
            )}
          </p>
          <fieldset className="mt-6">
            <legend className="text-sm font-medium">Pack size</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.sku}
                  type="button"
                  onClick={() => setSku(v.sku)}
                  className={`rounded-full px-4 py-2 text-sm ring-1 ${
                    sku === v.sku ? "bg-brown text-cream ring-brown" : "ring-sand hover:ring-wheat"
                  }`}
                >
                  {v.size} · {inr(v.price)}
                </button>
              ))}
            </div>
          </fieldset>
          <div className="mt-5 flex items-center gap-3">
            <label className="text-sm" htmlFor="qty">
              Quantity
            </label>
            <input
              id="qty"
              type="number"
              min={1}
              max={12}
              value={qty}
              onChange={(e) => setQty(Number(e.target.value))}
              className="h-10 w-20 rounded-full border border-sand bg-paper px-3"
            />
          </div>
          {product.subscribeEligible && (
            <label className="mt-5 flex cursor-pointer items-start gap-3 rounded-2xl border border-sand bg-paper p-4">
              <input
                type="checkbox"
                checked={subscribe}
                onChange={(e) => setSubscribe(e.target.checked)}
                className="mt-1"
              />
              <span>
                <span className="font-medium">Subscribe & save 10%</span>
                <span className="block text-sm text-muted">
                  Monthly delivery of this pack. Pause or cancel any time. Today: {inr(price)}.
                </span>
              </span>
            </label>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={addToCart}>Add to cart</Button>
            <Button
              variant="secondary"
              onClick={() => {
                addToCart();
                router.push("/checkout");
              }}
            >
              Order now
            </Button>
          </div>
          <p className="mt-6 rounded-2xl bg-sand/50 px-4 py-3 text-sm">
            {freshnessLabel()} Best within {daysUntilBest()} days · last ground {formatDate(lastGrindingDate().toISOString())}.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {product.badges.map((b) => (
              <li key={b} className="rounded-full bg-paper px-3 py-1 text-xs uppercase tracking-wider ring-1 ring-sand">
                {b}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-14">
        <div className="flex gap-4 border-b border-sand">
          {(
            [
              ["story", "The flour"],
              ["nutrition", "Nutrition"],
              ["reviews", `Reviews (${reviews.length})`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`border-b-2 pb-2 text-sm ${tab === id ? "border-terracotta" : "border-transparent text-muted"}`}
            >
              {label}
            </button>
          ))}
        </div>
        {tab === "story" && (
          <div className="max-w-3xl py-6 leading-relaxed text-muted">
            <p>{product.longDescription}</p>
            <p className="mt-4">
              <strong className="text-ink">Ingredients:</strong> {product.ingredients.join(", ")}.
            </p>
          </div>
        )}
        {tab === "nutrition" && (
          <div className="py-6">
            <p className="text-sm text-muted">Typical values per {product.nutrition.serving}</p>
            <table className="mt-3 w-full max-w-md text-sm">
              <tbody>
                {[
                  ["Energy", `${product.nutrition.energyKcal} kcal`],
                  ["Protein", `${product.nutrition.protein} g`],
                  ["Carbohydrate", `${product.nutrition.carbs} g`],
                  ["Dietary fibre", `${product.nutrition.fibre} g`],
                  ["Fat", `${product.nutrition.fat} g`],
                  ["Iron", `${product.nutrition.iron} mg`],
                ].map(([k, v]) => (
                  <tr key={k} className="border-b border-sand">
                    <th className="py-2 text-left font-medium">{k}</th>
                    <td className="py-2 text-right">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {tab === "reviews" && (
          <div className="grid gap-8 py-6 lg:grid-cols-5">
            <div className="lg:col-span-3 space-y-5">
              {reviews.map((r) => (
                <article key={r.id} className="rounded-2xl border border-sand bg-paper p-4">
                  <Stars value={r.rating} size="sm" />
                  <h3 className="mt-1 font-medium">{r.title}</h3>
                  <p className="mt-2 text-sm text-muted">{r.body}</p>
                  {r.photo && (
                    <img src={r.photo} alt={`Photo from ${r.name}`} className="mt-3 h-40 rounded-xl object-cover" />
                  )}
                  <p className="mt-2 text-xs text-muted">
                    {r.name}, {r.city}
                    {r.verified ? " · Verified" : ""}
                  </p>
                </article>
              ))}
            </div>
            <div className="lg:col-span-2">
              <ReviewForm productSlug={product.slug} />
            </div>
          </div>
        )}
      </div>

      {related.length > 0 && (
        <section className="mt-10">
          <h2 className="font-serif text-3xl">Alongside this bag</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            {related.map((p) => (
              <a key={p.slug} href={`/shop/${p.slug}`} className="flex gap-3 rounded-2xl border border-sand bg-paper p-3 hover:border-wheat">
                <img src={p.image} alt="" className="h-20 w-20 rounded-xl object-cover" />
                <span>
                  <span className="block font-medium">{p.name}</span>
                  <span className="text-sm text-muted">{inr(p.variants[0].price)}</span>
                </span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
