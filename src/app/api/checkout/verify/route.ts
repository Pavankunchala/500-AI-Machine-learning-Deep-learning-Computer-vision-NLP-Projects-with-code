import { NextResponse } from "next/server";
import crypto from "crypto";
import { createOrder } from "@/lib/orders";

export async function POST(req: Request) {
  const body = await req.json();
  const secret = process.env.RAZORPAY_KEY_SECRET;

  if (secret && body.razorpay_order_id) {
    const expected = crypto
      .createHmac("sha256", secret)
      .update(`${body.razorpay_order_id}|${body.razorpay_payment_id}`)
      .digest("hex");
    if (expected !== body.razorpay_signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }
  }

  const order = createOrder({
    customer: body.customer,
    items: body.items,
    coupon: body.coupon,
    paymentMethod: "razorpay",
    paymentStatus: "paid",
    shipping: body.shipping,
    discount: body.discount,
    codFee: 0,
    total: body.total,
  });
  return NextResponse.json({ id: order.id });
}
