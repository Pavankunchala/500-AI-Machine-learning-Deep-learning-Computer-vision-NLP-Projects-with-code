import { NextRequest } from "next/server";
import { requireUser } from "@/server/auth";
import { HttpError, json, rateLimit, readJson, route } from "@/server/http";
import { rewriteHook } from "@/server/ideas";
import { hookSchema } from "@/server/schemas";

export const POST = route(async (req: NextRequest, ctx) => {
  const user = requireUser(req);
  rateLimit(`hooks:${user.id}`, 60, 60 * 60 * 1000);
  const { id } = await ctx.params;
  if (!/^[a-z0-9:-]{1,90}$/.test(id)) throw new HttpError(404, "That trend is not in the cache.");
  const body = await readJson(req, hookSchema);
  return json({ hook: rewriteHook(user, id, body.index, body.spice ?? "base", body.variant ?? 1) });
});
