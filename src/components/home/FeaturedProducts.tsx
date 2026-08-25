"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import type { Product } from "@/types";
import { Button } from "@/components/ui/Button";

export function FeaturedProducts({ products }: { products: Product[] }) {
  const scroller = useRef<HTMLDivElement>(null);

  function scroll(dir: number) {
    scroller.current?.scrollBy({ left: dir * 280, behavior: "smooth" });
  }

  return (
    <section className="bg-sand/40 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-terracotta">From the mill</p>
            <h2 className="mt-2 font-serif text-4xl sm:text-5xl">Flours we grind this week</h2>
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              onClick={() => scroll(-1)}
              className="rounded-full border border-brown/20 p-2"
              aria-label="Previous products"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => scroll(1)}
              className="rounded-full border border-brown/20 p-2"
              aria-label="Next products"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
        <div
          ref={scroller}
          className="no-scrollbar mt-8 flex snap-x gap-5 overflow-x-auto pb-4"
        >
          {products.map((p) => (
            <div key={p.id} className="w-[260px] shrink-0 snap-start sm:w-[280px]">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
        <div className="mt-8">
          <Button href="/shop" variant="secondary">
            Browse the shop
          </Button>
        </div>
      </div>
    </section>
  );
}
