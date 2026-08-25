"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Product, BlogPost, Order } from "@/types";
import { inr } from "@/lib/format";

export default function AdminPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [subs, setSubs] = useState<{ email: string }[]>([]);
  const [tab, setTab] = useState<"products" | "journal" | "orders">("products");

  useEffect(() => {
    fetch("/api/admin/content").then(async (res) => {
      if (res.status === 401) {
        router.replace("/admin/login");
        return;
      }
      const data = await res.json();
      setProducts(data.products);
      setPosts(data.posts);
      setOrders(data.orders);
      setSubs(data.subscribers);
    });
  }, [router]);

  async function save() {
    await fetch("/api/admin/content", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ products, posts }),
    });
    alert("Saved to the mill ledger (data/runtime).");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-serif text-4xl">Mill office</h1>
        <div className="flex gap-2">
          <button type="button" onClick={save} className="rounded-full bg-terracotta px-4 py-2 text-sm text-cream">
            Save content
          </button>
          <button type="button" onClick={logout} className="rounded-full border border-sand px-4 py-2 text-sm">
            Sign out
          </button>
        </div>
      </div>
      <p className="mt-2 text-sm text-muted">{subs.length} newsletter subscribers · {orders.length} orders</p>
      <div className="mt-6 flex gap-3 text-sm">
        {(["products", "journal", "orders"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`rounded-full px-4 py-1.5 capitalize ${tab === t ? "bg-brown text-cream" : "bg-sand"}`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "products" && (
        <div className="mt-6 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead>
              <tr className="border-b border-sand text-muted">
                <th className="py-2">Product</th>
                <th>Tagline</th>
                <th>First pack ₹</th>
                <th>MRP</th>
                <th>Stock</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} className="border-b border-sand/70">
                  <td className="py-3 pr-3">
                    <input
                      value={p.name}
                      onChange={(e) => {
                        const next = [...products];
                        next[i] = { ...p, name: e.target.value };
                        setProducts(next);
                      }}
                      className="w-full rounded-lg border border-sand px-2 py-1"
                    />
                  </td>
                  <td className="pr-3">
                    <input
                      value={p.tagline}
                      onChange={(e) => {
                        const next = [...products];
                        next[i] = { ...p, tagline: e.target.value };
                        setProducts(next);
                      }}
                      className="w-full rounded-lg border border-sand px-2 py-1"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={p.variants[0].price}
                      onChange={(e) => {
                        const next = [...products];
                        const variants = [...p.variants];
                        variants[0] = { ...variants[0], price: Number(e.target.value) };
                        next[i] = { ...p, variants };
                        setProducts(next);
                      }}
                      className="w-24 rounded-lg border border-sand px-2 py-1"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      value={p.variants[0].mrp}
                      onChange={(e) => {
                        const next = [...products];
                        const variants = [...p.variants];
                        variants[0] = { ...variants[0], mrp: Number(e.target.value) };
                        next[i] = { ...p, variants };
                        setProducts(next);
                      }}
                      className="w-24 rounded-lg border border-sand px-2 py-1"
                    />
                  </td>
                  <td>
                    <label className="text-xs">
                      <input
                        type="checkbox"
                        checked={p.variants[0].inStock}
                        onChange={(e) => {
                          const next = [...products];
                          const variants = [...p.variants];
                          variants[0] = { ...variants[0], inStock: e.target.checked };
                          next[i] = { ...p, variants };
                          setProducts(next);
                        }}
                      />{" "}
                      In stock
                    </label>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "journal" && (
        <div className="mt-6 space-y-4">
          {posts.map((post, i) => (
            <div key={post.slug} className="rounded-2xl border border-sand bg-paper p-4">
              <input
                value={post.title}
                onChange={(e) => {
                  const next = [...posts];
                  next[i] = { ...post, title: e.target.value };
                  setPosts(next);
                }}
                className="w-full rounded-lg border border-sand px-3 py-2 font-serif text-xl"
              />
              <textarea
                value={post.excerpt}
                onChange={(e) => {
                  const next = [...posts];
                  next[i] = { ...post, excerpt: e.target.value };
                  setPosts(next);
                }}
                className="mt-2 w-full rounded-lg border border-sand px-3 py-2 text-sm"
              />
            </div>
          ))}
        </div>
      )}

      {tab === "orders" && (
        <ul className="mt-6 space-y-3">
          {orders.length === 0 && <li className="text-muted">No orders yet — place a demo checkout.</li>}
          {orders.map((o) => (
            <li key={o.id} className="rounded-2xl border border-sand bg-paper p-4 text-sm">
              <p className="font-medium">
                {o.id} · {inr(o.total)} · {o.paymentMethod} · {o.status}
              </p>
              <p className="text-muted">
                {o.customer.name}, {o.customer.city} {o.customer.pincode}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
