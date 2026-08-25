import { NextResponse } from "next/server";
import { createOrder } from "@/lib/orders";

export async function POST(req: Request) {
  const body = await req.json();
  if (!body.customer || !body.items?.length) {
    return NextResponse.json({ error: "Invalid order" }, { status: 400 });
  }
  const order = createOrder({
    customer: body.customer,
    items: body.items,
    coupon: body.coupon,
    paymentMethod: body.paymentMethod === "cod" ? "cod" : "razorpay",
    paymentStatus: body.paymentStatus === "paid" ? "paid" : "pending",
    shipping: body.shipping,
    discount: body.discount,
    codFee: body.codFee,
    total: body.total,
  });
  return NextResponse.json({ id: order.id, order });
}
