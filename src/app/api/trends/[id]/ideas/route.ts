import { NextRequest } from "next/server";
import { requireUser } from "@/server/auth";
import { usageFor } from "@/server/db";
import { HttpError, json, rateLimit, readJson, route } from "@/server/http";
import { getOrCreatePack } from "@/server/ideas";
import { spiceSchema } from "@/server/schemas";

export const POST = route(async (req: NextRequest, ctx) => {
  const user = requireUser(req);
  rateLimit(`ideas:${user.id}`, 20, 60 * 60 * 1000);
  const { id } = await ctx.params;
  if (!/^[a-z0-9:-]{1,90}$/.test(id)) throw new HttpError(404, "That trend is not in the cache.");
  const body = await readJson(req, spiceSchema);
  const result = await getOrCreatePack(user, id, body.spice ?? "base");
  return json({ ...result, usage: usageFor(user.id) });
});
