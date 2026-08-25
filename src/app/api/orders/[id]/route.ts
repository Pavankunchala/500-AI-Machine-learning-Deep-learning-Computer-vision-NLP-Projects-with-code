import { NextResponse } from "next/server";
import { readRuntime } from "@/lib/runtime";
import type { Order } from "@/types";

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const url = new URL(req.url);
  const phone = (url.searchParams.get("phone") ?? "").replace(/\D/g, "");
  const orders = readRuntime<Order[]>("orders.json", []);
  const order = orders.find((o) => o.id.toLowerCase() === id.toLowerCase());
  if (!order) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const orderPhone = order.customer.phone.replace(/\D/g, "");
  if (phone && !orderPhone.endsWith(phone) && !phone.endsWith(orderPhone.slice(-10))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(order);
}
