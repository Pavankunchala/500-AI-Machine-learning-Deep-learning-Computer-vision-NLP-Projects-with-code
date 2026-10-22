import { NextRequest } from "next/server";
import { ACCESS_COOKIE, clearSession, revokeAccess } from "@/server/auth";
import { json, route } from "@/server/http";

export const POST = route(async (req: NextRequest) => {
  revokeAccess(req.cookies.get(ACCESS_COOKIE)?.value);
  const res = json({ ok: true });
  clearSession(res);
  return res;
});
