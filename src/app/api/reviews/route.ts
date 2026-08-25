import { NextResponse } from "next/server";
import { appendRuntime } from "@/lib/runtime";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.name || !body.body || !body.productSlug) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  let photo: string | undefined;
  if (typeof body.photo === "string" && body.photo.startsWith("data:image")) {
    const match = body.photo.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (match) {
      const ext = match[1].includes("png") ? "png" : "jpg";
      const buf = Buffer.from(match[2], "base64");
      const dir = path.join(process.cwd(), "public", "uploads", "reviews");
      await mkdir(dir, { recursive: true });
      const filename = `${Date.now()}-${Math.floor(Math.random() * 1e4)}.${ext}`;
      await writeFile(path.join(dir, filename), buf);
      photo = `/uploads/reviews/${filename}`;
    }
  }

  const review = {
    id: `u-${Date.now()}`,
    productSlug: body.productSlug,
    name: String(body.name).slice(0, 80),
    city: String(body.city ?? "India").slice(0, 80),
    rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
    title: String(body.title ?? "A note from the kitchen").slice(0, 120),
    body: String(body.body).slice(0, 1200),
    date: new Date().toISOString(),
    verified: false,
    photo,
  };
  appendRuntime("reviews-extra.json", review);
  return NextResponse.json({ ok: true, review });
}
