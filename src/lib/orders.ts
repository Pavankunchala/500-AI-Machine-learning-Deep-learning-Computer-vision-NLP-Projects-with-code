import type { CartItem, Order } from "@/types";
import { newOrderId } from "@/lib/format";
import { COUPONS, quoteShipping } from "@/lib/shipping";
import { SITE } from "@/lib/site";
import { appendRuntime } from "@/lib/runtime";

export function createOrder(input: {
  customer: Order["customer"];
  items: CartItem[];
  coupon?: string;
  paymentMethod: "razorpay" | "cod";
  paymentStatus: "paid" | "pending" | "failed";
  shipping?: number;
  discount?: number;
  codFee?: number;
  total?: number;
}): Order {
  const raw = input.items.reduce((n, i) => n + i.price * i.qty, 0);
  const subscribeSavings = input.items.reduce(
    (n, i) => n + (i.subscribe ? i.price * i.qty * SITE.subscribeDiscount : 0),
    0,
  );
  const subtotal = raw - subscribeSavings;
  const discount =
    input.discount ??
    Math.round(subtotal * (input.coupon ? COUPONS[input.coupon] ?? 0 : 0));
  const ship =
    input.shipping ??
    quoteShipping(input.customer.pincode, subtotal - discount).amount;
  const codFee = input.codFee ?? 0;
  const total = input.total ?? subtotal - discount + ship + codFee;
  const id = newOrderId();

  const order: Order = {
    id,
    createdAt: new Date().toISOString(),
    status: "confirmed",
    paymentMethod: input.paymentMethod,
    paymentStatus: input.paymentStatus,
    customer: input.customer,
    items: input.items,
    subtotal,
    discount,
    shipping: ship,
    codFee,
    total,
    coupon: input.coupon,
    trackingNote:
      "Confirmed at the mill. Packed within 24 hours, then handed to courier. Typical metros: 2–4 days.",
  };
  appendRuntime("orders.json", order);
  return order;
}
