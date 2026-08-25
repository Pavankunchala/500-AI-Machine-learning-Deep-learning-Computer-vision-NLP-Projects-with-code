import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "How it's made",
  description:
    "A visual explainer of stone-grinding versus conventional roller milling — and why chakki atta keeps more of the wheat.",
};

export default function HowItsMadeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
