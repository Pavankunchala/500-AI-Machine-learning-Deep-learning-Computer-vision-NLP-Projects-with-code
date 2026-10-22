import { NextRequest } from "next/server";
import { z } from "zod";
import { setAlertActive } from "@/server/alerts";
import { requireUser } from "@/server/auth";
import { HttpError, json, readJson, route } from "@/server/http";

export const PATCH = route(async (req: NextRequest, ctx) => {
  const user = requireUser(req);
  const { id } = await ctx.params;
  const body = await readJson(req, z.object({ active: z.boolean() }));
  const ok = setAlertActive(user.id, id, body.active);
  if (!ok) throw new HttpError(404, "That alert was not found.");
  return json({ ok: true });
});
