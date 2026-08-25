import { NextResponse } from "next/server";
import { quoteShipping } from "@/lib/shipping";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const pin = url.searchParams.get("pin") ?? "";
  const subtotal = Number(url.searchParams.get("subtotal") ?? 0);
  return NextResponse.json(quoteShipping(pin, subtotal));
}
