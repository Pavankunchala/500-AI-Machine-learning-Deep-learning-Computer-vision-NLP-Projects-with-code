import { NextRequest } from "next/server";
import { clearSession, requireUser, revokeAll } from "@/server/auth";
import { audit } from "@/server/db";
import { json, route } from "@/server/http";

export const POST = route(async (req: NextRequest) => {
  const user = requireUser(req);
  revokeAll(user.id);
  audit(user.id, "auth.logout_all");
  const res = json({ ok: true });
  clearSession(res);
  return res;
});
