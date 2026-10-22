"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "./api";
import { useSession } from "./session";

type Hint = { enabled: boolean; creator?: { email: string; password: string }; admin?: { email: string; password: string } };

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useSession();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totp, setTotp] = useState("");
  const [website, setWebsite] = useState("");
  const [needTotp, setNeedTotp] = useState(false);
  const [error, setError] = useState("");
  const [hint, setHint] = useState<Hint | null>(null);

  useEffect(() => {
    if (mode !== "login") return;
    void api<Hint>("/api/auth/demo-hint").then(setHint).catch(() => setHint(null));
  }, [mode]);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    try {
      const path = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const body = mode === "login" ? { email, password, totp: totp || undefined } : { name, email, password, company_website: website };
      const data = await api<{ user: { onboarded: boolean; role: string } }>(path, { method: "POST", body: JSON.stringify(body) });
      await refresh();
      const next = params.get("next");
      if (data.user.role === "admin" && next?.startsWith("/admin")) router.push("/admin");
      else if (!data.user.onboarded) router.push("/onboarding");
      else router.push(next && next.startsWith("/") ? next : "/radar");
    } catch (err) {
      const coded = err as { code?: string; message?: string };
      if (coded.code === "TOTP_REQUIRED") {
        setNeedTotp(true);
        setError(coded.message || "Enter the authenticator code.");
        return;
      }
      setError(err instanceof Error ? err.message : "Could not continue.");
    }
  }

  function fill(account: { email: string; password: string }) {
    setEmail(account.email);
    setPassword(account.password);
  }

  return (
    <div className="mx-auto grid min-h-screen max-w-5xl items-center gap-10 px-4 py-12 md:grid-cols-2">
      <div>
        <Link href="/" className="font-display text-lg">TrendPulse</Link>
        <h1 className="font-display mt-6 text-5xl leading-none">{mode === "login" ? "Welcome back" : "Create your workspace"}</h1>
        <p className="mt-4 text-muted">Passwords are hashed with Argon2id. The trend list is served from cache.</p>
      </div>
      <form onSubmit={submit} className="panel space-y-4 rounded-[28px] p-6">
        {mode === "signup" ? (
          <label className="block text-sm">Name
            <input required className="mt-2 w-full rounded-2xl border border-white/10 bg-transparent p-3" value={name} onChange={(event) => setName(event.target.value)} />
          </label>
        ) : null}
        <label className="block text-sm">Email
          <input required type="email" className="mt-2 w-full rounded-2xl border border-white/10 bg-transparent p-3" value={email} onChange={(event) => setEmail(event.target.value)} />
        </label>
        <label className="block text-sm">Password
          <input required type="password" minLength={mode === "signup" ? 10 : 1} className="mt-2 w-full rounded-2xl border border-white/10 bg-transparent p-3" value={password} onChange={(event) => setPassword(event.target.value)} />
        </label>
        {needTotp ? (
          <label className="block text-sm">Authenticator code
            <input className="mt-2 w-full rounded-2xl border border-white/10 bg-transparent p-3" value={totp} onChange={(event) => setTotp(event.target.value)} inputMode="numeric" />
          </label>
        ) : null}
        <div className="sr-only" aria-hidden="true">
          <label>Company website
            <input tabIndex={-1} autoComplete="off" value={website} onChange={(event) => setWebsite(event.target.value)} />
          </label>
        </div>
        {error ? <p className="text-sm text-rose">{error}</p> : null}
        <button type="submit" className="w-full rounded-full bg-mint py-3 font-semibold text-[#07110c]">{mode === "login" ? "Sign in" : "Create account"}</button>
        <p className="text-sm text-muted">
          {mode === "login" ? <Link href="/signup">Need an account?</Link> : <Link href="/login">Already have one?</Link>}
        </p>
        {hint?.enabled && hint.creator && hint.admin ? (
          <div className="rounded-2xl bg-white/5 p-3 text-sm text-muted">
            <p>Development workspace</p>
            <button type="button" className="mt-2 text-mint" onClick={() => fill(hint.creator!)}>Use demo creator</button>
            <button type="button" className="mt-2 block text-mint" onClick={() => fill(hint.admin!)}>Use admin</button>
          </div>
        ) : null}
      </form>
    </div>
  );
}
