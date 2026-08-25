"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";
import type { CartItem } from "@/types";
import { SITE } from "@/lib/site";

type CartContextValue = {
  items: CartItem[];
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  remove: (sku: string) => void;
  setQty: (sku: string, qty: number) => void;
  toggleSubscribe: (sku: string) => void;
  clear: () => void;
  count: number;
  subtotal: number;
  subscribeSavings: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const KEY = "bc-cart-v1";
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function readCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  emit();
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(
    (onStoreChange) => {
      listeners.add(onStoreChange);
      return () => listeners.delete(onStoreChange);
    },
    readCart,
    () => [] as CartItem[],
  );

  const add = useCallback((item: Omit<CartItem, "qty">, qty = 1) => {
    const prev = readCart();
    const existing = prev.find((i) => i.sku === item.sku);
    writeCart(
      existing
        ? prev.map((i) =>
            i.sku === item.sku ? { ...i, qty: i.qty + qty, subscribe: i.subscribe || item.subscribe } : i,
          )
        : [...prev, { ...item, qty }],
    );
  }, []);

  const remove = useCallback((sku: string) => {
    writeCart(readCart().filter((i) => i.sku !== sku));
  }, []);

  const setQty = useCallback((sku: string, qty: number) => {
    const prev = readCart();
    writeCart(qty <= 0 ? prev.filter((i) => i.sku !== sku) : prev.map((i) => (i.sku === sku ? { ...i, qty } : i)));
  }, []);

  const toggleSubscribe = useCallback((sku: string) => {
    writeCart(readCart().map((i) => (i.sku === sku ? { ...i, subscribe: !i.subscribe } : i)));
  }, []);

  const clear = useCallback(() => writeCart([]), []);

  const value = useMemo(() => {
    const count = items.reduce((n, i) => n + i.qty, 0);
    const raw = items.reduce((n, i) => n + i.price * i.qty, 0);
    const subscribeSavings = items.reduce(
      (n, i) => n + (i.subscribe ? i.price * i.qty * SITE.subscribeDiscount : 0),
      0,
    );
    return {
      items,
      add,
      remove,
      setQty,
      toggleSubscribe,
      clear,
      count,
      subtotal: raw - subscribeSavings,
      subscribeSavings,
    };
  }, [items, add, remove, setQty, toggleSubscribe, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
