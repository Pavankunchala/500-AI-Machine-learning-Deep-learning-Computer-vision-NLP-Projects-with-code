import { NextRequest, NextResponse } from "next/server";
import { searchProducts } from "@/lib/catalog";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const products = searchProducts(q).slice(0, 8).map((p) => ({
    slug: p.slug,
    name: p.name,
    tagline: p.tagline,
    image: p.image,
    price: p.variants[0].price,
  }));
  return NextResponse.json({ products });
}
