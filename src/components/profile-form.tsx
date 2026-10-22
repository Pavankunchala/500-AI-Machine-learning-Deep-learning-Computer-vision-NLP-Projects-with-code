"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LANGUAGE_LABEL, NICHE_LABEL, PLATFORM_LABEL } from "@/lib/constants";
import { AUDIENCES, LANGUAGES, NICHES, PLATFORMS, TONES, type Audience, type Language, type Niche, type Platform, type Tone } from "@/lib/types";
import { api } from "./api";
import { useSession } from "./session";

export function ProfileForm({ mode }: { mode: "onboarding" | "edit" }) {
  const { user, refresh } = useSession();
  const router = useRouter();
  const [name, setName] = useState(user?.name || "");
  const [niche, setNiche] = useState<Niche | "">(user?.niche || "");
  const [audience, setAudience] = useState<Audience | "">(user?.audience || "");
  const [tone, setTone] = useState<Tone | "">(user?.tone || "");
  const [language, setLanguage] = useState<Language | "">(user?.language || "");
  const [platforms, setPlatforms] = useState<Platform[]>(user?.platforms || []);
  const [error, setError] = useState("");
  const [secret, setSecret] = useState("");
  const [code, setCode] = useState("");
  const ready = Boolean(niche && audience && tone && language && platforms.length);

  function toggle(platform: Platform) {
    setPlatforms((current) => (current.includes(platform) ? current.filter((item) => item !== platform) : [...current, platform]));
  }

  async function save() {
    if (!niche || !audience || !tone || !language) return;
    setError("");
    try {
      await api("/api/profile", {
        method: "PATCH",
        body: JSON.stringify({ name, niche, audience, tone, language, platforms }),
      });
      await refresh();
      router.push("/radar");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the profile.");
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-5xl">{mode === "onboarding" ? "Set the lens" : "Creator profile"}</h1>
        <p className="mt-3 max-w-xl text-muted">The list ranks trends for this niche, and the idea lab writes in this tone and language.</p>
      </div>
      {mode === "edit" ? (
        <label className="block text-sm">Name
          <input className="mt-2 w-full rounded-2xl border border-white/10 bg-transparent p-3" value={name} onChange={(event) => setName(event.target.value)} />
        </label>
      ) : null}
      <Choice label="Niche" options={NICHES.map((item) => ({ id: item, label: NICHE_LABEL.en[item] }))} value={niche} onChange={(value) => setNiche(value as Niche)} />
      <Choice label="Audience" options={AUDIENCES.map((item) => ({ id: item, label: item }))} value={audience} onChange={(value) => setAudience(value as Audience)} />
      <Choice label="Tone" options={TONES.map((item) => ({ id: item, label: item }))} value={tone} onChange={(value) => setTone(value as Tone)} />
      <Choice label="Language" options={LANGUAGES.map((item) => ({ id: item, label: LANGUAGE_LABEL[item] }))} value={language} onChange={(value) => setLanguage(value as Language)} />
      <fieldset>
        <legend className="text-sm uppercase tracking-widest text-muted">Platforms</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {PLATFORMS.map((platform) => (
            <button key={platform} type="button" onClick={() => toggle(platform)} className={`rounded-full px-4 py-2 text-sm ${platforms.includes(platform) ? "bg-white text-[#07110c]" : "border border-white/10"}`}>
              {PLATFORM_LABEL[platform]}
            </button>
          ))}
        </div>
      </fieldset>
      {error ? <p className="text-rose">{error}</p> : null}
      <button type="button" disabled={!ready} onClick={() => void save()} className="rounded-full bg-mint px-6 py-3 font-semibold text-[#07110c] disabled:opacity-40">
        {mode === "onboarding" ? "Show my list" : "Save profile"}
      </button>
      {mode === "edit" && user ? (
        <section className="panel space-y-3 rounded-[28px] p-6">
          <h2 className="font-display text-2xl">Plan and streak</h2>
          <p>{user.plan} plan · {user.streak} day streak · {user.points} idea points</p>
          <p className="text-sm text-muted">
            Today: {user.usage.views} deep dive{user.usage.views === 1 ? "" : "s"}
            {user.limits.views ? ` of ${user.limits.views}` : ""} · {user.usage.ai} fresh idea pack{user.usage.ai === 1 ? "" : "s"} of {user.limits.ai}.
          </p>
          <p className="text-sm text-muted">{user.badges.includes("trend_hunter") ? "Trend Hunter badge is on your profile." : "Trend Hunter is awarded the first time you save a rising trend."}</p>
          <p className="text-sm text-muted">Free ₹0 · Creator ₹299 · Pro ₹799 · Agency ₹2,499. Payments are not wired in this version. An admin can change a plan.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" className="rounded-full border border-white/15 px-4 py-2 text-sm" onClick={async () => {
              const data = await api<{ secret: string }>("/api/auth/totp", { method: "POST" });
              setSecret(data.secret);
            }}>Set up authenticator</button>
            <button type="button" className="rounded-full border border-white/15 px-4 py-2 text-sm" onClick={async () => { await api("/api/auth/logout-all", { method: "POST" }); await refresh(); router.push("/login"); }}>Log out everywhere</button>
          </div>
          {secret ? (
            <div className="text-sm">
              <p>Secret: <span className="break-all text-mint">{secret}</span></p>
              <p className="mt-1 text-muted">Add it to an authenticator app, then confirm with a code. Recommended for admin accounts.</p>
              <div className="mt-2 flex gap-2">
                <input className="rounded-2xl border border-white/10 bg-transparent px-3" value={code} onChange={(event) => setCode(event.target.value)} placeholder="123456" />
                <button type="button" className="rounded-full bg-white/10 px-4" onClick={async () => { await api("/api/auth/totp?action=verify", { method: "POST", body: JSON.stringify({ code }) }); setSecret(""); await refresh(); }}>Confirm</button>
              </div>
            </div>
          ) : null}
          <Sessions />
        </section>
      ) : null}
    </div>
  );
}

function Choice({ label, options, value, onChange }: { label: string; options: { id: string; label: string }[]; value: string; onChange: (value: string) => void }) {
  return (
    <fieldset>
      <legend className="text-sm uppercase tracking-widest text-muted">{label}</legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((option) => (
          <button key={option.id} type="button" onClick={() => onChange(option.id)} className={`rounded-full px-4 py-2 text-sm capitalize ${value === option.id ? "bg-white text-[#07110c]" : "border border-white/10"}`}>
            {option.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Sessions() {
  const [rows, setRows] = useState<{ id: string; userAgent: string; createdAt: string; current: boolean }[]>([]);
  useEffect(() => {
    void api<{ sessions: typeof rows }>("/api/sessions").then((data) => setRows(data.sessions));
  }, []);
  return (
    <div>
      <h3 className="text-sm uppercase tracking-widest text-muted">Sessions</h3>
      <ul className="mt-2 space-y-2 text-sm">
        {rows.map((row) => (
          <li key={row.id} className="flex items-center justify-between gap-3">
            <span>{row.current ? "This device" : row.userAgent}</span>
            {!row.current ? (
              <button type="button" className="text-rose" onClick={async () => {
                await api(`/api/sessions/${row.id}`, { method: "DELETE" });
                setRows((current) => current.filter((item) => item.id !== row.id));
              }}>Revoke</button>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
