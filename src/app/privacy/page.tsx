import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 leading-relaxed text-muted">
      <h1 className="font-serif text-5xl text-ink">Privacy</h1>
      <p className="mt-6">
        We collect what we need to mill and deliver: name, address, phone, email, and order contents. Payments are processed by Razorpay; we do not store card numbers. Newsletter and WhatsApp opt-ins are separate from checkout and can be withdrawn by writing to hello@bharatiyachakki.com.
      </p>
      <p className="mt-4">
        Analytics cookies load only after you accept them. Essential cookies keep your cart. We do not sell addresses. Reviews with photos are published on this site if you submit them.
      </p>
    </article>
  );
}
