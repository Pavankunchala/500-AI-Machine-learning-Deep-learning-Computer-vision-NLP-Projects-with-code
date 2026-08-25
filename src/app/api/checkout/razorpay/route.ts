import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const key = process.env.RAZORPAY_KEY_ID;
  const secret = process.env.RAZORPAY_KEY_SECRET;
  const amountPaise = Math.round(Number(body.total ?? 0) * 100);

  if (!key || !secret) {
    return NextResponse.json({
      demo: true,
      amount: amountPaise,
      key: null,
      orderId: `demo_${Date.now()}`,
    });
  }

  const auth = Buffer.from(`${key}:${secret}`).toString("base64");
  const res = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency: "INR",
      receipt: `bc_${Date.now()}`,
    }),
  });
  const data = await res.json();
  return NextResponse.json({
    demo: false,
    key,
    amount: data.amount,
    orderId: data.id,
  });
}
