import { NextRequest } from "next/server";
import { attachSession, clearSession, REFRESH_COOKIE, rotateRefresh } from "@/server/auth";
import { json, route } from "@/server/http";

export const POST = route(async (req: NextRequest) => {
  const tokens = rotateRefresh(req.cookies.get(REFRESH_COOKIE)?.value, req.headers.get("user-agent"));
  if (!tokens) {
    const res = json({ error: "Sign in to continue.", code: "AUTH" }, 401);
    clearSession(res);
    return res;
  }
  const res = json({ ok: true });
  attachSession(res, tokens);
  return res;
});
