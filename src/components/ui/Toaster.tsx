"use client";

import { useEffect, useState } from "react";

export function Toaster() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const onToast = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail;
      setMessage(detail);
    };
    window.addEventListener("bc-toast", onToast);
    return () => window.removeEventListener("bc-toast", onToast);
  }, []);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 2400);
    return () => clearTimeout(t);
  }, [message]);

  if (!message) return null;

  return (
    <div
      role="status"
      className="fixed bottom-24 left-1/2 z-[70] -translate-x-1/2 rounded-full bg-brown px-5 py-2.5 text-sm text-cream shadow-lg"
    >
      {message}
    </div>
  );
}

export function toast(message: string) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("bc-toast", { detail: message }));
}
