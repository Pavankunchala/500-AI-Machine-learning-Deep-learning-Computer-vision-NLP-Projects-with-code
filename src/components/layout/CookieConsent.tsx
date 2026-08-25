"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";

const KEY = "bc-cookie-consent";

function subscribe(cb: () => void) {
  window.addEventListener("bc-consent", cb);
  return () => window.removeEventListener("bc-consent", cb);
}

export function CookieConsent() {
  const consent = useSyncExternalStore(
    subscribe,
    () => localStorage.getItem(KEY),
    () => "ssr",
  );

  if (consent === "ssr" || consent === "all" || consent === "essential") return null;

  function choose(value: "all" | "essential") {
    localStorage.setItem(KEY, value);
    window.dispatchEvent(new Event("bc-consent"));
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-sand bg-paper/95 p-4 shadow-[0_-8px_30px_rgba(42,24,16,0.08)] backdrop-blur md:bottom-6 md:left-6 md:right-auto md:max-w-md md:rounded-2xl md:border">
      <p className="font-serif text-lg">A small note on cookies</p>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        We use essential cookies to run your cart, and — only if you agree — analytics to understand which stories and flours people return for.{" "}
        <Link href="/privacy" className="underline">
          Privacy
        </Link>
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={() => choose("all")} className="rounded-full bg-brown px-4 py-2 text-sm text-cream">
          Accept analytics
        </button>
        <button type="button" onClick={() => choose("essential")} className="rounded-full border border-brown/20 px-4 py-2 text-sm">
          Essential only
        </button>
      </div>
    </div>
  );
}
