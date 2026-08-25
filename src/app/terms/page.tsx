import type { Metadata } from "next";

export const metadata: Metadata = { title: "Terms" };

export default function TermsPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 leading-relaxed text-muted">
      <h1 className="font-serif text-5xl text-ink">Terms of sale</h1>
      <p className="mt-6">
        Flour is a fresh food. Use within the window printed on the pack. Damaged or off-smelling packs are replaced or refunded within 7 days if you write to us with a photo. Subscriptions discount 10% and may be paused from your order email. Prices include GST as applicable. Demo checkouts without Razorpay keys simulate payment and do not charge a card.
      </p>
    </article>
  );
}
