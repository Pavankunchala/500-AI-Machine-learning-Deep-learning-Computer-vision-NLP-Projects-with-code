"use client";

import { CartProvider } from "@/context/CartContext";
import { CookieConsent } from "@/components/layout/CookieConsent";
import { WhatsAppButton } from "@/components/layout/WhatsAppButton";
import { Analytics } from "@/components/layout/Analytics";
import { Toaster } from "@/components/ui/Toaster";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <WhatsAppButton />
      <CookieConsent />
      <Analytics />
      <Toaster />
    </CartProvider>
  );
}
