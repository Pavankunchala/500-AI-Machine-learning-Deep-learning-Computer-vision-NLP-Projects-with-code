"use client";

import { useMemo, useState } from "react";
import type { Product } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";
import { CATEGORY_LABELS } from "@/lib/site";

const sizes = ["All", "500 g", "1 kg", "5 kg", "10 kg"];
const types = ["All", "wheat", "millet", "pulse", "multigrain"] as const;

export function ShopGrid({ products }: { products: Product[] }) {
  const [type, setType] = useState<(typeof types)[number]>("All");
  const [size, setSize] = useState("All");
  const [maxPrice, setMaxPrice] = useState(800);
  const [sort, setSort] = useState("featured");

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      if (type !== "All" && p.category !== type) return false;
      if (size !== "All" && !p.variants.some((v) => v.size === size)) return false;
      const cheapest = Math.min(...p.variants.map((v) => v.price));
      if (cheapest > maxPrice) return false;
      return true;
    });
    if (sort === "price-asc") list = [...list].sort((a, b) => a.variants[0].price - b.variants[0].price);
    if (sort === "price-desc") list = [...list].sort((a, b) => b.variants[0].price - a.variants[0].price);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    return list;
  }, [products, type, size, maxPrice, sort]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="max-w-2xl">
        <p className="text-xs uppercase tracking-[0.22em] text-terracotta">Shop</p>
        <h1 className="mt-2 font-serif text-5xl">Flour, as it leaves the mill</h1>
        <p className="mt-3 text-muted">Wheat, millets, besan and dalia — packed the week they are ground. Subscribe on any bag for 10% off.</p>
      </header>
      <div className="mt-8 flex flex-col gap-6 lg:flex-row">
        <aside className="w-full shrink-0 space-y-5 rounded-2xl border border-sand bg-paper p-5 lg:w-64">
          <fieldset>
            <legend className="text-sm font-medium">Type</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {types.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-full px-3 py-1 text-sm ${type === t ? "bg-brown text-cream" : "bg-sand/60"}`}
                >
                  {t === "All" ? "All" : CATEGORY_LABELS[t]}
                </button>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-sm font-medium">Pack size</legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {sizes.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSize(s)}
                  className={`rounded-full px-3 py-1 text-sm ${size === s ? "bg-brown text-cream" : "bg-sand/60"}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </fieldset>
          <label className="block text-sm font-medium">
            Max price · ₹{maxPrice}
            <input
              type="range"
              min={60}
              max={800}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="mt-2 w-full accent-terracotta"
            />
          </label>
        </aside>
        <div className="flex-1">
          <div className="mb-4 flex items-center justify-between text-sm">
            <p className="text-muted">{filtered.length} flours</p>
            <label>
              Sort{" "}
              <select value={sort} onChange={(e) => setSort(e.target.value)} className="rounded-lg border border-sand bg-paper px-2 py-1">
                <option value="featured">Featured</option>
                <option value="price-asc">Price · low</option>
                <option value="price-desc">Price · high</option>
                <option value="rating">Rating</option>
              </select>
            </label>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
