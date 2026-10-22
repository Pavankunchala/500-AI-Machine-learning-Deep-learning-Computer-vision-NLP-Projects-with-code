import { NextRequest } from "next/server";
import { ACCESS_COOKIE, listSessions, requireUser } from "@/server/auth";
import { json, route } from "@/server/http";

export const GET = route(async (req: NextRequest) => {
  const user = requireUser(req);
  return json({ sessions: listSessions(user.id, req.cookies.get(ACCESS_COOKIE)?.value) });
});
