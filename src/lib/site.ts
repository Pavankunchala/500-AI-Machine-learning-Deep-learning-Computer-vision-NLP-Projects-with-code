import site from "@/data/site.json";

export const SITE = site;

export const NAV = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/how-its-made", label: "How it's made" },
  { href: "/about", label: "Our story" },
  { href: "/blog", label: "Journal" },
  { href: "/reviews", label: "Reviews" },
  { href: "/contact", label: "Contact" },
] as const;

export const CATEGORY_LABELS: Record<string, string> = {
  wheat: "Wheat",
  millet: "Millets",
  pulse: "Pulses",
  multigrain: "Multigrain",
};

export const WHATSAPP_URL = `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(
  "Namaste — I have a question about Bharatiya Chakki atta.",
)}`;
