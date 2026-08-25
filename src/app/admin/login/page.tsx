"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setErr("That password is not the mill key.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="mx-auto max-w-sm px-4 py-24">
      <h1 className="font-serif text-4xl">Mill office</h1>
      <p className="mt-2 text-sm text-muted">Staff only. Default password is in .env.example.</p>
      <form onSubmit={submit} className="mt-6 space-y-3">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="h-11 w-full rounded-xl border border-sand px-3"
        />
        <button className="h-11 w-full rounded-full bg-brown text-cream">Enter</button>
        {err && <p className="text-sm text-terracotta">{err}</p>}
      </form>
    </div>
  );
}
