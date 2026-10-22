import { NextRequest } from "next/server";
import { requireUser } from "@/server/auth";
import { getDb } from "@/server/db";
import { HttpError, json, route } from "@/server/http";

export const DELETE = route(async (req: NextRequest, ctx) => {
  const user = requireUser(req);
  const { id } = await ctx.params;
  const result = getDb().prepare("UPDATE sessions SET revoked = 1 WHERE id = ? AND user_id = ?").run(id, user.id);
  if (result.changes === 0) throw new HttpError(404, "That session was not found.");
  return json({ ok: true });
});
