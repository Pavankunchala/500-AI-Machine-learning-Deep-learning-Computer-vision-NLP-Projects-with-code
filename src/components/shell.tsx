"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useSession } from "./session";

const LINKS = [
  { href: "/radar", label: "List" },
  { href: "/board", label: "Board" },
  { href: "/alerts", label: "Alerts" },
  { href: "/leaderboard", label: "Ranks" },
  { href: "/profile", label: "You" },
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user } = useSession();
  return (
    <div className="relative mx-auto min-h-screen w-full max-w-5xl px-4 pb-28 md:pb-16">
      <header className="sticky top-0 z-20 -mx-4 mb-6 flex items-center justify-between gap-4 border-b border-white/5 bg-[#070910]/80 px-4 py-4 backdrop-blur-md">
        <Link href="/radar" className="font-display text-lg tracking-tight">
          TrendPulse
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-full px-3 py-1.5 text-sm ${pathname.startsWith(link.href) ? "bg-white/10 text-ink" : "text-muted hover:text-ink"}`}
            >
              {link.label}
            </Link>
          ))}
          {user?.role === "admin" ? (
            <Link href="/admin" className={`rounded-full px-3 py-1.5 text-sm ${pathname.startsWith("/admin") ? "bg-white/10" : "text-muted"}`}>
              Usage
            </Link>
          ) : null}
        </nav>
        <div className="text-right text-xs text-muted">
          <div className="font-display text-sm text-mint">{user?.streak ?? 0} day streak</div>
          <div>{user?.points ?? 0} idea points</div>
        </div>
      </header>
      {children}
      <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-white/10 bg-[#070910]/95 px-2 py-2 backdrop-blur md:hidden">
        {LINKS.map((link) => (
          <Link key={link.href} href={link.href} className={`rounded-xl py-2 text-center text-xs ${pathname.startsWith(link.href) ? "text-mint" : "text-muted"}`}>
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
