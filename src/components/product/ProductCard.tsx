import Link from "next/link";
import { Stars } from "@/components/ui/Stars";
import { inr } from "@/lib/format";
import type { Product } from "@/types";
import { CATEGORY_LABELS } from "@/lib/site";

export function ProductCard({ product }: { product: Product }) {
  const v = product.variants[0];
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-sand bg-paper shadow-[0_10px_30px_-24px_rgba(42,24,16,0.5)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-24px_rgba(42,24,16,0.55)]">
      <Link href={`/shop/${product.slug}`} className="relative block aspect-square overflow-hidden bg-sand">
        <img
          src={product.image}
          alt={`${product.name} — ${product.tagline}`}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
          loading="lazy"
        />
        <span className="absolute left-3 top-3 rounded-full bg-cream/90 px-2.5 py-1 text-[11px] uppercase tracking-wider text-brown">
          {CATEGORY_LABELS[product.category]}
        </span>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <Stars value={product.rating} size="sm" />
          <span className="text-xs text-muted">({product.reviewCount})</span>
        </div>
        <h3 className="mt-2 font-serif text-xl leading-tight">
          <Link href={`/shop/${product.slug}`} className="hover:text-terracotta">
            {product.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 flex-1 text-sm text-muted">{product.tagline}</p>
        <div className="mt-4 flex items-end justify-between">
          <p>
            <span className="text-lg font-medium">{inr(v.price)}</span>
            <span className="ml-1 text-sm text-muted">/ {v.size}</span>
          </p>
          {v.mrp > v.price && (
            <span className="text-sm text-muted line-through">{inr(v.mrp)}</span>
          )}
        </div>
      </div>
    </article>
  );
}
