import { NextRequest } from "next/server";
import { requireUser } from "@/server/auth";
import { HttpError, json, readJson, route } from "@/server/http";
import { deleteIdea, updateIdea } from "@/server/ideas";
import { ideaPatchSchema } from "@/server/schemas";

export const PATCH = route(async (req: NextRequest, ctx) => {
  const user = requireUser(req);
  const { id } = await ctx.params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) throw new HttpError(404, "That idea is not on your board.");
  const body = await readJson(req, ideaPatchSchema);
  return json(updateIdea(user.id, id, body));
});

export const DELETE = route(async (req: NextRequest, ctx) => {
  const user = requireUser(req);
  const { id } = await ctx.params;
  deleteIdea(user.id, id);
  return json({ ok: true });
});
