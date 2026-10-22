import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Sans_Kannada, Outfit, Syne } from "next/font/google";
import { Providers } from "@/components/session";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit", display: "swap" });
const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap" });
const noto = Noto_Sans({
  subsets: ["latin", "devanagari"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-noto",
  display: "swap",
});
const kannada = Noto_Sans_Kannada({
  subsets: ["kannada"],
  weight: ["400", "600", "700"],
  variable: "--font-kannada",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#070910",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: { default: "TrendPulse — see the trend, leave with a hook", template: "%s · TrendPulse" },
  description: "TrendPulse turns a cached X snapshot into angles, hooks, and scripts for your niche. Opening the list does not call X.",
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${outfit.variable} ${syne.variable} ${noto.variable} ${kannada.variable} h-full antialiased`}>
      <body className="min-h-full">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
