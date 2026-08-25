import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin";
import { getProducts, getPosts } from "@/lib/catalog";
import { writeRuntime, readRuntime } from "@/lib/runtime";
import type { Product } from "@/types";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({
    products: getProducts(),
    posts: getPosts(),
    orders: readRuntime("orders.json", []),
    subscribers: readRuntime("subscribers.json", []),
  });
}

export async function PUT(req: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  if (Array.isArray(body.products)) {
    writeRuntime("products.json", body.products as Product[]);
  }
  if (Array.isArray(body.posts)) {
    writeRuntime("posts.json", body.posts);
  }
  return NextResponse.json({ ok: true });
}
