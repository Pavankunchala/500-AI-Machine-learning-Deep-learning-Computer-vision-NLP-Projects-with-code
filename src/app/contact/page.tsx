import type { Metadata } from "next";
import { getFaqs, getStores } from "@/lib/catalog";
import { ContactClient } from "@/components/contact/ContactClient";

export const metadata: Metadata = {
  title: "Contact & store locator",
  description: "Write to the mill, chat on WhatsApp, or pick up flour in Jaipur, Delhi and Mumbai.",
};

export default function ContactPage() {
  return <ContactClient faqs={getFaqs()} stores={getStores()} />;
}
