"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import type { PublicUser } from "@/lib/types";
import { api } from "./api";

type SessionValue = {
  user: PublicUser | null;
  ready: boolean;
  refresh: () => Promise<PublicUser | null>;
  setUser: (user: PublicUser | null) => void;
};

const SessionContext = createContext<SessionValue | null>(null);

export function Providers({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [ready, setReady] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ user: PublicUser }>("/api/me");
      setUser(data.user);
      setReady(true);
      return data.user;
    } catch {
      setUser(null);
      setReady(true);
      return null;
    }
  }, []);

  useEffect(() => {
    let cancel = false;
    api<{ user: PublicUser }>("/api/me")
      .then((data) => {
        if (!cancel) setUser(data.user);
      })
      .catch(() => {
        if (!cancel) setUser(null);
      })
      .finally(() => {
        if (!cancel) setReady(true);
      });
    return () => {
      cancel = true;
    };
  }, []);

  return <SessionContext.Provider value={{ user, ready, refresh, setUser }}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const value = useContext(SessionContext);
  if (!value) throw new Error("Session missing");
  return value;
}

export function RequireUser({
  children,
  needProfile = true,
  admin = false,
}: {
  children: React.ReactNode;
  needProfile?: boolean;
  admin?: boolean;
}) {
  const { user, ready } = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!ready) return;
    if (!user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    else if (admin && user.role !== "admin") router.replace("/radar");
    else if (needProfile && !user.onboarded) router.replace("/onboarding");
  }, [admin, needProfile, pathname, ready, router, user]);

  if (!ready || !user) return <ScreenWait label="Checking your session" />;
  if (admin && user.role !== "admin") return <ScreenWait label="Admin only" />;
  if (needProfile && !user.onboarded) return <ScreenWait label="Setting up your lens" />;
  return <>{children}</>;
}

export function ScreenWait({ label }: { label: string }) {
  return (
    <div className="grid min-h-[50vh] place-items-center text-sm text-muted">
      <p>{label}</p>
    </div>
  );
}
