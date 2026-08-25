import { cookies } from "next/headers";

const COOKIE = "bc_admin";

export function adminSecret() {
  return process.env.ADMIN_PASSWORD || "chakki-admin";
}

export async function isAdmin() {
  const jar = await cookies();
  return jar.get(COOKIE)?.value === "ok";
}

export function adminCookieHeader() {
  return `${COOKIE}=ok; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;
}

export function clearAdminCookie() {
  return `${COOKIE}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}
