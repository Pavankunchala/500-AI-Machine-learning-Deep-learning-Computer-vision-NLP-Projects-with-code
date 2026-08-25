"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { NAV, SITE } from "@/lib/site";
import { useCart } from "@/context/CartContext";
import { SearchDialog } from "@/components/layout/SearchDialog";

export function Header() {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearch(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-full focus:bg-cream focus:px-4 focus:py-2"
      >
        Skip to content
      </a>
      <div className="bg-brown text-cream">
        <p className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-x-4 gap-y-1 px-4 py-2 text-center text-[11px] tracking-[0.14em] uppercase sm:justify-between sm:text-xs">
          <span>Since {SITE.founded} · Family mill, Jaipur</span>
          <span className="hidden sm:inline">FSSAI {SITE.fssai}</span>
          <span>Free shipping over ₹{SITE.freeShippingOver}</span>
        </p>
      </div>
      <header
        className={`sticky top-0 z-50 border-b transition ${
          scrolled
            ? "border-sand/80 bg-cream/90 shadow-sm backdrop-blur-md"
            : "border-transparent bg-cream/80 backdrop-blur-sm"
        }`}
      >
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
          <button
            type="button"
            className="rounded-full p-2 text-brown lg:hidden"
            aria-label="Open menu"
            onClick={() => setOpen(true)}
          >
            <Menu size={22} />
          </button>
          <Link href="/" className="flex items-center gap-2 text-brown">
            <img src="/logo.svg" alt="" className="h-9 w-9" />
            <span className="font-serif text-xl leading-none tracking-tight sm:text-2xl">
              Bharatiya Chakki
            </span>
          </Link>
          <nav className="ml-6 hidden items-center gap-6 text-sm text-muted lg:flex" aria-label="Primary">
            {NAV.filter((n) => n.href !== "/").map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="transition hover:text-terracotta"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearch(true)}
              className="rounded-full p-2 text-brown hover:bg-sand/70"
              aria-label="Search products"
            >
              <Search size={20} />
            </button>
            <Link
              href="/cart"
              className="relative rounded-full p-2 text-brown hover:bg-sand/70"
              aria-label={`Cart, ${count} items`}
            >
              <ShoppingBag size={20} />
              {count > 0 && (
                <span className="absolute right-0.5 top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-terracotta px-1 text-[10px] font-semibold text-cream">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {open && (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button
            className="absolute inset-0 bg-ink/40"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
          <div className="absolute left-0 top-0 flex h-full w-[80%] max-w-sm flex-col bg-cream p-6 shadow-xl">
            <div className="mb-8 flex items-center justify-between">
              <span className="font-serif text-2xl">Menu</span>
              <button type="button" aria-label="Close" onClick={() => setOpen(false)}>
                <X />
              </button>
            </div>
            <nav className="flex flex-col gap-4 text-lg">
              {NAV.map((item) => (
                <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                  {item.label}
                </Link>
              ))}
            </nav>
            <p className="mt-auto text-sm text-muted">
              WhatsApp us on the green button — millers, not a call centre.
            </p>
          </div>
        </div>
      )}

      {search && <SearchDialog onClose={() => setSearch(false)} />}
    </>
  );
}
